export type CaseStatus="new"|"planning"|"quoted"|"accepted"|"paid"|"booked"|"traveling"|"completed"|"cancelled";
export type ConversationStatus="open"|"waiting_guest"|"waiting_staff"|"closed";
export type TripPriority="normal"|"watch"|"urgent";
export type StaffRole="admin"|"manager"|"advisor"|"operations"|"viewer";
export type StaffPermission="manage_staff"|"assign_cases"|"reply_inbox"|"create_quotes"|"manage_orders"|"view_live_trips"|"view_reports";

export type TravelCase={
 id:string;
 guest:string;
 destination:string;
 dates:string;
 travelers:number;
 status:CaseStatus;
 source:"homepage"|"live_chat"|"staff"|"referral";
 owner:string;
 summary:string;
 updatedAt:string;
};

export type Conversation={
 id:string;
 caseId:string;
 guest:string;
 status:ConversationStatus;
 topic:"Plan a Trip"|"Existing Trip"|"Change or Cancellation";
 lastMessage:string;
 updatedAt:string;
 assignedTo:string;
};

export type Quote={
 id:string;
 caseId:string;
 title:string;
 status:"draft"|"sent"|"accepted"|"expired"|"cancelled";
 amount:string;
 validUntil:string;
};

export type LiveTrip={
 id:string;
 caseId:string;
 guest:string;
 destination:string;
 window:string;
 nextStep:string;
 priority:TripPriority;
};

export type StaffAccount={
 id:string;
 name:string;
 email:string;
 role:StaffRole;
 status:"active"|"invited"|"disabled";
 lastActive:string;
 notes:string;
};

export type CustomerAccount={
 id:string;
 name:string;
 email:string;
 status:"guest"|"invited"|"active"|"disabled";
 trips:number;
 locale:"zh"|"en"|"es";
};

export const staffOverview={
 inboxOpen:7,
 casesActive:18,
 quotesWaiting:4,
 liveTrips:3,
 revenuePending:"EUR 12,840",
};

export const travelCases:TravelCase[]=[
 {id:"V1-C-1007",guest:"Li Wei",destination:"China multi-city",dates:"12 Nov - 25 Nov",travelers:2,status:"planning",source:"live_chat",owner:"Ana",summary:"Wants Beijing, Xi'an and Shanghai with rail between cities.",updatedAt:"11 min ago"},
 {id:"V1-C-1006",guest:"Chen Family",destination:"Spain",dates:"03 Dec - 12 Dec",travelers:4,status:"paid",source:"homepage",owner:"Marta",summary:"Payment received. Hotel rooms and rail still need final booking.",updatedAt:"42 min ago"},
 {id:"V1-C-1005",guest:"Grace Wang",destination:"Chengdu",dates:"18 Oct - 22 Oct",travelers:1,status:"traveling",source:"staff",owner:"Ana",summary:"In destination. Needs airport transfer confirmation for tomorrow.",updatedAt:"1 hr ago"},
 {id:"V1-C-1004",guest:"Miguel Santos",destination:"China visa support",dates:"Flexible",travelers:1,status:"quoted",source:"referral",owner:"Leo",summary:"Quote sent for flight, hotel and documentation support.",updatedAt:"3 hr ago"},
];

export const conversations:Conversation[]=[
 {id:"V1-IN-2201",caseId:"V1-C-1007",guest:"Li Wei",status:"waiting_staff",topic:"Plan a Trip",lastMessage:"Can we add one more night in Shanghai?",updatedAt:"11 min ago",assignedTo:"Ana"},
 {id:"V1-IN-2200",caseId:"V1-C-1006",guest:"Chen Family",status:"open",topic:"Existing Trip",lastMessage:"We paid the link. Are the hotels confirmed?",updatedAt:"42 min ago",assignedTo:"Marta"},
 {id:"V1-IN-2198",caseId:"V1-C-1005",guest:"Grace Wang",status:"waiting_staff",topic:"Change or Cancellation",lastMessage:"My flight time changed. Do I need a new transfer?",updatedAt:"1 hr ago",assignedTo:"Ana"},
];

export const quotes:Quote[]=[
 {id:"V1-Q-3104",caseId:"V1-C-1004",title:"China visa support and travel bundle",status:"sent",amount:"EUR 1,280",validUntil:"05 Oct"},
 {id:"V1-Q-3103",caseId:"V1-C-1006",title:"Spain family winter journey",status:"accepted",amount:"EUR 6,420",validUntil:"Accepted"},
 {id:"V1-Q-3102",caseId:"V1-C-1007",title:"China first draft",status:"draft",amount:"EUR 3,980",validUntil:"Draft"},
];

export const liveTrips:LiveTrip[]=[
 {id:"V1-T-4102",caseId:"V1-C-1005",guest:"Grace Wang",destination:"Chengdu",window:"18 Oct - 22 Oct",nextStep:"Confirm tomorrow airport transfer",priority:"watch"},
 {id:"V1-T-4101",caseId:"V1-C-0998",guest:"Huang Group",destination:"Madrid",window:"Today - 02 Oct",nextStep:"Dinner booking at 20:30",priority:"normal"},
 {id:"V1-T-4100",caseId:"V1-C-0997",guest:"Liu Mei",destination:"Beijing",window:"29 Sep - 04 Oct",nextStep:"Flight delay monitoring",priority:"urgent"},
];

export const rolePermissions:Record<StaffRole,StaffPermission[]>={
 admin:["manage_staff","assign_cases","reply_inbox","create_quotes","manage_orders","view_live_trips","view_reports"],
 manager:["assign_cases","reply_inbox","create_quotes","manage_orders","view_live_trips","view_reports"],
 advisor:["reply_inbox","create_quotes","view_live_trips"],
 operations:["assign_cases","manage_orders","view_live_trips"],
 viewer:["view_live_trips","view_reports"],
};

export const staffAccounts:StaffAccount[]=[
 {id:"V1-S-001",name:"V1 Admin",email:"admin@v1travel.example",role:"admin",status:"active",lastActive:"Now",notes:"Full access. Owns account and staff permissions."},
 {id:"V1-S-002",name:"Ana Moreno",email:"ana@v1travel.example",role:"advisor",status:"active",lastActive:"11 min ago",notes:"Handles China planning and live trip support."},
 {id:"V1-S-003",name:"Marta Ruiz",email:"marta@v1travel.example",role:"operations",status:"active",lastActive:"42 min ago",notes:"Payments, bookings, hotels and transfer follow-up."},
 {id:"V1-S-004",name:"Leo Chen",email:"leo@v1travel.example",role:"manager",status:"invited",lastActive:"Invitation sent",notes:"Can assign cases and review quotes after accepting invitation."},
];

export const customerAccounts:CustomerAccount[]=[
 {id:"V1-U-501",name:"Li Wei",email:"li.wei@example.com",status:"active",trips:1,locale:"zh"},
 {id:"V1-U-500",name:"Chen Family",email:"chen.family@example.com",status:"invited",trips:1,locale:"zh"},
 {id:"V1-U-499",name:"Grace Wang",email:"grace.wang@example.com",status:"active",trips:2,locale:"en"},
];

export type StaffLocale="zh"|"es";

export function statusLabel(status:CaseStatus,locale:StaffLocale="zh"){
 const labels:Record<StaffLocale,Record<CaseStatus,string>>={
  zh:{new:"新咨询",planning:"规划中",quoted:"已报价",accepted:"已接受",paid:"已付款，待预订",booked:"已预订",traveling:"正在出行",completed:"已完成",cancelled:"已取消"},
  es:{new:"Nueva",planning:"En planificación",quoted:"Presupuestada",accepted:"Aceptada",paid:"Pagada, pendiente de reserva",booked:"Reservada",traveling:"En viaje",completed:"Completada",cancelled:"Cancelada"},
 };
 return labels[locale][status];
}

export function roleLabel(role:StaffRole,locale:StaffLocale="zh"){
 const labels:Record<StaffLocale,Record<StaffRole,string>>={
  zh:{admin:"管理员",manager:"经理",advisor:"顾问",operations:"运营",viewer:"只读"},
  es:{admin:"Admin",manager:"Manager",advisor:"Asesor",operations:"Operaciones",viewer:"Solo lectura"},
 };
 return labels[locale][role];
}

export function permissionLabel(permission:StaffPermission,locale:StaffLocale="zh"){
 const labels:Record<StaffLocale,Record<StaffPermission,string>>={
  zh:{
   manage_staff:"创建和管理员工",
   assign_cases:"分配 Case",
   reply_inbox:"回复 Inbox",
   create_quotes:"创建报价",
   manage_orders:"管理订单",
   view_live_trips:"查看正在出行",
   view_reports:"查看报表",
  },
  es:{
   manage_staff:"Crear y gestionar staff",
   assign_cases:"Asignar casos",
   reply_inbox:"Responder Inbox",
   create_quotes:"Crear presupuestos",
   manage_orders:"Gestionar órdenes",
   view_live_trips:"Ver viajes en curso",
   view_reports:"Ver informes",
  },
 };
 return labels[locale][permission];
}
