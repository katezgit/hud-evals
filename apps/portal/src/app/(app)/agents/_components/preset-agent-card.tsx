"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type { PresetAgent } from "@/lib/mock/agents";

export function PresetAgentCard({
  agent,
  selected = false,
}: {
  agent: PresetAgent;
  selected?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleUseAgent = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("inspect", agent.id);
    // pushState — adds to history so back-button closes the dialog naturally.
    router.push(`/agents?${params.toString()}`, { scroll: false });
  }, [agent.id, router, searchParams]);

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
        <span className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center rounded bg-primary-soft px-1.5 py-0.5 font-mono text-meta text-primary">
            Built-in
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-muted-surface px-1.5 py-0.5 font-mono text-meta text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="size-3" />
            QA
          </span>
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
