"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@repo/ui/components/button";

export default function TraceNotFound() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-6 px-6 text-center">
        <span className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-1.5 font-mono text-label font-medium text-muted-foreground">
          404 · trace_not_found
        </span>

        <h1 className="text-subtitle font-semibold text-foreground">
          Trace not found
        </h1>

        <p className="line-clamp-2 max-w-md text-body text-muted-foreground">
          <span className="font-mono">Trace {id}</span> · invalidated, deleted, or outside this workspace
        </p>

        <div className="flex flex-row gap-3">
          <Button asChild variant="primary">
            <Link href="/traces">Back to Traces</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
