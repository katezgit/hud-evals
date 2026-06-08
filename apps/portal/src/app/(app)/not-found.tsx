import Link from "next/link";

// Universal authed 404 — fires when notFound() is called under (app) and no
// closer handler matches. Resource-specific 404s (entity deleted, wrong
// workspace) live next to the detail route, e.g. items/[id]/not-found.tsx.
export default function AppNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-display">Not found</h1>
      <p className="text-muted-foreground">The page you’re looking for doesn’t exist.</p>
      <Link
        href="/"
        className="rounded-control bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-hover"
      >
        Go home
      </Link>
    </div>
  );
}
