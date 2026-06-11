"use client";

import { useCallback, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogCancelButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";

interface DangerZoneSectionProps {
  envName: string;
}

export function DangerZoneSection({ envName }: DangerZoneSectionProps) {
  const warningId = useId();
  const inputId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);

  const matches = confirmText === envName;

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
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success(`Environment "${envName}" deleted`);
    router.push("/environments");
  };

  return (
    <section className="flex flex-col gap-3 border-t-2 border-destructive pt-5">
      <h3 className="text-body font-semibold text-destructive">Danger Zone</h3>
      <p id={warningId} className="text-caption text-muted-foreground">
        Permanently delete this Environment, including all builds, scenarios,
        runs, and associated configuration. Existing Jobs that referenced this
        Environment remain in Job history; the Environment link becomes broken.
        This action cannot be undone.
      </p>
      <div>
        <Button
          type="button"
          variant="destructive"
          aria-describedby={warningId}
          aria-label="Delete Environment"
          onClick={() => handleOpenChange(true)}
        >
          <Trash2 aria-hidden="true" />
          Delete Environment
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
              Permanently delete &lsquo;{envName}&rsquo;?
            </DialogTitle>
            <DialogDescription>
              Deleting {envName} will permanently remove this Environment, all
              builds, scenarios, runs, and associated configuration. Job
              history stays; the Environment link becomes broken. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <FormField
              id={inputId}
              label="Type the Environment name to confirm:"
            >
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={envName}
                disabled={pending}
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                aria-label="Type the Environment name to confirm deletion"
              />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <DialogCancelButton disabled={pending} />
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={!matches || pending}
              aria-busy={pending}
              className="disabled:bg-destructive disabled:text-destructive-foreground disabled:opacity-50"
            >
              {pending && (
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
              )}
              {pending ? "Deleting…" : "Delete Environment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
