"use client";

import { useCallback, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, TriangleAlertIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogCancelButton,
  DialogContent,
  DialogDescription,
  DialogDestructiveButton,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";

interface DangerZoneSectionProps {
  tasksetName: string;
}

export default function DangerZoneSection({
  tasksetName,
}: DangerZoneSectionProps) {
  const warningId = useId();
  const inputId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);

  const matches = confirmText === tasksetName;

  const handleOpenChange = useCallback((next: boolean) => {
    if (next) {
      setOpen(true);
      return;
    }
    setOpen(false);
    setConfirmText("");
  }, []);

  const onConfirm = async () => {
    if (!matches || pending) return;
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    router.push("/tasksets");
  };

  return (
    <section className="flex flex-col gap-3 border-t-2 border-destructive pt-5">
      <h3 className="text-body font-semibold text-destructive">Danger Zone</h3>
      <p id={warningId} className="text-caption text-muted-foreground">
        Permanently delete this Taskset and all Tasks within it. Existing Jobs
        that used this Taskset remain in Job history; the Taskset link becomes
        broken. This action cannot be undone.
      </p>
      <div>
        <Button
          type="button"
          variant="destructive"
          aria-describedby={warningId}
          aria-label="Delete Taskset"
          onClick={() => handleOpenChange(true)}
        >
          <Trash2 aria-hidden="true" />
          Delete Taskset
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlertIcon
                aria-hidden="true"
                className="size-4 text-state-errored"
              />
              Permanently delete &lsquo;{tasksetName}&rsquo;?
            </DialogTitle>
            <DialogDescription>
              Deleting {tasksetName} will permanently remove this Taskset, all
              Tasks within it, and unlink it from existing Jobs. Job history
              stays; the Taskset link becomes broken. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <FormField
              id={inputId}
              label="Type the Taskset name to confirm:"
            >
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={tasksetName}
                disabled={pending}
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                aria-label="Type the Taskset name to confirm deletion"
              />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <DialogCancelButton disabled={pending} />
            <DialogDestructiveButton
              onClick={onConfirm}
              disabled={!matches || pending}
            >
              {pending ? "Deleting…" : "Delete Taskset"}
            </DialogDestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
