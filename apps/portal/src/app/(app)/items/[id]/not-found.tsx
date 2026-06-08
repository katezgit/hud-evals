import Link from "next/link";

// Resource-specific 404 — fires when notFound() is called from items/[id]/page.tsx.
// Closer than (app)/not-found.tsx so copy can reference the entity. The route's
// dynamic id is NOT available here (Next does not pass params to not-found.tsx);
// the segment-private placement is what makes the copy entity-specific.
export default function ItemNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-display">Item not found</h1>
      <p className="text-muted-foreground">
        This item isn’t available. It may have been deleted or you don’t have access.
      </p>
      <Link
        href="/items"
        className="rounded-control bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-hover"
      >
        Back to items
      </Link>
    </div>
  );
}
