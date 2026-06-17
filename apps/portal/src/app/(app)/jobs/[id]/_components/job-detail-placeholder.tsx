"use client";

import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Breadcrumb } from "@/components/shell/breadcrumb";

export function JobDetailPlaceholder({ id }: { id: string }) {
  return (
    <div className="page-shell min-h-full gap-2">
      <header className="flex flex-col gap-3 pt-2 pb-6">
        <Breadcrumb parent={{ href: "/jobs", label: "Jobs" }} current={id} />
        <div className="flex flex-col gap-1.5">
          <h1 className="truncate text-display font-semibold text-foreground">
            Job {id}
          </h1>
          <p className="text-muted-foreground">
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
