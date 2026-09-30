import BrandLogo from "../../../components/BrandLogo";
import Link from "next/link";
import type {Metadata} from "next";
import {permissionLabel,roleLabel,rolePermissions,staffAccounts,type StaffLocale,type StaffRole} from "../../../lib/v1-data";

export const metadata:Metadata={robots:{index:false,follow:false,nocache:true}};

const roles=Object.keys(rolePermissions) as StaffRole[];

const copy={
 zh:{
  nav:["工作台","Inbox","Cases","Quotes","正在出行","员工账户"],
  eyebrow:"ADMIN / 员工权限",
  title:"谨慎创建员工账户。权限决定他们能处理什么。",
  back:"返回 Staff",
  invite:"邀请员工",
  adminOnly:"仅管理员",
  name:"姓名",
  email:"邮箱",
  role:"角色",
  notes:"备注",
  notesPlaceholder:"中国线路规划、运营、财务...",
  send:"发送邀请",
  inviteNote:"系统会创建一个待接受的员工邀请。员工接受邀请并设置密码后，账户才会启用。",
  permissions:"角色权限",
  permissionNote:"MVP 简化模型",
  accounts:"员工账户",
  records:"条记录",
  table:["姓名","邮箱","角色","状态","最近活动","备注"],
  langOther:"ES",
 },
 es:{
  nav:["Panel","Inbox","Casos","Presupuestos","Viajes en curso","Cuentas staff"],
  eyebrow:"ADMIN / ACCESO STAFF",
  title:"Crea cuentas staff con cuidado. Los permisos deciden qué pueden tocar.",
  back:"Volver a Staff",
  invite:"Invitar staff",
  adminOnly:"Solo admin",
  name:"Nombre",
  email:"Email",
  role:"Rol",
  notes:"Notas",
  notesPlaceholder:"Planificación China, operaciones, finanzas...",
  send:"Enviar invitación",
  inviteNote:"Esto crea una invitación pendiente. La cuenta staff se activa cuando acepta y crea su contraseña.",
  permissions:"Permisos por rol",
  permissionNote:"Modelo MVP simple",
  accounts:"Cuentas staff",
  records:"registros",
  table:["Nombre","Email","Rol","Estado","Última actividad","Notas"],
  langOther:"中文",
 },
} satisfies Record<StaffLocale,Record<string,unknown>>;

export default async function AdminStaffPage({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const params=await searchParams;
 const locale:StaffLocale=params.lang==="es"?"es":"zh";
 const c=copy[locale];
 const other=locale==="zh"?"es":"zh";
 return <main className="staff-page admin-page">
  <aside className="staff-sidebar">
   <BrandLogo/>
   <nav aria-label="Admin navigation">
    {(c.nav as string[]).slice(0,5).map((item,index)=><Link key={item} href={`/staff?lang=${locale}${["","#inbox","#cases","#quotes","#live-trips"][index]}`}>{item}</Link>)}
    <Link href={`/admin/staff?lang=${locale}`} aria-current="page">{(c.nav as string[])[5]}</Link>
   </nav>
  </aside>
  <section className="staff-main">
   <header className="staff-header">
    <div>
     <p className="eyebrow">{c.eyebrow as string}</p>
     <h1>{c.title as string}</h1>
    </div>
    <div className="staff-actions"><Link className="text-link" href={`/admin/staff?lang=${other}`}>{c.langOther as string}</Link><Link className="text-link" href={`/staff?lang=${locale}`}>{c.back as string} ↗</Link></div>
   </header>

   <div className="admin-grid">
    <section className="staff-panel">
     <div className="panel-head">
      <h2>{c.invite as string}</h2>
      <span>{c.adminOnly as string}</span>
     </div>
     <form className="admin-form">
      <label>{c.name as string}<input placeholder="Ana Moreno"/></label>
      <label>{c.email as string}<input type="email" placeholder="ana@v1travel.com"/></label>
      <label>{c.role as string}<select defaultValue="advisor">{roles.map(role=><option key={role} value={role}>{roleLabel(role,locale)}</option>)}</select></label>
      <label>{c.notes as string}<textarea placeholder={c.notesPlaceholder as string}/></label>
      <button className="button" type="button">{c.send as string} <span>↗</span></button>
      <p>{c.inviteNote as string}</p>
     </form>
    </section>

    <section className="staff-panel">
     <div className="panel-head">
      <h2>{c.permissions as string}</h2>
      <span>{c.permissionNote as string}</span>
     </div>
     <div className="permission-list">
      {roles.map(role=><article key={role}>
       <strong>{roleLabel(role,locale)}</strong>
       <p>{rolePermissions[role].map(permission=>permissionLabel(permission,locale)).join(" / ")}</p>
      </article>)}
     </div>
    </section>
   </div>

   <section className="staff-panel wide">
    <div className="panel-head">
     <h2>{c.accounts as string}</h2>
     <span>{staffAccounts.length} {c.records as string}</span>
    </div>
    <div className="account-table" role="table" aria-label="Staff accounts">
     <div role="row">
      {(c.table as string[]).map(label=><span key={label}>{label}</span>)}
     </div>
     {staffAccounts.map(account=><div role="row" key={account.id}>
      <strong>{account.name}</strong>
      <span>{account.email}</span>
      <mark>{roleLabel(account.role,locale)}</mark>
      <span>{account.status}</span>
      <span>{account.lastActive}</span>
      <span>{account.notes}</span>
     </div>)}
    </div>
   </section>
  </section>
 </main>;
}
