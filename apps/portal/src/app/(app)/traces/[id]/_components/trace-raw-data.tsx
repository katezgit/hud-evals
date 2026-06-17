"use client";

import { useState } from "react";
import { Ban, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { CopyButton } from "@repo/ui/components/copy-button";
import { cn } from "@repo/ui/lib/cn";
import type { TraceDetail } from "@/lib/mock/trace-detail";

interface TraceDebugProps {
  trace: TraceDetail;
}

const CREATED_AT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCreatedAt(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return CREATED_AT_FORMATTER.format(parsed);
}

function formatUsd(value: number): string {
  return `$${value.toFixed(4)}`;
}

export function TraceDebug({ trace }: TraceDebugProps) {
  const toolCallSteps = trace.steps.filter((s) => s.kind === "tool_call");
  const scorePct = Math.round(trace.reward * 100);
  const outcomeLabel = outcomeLabelFor(trace.status);

  const handleInvalidate = () =>
    toast(`Trace ${trace.id} marked invalid — excluded from aggregates`);

  return (
    <div className="flex flex-col gap-2">
      <DebugAccordion title="General" defaultOpen>
        <dl className="flex flex-col gap-3">
          <DebugRow label="Trace ID">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-label text-foreground break-all">
                {trace.rawId}
              </span>
              <CopyButton value={trace.rawId} ariaLabel="Copy trace ID" />
            </div>
          </DebugRow>
          <DebugRow label="Task slug">
            <span className="font-mono text-label text-foreground">
              {trace.task.slug}
            </span>
          </DebugRow>
          <DebugRow label="Scenario">
            <span className="font-mono text-label text-foreground">
              {trace.task.scenarioId}
            </span>
          </DebugRow>
          <DebugRow label="Visibility">
            <span className="text-label text-foreground">
              {trace.visibility}
            </span>
          </DebugRow>
          <DebugRow label="Created at">
            <span className="text-label text-foreground">
              {formatCreatedAt(trace.createdAt)}
            </span>
          </DebugRow>
        </dl>
      </DebugAccordion>

      <DebugAccordion title="Raw payloads">
        <pre className="max-h-96 overflow-auto rounded-md border border-border bg-code-bg p-4 font-mono text-meta text-code-fg">
          {JSON.stringify(trace.raw, null, 2)}
        </pre>
      </DebugAccordion>

      <DebugAccordion title={`MCP calls (${toolCallSteps.length})`}>
        {toolCallSteps.length === 0 ? (
          <p className="text-body text-muted-foreground">
            No tool_call spans in this trace.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {toolCallSteps.map((s) => (
              <li
                key={s.number}
                className="flex items-center gap-3 font-mono text-label"
              >
                <span className="text-meta text-meta-foreground tabular-nums">
                  {String(s.number).padStart(2, "0")}
                </span>
                <span className="text-foreground">{s.label}</span>
              </li>
            ))}
          </ul>
        )}
      </DebugAccordion>

      <DebugAccordion title="Cost">
        <dl className="flex flex-col gap-3">
          <DebugRow label="Total cost">
            <span className="font-mono text-label text-foreground">
              {formatUsd(trace.performance.totalCost)}
            </span>
          </DebugRow>
          <DebugRow label="Inference cost">
            <span className="font-mono text-label text-foreground">
              {formatUsd(trace.performance.inferenceCost)}
            </span>
          </DebugRow>
          <DebugRow label="Environment cost">
            <span className="font-mono text-label text-foreground">
              {formatUsd(trace.performance.environmentCost)}
            </span>
          </DebugRow>
        </dl>
      </DebugAccordion>

      <DebugAccordion title="Validity">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={trace.status === "passed" ? "success" : "destructive"}
              showDot
            >
              Outcome: {outcomeLabel}
            </Badge>
            <Badge variant="neutral">Score: {scorePct}%</Badge>
            <Badge variant="success">Trace quality: Valid</Badge>
            <Badge variant="neutral">Scoring: Included</Badge>
          </div>
          <Button variant="secondary" onClick={handleInvalidate}>
            <Ban aria-hidden="true" />
            Invalidate trace
          </Button>
        </div>
      </DebugAccordion>

      <DebugAccordion title="Instance specs / Metadata">
        <dl className="flex flex-col gap-3">
          <DebugRow label="Container image">
            <span className="font-mono text-meta text-foreground break-all">
              {trace.metadata.image}
            </span>
          </DebugRow>
          <DebugRow label="Prompt">
            <pre className="max-h-72 overflow-auto rounded-md border border-border bg-muted-surface p-3 font-mono text-meta text-foreground whitespace-pre-wrap break-all">
              {trace.metadata.prompt}
            </pre>
          </DebugRow>
          <DebugRow label="Trace name">
            <span className="text-label text-foreground">
              {trace.metadata.traceName}
            </span>
          </DebugRow>
        </dl>
      </DebugAccordion>
    </div>
  );
}

function outcomeLabelFor(status: TraceDetail["status"]): string {
  if (status === "passed") return "Passed";
  if (status === "errored") return "Errored";
  return "Failed";
}

interface DebugAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function DebugAccordion({
  title,
  children,
  defaultOpen = false,
}: DebugAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="flex flex-col border-t border-border pt-3 first:border-t-0 first:pt-0"
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between gap-2 py-1 text-left",
          "text-body font-medium text-foreground hover:text-foreground/70",
        )}
      >
        <span>{title}</span>
        {open ? (
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-meta-foreground"
          />
        ) : (
          <ChevronRight
            aria-hidden="true"
            className="size-4 text-meta-foreground"
          />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-3 pb-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DebugRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-meta-foreground text-label">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
