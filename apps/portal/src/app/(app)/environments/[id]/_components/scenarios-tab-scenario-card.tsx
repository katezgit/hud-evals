"use client";

import { useState } from "react";
import { ArrowRightIcon, Braces, Code2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { Scenario, ScenarioSchemaEntry } from "../_data/types";

/**
 * Scenarios tab scenario card — taskset-authoring role.
 *
 * Header: name + schema + source-code icon toggles (top-right cluster). Both
 * toggles render a visibly pressed state when their block is open so the user
 * can tell at a glance which disclosures are active. Body: description +
 * missing-var warning + schema/source blocks. Footer: `Load this scenario →`
 * CTA, calm at rest, upgrades to primary on card hover.
 *
 * "Loaded" state mirrors OverviewScenarioCard: darker border + "Loaded" CTA
 * while this scenario's drawer is open.
 *
 * Sibling: OverviewScenarioCard (orient-and-validate surface).
 */
export interface ScenariosTabScenarioCardProps {
  scenario: Scenario;
  loaded: boolean;
  onLoad: (scenario: Scenario) => void;
}

export function ScenariosTabScenarioCard({
  scenario,
  loaded,
  onLoad,
}: ScenariosTabScenarioCardProps) {
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const schemaDisabled = scenario.schema.length === 0;

  return (
    <article
      aria-current={loaded ? "true" : undefined}
      className={cn(
        "group/card flex h-full w-full flex-col gap-3 rounded-lg border bg-panel p-4",
        "transition-shadow hover:shadow-(--shadow-card)",
        loaded ? "border-foreground" : "border-border",
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="font-mono text-body font-semibold text-foreground truncate">
          {scenario.name}
        </h3>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                aria-pressed={schemaOpen}
                aria-label={schemaOpen ? "Hide schema" : "Show schema"}
                disabled={schemaDisabled}
                onClick={() => setSchemaOpen((prev) => !prev)}
                className={cn(schemaOpen && "bg-selected-surface text-foreground")}
              >
                <Braces aria-hidden="true" />
              </IconButton>
            </TooltipTrigger>
            <TooltipContent>
              {schemaOpen ? "Hide schema" : "Show schema"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                aria-pressed={sourceOpen}
                aria-label={sourceOpen ? "Hide source code" : "Show source code"}
                onClick={() => setSourceOpen((prev) => !prev)}
                className={cn(sourceOpen && "bg-selected-surface text-foreground")}
              >
                <Code2 aria-hidden="true" />
              </IconButton>
            </TooltipTrigger>
            <TooltipContent>
              {sourceOpen ? "Hide source code" : "Show source code"}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      <p className="text-label text-muted-foreground line-clamp-2">
        {scenario.description}
      </p>

      {schemaOpen && scenario.schema.length > 0 && (
        <SchemaBlock entries={scenario.schema} />
      )}

      {sourceOpen && <SourceBlock scenario={scenario} />}

      <footer className="mt-auto flex items-center justify-end gap-2">
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
      </footer>
    </article>
  );
}

function SchemaBlock({
  entries,
}: {
  entries: ReadonlyArray<ScenarioSchemaEntry>;
}) {
  // Required first, optional after — easier to scan whether the scenario can
  // be invoked from a quick glance at the top rows.
  const required = entries.filter((e) => e.required);
  const optional = entries.filter((e) => !e.required);
  const ordered = [...required, ...optional];

  return (
    <ul
      aria-label="Scenario schema"
      className={cn(
        "flex flex-col gap-0.5 rounded-md border border-border bg-card",
        "px-3 py-2 font-mono text-meta",
      )}
    >
      {ordered.map((entry) => (
        <li key={entry.key} className="flex items-baseline gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "w-3 shrink-0 text-state-warning",
              !entry.required && "opacity-0",
            )}
          >
            *
          </span>
          <span className="text-foreground w-32 shrink-0 truncate">
            {entry.key}
          </span>
          <span className="text-muted-foreground">{renderType(entry)}</span>
        </li>
      ))}
    </ul>
  );
}

function SourceBlock({ scenario }: { scenario: Scenario }) {
  // Source mocked from the scenario's schema — the data layer has no real
  // source code yet. Matches §5a's `@env.scenario` decorator form.
  const signature = scenario.schema
    .map((field) => {
      const type = renderPythonType(field);
      const def =
        field.default !== undefined
          ? ` = ${JSON.stringify(field.default)}`
          : field.required
            ? ""
            : " = None";
      return `${field.key}: ${type}${def}`;
    })
    .join(", ");

  const code = `@env.scenario("${scenario.name.split(":").pop() ?? scenario.name}")
async def ${(scenario.name.split(":").pop() ?? scenario.name).replace(/-/g, "_")}(${signature}) -> Any:
    """${scenario.description}"""
    ...`;

  return (
    <pre
      aria-label="Scenario source code"
      className={cn(
        "max-h-64 overflow-auto rounded-md border border-border bg-card",
        "px-3 py-2 font-mono text-meta text-foreground",
      )}
    >
      <code>{code}</code>
    </pre>
  );
}

function renderType(entry: ScenarioSchemaEntry): string {
  switch (entry.type) {
    case "integer":
      return "int";
    case "boolean":
      return "bool";
    default:
      return "str";
  }
}

function renderPythonType(entry: ScenarioSchemaEntry): string {
  const base =
    entry.type === "integer"
      ? "int"
      : entry.type === "boolean"
        ? "bool"
        : "str";
  return entry.required ? base : `Optional[${base}]`;
}
