import {NextRequest, NextResponse} from "next/server";

const protectedRoutes=["/staff","/admin"];

function isProtectedPath(pathname:string){
 return protectedRoutes.some(route=>pathname===route||pathname.startsWith(`${route}/`));
}

function unauthorized(message="Authentication required"){
 return new NextResponse(message,{
  status:401,
  headers:{
   "WWW-Authenticate":'Basic realm="V1 Staff", charset="UTF-8"',
   "X-Robots-Tag":"noindex, nofollow, noarchive",
  },
 });
}

export function proxy(request:NextRequest){
 const {pathname}=request.nextUrl;
 if(!isProtectedPath(pathname)) return NextResponse.next();

 const user=process.env.STAFF_BASIC_AUTH_USER;
 const password=process.env.STAFF_BASIC_AUTH_PASSWORD;

 if(!user||!password){
  if(process.env.NODE_ENV!=="production"){
   return NextResponse.next();
  }

  return new NextResponse("Staff access is not configured.",{
   status:503,
   headers:{"X-Robots-Tag":"noindex, nofollow, noarchive"},
  });
 }

 const authorization=request.headers.get("authorization");
 if(!authorization?.startsWith("Basic ")) return unauthorized();

 try{
  const credentials=atob(authorization.slice(6));
  const separator=credentials.indexOf(":");
  const suppliedUser=credentials.slice(0,separator);
  const suppliedPassword=credentials.slice(separator+1);

  if(suppliedUser===user&&suppliedPassword===password){
   const response=NextResponse.next();
   response.headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
   return response;
  }
 }catch{
  return unauthorized("Invalid authentication header");
 }

 return unauthorized();
}

export const config={
 matcher:["/staff/:path*","/admin/:path*"],
};
