"use client";

import { useState } from "react";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";
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
        <table className={tableClass}>
          <thead className={tableHeaderClass}>
            <tr>
              <th scope="col" className={tableHeadVariants({ density: "compact" })}>
                Pattern
              </th>
              <th
                scope="col"
                className={tableHeadVariants({ density: "compact", numeric: true })}
              >
                N
              </th>
              <th
                scope="col"
                className={tableHeadVariants({ density: "compact", numeric: true })}
              >
                Score
              </th>
            </tr>
          </thead>
          <tbody className={tableBodyClass}>
            {visible.map((row) => (
              <tr key={row.id} className={tableRowVariants({ density: "compact" })}>
                <td className={tableCellVariants({ density: "compact" })}>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-meta text-muted-foreground">
                      {row.id}
                    </span>
                    <ToolSequence tools={row.tools} />
                  </span>
                </td>
                <td
                  className={cn(
                    tableCellVariants({ density: "compact", variant: "mono" }),
                    "text-right",
                  )}
                >
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
                <td
                  className={cn(
                    tableCellVariants({ density: "compact", variant: "mono" }),
                    "text-right",
                  )}
                >
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
