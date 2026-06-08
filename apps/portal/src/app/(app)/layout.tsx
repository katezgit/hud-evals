import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { AppShell } from "@/components/shell";

interface AppLayoutProps {
  children: React.ReactNode;
}

// (app) group — operations chrome, gated to authed + onboarded users.
// Reverse direction of the onboarding gate: send not-onboarded users to /step
// so the two layouts together guarantee a user lands in exactly one group.
export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await requireSession();
  if (!session.onboarded) redirect("/step");

  return <AppShell>{children}</AppShell>;
}
