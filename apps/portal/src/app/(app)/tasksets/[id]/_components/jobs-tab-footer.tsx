"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";

interface ZeroNoTasksProps {
  tasksetId: string;
}

// 0 tasks — Jobs are downstream of tasks; send the user to Tasks tab first.
export function JobsEmptyNoTasks({ tasksetId }: ZeroNoTasksProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleGoToTasks = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "tasks");
    router.replace(`/tasksets/${tasksetId}?${params.toString()}`, {
      scroll: false,
    });
  };
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <h3 className="text-body font-medium text-foreground">No tasks yet</h3>
      <p className="max-w-md text-caption text-muted-foreground">
        Add tasks first, then run an eval.
      </p>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={handleGoToTasks}
      >
        Go to Tasks tab
      </Button>
    </div>
  );
}

interface ZeroNoRunsProps {
  tasksetId: string;
}

// Tasks exist, no jobs run yet — surface the canonical first CLI command.
// Always `hud eval` (not `hud rl` — training is gated until a scored eval exists).
export function JobsEmptyNoRuns({ tasksetId }: ZeroNoRunsProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <h3 className="text-body font-medium text-foreground">
        No evaluation runs yet
      </h3>
      <p className="max-w-md text-caption text-muted-foreground">
        Use the HUD CLI to launch a run against this taskset.
      </p>
      <CodeBlock code={`hud eval ${tasksetId}`} />
    </div>
  );
}

interface FilteredEmptyProps {
  onClearFilters: () => void;
}

// Jobs exist but filters/search hide them all.
export function JobsEmptyFiltered({ onClearFilters }: FilteredEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <p className="text-body text-muted-foreground">
        No jobs match the current filters.
      </p>
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={onClearFilters}
      >
        Clear filters
      </Button>
    </div>
  );
}
