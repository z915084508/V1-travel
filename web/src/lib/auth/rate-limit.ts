import "server-only";
import { headers } from "next/headers";
import { database } from "../db";
import { tokenHash } from "./crypto";

export async function checkRateLimit(scope: string, identity: string): Promise<boolean> {
  const requestHeaders = await headers();
  // Only use the hosting platform's trusted client-IP header; never trust arbitrary X-Forwarded-For.
  const ip = process.env.VERCEL === "1" ? requestHeaders.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : null;
  const buckets = [{ key: tokenHash(`${scope}:identity:${identity}`), max: 10 }];
  if (ip) buckets.push({ key: tokenHash(`${scope}:ip:${ip}`), max: 60 });
  const windowStart = new Date(Math.floor(Date.now() / 900000) * 900000);
  for (const bucket of buckets) {
    const { rows } = await database().query<{ attempts: number }>(
      `INSERT INTO v1_auth.rate_limits(bucket, window_start, attempts) VALUES($1,$2,1)
       ON CONFLICT(bucket,window_start) DO UPDATE SET attempts=v1_auth.rate_limits.attempts+1 RETURNING attempts`,
      [bucket.key, windowStart]);
    if (rows[0].attempts > bucket.max) return false;
  }
  return true;
}
