"use server";
import { revalidatePath } from "next/cache";
import type { PoolClient } from "pg";
import { requireStaff } from "../../../lib/auth/session";
import { transaction } from "../../../lib/db";
import { newToken, tokenHash } from "../../../lib/auth/crypto";
import { isRole, normalizeEmail, validEmail, type Account } from "../../../lib/auth/policy";
import { assertAdmin, changeStaff } from "../../../lib/auth/repository";

export type StaffState = { code?: string; invitePath?: string };
const value = (data: FormData, key: string) => typeof data.get(key) === "string" ? data.get(key) as string : "";
async function adminTransaction<T>(actor: Account, work: (client: PoolClient) => Promise<T>) {
  return transaction(async client => {
    // Serialize staff changes, including the last-admin check.
    await client.query("SELECT pg_advisory_xact_lock(731041)");
    await assertAdmin(client, actor.id);
    return work(client);
  });
}
export async function inviteStaff(_previous: StaffState, data: FormData): Promise<StaffState> {
  const actor = await requireStaff(true);
  const email = normalizeEmail(value(data, "email"));
  const name = value(data, "name").trim();
  const role = value(data, "role");
  const notes = value(data, "notes").trim();
  const locale = value(data, "locale") === "es" ? "es" : "zh";
  if (!validEmail(email) || name.length < 2 || name.length > 100 || !isRole(role) || notes.length > 1000) return { code: "invalid" };
  const token = newToken();
  try {
    await adminTransaction(actor, async client => {
      const existing = await client.query<{ id: string; kind: string; status: string; password_hash: string | null }>("SELECT id,kind,status,password_hash FROM v1_auth.accounts WHERE email=$1 FOR UPDATE", [email]);
      let id = existing.rows[0]?.id;
      if (id && (existing.rows[0].kind !== "staff" || (existing.rows[0].status !== "invited" && !(existing.rows[0].status === "disabled" && !existing.rows[0].password_hash)))) throw new Error("exists");
      if (id) {
        await client.query("UPDATE v1_auth.accounts SET full_name=$1,role=$2,notes=$3,locale=$4,status='invited' WHERE id=$5", [name, role, notes, locale, id]);
      } else {
        const result = await client.query<{ id: string }>("INSERT INTO v1_auth.accounts(email,full_name,kind,role,status,notes,locale) VALUES($1,$2,'staff',$3,'invited',$4,$5) RETURNING id", [email, name, role, notes, locale]);
        id = result.rows[0].id;
      }
      await client.query(
        `INSERT INTO v1_auth.invitations(token_hash,account_id,invited_by) VALUES($1,$2,$3)
         ON CONFLICT(account_id) DO UPDATE SET token_hash=excluded.token_hash,invited_by=excluded.invited_by,expires_at=now()+interval '48 hours',accepted_at=NULL`,
        [tokenHash(token), id, actor.id]);
    });
  } catch (error) {
    return { code: error instanceof Error && ["exists", "permission"].includes(error.message) ? error.message : "unavailable" };
  }
  revalidatePath("/admin/staff");
  return { code: "invited", invitePath: `/staff/accept?token=${token}&lang=${locale}` };
}
export async function updateStaff(_previous: StaffState, data: FormData): Promise<StaffState> {
  const actor = await requireStaff(true);
  const id = value(data, "id"), role = value(data, "role"), status = value(data, "status");
  if (!/^[a-f0-9-]{36}$/.test(id) || !isRole(role) || !["active", "disabled", "invited"].includes(status)) return { code: "invalid" };
  try {
    await adminTransaction(actor, async client => {
      await changeStaff(client, actor.id, id, role, status);
    });
  } catch (error) {
    return { code: error instanceof Error && ["invalid", "self", "pending", "last", "permission"].includes(error.message) ? error.message : "unavailable" };
  }
  revalidatePath("/admin/staff");
  return { code: "saved" };
}
