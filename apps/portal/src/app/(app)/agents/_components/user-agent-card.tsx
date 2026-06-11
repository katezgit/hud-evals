"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Play, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type { AgentKind, UserAgent } from "@/lib/mock/agents";

export function UserAgentCard({ agent }: { agent: UserAgent }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleUseAgent = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("inspect", agent.id);
    router.push(`/agents?${params.toString()}`, { scroll: false });
  }, [agent.id, router, searchParams]);

  const Icon = KIND_ICON[agent.kind];
  const badgeLabel = KIND_BADGE[agent.kind];
  const ctaLabel = KIND_CTA[agent.kind];

  return (
    <button
      type="button"
      onClick={handleUseAgent}
      className={cn(
        "group flex h-full w-full flex-col gap-3 rounded-lg border border-border bg-panel p-4 text-left",
        "cursor-pointer transition-colors duration-fast",
        "hover:border-border-strong",
        "focus-visible:shadow-focus-ring outline-hidden",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 flex-1 truncate font-mono text-body font-semibold text-foreground">
          {agent.name}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-meta uppercase tracking-wide text-muted-foreground">
          <Icon aria-hidden="true" className="size-3" />
          {badgeLabel}
        </span>
      </div>

      <p className="line-clamp-2 text-label text-muted-foreground">
        {agent.description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="min-w-0 truncate font-mono text-caption text-foreground">
          {agent.scenarioId}
        </span>

        <span className="shrink-0 text-caption text-muted-foreground transition-colors duration-fast group-hover:text-foreground group-hover:underline">
          {ctaLabel} →
        </span>
      </div>
    </button>
  );
}

const KIND_BADGE: Record<AgentKind, string> = {
  qa: "QA",
  automation: "AUTO",
  chat: "CHAT",
};

const KIND_ICON: Record<AgentKind, LucideIcon> = {
  qa: ShieldCheck,
  automation: Play,
  chat: MessageSquare,
};

const KIND_CTA: Record<AgentKind, string> = {
  qa: "Use QA Agent",
  automation: "Use Automation",
  chat: "Use Chat Agent",
};
