import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt);
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  // Derive a key even for unknown accounts, avoiding the fast unknown-email path.
  const [algorithm, salt, expected] = (stored ?? "scrypt:00000000000000000000000000000000:" + "0".repeat(128)).split(":");
  if (algorithm !== "scrypt" || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(expected)) return false;
  const key = await deriveKey(password, salt, 64) as Buffer;
  return timingSafeEqual(key, Buffer.from(expected, "hex")) && stored !== null;
}
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}
export function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
export function validToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}
