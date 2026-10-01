import type { PoolClient } from "pg";
import type { Account, Role } from "./policy";

type Connection = Pick<PoolClient, "query">;
export async function sessionAccount(db: Connection, hash: string): Promise<Account | null> {
  const { rows } = await db.query<Account>(
    `SELECT a.id,a.full_name,a.email,a.phone,a.locale,a.kind,a.role,a.status
     FROM v1_auth.sessions s JOIN v1_auth.accounts a ON a.id=s.account_id
     WHERE s.token_hash=$1 AND s.expires_at>now() AND a.status='active'`, [hash]);
  return rows[0] ?? null;
}
export async function activateInvitation(db: Connection, tokenHash: string, passwordHash: string) {
  const { rows } = await db.query<{ account_id: string }>(
    `SELECT i.account_id FROM v1_auth.invitations i JOIN v1_auth.accounts a ON a.id=i.account_id
     WHERE i.token_hash=$1 AND i.accepted_at IS NULL AND i.expires_at>now()
     AND a.kind='staff' AND a.status='invited' FOR UPDATE OF i,a`, [tokenHash]);
  if (!rows[0]) throw new Error("INVALID_INVITATION");
  await db.query("UPDATE v1_auth.accounts SET password_hash=$1,status='active' WHERE id=$2", [passwordHash, rows[0].account_id]);
  await db.query("UPDATE v1_auth.invitations SET accepted_at=now() WHERE token_hash=$1", [tokenHash]);
}
export async function assertAdmin(db: Connection, id: string) {
  const { rows } = await db.query("SELECT id FROM v1_auth.accounts WHERE id=$1 AND kind='staff' AND role='admin' AND status='active' FOR UPDATE", [id]);
  if (!rows[0]) throw new Error("permission");
}
export async function changeStaff(db: Connection, actorId: string, id: string, role: Role, status: string) {
  const result = await db.query<Account & { password_hash: string | null }>("SELECT * FROM v1_auth.accounts WHERE id=$1 AND kind='staff' FOR UPDATE", [id]);
  const target = result.rows[0];
  if (!target) throw new Error("invalid");
  if (id === actorId && (role !== "admin" || status !== "active")) throw new Error("self");
  if (status === "active" && !target.password_hash) throw new Error("pending");
  if (status === "invited" && target.status !== "invited") throw new Error("invalid");
  if (target.role === "admin" && target.status === "active" && (role !== "admin" || status !== "active")) {
    const count = await db.query<{ count: string }>("SELECT count(*) FROM v1_auth.accounts WHERE kind='staff' AND role='admin' AND status='active'");
    if (Number(count.rows[0].count) <= 1) throw new Error("last");
  }
  await db.query("UPDATE v1_auth.accounts SET role=$1,status=$2 WHERE id=$3", [role, status, id]);
  if (target.role !== role || target.status !== status) await db.query("DELETE FROM v1_auth.sessions WHERE account_id=$1", [id]);
  if (status === "disabled") await db.query("DELETE FROM v1_auth.invitations WHERE account_id=$1", [id]);
}
