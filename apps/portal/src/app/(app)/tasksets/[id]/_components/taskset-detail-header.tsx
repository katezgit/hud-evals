"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Download,
  MoreHorizontal,
  Play,
  Plus,
  Share2,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { IconButton } from "@repo/ui/components/icon-button";
import { VisibilityIcon } from "@repo/ui/components/visibility-icon";
import type { Taskset } from "@/lib/mock/tasksets";
import RunTasksetDialog from "./run-taskset/run-taskset-dialog";

interface TasksetDetailHeaderProps {
  taskset: Taskset;
}

export default function TasksetDetailHeader({ taskset }: TasksetDetailHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const openRunDialog = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("run", "1");
    router.replace(`/tasksets/${taskset.id}?${params.toString()}`, { scroll: false });
  };

  return (
    <header className="flex flex-col gap-3 pt-2 pb-4">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-label tracking-normal normal-case text-muted-foreground"
      >
        <Link
          href="/tasksets"
          className="rounded-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Tasksets
        </Link>
        <ChevronRight aria-hidden="true" className="size-3 text-meta-foreground" />
        <span aria-current="page" className="truncate text-foreground">
          {taskset.name}
        </span>
      </nav>
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-display font-semibold text-foreground">
              {taskset.name}
            </h1>
            <VisibilityIcon visibility={taskset.visibility} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-body text-muted-foreground">
            <span>
              <span className="tabular-nums">{taskset.taskCount}</span> Tasks
            </span>
            <Separator />
            <span className="font-mono">{taskset.id}</span>
            <CopyButton
              value={taskset.id}
              ariaLabel={`Copy Taskset slug ${taskset.id}`}
              tooltipLabel="Copy slug"
            />
            <Separator />
            <span>Owned by: {taskset.ownerName}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="primary" size="sm" onClick={openRunDialog}>
            <Play aria-hidden="true" />
            Run Taskset
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label="More taskset actions"
                type="button"
              >
                <MoreHorizontal aria-hidden="true" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => {}}>
                <Plus aria-hidden="true" />
                Create Task
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                <Upload aria-hidden="true" />
                Upload Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                <Share2 aria-hidden="true" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                <Download aria-hidden="true" />
                Export JSON
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                <Sparkles aria-hidden="true" />
                Train on taskset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <RunTasksetDialog taskset={taskset} />
    </header>
  );
}

function Separator() {
  return <span aria-hidden="true" className="text-meta-foreground">·</span>;
}
