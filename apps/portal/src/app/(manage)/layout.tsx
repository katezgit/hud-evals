import { requireSession } from "@/lib/auth/session";
import { ManageShell } from "@/components/shell";

interface ManageGroupLayoutProps {
  children: React.ReactNode;
}

// (manage) group — settings chrome, gated to authed users. Per-section admin
// gates (members, billing, etc.) live in those sub-layouts/pages; this layout
// only enforces "signed in".
export default async function ManageGroupLayout({ children }: ManageGroupLayoutProps) {
  await requireSession();
  return <ManageShell>{children}</ManageShell>;
}
