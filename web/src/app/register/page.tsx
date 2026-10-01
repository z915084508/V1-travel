import BrandLogo from "../../components/BrandLogo";
import AccountForm from "../../components/AccountForm";
import { databaseConfigured } from "../../lib/db";
import Link from "next/link";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const locale = params.lang === "es" ? "es" : params.lang === "en" ? "en" : "zh";
  const benefits = locale === "zh" ? ["告诉我们你想去的地方", "收到适合你的旅行建议", "旅行前与旅途中，有人帮助"] : locale === "es" ? ["Cuéntanos adónde quieres ir", "Recibe opciones pensadas para ti", "Apoyo antes y durante el viaje"] : ["Tell us where you would like to go", "Receive thoughtful travel options", "Keep support close before and during the trip"];
  return <main className="auth-page">
    <header className="auth-header"><BrandLogo /><Link className="text-link" href="/">{locale === "zh" ? "返回首页" : locale === "es" ? "Volver a V1" : "Back to V1"} ↗</Link></header>
    <section className="auth-grid"><div className="auth-copy"><p className="eyebrow">V1 ACCOUNT</p><h1>{locale === "zh" ? "从这里，开始你的旅程。" : locale === "es" ? "Tu viaje empieza aquí." : "Your journey starts here."}</h1><ul>{benefits.map(text => <li key={text}>{text}</li>)}</ul></div><AccountForm mode="register" locale={locale} configured={databaseConfigured()} /></section>
  </main>;
}
