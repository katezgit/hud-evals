"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Globe,
  GraduationCap,
  Link2,
  Lock,
  MoreHorizontal,
  Play,
  Plus,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { IconButton } from "@repo/ui/components/icon-button";
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
    <header className="flex flex-col gap-3 pt-2 pb-6">
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
        <div className="flex min-w-0 flex-col page-header">
          <h1 className="truncate text-display font-semibold text-foreground">
            {taskset.name}
          </h1>
          <div className="page-header-meta">
            <span>
              <span className="tabular-nums">{taskset.taskCount}</span> Tasks
            </span>
            <Separator />
            <span className="inline-flex items-center gap-1">
              {taskset.visibility === "private" ? (
                <Lock aria-hidden="true" className="size-3.5" />
              ) : (
                <Globe aria-hidden="true" className="size-3.5" />
              )}
              {taskset.visibility === "private" ? "Private" : "Public"}
            </span>
            <Separator />
            <span>Owned by: {taskset.ownerName}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="primary"
                size="sm"
                aria-label="Run on taskset"
                className="md:hidden"
                type="button"
              >
                <Play aria-hidden="true" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={openRunDialog}>
                <Play aria-hidden="true" />
                Run evaluation
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  router.push(
                    `/jobs/new?type=training&taskset=${taskset.id}`,
                  )
                }
              >
                <GraduationCap aria-hidden="true" />
                Run Training job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="primary"
                className="hidden md:inline-flex"
                type="button"
              >
                <Play aria-hidden="true" />
                Run on taskset
                <ChevronDown aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={openRunDialog}>
                <Play aria-hidden="true" />
                Run evaluation
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  router.push(
                    `/jobs/new?type=training&taskset=${taskset.id}`,
                  )
                }
              >
                <GraduationCap aria-hidden="true" />
                Run Training job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  void navigator.clipboard.writeText(taskset.id);
                  toast.success("Slug copied");
                }}
              >
                <Copy aria-hidden="true" />
                Copy slug
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  const url = `${window.location.origin}/tasksets/${taskset.id}`;
                  void navigator.clipboard.writeText(url);
                  toast.success("Link copied");
                }}
              >
                <Link2 aria-hidden="true" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => {}}>
                <Download aria-hidden="true" />
                Export JSON
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
