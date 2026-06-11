"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightIcon,
  ExternalLink,
  GitBranch,
  Terminal,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import type { Environment, Scenario } from "@/app/(app)/environments/[id]/_data/types";
import { DirectUseSection } from "@/app/(app)/environments/[id]/_components/direct-use-section";
import { EnvDescription } from "@/app/(app)/environments/[id]/_components/env-description";
import { useEnvVarsStore } from "@/app/(app)/environments/[id]/_components/env-vars-store";
import { OverviewScenarioCard } from "@/app/(app)/environments/[id]/_components/overview-scenario-card";
import { ToolsSection } from "@/app/(app)/environments/[id]/_components/tools-section";

export interface OverviewTabProps {
  env: Environment;
  loadedScenarioId: string | null;
  onLoadScenario: (scenario: Scenario) => void;
  onSwitchToScenariosTab: () => void;
}

const PREVIEW_CAP = 6;

export function OverviewTab({
  env,
  loadedScenarioId,
  onLoadScenario,
  onSwitchToScenariosTab,
}: OverviewTabProps) {
  const { missingRequired } = useEnvVarsStore();
  const previewScenarios = env.scenarios.slice(0, PREVIEW_CAP);
  const totalScenarios = env.scenarios.length;
  const hasOverflow = totalScenarios > PREVIEW_CAP;
  const githubUrl = env.source.startsWith("github.com/")
    ? `https://${env.source}`
    : null;

  return (
    <div className="flex flex-col gap-8">
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

      <section
        aria-labelledby="overview-about-heading"
        className="flex flex-col gap-3 scroll-mt-32"
      >
        <h2
          id="overview-about-heading"
          className="text-subtitle font-semibold text-foreground"
        >
          About
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-body">
          <dt className="text-muted-foreground">Description</dt>
          <dd className="text-foreground">
            <EnvDescription text={env.description} />
          </dd>
          <dt className="text-muted-foreground">Source</dt>
          <dd className="text-foreground">
            {githubUrl && (
              <span className="inline-flex items-center gap-1">
                <GitBranch aria-hidden="true" className="size-3.5" />
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-0.5 font-mono text-muted-foreground transition-colors hover:text-foreground"
                >
                  {env.source.replace(/^github\.com\//, "")}
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              </span>
            )}
            {!githubUrl && (
              <span className="inline-flex items-center gap-1">
                <Terminal aria-hidden="true" className="size-3.5" />
                <span>Deployed via CLI</span>
              </span>
            )}
          </dd>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="text-foreground">{env.createdAt}</dd>
        </dl>
      </section>

      {previewScenarios.length > 0 && (
        <section
          id="scenarios-section"
          aria-labelledby="overview-scenarios-heading"
          className="flex flex-col gap-3 scroll-mt-32"
        >
          <header className="flex flex-col gap-1">
            <h2
              id="overview-scenarios-heading"
              className="text-subtitle font-semibold text-foreground"
            >
              Scenarios
            </h2>
            <p className="text-label text-muted-foreground">
              Each scenario represents a specialized skill or task you can
              perform with this environment. Select one to configure and run
              it.
            </p>
          </header>

          <ul className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {previewScenarios.map((scenario) => (
              <li key={scenario.id} className="flex">
                <OverviewScenarioCard
                  scenario={scenario}
                  loaded={scenario.id === loadedScenarioId}
                  onLoad={onLoadScenario}
                />
              </li>
            ))}
          </ul>

          {hasOverflow && (
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSwitchToScenariosTab}
              >
                View all {totalScenarios} scenarios
                <ArrowRightIcon aria-hidden="true" />
              </Button>
            </div>
          )}
        </section>
      )}

      <ToolsSection tools={env.tools} />

      <DirectUseSection mcp={env.snippets.mcp} python={env.snippets.python} />
    </div>
  );
}
