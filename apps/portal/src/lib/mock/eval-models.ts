/**
 * Eval inference-model fixtures — drives `/jobs/new?type=eval` Step 1 picker.
 *
 * Shape: provider-grouped catalog of inference models eligible for eval runs.
 * Unlike training, eval works on ANY inference model (no `trainable` filter),
 * so the row only needs the picker-facing display columns (name + ctx) plus
 * stable IDs. Provider is the grouping key — Anthropic / OpenAI / Tinker
 * matches the production "Run Taskset" drawer.
 */

export type EvalProvider = "Anthropic" | "OpenAI" | "Tinker";

export interface EvalModelRow {
  /** Stable ID — used for selection set and Run command rendering. */
  id: string;
  /** Display name shown in the picker row. */
  name: string;
  /** Provider — grouping key. */
  provider: EvalProvider;
  /** Context window display string (e.g. "200k"). */
  context: string;
}

export interface EvalModelGroup {
  provider: EvalProvider;
  models: ReadonlyArray<EvalModelRow>;
}

export const EVAL_MODELS: ReadonlyArray<EvalModelRow> = [
  // ── Anthropic ─────────────────────────────────────────────────────────────
  { id: "anthropic/claude-opus-4-5", name: "claude-opus-4-5", provider: "Anthropic", context: "200k" },
  { id: "anthropic/claude-sonnet-4-5", name: "claude-sonnet-4-5", provider: "Anthropic", context: "200k" },
  { id: "anthropic/claude-haiku-4-5", name: "claude-haiku-4-5", provider: "Anthropic", context: "200k" },
  { id: "anthropic/claude-opus-4", name: "claude-opus-4", provider: "Anthropic", context: "200k" },
  { id: "anthropic/claude-sonnet-4", name: "claude-sonnet-4", provider: "Anthropic", context: "200k" },
  { id: "anthropic/claude-haiku-4", name: "claude-haiku-4", provider: "Anthropic", context: "200k" },
  { id: "anthropic/claude-3-7-sonnet", name: "claude-3-7-sonnet", provider: "Anthropic", context: "200k" },
  { id: "anthropic/claude-3-5-sonnet", name: "claude-3-5-sonnet", provider: "Anthropic", context: "200k" },
  { id: "anthropic/claude-3-5-haiku", name: "claude-3-5-haiku", provider: "Anthropic", context: "200k" },

  // ── OpenAI ────────────────────────────────────────────────────────────────
  { id: "openai/gpt-5", name: "gpt-5", provider: "OpenAI", context: "128k" },
  { id: "openai/gpt-5-mini", name: "gpt-5-mini", provider: "OpenAI", context: "128k" },
  { id: "openai/gpt-5-nano", name: "gpt-5-nano", provider: "OpenAI", context: "128k" },
  { id: "openai/gpt-4o", name: "gpt-4o", provider: "OpenAI", context: "128k" },
  { id: "openai/gpt-4o-mini", name: "gpt-4o-mini", provider: "OpenAI", context: "128k" },
  { id: "openai/gpt-4-turbo", name: "gpt-4-turbo", provider: "OpenAI", context: "128k" },

  // ── Tinker (OSS-hosted) ───────────────────────────────────────────────────
  { id: "tinker/gpt-oss-20b", name: "gpt-oss-20b", provider: "Tinker", context: "32k" },
  { id: "tinker/gpt-oss-120b", name: "gpt-oss-120b", provider: "Tinker", context: "32k" },
  { id: "tinker/qwen-2-5-7b", name: "qwen-2.5-7b", provider: "Tinker", context: "128k" },
  { id: "tinker/qwen-2-5-14b", name: "qwen-2.5-14b", provider: "Tinker", context: "128k" },
];

const PROVIDER_ORDER: ReadonlyArray<EvalProvider> = ["Anthropic", "OpenAI", "Tinker"];

export const EVAL_MODEL_GROUPS: ReadonlyArray<EvalModelGroup> = PROVIDER_ORDER.map(
  (provider) => ({
    provider,
    models: EVAL_MODELS.filter((m) => m.provider === provider),
  }),
);

export function getEvalModel(id: string): EvalModelRow | undefined {
  return EVAL_MODELS.find((m) => m.id === id);
}
