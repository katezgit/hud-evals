import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth/session";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return (
    <AppShell email={session.email} name={session.name}>
      {children}
    </AppShell>
  );
}
