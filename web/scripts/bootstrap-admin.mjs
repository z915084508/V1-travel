import readline from "node:readline";
import pg from "pg";
import { hashPassword } from "../src/lib/auth/crypto.ts";
import { normalizeEmail, validEmail, validPassword } from "../src/lib/auth/policy.ts";

const args = process.argv.slice(2);
const option = name => args[args.indexOf(name) + 1];
const email = normalizeEmail(args.includes("--email") ? option("--email") ?? "" : "");
const fullName = args.includes("--name") ? option("--name") ?? "" : "V1 Admin";
if (!process.env.DATABASE_URL || !validEmail(email) || fullName.length < 2 || fullName.length > 100) {
  console.error('Usage: npm run auth:bootstrap -- --email you@example.com --name "Your name"');
  process.exit(1);
}
async function passwordPrompt() {
  if (!process.stdin.isTTY) throw new Error("Use an interactive terminal or V1_ADMIN_PASSWORD environment variable.");
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdout.write("Admin password (10–128 characters, hidden): ");
  return new Promise((resolve, reject) => {
    let password = "";
    const handler = (text, key) => {
      if (key?.name === "return" || (key?.ctrl && key.name === "c")) {
        process.stdin.off("keypress", handler);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write("\n");
        if (key.ctrl) reject(new Error("Cancelled"));
        else resolve(password);
      } else if (key?.name === "backspace") password = password.slice(0, -1);
      else if (text && !key?.ctrl && password.length < 128) password += text;
    };
    process.stdin.on("keypress", handler);
    process.stdin.resume();
  });
}
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true, ...(process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA.replace(/\\n/g, "\n") } : {}) } : undefined,
  connectionTimeoutMillis: 5000,
});
let client;
try {
  const password = process.env.V1_ADMIN_PASSWORD ?? await passwordPrompt();
  if (!validPassword(password)) throw new Error("Password must be 10–128 characters.");
  const hash = await hashPassword(password);
  client = await pool.connect();
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(731041)");
  const existing = await client.query("SELECT id FROM v1_auth.accounts WHERE kind='staff' AND role='admin' AND status='active'");
  if (existing.rowCount) throw new Error("An active admin already exists. Use the admin portal to invite additional admins.");
  await client.query("INSERT INTO v1_auth.accounts(email,full_name,kind,role,status,password_hash) VALUES($1,$2,'staff','admin','active',$3)", [email, fullName, hash]);
  await client.query("COMMIT");
  console.log("First admin created. Sign in at /staff/login.");
} catch (error) {
  if (client) await client.query("ROLLBACK");
  console.error(error.code ? "Admin creation failed: " + error.code : error.message);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
