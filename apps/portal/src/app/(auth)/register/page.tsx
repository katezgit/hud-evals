import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-display">Create account</h1>
      <p className="text-muted-foreground">TODO: implement registration form.</p>
    </div>
  );
}
