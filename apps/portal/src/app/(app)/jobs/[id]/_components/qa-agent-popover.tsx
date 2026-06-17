"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ChevronDown, ClipboardCheck } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import type { JobQaAgent } from "@/lib/mock/job-detail";

interface QaAgentPopoverProps {
  /** Scope shown in the popover header ("all 2 Traces", "run_01"). */
  scope: string;
  agents: ReadonlyArray<JobQaAgent>;
  /** Render-prop for the trigger so the same popover serves both the main button and the row-level Analyze ▾ button. */
  trigger: ReactNode;
}

export function QaAgentPopover({ scope, agents, trigger }: QaAgentPopoverProps) {
  const [open, setOpen] = useState(false);

  const runAgent = (agent: JobQaAgent) => {
    setOpen(false);
    toast(
      `Running ${agent.name} on ${scope} → analysis attached to Trace${scope.includes("all") ? "s" : ""}`,
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent variant="action" align="end" className="w-[340px]">
        <div className="px-2.5 py-2 font-mono text-meta uppercase text-meta-foreground">
          Analyze {scope} with…
        </div>
        <div className="flex flex-col">
          {agents.map((agent) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => runAgent(agent)}
              className="flex flex-col gap-1 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-hover"
            >
              <span className="flex items-center gap-2 text-body font-semibold text-foreground">
                {agent.name}
                <Badge variant="success">
                  QA
                </Badge>
              </span>
              <span className="font-mono text-label text-primary">{agent.id}</span>
              <span className="text-caption leading-tight text-muted-foreground">
                {agent.description}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
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
