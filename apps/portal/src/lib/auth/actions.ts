"use server";

import { redirect } from "next/navigation";
import { clearSession, setSession } from "@/lib/auth/session";
import { upsertUser } from "@/lib/auth/mock-users";

export type MagicLinkState =
  | { status: "idle" }
  | { status: "success"; email: string }
  | { status: "error"; message: string };

export type OAuthState =
  | { status: "idle" }
  | { status: "error"; message: string };

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function signInWithGithub(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- React useFormState prev-state arg; unused on success path.
  _prevState: OAuthState,
): Promise<OAuthState> {
  await delay(600);
  const user = { email: "demo-gh@hud.app", name: "Demo Researcher" };
  upsertUser(user);
  await setSession({
    ...user,
    signedInAt: new Date().toISOString(),
  });
  redirect("/");
}

export async function signInWithGoogle(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- React useFormState prev-state arg; unused on success path.
  _prevState: OAuthState,
): Promise<OAuthState> {
  await delay(600);
  const user = { email: "demo@hud.app", name: "Demo User" };
  upsertUser(user);
  await setSession({
    ...user,
    signedInAt: new Date().toISOString(),
  });
  redirect("/");
}

export async function sendMagicLink(
  _prevState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = readString(formData, "email");
  if (!email) {
    return { status: "error", message: "Enter your email address to continue." };
  }

  await delay(600);

  const name = nameFromEmail(email);
  upsertUser({ email, name });

  return { status: "success", email };
}

export async function sendMagicLinkSignup(
  _prevState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = readString(formData, "email");
  const name = readString(formData, "name");

  if (!email || !name) {
    return {
      status: "error",
      message: "Enter your name and email address to continue.",
    };
  }

  await delay(600);

  upsertUser({ email, name });

  return { status: "success", email };
}

export async function signOut(): Promise<void> {
  await clearSession();
  redirect("/login");
}
