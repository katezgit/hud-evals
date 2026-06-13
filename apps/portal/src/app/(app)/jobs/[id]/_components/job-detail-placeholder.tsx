import Link from "next/link";
import { ChevronRight, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";

export function JobDetailPlaceholder({ id }: { id: string }) {
  return (
    <div className="page-shell min-h-full gap-2">
      <header className="flex flex-col gap-3 pt-2 pb-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-label tracking-normal normal-case text-muted-foreground"
        >
          <Link
            href="/jobs"
            className="rounded-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Jobs
          </Link>
          <ChevronRight aria-hidden="true" className="size-3 text-meta-foreground" />
          <span aria-current="page" className="truncate text-foreground">
            {id}
          </span>
        </nav>
        <div className="flex flex-col gap-1.5">
          <h1 className="truncate text-display font-semibold text-foreground">
            Job {id}
          </h1>
          <p className="text-body text-muted-foreground">
            Coming soon — full job detail surface lands in a follow-up.
          </p>
        </div>
      </header>

      <Alert variant="info">
        <InfoIcon aria-hidden="true" />
        <AlertTitle>Placeholder</AlertTitle>
        <AlertDescription>
          Once this lands you&apos;ll see the run trajectory, per-task trace grid,
          reward signal, and grader output. For now this is a placeholder.
        </AlertDescription>
      </Alert>
    </div>
  );
}
