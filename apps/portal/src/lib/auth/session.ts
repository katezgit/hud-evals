// Auth stub. Real session lookup (cookie → JWT verify, DB hydrate) is not wired yet.
// All consumers should treat the returned `Session` as the contract — only the
// implementation here is provisional.

import { redirect } from "next/navigation";

export interface Session {
  userId: string;
  email: string;
  onboarded: boolean;
  role: "user" | "admin";
}

const MOCK_SESSION: Session = {
  userId: "u_mock",
  email: "owner@example.com",
  onboarded: true,
  role: "admin",
};

// Returns the active session, or null when unauthed.
// TODO: wire real auth — read session cookie, verify, hydrate from DB.
export async function getSession(): Promise<Session | null> {
  return MOCK_SESSION;
}

// Guard for protected route group layouts. Redirects to /login when unauthed
// so the no-flash invariant holds at server-render time.
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

// TODO: wire real auth — set session cookie, sign JWT.
// The real signature takes a Session; the stub ignores it (no persistence yet).
export async function setSession(session: Session): Promise<void> {
  void session;
}
