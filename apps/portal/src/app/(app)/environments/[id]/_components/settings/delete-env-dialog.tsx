"use client";

import { useCallback, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";

interface DeleteEnvironmentDialogProps {
  envName: string;
  ariaDescribedBy?: string;
}

export function DeleteEnvironmentDialog({
  envName,
  ariaDescribedBy,
}: DeleteEnvironmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  const matches = confirm === envName;

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setConfirm("");
      setError(null);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!matches || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success(`Environment "${envName}" deleted`);
      setOpen(false);
      router.push("/environments");
    } catch (err) {
      setDeleting(false);
      setError(
        err instanceof Error ? err.message : "Failed to delete environment.",
      );
    }
  }, [matches, deleting, envName, router]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"          aria-describedby={ariaDescribedBy}
        >
          Delete Environment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete environment</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All builds, scenarios, runs, and
            associated configuration for{" "}
            <code className="font-mono text-meta rounded bg-muted-surface px-1 py-0.5 text-foreground">
              {envName}
            </code>{" "}
            will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <FormField
            id={inputId}
            label={
              <>
                Type{" "}
                <code className="font-mono text-meta rounded bg-muted-surface px-1 py-0.5 text-foreground">
                  {envName}
                </code>{" "}
                to confirm
              </>
            }
            error={error ?? undefined}
          >
            <Input
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              aria-label="Type environment name to confirm deletion"
            />
          </FormField>
        </DialogBody>
        <DialogFooter>
          <DialogCancelButton disabled={deleting} />
          <Button
            type="button"
            variant="destructive"
            size="md"
            disabled={!matches || deleting}
            onClick={handleDelete}
            aria-busy={deleting}
            className="disabled:bg-destructive disabled:text-destructive-foreground disabled:opacity-50"
          >
            {deleting && (
              <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
            )}
            {deleting ? "Deleting…" : "Delete environment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
