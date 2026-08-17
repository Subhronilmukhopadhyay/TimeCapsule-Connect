/**
 * Tests for the Google account link/merge decision.
 *
 * Run with:  node --test server/utils/googleAccountLink.test.js
 *
 * These use an in-memory stand-in for a pg client rather than a live database,
 * so they run anywhere. The stub understands only the handful of statements
 * this module issues.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveGoogleUser } from './googleAccountLink.js';

/** Minimal fake pg client backed by an array of rows. */
const makeClient = (rows = []) => {
  let nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const statements = [];

  return {
    rows,
    statements,
    async query(sql, params = []) {
      statements.push(sql.replace(/\s+/g, ' ').trim());

      if (sql.includes('WHERE google_id = $1')) {
        return { rows: rows.filter((r) => r.google_id === params[0]).map((r) => ({ id: r.id })) };
      }

      if (sql.includes('WHERE LOWER(email) = $1')) {
        return {
          rows: rows
            .filter((r) => r.email.toLowerCase() === params[0])
            .map((r) => ({ id: r.id, google_id: r.google_id ?? null })),
        };
      }

      if (sql.includes('WHERE username = $1')) {
        return { rows: rows.filter((r) => r.username === params[0]).map((r) => ({ id: r.id })) };
      }

      if (sql.startsWith('UPDATE userlogin SET avatar_url')) {
        const row = rows.find((r) => r.id === params[1]);
        if (row && params[0]) row.avatar_url = row.avatar_url ?? params[0];
        return { rows: [] };
      }

      if (sql.includes('SET google_id = $1')) {
        const row = rows.find((r) => r.id === params[2]);
        if (row) {
          row.google_id = params[0];
          row.avatar_url = row.avatar_url ?? params[1];
          row.google_linked_at = 'now';
        }
        return { rows: [] };
      }

      if (sql.startsWith('INSERT INTO userlogin')) {
        const [name, username, email, google_id, avatar_url] = params;
        const row = {
          id: nextId++,
          name,
          username,
          email,
          password: null,
          google_id,
          avatar_url,
          google_linked_at: 'now',
        };
        rows.push(row);
        return { rows: [{ id: row.id }] };
      }

      throw new Error(`Unexpected SQL in stub: ${sql}`);
    },
  };
};

const PROFILE = {
  googleId: 'google-sub-123',
  email: 'ada@example.com',
  displayName: 'Ada Lovelace',
  avatarUrl: 'https://example.com/ada.jpg',
};

test('creates a new passwordless account when nobody matches', async () => {
  const client = makeClient([]);

  const result = await resolveGoogleUser(client, PROFILE);

  assert.equal(result.outcome, 'created');
  const created = client.rows.find((r) => r.id === result.id);
  assert.equal(created.email, 'ada@example.com');
  assert.equal(created.google_id, 'google-sub-123');
  assert.equal(created.password, null, 'Google-only accounts must not get a password');
  assert.equal(created.username, 'ada');
});

test('MERGE: an existing password account with the same email keeps its id', async () => {
  const existing = {
    id: 42,
    name: 'Ada',
    username: 'ada',
    email: 'ada@example.com',
    password: '$2b$10$existinghash',
    google_id: null,
    avatar_url: null,
  };
  const client = makeClient([existing]);

  const result = await resolveGoogleUser(client, PROFILE);

  assert.equal(result.outcome, 'merged');
  assert.equal(result.id, 42, 'must reuse the existing account, not create a second one');
  assert.equal(client.rows.length, 1, 'no duplicate row may be created');
  assert.equal(existing.google_id, 'google-sub-123', 'Google id is now attached');
  assert.equal(existing.password, '$2b$10$existinghash', 'existing password must survive the merge');
  assert.equal(existing.username, 'ada', 'existing username must not be overwritten');
});

test('MERGE is case-insensitive on email', async () => {
  const existing = {
    id: 7,
    username: 'ada',
    email: 'Ada@Example.COM',
    password: 'hash',
    google_id: null,
    avatar_url: null,
  };
  const client = makeClient([existing]);

  const result = await resolveGoogleUser(client, { ...PROFILE, email: 'ada@example.com' });

  assert.equal(result.outcome, 'merged');
  assert.equal(result.id, 7);
  assert.equal(client.rows.length, 1);
});

test('a already-linked account signs straight in', async () => {
  const existing = {
    id: 9,
    username: 'ada',
    email: 'ada@example.com',
    password: null,
    google_id: 'google-sub-123',
    avatar_url: 'https://example.com/old.jpg',
  };
  const client = makeClient([existing]);

  const result = await resolveGoogleUser(client, PROFILE);

  assert.equal(result.outcome, 'signed-in');
  assert.equal(result.id, 9);
  assert.equal(client.rows.length, 1);
  assert.equal(existing.avatar_url, 'https://example.com/old.jpg', 'existing avatar is kept');
});

test('signing in twice is idempotent', async () => {
  const client = makeClient([]);

  const first = await resolveGoogleUser(client, PROFILE);
  const second = await resolveGoogleUser(client, PROFILE);

  assert.equal(first.id, second.id);
  assert.equal(second.outcome, 'signed-in');
  assert.equal(client.rows.length, 1, 'the second sign-in must not create another account');
});

test('refuses to steal an email already linked to a different Google account', async () => {
  const client = makeClient([
    {
      id: 3,
      username: 'ada',
      email: 'ada@example.com',
      password: null,
      google_id: 'some-other-google-sub',
      avatar_url: null,
    },
  ]);

  await assert.rejects(
    () => resolveGoogleUser(client, PROFILE),
    /already linked to a different Google account/
  );
});

test('username collisions get a numeric suffix', async () => {
  const client = makeClient([
    { id: 1, username: 'ada', email: 'someone.else@other.com', password: 'hash', google_id: null },
  ]);

  const result = await resolveGoogleUser(client, PROFILE);

  assert.equal(result.outcome, 'created');
  assert.equal(client.rows.find((r) => r.id === result.id).username, 'ada1');
});

test('rejects a profile with no email', async () => {
  const client = makeClient([]);
  await assert.rejects(
    () => resolveGoogleUser(client, { ...PROFILE, email: '' }),
    /missing an id or email/
  );
});
