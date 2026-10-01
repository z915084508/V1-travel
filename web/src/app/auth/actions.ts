"use server";
import { redirect } from "next/navigation";
import { database, databaseConfigured, transaction } from "../../lib/db";
import { createSession, deleteSession } from "../../lib/auth/session";
import { hashPassword, verifyPassword, tokenHash, validToken } from "../../lib/auth/crypto";
import { normalizeEmail, validEmail, validPassword, canAccessStaff, type Account } from "../../lib/auth/policy";
import { checkRateLimit } from "../../lib/auth/rate-limit";
import { activateInvitation } from "../../lib/auth/repository";

export type AuthState = { code?: string };
function field(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}
export async function register(_previous: AuthState, data: FormData): Promise<AuthState> {
  const email = normalizeEmail(field(data, "email"));
  const password = field(data, "password");
  const name = field(data, "name").trim();
  const phone = field(data, "phone").trim();
  const locale = field(data, "locale");
  if (!validEmail(email) || !validPassword(password) || name.length < 2 || name.length > 100 || phone.length > 80 || !["zh", "es", "en"].includes(locale)) return { code: "invalid" };
  if (!databaseConfigured()) return { code: "unavailable" };
  try {
    if (!await checkRateLimit("register", email)) return { code: "rate" };
    const hash = await hashPassword(password);
    // Public registration always creates customers, regardless of submitted roles.
    const { rows } = await database().query<{ id: string }>(
      `INSERT INTO v1_auth.accounts(email,full_name,phone,locale,kind,password_hash)
       VALUES($1,$2,$3,$4,'customer',$5) ON CONFLICT(email) DO NOTHING RETURNING id`,
      [email, name, phone || null, locale, hash]);
    if (!rows[0]) return { code: "exists" };
    await createSession(rows[0].id);
  } catch { return { code: "unavailable" }; }
  redirect("/account");
}
async function signIn(kind: "customer" | "staff", data: FormData): Promise<AuthState> {
  const email = normalizeEmail(field(data, "email"));
  const password = field(data, "password");
  if (!validEmail(email) || password.length === 0 || password.length > 128) return { code: "credentials" };
  if (!databaseConfigured()) return { code: "unavailable" };
  let locale = "zh";
  try {
    if (!await checkRateLimit("login", email)) return { code: "rate" };
    const { rows } = await database().query<Account & { password_hash: string | null }>("SELECT * FROM v1_auth.accounts WHERE email=$1", [email]);
    const account = rows[0];
    const matches = await verifyPassword(password, account?.password_hash ?? null);
    if (!matches || !account || account.status !== "active" || account.kind !== kind || (kind === "staff" && !canAccessStaff(account))) return { code: "credentials" };
    locale = account.locale === "es" ? "es" : "zh";
    await createSession(account.id);
    await database().query("UPDATE v1_auth.accounts SET last_sign_in_at=now() WHERE id=$1", [account.id]);
  } catch { return { code: "unavailable" }; }
  redirect(kind === "staff" ? `/staff?lang=${locale}` : "/account");
}
export async function customerSignIn(_previous: AuthState, data: FormData): Promise<AuthState> {
  return signIn("customer", data);
}
export async function staffSignIn(_previous: AuthState, data: FormData): Promise<AuthState> {
  return signIn("staff", data);
}
export async function acceptInvitation(_previous: AuthState, data: FormData): Promise<AuthState> {
  const token = field(data, "token");
  const password = field(data, "password");
  if (!validToken(token)) return { code: "invitation" };
  if (!validPassword(password) || password !== field(data, "confirm")) return { code: "password" };
  if (!databaseConfigured()) return { code: "unavailable" };
  try {
    if (!await checkRateLimit("accept", tokenHash(token))) return { code: "rate" };
    const passwordHash = await hashPassword(password);
    await transaction(client => activateInvitation(client, tokenHash(token), passwordHash));
  } catch (error) {
    return { code: error instanceof Error && error.message === "INVALID_INVITATION" ? "invitation" : "unavailable" };
  }
  redirect("/staff/login?activated=1");
}
export async function signOut() {
  await deleteSession();
  redirect("/");
}
