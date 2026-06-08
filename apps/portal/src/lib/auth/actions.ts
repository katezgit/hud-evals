"use server";

import { redirect } from "next/navigation";
import { setSession } from "./session";

// TODO: wire real auth — validate credentials, issue session.
// FormData param is accepted by the real implementation; omitted from the stub
// signature to keep lint clean until the action is wired.
export async function signIn(): Promise<void> {
  await setSession({
    userId: "u_mock",
    email: "owner@example.com",
    onboarded: true,
    role: "admin",
  });
  redirect("/");
}

// TODO: wire real auth — clear session cookie, revoke refresh token.
export async function signOut(): Promise<void> {
  redirect("/login");
}
