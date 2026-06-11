"use client";

import { useState } from "react";
import type { PatternRow, PerformanceConfig } from "@/lib/mock/performance";
import { formatPct } from "@/lib/mock/performance";
import { configDotClass } from "./config-color-dot";
import { ToolSequence } from "./tool-chip";

interface CommonPatternsTableProps {
  configs: ReadonlyArray<PerformanceConfig>;
  rows: ReadonlyArray<PatternRow>;
}

export default function CommonPatternsTable({
  configs,
  rows,
}: CommonPatternsTableProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, 7);
  const hasMore = rows.length > 7;
  const b = configs[1];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-body font-semibold text-foreground">
        Common Patterns
      </h3>
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-body">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th
                scope="col"
                className="px-3 py-2 text-left text-meta font-medium uppercase tracking-wider text-muted-foreground"
              >
                PATTERN
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-2 text-right text-meta font-medium uppercase tracking-wider text-muted-foreground"
              >
                N
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-2 text-right text-meta font-medium uppercase tracking-wider text-muted-foreground"
              >
                SCORE
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-3 py-1.5">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-meta text-muted-foreground">
                      {row.id}
                    </span>
                    <ToolSequence tools={row.tools} />
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums text-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={`inline-block size-2 rounded-full ${configDotClass("A")}`}
                    />
                    {row.countA.hit}/{row.countA.total}
                    {b && row.countB && (
                      <>
                        <span aria-hidden="true" className="text-meta-foreground">
                          ·
                        </span>
                        <span
                          aria-hidden="true"
                          className={`inline-block size-2 rounded-full ${configDotClass(b.id)}`}
                        />
                        {row.countB.hit}/{row.countB.total}
                      </>
                    )}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 text-right font-mono tabular-nums text-foreground">
                  {formatPct(row.scoreA)}
                  {b && row.scoreB !== undefined && (
                    <>
                      <span className="text-meta-foreground"> / </span>
                      {formatPct(row.scoreB)}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
