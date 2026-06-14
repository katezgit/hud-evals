"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, HelpCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { Taskset } from "@/lib/mock/tasksets";
import CostFormula from "./cost-formula";
import GroupSizeControl from "./group-size-control";
import MaxStepsControl from "./max-steps-control";
import ModelPicker from "./model-picker";

// Taskset has no env field yet; this is the only env in production.
const TASKSET_ENV = "hud-browser";

const DEFAULT_MAX_STEPS = 15;
const DEFAULT_GROUP_SIZE = 3;

interface RunTasksetDialogProps {
  taskset: Taskset;
}

export default function RunTasksetDialog({ taskset }: RunTasksetDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const open = searchParams.get("run") === "1";

  // Form state — initialized once; resets when the dialog re-opens by remounting
  // its body via the `open` key on DialogContent's children isn't needed because
  // closing the dialog unmounts the body (Radix portal). When the user re-opens,
  // the component re-mounts and these initializers run again.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [maxSteps, setMaxSteps] = useState<number>(DEFAULT_MAX_STEPS);
  const [groupSize, setGroupSize] = useState<number>(DEFAULT_GROUP_SIZE);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const setUrlOpen = useCallback(
    (next: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set("run", "1");
      } else {
        params.delete("run");
      }
      const qs = params.toString();
      router.replace(
        qs ? `/tasksets/${taskset.id}?${qs}` : `/tasksets/${taskset.id}`,
        { scroll: false },
      );
    },
    [router, searchParams, taskset.id],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setUrlOpen(next);
      if (!next) {
        setSelectedIds(new Set());
        setMaxSteps(DEFAULT_MAX_STEPS);
        setGroupSize(DEFAULT_GROUP_SIZE);
        setAdvancedOpen(false);
        setSearchQuery("");
      }
    },
    [setUrlOpen],
  );

  const handleToggleModel = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleProvider = useCallback(
    (modelIds: ReadonlyArray<string>, nextChecked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of modelIds) {
          if (nextChecked) next.add(id);
          else next.delete(id);
        }
        return next;
      });
    },
    [],
  );

  const selectedCount = selectedIds.size;
  const canRun = selectedCount > 0;

  const handleRun = () => {
    if (!canRun) return;
    const jobId = `job_${Math.random().toString(36).slice(2, 8)}`;
    toast.success(`Run started — ${selectedCount} tasks queued`);
    handleOpenChange(false);
    router.push(`/jobs/${jobId}?from=taskset:${taskset.id}`);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent size="md">
        <DrawerHeader>
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <DrawerTitle>Run Taskset</DrawerTitle>
            <Badge variant="neutral" size="sm">
              {taskset.id}
            </Badge>
            <Badge variant="neutral" size="sm">
              {TASKSET_ENV}
            </Badge>
            <span aria-hidden="true" className="text-meta-foreground">
              ·
            </span>
            <span className="flex items-center gap-1 text-meta text-meta-foreground">
              per-task env
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex cursor-default"
                    aria-label="Each task runs on its own selected env."
                  >
                    <HelpCircle aria-hidden="true" className="size-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Each task runs on its own selected env.
                </TooltipContent>
              </Tooltip>
            </span>
          </div>
        </DrawerHeader>

        <DrawerBody>
          <div className="flex flex-col gap-4 pb-2">
            <ModelPicker
              selectedIds={selectedIds}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onToggleModel={handleToggleModel}
              onToggleProvider={handleToggleProvider}
            />

            <MaxStepsControl value={maxSteps} onValueChange={setMaxSteps} />

            <GroupSizeControl value={groupSize} onValueChange={setGroupSize} />

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-fit -ml-2.5 text-muted-foreground"
                >
                  <ChevronRight
                    aria-hidden="true"
                    className={cn(
                      "transition-transform duration-fast ease-out-standard",
                      advancedOpen && "rotate-90",
                    )}
                  />
                  Advanced
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-2 text-label text-muted-foreground">
                  Future advanced run options
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </DrawerBody>

        <DrawerFooter className="justify-between">
          <CostFormula modelCount={selectedCount} groupSize={groupSize} taskCount={taskset.taskCount} />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            {canRun ? (
              <Button type="button" variant="primary" onClick={handleRun}>
                <Play aria-hidden="true" />
                Run {taskset.taskCount} Tasks
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      type="button"
                      variant="primary"
                      disabled
                      aria-disabled="true"
                    >
                      <Play aria-hidden="true" />
                      Run {taskset.taskCount} Tasks
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Select at least one model</TooltipContent>
              </Tooltip>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
