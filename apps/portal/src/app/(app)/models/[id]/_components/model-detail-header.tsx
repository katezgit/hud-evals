import Link from "next/link";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import type { Model, TasksetResult } from "../_data/types";
import { HeaderActions } from "./header-actions";
import { HeaderSubtitle } from "./header-subtitle";
import { ModelStatusBadge } from "./model-status-badge";

export function ModelDetailHeader({
  model,
  tasksetResults,
}: {
  model: Model;
  tasksetResults: ReadonlyArray<TasksetResult>;
}) {
  const lastEvaluatedAt = tasksetResults.reduce<string | null>((latest, r) => {
    if (r.lastRunAt === null) return latest;
    if (latest === null) return r.lastRunAt;
    return Date.parse(r.lastRunAt) > Date.parse(latest) ? r.lastRunAt : latest;
  }, null);

  return (
    <header className="flex flex-col gap-3">
      <Breadcrumb parent={{ href: "/models", label: "Models" }} current={model.displayName} />
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col page-header">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-display font-semibold text-foreground">
              {model.displayName}
            </h1>
            <ModelStatusBadge status={model.status} />
          </div>
          <HeaderSubtitle model={model} lastEvaluatedAt={lastEvaluatedAt} />
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <HeaderActions model={model} />
          {model.activeTrainingJobsCount >= 1 && (
            <Link
              href={`/jobs?source_model_id=${model.id}`}
              className="inline-flex items-center gap-1.5 text-label text-muted-foreground transition-colors hover:text-foreground"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-muted-foreground" />
              {model.activeTrainingJobsCount} {model.activeTrainingJobsCount === 1 ? "job" : "jobs"} running
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
