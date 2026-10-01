"use client";
import { useActionState, useState } from "react";
import { inviteStaff, updateStaff, type StaffState } from "../app/admin/staff/actions";
import { staffRoles, type Account } from "../lib/auth/policy";
import { roleLabel, type StaffLocale } from "../lib/v1-data";

const messages = {
  zh: { invalid: "请检查输入内容。", exists: "此邮箱已被使用，请管理现有账户。", permission: "管理员权限已失效，请重新登录。", unavailable: "操作暂时无法完成，请稍后再试。", invited: "邀请已创建，48 小时内有效。请将链接单独分享给这位员工。", saved: "已保存。角色或状态变化后，员工需重新登录。", self: "不能停用自己或移除自己的管理员角色。", pending: "员工需要先通过邀请设置密码。", last: "至少需要保留一位可用管理员。" },
  es: { invalid: "Revisa los datos.", exists: "Este email ya existe. Gestiona la cuenta actual.", permission: "El acceso admin ya no está activo. Inicia sesión de nuevo.", unavailable: "No se pudo completar. Inténtalo más tarde.", invited: "Invitación creada. Válida durante 48 horas. Comparte el enlace solo con esta persona.", saved: "Guardado. Tras cambiar el rol o estado, deberá iniciar sesión de nuevo.", self: "No puedes desactivar tu cuenta ni quitarte el rol admin.", pending: "La persona debe crear su contraseña mediante la invitación.", last: "Debe quedar al menos un administrador activo." },
};
function Feedback({ state, locale }: { state: StaffState; locale: StaffLocale }) {
  return state.code ? <p className="form-feedback" role={["saved", "invited"].includes(state.code) ? "status" : "alert"}>{messages[locale][state.code as keyof typeof messages.zh] ?? messages[locale].unavailable}</p> : null;
}
export function StaffInviteForm({ locale }: { locale: StaffLocale }) {
  const [state, action, pending] = useActionState<StaffState, FormData>(inviteStaff, {});
  const [copied, setCopied] = useState(false);
  const zh = locale === "zh";
  return <form className="admin-form" action={action}>
    <input type="hidden" name="locale" value={locale} />
    <label>{zh ? "姓名" : "Nombre"}<input name="name" minLength={2} maxLength={100} required /></label>
    <label>{zh ? "邮箱" : "Email"}<input name="email" type="email" maxLength={254} required /></label>
    <label>{zh ? "角色" : "Rol"}<select name="role" defaultValue="advisor">{staffRoles.map(role => <option key={role} value={role}>{roleLabel(role, locale)}</option>)}</select></label>
    <label>{zh ? "备注" : "Notas"}<textarea name="notes" maxLength={1000} /></label>
    <button className="button" type="submit" disabled={pending}>{pending ? (zh ? "正在创建…" : "Creando…") : (zh ? "生成邀请链接" : "Crear enlace de invitación")} <span>↗</span></button>
    <Feedback state={state} locale={locale} />
    {state.invitePath && <div className="invite-result"><a href={state.invitePath}>{zh ? "打开邀请链接" : "Abrir invitación"} ↗</a><button className="text-link" type="button" onClick={async () => { setCopied(false); try { await navigator.clipboard.writeText(new URL(state.invitePath!, window.location.origin).href); setCopied(true); } catch { setCopied(false); } }}>{copied ? (zh ? "已复制" : "Copiado") : (zh ? "复制邀请链接" : "Copiar enlace")}</button></div>}
    <p>{zh ? "相同邮箱的待接受邀请可以重新生成；原链接随即失效。" : "Puedes renovar una invitación pendiente usando el mismo email. El enlace anterior deja de funcionar."}</p>
  </form>;
}
export function StaffAccountControls({ account, locale, self }: { account: Account; locale: StaffLocale; self: boolean }) {
  const [state, action, pending] = useActionState<StaffState, FormData>(updateStaff, {});
  const zh = locale === "zh";
  return <form className="staff-account-controls" action={action}>
    <input type="hidden" name="id" value={account.id} />
    <label className="sr-only" htmlFor={`role-${account.id}`}>{zh ? "角色" : "Rol"}</label>
    <select id={`role-${account.id}`} name="role" defaultValue={account.role ?? "viewer"} disabled={pending || self}>{staffRoles.map(role => <option key={role} value={role}>{roleLabel(role, locale)}</option>)}</select>
    {self && <input type="hidden" name="role" value="admin" />}
    <label className="sr-only" htmlFor={`status-${account.id}`}>{zh ? "状态" : "Estado"}</label>
    <select id={`status-${account.id}`} name="status" defaultValue={account.status} disabled={pending || self}>
      {account.status === "invited" && <option value="invited">{zh ? "待接受" : "Pendiente"}</option>}
      {account.status !== "invited" && <option value="active">{zh ? "启用" : "Activa"}</option>}
      <option value="disabled">{zh ? "停用" : "Desactivada"}</option>
    </select>
    {self && <input type="hidden" name="status" value="active" />}
    <button type="submit" disabled={pending || self}>{zh ? "保存" : "Guardar"}</button>
    <Feedback state={state} locale={locale} />
  </form>;
}
