import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-display">Sign in</h1>
      <p className="text-muted-foreground">TODO: implement sign-in form.</p>
    </div>
  );
}
