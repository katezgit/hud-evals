"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, GraduationCap, Play } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import type { Taskset } from "@/lib/mock/tasksets";

// Two zero-states keyed on whether tasks exist yet:
//   A) 0 tasks  → redirect to Tasks tab (leaderboard is downstream of tasks)
//   B) ≥1 task  → show the CLI command that fills the leaderboard
export function OverviewEmptyState({ taskset }: { taskset: Taskset }) {
  if (taskset.tasks.length === 0) {
    return <OverviewEmptyNoTasks tasksetId={taskset.id} />;
  }
  return <OverviewEmptyNoRuns tasksetId={taskset.id} />;
}

export function OverviewEmptyNoTasks({ tasksetId }: { tasksetId: string }) {
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
      <h3 className="text-body font-medium text-foreground">
        Add tasks first to enable runs
      </h3>
      <p className="max-w-md text-caption text-muted-foreground">
        The leaderboard surfaces results from agents that run against your
        tasks.
      </p>
      <Button
        type="button"
        variant="primary"
        onClick={handleGoToTasks}
      >
        Go to Tasks tab
      </Button>
    </div>
  );
}

export function OverviewEmptyNoRuns({ tasksetId }: { tasksetId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleRun = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("run", "1");
    router.replace(`/tasksets/${tasksetId}?${params.toString()}`, {
      scroll: false,
    });
  };
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <h3 className="text-body font-medium text-foreground">
        Run your first evaluation to populate the leaderboard
      </h3>
      <p className="max-w-md text-caption text-muted-foreground">
        Use the HUD CLI to launch a run against this taskset.
      </p>
      <CodeBlock code={`hud eval ${tasksetId}`} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="primary">
            <Play aria-hidden="true" />
            Run on taskset
            <ChevronDown aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onSelect={handleRun}>
            <Play aria-hidden="true" />
            Run evaluation
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              router.push(`/jobs/new?type=training&taskset=${tasksetId}`)
            }
          >
            <GraduationCap aria-hidden="true" />
            Run Training job
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
