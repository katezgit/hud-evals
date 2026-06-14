"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, LockIcon, PlayIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { VisibilityIcon } from "@repo/ui/components/visibility-icon";
import { cn } from "@repo/ui/lib/cn";
import CostFormula from "@/app/(app)/tasksets/[id]/_components/run-taskset/cost-formula";
import GroupSizeControl from "@/app/(app)/tasksets/[id]/_components/run-taskset/group-size-control";
import MaxStepsControl from "@/app/(app)/tasksets/[id]/_components/run-taskset/max-steps-control";
import type { TrainingModelRow } from "@/lib/mock/job-create";
import type { Taskset } from "@/lib/mock/tasksets";

const DEFAULT_MAX_STEPS = 15;
const DEFAULT_GROUP_SIZE = 3;

export interface BaselineEvalDrawerProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  model: TrainingModelRow | null;
  taskset: Taskset | null;
}

export function BaselineEvalDrawer({
  open,
  onOpenChange,
  model,
  taskset,
}: BaselineEvalDrawerProps) {
  // Defensive: drawer should never be opened without both — but Radix keeps it
  // mounted briefly through the close animation, so render nothing rather than
  // crashing if the parent clears the pair while open=true.
  if (!model || !taskset) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="md">
        <BaselineEvalDrawerBody
          model={model}
          taskset={taskset}
          onClose={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

function BaselineEvalDrawerBody({
  model,
  taskset,
  onClose,
}: {
  model: TrainingModelRow;
  taskset: Taskset;
  onClose: () => void;
}) {
  const router = useRouter();

  const [maxSteps, setMaxSteps] = useState<number>(DEFAULT_MAX_STEPS);
  const [groupSize, setGroupSize] = useState<number>(DEFAULT_GROUP_SIZE);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);

  const handleStart = () => {
    const jobId = `job_${Math.random().toString(36).slice(2, 8)}`;
    onClose();
    const toastId = toast.success("Eval started. Returning to training config.", {
      action: (
        <Button
          variant="link"
          onClick={() => {
            toast.dismiss(toastId);
            router.push(`/jobs/${jobId}`);
          }}
        >
          View eval job →
        </Button>
      ),
    });
  };

  return (
    <>
      <DrawerHeader>
        <div className="flex min-w-0 flex-col gap-1 pr-8">
          <DrawerTitle>Run baseline eval</DrawerTitle>
          <p className="truncate text-caption text-muted-foreground">
            <span className="text-foreground">{model.name}</span>
            <span className="px-1.5 text-meta-foreground" aria-hidden="true">
              ×
            </span>
            <span className="text-foreground">{taskset.name}</span>
          </p>
        </div>
        <DrawerCloseButton />
      </DrawerHeader>

      <DrawerBody>
        <div className="flex flex-col gap-6">
          <p className="text-body text-muted-foreground">
            Check if{" "}
            <span className="font-medium text-foreground">{model.name}</span>{" "}
            already passes most tasks in{" "}
            <span className="font-medium text-foreground">{taskset.name}</span>{" "}
            before you commit compute to training.
          </p>

          <LockedContextStrip model={model} taskset={taskset} />

          <MaxStepsControl value={maxSteps} onValueChange={setMaxSteps} />

          <GroupSizeControl value={groupSize} onValueChange={setGroupSize} />

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="-ml-2.5 w-fit text-muted-foreground"
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

      <DrawerFooter className="flex-col items-stretch gap-3">
        <CostFormula
          modelCount={1}
          groupSize={groupSize}
          taskCount={taskset.taskCount}
        />
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleStart}>
            <PlayIcon aria-hidden="true" />
            Run eval and return
          </Button>
        </div>
      </DrawerFooter>
    </>
  );
}

function LockedContextStrip({
  model,
  taskset,
}: {
  model: TrainingModelRow;
  taskset: Taskset;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-elevated-surface px-4 py-3">
      <LockedRow label="Model">
        <span className="text-body font-medium text-foreground">
          {model.name}
        </span>
      </LockedRow>
      <LockedRow label="Taskset">
        <span className="text-body font-medium text-foreground">
          {taskset.name}
        </span>
        <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
          <span aria-hidden="true">·</span>
          <span>{taskset.taskCount} tasks</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <VisibilityIcon visibility={taskset.visibility} size="sm" />
            {taskset.visibility === "public" ? "public" : "private"}
          </span>
          <span aria-hidden="true">·</span>
          <span>by {taskset.ownerName}</span>
        </span>
      </LockedRow>
    </div>
  );
}

function LockedRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <LockIcon
        aria-hidden="true"
        className="size-3.5 shrink-0 text-muted-foreground"
      />
      <span className="w-16 shrink-0 text-caption text-meta-foreground">
        {label}
      </span>
      <span className="flex min-w-0 flex-wrap items-baseline gap-1.5">
        {children}
      </span>
    </div>
  );
}
