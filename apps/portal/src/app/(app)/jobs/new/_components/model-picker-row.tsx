"use client";

import { CheckIcon } from "lucide-react";
import { CopyButton } from "@repo/ui/components/copy-button";
import { cn } from "@repo/ui/lib/cn";
import {
  maxTrainingTokensPerSecond,
  type TrainingModelRow,
} from "@/lib/mock/job-create";
import SpeedBar from "@/app/(app)/models/_components/speed-bar";
import UnknownIndicator from "@/app/(app)/models/_components/unknown-indicator";
import UsageSparkline from "@/app/(app)/models/_components/usage-sparkline";

export interface ModelPickerRowProps {
  model: TrainingModelRow;
  selected: boolean;
  onSelect: () => void;
}

function formatUsage(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return n.toString();
}

function formatPrice(n: number): string {
  if (Number.isInteger(n)) return `$${n}`;
  return `$${n.toFixed(n < 1 ? 2 : 1)}`;
}

export function ModelPickerRow({
  model,
  selected,
  onSelect,
}: ModelPickerRowProps) {
  // Row is `role="radio"` not `<button>` because the selected state nests a
  // CopyButton — a native `<button>` parent would be invalid HTML. Keyboard
  // semantics for the radio (Space/Enter to select) are wired manually below.
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex w-full cursor-pointer flex-col gap-3 rounded-lg border bg-card px-4 py-3 text-left",
        "outline-hidden transition-colors duration-fast ease-out-standard focus-visible:shadow-focus-ring",
        selected
          ? "border-primary bg-card"
          : "border-border hover:border-border-strong",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <RadioGlyph selected={selected} />
          <span className="text-body font-medium text-foreground">
            {model.name}
          </span>
          {!selected && model.checkpoints !== undefined && model.checkpoints > 0 && (
            <span className="flex items-center gap-2 text-caption text-meta-foreground">
              <span aria-hidden="true">·</span>
              <span>
                {model.checkpoints} checkpoint{model.checkpoints === 1 ? "" : "s"}
              </span>
            </span>
          )}
        </div>
        {selected && (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <span className="font-mono text-caption text-muted-foreground">
              {model.apiSlug}
            </span>
            <CopyButton
              value={model.apiSlug}
              ariaLabel={`Copy ${model.apiSlug}`}
            />
          </div>
        )}
      </div>

      <CapabilityStrip model={model} />

      {selected && model.kind === "base" && (
        <p className="text-body text-muted-foreground">
          Forks to a new private model in your catalog and trains from this base.
        </p>
      )}
    </div>
  );
}

function RadioGlyph({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-4 items-center justify-center rounded-full border-2",
        selected
          ? "border-primary bg-primary"
          : "border-border-strong bg-transparent",
      )}
    >
      {selected && (
        <CheckIcon
          className="size-2.5 text-primary-foreground"
          strokeWidth={3}
        />
      )}
    </span>
  );
}

// Five-column strip — mirrors the `/models` capability columns 1:1 in primitive
// + data shape (UsageSparkline, CheckIcon/UnknownIndicator, SpeedBar, formatted
// context, priceIn/priceOut split). Context is the only column not present on
// the models table (column-budget there); keep it here because picker rows are
// pre-decision and context window is a load-bearing tradeoff for training.
function CapabilityStrip({ model }: { model: TrainingModelRow }) {
  return (
    <dl className="grid grid-cols-5 gap-3 text-caption">
      <Cell
        label="Usage"
        value={
          <span className="inline-flex items-center gap-2">
            <UsageSparkline data={model.usageSparkline} />
            <span className="font-mono tabular-nums">{formatUsage(model.usage)}</span>
          </span>
        }
      />
      <Cell label="Reasoning" value={<ReasoningCell value={model.reasoning} />} />
      <Cell label="Speed" value={<SpeedCell tokensPerSecond={model.tokensPerSecond} />} />
      <Cell label="Context" value={<ContextCell context={model.context} />} />
      <Cell
        label="Price/M"
        value={
          <span className="font-mono tabular-nums">
            {formatPrice(model.priceIn)}
            <span className="text-meta-foreground"> / </span>
            {formatPrice(model.priceOut)}
          </span>
        }
      />
    </dl>
  );
}

function ReasoningCell({ value }: { value: TrainingModelRow["reasoning"] }) {
  if (value === "unknown") {
    return <UnknownIndicator label="Reasoning support unknown" />;
  }
  if (value) {
    return (
      <CheckIcon
        aria-label="Reasoning: yes"
        role="img"
        className="size-3.5 text-state-scored-text"
      />
    );
  }
  return (
    <span aria-label="Reasoning: no" className="text-muted-foreground">
      —
    </span>
  );
}

function SpeedCell({ tokensPerSecond }: { tokensPerSecond: number | null }) {
  if (tokensPerSecond === null) {
    return <UnknownIndicator label="Speed unknown" />;
  }
  return <SpeedBar tokensPerSecond={tokensPerSecond} max={maxTrainingTokensPerSecond} />;
}

function ContextCell({ context }: { context: string | null }) {
  if (context === null) {
    return <UnknownIndicator label="Context window unknown" />;
  }
  return <span className="font-mono tabular-nums text-foreground">{context}</span>;
}

function Cell({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-meta uppercase tracking-wider text-meta-foreground">
        {label}
      </dt>
      <dd className="text-caption text-foreground">{value}</dd>
    </div>
  );
}
