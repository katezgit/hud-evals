"use client";

import { useId, useState } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/cn";
import {
  Dialog,
  DialogCancelButton,
  DialogConfirmButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import type { TasksetPurpose } from "@/lib/mock/tasksets";

interface PurposeSectionProps {
  purpose: TasksetPurpose;
}

const PURPOSE_LABEL: Record<TasksetPurpose, string> = {
  benchmark: "Benchmark",
  training: "Training",
};

export default function PurposeSection({
  purpose: committed,
}: PurposeSectionProps) {
  const labelId = useId();
  const triggerId = useId();
  const [savedValue, setSavedValue] = useState<TasksetPurpose>(committed);
  const [draft, setDraft] = useState<TasksetPurpose>(committed);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const isDirty = draft !== savedValue;

  const onConfirm = async () => {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSavedValue(draft);
    setPending(false);
    setConfirmOpen(false);
    toast.success("Purpose updated.");
  };

  const onCancelDialog = () => {
    setDraft(savedValue);
    setConfirmOpen(false);
  };

  return (
    <section className="flex flex-col gap-3">
      <h3
        id={labelId}
        className="text-body font-semibold text-foreground"
      >
        Purpose
      </h3>

      <Select
        value={draft}
        onValueChange={(v) => setDraft(v as TasksetPurpose)}
        disabled={pending}
      >
        <SelectTrigger
          id={triggerId}
          aria-labelledby={labelId}
          className="w-48"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="benchmark">{PURPOSE_LABEL.benchmark}</SelectItem>
          <SelectItem value="training">{PURPOSE_LABEL.training}</SelectItem>
        </SelectContent>
      </Select>

      <p className="text-caption text-muted-foreground">
        Benchmarks appear in model leaderboards and public listings. Training
        Tasksets are surfaced when filtering for training data.
      </p>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setDraft(savedValue)}
          aria-hidden={!isDirty}
          tabIndex={!isDirty || pending ? -1 : undefined}
          className={cn(
            (!isDirty || pending) && "pointer-events-none opacity-0",
          )}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          aria-label="Save Purpose"
        >
          Save
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) onCancelDialog();
        }}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlertIcon
                aria-hidden="true"
                className="size-4 text-state-warning"
              />
              Change Taskset purpose?
            </DialogTitle>
            <DialogDescription>
              Changing to {PURPOSE_LABEL[draft]} may change where this Taskset
              appears in filters and listings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogCancelButton
              disabled={pending}
              onClick={onCancelDialog}
            />
            <DialogConfirmButton onClick={onConfirm} disabled={pending}>
              {pending ? "Saving…" : "Change Purpose"}
            </DialogConfirmButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
