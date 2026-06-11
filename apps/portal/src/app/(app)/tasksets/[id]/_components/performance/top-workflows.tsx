"use client";

import { useState } from "react";
import type { PerformanceConfig, WorkflowEntry } from "@/lib/mock/performance";
import ConfigColorDot from "./config-color-dot";
import { ToolSequence } from "./tool-chip";

interface TopWorkflowsProps {
  configs: ReadonlyArray<PerformanceConfig>;
  workflows: ReadonlyArray<ReadonlyArray<WorkflowEntry>>;
}

export default function TopWorkflows({ configs, workflows }: TopWorkflowsProps) {
  return (
    <section
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
      aria-label="Top workflows per config"
    >
      {configs.map((c, i) => (
        <WorkflowColumn
          key={c.id}
          config={c}
          entries={workflows[i] ?? []}
        />
      ))}
    </section>
  );
}

function WorkflowColumn({
  config,
  entries,
}: {
  config: PerformanceConfig;
  entries: ReadonlyArray<WorkflowEntry>;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, 5);
  const hasMore = entries.length > 5;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-body font-semibold text-foreground">
        <ConfigColorDot id={config.id} />
        Top workflows ({config.label})
      </h3>
      <ol className="flex flex-col divide-y divide-border rounded-md border border-border bg-card">
        {visible.map((w, i) => (
          <li
            key={`${config.id}-${i}`}
            className="flex items-start gap-3 px-3 py-2"
          >
            <span className="w-10 shrink-0 text-right font-mono text-meta tabular-nums text-muted-foreground">
              {w.pct}%
            </span>
            <ToolSequence tools={w.tools} loop={w.loop} />
          </li>
        ))}
      </ol>
      {hasMore && (
        <button
          type="button"
          className="self-start text-caption text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((p) => !p)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
