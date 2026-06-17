import type { TraceStepStatus } from "@/lib/mock/trace-detail";

export function nodeBgClass(status: TraceStepStatus): string {
  if (status === "error") return "bg-state-errored-subtle text-state-errored";
  if (status === "suspicious")
    return "bg-state-warning-subtle text-state-warning";
  return "bg-state-scored-subtle text-state-scored";
}
