"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Play, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type { AgentKind, UserAgent } from "@/lib/mock/agents";

export function UserAgentCard({
  agent,
  selected = false,
}: {
  agent: UserAgent;
  selected?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleUseAgent = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("inspect", agent.id);
    router.push(`/agents?${params.toString()}`, { scroll: false });
  }, [agent.id, router, searchParams]);

  const Icon = KIND_ICON[agent.kind];
  const badgeLabel = KIND_BADGE[agent.kind];

  return (
    <button
      type="button"
      onClick={handleUseAgent}
      className={cn(
        "group flex h-full w-full flex-col gap-3 rounded-lg border p-4 text-left",
        "cursor-pointer transition-colors duration-fast",
        "hover:border-border-strong hover:bg-hover-surface",
        "focus-visible:shadow-focus-ring outline-hidden",
        selected ? "border-border-strong bg-selected-surface" : "border-border bg-panel",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 flex-1 truncate font-mono text-body font-semibold text-foreground">
          {agent.name}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-muted-surface px-1.5 py-0.5 font-mono text-meta text-muted-foreground">
          <Icon aria-hidden="true" className="size-3" />
          {badgeLabel}
        </span>
      </div>

      <p className="line-clamp-2 text-body text-muted-foreground">
        {agent.description}
      </p>

      <div className="mt-auto flex items-center justify-end pt-2">
        <span className="shrink-0 rounded px-1.5 py-0.5 text-caption text-muted-foreground transition-colors duration-fast group-hover:bg-primary group-hover:text-primary-foreground">
          Use this agent →
        </span>
      </div>
    </button>
  );
}

const KIND_BADGE: Record<AgentKind, string> = {
  qa: "QA",
  automation: "Automation",
  chat: "Chat",
};

const KIND_ICON: Record<AgentKind, LucideIcon> = {
  qa: ShieldCheck,
  automation: Play,
  chat: MessageSquare,
};
