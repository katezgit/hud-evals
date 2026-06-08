import Link from "next/link";

interface ManageShellProps {
  children: React.ReactNode;
}

// ManageShell — settings chrome ("configuring the workspace" mode).
// Separate from AppShell so the sidebar can reflect a settings IA (profile,
// members, billing, …) without polluting the operations nav.
export function ManageShell({ children }: ManageShellProps) {
  return (
    <div className="grid min-h-dvh grid-cols-[240px_1fr] grid-rows-[56px_1fr] bg-background text-foreground">
      <header className="col-span-2 flex items-center gap-4 border-b border-border px-6">
        <Link href="/" aria-label="Back to app" className="focus-inset rounded-control">
          <span className="font-semibold">Portal</span>
        </Link>
        <span className="text-meta-foreground">Manage</span>
      </header>
      <nav aria-label="Settings" className="border-r border-border px-3 py-4">
        <ul className="flex flex-col gap-1 text-muted-foreground">
          <li>
            <Link href="/manage/profile" className="block rounded-control px-3 py-1.5 hover:bg-hover">
              Profile
            </Link>
          </li>
        </ul>
      </nav>
      <main className="overflow-auto p-6">{children}</main>
    </div>
  );
}
