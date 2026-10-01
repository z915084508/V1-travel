import Link from "next/link";
import { redirect } from "next/navigation";
import BrandLogo from "../../components/BrandLogo";
import { currentAccount } from "../../lib/auth/session";
import { signOut } from "../auth/actions";
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const account = await currentAccount();
  if (!account) redirect("/login");
  const es = account.locale === "es", zh = account.locale === "zh";
  return <main className="auth-page">
    <header className="auth-header"><BrandLogo /><form action={signOut}><button className="text-link" type="submit">{zh ? "退出登录" : es ? "Cerrar sesión" : "Sign out"} ↗</button></form></header>
    <section className="auth-grid"><div className="auth-copy"><p className="eyebrow">V1 ACCOUNT</p><h1>{zh ? "你好，" : es ? "Hola, " : "Hello, "}{account.full_name}。</h1><p>{zh ? "你的账户已就绪。和我们聊聊下一段旅程。" : es ? "Tu cuenta está lista. Hablemos de tu próximo viaje." : "Your account is ready. Let's talk about your next journey."}</p><Link className="text-link" href="/">{zh ? "返回 V1，开始规划" : es ? "Volver a V1" : "Back to V1"} ↗</Link></div><section className="auth-form"><p className="eyebrow">{zh ? "账户信息" : es ? "Tu cuenta" : "Your account"}</p><p>{account.full_name}</p><p>{account.email}</p>{account.phone && <p>{account.phone}</p>}<p>{account.locale === "zh" ? "中文" : es ? "Español" : "English"}</p>{account.kind === "staff" && <Link href={`/staff?lang=${es ? "es" : "zh"}`}>{zh ? "打开员工工作台" : "Staff"} ↗</Link>}</section></section>
  </main>;
}
