"use client";

import { MessageSquare, ShieldCheck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type { AgentKind } from "@/lib/mock/agents";

interface TypeOption {
  kind: AgentKind;
  label: string;
  description: string;
  icon: LucideIcon;
}

const TYPES: ReadonlyArray<TypeOption> = [
  {
    kind: "automation",
    label: "Automation",
    description: "Save a scenario config to run on demand or from CI.",
    icon: Zap,
  },
  {
    kind: "qa",
    label: "QA Agent",
    description: "Automatic quality checks on taskset traces.",
    icon: ShieldCheck,
  },
  {
    kind: "chat",
    label: "Chat Agent",
    description: "Multi-turn conversation with environment tools.",
    icon: MessageSquare,
  },
];

interface NewAgentTypeSelectorProps {
  onSelect: (kind: AgentKind) => void;
}

export function NewAgentTypeSelector({ onSelect }: NewAgentTypeSelectorProps) {
  // Plain buttons (not a radiogroup): one click commits and transitions the
  // drawer to the next step, so the cards behave as buttons, not as a
  // persistent selection. Tab visits each card; Enter/Space activates.
  return (
    <div
      role="group"
      aria-label="Choose agent type"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {TYPES.map((t) => (
        <TypeCard key={t.kind} option={t} onSelect={() => onSelect(t.kind)} />
      ))}
    </div>
  );
}

function TypeCard({
  option,
  onSelect,
}: {
  option: TypeOption;
  onSelect: () => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex h-full flex-col items-center gap-3 rounded-lg border border-border bg-panel p-5 text-center",
        "cursor-pointer transition-colors duration-fast",
        "hover:border-border-strong hover:bg-hover-surface",
        "focus-visible:shadow-focus-ring outline-hidden",
      )}
    >
      <Icon aria-hidden="true" className="size-5 text-foreground" />
      <span className="text-body font-semibold text-foreground">
        {option.label}
      </span>
      <span className="text-label text-muted-foreground">
        {option.description}
      </span>
    </button>
  );
}
