import "server-only";
import { Pool, type PoolClient } from "pg";

const globalDb = globalThis as unknown as { v1Pool?: Pool };
export function databaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
export function database(): Pool {
  if (!databaseConfigured()) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!globalDb.v1Pool) {
    globalDb.v1Pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      statement_timeout: 10000,
      ssl: process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: true, ...(process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA.replace(/\\n/g, "\n") } : {}) }
        : undefined,
    });
    globalDb.v1Pool.on("error", () => console.error("Database pool connection failed."));
  }
  return globalDb.v1Pool;
}
export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
