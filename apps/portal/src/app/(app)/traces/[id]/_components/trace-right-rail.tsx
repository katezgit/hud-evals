"use client";

import { useState } from "react";
import { Code2, Sparkles, X as XIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import type { TraceStep, TraceStepKind } from "@/lib/mock/trace-detail";
import { AnalyzeTracePanel } from "./analyze-trace-panel";

export type RightRailTab = "event" | "askAi";

interface TraceRightRailProps {
  step: TraceStep;
  tab: RightRailTab;
  onTabChange: (tab: RightRailTab) => void;
}

export function TraceRightRail({
  step,
  tab,
  onTabChange,
}: TraceRightRailProps) {
  return (
    <aside className="flex min-h-0 min-w-0 flex-col rounded-md border border-border bg-panel">
      <Tabs
        value={tab}
        onValueChange={(v) => onTabChange(v as RightRailTab)}
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-0"
      >
        <TabsList
          variant="underline"
          className="shrink-0 border-b border-border px-4"
        >
          <TabsTrigger value="event">Trace event</TabsTrigger>
          <TabsTrigger value="askAi">Ask AI</TabsTrigger>
        </TabsList>

        <TabsContent
          value="event"
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <TraceEventPanel step={step} />
        </TabsContent>

        <TabsContent
          value="askAi"
          className="min-h-0 overflow-y-auto px-4 py-4"
        >
          <AnalyzeTracePanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
}

interface TraceEventPanelProps {
  step: TraceStep;
}

interface ToolEvent {
  toolCall: string;
  argumentsText: string;
  observation: string;
}

function deriveToolEvent(step: TraceStep): ToolEvent | null {
  const span = step.rawSpan as Record<string, unknown> | undefined;
  if (!span || typeof span !== "object") return null;

  const name = (span as { name?: string }).name;
  const attributes =
    ((span as { attributes?: Record<string, unknown> }).attributes) ?? {};
  const request = (attributes as { request?: Record<string, unknown> }).request;

  // Tool-call (mcp) span: name="tools/call.mcp", attributes.request.params.{name,arguments}.
  if (name === "tools/call.mcp" && request) {
    const params = (request as { params?: Record<string, unknown> }).params ?? {};
    const toolName =
      (params as { name?: string }).name ?? "(unknown tool)";
    const args = (params as { arguments?: unknown }).arguments ?? {};
    return {
      toolCall: String(toolName),
      argumentsText: JSON.stringify(args, null, 2),
      observation: step.outputLabel ?? "(no observation recorded)",
    };
  }

  // Inference span carries the planned tool call inside result.tool_calls[0].
  if (name === "inference.messages") {
    const result =
      ((attributes as { result?: Record<string, unknown> }).result) ?? {};
    const toolCalls =
      ((result as { tool_calls?: ReadonlyArray<Record<string, unknown>> })
        .tool_calls) ?? [];
    const first = toolCalls[0];
    if (first) {
      const fn = (first as { function?: Record<string, unknown> }).function ?? {};
      const toolName = (fn as { name?: string }).name ?? "(unknown tool)";
      const rawArgs = (fn as { arguments?: string }).arguments ?? "{}";
      let argumentsText = rawArgs;
      try {
        argumentsText = JSON.stringify(JSON.parse(rawArgs), null, 2);
      } catch {
        // Leave raw if it isn't JSON.
      }
      return {
        toolCall: String(toolName),
        argumentsText,
        observation: step.outputLabel ?? "(no observation recorded)",
      };
    }
  }

  // Setup / resource read / final — synthesize from labels.
  return {
    toolCall: name ?? "(no tool call)",
    argumentsText: step.inputLabel ?? "(no arguments)",
    observation: step.outputLabel ?? "(no observation recorded)",
  };
}

function narrationFor(step: TraceStep): string {
  // `summary` is already a full sentence written from the agent's perspective;
  // keep its casing and just frame it with the synchronization tail.
  return `${step.summary} This event is synchronized with the replay frame on the left and the timeline below.`;
}

const STEP_CHIPS = [
  "Why this step?",
  "What went wrong here?",
  "Compare to passing trace",
] as const;

type StepChip = (typeof STEP_CHIPS)[number];

interface StepChipResult {
  id: string;
  label: StepChip;
  body: string;
}

// Mock chip responses keyed on chip × step kind.
function stepChipBody(chip: StepChip, step: TraceStep): string {
  const kindFallback: Record<TraceStepKind, string> = {
    setup:
      "Setup binds the prompt template and tool registry the model will see for the rest of the rollout. Every later span resolves names and schemas against the contract this step established.",
    inference:
      "The model is choosing the next action from the latest observation. The token budget and tool-call schema both apply here, and the decision lands as a structured tool call on the next step.",
    tool_call:
      "A tool call writes to the environment. The model picked the operation, the args, and the surface — the next observation will reflect whatever this call mutated (or failed to mutate).",
    tool_result:
      "The environment is reporting back what happened. The model will treat this observation as ground truth for the next inference, so a stale or misleading result here cascades downstream.",
    final:
      "Final grader read. The reward emitted here is what aggregates into Job and Taskset numbers, so every upstream step is implicitly on the hook for this value.",
  };

  if (chip === "Why this step?") {
    if (step.status === "error") {
      return "This is the final grader read — it produced the trace's reward, which is why it's annotated as the failure anchor. The grader compared the live DOM against the expected todo list and found a mismatch, and that mismatch is the value that flowed into the Job aggregate.";
    }
    if (step.status === "suspicious") {
      return "This is the first step where the trajectory diverges from a healthy run. The model acted on a snapshot that no longer matched the live UI, and every later step inherits that stale assumption — so this is the right anchor to investigate from.";
    }
    return kindFallback[step.kind];
  }

  if (chip === "What went wrong here?") {
    if (step.status === "error") {
      return "Nothing broke at this step in isolation — the grader executed cleanly and reported reward 0. The damage is upstream: the agent never produced the state the grader was asked to check, so this read had no choice but to emit zero.";
    }
    if (step.status === "suspicious") {
      return "The model treated the post-action observation as authoritative without re-screenshotting. The cached snapshot still showed the pre-action UI, so the next click targeted an affordance that no longer existed in the live DOM. Every recovery attempt below reuses the same stale coordinates.";
    }
    if (step.kind === "tool_call") {
      return "Nothing surfaced as wrong at this step on its own. The tool call resolved with a valid response and the environment accepted the action, so any downstream failure originates from a later step rather than this one.";
    }
    return "No anomalies on this step. The span resolved cleanly and contributed expected output to the rollout; if the trace failed, the cause lives elsewhere in the trajectory.";
  }

  // Compare to passing trace.
  if (step.status === "error") {
    return "The closest passing run (trace_a91…) reaches this grader read with the requested todo present in the list, so the reward lands at 1.00 instead of 0. The structural difference is upstream — by the time the passing trace gets here, its state already matches the expected output.";
  }
  if (step.status === "suspicious") {
    return "The closest passing run re-issued an observe action before the next click, so it operated on a fresh screenshot. This trace skipped that re-observation, which is the single behavioral delta between the two runs at this point in the trajectory.";
  }
  return "The closest passing trace executes the same span with the same shape — no behavioral delta to flag at this step. Divergence between the two runs happens later in the trajectory.";
}

interface StepChipsProps {
  step: TraceStep;
}

function StepChips({ step }: StepChipsProps) {
  // Local-only state; the parent passes a `key={step.number}` so React
  // unmounts this on step change and the result list resets implicitly.
  const [results, setResults] = useState<ReadonlyArray<StepChipResult>>([]);

  const handleChip = (label: StepChip) => {
    setResults((prev) => [
      { id: `${label}-${Date.now()}`, label, body: stepChipBody(label, step) },
      ...prev,
    ]);
  };

  const handleDismiss = (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-label text-meta-foreground">Ask AI</span>
        {STEP_CHIPS.map((label) => (
          <Button
            key={label}
            variant="ghost"
            onClick={() => handleChip(label)}
          >
            <Sparkles aria-hidden="true" />
            {label}
          </Button>
        ))}
      </div>

      {results.length > 0 && (
        <div className="flex flex-col gap-3">
          {results.map((r) => (
            <Card key={r.id} variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      aria-hidden="true"
                      className="size-4 text-primary"
                    />
                    <h3 className="text-body font-medium text-foreground">
                      {r.label}
                    </h3>
                  </div>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label={`Dismiss ${r.label} result`}
                    type="button"
                    onClick={() => handleDismiss(r.id)}
                  >
                    <XIcon aria-hidden="true" />
                  </IconButton>
                </div>
                <p className="mt-2 text-body text-muted-foreground">{r.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TraceEventPanel({ step }: TraceEventPanelProps) {
  const [rawOpen, setRawOpen] = useState(false);

  const handleToggleRaw = () => setRawOpen((p) => !p);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex shrink-0 items-start justify-between gap-2 px-4 pt-4">
        <span className="text-label text-meta-foreground">
          Selected trace event
        </span>
        <button
          type="button"
          onClick={handleToggleRaw}
          className="inline-flex items-center gap-1 text-label text-muted-foreground hover:text-foreground hover:underline"
        >
          <Code2 aria-hidden="true" className="size-3.5" />
          {rawOpen ? "Show formatted" : "Show raw JSON"}
        </button>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 pt-4">
        <span className="text-body font-medium text-foreground">
          Step {step.number} · {kindLabel(step.kind)}
        </span>
      </div>

      {rawOpen ? (
        <pre className="mx-4 mt-4 mb-4 min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto rounded-md border border-border bg-code-bg p-3 font-mono text-meta text-code-fg">
          {JSON.stringify(step.rawSpan, null, 2)}
        </pre>
      ) : (
        <EventFormattedBody step={step} />
      )}
    </div>
  );
}

function EventFormattedBody({ step }: { step: TraceStep }) {
  const event = deriveToolEvent(step);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-4">
      <p className="text-body text-muted-foreground">{narrationFor(step)}</p>

      {event && (
        <div className="flex flex-col gap-3">
          <FieldBox label="Tool call" body={<code>{event.toolCall}</code>} />
          <FieldBox
            label="Arguments"
            body={
              <pre className="whitespace-pre-wrap break-all">
                {event.argumentsText}
              </pre>
            }
          />
          <FieldBox
            label="Observation"
            body={<span>{event.observation}</span>}
          />
        </div>
      )}

      {/* key by step.number — switching steps unmounts the chip subtree
          and clears its result list. */}
      <StepChips key={step.number} step={step} />
    </div>
  );
}

function FieldBox({
  label,
  body,
}: {
  label: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-muted-surface px-3 py-2">
      <p className="text-meta font-medium text-meta-foreground">{label}</p>
      <div className="mt-1 font-mono text-label text-foreground">{body}</div>
    </div>
  );
}

function kindLabel(kind: TraceStep["kind"]): string {
  if (kind === "setup") return "Setup";
  if (kind === "inference") return "Inference";
  if (kind === "tool_call") return "Tool call";
  if (kind === "tool_result") return "Tool result";
  return "Final";
}
