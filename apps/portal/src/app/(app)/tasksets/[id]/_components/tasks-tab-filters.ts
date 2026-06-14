export type TraceDisplay = "all" | "latest";

export interface TasksetStatsFilters {
  /** EvalModel id, e.g. `openai/gpt-4o`. `null` = "All models". */
  modelId: string | null;
  /** Scenario prefix, e.g. `browser`. `null` = "All environments". */
  environment: string | null;
  /** Env version label, e.g. `v3`. `null` = "Any version". */
  earliestEnvVersion: string | null;
  /** Trace display segmented control. */
  traceDisplay: TraceDisplay;
  /** pass@K — one of the sanctioned K values. */
  passAtK: 4 | 5 | 8 | 10 | 12 | 16;
  /** Whether training-run traces are included in stats. Default off. */
  includeTrainingRuns: boolean;
}

export const DEFAULT_STATS_FILTERS: TasksetStatsFilters = {
  modelId: null,
  environment: null,
  earliestEnvVersion: null,
  traceDisplay: "all",
  passAtK: 8,
  includeTrainingRuns: false,
};

export const PASS_AT_K_OPTIONS = [4, 5, 8, 10, 12, 16] as const;

export const ENV_VERSION_OPTIONS = ["v1", "v2", "v3", "v4"] as const;

export function countActiveStatsFilters(f: TasksetStatsFilters): number {
  let n = 0;
  if (f.modelId !== DEFAULT_STATS_FILTERS.modelId) n++;
  if (f.environment !== DEFAULT_STATS_FILTERS.environment) n++;
  if (f.earliestEnvVersion !== DEFAULT_STATS_FILTERS.earliestEnvVersion) n++;
  if (f.traceDisplay !== DEFAULT_STATS_FILTERS.traceDisplay) n++;
  if (f.passAtK !== DEFAULT_STATS_FILTERS.passAtK) n++;
  if (f.includeTrainingRuns !== DEFAULT_STATS_FILTERS.includeTrainingRuns) n++;
  return n;
}

function storageKey(tasksetId: string): string {
  return `hud.tasksetFilters.${tasksetId}`;
}

/**
 * Load filters from localStorage with shape-guarded merge against defaults.
 * Any persisted field of the wrong type is dropped — defaults survive a schema
 * change without throwing.
 */
export function loadStatsFilters(tasksetId: string): TasksetStatsFilters {
  if (typeof window === "undefined") return DEFAULT_STATS_FILTERS;
  try {
    const raw = window.localStorage.getItem(storageKey(tasksetId));
    if (!raw) return DEFAULT_STATS_FILTERS;
    const parsed = JSON.parse(raw) as Partial<TasksetStatsFilters>;
    return {
      modelId:
        typeof parsed.modelId === "string" || parsed.modelId === null
          ? parsed.modelId ?? null
          : DEFAULT_STATS_FILTERS.modelId,
      environment:
        typeof parsed.environment === "string" || parsed.environment === null
          ? parsed.environment ?? null
          : DEFAULT_STATS_FILTERS.environment,
      earliestEnvVersion:
        typeof parsed.earliestEnvVersion === "string" ||
        parsed.earliestEnvVersion === null
          ? parsed.earliestEnvVersion ?? null
          : DEFAULT_STATS_FILTERS.earliestEnvVersion,
      traceDisplay:
        parsed.traceDisplay === "all" || parsed.traceDisplay === "latest"
          ? parsed.traceDisplay
          : DEFAULT_STATS_FILTERS.traceDisplay,
      passAtK:
        PASS_AT_K_OPTIONS.includes(
          parsed.passAtK as (typeof PASS_AT_K_OPTIONS)[number],
        )
          ? (parsed.passAtK as TasksetStatsFilters["passAtK"])
          : DEFAULT_STATS_FILTERS.passAtK,
      includeTrainingRuns:
        typeof parsed.includeTrainingRuns === "boolean"
          ? parsed.includeTrainingRuns
          : DEFAULT_STATS_FILTERS.includeTrainingRuns,
    };
  } catch {
    return DEFAULT_STATS_FILTERS;
  }
}

export function saveStatsFilters(
  tasksetId: string,
  filters: TasksetStatsFilters,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(tasksetId), JSON.stringify(filters));
  } catch {
    // localStorage may be unavailable (private mode, quota); silent fallback —
    // filters still work in-session, they just won't survive reload.
  }
}
