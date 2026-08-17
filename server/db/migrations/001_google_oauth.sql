-- Adds Google sign-in support to the existing userlogin table.
--
-- Run once against the PostgreSQL database pointed at by DATABASE_URL:
--   psql "$DATABASE_URL" -f server/db/migrations/001_google_oauth.sql
--
-- Every statement is idempotent, so re-running it is harmless.

-- Google's stable subject id. NULL for accounts that only use a password.
ALTER TABLE userlogin ADD COLUMN IF NOT EXISTS google_id TEXT;

-- Profile picture from the Google account, if any.
ALTER TABLE userlogin ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- When the Google identity was attached to this row. Also doubles as a record
-- that an existing password account was merged rather than newly created.
ALTER TABLE userlogin ADD COLUMN IF NOT EXISTS google_linked_at TIMESTAMPTZ;

-- Users who sign up through Google never set a password, so the column has to
-- allow NULL. Existing rows are unaffected.
ALTER TABLE userlogin ALTER COLUMN password DROP NOT NULL;

-- One Google account may only be attached to a single user.
CREATE UNIQUE INDEX IF NOT EXISTS userlogin_google_id_key
  ON userlogin (google_id)
  WHERE google_id IS NOT NULL;

-- Account merging looks users up by email, so that lookup must be
-- case-insensitive and fast. This also prevents "Ada@x.com" and "ada@x.com"
-- from ever becoming two separate accounts.
CREATE UNIQUE INDEX IF NOT EXISTS userlogin_email_lower_key
  ON userlogin (LOWER(email));
