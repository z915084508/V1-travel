import Link from "next/link";
import AccountForm from "../../../components/AccountForm";
import BrandLogo from "../../../components/BrandLogo";
import { databaseConfigured } from "../../../lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function AcceptStaff({ searchParams }: { searchParams: Promise<{ token?: string; lang?: string }> }) {
  const params = await searchParams;
  const locale = params.lang === "es" ? "es" : "zh";
  return <main className="auth-page">
    <header className="auth-header"><BrandLogo /><Link href={`/staff/login?lang=${locale}`}>{locale === "zh" ? "员工登录" : "Acceso staff"} ↗</Link></header>
    <section className="auth-grid compact-auth"><div className="auth-copy"><p className="eyebrow">V1 STAFF</p><h1>{locale === "zh" ? "欢迎加入 V1。" : "Bienvenido a V1."}</h1><p>{locale === "zh" ? "设置自己的密码，启用员工账户。邀请在 48 小时内有效。" : "Crea tu contraseña para activar tu cuenta. La invitación dura 48 horas."}</p></div><AccountForm mode="accept" locale={locale} token={params.token} configured={databaseConfigured()} /></section>
  </main>;
}
