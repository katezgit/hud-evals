"use client";

import Link from "next/link";
import { AlertTriangle, PlusIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import type { Environment, Scenario } from "../_data/types";
import { useEnvVarsStore } from "./env-vars-store";
import { ScenariosTabScenarioCard } from "./scenarios-tab-scenario-card";

export interface ScenariosTabProps {
  env: Environment;
  /** Scenario whose drawer is currently open — drives the "Loaded" card state. */
  loadedScenarioId: string | null;
  onLoadScenario: (scenario: Scenario) => void;
}

export function ScenariosTab({
  env,
  loadedScenarioId,
  onLoadScenario,
}: ScenariosTabProps) {
  const { missingRequired } = useEnvVarsStore();

  if (env.scenarios.length === 0) {
    return <ScenariosEmptyState />;
  }

  return (
    <div className="flex flex-col gap-4">
      {missingRequired.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-state-warning/40 bg-state-warning-subtle p-3">
          <AlertTriangle
            aria-hidden="true"
            className="size-4 shrink-0 text-state-warning"
          />
          <div className="flex flex-1 flex-col gap-1 text-label">
            <span className="font-medium text-foreground">
              This env needs setup before scenarios can run.
            </span>
            <span className="text-muted-foreground">
              Missing required env vars:{" "}
              <span className="font-mono text-foreground">
                {missingRequired.join(", ")}
              </span>
            </span>
            <Link
              href={`/environments/${env.id}?tab=settings`}
              className="w-fit text-primary hover:underline"
            >
              Configure in Settings →
            </Link>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between gap-3">
        <h2 className="text-subtitle font-semibold text-foreground">
          Scenarios{" "}
          <span className="text-muted-foreground tabular-nums">
            ({env.scenarios.length})
          </span>
        </h2>
        <Button variant="secondary" size="sm" type="button">
          <PlusIcon aria-hidden="true" />
          Create Scenario
        </Button>
      </header>
      <p className="text-label text-muted-foreground">
        Each scenario represents a specialized skill or task you can perform
        with this environment. Select one to configure and run it.
      </p>

      <ul className="grid gap-3 grid-cols-1 md:grid-cols-2">
        {env.scenarios.map((scenario) => (
          <li key={scenario.id} className="flex">
            <ScenariosTabScenarioCard
              scenario={scenario}
              loaded={scenario.id === loadedScenarioId}
              onLoad={onLoadScenario}
            />
          </li>
        ))}
      </ul>

      <div>
        <Button variant="secondary" size="sm" type="button">
          <PlusIcon aria-hidden="true" />
          Create Task
        </Button>
      </div>
    </div>
  );
}

function ScenariosEmptyState() {
  return (
    <div className="flex flex-col items-start gap-4 py-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-subtitle font-semibold text-foreground">
          No Scenarios yet.
        </h2>
        <p className="text-label text-muted-foreground">
          Add Scenarios using the{" "}
          <code className="font-mono text-meta rounded bg-muted-surface px-1 py-0.5 text-foreground">
            @env.scenario
          </code>{" "}
          decorator, then redeploy.
        </p>
      </div>
      <div className="flex w-full max-w-md items-center gap-2 rounded-md border border-border bg-card px-3 py-2 font-mono text-meta text-foreground">
        <span className="flex-1">hud deploy</span>
        <CopyButton value="hud deploy" ariaLabel="Copy hud deploy command" />
      </div>
      <a
        href="https://docs.hud.ai/scenarios"
        target="_blank"
        rel="noreferrer noopener"
        className="text-label text-primary hover:underline"
      >
        Read the docs →
      </a>
    </div>
  );
}
