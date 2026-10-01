import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { database, databaseConfigured } from "../db";
import { canAccessStaff, canManageStaff, type Account } from "./policy";
import { newToken, tokenHash, validToken } from "./crypto";
import { sessionAccount } from "./repository";

export const sessionCookie = "v1_session";
const lifetime = 60 * 60 * 24 * 7;
export async function currentAccount(): Promise<Account | null> {
  if (!databaseConfigured()) return null;
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !validToken(token)) return null;
  return sessionAccount(database(), tokenHash(token));
}
export async function createSession(accountId: string) {
  const token = newToken();
  await database().query(
    "INSERT INTO v1_auth.sessions(token_hash, account_id, expires_at) VALUES($1,$2,now()+interval '7 days')",
    [tokenHash(token), accountId]);
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: lifetime,
  });
}
export async function deleteSession() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  jar.delete(sessionCookie);
  if (token && validToken(token) && databaseConfigured()) {
    await database().query("DELETE FROM v1_auth.sessions WHERE token_hash=$1", [tokenHash(token)]);
  }
}
export async function requireStaff(adminOnly = false, locale = "zh"): Promise<Account> {
  const account = await currentAccount();
  if (!account) redirect(`/staff/login?lang=${locale}`);
  if (!canAccessStaff(account) || (adminOnly && !canManageStaff(account))) redirect(`/access-denied?lang=${locale}`);
  return account;
}
