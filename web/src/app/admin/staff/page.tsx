import BrandLogo from "../../../components/BrandLogo";
import Link from "next/link";
import type { Metadata } from "next";
import { permissionLabel, roleLabel, rolePermissions, type StaffLocale } from "../../../lib/v1-data";
import { staffRoles, type Account } from "../../../lib/auth/policy";
import { requireStaff } from "../../../lib/auth/session";
import { database } from "../../../lib/db";
import { StaffInviteForm, StaffAccountControls } from "../../../components/StaffManagement";
import { signOut } from "../../auth/actions";

export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };
type StaffRow = Account & { notes: string; last_sign_in_at: Date | null };
export default async function AdminStaffPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const locale: StaffLocale = params.lang === "es" ? "es" : "zh";
  const actor = await requireStaff(true, locale);
  const { rows: accounts } = await database().query<StaffRow>(
    "SELECT id,full_name,email,phone,locale,kind,role,status,notes,last_sign_in_at FROM v1_auth.accounts WHERE kind='staff' ORDER BY created_at");
  const zh = locale === "zh";
  return <main className="staff-page admin-page">
    <aside className="staff-sidebar"><BrandLogo /><nav aria-label="Admin navigation"><Link href={`/staff?lang=${locale}`}>{zh ? "工作台" : "Panel"}</Link><Link href={`/admin/staff?lang=${locale}`} aria-current="page">{zh ? "员工账户" : "Cuentas staff"}</Link></nav></aside>
    <section className="staff-main">
      <header className="staff-header">
        <div><p className="eyebrow">ADMIN / {zh ? "员工权限" : "ACCESO STAFF"}</p><h1>{zh ? "让每位员工，拥有适合的权限。" : "El acceso adecuado para cada persona."}</h1></div>
        <div className="staff-actions"><Link href={`/admin/staff?lang=${zh ? "es" : "zh"}`}>{zh ? "ES" : "中文"}</Link><Link className="text-link" href={`/staff?lang=${locale}`}>{zh ? "返回 Staff" : "Volver a Staff"} ↗</Link><form action={signOut}><button className="text-link" type="submit">{zh ? "退出登录" : "Cerrar sesión"}</button></form></div>
      </header>
      <div className="admin-grid">
        <section className="staff-panel"><div className="panel-head"><h2>{zh ? "邀请员工" : "Invitar staff"}</h2><span>{zh ? "仅管理员" : "Solo admin"}</span></div><StaffInviteForm locale={locale} /></section>
        <section className="staff-panel"><div className="panel-head"><h2>{zh ? "角色权限" : "Permisos por rol"}</h2></div><div className="permission-list">{staffRoles.map(role => <article key={role}><strong>{roleLabel(role, locale)}</strong><p>{rolePermissions[role].map(permission => permissionLabel(permission, locale)).join(" / ")}</p></article>)}</div></section>
      </div>
      <section className="staff-panel wide"><div className="panel-head"><h2>{zh ? "员工账户" : "Cuentas staff"}</h2><span>{accounts.length} {zh ? "条记录" : "registros"}</span></div>
        <div className="staff-accounts-list">{accounts.map(account => <article key={account.id}>
          <div><strong>{account.full_name}</strong><p>{account.email}</p><p>{account.notes}</p><small>{account.last_sign_in_at ? account.last_sign_in_at.toLocaleString(zh ? "zh-CN" : "es-ES", { timeZone: "Europe/Madrid" }) : zh ? "尚未登录" : "Sin acceso todavía"}</small></div>
          <StaffAccountControls account={{ id: account.id, full_name: account.full_name, email: account.email, phone: account.phone, locale: account.locale, kind: account.kind, role: account.role, status: account.status }} locale={locale} self={account.id === actor.id} />
        </article>)}</div>
      </section>
    </section>
  </main>;
}
