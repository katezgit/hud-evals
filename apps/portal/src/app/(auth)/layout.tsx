import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted-surface p-6">
      {/* auth card cap — no token covers this width */}
      <div className="w-full max-w-[400px]">{children}</div>
    </main>
  );
}
