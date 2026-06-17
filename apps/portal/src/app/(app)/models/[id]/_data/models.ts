/**
 * Mock fixtures for the Model detail page.
 *
 * Two variants exist so both halves of the conditional header subtitle and the
 * conditional Checkpoints tab can be exercised in dev:
 *
 *   - `claude-sonnet-4-5`  — base/gateway Model, 0 checkpoints
 *   - `my-model-v2`        — user-trained Model, ≥1 checkpoints
 *
 * Other tab agents (Traces, Logs, Checkpoints, Settings) can extend this file
 * with their own per-Model fixtures keyed off `Model.id`.
 */

import { catalogModels, type CatalogModel } from "@/lib/mock/explore-models";
import type {
  Checkpoint,
  Log,
  Model,
  TasksetResult,
  Trace,
  Viewer,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function makeBaseModel(): Model {
  return {
    id: "claude-sonnet-4-5",
    displayName: "Claude Sonnet 4.5",
    apiName: "claude-sonnet-4-5",
    internalId: "a3f4e2d8-7b16-4c9e-bd5a-8f3c1e2d4b67",
    provider: "Anthropic",
    status: "ready",
    ownerType: "gateway",
    ownerUserId: null,
    trainable: true,
    reasoning: true,
    kind: "chat",
    isPrivate: false,
    checkpointCount: 0,
    activeCheckpointId: null,
    activeCheckpointStep: null,
    forkedFrom: null,
    activeTrainingJobsCount: 0,
    tags: [],
    routes: ["us-east-1", "us-west-2", "eu-west-1"],
    createdAt: isoDaysAgo(3),
  };
}

function makeUserTrainedModel(): Model {
  return {
    id: "my-model-v2",
    displayName: "My Model v2",
    apiName: "my-model-v2",
    internalId: "3f8c9b6e-d2a4-4f1c-9b8a-7e6d5c4b3a21",
    provider: "HUD",
    status: "ready",
    ownerType: "user-trained",
    ownerUserId: "viewer-aman",
    trainable: true,
    reasoning: true,
    kind: "chat",
    isPrivate: true,
    checkpointCount: 7,
    activeCheckpointId: "ckpt_a93f",
    activeCheckpointStep: 4096,
    forkedFrom: {
      modelId: "claude-sonnet-4-5",
      apiName: "claude-sonnet-4-5",
    },
    activeTrainingJobsCount: 2,
    tags: ["web-nav", "experimental"],
    routes: ["us-east-1"],
    createdAt: isoDaysAgo(13),
  };
}

/**
 * Default viewer fixture — Aman (frontier RL researcher).
 *
 * The Persona axis does not yet exist in the portal's real session/auth
 * context (cookie-based session at `apps/portal/src/lib/auth/session.ts` only
 * carries email/name). Persona is read from this mock until session shape
 * grows the field.
 */
export const VIEWER: Viewer = {
  id: "viewer-aman",
  name: "Aman",
  email: "aman@hud.app",
  persona: "rl-researcher",
  orgRole: "owner",
};

/**
 * Alternative viewer — Priya (agent engineer). Not wired by default; left here
 * so downstream tab agents and tests can flip persona without rewriting the
 * fixture file.
 */
export const PRIYA_VIEWER: Viewer = {
  id: "viewer-priya",
  name: "Priya",
  email: "priya@hud.app",
  persona: "agent-engineer",
  orgRole: "member",
};

/**
 * Synthesize a Model fixture from a public-catalog row. Used as the fallback
 * resolver for `getModelById` so every visible catalog entry has a working
 * detail page without hand-authoring per-row fixtures.
 */
function synthesizeFromCatalog(c: CatalogModel): Model {
  return {
    id: c.modelId,
    displayName: c.name,
    apiName: c.modelId,
    internalId: `mdl_${c.modelId.replace(/[^a-z0-9]/gi, "").slice(0, 12)}`,
    provider: c.provider,
    status: "ready",
    ownerType: "gateway",
    ownerUserId: null,
    trainable: c.trainable,
    reasoning: c.reasoning,
    kind: c.kind,
    isPrivate: c.isPrivate,
    checkpointCount: 0,
    activeCheckpointId: null,
    activeCheckpointStep: null,
    forkedFrom: null,
    activeTrainingJobsCount: 0,
    tags: [],
    routes: ["us-east-1"],
    createdAt: isoDaysAgo(30),
  };
}

/**
 * Look up a Model by `id` (the route param). Falls back to synthesizing from
 * the public catalog so every row in `/models` resolves; returns `null` only
 * when nothing matches so the page can dispatch to `notFound()`.
 *
 * Mocked async (50ms) to mirror the loading-state contract that a real API
 * would impose.
 */
export async function getModelById(id: string): Promise<Model | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (id === "claude-sonnet-4-5") return makeBaseModel();
  if (id === "my-model-v2") return makeUserTrainedModel();
  const c = catalogModels.find((m) => m.modelId === id);
  if (c) return synthesizeFromCatalog(c);
  return null;
}

/**
 * Get the viewer for this session. Mocked — returns Aman by default.
 *
 * When the portal grows a real persona field on the session cookie, swap this
 * implementation to read from `getSession()` and delete the mock.
 */
export async function getViewer(): Promise<Viewer> {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return VIEWER;
}

// ── Taskset fixtures (Results tab) ─────────────────────────────────────────────
//
// Two Tasksets cover the Results-row states with scored data:
//   - Healthy Taskset with high scores (Web nav)
//   - Mixed Taskset (Code gen)

function distribution(scores: ReadonlyArray<number>): ReadonlyArray<number> {
  return scores;
}

const WEB_NAV_SCORES = distribution([
  98, 94, 91, 88, 85, 82, 80, 78, 76, 74, 73, 71, 70, 68, 66, 64, 62, 60, 58, 56,
  54, 52, 50, 48, 46, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16,
  14, 12, 10, 8, 6, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 95,
  92, 90, 87, 85, 83, 81, 79, 77, 75, 73, 71, 69, 67, 65, 63, 61, 59, 57, 55, 53,
  51, 49, 47, 45, 43, 41, 39, 37, 35, 33, 31, 29, 27, 25, 23, 21, 19, 17, 15, 13,
  11, 9, 7, 5, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
]);

const CODE_GEN_SCORES = distribution([
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
]);

// Taskset IDs match canonical entries in `lib/mock/tasksets.ts` so the Results
// rank links and Run-button deep links navigate to real Taskset detail pages
// instead of 404ing.
const TASKSET_RESULTS: ReadonlyArray<TasksetResult> = [
  {
    tasksetId: "hud-browser",
    tasksetName: "hud-browser",
    description: "Browser navigation & web workflows",
    taskCount: 120,
    runStats: {
      completed: 96,
      avgScore: 74.2,
      countAt99: WEB_NAV_SCORES.filter((s) => s >= 99).length,
      countAt75: WEB_NAV_SCORES.filter((s) => s >= 75).length,
      countAt40: WEB_NAV_SCORES.filter((s) => s >= 40).length,
      scoreDistribution: WEB_NAV_SCORES,
    },
    rank: 4,
    totalRanked: 27,
    lastRunAt: isoDaysAgo(0.08),
  },
  {
    tasksetId: "rl-coding-eval",
    tasksetName: "rl-coding-eval",
    description: "RL training set — coding problems",
    taskCount: 40,
    runStats: {
      completed: 40,
      avgScore: 99.0,
      countAt99: 40,
      countAt75: 40,
      countAt40: 40,
      scoreDistribution: CODE_GEN_SCORES,
    },
    rank: 1,
    totalRanked: 14,
    lastRunAt: isoDaysAgo(1.2),
  },
];

/**
 * Get the Results-tab rows for a given Model. Mocked: returns the same two
 * rows for every Model, so both fixtures exercise the same column rendering.
 */
export async function getTasksetResults(modelId: string): Promise<ReadonlyArray<TasksetResult>> {
  void modelId;
  await new Promise((resolve) => setTimeout(resolve, 20));
  return TASKSET_RESULTS;
}

// ── Checkpoint fixtures (Checkpoints tab) ─────────────────────────────────────
//
// Seven checkpoints for `my-model-v2` (matches `Model.checkpointCount`). The
// Active checkpoint is `ckpt_a93f` (step 4096) — same value used in the header
// subtitle so the two surfaces agree. Ordered newest-first by step. One row
// (`ckpt_d30c`) has no Runs against it, exercising the `evalScore === null`
// branch (rendered as `—`).
//
// Timestamps are absolute relative to a fixed reference so the demo's relative
// labels stay stable across renders.

interface CheckpointSeed {
  id: string;
  step: number;
  evalScore: number | null;
  /** Hours-ago offset from `Date.now()` at call time so the displayed
   * relative label stays stable as wall-clock advances. */
  hoursAgo: number;
}

const MY_MODEL_V2_CHECKPOINT_SEEDS: ReadonlyArray<CheckpointSeed> = [
  { id: "ckpt_a93f", step: 4096, evalScore: 88.2, hoursAgo: 2 },
  { id: "ckpt_b72e", step: 2048, evalScore: 81.4, hoursAgo: 24 },
  { id: "ckpt_c51d", step: 1024, evalScore: 74.0, hoursAgo: 3 * 24 },
  { id: "ckpt_d30c", step: 512, evalScore: null, hoursAgo: 5 * 24 },
  { id: "ckpt_e1f8", step: 256, evalScore: 62.3, hoursAgo: 8 * 24 },
  { id: "ckpt_f2a4", step: 128, evalScore: 54.7, hoursAgo: 11 * 24 },
  { id: "ckpt_g7c9", step: 64, evalScore: 41.2, hoursAgo: 14 * 24 },
];

const CHECKPOINT_SEEDS_BY_MODEL: Record<string, ReadonlyArray<CheckpointSeed>> = {
  "my-model-v2": MY_MODEL_V2_CHECKPOINT_SEEDS,
};

/**
 * Get the Checkpoints-tab rows for a given Model. Returns an empty array for
 * Models with no trained checkpoints (the tab itself is gated upstream so the
 * caller never hits this path on a base/gateway Model).
 *
 * Timestamps are computed at call time from each seed's `hoursAgo` offset so
 * the displayed relative label ("2 hours ago", "1 day ago") never goes stale.
 */
export async function getCheckpoints(modelId: string): Promise<ReadonlyArray<Checkpoint>> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const seeds = CHECKPOINT_SEEDS_BY_MODEL[modelId] ?? [];
  const now = Date.now();
  return seeds.map((seed) => ({
    id: seed.id,
    step: seed.step,
    evalScore: seed.evalScore,
    createdAt: new Date(now - seed.hoursAgo * 60 * 60 * 1000).toISOString(),
  }));
}

// ── Log fixtures (Logs tab) ───────────────────────────────────────────────────
//
// Each LogSeed authors a relative offset (`minutesAgo`) so the page's relative-
// time display ("3 min ago", "2 days ago") stays accurate every request. The
// `createdAt` ISO string is computed at call time inside `getLogs()` so the
// label never goes stale across module-evaluation boundaries.
//
// Coverage matrix exercised by the seeds:
//   - `output: null`        → italic muted `empty` cell (wireframe-mandated)
//   - varying output length → truncated cell + full text in expand panel
//   - multiple checkpoints + `null` checkpoint → Checkpoint filter
//   - multiple userNames    → All-users filter
//   - offsets spanning <1h, hours, days, weeks → Time-range filter

interface LogSeed {
  id: string;
  minutesAgo: number;
  taskset: string | null;
  checkpointId: string | null;
  userName: string;
  input: string;
  output: string | null;
  tokens: number;
  cost: number;
}

const USER_TRAINED_LOG_SEEDS: ReadonlyArray<LogSeed> = [
  {
    id: "log_a3b2f9",
    minutesAgo: 3,
    taskset: "Web nav",
    checkpointId: "ckpt_a93f",
    userName: "Aman",
    input: "Write a Python function to calculate the standard deviation of a list of floats.",
    output:
      "def calculate_std(values: list[float]) -> float:\n    n = len(values)\n    if n == 0:\n        return 0.0\n    mean = sum(values) / n\n    variance = sum((v - mean) ** 2 for v in values) / n\n    return variance ** 0.5",
    tokens: 1204,
    cost: 0.0024,
  },
  {
    id: "log_c9d142",
    minutesAgo: 17,
    taskset: "Code gen",
    checkpointId: "ckpt_a93f",
    userName: "Aman",
    input:
      "Summarize the following paragraph in two sentences: The HUD platform provides isolated sandbox environments for evaluating AI agents at scale.",
    output:
      "The HUD platform delivers isolated sandbox environments designed to evaluate AI agents at scale. It targets enterprise frontier research labs and AI startups that need reproducible, low-latency execution traces for post-training and RL workflows.",
    tokens: 890,
    cost: 0.0017,
  },
  {
    id: "log_e7f482",
    minutesAgo: 42,
    taskset: "Web nav",
    checkpointId: "ckpt_b72e",
    userName: "Priya",
    input:
      "Given the environment observation below, choose the next action. Observation: {url: 'https://example.com', viewport: 'mobile', dom: '<button id=\"buy\">Buy</button>'}.",
    output: null,
    tokens: 432,
    cost: 0.0009,
  },
  {
    id: "log_f1g273",
    minutesAgo: 95,
    taskset: "Code gen",
    checkpointId: "ckpt_a93f",
    userName: "Aman",
    input:
      "Refactor this React hook to remove the unnecessary effect: const [count, setCount] = useState(0); useEffect(() => { setCount(items.length); }, [items]);",
    output:
      "Derive directly during render instead of syncing via useEffect:\n\nconst count = items.length;\n\nThe useState + useEffect pair creates a sync bug — the count lags one render behind items. Computing during render keeps them in lockstep.",
    tokens: 1543,
    cost: 0.0031,
  },
  {
    id: "log_h8j913",
    minutesAgo: 60 * 8,
    taskset: null,
    checkpointId: "ckpt_a93f",
    userName: "Aman",
    input: "ping",
    output: "pong",
    tokens: 32,
    cost: 0.0001,
  },
  {
    id: "log_k2l784",
    minutesAgo: 60 * 26,
    taskset: "Browser QA",
    checkpointId: "ckpt_b72e",
    userName: "Priya",
    input:
      "Identify the primary CTA on this page snapshot and return its CSS selector.",
    output: null,
    tokens: 718,
    cost: 0.0014,
  },
  {
    id: "log_m4n521",
    minutesAgo: 60 * 50,
    taskset: "Web nav",
    checkpointId: "ckpt_c51d",
    userName: "Aman",
    input:
      "List the top three accessibility issues with the following form: <form><input type='text'/><input type='submit'/></form>",
    output:
      "1. Missing <label> elements — neither input is programmatically associated with a label, so screen readers will announce them as generic 'edit' and 'submit button'.\n2. Missing accessible name on the submit input — without value attribute or aria-label, the button has no announced text.\n3. No fieldset/legend grouping — for a multi-input form, this hides the form's purpose from assistive tech.",
    tokens: 2104,
    cost: 0.0042,
  },
  {
    id: "log_p9q637",
    minutesAgo: 60 * 24 * 5,
    taskset: "Code gen",
    checkpointId: "ckpt_c51d",
    userName: "Aman",
    input: "Generate a SQL query that returns the 10 most active users in the last 7 days.",
    output: null,
    tokens: 256,
    cost: 0.0005,
  },
  {
    id: "log_r3s945",
    minutesAgo: 60 * 24 * 12,
    taskset: "Web nav",
    checkpointId: "ckpt_b72e",
    userName: "Priya",
    input: "Describe the visual hierarchy of this dashboard screenshot.",
    output:
      "The dashboard leads with a four-up KPI strip across the top — each tile uses the same font scale, signaling parity. Below, a wide chart spans 8 columns and a narrow leaderboard takes the remaining 4. Density tightens as the eye moves down: the bottom third is a table with compact rows, suggesting drill-down detail rather than glance content.",
    tokens: 1820,
    cost: 0.0036,
  },
  {
    id: "log_t6u128",
    minutesAgo: 60 * 24 * 28,
    taskset: null,
    checkpointId: null,
    userName: "Aman",
    input: "Health check from monitoring system.",
    output: "ok",
    tokens: 12,
    cost: 0.00002,
  },
];

const BASE_MODEL_LOG_SEEDS: ReadonlyArray<LogSeed> = [
  {
    id: "log_base_001",
    minutesAgo: 6,
    taskset: "Code gen",
    checkpointId: null,
    userName: "Aman",
    input: "Generate unit tests for the following pure function: function add(a, b) { return a + b; }",
    output:
      "import { describe, expect, it } from 'vitest';\nimport { add } from './add';\n\ndescribe('add', () => {\n  it('sums two positives', () => expect(add(2, 3)).toBe(5));\n  it('handles zero', () => expect(add(0, 5)).toBe(5));\n  it('handles negatives', () => expect(add(-2, -3)).toBe(-5));\n});",
    tokens: 612,
    cost: 0.0012,
  },
  {
    id: "log_base_002",
    minutesAgo: 30,
    taskset: null,
    checkpointId: null,
    userName: "Priya",
    input: "What is the Pythagorean theorem?",
    output: null,
    tokens: 88,
    cost: 0.0002,
  },
  {
    id: "log_base_003",
    minutesAgo: 60 * 4,
    taskset: "Web nav",
    checkpointId: null,
    userName: "Aman",
    input: "Plan a sequence of clicks to complete a checkout flow on example.com.",
    output:
      "1. Click product tile (selector: a[data-product-id]).\n2. Click 'Add to cart' button (selector: button#add-to-cart).\n3. Navigate to /cart.\n4. Click 'Checkout' (selector: button[type='submit'][data-action='checkout']).\n5. Fill address form; submit.\n6. Confirm order.",
    tokens: 980,
    cost: 0.0019,
  },
];

const LOG_SEEDS_BY_MODEL: Record<string, ReadonlyArray<LogSeed>> = {
  "my-model-v2": USER_TRAINED_LOG_SEEDS,
  "claude-sonnet-4-5": BASE_MODEL_LOG_SEEDS,
};

/**
 * Get the Logs-tab rows for a given Model. Mocked: each Model variant returns
 * a tailored seed list — `my-model-v2` exercises checkpoint diversity and the
 * full output/null/expand matrix; the base Model returns logs with no
 * checkpoint association.
 *
 * Returned timestamps are computed at call time from each seed's `minutesAgo`
 * offset so the page's relative-time label ("3 min ago") never goes stale.
 * Mocked async (30ms) to mirror the loading-state contract a real API imposes.
 */
export async function getLogs(modelId: string): Promise<ReadonlyArray<Log>> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const now = Date.now();
  const seeds = LOG_SEEDS_BY_MODEL[modelId] ?? [];
  return seeds.map((seed) => ({
    id: seed.id,
    createdAt: new Date(now - seed.minutesAgo * 60 * 1000).toISOString(),
    taskset: seed.taskset,
    checkpointId: seed.checkpointId,
    userName: seed.userName,
    input: seed.input,
    output: seed.output,
    tokens: seed.tokens,
    cost: seed.cost,
  }));
}

// ── Trace fixtures (Traces tab) ────────────────────────────────────────────────
//
// Per-Model trace lists are seeded from a deterministic generator so the cards
// vary by step count, score band, and Taskset without us hand-rolling each row.
// Two Models exercise the two sizes:
//
//   - `claude-sonnet-4-5` (base) — fewer traces, two Tasksets, smaller grid.
//   - `my-model-v2` (user-trained) — denser trace volume, three Tasksets.

interface TraceSeed {
  readonly idSuffix: string;
  readonly tasksetId: string;
  readonly tasksetName: string;
  /** Checkpoint that produced this trace; `null` for gateway/base Models. */
  readonly checkpointId: string | null;
  readonly steps: number;
  readonly score: number;
  readonly minutesAgo: number;
}

function makeTraces(seeds: ReadonlyArray<TraceSeed>): ReadonlyArray<Trace> {
  // Compute timestamps at call time so the relative-time label in the list view
  // ("3 min ago") never goes stale across requests.
  const now = Date.now();
  return seeds.map((seed) => ({
    id: `trc_${seed.idSuffix}`,
    tasksetId: seed.tasksetId,
    tasksetName: seed.tasksetName,
    checkpointId: seed.checkpointId,
    steps: seed.steps,
    score: seed.score,
    createdAt: new Date(now - seed.minutesAgo * 60_000).toISOString(),
  }));
}

// Gateway Models don't have checkpoints — every base-model trace is keyed
// against the model's API name itself so the Checkpoint filter surfaces a
// single sensible option instead of a useless empty list.
const BASE_MODEL_TRACE_SEEDS: ReadonlyArray<TraceSeed> = [
  { idSuffix: "a3b2f9", tasksetId: "wikigames-2", tasksetName: "WikiGames 2", checkpointId: "claude-sonnet-4-5", steps: 12, score: 94, minutesAgo: 8 },
  { idSuffix: "c9d147", tasksetId: "wikigames-2", tasksetName: "WikiGames 2", checkpointId: "claude-sonnet-4-5", steps: 8, score: 31, minutesAgo: 27 },
  { idSuffix: "e7f482", tasksetId: "wikigames-2", tasksetName: "WikiGames 2", checkpointId: "claude-sonnet-4-5", steps: 24, score: 88, minutesAgo: 41 },
  { idSuffix: "g2h8d1", tasksetId: "wikigames-2", tasksetName: "WikiGames 2", checkpointId: "claude-sonnet-4-5", steps: 5, score: 12, minutesAgo: 63 },
  { idSuffix: "j5k223", tasksetId: "swe-bench-verified", tasksetName: "SWE-bench Verified", checkpointId: "claude-sonnet-4-5", steps: 18, score: 76, minutesAgo: 95 },
  { idSuffix: "m1n4ab", tasksetId: "swe-bench-verified", tasksetName: "SWE-bench Verified", checkpointId: "claude-sonnet-4-5", steps: 14, score: 52, minutesAgo: 122 },
  { idSuffix: "p7q1c0", tasksetId: "swe-bench-verified", tasksetName: "SWE-bench Verified", checkpointId: "claude-sonnet-4-5", steps: 22, score: 99, minutesAgo: 180 },
  { idSuffix: "r3s9e5", tasksetId: "swe-bench-verified", tasksetName: "SWE-bench Verified", checkpointId: "claude-sonnet-4-5", steps: 6, score: 38, minutesAgo: 240 },
];

// User-trained model has multiple checkpoints (matches the logs fixture seeds:
// `ckpt_a93f`, `ckpt_b72e`, `ckpt_c51d`). Distribute traces across them so the
// filter surfaces real differentiation.
const USER_MODEL_TRACE_SEEDS: ReadonlyArray<TraceSeed> = [
  { idSuffix: "ua81f3", tasksetId: "wikigames-2", tasksetName: "WikiGames 2", checkpointId: "ckpt_c51d", steps: 11, score: 91, minutesAgo: 3 },
  { idSuffix: "ub2c70", tasksetId: "wikigames-2", tasksetName: "WikiGames 2", checkpointId: "ckpt_c51d", steps: 15, score: 84, minutesAgo: 9 },
  { idSuffix: "uc4d61", tasksetId: "wikigames-2", tasksetName: "WikiGames 2", checkpointId: "ckpt_b72e", steps: 9, score: 47, minutesAgo: 18 },
  { idSuffix: "ud8e22", tasksetId: "wikigames-2", tasksetName: "WikiGames 2", checkpointId: "ckpt_a93f", steps: 6, score: 22, minutesAgo: 33 },
  { idSuffix: "ue5f99", tasksetId: "swe-bench-verified", tasksetName: "SWE-bench Verified", checkpointId: "ckpt_c51d", steps: 19, score: 95, minutesAgo: 45 },
  { idSuffix: "uf91a8", tasksetId: "swe-bench-verified", tasksetName: "SWE-bench Verified", checkpointId: "ckpt_b72e", steps: 25, score: 88, minutesAgo: 64 },
  { idSuffix: "ug3b77", tasksetId: "swe-bench-verified", tasksetName: "SWE-bench Verified", checkpointId: "ckpt_b72e", steps: 13, score: 71, minutesAgo: 88 },
  { idSuffix: "uh6c40", tasksetId: "swe-bench-verified", tasksetName: "SWE-bench Verified", checkpointId: "ckpt_a93f", steps: 17, score: 56, minutesAgo: 110 },
  { idSuffix: "ui2d05", tasksetId: "swe-bench-verified", tasksetName: "SWE-bench Verified", checkpointId: "ckpt_a93f", steps: 8, score: 34, minutesAgo: 145 },
  { idSuffix: "uj7e18", tasksetId: "hud-browser", tasksetName: "hud-browser", checkpointId: "ckpt_c51d", steps: 21, score: 82, minutesAgo: 200 },
  { idSuffix: "uk4f63", tasksetId: "hud-browser", tasksetName: "hud-browser", checkpointId: "ckpt_b72e", steps: 16, score: 67, minutesAgo: 260 },
  { idSuffix: "ul9a55", tasksetId: "hud-browser", tasksetName: "hud-browser", checkpointId: "ckpt_a93f", steps: 12, score: 41, minutesAgo: 320 },
];

const TRACE_SEEDS_BY_MODEL: Readonly<Record<string, ReadonlyArray<TraceSeed>>> = {
  "claude-sonnet-4-5": BASE_MODEL_TRACE_SEEDS,
  "my-model-v2": USER_MODEL_TRACE_SEEDS,
};

/**
 * Get the Traces-tab rows for a given Model. Returns an empty array for
 * unknown Model IDs so the tab renders the zero-state path naturally.
 *
 * Mocked async (20ms) to mirror the loading-state contract a real API imposes.
 */
export async function getTraces(modelId: string): Promise<ReadonlyArray<Trace>> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return makeTraces(TRACE_SEEDS_BY_MODEL[modelId] ?? []);
}
