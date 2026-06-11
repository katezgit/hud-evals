"use client";

// Entity-detail 404 — fires when notFound() is called from items/[id]/page.tsx.
// Closer than (app)/not-found.tsx so copy references the entity. Per not-found/spec.md
// §3 entity-variant row: badge=not_found, headline=Item not found, diagnostic with id,
// primary recovery to the list view.
//
// useParams() is the only client-side need; everything else could be static.
// Spec also calls for a secondary `Go to Taskset` CTA — but in the current route
// structure items are flat (/items/[id]), not nested under tasksets. Without a
// taskset param available, the secondary CTA is not buildable here. Omitted for
// now; secondary `Go to Taskset` requires route restructure to nested
// tasksets/[id]/items/[iid]/ — out of scope for this PR.

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@repo/ui";

export default function ItemNotFound() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  return (
    <div className="flex min-h-full w-full items-center justify-center">
      <div className="flex max-w-[480px] flex-col items-center gap-6 px-6 text-center">
        <span className="inline-flex items-center rounded-md border border-border bg-muted-surface px-3 py-1.5 font-mono text-label font-medium text-muted-foreground">
          not_found
        </span>

        <h1 className="text-subtitle font-semibold text-foreground tracking-(--text-subtitle--letter-spacing)">
          Item not found
        </h1>

        <p className="line-clamp-2 max-w-[440px] text-body text-muted-foreground">
          <span className="font-mono">Item {id}</span>
          {" · deleted or superseded by a re-run"}
        </p>

        <div className="flex flex-row gap-3">
          <Button asChild variant="primary">
            <Link href="/items">Go to Items</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
