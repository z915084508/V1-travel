import Link from "next/link";
import { signOut } from "../auth/actions";
export default async function AccessDenied({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const es = (await searchParams).lang === "es";
  return <main className="auth-page"><section className="auth-copy"><p className="eyebrow">V1 ACCESS</p><h1>{es ? "Acceso restringido." : "该账户没有访问权限。"}</h1><p>{es ? "Contacta con el administrador si necesitas acceso." : "如需访问，请联系管理员。"}</p><Link className="text-link" href="/">{es ? "Volver a V1" : "返回首页"} ↗</Link><form action={signOut}><button className="text-link" type="submit">{es ? "Cerrar sesión" : "退出当前账户"}</button></form></section></main>;
}
