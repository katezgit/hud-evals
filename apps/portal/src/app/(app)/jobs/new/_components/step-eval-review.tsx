"use client";

import { useId, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { Slider } from "@repo/ui/components/slider";
import { Switch } from "@repo/ui/components/switch";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { cn } from "@repo/ui/lib/cn";
import GroupSizeControl from "@/app/(app)/tasksets/[id]/_components/run-taskset/group-size-control";

export interface StepEvalReviewProps {
  modelCount: number;
  taskCount: number;
  maxSteps: number;
  onMaxStepsChange: (next: number) => void;
  groupSize: number;
  onGroupSizeChange: (next: number) => void;
  perTaskEnv: boolean;
  onPerTaskEnvChange: (next: boolean) => void;
  concurrency: number;
  onConcurrencyChange: (next: number) => void;
}

const MAX_STEPS_MIN = 1;
const MAX_STEPS_MAX = 200;
const MAX_STEPS_TICKS: ReadonlyArray<number> = [1, 10, 50, 200];

export function StepEvalReview({
  modelCount,
  taskCount,
  maxSteps,
  onMaxStepsChange,
  groupSize,
  onGroupSizeChange,
  perTaskEnv,
  onPerTaskEnvChange,
  concurrency,
  onConcurrencyChange,
}: StepEvalReviewProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const traceCount = modelCount * taskCount * groupSize;

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 pr-1">
        <MaxStepsField
          value={maxSteps}
          onChange={onMaxStepsChange}
        />

        <GroupSizeControl value={groupSize} onValueChange={onGroupSizeChange} />

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger
            className={cn(
              "group flex w-full items-center gap-2 rounded-md py-1",
              "text-caption font-medium text-foreground",
              "outline-hidden focus-visible:shadow-focus-ring",
            )}
          >
            <ChevronRightIcon
              aria-hidden="true"
              className={cn(
                "size-3.5 text-muted-foreground transition-transform duration-fast ease-out-standard",
                advancedOpen && "rotate-90",
              )}
            />
            Advanced
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-4 pt-3 pl-5">
              <PerTaskEnvToggle
                checked={perTaskEnv}
                onChange={onPerTaskEnvChange}
              />
              <ConcurrencyField
                value={concurrency}
                onChange={onConcurrencyChange}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <TraceMathFooter
          modelCount={modelCount}
          taskCount={taskCount}
          groupSize={groupSize}
          traceCount={traceCount}
        />
      </div>
    </ScrollArea>
  );
}

function MaxStepsField({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-caption font-medium text-foreground">
        Max Steps
      </label>
      <p className="text-caption text-muted-foreground">
        Maximum steps per task. Default is 15.
      </p>
      <div className="flex items-center gap-4">
        <input
          id={id}
          type="number"
          min={MAX_STEPS_MIN}
          max={MAX_STEPS_MAX}
          value={value}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            if (Number.isFinite(n)) {
              onChange(Math.max(MAX_STEPS_MIN, Math.min(MAX_STEPS_MAX, n)));
            }
          }}
          className={cn(
            "w-20 h-8 rounded-md border border-border-strong bg-background px-3",
            "font-mono tabular-nums text-body text-foreground",
            "outline-hidden focus-visible:shadow-focus-ring",
          )}
        />
        <div className="flex flex-1 flex-col gap-1">
          <Slider
            aria-label="Max steps"
            value={value}
            onValueChange={onChange}
            min={MAX_STEPS_MIN}
            max={MAX_STEPS_MAX}
            step={1}
          />
          <div className="flex justify-between text-meta tabular-nums text-meta-foreground">
            {MAX_STEPS_TICKS.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PerTaskEnvToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <label htmlFor={id} className="text-caption font-medium text-foreground">
          Per-task environment
        </label>
        <Switch id={id} checked={checked} onCheckedChange={onChange} />
      </div>
      <p className="text-meta text-muted-foreground">
        Spin up a fresh environment instance for every task.
      </p>
    </div>
  );
}

function ConcurrencyField({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <label htmlFor={id} className="text-caption font-medium text-foreground">
          Concurrency
        </label>
        <input
          id={id}
          type="number"
          min={1}
          max={200}
          value={value}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            if (Number.isFinite(n)) onChange(Math.max(1, Math.min(200, n)));
          }}
          className={cn(
            "w-20 h-8 rounded-md border border-border-strong bg-background px-3",
            "font-mono tabular-nums text-body text-foreground",
            "outline-hidden focus-visible:shadow-focus-ring",
          )}
        />
      </div>
      <p className="text-meta text-muted-foreground">
        Maximum simultaneous traces. Default 10.
      </p>
    </div>
  );
}

function TraceMathFooter({
  modelCount,
  taskCount,
  groupSize,
  traceCount,
}: {
  modelCount: number;
  taskCount: number;
  groupSize: number;
  traceCount: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-elevated-surface px-4 py-3 font-mono text-body tabular-nums">
      <span className="text-foreground">{modelCount}</span>
      <span className="text-meta-foreground">×</span>
      <span className="text-foreground">{taskCount}</span>
      <span className="text-meta-foreground">×</span>
      <span className="text-foreground">{groupSize}</span>
      <span className="text-meta-foreground">=</span>
      <span className="font-semibold text-foreground">
        {traceCount.toLocaleString()}
      </span>
      <span className="text-muted-foreground">traces</span>
    </div>
  );
}
