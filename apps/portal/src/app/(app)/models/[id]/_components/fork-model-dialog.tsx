"use client";

import { GitFork, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogCancelButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

interface ForkModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelName: string;
  onConfirm: () => void;
  loading: boolean;
}

export function ForkModelDialog({
  open,
  onOpenChange,
  modelName,
  onConfirm,
  loading,
}: ForkModelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Fork Model</DialogTitle>
          <DialogDescription>
            Create a new copy of {modelName}. The current checkpoint will be
            copied to the new model; the original remains unchanged. You&apos;ll
            own the new model and can modify it independently.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogCancelButton disabled={loading} />
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
            ) : (
              <GitFork aria-hidden="true" />
            )}
            {loading ? "Forking…" : "Fork Model"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
