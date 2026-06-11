"use client";

import { MoreHorizontalIcon, Server } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { CodeBlock } from "@repo/ui/components/code-block";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Instance, InstanceStatus } from "../_data/types";

export interface InstancesTabProps {
  envId: string;
  instances: ReadonlyArray<Instance>;
}

export function InstancesTab({ envId, instances }: InstancesTabProps) {
  if (instances.length === 0) return <InstancesEmptyState envId={envId} />;

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className={tableClass}>
        <thead className={tableHeaderClass}>
          <tr>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Instance ID
            </th>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Status
            </th>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Model / Agent
            </th>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Started
            </th>
            <th scope="col" className={tableHeadVariants({ density: "compact" })}>
              Duration
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
          {instances.map((inst) => (
            <InstanceRow key={inst.id} instance={inst} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InstanceRow({ instance }: { instance: Instance }) {
  return (
    <tr className={tableRowVariants({ density: "compact" })}>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "mono" }),
          "text-foreground",
        )}
      >
        {instance.id}
      </td>
      <td className={tableCellVariants({ density: "compact" })}>
        <InstanceStatusBadge status={instance.status} />
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "mono" }),
          "text-muted-foreground",
        )}
      >
        {instance.modelOrAgent}
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact" }),
          "text-label text-muted-foreground",
        )}
      >
        {instance.startedAt}
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "mono" }),
          "text-muted-foreground",
        )}
      >
        {instance.duration}
      </td>
      <td
        className={cn(
          tableCellVariants({ density: "compact", variant: "row-action" }),
        )}
      >
        <InstanceRowMenu status={instance.status} />
      </td>
    </tr>
  );
}

function InstanceStatusBadge({ status }: { status: InstanceStatus }) {
  switch (status) {
    case "running":
      return (
        <Badge variant="running" size="sm" showDot>
          RUNNING
        </Badge>
      );
    case "idle":
      return (
        <Badge variant="warning" size="sm" showDot>
          IDLE
        </Badge>
      );
    case "terminated":
      return (
        <Badge variant="neutral" size="sm">
          TERMINATED
        </Badge>
      );
  }
}

function InstanceRowMenu({ status }: { status: InstanceStatus }) {
  const terminated = status === "terminated";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Instance options"
          type="button"
        >
          <MoreHorizontalIcon aria-hidden="true" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => {}}>View trace</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => {}} disabled={terminated}>
          Terminate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InstancesEmptyState({ envId }: { envId: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <EmptyState
        variant="zero-state"
        icon={Server}
        title="No active instances"
        subtitle="Spin up an instance via the CLI:"
      />
      <div className="w-full max-w-md">
        <CodeBlock
          variant="block"
          language="bash"
          code={`hud env run ${envId}`}
        />
      </div>
    </div>
  );
}
