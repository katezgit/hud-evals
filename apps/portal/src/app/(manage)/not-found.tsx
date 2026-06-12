"use client";

// Universal 404 for the manage (settings) group. User came from settings context,
// so recovery keeps them there — primary CTA anchors to /manage, not /jobs.
// Per not-found/spec.md §2 universal row.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@repo/ui";

export default function ManageNotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const diagnostic =
    pathname.length > 80 ? `${pathname.slice(0, 80)}…` : pathname;

  return (
    <div className="flex min-h-full w-full items-center justify-center py-12">
      <div className="flex max-w-[480px] flex-col items-center gap-4 px-6 text-center">
        <span className="inline-flex items-center rounded-md border border-border bg-muted-surface px-3 py-1.5 font-mono text-label font-medium text-muted-foreground">
          404
        </span>

        <h1 className="text-subtitle font-semibold text-foreground tracking-(--text-subtitle--letter-spacing)">
          Page not found
        </h1>

        <p className="line-clamp-2 max-w-[440px] font-mono text-body text-muted-foreground">
          {diagnostic}
        </p>

        <div className="flex flex-row gap-2">
          <Button asChild variant="primary">
            <Link href="/">Go home</Link>
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
