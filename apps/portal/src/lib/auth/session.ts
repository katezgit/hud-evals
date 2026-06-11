import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = {
  email: string;
  name: string;
  signedInAt: string;
};

const COOKIE_NAME = "portal_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function encode(session: Session): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64");
}

function decode(raw: string): Session | null {
  try {
    const json = Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(json) as Partial<Session>;
    if (
      typeof parsed.email === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.signedInAt === "string"
    ) {
      return {
        email: parsed.email,
        name: parsed.name,
        signedInAt: parsed.signedInAt,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decode(raw);
}

export async function setSession(session: Session): Promise<void> {
  const store = await cookies();
  // eslint-disable-next-line turbo/no-undeclared-env-vars -- NODE_ENV is Next.js-provided
  const isProd = process.env.NODE_ENV === "production";
  store.set(COOKIE_NAME, encode(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
