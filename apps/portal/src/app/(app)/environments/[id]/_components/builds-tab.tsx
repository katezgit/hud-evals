"use client";

import {
  Box,
  ClipboardList,
  FileText,
  MoreHorizontalIcon,
  Wrench,
} from "lucide-react";
import { CodeBlock } from "@repo/ui/components/code-block";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { Build, BuildChanges, BuildStatus } from "../_data/types";

export interface BuildsTabProps {
  builds: ReadonlyArray<Build>;
}

export function BuildsTab({ builds }: BuildsTabProps) {
  if (builds.length === 0) return <BuildsEmptyState />;

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className={tableClass}>
        <thead className={tableHeaderClass}>
          <tr>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Version
            </th>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Changes
            </th>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Status
            </th>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Changed by
            </th>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Deployed
            </th>
            <th
              scope="col"
              className={cn(
                tableHeadVariants({ density: "compact" }),
                "w-12 text-right",
              )}
            >
              <span className="sr-only">Row actions</span>
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClass}>
          {builds.map((build) => (
            <BuildRow key={build.id} build={build} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BuildRow({ build }: { build: Build }) {
  return (
    <tr className={tableRowVariants({ density: "compact" })}>
      <td className={tableCellVariants({ density: "compact" })}>
        <div className="flex flex-col">
          <span className="font-mono text-label font-semibold text-foreground">
            {build.version}
          </span>
          {build.isLatest && (
            <span className="text-meta text-state-scored-text">Latest</span>
          )}
        </div>
      </td>
      <td className={tableCellVariants({ density: "compact" })}>
        <BuildChangesCell changes={build.changes} />
      </td>
      <td className={tableCellVariants({ density: "compact" })}>
        <BuildStatusBadge status={build.status} />
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact" }),
          "text-muted-foreground",
        )}
      >
        {build.changedBy}
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact" }),
          "text-label text-muted-foreground",
        )}
      >
        {build.deployedAt}
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "row-action" }),
        )}
      >
        <BuildRowMenu status={build.status} />
      </td>
    </tr>
  );
}

const CHANGE_METRICS: ReadonlyArray<{
  key: "tools" | "scenarios" | "files";
  icon: typeof Wrench;
  label: string;
}> = [
  { key: "tools", icon: Wrench, label: "tools" },
  { key: "scenarios", icon: ClipboardList, label: "scenarios" },
  { key: "files", icon: FileText, label: "files" },
];

function BuildChangesCell({ changes }: { changes: BuildChanges | null }) {
  if (changes === null) {
    return (
      <span className="text-meta text-meta-foreground" aria-label="No changes computed yet">
        —
      </span>
    );
  }

  const cells = CHANGE_METRICS.map(({ key, icon: Icon, label }) => {
    const { display, tooltip } = formatChangeMetric(changes, key);
    return { key, Icon, label, display, tooltip };
  }).filter((c) => c.display !== null);

  if (cells.length === 0) {
    return <span className="text-meta text-meta-foreground">No changes</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="inline-flex items-center gap-2 font-mono text-meta tabular-nums text-foreground outline-hidden focus-visible:shadow-focus-ring rounded-sm"
        >
          {cells.map((c, i) => (
            <span key={c.key} className="inline-flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden="true" className="text-meta-foreground">
                  ·
                </span>
              )}
              <c.Icon
                aria-hidden="true"
                className="size-3 text-muted-foreground"
              />
              <span aria-label={`${c.tooltip}`}>{c.display}</span>
            </span>
          ))}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-0.5">
          {cells.map((c) => (
            <span key={c.key}>{c.tooltip}</span>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function formatChangeMetric(
  changes: BuildChanges,
  key: "tools" | "scenarios" | "files",
): { display: string | null; tooltip: string } {
  if (key === "files") {
    if (changes.filesChanged === 0) return { display: null, tooltip: "No files changed" };
    const noun = changes.filesChanged === 1 ? "file" : "files";
    return {
      display: `${changes.filesChanged} ${noun}`,
      tooltip: `${changes.filesChanged} ${noun} changed`,
    };
  }
  const added = key === "tools" ? changes.toolsAdded : changes.scenariosAdded;
  const removed = key === "tools" ? changes.toolsRemoved : changes.scenariosRemoved;
  const noun = key === "tools" ? "tool" : "scenario";
  if (added === 0 && removed === 0) {
    return { display: null, tooltip: `No ${noun}s changed` };
  }
  let display: string;
  if (added > 0 && removed === 0) {
    display = `+${added} ${added === 1 ? noun : `${noun}s`}`;
  } else if (added === 0 && removed > 0) {
    display = `−${removed} ${removed === 1 ? noun : `${noun}s`}`;
  } else {
    // Both add and remove non-zero — total ≥ 2, always plural
    display = `+${added} −${removed} ${noun}s`;
  }
  const tooltipParts: Array<string> = [];
  if (added > 0) tooltipParts.push(`${added} ${noun}${added === 1 ? "" : "s"} added`);
  if (removed > 0) tooltipParts.push(`${removed} ${noun}${removed === 1 ? "" : "s"} removed`);
  return { display, tooltip: tooltipParts.join(", ") };
}

const STATUS_PRESENTATION: Record<
  BuildStatus,
  { dotClass: string; label: string }
> = {
  SUCCEEDED: { dotClass: "bg-state-scored", label: "Succeeded" },
  FAILED: { dotClass: "bg-state-errored", label: "Failed" },
  BUILDING: {
    dotClass: "animate-running-pulse bg-state-running",
    label: "Building",
  },
  QUEUED: { dotClass: "bg-muted-foreground", label: "Queued" },
};

function BuildStatusBadge({ status }: { status: BuildStatus }) {
  const { dotClass, label } = STATUS_PRESENTATION[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-label text-foreground">
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", dotClass)}
      />
      <span>{label}</span>
    </span>
  );
}

function BuildRowMenu({ status }: { status: BuildStatus }) {
  const inFlight = status === "BUILDING" || status === "QUEUED";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Build options"
          type="button"
        >
          <MoreHorizontalIcon aria-hidden="true" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => {}}>View logs</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => {}} disabled={inFlight}>
          Rebuild
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => {}} disabled={inFlight}>
          Set as latest
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BuildsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <EmptyState
        variant="zero-state"
        icon={Box}
        title="No builds yet"
        subtitle="Push your first build from the CLI:"
      />
      <div className="w-full max-w-md">
        <CodeBlock variant="block" language="bash" code="hud deploy" />
      </div>
    </div>
  );
}
