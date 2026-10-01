import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { hashPassword, verifyPassword, newToken, tokenHash } from "../src/lib/auth/crypto.ts";
import { canAccessStaff, canManageStaff } from "../src/lib/auth/policy.ts";
import { activateInvitation, assertAdmin, changeStaff, sessionAccount } from "../src/lib/auth/repository.ts";

test("password hashes are salted; wrong and unknown-account passwords fail", async () => {
  const first = await hashPassword("a long customer password");
  const second = await hashPassword("a long customer password");
  assert.notEqual(first, second);
  assert(!first.includes("a long customer password"));
  assert(await verifyPassword("a long customer password", first));
  assert.equal(await verifyPassword("wrong password", first), false);
  assert.equal(await verifyPassword("anything", null), false);
  assert.equal(await verifyPassword("anything", "malformed"), false);
});
test("staff and admin access are decided by current account kind, status and role", () => {
  const base = { kind: "customer", status: "active", role: null };
  assert.equal(canAccessStaff(null), false);
  assert.equal(canAccessStaff(base), false);
  assert.equal(canManageStaff({ ...base, role: "admin" }), false);
  for (const role of ["admin", "manager", "advisor", "operations", "viewer"]) {
    const staff = { ...base, kind: "staff", role };
    assert(canAccessStaff(staff));
    assert.equal(canManageStaff(staff), role === "admin");
    assert.equal(canAccessStaff({ ...staff, status: "disabled" }), false);
    assert.equal(canAccessStaff({ ...staff, status: "invited" }), false);
  }
});
test("PostgreSQL constraints, invitation replay, expiry and session revocation", async () => {
  const db = new PGlite();
  try {
    const migration = await readFile(new URL("../docs/auth-migration.sql", import.meta.url), "utf8");
    await db.exec(migration);
    await db.exec(migration); // migration can be safely run again
    const hash = await hashPassword("a secure database password");
    async function create(email, kind, role, status = "active") {
      return (await db.query("INSERT INTO v1_auth.accounts(email,full_name,kind,role,status,password_hash) VALUES($1,'Test',$2,$3,$4,$5) RETURNING id", [email, kind, role, status, status === "invited" ? null : hash])).rows[0].id;
    }
    const admin = await create("admin@example.com", "staff", "admin");
    const customer = await create("customer@example.com", "customer", null);
    const advisor = await create("advisor@example.com", "staff", "advisor");
    await assert.rejects(() => create("elevated@example.com", "customer", "admin"), /check constraint/);
    await assert.rejects(() => create("customer@example.com", "customer", null), /unique constraint/);
    await assert.rejects(() => assertAdmin(db, customer), /permission/);
    await assert.rejects(() => assertAdmin(db, advisor), /permission/);
    await assertAdmin(db, admin);
    const invited = await create("invited@example.com", "staff", "viewer", "invited");
    const token = newToken();
    await db.query("INSERT INTO v1_auth.invitations(token_hash,account_id,invited_by) VALUES($1,$2,$3)", [tokenHash(token), invited, admin]);
    await db.transaction(tx => activateInvitation(tx, tokenHash(token), hash));
    await assert.rejects(() => db.transaction(tx => activateInvitation(tx, tokenHash(token), hash)), /INVALID_INVITATION/);
    const expired = await create("expired@example.com", "staff", "viewer", "invited");
    await db.query("INSERT INTO v1_auth.invitations(token_hash,account_id,invited_by,expires_at) VALUES('expired',$1,$2,now()-interval '1 day')", [expired, admin]);
    await assert.rejects(() => db.transaction(tx => activateInvitation(tx, "expired", hash)), /INVALID_INVITATION/);
    const session = newToken();
    await db.query("INSERT INTO v1_auth.sessions(token_hash,account_id,expires_at) VALUES($1,$2,now()+interval '1 day')", [tokenHash(session), advisor]);
    assert.equal((await sessionAccount(db, tokenHash(session))).role, "advisor");
    assert.equal(await sessionAccount(db, session), null); // raw tokens are never stored
    await db.transaction(async tx => { await assertAdmin(tx, admin); await changeStaff(tx, admin, advisor, "advisor", "disabled"); });
    assert.equal(await sessionAccount(db, tokenHash(session)), null);
    await db.query("INSERT INTO v1_auth.sessions(token_hash,account_id,expires_at) VALUES('late',$1,now()+interval '1 day')", [advisor]);
    assert.equal(await sessionAccount(db, "late"), null); // status checked even if a session survives a race
    await db.query("INSERT INTO v1_auth.sessions(token_hash,account_id,expires_at) VALUES('expired-session',$1,now()-interval '1 day')", [customer]);
    assert.equal(await sessionAccount(db, "expired-session"), null);
    await assert.rejects(() => changeStaff(db, admin, admin, "viewer", "active"), /self/);
    await assert.rejects(() => changeStaff(db, customer, admin, "viewer", "active"), /last/);
    await assert.rejects(() => changeStaff(db, admin, expired, "viewer", "active"), /pending/);
    await db.transaction(tx => changeStaff(tx, admin, invited, "operations", "active"));
    assert.equal((await db.query("SELECT role FROM v1_auth.accounts WHERE id=$1", [invited])).rows[0].role, "operations");
  } finally {
    await db.close();
  }
});
