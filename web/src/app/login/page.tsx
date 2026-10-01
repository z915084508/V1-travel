import BrandLogo from "../../components/BrandLogo";
import AccountForm from "../../components/AccountForm";
import { databaseConfigured } from "../../lib/db";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const locale = params.lang === "es" ? "es" : params.lang === "en" ? "en" : "zh";
  return <main className="auth-page">
    <header className="auth-header"><BrandLogo /><Link className="text-link" href="/">{locale === "zh" ? "返回首页" : locale === "es" ? "Volver a V1" : "Back to V1"} ↗</Link></header>
    <section className="auth-grid compact-auth">
      <div className="auth-copy"><p className="eyebrow">V1 ACCOUNT</p><h1>{locale === "zh" ? "欢迎回来。" : locale === "es" ? "Bienvenido de nuevo." : "Welcome back."}</h1><p>{locale === "zh" ? "登录你的账户，让旅程中的每次沟通都有迹可循。" : locale === "es" ? "Entra en tu cuenta y mantén tus conversaciones cerca." : "Sign in and keep your journey conversations close."}</p></div>
      <AccountForm mode="login" locale={locale} configured={databaseConfigured()} />
    </section>
  </main>;
}
