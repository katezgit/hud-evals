import { NextResponse, type NextRequest } from "next/server";

// Auth gating splits across two mechanisms (see `docs/conventions/app-conventions.folder-structure.md`).
// This middleware owns the reverse direction only: authed users hitting public
// auth pages get redirected home. Protected-route gating lives in the (app),
// (onboarding), and (manage) group layouts via `requireSession()` — keep this
// file limited to the reverse direction so the two never double-fire.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  if (!isAuthRoute) return NextResponse.next();

  // TODO: wire real auth — read & verify the session cookie here.
  const hasSession = Boolean(request.cookies.get("session"));
  if (hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register"],
};
