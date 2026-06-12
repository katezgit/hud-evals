/**
 * tokensPerSecond values: Artificial Analysis (https://artificialanalysis.ai),
 * captured 2026-05-31. Rows marked `AA tier estimate via <substitute>` use
 * the nearest AA-measured tier as a proxy because AA had not yet benchmarked
 * the exact model ID at capture time. `null` means not measurable / no AA data.
 */

/**
 * Public model catalog fixture — drives `/models`.
 *
 * Shape mirrors what a `GET /catalog/models` endpoint would return: each entry
 * is fully self-describing (display name, provider, model ID, price, usage,
 * capability flags). The page filters/sorts purely client-side.
 *
 * Usage numbers are realistic-but-fake; reasoning/trainable flags are seeded so
 * `Trainable (16)` and `Private (4)` chip counts match the visible table.
 */

export type ModelProvider =
  | "Anthropic"
  | "OpenAI"
  | "Gemini"
  | "xAI"
  | "OpenRouter"
  | "Tinker"
  | "Bedrock";

export type SpeedTier = "low" | "medium" | "high";

/**
 * Capability flag with explicit "unknown" — Tinker-hosted OSS checkpoints don't
 * publish reasoning/speed metadata, so we render a `?` with tooltip rather than
 * collapsing unknown into false.
 */
export type Capability<T> = T | "unknown";

export interface CatalogModel {
  /** Display name shown in the table. */
  name: string;
  /** Provider label — text column + filter key. */
  provider: ModelProvider;
  /** API model ID — monospace pill + copy target. */
  modelId: string;
  /** 30d rolling token usage across the gateway (mock). Sort key. */
  usage: number;
  /** Sparkline data (7 buckets, normalized 0–1) for the Usage cell. */
  usageSparkline: ReadonlyArray<number>;
  /** Reasoning-capable (extended-thinking / RL-tuned chains). `"unknown"` → `?`. */
  reasoning: Capability<boolean>;
  /** Relative latency tier — three bars. `"unknown"` → `?`. */
  speed: Capability<SpeedTier>;
  /**
   * Throughput in output tokens per second. Mock benchmark numbers; null when
   * the upstream provider (e.g. Tinker-hosted OSS) doesn't publish throughput.
   * Drives the numeric `t/s` label + proportional bar in the Speed column.
   */
  tokensPerSecond: number | null;
  /** USD per 1M input tokens. */
  priceIn: number;
  /** USD per 1M output tokens. */
  priceOut: number;
  /** Available for fine-tuning / RL via HUD. */
  trainable: boolean;
  /** Private to the current org (vs public catalog). */
  isPrivate: boolean;
  /**
   * For private (org-trained) models, the `modelId` of the base model the
   * fine-tune started from. Drives the `Base model ▾` filter on the Private
   * models tab. Omitted for public catalog models — they have no parent.
   */
  baseModelId?: string;
}

function spark(seed: number): ReadonlyArray<number> {
  // Deterministic pseudo-random sparkline (7 buckets, 0.2–1.0 range).
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < 7; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(0.2 + (s / 233280) * 0.8);
  }
  return out;
}

export const catalogModels: ReadonlyArray<CatalogModel> = [
  // ── Anthropic ─────────────────────────────────────────────────────────────
  {
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    modelId: "claude-sonnet-4-5",
    usage: 3_700_000,
    usageSparkline: spark(101),
    reasoning: true,
    speed: "high",
    // AA tier estimate via Claude Sonnet 4.6 (max)
    tokensPerSecond: 45,
    priceIn: 3,
    priceOut: 15,
    trainable: true,
    isPrivate: false,
  },
  {
    name: "Claude Opus 4.7",
    provider: "Anthropic",
    modelId: "claude-opus-4-7",
    usage: 2_900_000,
    usageSparkline: spark(102),
    reasoning: true,
    speed: "medium",
    tokensPerSecond: 43,
    priceIn: 15,
    priceOut: 75,
    trainable: false,
    isPrivate: false,
  },
  {
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    modelId: "claude-opus-4-6",
    usage: 1_840_000,
    usageSparkline: spark(103),
    reasoning: true,
    speed: "medium",
    // AA tier estimate via Claude Opus 4.5
    tokensPerSecond: 45,
    priceIn: 15,
    priceOut: 75,
    trainable: false,
    isPrivate: false,
  },
  {
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    modelId: "claude-opus-4-5",
    usage: 1_240_000,
    usageSparkline: spark(104),
    reasoning: true,
    speed: "medium",
    tokensPerSecond: 47,
    priceIn: 15,
    priceOut: 75,
    trainable: true,
    isPrivate: false,
  },
  {
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    modelId: "claude-sonnet-4-6",
    usage: 916_000,
    usageSparkline: spark(105),
    reasoning: true,
    speed: "high",
    tokensPerSecond: 45,
    priceIn: 3,
    priceOut: 15,
    trainable: true,
    isPrivate: false,
  },
  {
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    modelId: "claude-haiku-4-5",
    usage: 780_000,
    usageSparkline: spark(106),
    reasoning: false,
    speed: "high",
    tokensPerSecond: 94,
    priceIn: 0.8,
    priceOut: 4,
    trainable: true,
    isPrivate: true,
    baseModelId: "claude-sonnet-4-5",
  },
  {
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    modelId: "claude-sonnet-4",
    usage: 612_000,
    usageSparkline: spark(107),
    reasoning: true,
    speed: "high",
    // AA tier estimate via Claude Sonnet 4.6
    tokensPerSecond: 45,
    priceIn: 3,
    priceOut: 15,
    trainable: false,
    isPrivate: false,
  },

  // ── Gemini ────────────────────────────────────────────────────────────────
  {
    name: "Gemini 3.1 Pro",
    provider: "Gemini",
    modelId: "gemini-3-1-pro",
    usage: 1_420_000,
    usageSparkline: spark(201),
    reasoning: true,
    speed: "high",
    tokensPerSecond: 143,
    priceIn: 2.5,
    priceOut: 10,
    trainable: true,
    isPrivate: false,
  },
  {
    name: "Gemini 3 Flash Preview",
    provider: "Gemini",
    modelId: "gemini-3-flash-preview",
    usage: 1_050_000,
    usageSparkline: spark(202),
    reasoning: false,
    speed: "high",
    // AA tier estimate via Gemini 3.5 Flash
    tokensPerSecond: 176,
    priceIn: 0.3,
    priceOut: 1.2,
    trainable: true,
    isPrivate: false,
  },
  {
    name: "Gemini 3 Pro",
    provider: "Gemini",
    modelId: "gemini-3-pro",
    usage: 880_000,
    usageSparkline: spark(203),
    reasoning: true,
    speed: "high",
    // AA tier estimate via Gemini 3.1 Pro Preview
    tokensPerSecond: 143,
    priceIn: 2.5,
    priceOut: 10,
    trainable: true,
    isPrivate: false,
  },
  {
    name: "Gemini 2.5 Computer Use Preview",
    provider: "Gemini",
    modelId: "gemini-2-5-computer-use-preview",
    usage: 312_000,
    usageSparkline: spark(204),
    reasoning: true,
    speed: "medium",
    // AA tier estimate via Gemini 2.5 Pro — CUA is latency-bound; likely overstates
    tokensPerSecond: 133,
    priceIn: 3,
    priceOut: 12,
    trainable: false,
    isPrivate: false,
  },
  {
    name: "Gemini 2.5 Pro",
    provider: "Gemini",
    modelId: "gemini-2-5-pro",
    usage: 480_000,
    usageSparkline: spark(205),
    reasoning: true,
    speed: "high",
    tokensPerSecond: 133,
    priceIn: 1.25,
    priceOut: 5,
    trainable: true,
    isPrivate: false,
  },

  // ── OpenAI ────────────────────────────────────────────────────────────────
  {
    name: "GPT 5.1",
    provider: "OpenAI",
    modelId: "gpt-5.1",
    usage: 2_100_000,
    usageSparkline: spark(301),
    reasoning: true,
    speed: "high",
    // AA tier estimate via GPT-5.5 (high)
    tokensPerSecond: 59,
    priceIn: 5,
    priceOut: 20,
    trainable: false,
    isPrivate: false,
  },
  {
    name: "GPT 5.4",
    provider: "OpenAI",
    modelId: "gpt-5.4",
    usage: 1_580_000,
    usageSparkline: spark(302),
    reasoning: true,
    speed: "high",
    // AA tier estimate via GPT-5.5 (xhigh)
    tokensPerSecond: 61,
    priceIn: 6,
    priceOut: 24,
    trainable: true,
    isPrivate: true,
    baseModelId: "gpt-5",
  },
  {
    name: "GPT 4o",
    provider: "OpenAI",
    modelId: "gpt-4o",
    usage: 1_320_000,
    usageSparkline: spark(303),
    reasoning: false,
    speed: "high",
    // AA tier estimate via GPT-4.1 nano (closest non-reasoning)
    tokensPerSecond: 188,
    priceIn: 2.5,
    priceOut: 10,
    trainable: true,
    isPrivate: false,
  },
  {
    name: "GPT 5",
    provider: "OpenAI",
    modelId: "gpt-5",
    usage: 1_180_000,
    usageSparkline: spark(304),
    reasoning: true,
    speed: "high",
    // AA tier estimate via GPT-5.5 (medium)
    tokensPerSecond: 55,
    priceIn: 5,
    priceOut: 20,
    trainable: false,
    isPrivate: false,
  },
  {
    name: "GPT 5.2",
    provider: "OpenAI",
    modelId: "gpt-5.2",
    usage: 740_000,
    usageSparkline: spark(305),
    reasoning: true,
    speed: "high",
    // AA tier estimate via GPT-5.5 (high)
    tokensPerSecond: 59,
    priceIn: 5,
    priceOut: 20,
    trainable: true,
    isPrivate: false,
  },
  {
    name: "Operator",
    provider: "OpenAI",
    modelId: "operator",
    usage: 198_000,
    usageSparkline: spark(306),
    reasoning: true,
    speed: "medium",
    // CUA/Operator not benchmarked on AA
    tokensPerSecond: null,
    priceIn: 4,
    priceOut: 16,
    trainable: false,
    isPrivate: false,
  },
  {
    name: "GPT 4o Mini",
    provider: "OpenAI",
    modelId: "gpt-4o-mini",
    usage: 530_000,
    usageSparkline: spark(307),
    reasoning: false,
    speed: "high",
    // AA tier estimate via o3-mini (closest small/fast)
    tokensPerSecond: 209,
    priceIn: 0.15,
    priceOut: 0.6,
    trainable: true,
    isPrivate: false,
  },

  // ── xAI ───────────────────────────────────────────────────────────────────
  {
    name: "Grok 4.20",
    provider: "xAI",
    modelId: "grok-4-20",
    usage: 420_000,
    usageSparkline: spark(401),
    reasoning: true,
    speed: "medium",
    tokensPerSecond: 196,
    priceIn: 4,
    priceOut: 18,
    trainable: false,
    isPrivate: false,
  },
  {
    name: "Grok 4.3",
    provider: "xAI",
    modelId: "grok-4-3",
    usage: 360_000,
    usageSparkline: spark(402),
    reasoning: true,
    speed: "medium",
    tokensPerSecond: 146,
    priceIn: 4,
    priceOut: 18,
    trainable: false,
    isPrivate: false,
  },
  {
    name: "Grok 4.1 Fast",
    provider: "xAI",
    modelId: "grok-4-1-fast",
    usage: 240_000,
    usageSparkline: spark(403),
    reasoning: false,
    speed: "high",
    // AA tier estimate via Grok 4.20 0309
    tokensPerSecond: 195,
    priceIn: 1,
    priceOut: 4,
    trainable: true,
    isPrivate: false,
  },

  // ── OpenRouter ────────────────────────────────────────────────────────────
  {
    name: "DeepSeek V3.1 Terminus",
    provider: "OpenRouter",
    modelId: "deepseek/deepseek-v3.1-terminus",
    usage: 168_000,
    usageSparkline: spark(501),
    reasoning: true,
    speed: "medium",
    // AA tier estimate via DeepSeek V4 Pro (Max)
    tokensPerSecond: 47,
    priceIn: 0.27,
    priceOut: 1.1,
    trainable: true,
    isPrivate: false,
  },

  // ── Tinker ────────────────────────────────────────────────────────────────
  {
    name: "Deepseek V3.1",
    provider: "Tinker",
    modelId: "deepseek-v3-1",
    usage: 92_000,
    usageSparkline: spark(601),
    reasoning: "unknown",
    speed: "unknown",
    // Tinker hosting not measured on AA
    tokensPerSecond: null,
    priceIn: 0.3,
    priceOut: 1.2,
    trainable: true,
    isPrivate: true,
    baseModelId: "gpt-oss-120b",
  },
  {
    name: "Gpt Oss 120B",
    provider: "Tinker",
    modelId: "gpt-oss-120b",
    usage: 64_000,
    usageSparkline: spark(602),
    reasoning: "unknown",
    speed: "unknown",
    // Tinker hosting not measured on AA
    tokensPerSecond: null,
    priceIn: 0.5,
    priceOut: 1.5,
    trainable: true,
    isPrivate: false,
  },
  {
    name: "Gpt Oss 20B",
    provider: "Tinker",
    modelId: "gpt-oss-20b",
    usage: 38_000,
    usageSparkline: spark(603),
    reasoning: "unknown",
    speed: "unknown",
    // Tinker hosting not measured on AA
    tokensPerSecond: null,
    priceIn: 0.1,
    priceOut: 0.3,
    trainable: false,
    isPrivate: false,
  },

  // ── Bedrock ───────────────────────────────────────────────────────────────
  {
    name: "Nova Pro",
    provider: "Bedrock",
    modelId: "nova-pro",
    usage: 88_000,
    usageSparkline: spark(701),
    reasoning: false,
    speed: "high",
    // AA tier estimate via Nova 2.0 Pro Preview
    tokensPerSecond: 117,
    priceIn: 0.8,
    priceOut: 3.2,
    trainable: false,
    isPrivate: true,
    baseModelId: "gpt-5",
  },
];

export const modelProviders: ReadonlyArray<ModelProvider> = [
  "OpenRouter",
  "OpenAI",
  "Tinker",
  "Anthropic",
  "Gemini",
  "xAI",
  "Bedrock",
];

// Sanity exports — kept so the chip counts in the page can render directly
// from the source of truth without recomputing per render.
export const privateCount = catalogModels.filter((m) => m.isPrivate).length;
export const trainableCount = catalogModels.filter((m) => m.trainable).length;

// Dataset peak used to scale the Speed bar — null entries excluded so the
// "unknown" rows don't drag the denominator.
export const maxTokensPerSecond = catalogModels.reduce(
  (max, m) => (m.tokensPerSecond !== null && m.tokensPerSecond > max ? m.tokensPerSecond : max),
  0,
);
