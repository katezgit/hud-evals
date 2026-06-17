"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X as XIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
import type { TraceDetail, TraceStep } from "@/lib/mock/trace-detail";
import { TraceHeader } from "./trace-header";
import { nodeBgClass } from "./trace-flow";
import { TraceRightRail, type RightRailTab } from "./trace-right-rail";
import { TraceLogs } from "./trace-logs";
import { TraceDebug } from "./trace-raw-data";

type TopTab = "replay" | "logs" | "debug";

interface TraceDetailViewProps {
  trace: TraceDetail;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  if (target.closest('[role="combobox"], [role="textbox"]')) return true;
  return false;
}

function parseTimeLabelToSeconds(label: string): number {
  const parts = label.split(":");
  if (parts.length !== 2) return 0;
  const m = Number(parts[0]);
  const s = Number(parts[1]);
  return (Number.isFinite(m) ? m * 60 : 0) + (Number.isFinite(s) ? s : 0);
}

function parseDurationLabelToSeconds(label: string): number {
  const m = label.match(/^(\d+)s$/);
  return m ? Number(m[1]) : 0;
}

export function TraceDetailView({ trace }: TraceDetailViewProps) {
  const keySteps = useMemo(() => trace.steps.filter((s) => s.isKey), [trace.steps]);

  // Initial selection prefers the first suspicious key step (so pager + replay
  // land on a step the user can move from); falls back to the first key step.
  const firstSuspiciousKey = keySteps.find((s) => s.status === "suspicious");
  const initialStepNumber =
    firstSuspiciousKey?.number ?? keySteps[0]?.number ?? trace.steps[0]?.number ?? 1;

  const [selectedStepNumber, setSelectedStepNumber] =
    useState<number>(initialStepNumber);
  const [topTab, setTopTab] = useState<TopTab>("replay");
  const [rightRailTab, setRightRailTab] = useState<RightRailTab>("event");

  const selectedStep =
    trace.steps.find((s) => s.number === selectedStepNumber) ?? trace.steps[0];

  const keyIndex = keySteps.findIndex((s) => s.number === selectedStepNumber);

  // Time positioning: dots sit at (stepSeconds / totalSeconds) along the track.
  // Fallback to evenly-spaced indices when duration parse fails (total === 0).
  const totalSeconds = parseDurationLabelToSeconds(trace.durationLabel);
  const stepPct = (step: TraceStep, i: number): number => {
    if (totalSeconds === 0) {
      return (i / Math.max(keySteps.length - 1, 1)) * 100;
    }
    const raw = (parseTimeLabelToSeconds(step.timeLabel) / totalSeconds) * 100;
    return Math.min(100, Math.max(0, raw));
  };
  const selectedPct =
    keyIndex >= 0 && keySteps[keyIndex]
      ? stepPct(keySteps[keyIndex], keyIndex)
      : null;

  // Keyboard scope: window-wide on the Replay tab. Inactive tabs short-circuit
  // because topTab !== "replay" — no need to detach when switching tabs.
  useEffect(() => {
    if (topTab !== "replay") return;
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;
      const isPrev = event.key === "ArrowLeft" || event.code === "KeyJ";
      const isNext = event.key === "ArrowRight" || event.code === "KeyK";
      if (!isPrev && !isNext) return;
      const target = isPrev ? keySteps[keyIndex - 1] : keySteps[keyIndex + 1];
      if (!target) return;
      event.preventDefault();
      setSelectedStepNumber(target.number);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [topTab, keyIndex, keySteps]);

  const handleAskAi = () => setRightRailTab("askAi");

  if (!selectedStep) return null;

  return (
    <div className="page-shell h-full min-h-0">
      <TraceHeader trace={trace} onAskAi={handleAskAi} />

      <Tabs
        value={topTab}
        onValueChange={(v) => setTopTab(v as TopTab)}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <TabsList variant="underline" className="shrink-0">
          <TabsTrigger value="replay">Replay</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent
          value="replay"
          className="flex min-h-0 flex-col gap-4"
        >
          <div className="sticky top-0 z-10 flex shrink-0 items-center gap-4 rounded-md border border-border bg-muted-surface px-3 py-3">
            <div className="flex-1 px-2">
              <div className="relative h-7 w-full">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border-strong"
                />
                {selectedPct !== null && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 h-1/2 w-px -translate-x-1/2 bg-foreground"
                    style={{ left: `${selectedPct}%` }}
                  />
                )}
                {keySteps.map((s, i) => {
                  const pct = stepPct(s, i);
                  const isSelected = s.number === selectedStepNumber;
                  return (
                    <button
                      key={s.number}
                      type="button"
                      onClick={() => setSelectedStepNumber(s.number)}
                      aria-label={`Jump to step ${s.number} — ${s.label}`}
                      aria-current={isSelected ? "step" : undefined}
                      title={`Step ${String(s.number).padStart(2, "0")} — ${s.label}`}
                      style={{ left: `${pct}%` }}
                      className={cn(
                        "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors",
                        nodeBgClass(s.status),
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isSelected &&
                          "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      )}
                    />
                  );
                })}
              </div>
            </div>

            <span className="hidden shrink-0 items-center gap-2 font-mono text-meta text-meta-foreground tabular-nums md:inline-flex">
              <span>
                {selectedStep.timeLabel} / {trace.durationLabel}
              </span>
            </span>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <EnvReplayPanel trace={trace} step={selectedStep} />
            <TraceRightRail
              step={selectedStep}
              tab={rightRailTab}
              onTabChange={setRightRailTab}
            />
          </div>
        </TabsContent>

        <TabsContent value="logs" className="min-h-0 overflow-y-auto">
          <TraceLogs trace={trace} />
        </TabsContent>

        <TabsContent value="debug" className="min-h-0 overflow-y-auto">
          <TraceDebug trace={trace} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface EnvReplayPanelProps {
  trace: TraceDetail;
  step: TraceStep;
}

function resolveReplayStep(
  steps: ReadonlyArray<TraceStep>,
  selectedNumber: number,
): TraceStep | null {
  const ordered = [...steps].sort((a, b) => b.number - a.number);
  for (const s of ordered) {
    if (s.number <= selectedNumber && s.observationUrl) return s;
  }
  for (const s of steps) {
    if (s.observationUrl) return s;
  }
  return null;
}

function scoreVariant(reward: number): "success" | "warning" | "destructive" {
  if (reward >= 0.7) return "success";
  if (reward >= 0.4) return "warning";
  return "destructive";
}

function EnvReplayPanel({ trace, step }: EnvReplayPanelProps) {
  const isSetup = step.kind === "setup";
  const isFinal = step.kind === "final";
  const isMarker = isSetup || isFinal;

  const frameStep = isMarker ? null : resolveReplayStep(trace.steps, step.number);

  return (
    <section className="flex min-h-0 min-w-0 flex-col rounded-md border border-border bg-panel">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-2">
        <span className="min-w-0 truncate text-body text-foreground">
          <span className="font-medium">
            Step {String(step.number).padStart(2, "0")}
          </span>
          <span className="text-meta-foreground"> — {step.label}</span>
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {isSetup && (
          <div className="rounded-md border border-border bg-muted-surface p-4">
            <div className="flex items-center gap-2">
              <Check
                aria-hidden="true"
                className="size-4 shrink-0 text-state-scored"
              />
              <span className="text-body text-foreground">
                <span className="text-meta-foreground">Setup complete · </span>
                <span className="font-mono">{trace.task.scenarioId}</span>
              </span>
            </div>
            <p className="mt-2 text-body text-foreground">
              {trace.task.promptTitle}
            </p>
          </div>
        )}

        {isFinal && (
          <div className="rounded-md border border-border bg-muted-surface p-4">
            <div className="flex items-center gap-2">
              {trace.status === "passed" ? (
                <Check
                  aria-hidden="true"
                  className="size-4 shrink-0 text-state-scored"
                />
              ) : (
                <XIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-state-errored"
                />
              )}
              <span className="text-body text-foreground">
                <span className="text-meta-foreground">
                  Evaluation complete ·{" "}
                </span>
                <span className="font-mono">{trace.task.scenarioId}</span>
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {trace.status === "errored" ? (
                <Badge variant="destructive" showDot>
                  Score —
                </Badge>
              ) : (
                <Badge variant={scoreVariant(trace.reward)} showDot>
                  Score {Math.round(trace.reward * 100)}%
                </Badge>
              )}
              {step.summary && (
                <p className="text-body text-muted-foreground">{step.summary}</p>
              )}
            </div>
          </div>
        )}

        {!isMarker && (
          <div className="overflow-hidden rounded-md border border-border bg-muted-surface">
            <div className="flex items-center gap-1.5 border-b border-border bg-secondary-surface px-3 py-1.5">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-border-strong"
              />
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-border-strong"
              />
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-border-strong"
              />
              <span className="ml-2 truncate font-mono text-meta text-meta-foreground">
                {trace.context.environment.label}
              </span>
            </div>
            {frameStep ? (
              // next/image is not configured for the supabase host; raw <img>
              // matches the demo-mock policy used elsewhere on this page.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={frameStep.observationUrl}
                alt={`Replay frame after step ${frameStep.number}`}
                className="block w-full object-contain"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-body text-muted-foreground">
                No replay frame for this step.
              </div>
            )}
          </div>
        )}

        {!isMarker && frameStep && (
          <p className="rounded-md border border-state-running bg-alert-info-bg px-3 py-2 text-label text-foreground">
            <span className="text-meta-foreground">Selected frame:</span>{" "}
            <span className="font-medium">
              after Step {frameStep.number}
            </span>
            {frameStep.summary && (
              <>
                <span className="text-meta-foreground"> — </span>
                <span>{frameStep.summary}</span>
              </>
            )}
          </p>
        )}
      </div>
    </section>
  );
}
