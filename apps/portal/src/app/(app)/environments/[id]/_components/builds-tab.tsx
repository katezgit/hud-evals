"use client";

import { Box, MoreHorizontalIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
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
import { cn } from "@repo/ui/lib/cn";
import type { Build, BuildStatus } from "../_data/types";

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
            <th
              scope="col"
              className={cn(
                tableHeadVariants({ density: "compact" }),
                "normal-case tracking-normal",
              )}
            >
              Version
            </th>
            <th
              scope="col"
              className={cn(
                tableHeadVariants({ density: "compact" }),
                "normal-case tracking-normal",
              )}
            >
              Status
            </th>
            <th
              scope="col"
              className={cn(
                tableHeadVariants({ density: "compact" }),
                "normal-case tracking-normal",
              )}
            >
              Changed by
            </th>
            <th
              scope="col"
              className={cn(
                tableHeadVariants({ density: "compact" }),
                "normal-case tracking-normal",
              )}
            >
              Deployed
            </th>
            <th
              scope="col"
              className={cn(
                tableHeadVariants({ density: "compact" }),
                "w-12 text-right normal-case tracking-normal",
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
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-label font-semibold text-foreground">
            {build.version}
          </span>
          {build.isLatest && (
            <Badge variant="success" size="sm">
              LATEST
            </Badge>
          )}
        </div>
      </td>
      <td className={tableCellVariants({ density: "compact" })}>
        <BuildStatusBadge status={build.status} />
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "truncated" }),
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

function BuildStatusBadge({ status }: { status: BuildStatus }) {
  switch (status) {
    case "SUCCEEDED":
      return (
        <Badge variant="success" size="sm" showDot>
          SUCCEEDED
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" size="sm" showDot>
          FAILED
        </Badge>
      );
    case "BUILDING":
      return (
        <Badge variant="running" size="sm" showDot>
          BUILDING
        </Badge>
      );
    case "QUEUED":
      return (
        <Badge variant="neutral" size="sm">
          QUEUED
        </Badge>
      );
  }
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
