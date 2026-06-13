// Deterministic mock helpers for the Taskset Detail > Performance tab. Derives
// plausible aggregates from the existing Jobs / Taskset shape; no separate
// fixture file. Hidden invariant: every value here is computed from the input
// taskset so the same taskset always produces the same numbers across reloads.
import type { Taskset } from "./tasksets";

export interface PerformanceConfig {
  id: "A" | "B" | "C" | "D";
  label: string;
  taskFilter: string;
  modelFilter: string;
  checkpointFilter: string;
  includeInvalidated: boolean;
}

export interface OverviewRow {
  configId: PerformanceConfig["id"];
  configLabel: string;
  reward: number;
  steps: number;
  traces: number;
  tasks: { scored: number; total: number };
  durationMin: number;
  costUsd: number;
  llmCalls: number;
  thinkAct: number;
  errorsRate: number;
  entropyObserved: number;
  entropyMax: number;
  topTool: { name: string; sharePct: number };
}

export interface WorkflowEntry {
  pct: number;
  tools: ReadonlyArray<string>;
  loop?: boolean;
}

export interface DistributionRow {
  tool: string;
  configA: DistributionStats;
  configB?: DistributionStats;
}

export interface DistributionStats {
  avgPerTrace: number;
  passRate: number;
  rSquared: number | null;
  emptyPct: number;
  avgOut: number | null;
}

export interface PatternRow {
  id: string;
  tools: ReadonlyArray<string>;
  countA: { hit: number; total: number };
  countB?: { hit: number; total: number };
  scoreA: number;
  scoreB?: number;
}

export interface HeatmapData {
  patterns: ReadonlyArray<string>;
  traceLabels: ReadonlyArray<string>;
  /** matrix[patternIdx][traceIdx] = reward value when pattern fired, else null */
  topMatrix: ReadonlyArray<ReadonlyArray<number | null>>;
  bottomMatrix: ReadonlyArray<ReadonlyArray<number | null>>;
}

export interface PacingPoint {
  /** 0..1 trace progress. */
  progress: number;
  toolCallA: number;
  toolCallB?: number;
  llmA: number;
  llmB?: number;
}

export interface UsagePoint {
  progress: number;
  configA: number;
  configB?: number;
}

export interface PhaseBar {
  /** Tool identity → call count in that phase. */
  segments: ReadonlyArray<{ tool: string; count: number }>;
}

export interface PhaseDistribution {
  configA: { start: PhaseBar; middle: PhaseBar; end: PhaseBar };
  configB?: { start: PhaseBar; middle: PhaseBar; end: PhaseBar };
}

const TOOL_PALETTE = [
  "computer",
  "click",
  "screenshot",
  "type",
  "launch_app",
  "submit",
  "hud_submit",
];

const PATTERN_LIBRARY: ReadonlyArray<{ id: string; tools: ReadonlyArray<string>; loop?: boolean }> = [
  { id: "P1", tools: ["computer", "screenshot"] },
  { id: "P2", tools: ["click", "screenshot", "click"], loop: true },
  { id: "P3", tools: ["type", "submit"] },
  { id: "P4", tools: ["launch_app", "screenshot", "click"] },
  { id: "P5", tools: ["click", "click", "click"], loop: true },
  { id: "P6", tools: ["screenshot", "type"] },
  { id: "P7", tools: ["hud_submit"] },
];

const CONFIG_LABELS: Record<PerformanceConfig["id"], string> = {
  A: "Config A",
  B: "Config B",
  C: "Config C",
  D: "Config D",
};

export function defaultConfigs(taskset: Taskset): {
  configs: ReadonlyArray<PerformanceConfig>;
  singleConfig: boolean;
} {
  const validJobs = taskset.jobs.filter((j) => j.state !== "invalidated");
  const singleConfig = validJobs.length <= 1;
  const configA: PerformanceConfig = {
    id: "A",
    label: CONFIG_LABELS.A,
    taskFilter: "all",
    modelFilter: "all",
    checkpointFilter: "all",
    includeInvalidated: false,
  };
  if (singleConfig) return { configs: [configA], singleConfig: true };
  const configB: PerformanceConfig = {
    id: "B",
    label: CONFIG_LABELS.B,
    taskFilter: "all",
    modelFilter: "all",
    checkpointFilter: "all",
    includeInvalidated: false,
  };
  return { configs: [configA, configB], singleConfig: false };
}

export function nextConfig(
  current: ReadonlyArray<PerformanceConfig>,
): PerformanceConfig | null {
  const used = new Set(current.map((c) => c.id));
  for (const id of ["A", "B", "C", "D"] as const) {
    if (!used.has(id)) {
      return {
        id,
        label: CONFIG_LABELS[id],
        taskFilter: "all",
        modelFilter: "all",
        checkpointFilter: "all",
        includeInvalidated: false,
      };
    }
  }
  return null;
}

export function modelOptionsFromTaskset(taskset: Taskset): ReadonlyArray<{
  value: string;
  label: string;
}> {
  const models = Array.from(
    new Set(taskset.jobs.map((j) => j.modelName).filter((n) => n !== "multi · 4")),
  );
  return [
    { value: "all", label: "All models" },
    ...models.map((m) => ({ value: m, label: m })),
  ];
}

export function taskOptionsFromTaskset(taskset: Taskset): ReadonlyArray<{
  value: string;
  label: string;
}> {
  return [
    { value: "all", label: "All tasks" },
    ...taskset.tasks.slice(0, 6).map((t) => ({
      value: t.taskId,
      label: `Task ${t.taskId}`,
    })),
  ];
}

export const CHECKPOINT_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: "all", label: "All checkpoints" },
  { value: "latest", label: "latest" },
  { value: "step-4096", label: "step-4096" },
  { value: "step-8192", label: "step-8192" },
];

// ─── Derived analysis ───────────────────────────────────────────────────────

function hashSeed(taskset: Taskset, config: PerformanceConfig): number {
  let h = 0;
  for (const ch of taskset.id + config.id + config.modelFilter + config.taskFilter) {
    h = (h * 31 + ch.charCodeAt(0)) % 100003;
  }
  return h;
}

function rand(seed: number, n: number): number {
  const s = (seed * 9301 + 49297) % 233280;
  return ((s + n * 1103) % 100) / 100;
}

export function computeOverviewRow(
  taskset: Taskset,
  config: PerformanceConfig,
): OverviewRow {
  const seed = hashSeed(taskset, config);
  const validJobs = taskset.jobs.filter((j) =>
    config.includeInvalidated ? true : j.state !== "invalidated",
  );
  const traces = validJobs.reduce((s, j) => s + Math.min(j.traceCount, 32), 0);
  const reward = clamp01(
    0.45 + rand(seed, 1) * 0.4 - (config.id === "A" ? 0 : 0.08),
  );
  const steps = 2 + Math.floor(rand(seed, 2) * 4);
  const scoredTasks = Math.min(taskset.taskCount, Math.max(1, Math.floor(rand(seed, 3) * taskset.taskCount)));
  const durationMin = 1.5 + rand(seed, 4) * 2;
  const costUsd = 0.05 + rand(seed, 5) * 0.15;
  const llmCalls = 2 + Math.floor(rand(seed, 6) * 3);
  const thinkAct = 1.2 + rand(seed, 7) * 2.4;
  const errorsRate = 0.15 + rand(seed, 8) * 0.3;
  const entropyObserved = 2.6 + rand(seed, 9) * 1.2;
  const topToolName = TOOL_PALETTE[Math.floor(rand(seed, 10) * TOOL_PALETTE.length)] ?? "computer";
  const topSharePct = 18 + Math.floor(rand(seed, 11) * 20);
  return {
    configId: config.id,
    configLabel: config.label,
    reward,
    steps,
    traces,
    tasks: { scored: scoredTasks, total: Math.max(taskset.taskCount, scoredTasks) },
    durationMin,
    costUsd,
    llmCalls,
    thinkAct,
    errorsRate,
    entropyObserved,
    entropyMax: 4.0,
    topTool: { name: topToolName, sharePct: topSharePct },
  };
}

export function computeTopWorkflows(
  taskset: Taskset,
  config: PerformanceConfig,
): ReadonlyArray<WorkflowEntry> {
  const seed = hashSeed(taskset, config);
  return [
    { pct: 23 + Math.floor(rand(seed, 1) * 5), tools: ["computer", "screenshot"] },
    {
      pct: 8 + Math.floor(rand(seed, 2) * 4),
      tools: ["click", "screenshot", "click"],
      loop: true,
    },
    { pct: 4 + Math.floor(rand(seed, 3) * 3), tools: ["type", "submit", "screenshot"] },
    { pct: 3 + Math.floor(rand(seed, 4) * 3), tools: ["launch_app", "click"] },
    { pct: 2 + Math.floor(rand(seed, 5) * 2), tools: ["hud_submit"] },
    { pct: 2, tools: ["computer", "click", "type"] },
  ];
}

export function computeDistribution(
  taskset: Taskset,
  configs: ReadonlyArray<PerformanceConfig>,
): ReadonlyArray<DistributionRow> {
  const a = configs[0];
  const b = configs[1];
  if (!a) return [];
  const seed = hashSeed(taskset, a);
  return TOOL_PALETTE.map((tool, i) => ({
    tool,
    configA: rowStats(seed + i, false),
    configB: b ? rowStats(seed + i + 50, true) : undefined,
  })).sort((x, y) => y.configA.avgPerTrace - x.configA.avgPerTrace);
}

function rowStats(seed: number, isB: boolean): DistributionStats {
  return {
    avgPerTrace: clamp01(0.2 + rand(seed, 1) * 0.6) * (isB ? 0.92 : 1),
    passRate: clamp01(0.55 + rand(seed, 2) * 0.45),
    rSquared: rand(seed, 3) > 0.3 ? round2(-0.2 + rand(seed, 4) * 0.6) : null,
    emptyPct: Math.floor(rand(seed, 5) * 100),
    avgOut: rand(seed, 6) > 0.5 ? Math.floor(40 + rand(seed, 7) * 200) : null,
  };
}

export function computePatterns(
  taskset: Taskset,
  configs: ReadonlyArray<PerformanceConfig>,
): ReadonlyArray<PatternRow> {
  const a = configs[0];
  const b = configs[1];
  if (!a) return [];
  const seedA = hashSeed(taskset, a);
  return PATTERN_LIBRARY.map((p, i) => {
    const totalA = 26;
    const totalB = 26;
    const hitA = Math.max(1, Math.floor(rand(seedA, i + 1) * 8));
    const hitB = b
      ? Math.max(1, Math.floor(rand(seedA + 100, i + 1) * 8))
      : 0;
    return {
      id: p.id,
      tools: p.tools,
      countA: { hit: hitA, total: totalA },
      countB: b ? { hit: hitB, total: totalB } : undefined,
      scoreA: clamp01(0.55 + rand(seedA, i + 10) * 0.45),
      scoreB: b ? clamp01(0.55 + rand(seedA + 100, i + 10) * 0.45) : undefined,
    };
  });
}

export function computeHeatmap(
  taskset: Taskset,
  config: PerformanceConfig,
): HeatmapData {
  const seed = hashSeed(taskset, config);
  const traceLabels = Array.from({ length: 6 }, (_, i) =>
    `T${(i + 1).toString().padStart(2, "0")}`,
  );
  const patterns = PATTERN_LIBRARY.map((p) => p.id);
  const topMatrix = patterns.map((_, pi) =>
    traceLabels.map((_t, ti) => {
      const fires = rand(seed + pi * 7, ti) > (pi === 4 ? 0.95 : 0.45);
      if (!fires) return null;
      return clamp01(0.75 + rand(seed + pi, ti) * 0.25);
    }),
  );
  const bottomMatrix = patterns.map((_, pi) =>
    traceLabels.map((_t, ti) => {
      const fires = rand(seed + pi * 11 + 5, ti) > (pi === 4 ? 0.2 : 0.65);
      if (!fires) return null;
      return clamp01(rand(seed + pi + 33, ti) * 0.4);
    }),
  );
  return { patterns, traceLabels, topMatrix, bottomMatrix };
}

export function computePacing(
  taskset: Taskset,
  configs: ReadonlyArray<PerformanceConfig>,
): ReadonlyArray<PacingPoint> {
  const a = configs[0];
  const b = configs[1];
  if (!a) return [];
  const seedA = hashSeed(taskset, a);
  const seedB = b ? hashSeed(taskset, b) : 0;
  return Array.from({ length: 11 }, (_, i) => {
    const progress = i / 10;
    const arc = Math.sin(progress * Math.PI);
    return {
      progress,
      toolCallA: 1.5 + arc * 5 + rand(seedA, i) * 0.5,
      toolCallB: b ? 1.5 + arc * 4 + rand(seedB, i) * 0.6 : undefined,
      llmA: 0.6 + arc * 2 + rand(seedA + 7, i) * 0.4,
      llmB: b ? 0.7 + arc * 2.4 + rand(seedB + 7, i) * 0.4 : undefined,
    };
  });
}

export function computeUsage(
  taskset: Taskset,
  configs: ReadonlyArray<PerformanceConfig>,
): ReadonlyArray<UsagePoint> {
  const a = configs[0];
  const b = configs[1];
  if (!a) return [];
  const seedA = hashSeed(taskset, a);
  const seedB = b ? hashSeed(taskset, b) : 0;
  return Array.from({ length: 11 }, (_, i) => {
    const progress = i / 10;
    return {
      progress,
      configA: 25 + progress * 30 + rand(seedA + 13, i) * 10,
      configB: b ? 22 + progress * 36 + rand(seedB + 13, i) * 12 : undefined,
    };
  });
}

export function computePhaseDistribution(
  taskset: Taskset,
  configs: ReadonlyArray<PerformanceConfig>,
): PhaseDistribution {
  const a = configs[0];
  const b = configs[1];
  return {
    configA: a ? phaseFor(hashSeed(taskset, a)) : {
      start: { segments: [] },
      middle: { segments: [] },
      end: { segments: [] },
    },
    configB: b ? phaseFor(hashSeed(taskset, b)) : undefined,
  };
}

function phaseFor(seed: number): {
  start: PhaseBar;
  middle: PhaseBar;
  end: PhaseBar;
} {
  const tools = TOOL_PALETTE.slice(0, 5);
  return {
    start: {
      segments: tools.map((t, i) => ({
        tool: t,
        count: Math.floor(rand(seed, i + 1) * 6),
      })),
    },
    middle: {
      segments: tools.map((t, i) => ({
        tool: t,
        count: Math.floor(rand(seed + 100, i + 1) * 9),
      })),
    },
    end: {
      segments: tools.map((t, i) => ({
        tool: t,
        count: Math.floor(rand(seed + 200, i + 1) * 5),
      })),
    },
  };
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatPct(v: number, digits = 1): string {
  return `${(v * 100).toFixed(digits)}%`;
}

export function formatCost(v: number): string {
  return `$${v.toFixed(3)}`;
}

export function formatDuration(min: number): string {
  if (min < 1) return `${Math.round(min * 60)}s`;
  return `${min.toFixed(1)}m`;
}
