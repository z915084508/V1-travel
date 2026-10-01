-- Run once with a database owner, in the application's existing PostgreSQL database.
-- This auth schema is independent of the planned business tables in database-schema.sql.
BEGIN;
CREATE SCHEMA IF NOT EXISTS v1_auth;
CREATE TABLE IF NOT EXISTS v1_auth.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email=lower(trim(email))),
  full_name text NOT NULL,
  phone text,
  locale text NOT NULL DEFAULT 'zh' CHECK (locale IN ('zh','es','en')),
  kind text NOT NULL CHECK (kind IN ('customer','staff')),
  role text CHECK (role IN ('admin','manager','advisor','operations','viewer')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','invited','disabled')),
  password_hash text,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_sign_in_at timestamptz,
  CHECK ((kind='customer' AND role IS NULL) OR (kind='staff' AND role IS NOT NULL)),
  CHECK (status IN ('invited','disabled') OR password_hash IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS v1_auth.sessions (
  token_hash text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES v1_auth.accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_account_idx ON v1_auth.sessions(account_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON v1_auth.sessions(expires_at);
CREATE TABLE IF NOT EXISTS v1_auth.invitations (
  token_hash text PRIMARY KEY,
  account_id uuid NOT NULL UNIQUE REFERENCES v1_auth.accounts(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES v1_auth.accounts(id),
  expires_at timestamptz NOT NULL DEFAULT now()+interval '48 hours',
  accepted_at timestamptz
);
CREATE TABLE IF NOT EXISTS v1_auth.rate_limits (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket,window_start)
);
-- No access for PUBLIC. Grant only to the dedicated server-side application database role.
REVOKE ALL ON SCHEMA v1_auth FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA v1_auth FROM PUBLIC;
COMMIT;
