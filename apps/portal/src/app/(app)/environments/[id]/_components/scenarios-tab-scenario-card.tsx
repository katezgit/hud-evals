"use client";

import { useState } from "react";
import { ArrowRightIcon, Braces, Code2 } from "lucide-react";
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
 * schema/source blocks.
 *
 * Action footer (stacked text-links, equal weight): "Create Task →" and "Run
 * Evaluation →" sit one above the other as quiet text-links. No filled primary
 * button, no card-wide click overlay — the card is a passive info container,
 * and the user picks the action deliberately.
 *
 * Loaded state (this scenario's run-evaluation drawer is open):
 *  - Run Evaluation collapses to a muted "Loaded" label, no arrow,
 *    cursor-default — matches OverviewScenarioCard's text-link loaded state.
 *  - Create Task remains enabled — authoring a Task definition is independent
 *    of whether the run drawer is open.
 *  - Card frame mirrors OverviewScenarioCard's loaded treatment exactly:
 *    `border-border-strong` + `bg-selected-surface`, so a card in either
 *    surface reads identically when it's the active "loaded" target.
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

  const handleCreateTask = () => {
    // End-to-end Create Task flow is out of scope for this refinement; the
    // visual contract (primary slot on every card) is the deliverable. Wire
    // to the real flow when it lands.
    // TODO: wire create-task flow
    console.log("create task for scenario:", scenario.id);
  };

  return (
    <article
      aria-current={loaded ? "true" : undefined}
      className={cn(
        "group/card relative isolate flex h-full w-full flex-col gap-3 rounded-lg border p-4",
        "transition-colors duration-fast",
        "focus-within:border-border-strong focus-within:shadow-focus-ring",
        loaded
          ? "border-border-strong bg-selected-surface"
          : "border-border bg-panel hover:border-border-strong hover:bg-hover-surface",
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <h3 className="font-mono text-body font-semibold truncate text-foreground">
          {scenario.name}
        </h3>
        <div className="relative z-10 flex shrink-0 items-center gap-1">
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

      <p className="text-muted-foreground line-clamp-2">
        {scenario.description}
      </p>

      {schemaOpen && scenario.schema.length > 0 && (
        <div className="relative z-10">
          <SchemaBlock entries={scenario.schema} />
        </div>
      )}

      {sourceOpen && (
        <div className="relative z-10">
          <SourceBlock scenario={scenario} />
        </div>
      )}

      <footer className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={handleCreateTask}
          className={cn(
            "relative z-10 inline-flex w-fit items-center gap-1 text-body font-medium",
            "rounded-sm outline-hidden focus-visible:shadow-focus-ring",
            "cursor-pointer text-primary hover:underline",
          )}
        >
          Create Task
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onLoad(scenario)}
          disabled={loaded}
          aria-pressed={loaded}
          className={cn(
            "relative z-10 inline-flex w-fit items-center gap-1 text-body font-medium",
            "rounded-sm outline-hidden focus-visible:shadow-focus-ring",
            loaded
              ? "cursor-default text-muted-foreground"
              : "cursor-pointer text-primary hover:underline",
          )}
        >
          {loaded ? "Loaded" : "Run Evaluation"}
          {!loaded && <ArrowRightIcon aria-hidden="true" className="size-4" />}
        </button>
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
