import { NextRequest, NextResponse } from "next/server";

// Keep this value local: proxy runs in the Edge runtime, whereas the complete
// session verification module uses Node's crypto APIs.
const SESSION_COOKIE = "internal_portal_session";

export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
