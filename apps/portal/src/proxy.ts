import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "portal_session";

// Auth gating is split: protected routes are handled by `requireSession()` in the
// (app) layout. Keep this proxy limited to the reverse direction — don't double-gate.
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(COOKIE_NAME)?.value);
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  if (isAuthRoute && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register"],
};
