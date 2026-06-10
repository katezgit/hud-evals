import { findJobById, getTaskset, type Taskset, type TasksetJobRow } from "@/lib/mock/tasksets";

// Runs are the atomic unit of validity. Two states only — `scored` or `invalid`.
// Coverage / metrics / banner / train gate are all derived from this array.
export type JobRunState = "scored" | "invalid" | "not-run";

export interface JobRun {
  id: string;
  taskId: string;
  state: JobRunState;
  /** 0..1 reward string for display ("1.0000"). `null` when state === "not-run". */
  reward: string | null;
  durationLabel: string;
  turns: number;
  /** Pre-formatted cost, dollar-prefix omitted ("0.0091"). */
  costLabel: string;
}

export interface JobTask {
  id: string;
  /** Optional one-line description shown in the coverage tooltip. */
  scenarioLabel?: string;
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

export interface JobDetail {
  /** Echo of the job row this detail belongs to. */
  job: TasksetJobRow;
  /** Echo of the parent taskset. */
  taskset: Taskset;
  /** Display scope token shown before title in the page header (`eval` / `train`). */
  scope: "eval" | "train";
  /** "Claude Opus 4.6 on browser Tasks" — long-form title shown next to scope. */
  displayTitle: string;
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
  /** Display tasks in order — drives the coverage grid columns. */
  tasks: ReadonlyArray<JobTask>;
  /** Initial run snapshot. Mutated in component state. */
  initialRuns: ReadonlyArray<JobRun>;
  /** Per-task-filter tool usage payload. Key is task id, plus the special "all" key. */
  toolScopes: Record<string, JobToolScope>;
  /** Catalog of QA agents shown in the run-QA popover. */
  qaAgents: ReadonlyArray<JobQaAgent>;
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
const SHOWCASE_DETAIL_BASE = {
  scope: "eval" as const,
  displayTitle: "Claude Opus 4.6 on browser Tasks",
  modelId: "claude-opus-4-6",
  envId: "browser@2.4.1",
  tasksetShortId: "ts_browser",
  coverageLabel: "2 / 3 Tasks",
  runsLabel: "2 Runs",
  seed: 42,
  createdLabel: "2026-05-21 19:58:02 PT",
  createdRelativeLabel: "2d ago",
  tasks: [
    { id: "0000", scenarioLabel: "browser:todo-create" },
    { id: "0001", scenarioLabel: "browser:2048-near-win" },
    { id: "0002", scenarioLabel: "browser:2048-near-win" },
  ] as ReadonlyArray<JobTask>,
  initialRuns: [
    {
      id: "run_01",
      taskId: "0000",
      state: "invalid" as JobRunState,
      reward: "1.0000",
      durationLabel: "2m 41s",
      turns: 6,
      costLabel: "0.0091",
    },
    {
      id: "run_02",
      taskId: "0001",
      state: "invalid" as JobRunState,
      reward: "1.0000",
      durationLabel: "2m 35s",
      turns: 4,
      costLabel: "0.0103",
    },
  ] as ReadonlyArray<JobRun>,
  qaAgents: QA_AGENTS,
  trainTraceThreshold: 10,
  costPerRunLabel: "$0.0097 / Run",
  costPerRunCredits: "1.7 credits",
  totalCostLabel: "$0.0194",
  latencyP50Label: "2m 38s",
  toolTurnsAvgLabel: "5.0",
  toolTurnsSubLabel: "10 calls / 2 Runs",
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

  const taskIdsForRuns = seededTasks.slice(0, Math.max(1, Math.min(seededTasks.length, 2)));
  const initialRuns: ReadonlyArray<JobRun> = taskIdsForRuns.map((t, idx) => {
    const isInvalid = job.state === "invalidated";
    return {
      id: `run_${(idx + 1).toString().padStart(2, "0")}`,
      taskId: t.id,
      state: isInvalid ? ("invalid" as JobRunState) : ("scored" as JobRunState),
      reward: job.reward !== null ? job.reward.toFixed(4) : "0.0000",
      durationLabel: "2m 30s",
      turns: 4 + idx,
      costLabel: (0.009 + idx * 0.001).toFixed(4),
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
    matrixColumns: initialRuns.map((r) => r.taskId),
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

  return {
    job,
    taskset,
    scope: job.type,
    displayTitle: `${job.modelName} on ${taskset.name} Tasks`,
    modelId: job.modelName,
    envId: `${taskset.name}@latest`,
    tasksetShortId: `ts_${taskset.id}`,
    coverageLabel: `${initialRuns.length} / ${seededTasks.length} Tasks`,
    runsLabel: `${initialRuns.length} Runs`,
    seed: 42,
    createdLabel: job.when ? `${job.when} ago` : "—",
    createdRelativeLabel: job.when ? `${job.when} ago` : "—",
    tasks: seededTasks,
    initialRuns,
    toolScopes: { all: allScope, ...perTaskScopes },
    qaAgents: QA_AGENTS,
    trainTraceThreshold: 10,
    costPerRunLabel: `$${job.cost} / Run`,
    costPerRunCredits: "—",
    totalCostLabel: `$${job.cost}`,
    latencyP50Label: "2m 30s",
    toolTurnsAvgLabel: "4.0",
    toolTurnsSubLabel: `${initialRuns.length * 4} calls / ${initialRuns.length} Runs`,
    rerunCommand: `hud eval ${taskset.id} --model ${job.modelName} --seed 42`,
  };
}

export function findJobDetail(jobId: string): JobDetail | undefined {
  const found = findJobById(jobId);
  if (!found) return undefined;

  if (jobId === "job_4c8e1a20") {
    return {
      job: found.job,
      taskset: found.taskset,
      ...SHOWCASE_DETAIL_BASE,
      toolScopes: SHOWCASE_SCOPES,
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
