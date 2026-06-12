/**
 * Typed contract for the Model detail page.
 *
 * Shaped as if it came from a future REST/GraphQL endpoint — the fixtures in
 * `models.ts` are the only consumer today, but downstream tab agents
 * (Traces, Logs, Checkpoints, Settings) import from this file rather than the
 * fixture so their components stay decoupled from the mock layer.
 *
 * Four state axes drive what renders on the page (see wireframe state machine):
 *
 *   1. `checkpointCount`           — 0 (base/gateway) | ≥1 (user-trained)
 *   2. `persona`                   — 'rl-researcher' | 'agent-engineer'
 *   3. `ownershipClass`            — derived; one of four values below
 *   4. `activeTrainingJobsCount`   — 0 | ≥1
 */

import type { Capability } from "@/lib/mock/explore-models";

export type Persona = "rl-researcher" | "agent-engineer";

export type OwnershipClass =
  | "gateway"
  | "user-trained:owner"
  | "user-trained:org-member"
  | "user-trained:admin";

export type ModelStatus = "ready" | "pending" | "failed";

export type ModelOwnerType = "gateway" | "user-trained";

export type OrgRole = "owner" | "admin" | "member";

export interface Checkpoint {
  /** Canonical ID (slug form, e.g. `ckpt_a93f`). Step number is display only. */
  id: string;
  step: number;
  /** Eval score 0..100, or `null` when no Run has executed against this checkpoint. */
  evalScore: number | null;
  createdAt: string;
}

export interface Viewer {
  id: string;
  name: string;
  email: string;
  persona: Persona;
  orgRole: OrgRole;
}

export interface ModelBaseRef {
  /** Identifier of the base Model this Model was forked from. */
  modelId: string;
  /** API-facing name of the base Model (e.g. `claude-sonnet-4-5`). */
  apiName: string;
}

export interface Model {
  id: string;
  displayName: string;
  apiName: string;
  /**
   * Internal model identifier surfaced on the Settings → Model Information panel
   * (e.g. `mdl_b3c2…`). Distinct from `id` (the URL slug / API name surrogate).
   */
  internalId: string;
  provider: string;
  status: ModelStatus;
  ownerType: ModelOwnerType;
  /** Owning user ID — only meaningful when `ownerType === 'user-trained'`. */
  ownerUserId: string | null;
  /** True when the Model can be forked / trained against. */
  trainable: boolean;
  /** Reasoning-capable (extended thinking / RL-tuned chains). 'unknown' renders no chip. */
  reasoning: Capability<boolean>;
  /** Private to the current org (vs public catalog). Drives the header visibility icon. */
  isPrivate: boolean;
  /** Number of checkpoints. 0 implies a base/gateway Model. */
  checkpointCount: number;
  /** Active checkpoint ID, or null on base/gateway Models. */
  activeCheckpointId: string | null;
  /** Active checkpoint step number, or null on base/gateway Models. */
  activeCheckpointStep: number | null;
  /** Lineage pointer — non-null when `ownerType === 'user-trained'`. */
  forkedFrom: ModelBaseRef | null;
  /** Active Training Jobs that reference this Model as `source_model_id`. */
  activeTrainingJobsCount: number;
  /** Free-form tags applied by the owner. Editable in Settings → Configuration. */
  tags: ReadonlyArray<string>;
  /** Inference routes / regions where this Model is served. */
  routes: ReadonlyArray<string>;
  /** ISO-8601 timestamp of Model creation. */
  createdAt: string;
}

export type Score = number; // 0..100

/**
 * One execution Trace produced by a Run of this Model against a Taskset task.
 * Cards in the Traces grid render `id`, `tasksetName`, `steps`, `score`; the
 * list view adds `createdAt`. Thumbnails are intentionally not URLs in the mock
 * — the card renders a placeholder block keyed off `id` for visual variation.
 */
export interface Trace {
  /** Canonical slug, e.g. `trc_a3b2f9`. */
  id: string;
  /** Taskset this Trace was produced under. Drives the filter chip. */
  tasksetId: string;
  tasksetName: string;
  /** Checkpoint slug that produced this Trace, or `null` for gateway/base Models. */
  checkpointId: string | null;
  /** Number of steps the agent took before terminating. */
  steps: number;
  /** Final eval score 0..100. Drives the score badge color. */
  score: Score;
  /** ISO timestamp. List view renders this as a relative label. */
  createdAt: string;
}

/**
 * One row of the Logs tab — a single inference request against this Model.
 *
 * `output` is `null` when the model returned an empty completion (filtered,
 * tool stop, max-tokens cutoff). The Logs cell renders an italic muted `empty`
 * marker rather than a blank — a designed-visible signal that the call
 * returned nothing.
 *
 * `checkpointId` is `null` for gateway/base Models (no trained checkpoints).
 * `taskset` is `null` for ad-hoc playground calls that aren't tied to a Run.
 */
export interface Log {
  id: string;
  /** ISO 8601 UTC timestamp. Used both for the relative-time display and the
   * `title` attribute hover surface. */
  createdAt: string;
  /** Taskset display name, or `null` for ad-hoc / non-Run calls. */
  taskset: string | null;
  /** Checkpoint slug (e.g. `ckpt_a93f`), or `null` for gateway/base Models. */
  checkpointId: string | null;
  /** Acting user display name — used by the All-users filter. */
  userName: string;
  /** Full input prompt. The cell truncates the visible display, but the
   * expanded panel renders the full text. */
  input: string;
  /** Full output text, or `null` for empty completions. */
  output: string | null;
  /** Total token count for the request. */
  tokens: number;
  /** Cost in USD. */
  cost: number;
}

export interface TasksetResult {
  tasksetId: string;
  tasksetName: string;
  /** Total tasks in the Taskset (the denominator for progress + thresholds). */
  taskCount: number;
  /** Completed Runs against this Model. `null` rows render the empty-Taskset row. */
  runStats: TasksetRunStats | null;
}

export interface TasksetRunStats {
  /** Completed task count (the numerator for progress). 0 ≤ completed ≤ taskCount. */
  completed: number;
  /** Average eval score across completed tasks (0..100). */
  avgScore: Score;
  /** Count of tasks whose score met or exceeded 99%. */
  countAt99: number;
  /** Count of tasks whose score met or exceeded 75%. */
  countAt75: number;
  /** Count of tasks whose score met or exceeded 40%. */
  countAt40: number;
  /** Per-task scores, ordered (drives the score-distribution heatmap). */
  scoreDistribution: ReadonlyArray<Score>;
}

/**
 * Compute the page-level ownership class from a Model and the viewer's org role.
 * Pure derivation — kept here so every consumer (page header, settings, etc.) reads
 * the same rule.
 */
export function deriveOwnershipClass(
  model: Pick<Model, "ownerType" | "ownerUserId">,
  viewer: Pick<Viewer, "id" | "orgRole">,
): OwnershipClass {
  if (model.ownerType === "gateway") return "gateway";
  if (model.ownerUserId === viewer.id) return "user-trained:owner";
  if (viewer.orgRole === "admin") return "user-trained:admin";
  return "user-trained:org-member";
}
