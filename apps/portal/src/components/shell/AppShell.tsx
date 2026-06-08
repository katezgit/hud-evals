import Link from "next/link";
import { BrandMark } from "@repo/ui/components/brand-mark";

interface AppShellProps {
  children: React.ReactNode;
}

// AppShell — operations chrome ("doing work" mode).
// Owns the operations sidebar + topbar. Nav links, avatar menu, and any
// interactive bits live in client sub-components imported here.
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="grid min-h-dvh grid-cols-[240px_1fr] grid-rows-[56px_1fr] bg-background text-foreground">
      <header className="col-span-2 flex items-center gap-4 border-b border-border px-6">
        <Link href="/" aria-label="Home" className="focus-inset rounded-control">
          <BrandMark />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {/* TODO: AppShellTopbarActions — search, user menu, theme toggle */}
        </div>
      </header>
      <nav aria-label="Primary" className="border-r border-border px-3 py-4">
        <ul className="flex flex-col gap-1 text-muted-foreground">
          <li>
            <Link href="/" className="block rounded-control px-3 py-1.5 hover:bg-hover">
              Home
            </Link>
          </li>
          <li>
            <Link href="/items" className="block rounded-control px-3 py-1.5 hover:bg-hover">
              Items
            </Link>
          </li>
        </ul>
      </nav>
      <main className="overflow-auto p-6">{children}</main>
    </div>
  );
}
