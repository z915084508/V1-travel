import { readFile } from "node:fs/promises";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before running the migration.");
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true, ...(process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA.replace(/\\n/g, "\n") } : {}) } : undefined,
  connectionTimeoutMillis: 5000,
});
try {
  const sql = await readFile(new URL("../docs/auth-migration.sql", import.meta.url), "utf8");
  await pool.query(sql);
  console.log("V1 authentication schema is ready.");
} catch (error) {
  console.error("Migration failed:", error.code ?? "DATABASE_ERROR");
  process.exitCode = 1;
} finally {
  await pool.end();
}
