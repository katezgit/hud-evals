"use client";

import { ArrowRightIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type { Scenario } from "../_data/types";

/**
 * Overview tab scenario card — orient-and-validate role.
 *
 * Whole-card click target via the `::after: inset-0` overlay pattern (same
 * trick `env-card.tsx` uses for navigation): the trailing action `<button>`
 * carries an absolute overlay sized to the `relative` article root, so a
 * click anywhere on the card fires `onLoad`. Visual chrome is minimal — name,
 * description, single text action with arrow. The boxed pill button is gone
 * to keep scenario content (not buttons) as the visual focus when the grid
 * scales to 6–20+ cards.
 *
 * Loaded state: strong border + selected-surface bg, "Loaded" text with no
 * arrow, `cursor-default`. The drawer handles missing-vars inline.
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
        "group/card relative isolate flex h-full flex-col gap-4 rounded-lg border p-4",
        "transition-colors duration-fast",
        "focus-within:border-border-strong focus-within:shadow-focus-ring",
        loaded
          ? "border-border-strong bg-selected-surface"
          : "border-border bg-panel hover:border-border-strong hover:bg-hover-surface",
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-mono text-body font-semibold text-foreground">
          {scenario.name}
        </h3>
        <p className="text-muted-foreground line-clamp-3">
          {scenario.description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onLoad(scenario)}
        aria-pressed={loaded}
        className={cn(
          "mt-auto inline-flex w-fit items-center gap-1 text-body font-medium text-primary",
          "rounded-sm outline-hidden",
          "after:absolute after:inset-0 after:rounded-lg after:content-['']",
          loaded
            ? "cursor-default"
            : "cursor-pointer group-hover/card:underline",
        )}
      >
        {loaded ? "Loaded" : "Run scenario"}
        {!loaded && <ArrowRightIcon aria-hidden="true" className="size-4" />}
      </button>
    </article>
  );
}
