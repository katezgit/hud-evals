"use client";

import { CopyButton } from "@repo/ui/components/copy-button";
import type { Log } from "../_data/types";

export function LogExpandPanel({ log }: { log: Log }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section aria-label="Input">
        <PanelHeader label="Input">
          <CopyButton
            value={log.input}
            ariaLabel="Copy input"
            className="shrink-0"
          />
        </PanelHeader>
        <pre className="mt-2 max-h-80 overflow-auto rounded-md border border-border bg-background px-3 py-2 font-mono text-code text-foreground whitespace-pre-wrap">
          {log.input}
        </pre>
      </section>
      <section aria-label="Output">
        <PanelHeader label="Output">
          {log.output === null ? (
            <CopyButton
              value=""
              disabled
              ariaLabel="No output to copy"
              tooltipLabel="No output to copy"
              className="shrink-0"
            />
          ) : (
            <CopyButton
              value={log.output}
              ariaLabel="Copy output"
              className="shrink-0"
            />
          )}
        </PanelHeader>
        {log.output === null ? (
          <p className="mt-2 italic text-muted-foreground">empty</p>
        ) : (
          <pre className="mt-2 max-h-80 overflow-auto rounded-md border border-border bg-background px-3 py-2 font-mono text-code text-foreground whitespace-pre-wrap">
            {log.output}
          </pre>
        )}
      </section>
    </div>
  );
}

function PanelHeader({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-label font-medium uppercase tracking-[0.01em] text-muted-foreground">
        {label}
      </h3>
      {children}
    </div>
  );
}
