import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const publicStaffPage = pathname === "/staff/login" || pathname === "/staff/accept";
  const protectedPage = !publicStaffPage && (pathname === "/staff" || pathname.startsWith("/staff/") || pathname === "/admin" || pathname.startsWith("/admin/"));
  // Early redirect only. Every server page and mutation verifies the database session and role.
  if (protectedPage && (!process.env.DATABASE_URL || !request.cookies.get("v1_session"))) {
    const url = new URL("/staff/login", request.url);
    url.searchParams.set("lang", request.nextUrl.searchParams.get("lang") === "es" ? "es" : "zh");
    return secureResponse(NextResponse.redirect(url));
  }
  return secureResponse(NextResponse.next());
}
function secureResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
export const config = {
  matcher: ["/staff/:path*", "/admin/:path*", "/account/:path*", "/access-denied", "/login", "/register"],
};
