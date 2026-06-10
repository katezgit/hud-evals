export type TasksetVisibility = "public" | "private";
/** Which tab this taskset lands on in the index. */
export type TasksetOwnership = "team" | "user" | "community";
export type TasksetPurpose = "benchmark" | "training";

export interface TasksetLeaderboardRow {
  /** 1-based ranking inside this taskset's leaderboard. */
  rank: number;
  agentName: string;
  /** Sub-line shown under the agent name — usually "on <base-taskset>". */
  agentBaseTaskset?: string;
  /** Mean score across all task runs. 0..1 or null when not yet computed. */
  average: number | null;
  /** Best-of-3 score: max over 3 attempts per task, averaged. */
  best3: number | null;
  /** Best-of-5 score. */
  best5: number | null;
  /** Best-of-10 score. */
  best10: number | null;
  /** pass@1 — fraction of tasks scored ≥ threshold on first attempt. */
  pass1: number | null;
  /** Mean number of steps consumed per task. */
  steps: number | null;
}

export interface TasksetTaskRow {
  /** Row number (1-based, stable). */
  index: number;
  /** Total runs / attempts recorded against this task. */
  tr: number;
  /** Task ID (string for left-padded display: "0000", "0001"). */
  taskId: string;
  /** Task definition version. */
  taskVersion: number;
  /** Aggregate progress 0..1 (across recorded attempts). */
  progress: number;
  /** Reward score 0..1 (mean over attempts). */
  reward: number;
  /** Distribution indicator (single 0..1 number — width of the bar). */
  dist: number;
  /** Human relative time: "9d ago". */
  updated: string;
  /** Scenario key, e.g. "browser:2048-near-win". */
  scenario: string;
  /** Per-taskset custom column values (key matches `customColumns[].key`). */
  customColumns?: Record<string, string | number | null>;
}

export type TasksetJobState =
  | "running"
  | "queued"
  | "completed"
  | "failed"
  | "errored"
  | "invalidated";
export type TasksetJobType = "eval" | "train";
export type TasksetJobOwnerScope = "self" | "team" | "cron";

export interface TasksetJobTraceDistribution {
  scored: number;
  failed: number;
  errored: number;
  notrun: number;
  running?: number;
}

export interface TasksetJobRow {
  id: string;
  state: TasksetJobState;
  type: TasksetJobType;
  title: string;
  /** Sub-line: "step 4,096 / 10,000 · kl=0.02" OR "4 Tasks × 4 Models". */
  subtitle: string;
  /** Warning flag tag, e.g. "reward-hack?". Reserved for future provenance use. */
  flag?: string;
  modelName: string;
  /** Model version label — "v3" or "—". */
  modelVersion: string;
  ownerName: string;
  ownerScope: TasksetJobOwnerScope;
  /** Reward 0..1, null when errored. */
  reward: number | null;
  /** Δ-from-prev, signed. null when unavailable. */
  delta: number | null;
  /** Cost in credits, formatted-string for display ("1,284"). */
  cost: string;
  /** Sort key: minutes-ago (0 = newest). */
  whenSort: number;
  /** Human label "3h", "12m", "1d", or null when state === "running". */
  when: string | null;
  /** Train-only: sparkline reward series, length 6–10. */
  spark?: ReadonlyArray<number>;
  /** Train-only: "4,096 Runs" or "10,000 Runs". */
  runsLabel?: string;
  /** Eval-only: "16/24" frac display. */
  frac?: string;
  /** Eval-only inline trace string when small (≤40 traces); chars s|f|e|r|n. */
  traces?: string;
  /** Eval-only outcome distribution when too many to render as squares. */
  dist?: TasksetJobTraceDistribution;
  /** Total trace count. */
  traceCount: number;
  /** Whether this job is part of a private taskset run. */
  isPrivate: boolean;
}

export interface TasksetCustomColumn {
  key: string;
  label: string;
  type: "integer" | "string" | "number" | "boolean";
}

export interface TasksetProgressStep {
  key: string;
  label: string;
  mode: "auto" | "manual";
  always: boolean;
}

export interface Taskset {
  id: string;
  name: string;
  ownership: TasksetOwnership;
  visibility: TasksetVisibility;
  purpose: TasksetPurpose;
  ownerName: string;
  starCount: number;
  isStarred: boolean;
  taskCount: number;
  modelCount: number;
  systemPrompt?: string;
  progressSteps: ReadonlyArray<TasksetProgressStep>;
  customColumns: ReadonlyArray<TasksetCustomColumn>;
  leaderboard: ReadonlyArray<TasksetLeaderboardRow>;
  tasks: ReadonlyArray<TasksetTaskRow>;
  jobs: ReadonlyArray<TasksetJobRow>;
  /** Sort surrogate: lower = newer. Stable across reloads (mock-only). */
  createdOrder: number;
}

const DEFAULT_PROGRESS_STEPS: ReadonlyArray<TasksetProgressStep> = [
  { key: "prompt", label: "Prompt", mode: "auto", always: true },
  { key: "reward", label: "Reward", mode: "auto", always: true },
];

const HUD_BROWSER_LEADERBOARD: ReadonlyArray<TasksetLeaderboardRow> = [
  {
    rank: 1,
    agentName: "Claude Haiku 4.5",
    agentBaseTaskset: "on hud-browser",
    average: 0.4,
    best3: 0.5,
    best5: 0.55,
    best10: 0.6,
    pass1: 0.32,
    steps: 18,
  },
  {
    rank: 2,
    agentName: "Kate Im's GPT 5 (2)",
    agentBaseTaskset: "on hud-browser",
    average: 0.25,
    best3: 0.35,
    best5: 0.4,
    best10: 0.45,
    pass1: 0.2,
    steps: 22,
  },
  {
    rank: 3,
    agentName: "Amazon Nova 2 Lite",
    agentBaseTaskset: "on hud-browser",
    average: 0,
    best3: 0,
    best5: 0,
    best10: 0,
    pass1: 0,
    steps: 30,
  },
  {
    rank: 4,
    agentName: "Kate Im's GPT 5 (1)",
    agentBaseTaskset: "on hud-browser",
    average: null,
    best3: null,
    best5: null,
    best10: null,
    pass1: null,
    steps: null,
  },
];

const HUD_BROWSER_TASKS: ReadonlyArray<TasksetTaskRow> = [
  {
    index: 1,
    tr: 4,
    taskId: "0000",
    taskVersion: 1,
    progress: 0.5,
    reward: 0.4,
    dist: 0.4,
    updated: "9d ago",
    scenario: "browser:2048-near-win",
    customColumns: { target: 2048, title: "Reach 2048 tile" },
  },
  {
    index: 2,
    tr: 4,
    taskId: "0001",
    taskVersion: 1,
    progress: 0.75,
    reward: 0.55,
    dist: 0.55,
    updated: "9d ago",
    scenario: "browser:todo-create",
    customColumns: { target: 5, title: "check errands" },
  },
  {
    index: 3,
    tr: 3,
    taskId: "0002",
    taskVersion: 1,
    progress: 0.33,
    reward: 0.2,
    dist: 0.2,
    updated: "10d ago",
    scenario: "browser:2048-near-win",
    customColumns: { target: 1024, title: "Reach 1024 tile" },
  },
  {
    index: 4,
    tr: 2,
    taskId: "0003",
    taskVersion: 1,
    progress: 0.0,
    reward: 0.0,
    dist: 0.0,
    updated: "11d ago",
    scenario: "browser:todo-create",
    customColumns: { target: 3, title: "draft shopping list" },
  },
];

const HUD_BROWSER_JOBS: ReadonlyArray<TasksetJobRow> = [
  {
    id: "job_3e1b08",
    state: "queued",
    type: "eval",
    title: "Eval: nightly regression",
    subtitle: "queued · awaiting GPU slot",
    modelName: "claude-opus-4.7",
    modelVersion: "—",
    ownerName: "Aman",
    ownerScope: "self",
    reward: null,
    delta: null,
    cost: "—",
    whenSort: -1,
    when: null,
    frac: "0/24",
    traceCount: 24,
    isPrivate: true,
  },
  {
    id: "job_9f3ac1",
    state: "running",
    type: "train",
    title: "GRPO sweep · lr=2e-6",
    subtitle: "step 4,096 / 10,000 · kl=0.02",
    modelName: "qwen2.5-14b",
    modelVersion: "v3",
    ownerName: "Aman",
    ownerScope: "self",
    reward: 0.7341,
    delta: 0.0412,
    cost: "1,284",
    whenSort: 0,
    when: null,
    spark: [0.41, 0.46, 0.52, 0.55, 0.61, 0.66, 0.7, 0.7341],
    runsLabel: "4,096 Runs",
    traceCount: 4096,
    isPrivate: true,
  },
  {
    id: "job_5d22e0",
    state: "completed",
    type: "eval",
    title: "Eval: full regression",
    subtitle: "4 Tasks × 4 Models",
    modelName: "multi · 4",
    modelVersion: "—",
    ownerName: "Aman",
    ownerScope: "self",
    reward: 0.6719,
    delta: 0.014,
    cost: "1,402",
    whenSort: 180,
    when: "3h",
    frac: "86/128",
    traceCount: 128,
    dist: { scored: 86, failed: 28, errored: 6, notrun: 8 },
    isPrivate: true,
  },
  {
    id: "job_4b7e22",
    state: "running",
    type: "eval",
    title: "Prompted baseline — opus",
    subtitle: "4 Tasks × 2 Models",
    modelName: "claude-opus-4.6",
    modelVersion: "—",
    ownerName: "Aman",
    ownerScope: "self",
    reward: 0.8125,
    delta: null,
    cost: "312",
    whenSort: 1,
    when: null,
    frac: "16/24",
    traces: "sssssssssssssssfferrrnn",
    traceCount: 24,
    isPrivate: true,
  },
  {
    id: "job_8c01af",
    state: "completed",
    type: "train",
    title: "GRPO sweep · lr=1e-6",
    subtitle: "converged · 10,000 steps",
    modelName: "qwen2.5-14b",
    modelVersion: "v2",
    ownerName: "Aman",
    ownerScope: "self",
    reward: 0.7912,
    delta: 0.0571,
    cost: "2,940",
    whenSort: 38,
    when: "38m",
    spark: [0.4, 0.48, 0.55, 0.62, 0.68, 0.73, 0.77, 0.7912],
    runsLabel: "10,000 Runs",
    traceCount: 10000,
    isPrivate: true,
  },
  {
    id: "job_2a55de",
    state: "failed",
    type: "train",
    title: "GRPO sweep · kl=0.05",
    subtitle: "reward climbed, output collapsed",
    flag: "reward-hack?",
    modelName: "qwen2.5-14b",
    modelVersion: "v2",
    ownerName: "Aman",
    ownerScope: "self",
    reward: 0.2104,
    delta: -0.5237,
    cost: "2,210",
    whenSort: 60,
    when: "1h",
    spark: [0.31, 0.44, 0.58, 0.69, 0.74, 0.62, 0.38, 0.2104],
    runsLabel: "10,000 Runs",
    traceCount: 10000,
    isPrivate: true,
  },
  {
    id: "job_d10b94",
    state: "errored",
    type: "train",
    title: "GRPO sweep · bf16",
    subtitle: "infra error during run",
    modelName: "qwen2.5-32b",
    modelVersion: "v1",
    ownerName: "Aman",
    ownerScope: "self",
    reward: null,
    delta: null,
    cost: "88",
    whenSort: 62,
    when: "1h",
    runsLabel: "312 / 10,000",
    traceCount: 312,
    isPrivate: true,
  },
  {
    id: "job_55a7c0",
    state: "completed",
    type: "eval",
    title: "Eval: regression 0042",
    subtitle: "cron · daily 06:00 UTC",
    modelName: "claude-haiku-4.5",
    modelVersion: "—",
    ownerName: "cron",
    ownerScope: "cron",
    reward: 0.75,
    delta: 0,
    cost: "41",
    whenSort: 12,
    when: "12m",
    frac: "3/4",
    traces: "ssfs",
    traceCount: 4,
    isPrivate: true,
  },
  {
    id: "job_1ee330",
    state: "completed",
    type: "eval",
    title: "Batch: 4 tasks",
    subtitle: "manual run",
    modelName: "claude-haiku-4.5",
    modelVersion: "4.5",
    ownerName: "Priya",
    ownerScope: "team",
    reward: 1,
    delta: 0,
    cost: "52",
    whenSort: 1440,
    when: "1d",
    frac: "4/4",
    traces: "ssss",
    traceCount: 4,
    isPrivate: true,
  },
  {
    id: "job_b3d9f1",
    state: "completed",
    type: "eval",
    title: "Eval: GPT-5 sweep",
    subtitle: "1 task below threshold",
    modelName: "gpt-5",
    modelVersion: "v2",
    ownerName: "Priya",
    ownerScope: "team",
    reward: 0.75,
    delta: -0.25,
    cost: "96",
    whenSort: 2880,
    when: "2d",
    frac: "3/4",
    traces: "ssfs",
    traceCount: 4,
    isPrivate: true,
  },
  {
    id: "job_77c0aa",
    state: "invalidated",
    type: "eval",
    title: "Batch: smoke test",
    subtitle: "invalidated — env version mismatch",
    modelName: "nova-2-lite",
    modelVersion: "—",
    ownerName: "Alex",
    ownerScope: "team",
    reward: 0,
    delta: null,
    cost: "0",
    whenSort: 4320,
    when: "3d",
    frac: "0/4",
    traces: "nnnn",
    traceCount: 4,
    isPrivate: true,
  },
];

// Mutable in-memory store so the create-taskset flow can append a new entry
// during a single dev-server lifetime. Server module cache persists this
// across navigations; Turbopack hot-reloads reset it (expected for mock data).
export const tasksets: Array<Taskset> = [
  {
    id: "hud-browser",
    name: "hud-browser",
    ownership: "team",
    visibility: "private",
    purpose: "benchmark",
    ownerName: "HUD",
    starCount: 24,
    isStarred: true,
    taskCount: 4,
    modelCount: 4,
    systemPrompt:
      "You are an expert browser agent. Complete each task by interacting with the page.",
    progressSteps: DEFAULT_PROGRESS_STEPS,
    customColumns: [
      { key: "target", label: "target", type: "integer" },
      { key: "title", label: "title", type: "string" },
    ],
    leaderboard: HUD_BROWSER_LEADERBOARD,
    tasks: HUD_BROWSER_TASKS,
    jobs: HUD_BROWSER_JOBS,
    createdOrder: 1,
  },
  {
    // Empty-state fixture — exercises every tab's zero-state UI from one
    // navigable taskset.
    id: "empty-eval",
    name: "Empty Eval",
    ownership: "user",
    visibility: "private",
    purpose: "benchmark",
    ownerName: "Kate Im",
    starCount: 0,
    isStarred: false,
    taskCount: 0,
    modelCount: 0,
    progressSteps: DEFAULT_PROGRESS_STEPS,
    customColumns: [],
    leaderboard: [],
    tasks: [],
    jobs: [],
    createdOrder: 0,
  },
  {
    id: "rl-coding-eval",
    name: "rl-coding-eval",
    ownership: "user",
    visibility: "private",
    purpose: "training",
    ownerName: "Aman Sharma",
    starCount: 6,
    isStarred: true,
    taskCount: 18,
    modelCount: 3,
    progressSteps: DEFAULT_PROGRESS_STEPS,
    customColumns: [
      { key: "repo", label: "repo", type: "string" },
      { key: "loc", label: "loc", type: "integer" },
    ],
    leaderboard: [
      {
        rank: 1,
        agentName: "Aman's fine-tune v3",
        agentBaseTaskset: "on rl-coding-eval",
        average: 0.61,
        best3: 0.68,
        best5: 0.72,
        best10: 0.75,
        pass1: 0.55,
        steps: 24,
      },
      {
        rank: 2,
        agentName: "Aman's fine-tune v2",
        agentBaseTaskset: "on rl-coding-eval",
        average: 0.54,
        best3: 0.6,
        best5: 0.64,
        best10: 0.67,
        pass1: 0.48,
        steps: 27,
      },
    ],
    tasks: [],
    jobs: [],
    createdOrder: 5,
  },
  {
    id: "swe-bench-verified",
    name: "SWE-bench Verified",
    ownership: "community",
    visibility: "public",
    purpose: "benchmark",
    ownerName: "Princeton NLP",
    starCount: 6420,
    isStarred: false,
    taskCount: 500,
    modelCount: 32,
    progressSteps: DEFAULT_PROGRESS_STEPS,
    customColumns: [{ key: "repo", label: "repo", type: "string" }],
    leaderboard: [
      {
        rank: 1,
        agentName: "Claude Opus 4.7",
        agentBaseTaskset: "on SWE-bench Verified",
        average: 0.72,
        best3: 0.78,
        best5: 0.81,
        best10: 0.84,
        pass1: 0.67,
        steps: 38,
      },
      {
        rank: 2,
        agentName: "GPT 5.1",
        agentBaseTaskset: "on SWE-bench Verified",
        average: 0.68,
        best3: 0.74,
        best5: 0.77,
        best10: 0.8,
        pass1: 0.62,
        steps: 41,
      },
    ],
    tasks: [],
    jobs: [],
    createdOrder: 9,
  },
  {
    id: "osworld",
    name: "OSWorld",
    ownership: "community",
    visibility: "public",
    purpose: "benchmark",
    ownerName: "Adept Research",
    starCount: 1720,
    isStarred: false,
    taskCount: 369,
    modelCount: 12,
    progressSteps: DEFAULT_PROGRESS_STEPS,
    customColumns: [],
    leaderboard: [],
    tasks: [],
    jobs: [],
    createdOrder: 13,
  },
];

export function getTaskset(id: string): Taskset | undefined {
  return tasksets.find((t) => t.id === id);
}

export function findJobById(jobId: string):
  | { job: TasksetJobRow; taskset: Taskset }
  | undefined {
  for (const taskset of tasksets) {
    const job = taskset.jobs.find((j) => j.id === jobId);
    if (job) return { job, taskset };
  }
  return undefined;
}

// Slugifies "My Cool Taskset" → "my-cool-taskset". Collision-safe via suffix.
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueSlug(base: string): string {
  if (base.length === 0) return `taskset-${tasksets.length + 1}`;
  if (!tasksets.some((t) => t.id === base)) return base;
  let n = 2;
  while (tasksets.some((t) => t.id === `${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/**
 * Appends a new taskset to the in-memory store and returns it. The new entry
 * is visible immediately to the My Team tab + its own detail page within the
 * current dev-server lifetime. Hot reload of this file resets the list.
 */
export function createTaskset(input: {
  name: string;
  purpose: TasksetPurpose;
}): Taskset {
  const minOrder = tasksets.reduce(
    (min, t) => (t.createdOrder < min ? t.createdOrder : min),
    0,
  );
  const taskset: Taskset = {
    id: uniqueSlug(toSlug(input.name)),
    name: input.name,
    ownership: "user",
    visibility: "private",
    purpose: input.purpose,
    ownerName: "Kate Im",
    starCount: 0,
    isStarred: false,
    taskCount: 0,
    modelCount: 0,
    progressSteps: DEFAULT_PROGRESS_STEPS,
    customColumns: [],
    leaderboard: [],
    tasks: [],
    jobs: [],
    createdOrder: minOrder - 1,
  };
  tasksets.unshift(taskset);
  return taskset;
}

// Updates an existing taskset's visibility in place. Returns the next snapshot
// (same identity if id not found).
export function setTasksetVisibility(
  id: string,
  visibility: TasksetVisibility,
): Taskset | undefined {
  const idx = tasksets.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  const current = tasksets[idx];
  if (current === undefined) return undefined;
  const next: Taskset = { ...current, visibility };
  tasksets[idx] = next;
  return next;
}
