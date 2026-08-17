/**
 * Applies the SQL files in db/migrations in order.
 *
 * Uses the `pg` driver rather than shelling out to `psql`, so it runs anywhere
 * Node runs — locally without the Postgres client tools installed, from a
 * Render shell, or as a one-off job.
 *
 *   node server/db/migrate.js
 *   npm run migrate          (from server/)
 *
 * Every migration is written to be idempotent, so re-running is safe.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import 'dotenv/config';

const { Client } = pkg;

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

const run = async () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL is not set. Add it to server/.env or export it first.');
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migrations to run.');
    return;
  }

  // Hosted Postgres (Vercel, Neon, Render, Supabase) requires TLS, and their
  // certificates are not in Node's default trust store.
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected.\n');

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      process.stdout.write(`  ${file} ... `);
      // Each file is one transaction: either it all lands or none of it does.
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('ok');
    }

    console.log('\nAll migrations applied.');

    // Show the result so it is obvious the columns actually exist now.
    const { rows } = await client.query(
      `SELECT column_name, is_nullable
         FROM information_schema.columns
        WHERE table_name = 'userlogin'
          AND column_name IN ('google_id', 'avatar_url', 'google_linked_at', 'password')
        ORDER BY column_name`
    );
    console.table(rows);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\nMigration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

run();
