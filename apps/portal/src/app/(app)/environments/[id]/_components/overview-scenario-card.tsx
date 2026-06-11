"use client";

import { ArrowRightIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/cn";
import type { Scenario } from "../_data/types";

/**
 * Overview tab scenario card — orient-and-validate role.
 *
 * Light surface: name, one-line description, "Load this scenario →" CTA. The
 * button is always enabled regardless of env-var state; the drawer handles
 * missing-vars inline. When this scenario's drawer is open, the card switches
 * to the "Loaded" state — darker border + "Loaded" CTA — and reverts the
 * moment the drawer is dismissed. No schema preview, kebab menu, or "Used by"
 * footer — those affordances are exclusive to the Scenarios tab.
 *
 * Sibling: ScenariosTabScenarioCard (full compose surface).
 */
export interface OverviewScenarioCardProps {
  scenario: Scenario;
  /** True when this scenario's drawer is currently open. */
  loaded: boolean;
  onLoad: (scenario: Scenario) => void;
}

export function OverviewScenarioCard({
  scenario,
  loaded,
  onLoad,
}: OverviewScenarioCardProps) {
  return (
    <article
      aria-current={loaded ? "true" : undefined}
      className={cn(
        "group/card flex h-full flex-col gap-3 rounded-lg border bg-panel p-4",
        "transition-shadow hover:shadow-(--shadow-card)",
        loaded ? "border-foreground" : "border-border",
      )}
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="font-mono text-body font-semibold text-foreground">
          {scenario.name}
        </h3>
        <p className="text-label text-muted-foreground line-clamp-3">
          {scenario.description}
        </p>
      </div>

      <div className="mt-auto">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onLoad(scenario)}
          aria-pressed={loaded}
        >
          {loaded ? "Loaded" : "Load this scenario"}
          {!loaded && <ArrowRightIcon aria-hidden="true" />}
        </Button>
      </div>
    </article>
  );
}
