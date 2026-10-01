"use client";
import { useActionState } from "react";
import Link from "next/link";
import { register, customerSignIn, staffSignIn, acceptInvitation, type AuthState } from "../app/auth/actions";

const copy = {
  zh: { name: "姓名", email: "邮箱", phone: "电话 / WhatsApp / 微信（可选）", password: "密码", confirm: "再次输入密码", language: "偏好语言", signup: "创建账户", login: "登录", accept: "设置密码并启用账户", pending: "正在处理…", register: "创建账户", signIn: "已有账户？登录", passwordHint: "请使用 10–128 个字符。", activated: "账户已启用，请使用新密码登录。", errors: { invalid: "请检查姓名、邮箱和密码，密码至少需要 10 个字符。", unavailable: "账户服务暂时无法使用，请稍后重试。", credentials: "邮箱或密码不正确，或该账户无法登录此入口。", exists: "无法创建此账户。如已注册，请使用登录入口。", rate: "尝试次数较多，请 15 分钟后再试。", invitation: "邀请无效、已使用或已过期，请联系管理员。", password: "请设置至少 10 个字符的密码，并确认两次输入一致。" } },
  es: { name: "Nombre completo", email: "Email", phone: "Teléfono / WhatsApp / WeChat (opcional)", password: "Contraseña", confirm: "Repite la contraseña", language: "Idioma preferido", signup: "Crear cuenta", login: "Entrar", accept: "Crear contraseña y activar cuenta", pending: "Procesando…", register: "Crear cuenta", signIn: "¿Ya tienes cuenta? Entra", passwordHint: "Utiliza entre 10 y 128 caracteres.", activated: "Cuenta activada. Entra con tu nueva contraseña.", errors: { invalid: "Revisa los datos. La contraseña necesita al menos 10 caracteres.", unavailable: "El servicio no está disponible. Inténtalo más tarde.", credentials: "Credenciales incorrectas o cuenta sin acceso a este portal.", exists: "No se pudo crear la cuenta. Si ya existe, inicia sesión.", rate: "Demasiados intentos. Vuelve a probar en 15 minutos.", invitation: "Invitación inválida, utilizada o caducada. Contacta con el administrador.", password: "Utiliza al menos 10 caracteres y confirma la misma contraseña." } },
  en: { name: "Full name", email: "Email", phone: "Phone / WhatsApp / WeChat (optional)", password: "Password", confirm: "Confirm password", language: "Preferred language", signup: "Create account", login: "Sign in", accept: "Set password and activate account", pending: "Please wait…", register: "Create an account", signIn: "Already registered? Sign in", passwordHint: "Use 10–128 characters.", activated: "Your account is active. Sign in with your new password.", errors: { invalid: "Check your details. Passwords need at least 10 characters.", unavailable: "Account service is temporarily unavailable. Please try again later.", credentials: "Incorrect credentials, or this account cannot access this portal.", exists: "Unable to create this account. If already registered, please sign in.", rate: "Too many attempts. Try again in 15 minutes.", invitation: "Invitation invalid, used or expired. Contact your administrator.", password: "Use at least 10 characters and enter the same password twice." } },
};
type Props = { mode: "register" | "login" | "staff" | "accept"; locale?: "zh" | "es" | "en"; token?: string; activated?: boolean; configured: boolean };
export default function AccountForm({ mode, locale = "zh", token, activated, configured }: Props) {
  const action = mode === "register" ? register : mode === "accept" ? acceptInvitation : mode === "staff" ? staffSignIn : customerSignIn;
  const [state, submit, pending] = useActionState<AuthState, FormData>(action, {});
  const c = copy[locale];
  const isNew = mode === "register" || mode === "accept";
  const code = state.code ?? (!configured ? "unavailable" : undefined);
  return <form className="auth-form" action={submit}>
    {mode === "register" && <div><label htmlFor="name">{c.name}</label><input id="name" name="name" autoComplete="name" minLength={2} maxLength={100} required /></div>}
    {mode !== "accept" && <div><label htmlFor="email">{c.email}</label><input id="email" name="email" type="email" autoComplete="username" maxLength={254} required /></div>}
    {mode === "register" && <div><label htmlFor="phone">{c.phone}</label><input id="phone" name="phone" autoComplete="tel" maxLength={80} /></div>}
    <div><label htmlFor="password">{c.password}</label><input id="password" name="password" type="password" autoComplete={isNew ? "new-password" : "current-password"} minLength={isNew ? 10 : undefined} maxLength={128} aria-describedby={isNew ? "password-hint" : undefined} required /></div>
    {isNew && <p id="password-hint">{c.passwordHint}</p>}
    {mode === "accept" && <><input type="hidden" name="token" value={token ?? ""} /><div><label htmlFor="confirm">{c.confirm}</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /></div></>}
    {mode === "register" && <fieldset><legend>{c.language}</legend>{(["zh", "es", "en"] as const).map(value => <label key={value}><input type="radio" name="locale" value={value} defaultChecked={locale === value} />{value === "zh" ? "中文" : value === "es" ? "Español" : "English"}</label>)}</fieldset>}
    {activated && <p role="status">{c.activated}</p>}
    {code && <p className="form-feedback" role="alert">{c.errors[code as keyof typeof c.errors] ?? c.errors.unavailable}</p>}
    <button className="button" disabled={pending || !configured} type="submit">{pending ? c.pending : mode === "register" ? c.signup : mode === "accept" ? c.accept : c.login}<span>↗</span></button>
    {(mode === "register" || mode === "login") && <Link className="text-link" href={`/${mode === "register" ? "login" : "register"}?lang=${locale}`}>{mode === "register" ? c.signIn : c.register} ↗</Link>}
  </form>;
}
