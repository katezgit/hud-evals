"use client";

import { type ReactNode } from "react";
import { toast } from "sonner";
import { ChevronDown, ClipboardCheck, ShieldCheck } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import type { JobQaAgent } from "@/lib/mock/job-detail";

interface QaAgentPopoverProps {
  /** Scope shown in the menu header ("all 2 Traces", "run_01"). */
  scope: string;
  agents: ReadonlyArray<JobQaAgent>;
  /** Render-prop for the trigger so the same menu serves both the main button and the row-level Analyze ▾ button. */
  trigger: ReactNode;
}

export function QaAgentPopover({ scope, agents, trigger }: QaAgentPopoverProps) {
  const runAgent = (agent: JobQaAgent) => {
    toast(
      `Running ${agent.name} on ${scope} → analysis attached to Trace${scope.includes("all") ? "s" : ""}`,
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px]">
        <DropdownMenuLabel className="font-mono uppercase">
          Analyze {scope} with…
        </DropdownMenuLabel>
        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onSelect={() => runAgent(agent)}
            className="flex-col items-start gap-1 py-2"
          >
            <span className="flex items-center gap-2 text-body font-semibold text-foreground">
              {agent.name}
              <span className="inline-flex items-center gap-1 rounded bg-muted-surface px-1.5 py-0.5 font-mono text-meta text-muted-foreground">
                <ShieldCheck aria-hidden="true" className="size-3" />
                QA
              </span>
            </span>
            <span className="font-mono text-label text-primary">{agent.id}</span>
            <span className="text-caption leading-tight text-muted-foreground">
              {agent.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface QaAgentMainButtonProps {
  scope: string;
  agents: ReadonlyArray<JobQaAgent>;
}

export function QaAgentMainButton({ scope, agents }: QaAgentMainButtonProps) {
  return (
    <QaAgentPopover
      scope={scope}
      agents={agents}
      trigger={
        <Button variant="secondary">
          <ClipboardCheck aria-hidden="true" />
          Run Analysis
          <ChevronDown aria-hidden="true" className="text-meta-foreground" />
        </Button>
      }
    />
  );
}
