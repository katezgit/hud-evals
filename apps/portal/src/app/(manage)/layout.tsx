import type { ReactNode } from "react";
import ManageShell from "@/app/(manage)/_components/manage-shell";
import { requireSession } from "@/lib/auth/session";

export default async function ManageRootLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  return (
    <ManageShell email={session.email} name={session.name}>
      {children}
    </ManageShell>
  );
}
