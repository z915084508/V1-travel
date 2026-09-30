import BrandLogo from "../../components/BrandLogo";
import Link from "next/link";
import type {Metadata} from "next";
import {conversations,liveTrips,quotes,staffOverview,statusLabel,travelCases,type StaffLocale} from "../../lib/v1-data";

export const metadata:Metadata={robots:{index:false,follow:false,nocache:true}};

const copy={
 zh:{
  nav:["工作台","Inbox","Cases","Quotes","Orders","正在出行","员工账户"],
  eyebrow:"V1 STAFF / 运营",
  title:"今天最需要处理的事。",
  home:"查看首页",
  stats:[["Inbox",staffOverview.inboxOpen,"待处理对话"],["Cases",staffOverview.casesActive,"进行中的旅行需求"],["Quotes",staffOverview.quotesWaiting,"等待客户回复"],["正在出行",staffOverview.liveTrips,"当前旅途中"],["待处理",staffOverview.revenuePending,"付款 / 预订工作"]],
  inbox:"Inbox",
  inboxNote:"重点对话",
  liveTrips:"正在出行",
  liveTripsNote:"今日需要关注",
  cases:"Cases",
  casesNote:"付款和预订分开追踪",
  quotes:"Quotes",
  quotesNote:"草稿、已发送、已接受",
  table:["Case","客人","行程","状态","负责人","更新"],
  langOther:"ES",
 },
 es:{
  nav:["Panel","Inbox","Casos","Presupuestos","Órdenes","Viajes en curso","Cuentas staff"],
  eyebrow:"V1 STAFF / OPERACIONES",
  title:"Las prioridades de hoy, claras.",
  home:"Ver web",
  stats:[["Inbox",staffOverview.inboxOpen,"Conversaciones abiertas"],["Casos",staffOverview.casesActive,"Casos activos"],["Presupuestos",staffOverview.quotesWaiting,"Esperando respuesta"],["Viajes en curso",staffOverview.liveTrips,"Clientes viajando"],["Pendiente",staffOverview.revenuePending,"Pago / reservas"]],
  inbox:"Inbox",
  inboxNote:"Conversaciones prioritarias",
  liveTrips:"Viajes en curso",
  liveTripsNote:"Atención para hoy",
  cases:"Casos",
  casesNote:"Pago separado de reserva",
  quotes:"Presupuestos",
  quotesNote:"Borrador, enviado, aceptado",
  table:["Caso","Cliente","Viaje","Estado","Responsable","Actualizado"],
  langOther:"中文",
 },
} satisfies Record<StaffLocale,Record<string,unknown>>;

export default async function StaffDashboard({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const params=await searchParams;
 const locale:StaffLocale=params.lang==="es"?"es":"zh";
 const c=copy[locale];
 const other=locale==="zh"?"es":"zh";
 return <main className="staff-page">
  <aside className="staff-sidebar">
   <BrandLogo/>
   <nav aria-label="Staff navigation">
    {(c.nav as string[]).slice(0,6).map((item,index)=><a key={item} href={["#dashboard","#inbox","#cases","#quotes","#orders","#live-trips"][index]} aria-current={index===0?"page":undefined}>{item}</a>)}
    <Link href={`/admin/staff?lang=${locale}`}>{(c.nav as string[])[6]}</Link>
   </nav>
  </aside>
  <section className="staff-main" id="dashboard">
   <header className="staff-header">
    <div>
     <p className="eyebrow">{c.eyebrow as string}</p>
     <h1>{c.title as string}</h1>
    </div>
    <div className="staff-actions"><Link className="text-link" href={`/staff?lang=${other}`}>{c.langOther as string}</Link><Link className="text-link" href="/">{c.home as string} ↗</Link></div>
   </header>

   <section className="staff-stats" aria-label="Staff overview">
    {(c.stats as (string|number)[][]).map(([label,value,caption])=><article key={label}>
     <span>{label}</span>
     <strong>{value}</strong>
     <p>{caption}</p>
    </article>)}
   </section>

   <div className="staff-grid">
    <section className="staff-panel" id="inbox">
     <div className="panel-head">
      <h2>{c.inbox as string}</h2>
      <span>{conversations.length} {c.inboxNote as string}</span>
     </div>
     <div className="staff-list">
      {conversations.map(item=><article key={item.id}>
       <div>
        <strong>{item.guest}</strong>
        <p>{item.lastMessage}</p>
       </div>
       <span>{item.topic}</span>
       <small>{item.updatedAt} / {item.assignedTo}</small>
      </article>)}
     </div>
    </section>

    <section className="staff-panel" id="live-trips">
     <div className="panel-head">
      <h2>{c.liveTrips as string}</h2>
      <span>{c.liveTripsNote as string}</span>
     </div>
     <div className="staff-list">
      {liveTrips.map(trip=><article key={trip.id} data-priority={trip.priority}>
       <div>
        <strong>{trip.guest}</strong>
        <p>{trip.destination} / {trip.nextStep}</p>
       </div>
       <span>{trip.priority}</span>
       <small>{trip.window}</small>
      </article>)}
     </div>
    </section>
   </div>

   <section className="staff-panel wide" id="cases">
    <div className="panel-head">
     <h2>{c.cases as string}</h2>
     <span>{c.casesNote as string}</span>
    </div>
    <div className="case-table" role="table" aria-label="Travel cases">
     <div role="row">
      {(c.table as string[]).map(label=><span key={label}>{label}</span>)}
     </div>
     {travelCases.map(item=><div role="row" key={item.id}>
      <span>{item.id}</span>
      <strong>{item.guest}</strong>
      <span>{item.destination}<small>{item.dates} / {item.travelers} pax</small></span>
      <mark data-status={item.status}>{statusLabel(item.status,locale)}</mark>
      <span>{item.owner}</span>
      <span>{item.updatedAt}</span>
     </div>)}
    </div>
   </section>

   <section className="staff-panel wide" id="quotes">
    <div className="panel-head">
     <h2>{c.quotes as string}</h2>
     <span>{c.quotesNote as string}</span>
    </div>
    <div className="quote-strip">
     {quotes.map(quote=><article key={quote.id}>
      <span>{quote.id}</span>
      <strong>{quote.title}</strong>
      <p>{quote.caseId} / {quote.amount}</p>
      <small>{quote.status} / {quote.validUntil}</small>
     </article>)}
    </div>
   </section>
  </section>
 </main>;
}
