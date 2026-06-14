"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogCancelButton,
  DialogContent,
  DialogDescription,
  DialogDestructiveButton,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import type { Model } from "../_data/types";

export function DangerZonePanel({ model }: { model: Model }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    // Stub: real delete RPC not yet implemented. Future call site will replace
    // this with a typed mutation that navigates back to /models on
    // success.
    await new Promise((resolve) => setTimeout(resolve, 250));
    setPending(false);
    setOpen(false);
  };

  return (
    <section aria-labelledby="danger-zone-heading" className="max-w-3xl">
      <div className="rounded-surface border border-destructive bg-panel">
        <div className="px-5 pb-3 pt-4">
          <h2
            id="danger-zone-heading"
            className="text-label font-semibold uppercase tracking-wide text-destructive"
          >
            Danger Zone
          </h2>
        </div>
        <div className="flex items-start justify-between gap-6 px-5 pb-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-body font-medium text-foreground">
              Delete model
            </span>
            <span className="text-caption text-muted-foreground">
              This will permanently delete the Model and all its checkpoints.
              This action cannot be undone.
            </span>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlertIcon
                aria-hidden="true"
                className="size-4 text-state-errored"
              />
              Delete {model.displayName}?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete the Model and all its checkpoints.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogCancelButton disabled={pending} />
            <DialogDestructiveButton
              onClick={handleConfirm}
              disabled={pending}
            >
              {pending ? "Deleting…" : "Delete model"}
            </DialogDestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
