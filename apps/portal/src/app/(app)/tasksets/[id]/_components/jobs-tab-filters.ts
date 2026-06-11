import type { TasksetJobRow, TasksetJobState } from "@/lib/mock/tasksets";

export type TypeFilter = "all" | "eval" | "train";
export type SortMode = "newest" | "oldest" | "reward" | "attention";

export const ATTENTION_ORDER: Record<TasksetJobState, number> = {
  running: 0,
  errored: 1,
  failed: 2,
  queued: 3,
  completed: 4,
  invalidated: 5,
};

function passType(job: TasksetJobRow, f: TypeFilter): boolean {
  if (f === "all") return true;
  return (f === "eval" && job.type === "eval") || (f === "train" && job.type === "train");
}

function passSearch(job: TasksetJobRow, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    job.title.toLowerCase().includes(needle) ||
    job.modelName.toLowerCase().includes(needle) ||
    job.id.toLowerCase().includes(needle) ||
    job.ownerName.toLowerCase().includes(needle)
  );
}

export function filterJobs(
  jobs: ReadonlyArray<TasksetJobRow>,
  type: TypeFilter,
  showInvalidated: boolean,
  search: string,
): ReadonlyArray<TasksetJobRow> {
  return jobs.filter((job) => {
    if (!showInvalidated && job.state === "invalidated") return false;
    return passType(job, type) && passSearch(job, search);
  });
}

export function sortJobs(
  jobs: ReadonlyArray<TasksetJobRow>,
  mode: SortMode,
): ReadonlyArray<TasksetJobRow> {
  const next = [...jobs];
  if (mode === "newest") next.sort((a, b) => a.whenSort - b.whenSort);
  else if (mode === "oldest") next.sort((a, b) => b.whenSort - a.whenSort);
  else if (mode === "reward")
    next.sort((a, b) => (b.reward ?? -1) - (a.reward ?? -1));
  else if (mode === "attention")
    next.sort(
      (a, b) =>
        ATTENTION_ORDER[a.state] - ATTENTION_ORDER[b.state] ||
        a.whenSort - b.whenSort,
    );
  return next;
}
