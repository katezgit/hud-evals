/**
 * Training job composition fixtures — drives `/jobs/new?type=training`.
 *
 * Shape mirrors what `GET /catalog/training-models` + `GET /tasksets` would return:
 * each model row is fully self-describing for the picker (display name, provider,
 * capability strip values, fork lineage). Baseline coverage is keyed on
 * `${modelId}::${tasksetId}` so the Step 2 advisory can look up the right state
 * for any model × taskset pair without a network round-trip.
 */

export type TrainingModelKind = "user" | "base";

/**
 * Capability with explicit "unknown" — Tinker-hosted OSS checkpoints don't
 * publish reasoning metadata. Mirrors `Capability<T>` in `explore-models.ts`
 * so the picker can reuse `UnknownIndicator` from the canonical models page.
 */
export type Capability<T> = T | "unknown";

export interface TrainingModelRow {
  /** Stable ID — used for `?modelId=` URL prefill. */
  id: string;
  /** Display name shown in the row title. */
  name: string;
  /** Right-aligned monospace API slug. */
  apiSlug: string;
  /** Provider — drives the OpenAI / Anthropic / Tinker label on Review summary. */
  provider: string;
  /** "My Models" vs "Trainable Base Models" section. */
  kind: TrainingModelKind;
  /** 30d rolling token usage across the gateway (mock). Drives the numeric label. */
  usage: number;
  /** Sparkline data (7 buckets, normalized 0–1) for the Usage cell. */
  usageSparkline: ReadonlyArray<number>;
  /** Reasoning-capable. `"unknown"` → `?` indicator. */
  reasoning: Capability<boolean>;
  /**
   * Throughput in output tokens per second. `null` when the upstream provider
   * (e.g. Tinker-hosted OSS) doesn't publish throughput — renders `?` via
   * `UnknownIndicator`. Otherwise drives `SpeedBar` (numeric `t/s` + bar).
   */
  tokensPerSecond: number | null;
  /** Context window — display string (e.g. "128K"). `null` → `?` indicator. */
  context: string | null;
  /** USD per 1M input tokens. */
  priceIn: number;
  /** USD per 1M output tokens. */
  priceOut: number;
  /** Whether this checkpoint can be trained against. */
  trainable: boolean;
  /** Only for user models — base lineage. */
  forkedFrom?: string;
  /**
   * Recency signal for user-owned forks — how many trained checkpoints exist on
   * this model. Omitted for base models (only the HEAD exists). Renders as
   * `"N checkpoints"` in the picker title row.
   */
  checkpoints?: number;
}

// Deterministic pseudo-random sparkline (7 buckets, 0.2–1.0 range). Same
// generator as `explore-models.ts` so private forks visually match their base.
function spark(seed: number): ReadonlyArray<number> {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < 7; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(0.2 + (s / 233280) * 0.8);
  }
  return out;
}

export const TRAINING_MODELS: ReadonlyArray<TrainingModelRow> = [
  {
    id: "kate-im-gpt-5-2",
    name: "Kate Im's GPT 5 (2)",
    apiSlug: "kate-im/gpt-5-v2",
    provider: "OpenAI",
    kind: "user",
    usage: 2_100,
    usageSparkline: spark(801),
    reasoning: true,
    tokensPerSecond: 55,
    context: "128K",
    priceIn: 2.5,
    priceOut: 10,
    trainable: true,
    forkedFrom: "gpt-5",
    checkpoints: 2,
  },
  {
    id: "kate-im-gpt-5-1",
    name: "Kate Im's GPT 5 (1)",
    apiSlug: "kate-im/gpt-5-v1",
    provider: "OpenAI",
    kind: "user",
    usage: 640,
    usageSparkline: spark(802),
    reasoning: true,
    tokensPerSecond: 55,
    context: "128K",
    priceIn: 2.5,
    priceOut: 10,
    trainable: true,
    forkedFrom: "gpt-5",
    checkpoints: 1,
  },

  {
    id: "gpt-5",
    name: "GPT 5",
    apiSlug: "openai/gpt-5",
    provider: "OpenAI",
    kind: "base",
    usage: 1_180_000,
    usageSparkline: spark(304),
    reasoning: true,
    tokensPerSecond: 55,
    context: "128K",
    priceIn: 1.25,
    priceOut: 10,
    trainable: true,
  },
  {
    id: "deepseek-v3-1",
    name: "Deepseek V3.1",
    apiSlug: "deepseek/v3-1",
    provider: "Tinker",
    kind: "base",
    usage: 412_000,
    usageSparkline: spark(601),
    reasoning: "unknown",
    // Tinker hosting not measured on AA → `?` in the cell.
    tokensPerSecond: null,
    context: "64K",
    priceIn: 0.27,
    priceOut: 1.1,
    trainable: true,
  },
  {
    id: "gpt-oss-120b",
    name: "Gpt Oss 120B",
    apiSlug: "openai/gpt-oss-120b",
    provider: "Tinker",
    kind: "base",
    usage: 188_000,
    usageSparkline: spark(602),
    reasoning: "unknown",
    tokensPerSecond: null,
    context: "32K",
    priceIn: 0.5,
    priceOut: 1.5,
    trainable: true,
  },
  {
    id: "qwen-2-5-14b",
    name: "Qwen 2.5 14B",
    apiSlug: "qwen/qwen-2-5-14b",
    provider: "Tinker",
    kind: "base",
    usage: 94_000,
    usageSparkline: spark(901),
    reasoning: false,
    // Qwen tokensPerSecond unpublished on AA at capture time.
    tokensPerSecond: null,
    // Context for Tinker-hosted Qwen wasn't published — keeps the `?` pattern visible.
    context: null,
    priceIn: 0.2,
    priceOut: 0.6,
    trainable: true,
  },
];

/**
 * Dataset peak for `SpeedBar` scaling — same role as `maxTokensPerSecond` in
 * `explore-models.ts`. Excludes `null` so unknowns don't drag the denominator.
 */
export const maxTrainingTokensPerSecond = TRAINING_MODELS.reduce(
  (max, m) => (m.tokensPerSecond !== null && m.tokensPerSecond > max ? m.tokensPerSecond : max),
  0,
);

export function getTrainingModel(id: string): TrainingModelRow | undefined {
  return TRAINING_MODELS.find((m) => m.id === id);
}

export type BaselineState = "evaluated" | "partial" | "none";

export interface BaselineCoverage {
  state: BaselineState;
  /** Total tasks in the taskset. */
  totalTasks: number;
  /** Tasks with at least one recorded eval run. */
  evaluatedTasks: number;
  /** Average reward 0..1 over evaluated tasks; undefined when state === "none". */
  avgReward?: number;
}

/**
 * Lookup table for (model × taskset) baseline state. Key shape:
 * `${modelId}::${tasksetId}`. Missing entries fall through to the
 * "no baseline" default so any new combination renders the safest advisory.
 */
const BASELINE_TABLE: Readonly<Record<string, BaselineCoverage>> = {
  // Default scenario from the production screenshot — no baseline yet.
  "kate-im-gpt-5-2::hud-browser": {
    state: "none",
    totalTasks: 4,
    evaluatedTasks: 0,
  },
  // Older fork has a partial run from last week.
  "kate-im-gpt-5-1::hud-browser": {
    state: "partial",
    totalTasks: 4,
    evaluatedTasks: 3,
    avgReward: 0.72,
  },
  // Base model has a full leaderboard entry.
  "gpt-5::hud-browser": {
    state: "evaluated",
    totalTasks: 4,
    evaluatedTasks: 4,
    avgReward: 0.68,
  },
};

export function getBaselineCoverage(
  modelId: string,
  tasksetId: string,
  fallbackTotalTasks: number,
): BaselineCoverage {
  const hit = BASELINE_TABLE[`${modelId}::${tasksetId}`];
  if (hit) return hit;
  return { state: "none", totalTasks: fallbackTotalTasks, evaluatedTasks: 0 };
}

export interface TrainingEstimate {
  estimatedTime: string;
  hourlyRate: string;
  estimatedCost: string;
}

/** Provider-derived training method (Decision F — not user-selectable). */
export function deriveTrainingMethod(provider: string): {
  method: string;
  via: string;
} {
  switch (provider) {
    case "OpenAI":
      return { method: "GRPO", via: "OpenAI" };
    case "Tinker":
      return { method: "GRPO", via: "Tinker" };
    case "Anthropic":
      return { method: "DPO", via: "Anthropic" };
    default:
      return { method: "GRPO", via: provider };
  }
}

/** Fixed estimate matching the production screenshot scenario. */
export function estimateTraining(): TrainingEstimate {
  return {
    estimatedTime: "~0–6 hours",
    hourlyRate: "$250.00/hr",
    estimatedCost: "~$0–$1,417",
  };
}
