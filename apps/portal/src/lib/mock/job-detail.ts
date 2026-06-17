import { findJobById, getTaskset, type Taskset, type TasksetJobRow } from "@/lib/mock/tasksets";

// Runs are the atomic unit of grading outcome. Per-trace status mirrors the
// reward path: `scored` (graded successfully), `error` (graded but failed below
// the destructive band), `no-score` (never ran). Invalidate/Revalidate is a
// JOB-level concept and lives on `JobDetail.resultsInvalidated` — NOT per-trace.
export type JobRunState = "scored" | "error" | "no-score";

export interface JobRun {
  id: string;
  taskId: string;
  state: JobRunState;
  /** 0..1 reward string for display ("1.0000"). `null` when state === "no-score". */
  reward: string | null;
  durationLabel: string;
  turns: number;
  /** Pre-formatted cost, dollar-prefix omitted ("0.0091"). */
  costLabel: string;
  /** Originating model — populated for every run. Single-model jobs all share the same `modelId`. */
  modelId: string;
  /** Full trace id, 8-char hex. Rendered truncated in row labels; used as the trace-route key. */
  traceId: string;
}

/**
 * Per-model rollup for a job. `JobDetail.models` always carries at least one
 * entry; single-model jobs degenerate to a one-entry array, multi-model jobs
 * list every model sorted by `overallReward` desc (winner first).
 */
export interface JobModelSummary {
  modelId: string;
  /** Avg reward over scored traces. null when no scored trace. */
  overallReward: number | null;
  traceCount: number;
  /** Total spent on this model's traces (USD). */
  costTotal: number;
  /** Fraction of tasks (0..1) where this model had the highest reward avg. null when no tasks scored. */
  winRate: number | null;
}

export interface JobTask {
  id: string;
  /** Optional one-line description shown in the coverage tooltip. */
  scenarioLabel?: string;
  /** Long-form prompt shown on the Traces-tab parent row. */
  promptLabel?: string;
}

export interface JobToolStat {
  name: string;
  /** Total invocations within this scope. */
  calls: number;
  /** Avg invocations per run within this scope ("4.00"). */
  avgPerRun: string;
  /** Median latency label ("773ms"). */
  timeP50: string;
  /** Reward observed on runs invoking this tool ("1.0000"). */
  reward: string;
  /** Empty-output rate label ("100%"). */
  emptyRate: string;
  /** Avg output size ("38" or "—"). */
  avgOut: string;
  /** Share of total tool calls 0..1 — width of the share bar. */
  share: number;
}

export interface JobToolPattern {
  id: string;
  /** Ordered tool names forming a chain (`launch_app → anthropic_computer`). */
  steps: ReadonlyArray<string>;
  /** Trace count matching this pattern. */
  n: number;
  /** Reward observed on traces matching this pattern. */
  reward: string;
}

export interface JobToolScope {
  totals: {
    calls: number;
    avgPerRun: string;
    /** "2 of 7 tools used" — `tools.length` for used count, totalTools for denominator. */
    toolsUsed: number;
    totalTools: number;
  };
  /** Stats for every tool in the catalog, in display order. `null` entry → unused. */
  toolStats: ReadonlyArray<JobToolStat | { name: string; unused: true }>;
  patterns: ReadonlyArray<JobToolPattern>;
  /** Matrix rows keyed by pattern id, columns keyed by task id; value = reward string or undefined for dim cell. */
  matrix: Record<string, Record<string, string | undefined>>;
  /** Task columns to render in the matrix (subset of all tasks for the active filter). */
  matrixColumns: ReadonlyArray<string>;
}

export interface JobQaAgent {
  name: string;
  /** Mono accent agent id ("trace-explorer:failure_analysis"). */
  id: string;
  /** One-sentence description shown under the name. */
  description: string;
}

// ── Usage tab payload ─────────────────────────────────────────────────────────
// Demo data for the Job detail Usage tab. The trace/model counts here are
// intentionally independent of the existing `runs`/`tasks` data on the showcase
// job — the Usage mockup demonstrates 18 traces / 2 models while the showcase
// Overview still shows only 2 runs.

export type JobUsageTraceStatus = "Scored" | "Errored";

export interface JobUsageTrace {
  /** Short trace id, 8 chars, monospace. */
  traceId: string;
  modelId: string;
  taskId: string;
  status: JobUsageTraceStatus;
  /** 0..1 reward. `null` for errored traces. */
  reward: number | null;
  inferenceCost: number;
  environmentCost: number;
  /** Runtime hint sub-text in the Environment cell ("5m base"). */
  environmentLabel: string;
  total: number;
  /** Inference turns the trace executed before completing or failing. */
  turns: number;
  /** Aggregate prompt + completion tokens across all turns. */
  totalTokens: number;
}

export interface JobUsageModelRollup {
  modelId: string;
  traces: number;
  avgPerTrace: number;
  costPerSuccess: number;
  successfulCount: number;
  total: number;
  /** Signed pct vs job avg-per-trace (e.g. +0.33 = 33% above). */
  vsAvgTracePct: number;
}

export interface JobUsage {
  total: number;
  inference: number;
  environment: number;
  tracesCount: number;
  inferenceCallsCount: number;
  successfulCount: number;
  erroredCount: number;
  /** Spend on errored traces — drives the wasted-cost callout. */
  erroredCost: number;
  /** Fixed at 0.5 for now; see wireframe OQ-2. */
  successThreshold: number;
  /** Pre-formatted relative label ("32 minutes ago"). */
  costCalculatedAtLabel: string;
  avgPerTrace: number;
  costPerSuccess: number;
  models: ReadonlyArray<JobUsageModelRollup>;
  traces: ReadonlyArray<JobUsageTrace>;
}

export interface JobDetail {
  /** Echo of the job row this detail belongs to. */
  job: TasksetJobRow;
  /** Echo of the parent taskset. */
  taskset: Taskset;
  /** Display scope token shown before title in the page header (`eval` / `train` / `qa-analysis`). */
  scope: "eval" | "train" | "qa-analysis";
  /**
   * Job-level invalidation. Drives the `results invalidated` pill in the header
   * and the overview note. Invalidate/Revalidate is a JOB-level action — no
   * per-trace `invalidated` status exists.
   */
  resultsInvalidated: boolean;
  /** "Claude Opus 4.6 on browser Tasks" — long-form title shown next to scope. */
  displayTitle: string;
  /** Surfaced in the heading result-summary row. Present only when scope === "train" and the job produced an artifact. */
  checkpointId?: string;
  /** Whether downstream eval has been run after training. Drives the "Eval not run yet" sub-fact. */
  downstreamEvalRun?: boolean;
  /** QA Analysis findings rollup. Required when scope === "qa-analysis". */
  findings?: {
    total: number;
    highSeverity: number;
    /** Short label for the most prominent issue, e.g. "navigation failure". */
    topIssue?: string;
    /** Count of minor issues, shown when highSeverity === 0. */
    minor: number;
  };
  /** Model identifier ("claude-opus-4-6"). */
  modelId: string;
  /** Sandbox env identifier ("browser@2.4.1"). */
  envId: string;
  /** Taskset short id used in the meta line ("ts_browser"). */
  tasksetShortId: string;
  /** Coverage labels — "2 / 3 Tasks", "2 Runs". */
  coverageLabel: string;
  runsLabel: string;
  /** Pinned seed value. */
  seed: number;
  /** Created timestamp display — long form ("2026-05-21 19:58:02 PT"). Tooltip on hover. */
  createdLabel: string;
  /** Relative created label ("2d ago"). */
  createdRelativeLabel: string;
  /** Absolute calendar-date label ("May 21, 2026") shown in the header meta line — mirrors the tasksets meta pattern. */
  createdDateLabel: string;
  /** Display tasks in order — drives the coverage grid columns. */
  tasks: ReadonlyArray<JobTask>;
  /** Initial run snapshot. Mutated in component state. */
  initialRuns: ReadonlyArray<JobRun>;
  /** Per-task-filter tool usage payload. Key is task id, plus the special "all" key. */
  toolScopes: Record<string, JobToolScope>;
  /** Catalog of QA agents shown in the run-QA popover. */
  qaAgents: ReadonlyArray<JobQaAgent>;
  /**
   * Models comparison roster. Single-model jobs carry one entry (same id as
   * `modelId`); multi-model jobs carry N≥2 entries sorted winner-first by
   * `overallReward` desc. The Traces tab uses this to decide whether to render
   * the chip cluster + Group by toggle + per-model strip.
   */
  models: ReadonlyArray<JobModelSummary>;
  /**
   * Per-model failed-trace count for the multi-model failed-trace banner. Key
   * matches each `models[].modelId`. Always includes every model in `models`
   * (zero-count entries shown to confirm absence).
   */
  failedByModel: Record<string, number>;
  /** Minimum valid traces required to enable Train. */
  trainTraceThreshold: number;
  /** Cost & latency display (constant for the demo — not state-dependent). */
  costPerRunLabel: string;
  costPerRunCredits: string;
  totalCostLabel: string;
  latencyP50Label: string;
  toolTurnsAvgLabel: string;
  toolTurnsSubLabel: string;
  /** "Re-run this Taskset with the pinned seed" command body. */
  rerunCommand: string;
  /** Usage tab payload — independent of runs/tasks above. */
  usage: JobUsage;
}

const QA_AGENTS: ReadonlyArray<JobQaAgent> = [
  {
    name: "Failure Analysis",
    id: "trace-explorer:failure_analysis",
    description:
      "Triages failing Traces by step-level reward, tool calls, and reasoning. Surfaces the earliest divergence.",
  },
  {
    name: "Prompt Alignment Analysis",
    id: "trace-explorer:prompt_alignment",
    description:
      "Scores each Trace against the system prompt + Task spec. Flags off-policy steps, per-Task.",
  },
  {
    name: "Tool Usage Analysis",
    id: "trace-explorer:tool_usage_analysis",
    description:
      "Profiles tool-call distribution; identifies inefficient or hallucinated invocations.",
  },
  {
    name: "Trajectory Coherence",
    id: "trace-explorer:trajectory_coherence",
    description:
      "Step-to-step consistency. Detects backtracking, redundant steps, reasoning loops.",
  },
  {
    name: "DOM Assertion",
    id: "browser-eval:dom_assertion",
    description:
      "Verifies browser-eval Traces against a target DOM contract; per-assertion pass/fail.",
  },
];

const TOOL_CATALOG: ReadonlyArray<string> = [
  "anthropic_computer",
  "api_request",
  "hud_computer",
  "hud_validate",
  "launch_app",
  "openai_computer",
  "playwright",
];

interface ToolStatSource {
  calls: number;
  avgPerRun: string;
  timeP50: string;
  reward: string;
  emptyRate: string;
  avgOut: string;
  share: number;
}

function buildScope(args: {
  totals: { calls: number; avgPerRun: string; toolsUsed: number };
  tools: Record<string, ToolStatSource>;
  patterns: ReadonlyArray<JobToolPattern>;
  matrix: Record<string, Record<string, string>>;
  matrixColumns: ReadonlyArray<string>;
}): JobToolScope {
  return {
    totals: {
      calls: args.totals.calls,
      avgPerRun: args.totals.avgPerRun,
      toolsUsed: args.totals.toolsUsed,
      totalTools: TOOL_CATALOG.length,
    },
    toolStats: TOOL_CATALOG.map((name) => {
      const source = args.tools[name];
      if (!source) return { name, unused: true } as const;
      return { name, ...source };
    }),
    patterns: args.patterns,
    matrix: args.matrix,
    matrixColumns: args.matrixColumns,
  };
}

// Hardcoded payload for the showcase job (job_4c8e1a20). Matches the operator's mockup.
//
// Scale: 10 tasks × 10 traces = 100 traces. State distribution:
//   ~75 scored, ~20 error, ~5 no-score — exercises filter counts + reward bands.
// Sequential `run_NN` IDs (flat layout). Browser-task prompts of varying length so
// truncation behavior is exercised in the table's Task cell.

const SHOWCASE_TASKS: ReadonlyArray<JobTask> = [
  {
    id: "0000",
    scenarioLabel: "browser:todo-create",
    promptLabel:
      'Create a new todo item with the title "check schedules" using the search-and-paste pattern.',
  },
  {
    id: "0001",
    scenarioLabel: "browser:2048-near-win",
    promptLabel:
      "Reach the 2048 tile by merging the two 1024s in the bottom row.",
  },
  {
    id: "0002",
    scenarioLabel: "browser:2048-fresh",
    promptLabel:
      "Start fresh — build toward the corner. Move right and down only until you establish a base tile of 64 or higher.",
  },
  {
    id: "0003",
    scenarioLabel: "browser:gmail-archive",
    promptLabel:
      "Archive every promotional email older than 30 days, then label the rest with priority.",
  },
  {
    id: "0004",
    scenarioLabel: "browser:hn-search",
    promptLabel: "Find the top 3 Hacker News stories about RL from the last week.",
  },
  {
    id: "0005",
    scenarioLabel: "browser:gh-issue",
    promptLabel:
      'Open a new GitHub issue titled "trace replay flakes on long runs" and label it `bug` + `priority:high`.',
  },
  {
    id: "0006",
    scenarioLabel: "browser:cal-event",
    promptLabel:
      "Schedule a 30-minute meeting on the calendar next Tuesday at 2pm with the title weekly sync.",
  },
  {
    id: "0007",
    scenarioLabel: "browser:wiki-fetch",
    promptLabel: "Look up the founding year of the city of Lisbon.",
  },
  {
    id: "0008",
    scenarioLabel: "browser:form-fill",
    promptLabel:
      "Fill out the contact form with the canonical demo values and submit; capture the confirmation id.",
  },
  {
    id: "0009",
    scenarioLabel: "browser:cart-checkout",
    promptLabel:
      "Add a single 12oz medium-roast bag to cart, apply the welcome code, and proceed to checkout review.",
  },
];

// 10 traces per task, distributed so totals land at ~75 scored / ~20 error / ~5 no-score.
// Per-task distribution pattern (tuned to total exactly 75 / 20 / 5):
//   tasks 0–4:  8 scored, 2 error, 0 no-score  → 40 / 10 / 0
//   tasks 5–7:  7 scored, 2 error, 1 no-score  → 21 /  6 / 3
//   tasks 8–9:  7 scored, 2 error, 1 no-score  → 14 /  4 / 2
// Total: 75 scored + 20 error + 5 no-score = 100.
type RunSpec = { state: JobRunState; reward: number | null; durationSec: number; turns: number; cost: number };

function rewardStr(r: number | null): string | null {
  return r === null ? null : r.toFixed(4);
}

function durationLabel(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function costLabel(cost: number): string {
  return cost.toFixed(4);
}

// Deterministic 8-char hex trace id from a sequential run number. Same seed
// constants as the usage-tab PRNG so the demo is stable across reloads.
function runTraceId(runNumber: number): string {
  const seed = ((runNumber * 1664525 + 1013904223) >>> 0) ^ 0xc0ffee;
  return seed.toString(16).slice(0, 8).padStart(8, "0");
}

// Vary across reward bands: ~50% high (≥0.7), ~30% mid (0.4–0.69), ~15% low (<0.4) within scored.
function buildShowcaseRuns(): ReadonlyArray<JobRun> {
  // Per-task spec arrays describing 10 runs each. Rewards span all three bands.
  const perTask: ReadonlyArray<ReadonlyArray<RunSpec>> = [
    // Task 0000 — 8 scored, 2 error, 0 no-score
    [
      { state: "scored", reward: 0.92, durationSec: 161, turns: 6, cost: 0.0091 },
      { state: "scored", reward: 0.88, durationSec: 138, turns: 5, cost: 0.0083 },
      { state: "scored", reward: 0.81, durationSec: 152, turns: 5, cost: 0.0094 },
      { state: "scored", reward: 0.73, durationSec: 169, turns: 7, cost: 0.0103 },
      { state: "scored", reward: 0.66, durationSec: 175, turns: 6, cost: 0.0098 },
      { state: "scored", reward: 0.55, durationSec: 191, turns: 8, cost: 0.0112 },
      { state: "scored", reward: 0.48, durationSec: 158, turns: 6, cost: 0.0099 },
      { state: "scored", reward: 0.36, durationSec: 207, turns: 9, cost: 0.0124 },
      { state: "error", reward: 0.45, durationSec: 182, turns: 8, cost: 0.0118 },
      { state: "error", reward: 0.31, durationSec: 169, turns: 7, cost: 0.0104 },
    ],
    // Task 0001 — 8 scored, 2 error, 0 no-score
    [
      { state: "scored", reward: 0.95, durationSec: 148, turns: 5, cost: 0.0091 },
      { state: "scored", reward: 0.83, durationSec: 192, turns: 7, cost: 0.0103 },
      { state: "scored", reward: 0.78, durationSec: 165, turns: 6, cost: 0.0098 },
      { state: "scored", reward: 0.71, durationSec: 174, turns: 6, cost: 0.0101 },
      { state: "scored", reward: 0.62, durationSec: 158, turns: 6, cost: 0.0094 },
      { state: "scored", reward: 0.51, durationSec: 142, turns: 5, cost: 0.0089 },
      { state: "scored", reward: 0.45, durationSec: 137, turns: 6, cost: 0.0119 },
      { state: "scored", reward: 0.33, durationSec: 215, turns: 9, cost: 0.0135 },
      { state: "error", reward: 0.41, durationSec: 188, turns: 9, cost: 0.0148 },
      { state: "error", reward: 0.38, durationSec: 142, turns: 6, cost: 0.0098 },
    ],
    // Task 0002 — 8 scored, 2 error, 0 no-score
    [
      { state: "scored", reward: 0.91, durationSec: 130, turns: 5, cost: 0.0087 },
      { state: "scored", reward: 0.84, durationSec: 115, turns: 4, cost: 0.0103 },
      { state: "scored", reward: 0.76, durationSec: 142, turns: 5, cost: 0.0094 },
      { state: "scored", reward: 0.69, durationSec: 167, turns: 6, cost: 0.0099 },
      { state: "scored", reward: 0.58, durationSec: 178, turns: 7, cost: 0.0108 },
      { state: "scored", reward: 0.49, durationSec: 152, turns: 6, cost: 0.0091 },
      { state: "scored", reward: 0.42, durationSec: 184, turns: 8, cost: 0.0114 },
      { state: "scored", reward: 0.28, durationSec: 213, turns: 9, cost: 0.0128 },
      { state: "error", reward: 0.55, durationSec: 144, turns: 6, cost: 0.0089 },
      { state: "error", reward: 0.5, durationSec: 138, turns: 5, cost: 0.0094 },
    ],
    // Task 0003 — 8 scored, 2 error, 0 no-score
    [
      { state: "scored", reward: 0.97, durationSec: 122, turns: 4, cost: 0.0079 },
      { state: "scored", reward: 0.85, durationSec: 138, turns: 5, cost: 0.0086 },
      { state: "scored", reward: 0.79, durationSec: 156, turns: 6, cost: 0.0093 },
      { state: "scored", reward: 0.72, durationSec: 171, turns: 6, cost: 0.0098 },
      { state: "scored", reward: 0.64, durationSec: 185, turns: 7, cost: 0.0106 },
      { state: "scored", reward: 0.53, durationSec: 192, turns: 7, cost: 0.0109 },
      { state: "scored", reward: 0.46, durationSec: 168, turns: 7, cost: 0.0099 },
      { state: "scored", reward: 0.39, durationSec: 222, turns: 9, cost: 0.0131 },
      { state: "error", reward: 0.62, durationSec: 178, turns: 8, cost: 0.0124 },
      { state: "error", reward: 0.44, durationSec: 154, turns: 6, cost: 0.0096 },
    ],
    // Task 0004 — 8 scored, 2 error, 0 no-score
    [
      { state: "scored", reward: 0.93, durationSec: 102, turns: 4, cost: 0.0072 },
      { state: "scored", reward: 0.86, durationSec: 119, turns: 4, cost: 0.0081 },
      { state: "scored", reward: 0.74, durationSec: 134, turns: 5, cost: 0.0089 },
      { state: "scored", reward: 0.71, durationSec: 148, turns: 5, cost: 0.0094 },
      { state: "scored", reward: 0.6, durationSec: 167, turns: 6, cost: 0.0103 },
      { state: "scored", reward: 0.52, durationSec: 173, turns: 6, cost: 0.0107 },
      { state: "scored", reward: 0.41, durationSec: 158, turns: 6, cost: 0.0096 },
      { state: "scored", reward: 0.35, durationSec: 198, turns: 8, cost: 0.0119 },
      { state: "error", reward: 0.58, durationSec: 162, turns: 7, cost: 0.0102 },
      { state: "error", reward: 0.39, durationSec: 144, turns: 6, cost: 0.0093 },
    ],
    // Task 0005 — 7 scored, 2 error, 1 no-score
    [
      { state: "scored", reward: 0.96, durationSec: 145, turns: 5, cost: 0.0091 },
      { state: "scored", reward: 0.82, durationSec: 161, turns: 6, cost: 0.0098 },
      { state: "scored", reward: 0.75, durationSec: 178, turns: 6, cost: 0.0107 },
      { state: "scored", reward: 0.68, durationSec: 184, turns: 7, cost: 0.0111 },
      { state: "scored", reward: 0.57, durationSec: 195, turns: 7, cost: 0.0118 },
      { state: "scored", reward: 0.47, durationSec: 172, turns: 7, cost: 0.0103 },
      { state: "scored", reward: 0.32, durationSec: 218, turns: 9, cost: 0.0134 },
      { state: "error", reward: 0.49, durationSec: 188, turns: 8, cost: 0.0121 },
      { state: "error", reward: 0.36, durationSec: 165, turns: 6, cost: 0.0099 },
      { state: "no-score", reward: null, durationSec: 0, turns: 0, cost: 0 },
    ],
    // Task 0006 — 7 scored, 2 error, 1 no-score
    [
      { state: "scored", reward: 0.89, durationSec: 132, turns: 5, cost: 0.0084 },
      { state: "scored", reward: 0.8, durationSec: 145, turns: 5, cost: 0.0091 },
      { state: "scored", reward: 0.73, durationSec: 162, turns: 6, cost: 0.0098 },
      { state: "scored", reward: 0.65, durationSec: 175, turns: 7, cost: 0.0104 },
      { state: "scored", reward: 0.54, durationSec: 188, turns: 7, cost: 0.0112 },
      { state: "scored", reward: 0.43, durationSec: 169, turns: 6, cost: 0.0102 },
      { state: "scored", reward: 0.37, durationSec: 195, turns: 8, cost: 0.0121 },
      { state: "error", reward: 0.52, durationSec: 154, turns: 6, cost: 0.0099 },
      { state: "error", reward: 0.41, durationSec: 138, turns: 5, cost: 0.0089 },
      { state: "no-score", reward: null, durationSec: 0, turns: 0, cost: 0 },
    ],
    // Task 0007 — 7 scored, 2 error, 1 no-score
    [
      { state: "scored", reward: 0.94, durationSec: 98, turns: 4, cost: 0.0068 },
      { state: "scored", reward: 0.83, durationSec: 114, turns: 4, cost: 0.0079 },
      { state: "scored", reward: 0.77, durationSec: 128, turns: 5, cost: 0.0086 },
      { state: "scored", reward: 0.7, durationSec: 142, turns: 5, cost: 0.0092 },
      { state: "scored", reward: 0.61, durationSec: 158, turns: 6, cost: 0.0098 },
      { state: "scored", reward: 0.48, durationSec: 175, turns: 7, cost: 0.0108 },
      { state: "scored", reward: 0.39, durationSec: 192, turns: 8, cost: 0.0118 },
      { state: "error", reward: 0.56, durationSec: 148, turns: 6, cost: 0.0096 },
      { state: "error", reward: 0.42, durationSec: 132, turns: 5, cost: 0.0087 },
      { state: "no-score", reward: null, durationSec: 0, turns: 0, cost: 0 },
    ],
    // Task 0008 — 7 scored, 2 error, 1 no-score
    [
      { state: "scored", reward: 0.91, durationSec: 154, turns: 6, cost: 0.0094 },
      { state: "scored", reward: 0.85, durationSec: 168, turns: 6, cost: 0.0102 },
      { state: "scored", reward: 0.76, durationSec: 182, turns: 7, cost: 0.0109 },
      { state: "scored", reward: 0.67, durationSec: 195, turns: 7, cost: 0.0116 },
      { state: "scored", reward: 0.59, durationSec: 178, turns: 7, cost: 0.0108 },
      { state: "scored", reward: 0.5, durationSec: 162, turns: 6, cost: 0.0099 },
      { state: "scored", reward: 0.34, durationSec: 218, turns: 9, cost: 0.0132 },
      { state: "error", reward: 0.61, durationSec: 188, turns: 8, cost: 0.0119 },
      { state: "error", reward: 0.45, durationSec: 148, turns: 6, cost: 0.0094 },
      { state: "no-score", reward: null, durationSec: 0, turns: 0, cost: 0 },
    ],
    // Task 0009 — 7 scored, 2 error, 1 no-score
    [
      { state: "scored", reward: 0.98, durationSec: 142, turns: 5, cost: 0.0089 },
      { state: "scored", reward: 0.87, durationSec: 158, turns: 6, cost: 0.0098 },
      { state: "scored", reward: 0.79, durationSec: 175, turns: 6, cost: 0.0106 },
      { state: "scored", reward: 0.72, durationSec: 188, turns: 7, cost: 0.0114 },
      { state: "scored", reward: 0.63, durationSec: 165, turns: 6, cost: 0.0102 },
      { state: "scored", reward: 0.51, durationSec: 152, turns: 6, cost: 0.0096 },
      { state: "scored", reward: 0.38, durationSec: 205, turns: 8, cost: 0.0125 },
      { state: "error", reward: 0.54, durationSec: 172, turns: 7, cost: 0.0108 },
      { state: "error", reward: 0.43, durationSec: 144, turns: 6, cost: 0.0094 },
      { state: "no-score", reward: null, durationSec: 0, turns: 0, cost: 0 },
    ],
  ];

  const runs: JobRun[] = [];
  let runNumber = 1;
  perTask.forEach((specs, taskIdx) => {
    const taskId = SHOWCASE_TASKS[taskIdx]!.id;
    specs.forEach((spec) => {
      runs.push({
        id: `run_${runNumber.toString().padStart(2, "0")}`,
        taskId,
        state: spec.state,
        reward: rewardStr(spec.reward),
        durationLabel: spec.state === "no-score" ? "—" : durationLabel(spec.durationSec),
        turns: spec.turns,
        costLabel: costLabel(spec.cost),
        modelId: "claude-opus-4-6",
        traceId: runTraceId(runNumber),
      });
      runNumber += 1;
    });
  });
  return runs;
}

/**
 * Roll up per-model summary stats from a flat trace list. Used by both the
 * single-model fixture (degenerate one-entry result) and the multi-model
 * fixture. App-level computation — kept next to the consumer so changes don't
 * leak into shared primitives.
 */
function computeModelSummaries(
  runs: ReadonlyArray<JobRun>,
  modelOrder: ReadonlyArray<string>,
): ReadonlyArray<JobModelSummary> {
  // Per-task winner map drives win-rate. Winner = highest avg scored reward.
  const tasksTouched = new Set(runs.map((r) => r.taskId));
  const winnerByTask = new Map<string, string | null>();
  for (const taskId of tasksTouched) {
    let bestModel: string | null = null;
    let bestAvg = -Infinity;
    for (const modelId of modelOrder) {
      const scored = runs.filter(
        (r) => r.taskId === taskId && r.modelId === modelId && r.state === "scored" && r.reward !== null,
      );
      if (scored.length === 0) continue;
      const avg = scored.reduce((a, r) => a + Number(r.reward), 0) / scored.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestModel = modelId;
      }
    }
    winnerByTask.set(taskId, bestModel);
  }

  const summaries: JobModelSummary[] = modelOrder.map((modelId) => {
    const modelRuns = runs.filter((r) => r.modelId === modelId);
    const scored = modelRuns.filter((r) => r.state === "scored" && r.reward !== null);
    const overallReward =
      scored.length === 0
        ? null
        : Number(
            (scored.reduce((a, r) => a + Number(r.reward), 0) / scored.length).toFixed(4),
          );
    const costTotal = modelRuns.reduce((acc, r) => acc + Number(r.costLabel), 0);
    const wins = Array.from(winnerByTask.values()).filter((winner) => winner === modelId).length;
    const tasksScored = Array.from(winnerByTask.values()).filter((w) => w !== null).length;
    const winRate = tasksScored === 0 ? null : Number((wins / tasksScored).toFixed(4));
    return {
      modelId,
      overallReward,
      traceCount: modelRuns.length,
      costTotal: Number(costTotal.toFixed(4)),
      winRate,
    };
  });

  // Sort winner-first by overallReward desc; null rewards sink to the end.
  summaries.sort((a, b) => {
    const aR = a.overallReward ?? -Infinity;
    const bR = b.overallReward ?? -Infinity;
    return bR - aR;
  });
  return summaries;
}

function computeFailedByModel(
  runs: ReadonlyArray<JobRun>,
  modelOrder: ReadonlyArray<string>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const modelId of modelOrder) out[modelId] = 0;
  for (const r of runs) {
    // Failed = errored with reward below the destructive band — matches the
    // banner heuristic used in the panel today.
    if (r.state === "error" && r.reward !== null && Number(r.reward) < 0.4) {
      out[r.modelId] = (out[r.modelId] ?? 0) + 1;
    }
  }
  return out;
}

const SHOWCASE_RUNS = buildShowcaseRuns();
const SHOWCASE_MODELS = computeModelSummaries(SHOWCASE_RUNS, ["claude-opus-4-6"]);
const SHOWCASE_FAILED_BY_MODEL = computeFailedByModel(SHOWCASE_RUNS, ["claude-opus-4-6"]);

const SHOWCASE_DETAIL_BASE = {
  scope: "eval" as const,
  // Demos the header `results invalidated` pill + Overview note.
  resultsInvalidated: true,
  displayTitle: "Claude Opus 4.6 on browser Tasks",
  modelId: "claude-opus-4-6",
  envId: "browser@2.4.1",
  tasksetShortId: "ts_browser",
  coverageLabel: "10 / 10 Tasks",
  runsLabel: "100 Runs",
  seed: 42,
  createdLabel: "2026-05-21 19:58:02 PT",
  createdRelativeLabel: "2d ago",
  createdDateLabel: "May 21, 2026",
  tasks: SHOWCASE_TASKS,
  initialRuns: SHOWCASE_RUNS,
  qaAgents: QA_AGENTS,
  trainTraceThreshold: 10,
  costPerRunLabel: "$0.0102 / Run",
  costPerRunCredits: "1.8 credits",
  totalCostLabel: "$1.02",
  latencyP50Label: "2m 50s",
  toolTurnsAvgLabel: "6.3",
  toolTurnsSubLabel: "598 calls / 95 Runs",
  rerunCommand: "hud eval browser-tasks --model claude-opus-4-6 --seed 42",
};

const SHOWCASE_SCOPES: Record<string, JobToolScope> = {
  all: buildScope({
    totals: { calls: 10, avgPerRun: "5.0", toolsUsed: 2 },
    tools: {
      anthropic_computer: {
        calls: 8,
        avgPerRun: "4.00",
        timeP50: "773ms",
        reward: "1.0000",
        emptyRate: "100%",
        avgOut: "—",
        share: 0.8,
      },
      launch_app: {
        calls: 2,
        avgPerRun: "1.00",
        timeP50: "2.0s",
        reward: "1.0000",
        emptyRate: "0%",
        avgOut: "38",
        share: 0.2,
      },
    },
    patterns: [
      { id: "P1", steps: ["launch_app", "anthropic_computer"], n: 2, reward: "1.0000" },
    ],
    matrix: { P1: { "0000": "1.0000", "0001": "1.0000" } },
    matrixColumns: ["0000", "0001"],
  }),
  "0000": buildScope({
    totals: { calls: 6, avgPerRun: "6.0", toolsUsed: 2 },
    tools: {
      anthropic_computer: {
        calls: 5,
        avgPerRun: "5.00",
        timeP50: "812ms",
        reward: "1.0000",
        emptyRate: "100%",
        avgOut: "—",
        share: 0.83,
      },
      launch_app: {
        calls: 1,
        avgPerRun: "1.00",
        timeP50: "2.1s",
        reward: "1.0000",
        emptyRate: "0%",
        avgOut: "41",
        share: 0.17,
      },
    },
    patterns: [
      { id: "P1", steps: ["launch_app", "anthropic_computer"], n: 1, reward: "1.0000" },
    ],
    matrix: { P1: { "0000": "1.0000" } },
    matrixColumns: ["0000"],
  }),
  "0001": buildScope({
    totals: { calls: 4, avgPerRun: "4.0", toolsUsed: 2 },
    tools: {
      anthropic_computer: {
        calls: 3,
        avgPerRun: "3.00",
        timeP50: "734ms",
        reward: "1.0000",
        emptyRate: "100%",
        avgOut: "—",
        share: 0.75,
      },
      launch_app: {
        calls: 1,
        avgPerRun: "1.00",
        timeP50: "1.9s",
        reward: "1.0000",
        emptyRate: "0%",
        avgOut: "35",
        share: 0.25,
      },
    },
    patterns: [
      { id: "P1", steps: ["launch_app", "anthropic_computer"], n: 1, reward: "1.0000" },
    ],
    matrix: { P1: { "0001": "1.0000" } },
    matrixColumns: ["0001"],
  }),
};

// Showcase Usage payload — 100 traces / 2 models, aligned with the showcase Job's
// 100 Runs so the Traces tab badge and the Usage stat strip declare the same
// trace count. Distribution: 60 Opus (3 Errored) + 40 Haiku (0 Errored) = 100.
// Aggregates are computed from the trace rows so they cannot drift.

function buildShowcaseUsageTraces(): ReadonlyArray<JobUsageTrace> {
  // Linear-congruential PRNG with a fixed seed — deterministic per build so the
  // dashboard demo is stable across reloads. (We only need it for trace-id hex
  // and reward jitter; the cost ladders are arithmetic.)
  let seed = 0xc0ffee;
  const rand = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const hex8 = (): string => rand().toString(16).slice(2, 10).padStart(8, "0");

  // Per-trace inference cost cycles through a ladder so the stat strip sums to
  // a round target. Opus avg ≈ $0.115 inference / trace, Haiku ≈ $0.025.
  const opusInfLadder = [0.15, 0.13, 0.12, 0.11, 0.10, 0.09];   // avg 0.1167
  const haikuInfLadder = [0.03, 0.025, 0.025, 0.02];             // avg 0.0250

  const taskIds = SHOWCASE_TASKS.map((t) => t.id);
  const traces: JobUsageTrace[] = [];

  // Opus group — 60 traces. First 3 are Errored. Of those, i=0 and i=1 are
  // "waste" rows — bloated turns + tokens + inference cost ≥ 2× the scored
  // median — so the Turns/Tokens warning icon + per-group waste sum demo on
  // two distinct task buckets (taskIds[0], taskIds[1]).
  for (let i = 0; i < 60; i += 1) {
    const isErrored = i < 3;
    const isWasteRow = i < 2;
    let inference: number;
    let turns: number;
    let totalTokens: number;
    if (isWasteRow) {
      // i=0: 28 turns / 58k tokens / $0.55 inf; i=1: 25 turns / 47k tokens / $0.48 inf.
      inference = i === 0 ? 0.55 : 0.48;
      turns = i === 0 ? 28 : 25;
      totalTokens = i === 0 ? 58_000 : 47_000;
    } else if (isErrored) {
      // i=2: low-burn early failure — should NOT trip the waste rule.
      inference = 0.06;
      turns = 3;
      totalTokens = 4_200;
    } else {
      inference = opusInfLadder[i % opusInfLadder.length] ?? 0.10;
      turns = 4 + ((i * 3) % 7); // 4..10
      totalTokens = 8_000 + ((i * 1_237) % 10_001); // 8k..18k
    }
    const environment = 0.04;
    const total = Number((inference + environment).toFixed(2));
    const reward = isErrored ? null : Number((0.3 + rand() * 0.7).toFixed(4));
    traces.push({
      traceId: hex8(),
      modelId: "claude-opus-4-6",
      taskId: taskIds[i % taskIds.length] ?? "0000",
      status: isErrored ? "Errored" : "Scored",
      reward,
      inferenceCost: inference,
      environmentCost: environment,
      environmentLabel: "5m base",
      total,
      turns,
      totalTokens,
    });
  }

  // Haiku group — 40 traces, all Scored.
  for (let i = 0; i < 40; i += 1) {
    const inference = haikuInfLadder[i % haikuInfLadder.length] ?? 0.025;
    const environment = 0.04;
    const total = Number((inference + environment).toFixed(2));
    const reward = Number((0.3 + rand() * 0.7).toFixed(4));
    const turns = 4 + ((i * 2) % 7); // 4..10
    const totalTokens = 8_000 + ((i * 919) % 10_001); // 8k..18k
    traces.push({
      traceId: hex8(),
      modelId: "claude-haiku-4-5",
      taskId: taskIds[i % taskIds.length] ?? "0000",
      status: "Scored",
      reward,
      inferenceCost: inference,
      environmentCost: environment,
      environmentLabel: "5m base",
      total,
      turns,
      totalTokens,
    });
  }

  return traces;
}

const SHOWCASE_USAGE_TRACES = buildShowcaseUsageTraces();

function buildShowcaseUsage(): JobUsage {
  const traces = SHOWCASE_USAGE_TRACES;
  const inferenceSum = Number(
    traces.reduce((acc, t) => acc + t.inferenceCost, 0).toFixed(2),
  );
  const environmentSum = Number(
    traces.reduce((acc, t) => acc + t.environmentCost, 0).toFixed(2),
  );
  const totalCost = Number((inferenceSum + environmentSum).toFixed(2));
  const successThreshold = 0.5;
  const successfulCount = traces.filter(
    (t) => t.reward !== null && t.reward >= successThreshold,
  ).length;
  const erroredTraces = traces.filter((t) => t.status === "Errored");
  const erroredCost = Number(
    erroredTraces.reduce((acc, t) => acc + t.total, 0).toFixed(2),
  );
  const avgPerTrace = Number((totalCost / traces.length).toFixed(2));
  const costPerSuccess =
    successfulCount > 0 ? Number((totalCost / successfulCount).toFixed(2)) : 0;

  const buildRollup = (modelId: string): JobUsageModelRollup => {
    const modelTraces = traces.filter((t) => t.modelId === modelId);
    const modelTotal = Number(
      modelTraces.reduce((acc, t) => acc + t.total, 0).toFixed(2),
    );
    const modelSuccess = modelTraces.filter(
      (t) => t.reward !== null && t.reward >= successThreshold,
    ).length;
    const modelAvg = Number((modelTotal / modelTraces.length).toFixed(2));
    const modelCostPerSuccess =
      modelSuccess > 0 ? Number((modelTotal / modelSuccess).toFixed(2)) : 0;
    const vsAvgTracePct = Number(
      ((modelAvg - avgPerTrace) / avgPerTrace).toFixed(2),
    );
    return {
      modelId,
      traces: modelTraces.length,
      avgPerTrace: modelAvg,
      costPerSuccess: modelCostPerSuccess,
      successfulCount: modelSuccess,
      total: modelTotal,
      vsAvgTracePct,
    };
  };

  return {
    total: totalCost,
    inference: inferenceSum,
    environment: environmentSum,
    tracesCount: traces.length,
    // ~8 inference calls per trace — see toolTurnsSubLabel ("598 calls / 95 Runs").
    inferenceCallsCount: traces.length * 8,
    successfulCount,
    erroredCount: erroredTraces.length,
    erroredCost,
    successThreshold,
    costCalculatedAtLabel: "32 minutes ago",
    avgPerTrace,
    costPerSuccess,
    models: [
      buildRollup("claude-opus-4-6"),
      buildRollup("claude-haiku-4-5"),
    ],
    traces,
  };
}

const SHOWCASE_USAGE: JobUsage = buildShowcaseUsage();

// Synthesize a 3-model / 30-trace Usage payload so almost every Job in the demo
// exercises the multi-model BY MODEL table, wasted-cost callout, and grouped
// per-trace breakdown. Deterministic per jobId so reloads are stable.
function synthesizeUsage(
  job: TasksetJobRow,
  seededTasks: ReadonlyArray<{ id: string }>,
): JobUsage {
  const primaryModel = job.modelName;
  // Standard siblings are claude-haiku-4-5 + gpt-4o-mini. If the primary
  // collides with one of those, swap in qwen2.5-14b so the synth Job always
  // surfaces 3 distinct model names in the per-trace `Group by: Model` view.
  const candidateSiblings = ["claude-haiku-4-5", "gpt-4o-mini", "qwen2.5-14b"];
  const siblings = candidateSiblings.filter((m) => m !== primaryModel).slice(0, 2);

  const taskIds = seededTasks.length > 0
    ? seededTasks.map((t) => t.id)
    : ["0000", "0001", "0002"];

  // Per-model spec: trace count, avg inference cost, env cost. Primary is the most
  // expensive (above job avg → red badge), mid sits near job avg (green near-zero),
  // cheap is well under (strong green badge).
  const modelSpecs: ReadonlyArray<{
    modelId: string;
    traceCount: number;
    inferenceBase: number;
    inferenceStep: number;
    environment: number;
    erroredCount: number;
  }> = [
    {
      modelId: primaryModel,
      traceCount: 12,
      inferenceBase: 0.13,
      inferenceStep: 0.005,
      environment: 0.04,
      erroredCount: 2,
    },
    {
      modelId: siblings[0] ?? "claude-haiku-4-5",
      traceCount: 10,
      inferenceBase: 0.05,
      inferenceStep: 0.003,
      environment: 0.04,
      erroredCount: 0,
    },
    {
      modelId: siblings[1] ?? "gpt-4o-mini",
      traceCount: 8,
      inferenceBase: 0.02,
      inferenceStep: 0.002,
      environment: 0.04,
      erroredCount: 0,
    },
  ];

  // Tiny deterministic PRNG seeded off jobId so reloads are stable. Linear
  // congruential, good enough for demo trace ids + reward jitter.
  let seed = 0;
  for (let i = 0; i < job.id.length; i += 1) {
    seed = (seed * 31 + job.id.charCodeAt(i)) >>> 0;
  }
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const hex8 = () => rand().toString(16).slice(2, 10).padStart(8, "0");

  const traces: JobUsageTrace[] = [];
  for (const spec of modelSpecs) {
    for (let i = 0; i < spec.traceCount; i += 1) {
      const isErrored = i < spec.erroredCount;
      // Primary model has 2 errored rows — both inflated to waste-flag levels
      // (inference ≥ 2× scored median ≈ 0.04). They cycle onto distinct task
      // ids (i=0 → taskIds[0], i=1 → taskIds[1]) so the Group-by-Task demo
      // surfaces the per-group waste sum on two parent rows.
      const isWasteRow = isErrored && spec.modelId === primaryModel && i < 2;
      let inference: number;
      let turns: number;
      let totalTokens: number;
      if (isWasteRow) {
        inference = i === 0 ? 0.52 : 0.46;
        turns = i === 0 ? 27 : 24;
        totalTokens = i === 0 ? 55_000 : 46_000;
      } else if (isErrored) {
        inference = 0.06;
        turns = 3;
        totalTokens = 4_000;
      } else {
        inference = Number((spec.inferenceBase - spec.inferenceStep * i).toFixed(4));
        turns = 4 + ((i * 3) % 7);
        totalTokens = 8_000 + ((i * 1_237) % 10_001);
      }
      const environment = spec.environment;
      const total = Number((inference + environment).toFixed(4));
      // Scored reward in 0.3..1.0 with 4dp; errored null.
      const reward = isErrored ? null : Number((0.3 + rand() * 0.7).toFixed(4));
      traces.push({
        traceId: hex8(),
        modelId: spec.modelId,
        taskId: taskIds[i % taskIds.length] ?? "0000",
        status: isErrored ? "Errored" : "Scored",
        reward,
        inferenceCost: inference,
        environmentCost: environment,
        environmentLabel: "5m base",
        total,
        turns,
        totalTokens,
      });
    }
  }

  // Aggregate from rows so totals and per-model rollups can never drift.
  const inferenceSum = Number(traces.reduce((acc, t) => acc + t.inferenceCost, 0).toFixed(4));
  const environmentSum = Number(traces.reduce((acc, t) => acc + t.environmentCost, 0).toFixed(4));
  const totalCost = Number((inferenceSum + environmentSum).toFixed(4));
  const successfulCount = traces.filter(
    (t) => t.reward !== null && t.reward >= 0.5,
  ).length;
  const erroredTraces = traces.filter((t) => t.status === "Errored");
  const erroredCost = Number(
    erroredTraces.reduce((acc, t) => acc + t.total, 0).toFixed(4),
  );
  const jobAvgPerTrace = traces.length > 0 ? totalCost / traces.length : 0;
  const costPerSuccess =
    successfulCount > 0 ? Number((totalCost / successfulCount).toFixed(4)) : 0;

  const models: ReadonlyArray<JobUsageModelRollup> = modelSpecs.map((spec) => {
    const modelTraces = traces.filter((t) => t.modelId === spec.modelId);
    const modelTotal = Number(modelTraces.reduce((acc, t) => acc + t.total, 0).toFixed(4));
    const modelSuccess = modelTraces.filter(
      (t) => t.reward !== null && t.reward >= 0.5,
    ).length;
    const modelAvg =
      modelTraces.length > 0 ? Number((modelTotal / modelTraces.length).toFixed(4)) : 0;
    const modelCostPerSuccess =
      modelSuccess > 0 ? Number((modelTotal / modelSuccess).toFixed(4)) : 0;
    const vsAvgTracePct =
      jobAvgPerTrace > 0
        ? Number(((modelAvg - jobAvgPerTrace) / jobAvgPerTrace).toFixed(4))
        : 0;
    return {
      modelId: spec.modelId,
      traces: modelTraces.length,
      avgPerTrace: modelAvg,
      costPerSuccess: modelCostPerSuccess,
      successfulCount: modelSuccess,
      total: modelTotal,
      vsAvgTracePct,
    };
  });

  return {
    total: totalCost,
    inference: inferenceSum,
    environment: environmentSum,
    tracesCount: traces.length,
    inferenceCallsCount: traces.length * 8,
    successfulCount,
    erroredCount: erroredTraces.length,
    erroredCost,
    successThreshold: 0.5,
    costCalculatedAtLabel: "a few minutes ago",
    avgPerTrace: Number(jobAvgPerTrace.toFixed(4)),
    costPerSuccess,
    models,
    traces,
  };
}

// Heuristic fallback — synthesize a plausible detail for any job row without a hand-crafted payload.
// Keeps the page non-empty for jobs other than the showcase.
function synthesizeDetail(job: TasksetJobRow, taskset: Taskset): JobDetail {
  const seededTasks = (taskset.tasks.length > 0
    ? taskset.tasks.slice(0, 4)
    : [
        { taskId: "0000" },
        { taskId: "0001" },
        { taskId: "0002" },
      ]
  ).map((t) => ({ id: t.taskId }));

  // 30 initialRuns — aligned with synthesizeUsage()'s 30 trace rows so the
  // Traces tab badge and the Usage stat strip declare the same count. Two
  // errored runs for non-invalidated jobs so the failure banner surfaces.
  // Tasks cycle round-robin across seeds. `job.state === "invalidated"` is a
  // JOB-level flag that drives `resultsInvalidated` below — it does NOT flip
  // per-trace status.
  const RUN_COUNT = 30;
  const taskIdsForRuns = seededTasks.length > 0 ? seededTasks : [{ id: "0000" }];
  const baseReward = job.reward ?? 0.5;
  const initialRuns: ReadonlyArray<JobRun> = Array.from({ length: RUN_COUNT }, (_, idx) => {
    const taskId = taskIdsForRuns[idx % taskIdsForRuns.length]!.id;
    // Last 2 runs are errored — destructive band, banner-eligible.
    const isErrored = idx >= RUN_COUNT - 2;
    // Vary reward across rows so the trace tree shows a band spread; keep around
    // the parent job's `reward` so the page-level summary still reads "right".
    const rewardJitter = ((idx % 7) - 3) * 0.05; // -0.15..+0.15
    const reward = Math.max(0, Math.min(1, baseReward + rewardJitter));
    const durationSec = 130 + (idx % 9) * 12;
    const turns = 4 + (idx % 5);
    const cost = 0.008 + (idx % 6) * 0.0008;
    return {
      id: `run_${(idx + 1).toString().padStart(2, "0")}`,
      taskId,
      state: isErrored ? ("error" as JobRunState) : ("scored" as JobRunState),
      reward: reward.toFixed(4),
      durationLabel: durationLabel(durationSec),
      turns,
      costLabel: cost.toFixed(4),
      modelId: job.modelName,
      traceId: runTraceId(idx + 1),
    };
  });

  const allScope = buildScope({
    totals: { calls: initialRuns.length * 4, avgPerRun: "4.0", toolsUsed: 1 },
    tools: {
      anthropic_computer: {
        calls: initialRuns.length * 4,
        avgPerRun: "4.00",
        timeP50: "780ms",
        reward: initialRuns[0]?.reward ?? "0.0000",
        emptyRate: "—",
        avgOut: "—",
        share: 1,
      },
    },
    patterns: [
      {
        id: "P1",
        steps: ["anthropic_computer"],
        n: initialRuns.length,
        reward: initialRuns[0]?.reward ?? "0.0000",
      },
    ],
    matrix: {
      P1: Object.fromEntries(initialRuns.map((r) => [r.taskId, r.reward ?? "—"])),
    },
    // 30 runs cycle round-robin across `taskIdsForRuns`, so the same taskId
    // repeats ~7-8×. Matrix columns are one-per-task (not one-per-run); dedupe
    // preserving the seed order. Without this, React warns on duplicate keys
    // in <PatternMatrix>.
    matrixColumns: Array.from(new Set(initialRuns.map((r) => r.taskId))),
  });

  const perTaskScopes: Record<string, JobToolScope> = Object.fromEntries(
    initialRuns.map((r) => [
      r.taskId,
      buildScope({
        totals: { calls: 4, avgPerRun: "4.0", toolsUsed: 1 },
        tools: {
          anthropic_computer: {
            calls: 4,
            avgPerRun: "4.00",
            timeP50: "780ms",
            reward: r.reward ?? "0.0000",
            emptyRate: "—",
            avgOut: "—",
            share: 1,
          },
        },
        patterns: [
          { id: "P1", steps: ["anthropic_computer"], n: 1, reward: r.reward ?? "0.0000" },
        ],
        matrix: { P1: { [r.taskId]: r.reward ?? "—" } },
        matrixColumns: [r.taskId],
      }),
    ]),
  );

  // Tasks coverage = distinct tasks hit by initialRuns (not total seeded). Runs
  // cycle round-robin so coverage stays at `seededTasks.length` once 30 runs
  // distribute across the seed set.
  const coveredTaskCount = new Set(initialRuns.map((r) => r.taskId)).size;
  const totalRunCost = initialRuns.reduce(
    (acc, r) => acc + Number.parseFloat(r.costLabel),
    0,
  );
  const avgRunCost = initialRuns.length > 0 ? totalRunCost / initialRuns.length : 0;

  return {
    job,
    taskset,
    scope: job.type,
    resultsInvalidated: job.state === "invalidated",
    displayTitle: `${job.modelName} on ${taskset.name} Tasks`,
    modelId: job.modelName,
    envId: `${taskset.name}@latest`,
    tasksetShortId: `ts_${taskset.id}`,
    coverageLabel: `${coveredTaskCount} / ${seededTasks.length} Tasks`,
    runsLabel: `${initialRuns.length} Runs`,
    seed: 42,
    createdLabel: job.when ? `${job.when} ago` : "—",
    createdRelativeLabel: job.when ? `${job.when} ago` : "—",
    // Synth jobs have no fixture calendar date — fall back to the relative label so
    // the meta line still reads as a single value rather than a dash.
    createdDateLabel: job.when ? `${job.when} ago` : "—",
    tasks: seededTasks,
    initialRuns,
    toolScopes: { all: allScope, ...perTaskScopes },
    qaAgents: QA_AGENTS,
    trainTraceThreshold: 10,
    costPerRunLabel: `$${avgRunCost.toFixed(4)} / Run`,
    costPerRunCredits: "—",
    totalCostLabel: `$${totalRunCost.toFixed(2)}`,
    latencyP50Label: "2m 30s",
    toolTurnsAvgLabel: "4.0",
    toolTurnsSubLabel: `${initialRuns.length * 4} calls / ${initialRuns.length} Runs`,
    rerunCommand: `hud eval ${taskset.id} --model ${job.modelName} --seed 42`,
    usage: synthesizeUsage(job, seededTasks),
    models: computeModelSummaries(initialRuns, [job.modelName]),
    failedByModel: computeFailedByModel(initialRuns, [job.modelName]),
  };
}

export function findJobDetail(jobId: string): JobDetail | undefined {
  if (jobId === MULTI_MODEL_JOB_ID) return getMultiModelDetail();

  const found = findJobById(jobId);
  if (!found) return undefined;

  if (jobId === "job_4c8e1a20") {
    return {
      job: found.job,
      taskset: found.taskset,
      ...SHOWCASE_DETAIL_BASE,
      toolScopes: SHOWCASE_SCOPES,
      usage: SHOWCASE_USAGE,
      models: SHOWCASE_MODELS,
      failedByModel: SHOWCASE_FAILED_BY_MODEL,
    };
  }

  return synthesizeDetail(found.job, found.taskset);
}

// Showcase job needs to be reachable. If the synth taskset doesn't already host
// it, inject it under `hud-browser` for routing. (No-op if the id already exists.)
export function ensureShowcaseJob(): void {
  const taskset = getTaskset("hud-browser");
  if (!taskset) return;
  if (taskset.jobs.find((j) => j.id === "job_4c8e1a20")) return;
  // Mutate readonly array in-place — only acceptable because mock data is module-singleton.
  (taskset.jobs as Array<TasksetJobRow>).push({
    id: "job_4c8e1a20",
    state: "invalidated",
    type: "eval",
    title: "Claude Opus 4.6 on browser Tasks",
    subtitle: "results invalidated — non-deterministic grader",
    modelName: "claude-opus-4-6",
    modelId: "claude-opus-4-6",
    environmentId: "browser",
    modelVersion: "—",
    ownerName: "Aman",
    ownerScope: "self",
    reward: 1.0,
    delta: null,
    cost: "0.0194",
    whenSort: 240,
    when: "4h",
    frac: "2/2",
    traces: "ii",
    traceCount: 2,
    isPrivate: true,
  });
}

// Trigger injection eagerly so server components see the row.
ensureShowcaseJob();

// ── Multi-model demo fixture ─────────────────────────────────────────────────
// Reachable at /jobs/job-multi-model. Independent of the taskset row registry
// (the route handler short-circuits in findJobDetail before findJobById runs).
// 3 models × 10 tasks × 3 attempts per model = 90 traces total. Aggregates are
// tuned so the chip cluster header reads `gpt-4o 0.81 · qwen2.5-14b 0.73 ·
// llama-3.1-8b 0.65` and matches the canonical mockup.

export const MULTI_MODEL_JOB_ID = "job-multi-model";

const MULTI_MODEL_TASKS: ReadonlyArray<JobTask> = SHOWCASE_TASKS;

const MULTI_MODEL_MODEL_ORDER = ["gpt-4o", "qwen2.5-14b", "llama-3.1-8b"] as const;

// Hand-tuned per-model run specs for each task. Lengths chosen so per-task
// totals match the mockup's collapsed-row pill ("9 traces", "7 traces", …) and
// per-model averages land near the overall reward target.
//
// Per model targets (avg over all scored traces across all tasks):
//   gpt-4o      → 0.81 (success band)
//   qwen2.5-14b → 0.73 (success band, just over threshold)
//   llama-3.1-8b → 0.65 (warning band)
//
// Failure distribution (matches mockup banner "gpt-4o 0 · qwen 2 · llama 3"):
//   gpt-4o 0 error<0.4 · qwen 2 · llama 3.

type MultiRunSpec = { state: JobRunState; reward: number | null; durationSec: number; turns: number; cost: number };

interface MultiModelTaskBlock {
  taskId: string;
  perModel: Record<string, ReadonlyArray<MultiRunSpec>>;
}

// Task 0001 — mockup-canonical row. gpt-4o avg 0.81 · qwen 0.73 · llama 0.65.
const MM_TASK_0001: MultiModelTaskBlock = {
  taskId: "0001",
  perModel: {
    "gpt-4o": [
      { state: "scored", reward: 0.91, durationSec: 115, turns: 4, cost: 0.0091 },
      { state: "scored", reward: 0.81, durationSec: 148, turns: 5, cost: 0.0103 },
      { state: "scored", reward: 0.71, durationSec: 151, turns: 7, cost: 0.0116 },
    ],
    "qwen2.5-14b": [
      { state: "scored", reward: 0.82, durationSec: 161, turns: 5, cost: 0.0098 },
      { state: "scored", reward: 0.75, durationSec: 164, turns: 6, cost: 0.0102 },
      { state: "scored", reward: 0.62, durationSec: 168, turns: 7, cost: 0.0098 },
    ],
    "llama-3.1-8b": [
      { state: "scored", reward: 0.71, durationSec: 178, turns: 7, cost: 0.0081 },
      { state: "scored", reward: 0.62, durationSec: 181, turns: 7, cost: 0.0079 },
      { state: "scored", reward: 0.62, durationSec: 182, turns: 8, cost: 0.0081 },
    ],
  },
};

// Task 0002 — mockup row: gpt-4o 0.79 · qwen 0.71 · llama —. 6/7 attempted.
const MM_TASK_0002: MultiModelTaskBlock = {
  taskId: "0002",
  perModel: {
    "gpt-4o": [
      { state: "scored", reward: 0.85, durationSec: 132, turns: 5, cost: 0.0094 },
      { state: "scored", reward: 0.79, durationSec: 147, turns: 6, cost: 0.0098 },
      { state: "scored", reward: 0.73, durationSec: 158, turns: 6, cost: 0.0096 },
    ],
    "qwen2.5-14b": [
      { state: "scored", reward: 0.78, durationSec: 162, turns: 6, cost: 0.0091 },
      { state: "scored", reward: 0.71, durationSec: 170, turns: 6, cost: 0.0089 },
      { state: "scored", reward: 0.64, durationSec: 174, turns: 7, cost: 0.0087 },
    ],
    "llama-3.1-8b": [
      { state: "no-score", reward: null, durationSec: 0, turns: 0, cost: 0 },
    ],
  },
};

// Remaining tasks 0000, 0003–0009. Each runs all 3 models with 3 attempts.
// Reward bands distributed to keep overall averages on target. llama failure
// runs concentrate here (3 destructive-band errors vs qwen 2 vs gpt-4o 0).
function buildMultiModelGenericTasks(): ReadonlyArray<MultiModelTaskBlock> {
  // Per-model reward ladders — values are pre-jittered to land overall averages
  // on target (gpt-4o ≈ 0.81, qwen ≈ 0.73, llama ≈ 0.65) when combined with
  // task 0001+0002 above.
  const gptLadder = [0.92, 0.85, 0.78, 0.73, 0.83, 0.79, 0.77, 0.81] as const;
  const qwenLadder = [0.79, 0.74, 0.68, 0.71, 0.75, 0.73, 0.72, 0.70] as const;
  const llamaLadder = [0.70, 0.66, 0.61, 0.68, 0.62, 0.63, 0.66, 0.64] as const;

  // Failure plan — qwen 2 destructive (<0.4), llama 3 destructive (<0.4) across
  // these 8 tasks. gpt-4o stays clean.
  const qwenFailTasks = new Set([0, 3]);    // 2 failures
  const llamaFailTasks = new Set([0, 4, 7]); // 3 failures

  const taskIds = ["0000", "0003", "0004", "0005", "0006", "0007", "0008", "0009"];
  return taskIds.map((taskId, idx) => {
    const gptR = gptLadder[idx]!;
    const qwenR = qwenLadder[idx]!;
    const llamaR = llamaLadder[idx]!;

    // 3 traces per model. Spread reward around the ladder midpoint so per-task
    // avg lands within ±0.05 of the ladder value.
    const gpt: ReadonlyArray<MultiRunSpec> = [
      { state: "scored", reward: gptR + 0.05, durationSec: 138, turns: 5, cost: 0.0091 },
      { state: "scored", reward: gptR, durationSec: 152, turns: 6, cost: 0.0098 },
      { state: "scored", reward: gptR - 0.05, durationSec: 167, turns: 6, cost: 0.0103 },
    ];
    const qwen: ReadonlyArray<MultiRunSpec> = qwenFailTasks.has(idx)
      ? [
          { state: "scored", reward: qwenR + 0.04, durationSec: 168, turns: 6, cost: 0.0092 },
          { state: "scored", reward: qwenR - 0.04, durationSec: 175, turns: 7, cost: 0.0094 },
          // Destructive failure (reward<0.4) → counted in failed-by-model breakdown
          { state: "error", reward: 0.32, durationSec: 188, turns: 8, cost: 0.0108 },
        ]
      : [
          { state: "scored", reward: qwenR + 0.04, durationSec: 172, turns: 6, cost: 0.0091 },
          { state: "scored", reward: qwenR, durationSec: 178, turns: 7, cost: 0.0094 },
          { state: "scored", reward: qwenR - 0.04, durationSec: 181, turns: 7, cost: 0.0097 },
        ];
    const llama: ReadonlyArray<MultiRunSpec> = llamaFailTasks.has(idx)
      ? [
          { state: "scored", reward: llamaR + 0.05, durationSec: 184, turns: 7, cost: 0.0078 },
          { state: "scored", reward: llamaR - 0.04, durationSec: 195, turns: 8, cost: 0.0081 },
          { state: "error", reward: 0.28, durationSec: 215, turns: 9, cost: 0.0092 },
        ]
      : [
          { state: "scored", reward: llamaR + 0.05, durationSec: 188, turns: 7, cost: 0.0079 },
          { state: "scored", reward: llamaR, durationSec: 197, turns: 8, cost: 0.0082 },
          { state: "scored", reward: llamaR - 0.05, durationSec: 204, turns: 8, cost: 0.0085 },
        ];

    return {
      taskId,
      perModel: {
        "gpt-4o": gpt,
        "qwen2.5-14b": qwen,
        "llama-3.1-8b": llama,
      },
    };
  });
}

function buildMultiModelRuns(): ReadonlyArray<JobRun> {
  // Order: keep task 0000 first to match SHOWCASE_TASKS order; insert 0001, 0002
  // at index 1, 2.
  const generic = buildMultiModelGenericTasks();
  const byTaskId = new Map<string, MultiModelTaskBlock>();
  for (const block of generic) byTaskId.set(block.taskId, block);
  byTaskId.set(MM_TASK_0001.taskId, MM_TASK_0001);
  byTaskId.set(MM_TASK_0002.taskId, MM_TASK_0002);

  const runs: JobRun[] = [];
  let runNumber = 1;
  for (const task of MULTI_MODEL_TASKS) {
    const block = byTaskId.get(task.id);
    if (!block) continue;
    for (const modelId of MULTI_MODEL_MODEL_ORDER) {
      const specs = block.perModel[modelId] ?? [];
      specs.forEach((spec) => {
        runs.push({
          id: `run_${runNumber.toString().padStart(2, "0")}`,
          taskId: task.id,
          state: spec.state,
          reward: rewardStr(spec.reward),
          durationLabel: spec.state === "no-score" ? "—" : durationLabel(spec.durationSec),
          turns: spec.turns,
          costLabel: costLabel(spec.cost),
          modelId,
          traceId: runTraceId(runNumber),
        });
        runNumber += 1;
      });
    }
  }
  return runs;
}

const MULTI_MODEL_RUNS = buildMultiModelRuns();
const MULTI_MODEL_MODELS = computeModelSummaries(MULTI_MODEL_RUNS, [...MULTI_MODEL_MODEL_ORDER]);
const MULTI_MODEL_FAILED_BY_MODEL = computeFailedByModel(
  MULTI_MODEL_RUNS,
  [...MULTI_MODEL_MODEL_ORDER],
);

// Self-contained job row + taskset row. We don't register these in the global
// taskset list (multi-model job is reachable by direct URL only — the operator
// uses it to A/B compare against the single-model showcase).
const MULTI_MODEL_JOB_ROW: TasksetJobRow = {
  id: MULTI_MODEL_JOB_ID,
  state: "completed",
  type: "eval",
  title: "Multi-model browser sweep — 3 models",
  subtitle: "10 Tasks × 3 Models",
  modelName: "gpt-4o",
  // Multi-model job row — first model in the cluster is the header anchor.
  modelId: "multi",
  environmentId: "browser",
  modelVersion: "—",
  ownerName: "Aman",
  ownerScope: "self",
  reward: 0.81,
  delta: null,
  cost: "0.2941",
  whenSort: 60,
  when: "1h",
  frac: "9/10",
  traceCount: MULTI_MODEL_RUNS.length,
  isPrivate: true,
};

function getMultiModelDetail(): JobDetail {
  // Borrow the showcase taskset for the page header. The taskset is only used
  // for back-link copy + tasksetShortId display.
  const taskset = getTaskset("hud-browser");
  if (!taskset) {
    // Defensive fallback — shouldn't fire in practice since taskset is module
    // singleton, but the type system needs the guard.
    throw new Error("Multi-model demo fixture: hud-browser taskset missing");
  }
  return {
    job: MULTI_MODEL_JOB_ROW,
    taskset,
    scope: "eval",
    resultsInvalidated: false,
    displayTitle: "Multi-model browser sweep",
    modelId: "gpt-4o",
    envId: "browser@2.4.1",
    tasksetShortId: "ts_browser",
    coverageLabel: `${MULTI_MODEL_TASKS.length} / ${MULTI_MODEL_TASKS.length} Tasks`,
    runsLabel: `${MULTI_MODEL_RUNS.length} Runs`,
    seed: 42,
    createdLabel: "2026-06-14 11:02:18 PT",
    createdRelativeLabel: "1h ago",
    createdDateLabel: "Jun 14, 2026",
    tasks: MULTI_MODEL_TASKS,
    initialRuns: MULTI_MODEL_RUNS,
    toolScopes: SHOWCASE_SCOPES,
    qaAgents: QA_AGENTS,
    trainTraceThreshold: 10,
    costPerRunLabel: "$0.0033 / Run",
    costPerRunCredits: "0.6 credits",
    totalCostLabel: "$0.29",
    latencyP50Label: "2m 45s",
    toolTurnsAvgLabel: "6.4",
    toolTurnsSubLabel: `${MULTI_MODEL_RUNS.length * 6} calls / ${MULTI_MODEL_RUNS.length} Runs`,
    rerunCommand: "hud eval browser-tasks --model gpt-4o,qwen2.5-14b,llama-3.1-8b --seed 42",
    usage: SHOWCASE_USAGE,
    models: MULTI_MODEL_MODELS,
    failedByModel: MULTI_MODEL_FAILED_BY_MODEL,
  };
}
