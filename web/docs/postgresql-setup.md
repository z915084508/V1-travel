# V1 PostgreSQL account setup

This implementation uses your own PostgreSQL 13+ server. Supabase is not required.
All credentials, database queries and password verification remain in server-side code.

## Connect the existing database

1. Create a dedicated database and application login on the PostgreSQL server.
2. Run `docs/auth-migration.sql` in that database as its owner, or set a local
   owner connection and run `npm run auth:migrate`. This creates only the
   `v1_auth` schema; it does not replace existing travel tables.
3. Grant the application login access to that schema and its tables:

   ```sql
   -- Replace v1_app with the application database login.
   GRANT USAGE ON SCHEMA v1_auth TO v1_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA v1_auth TO v1_app;
   ```

4. Copy `.env.example` to `.env.local`, and fill in `DATABASE_URL`.
   Use a URL-encoded password if it contains special characters.
   For a remote database, use verified TLS: set `DATABASE_SSL=true` and, if
   necessary, `DATABASE_SSL_CA` to your server's CA certificate. Avoid adding
   SSL query parameters to the URL that override the driver's TLS options.
   The database must accept connections from the Vercel deployment. Use a
   pooler or an appropriate network access policy for your server.
5. Add the same server-only variables in Vercel Project → Settings →
   Environment Variables, then redeploy. The old `STAFF_BASIC_AUTH_*`
   settings are no longer used.

Do not commit connection passwords, use a browser-visible NEXT_PUBLIC_ variable,
or use the PostgreSQL superuser as the application's database login.

## Create the first administrator

Use Node.js 22+ and run from the web folder:

```sh
npm run auth:bootstrap -- --email owner@example.com --name "V1 Owner"
```

The terminal prompts for a hidden password. For a non-interactive terminal,
temporarily set `V1_ADMIN_PASSWORD` in the process environment, then remove it.
The bootstrap refuses to run if an active administrator already exists.
Existing customer accounts cannot be silently promoted by this script.

Sign in at `/staff/login`, then open `/admin/staff`.
Create an invitation and privately share its link with the employee.
Invitations expire after 48 hours and can be accepted once. Re-generating a
pending invitation for the same email invalidates the previous link.
No invitation email is sent automatically.

## Behavior

- Customer signup creates an active customer only. Email verification and
  password recovery will need a mail service in a later step.
- Staff and customer logins use separate entry points.
- Session cookies are HttpOnly, SameSite=Lax and Secure in production.
  Random session tokens are stored only as SHA-256 hashes in PostgreSQL.
- Passwords use salted scrypt hashes. Account status and role are checked
  against the database on every protected page and staff mutation.
- Disabling an account or changing a role revokes its existing sessions.
- Only active administrators can manage staff. Staff mutations are serialized
  to preserve at least one active administrator; administrators cannot
  remove their own access.
- Login, signup and invitation acceptance have database-backed attempt limits.
- The staff dashboard still contains explicitly marked operational examples.
  Staff account management uses real database records.
- Missing configuration locks protected pages. Database failures do not grant
  access. The homepage remains public and sends no Basic Auth challenge.

## Maintenance

Periodically remove expired sessions and old rate-limit buckets:

```sql
DELETE FROM v1_auth.sessions WHERE expires_at < now();
DELETE FROM v1_auth.rate_limits WHERE window_start < now() - interval '1 day';
```

Run `npm test`, `npm run lint` and `npm run build` before deployment.
Tests use a separate in-memory PostgreSQL engine and never touch your server.
