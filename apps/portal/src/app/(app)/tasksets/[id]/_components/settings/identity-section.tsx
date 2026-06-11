"use client";

import { useId, useState } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
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
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/cn";
import type { TasksetPurpose } from "@/lib/mock/tasksets";

interface IdentitySectionProps {
  name: string;
  purpose: TasksetPurpose;
}

const PURPOSE_LABEL: Record<TasksetPurpose, string> = {
  benchmark: "Benchmark",
  training: "Training",
};

export default function IdentitySection({
  name: committedName,
  purpose: committedPurpose,
}: IdentitySectionProps) {
  const nameInputId = useId();
  const purposeLabelId = useId();
  const purposeTriggerId = useId();

  const [savedName, setSavedName] = useState(committedName);
  const [savedPurpose, setSavedPurpose] =
    useState<TasksetPurpose>(committedPurpose);

  const [nameDraft, setNameDraft] = useState(committedName);
  const [purposeDraft, setPurposeDraft] =
    useState<TasksetPurpose>(committedPurpose);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const trimmedName = nameDraft.trim();
  const isNameEmpty = trimmedName.length === 0;
  const isNameDirty = nameDraft !== savedName;
  const isPurposeDirty = purposeDraft !== savedPurpose;
  const isDirty = isNameDirty || isPurposeDirty;

  const commit = async () => {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSavedName(nameDraft);
    setSavedPurpose(purposeDraft);
    setPending(false);
    toast.success("Identity updated.");
  };

  const onSave = async () => {
    if (isNameEmpty) {
      // Save remains enabled per form-actions convention; validation surfaces inline.
      return;
    }
    if (isPurposeDirty) {
      setConfirmOpen(true);
      return;
    }
    await commit();
  };

  const onConfirm = async () => {
    await commit();
    setConfirmOpen(false);
  };

  const onCancelDialog = () => {
    setPurposeDraft(savedPurpose);
    setConfirmOpen(false);
  };

  const onCancel = () => {
    setNameDraft(savedName);
    setPurposeDraft(savedPurpose);
  };

  const nameError = isNameDirty && isNameEmpty ? "Name cannot be empty." : undefined;

  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-body font-semibold text-foreground">Identity</h3>

      <FormField
        id={nameInputId}
        label="Name"
        helper="This name is displayed throughout the platform."
        error={nameError}
      >
        <Input
          type="text"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          disabled={pending}
          autoComplete="off"
          spellCheck={false}
        />
      </FormField>

      <div data-slot="form-field" className="flex flex-col gap-1.5">
        <Label id={purposeLabelId} htmlFor={purposeTriggerId}>
          Purpose
        </Label>
        <Select
          value={purposeDraft}
          onValueChange={(v) => setPurposeDraft(v as TasksetPurpose)}
          disabled={pending}
        >
          <SelectTrigger
            id={purposeTriggerId}
            aria-labelledby={purposeLabelId}
            className="w-48"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="benchmark">{PURPOSE_LABEL.benchmark}</SelectItem>
            <SelectItem value="training">{PURPOSE_LABEL.training}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-caption font-normal font-sans text-muted-foreground mt-1.5">
          Benchmarks appear in model leaderboards and public listings. Training
          Tasksets are surfaced when filtering for training data.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
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
          onClick={onSave}
          aria-label="Save Identity"
        >
          {pending ? "Saving…" : "Save"}
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
              Changing to {PURPOSE_LABEL[purposeDraft]} may change where this
              Taskset appears in filters and listings.
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
