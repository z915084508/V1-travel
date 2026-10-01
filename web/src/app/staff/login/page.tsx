import Link from "next/link";
import type { Metadata } from "next";
import BrandLogo from "../../../components/BrandLogo";
import AccountForm from "../../../components/AccountForm";
import { databaseConfigured } from "../../../lib/db";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function StaffLogin({ searchParams }: { searchParams: Promise<{ lang?: string; activated?: string }> }) {
  const params = await searchParams;
  const locale = params.lang === "es" ? "es" : "zh";
  return <main className="auth-page">
    <header className="auth-header"><BrandLogo /><div className="staff-actions"><Link href={`/staff/login?lang=${locale === "zh" ? "es" : "zh"}`}>{locale === "zh" ? "ES" : "中文"}</Link><Link className="text-link" href="/">{locale === "zh" ? "返回首页" : "Volver a V1"} ↗</Link></div></header>
    <section className="auth-grid compact-auth">
      <div className="auth-copy"><p className="eyebrow">V1 STAFF</p><h1>{locale === "zh" ? <>用心照顾。<br />全程相伴。</> : "Cada viaje merece atención."}</h1><p>{locale === "zh" ? "使用你的员工邮箱和密码登录。" : "Entra con tu email y contraseña de staff."}</p></div>
      <AccountForm mode="staff" locale={locale} configured={databaseConfigured()} activated={params.activated === "1"} />
    </section>
  </main>;
}
