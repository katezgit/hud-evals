"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface TraceErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function truncate(message: string, max = 200): string {
  return message.length > max ? `${message.slice(0, max)}…` : message;
}

export default function TraceError({ error, reset }: TraceErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  let detail: string | null = null;
  if (error.digest) {
    detail = `Reference: ${error.digest}`;
  } else if (error.message) {
    detail = truncate(error.message);
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-md border border-border bg-panel p-8 text-center">
        <AlertOctagon
          aria-hidden="true"
          className="size-12 text-state-errored"
        />

        <h1 className="text-subtitle font-semibold text-foreground">
          Failed to load this trace
        </h1>

        <p className="text-body text-muted-foreground">
          Something went wrong while fetching this trace. Try again in a moment,
          or head back to the traces list.
        </p>

        {detail && (
          <span className="inline-block rounded-sm bg-muted-surface px-2 py-1 font-mono text-meta text-meta-foreground">
            {detail}
          </span>
        )}

        <div className="mt-2 flex flex-row gap-2">
          <Button type="button" variant="primary" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            Try again
          </Button>
          <Button asChild variant="ghost">
            <Link href="/traces">Back to Traces</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
