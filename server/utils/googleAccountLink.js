import crypto from 'crypto';

/**
 * Resolves a Google profile to a local user id, given an open pg client.
 *
 * Kept free of any database *connection* so it can be exercised directly in
 * tests with a stub client — the branching here decides whether someone keeps
 * access to their existing capsules, so it is worth testing on its own.
 *
 * Order matters:
 *  1. Already-linked Google account -> straight sign-in.
 *  2. Existing account with the same email -> attach the Google id to it. This
 *     is the merge case: someone who registered with an email and password can
 *     later use "Continue with Google" and land in the same account with all
 *     their capsules intact, instead of silently getting a second one.
 *  3. Nobody matches -> create a passwordless account.
 *
 * The caller wraps this in a transaction so two simultaneous callbacks cannot
 * create duplicate rows for the same person.
 *
 * @param {{query: Function}} client - an open pg client inside a transaction
 * @param {{googleId: string, email: string, displayName: string, avatarUrl: ?string}} profile
 * @returns {Promise<{id: any, outcome: 'signed-in'|'merged'|'created'}>}
 */
export const resolveGoogleUser = async (client, { googleId, email, displayName, avatarUrl }) => {
  const normalisedEmail = String(email || '').toLowerCase().trim();

  if (!googleId || !normalisedEmail) {
    throw new Error('Google profile is missing an id or email');
  }

  // 1. Already linked.
  const linked = await client.query('SELECT id FROM userlogin WHERE google_id = $1', [googleId]);

  if (linked.rows.length > 0) {
    const { id } = linked.rows[0];
    await client.query('UPDATE userlogin SET avatar_url = COALESCE($1, avatar_url) WHERE id = $2', [
      avatarUrl ?? null,
      id,
    ]);
    return { id, outcome: 'signed-in' };
  }

  // 2. Same email registered with a password: merge by linking. Nothing the
  //    user already set is overwritten — only the missing Google fields fill in.
  const existing = await client.query(
    'SELECT id, google_id FROM userlogin WHERE LOWER(email) = $1 FOR UPDATE',
    [normalisedEmail]
  );

  if (existing.rows.length > 0) {
    const row = existing.rows[0];

    // A different Google account already owns this email row.
    if (row.google_id && row.google_id !== googleId) {
      throw new Error('This email is already linked to a different Google account');
    }

    await client.query(
      `UPDATE userlogin
          SET google_id = $1,
              avatar_url = COALESCE(avatar_url, $2),
              google_linked_at = NOW()
        WHERE id = $3`,
      [googleId, avatarUrl ?? null, row.id]
    );

    return { id: row.id, outcome: 'merged' };
  }

  // 3. Brand new user. No password is set; they sign in through Google.
  const username = await generateUsername(client, normalisedEmail, displayName);

  const inserted = await client.query(
    `INSERT INTO userlogin (name, username, email, password, google_id, avatar_url, google_linked_at)
     VALUES ($1, $2, $3, NULL, $4, $5, NOW())
     RETURNING id`,
    [displayName || normalisedEmail.split('@')[0], username, normalisedEmail, googleId, avatarUrl ?? null]
  );

  return { id: inserted.rows[0].id, outcome: 'created' };
};

/**
 * Builds a unique username from the Google profile.
 * "ada.lovelace@gmail.com" -> "ada.lovelace", then "ada.lovelace1" and so on.
 */
export const generateUsername = async (client, email, name) => {
  const base =
    (email ? email.split('@')[0] : '').toLowerCase().replace(/[^a-z0-9._-]/g, '') ||
    (name || 'user').toLowerCase().replace(/[^a-z0-9._-]/g, '') ||
    'user';

  for (let suffix = 0; suffix < 100; suffix += 1) {
    const candidate = suffix === 0 ? base : `${base}${suffix}`;
    const { rows } = await client.query('SELECT id FROM userlogin WHERE username = $1', [candidate]);
    if (rows.length === 0) return candidate;
  }

  // Fall back to something that cannot realistically collide.
  return `${base}${crypto.randomBytes(4).toString('hex')}`;
};
