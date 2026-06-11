"use client";

import { useState } from "react";
import { Lock, TriangleAlertIcon } from "lucide-react";
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

interface VisibilitySectionProps {
  tasksetName: string;
}

export default function VisibilitySection({
  tasksetName,
}: VisibilitySectionProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const onConfirm = async () => {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setPending(false);
    setOpen(false);
    toast.success(`${tasksetName} is now public.`);
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-body font-semibold text-foreground">Visibility</h3>

      <div className="flex items-center gap-2">
        <Lock aria-hidden="true" className="size-4 text-muted-foreground" />
        <span className="text-body text-foreground">Private</span>
      </div>
      <p className="text-caption text-muted-foreground">
        This Taskset is only visible to your org.
      </p>

      <div className="flex flex-col items-start gap-1.5">
        <Button
          type="button"
          variant="primary"
          onClick={() => setOpen(true)}
          aria-label="Publish Taskset"
        >
          Publish
        </Button>
        <p className="text-caption text-muted-foreground">
          Make this Taskset visible in the public Marketplace.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlertIcon
                aria-hidden="true"
                className="size-4 text-state-warning"
              />
              Publish &lsquo;{tasksetName}&rsquo; to the Marketplace?
            </DialogTitle>
            <DialogDescription>
              This Taskset and its leaderboard entries will be visible to other
              orgs. Future Job runs on this Taskset will appear in the public
              leaderboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogCancelButton disabled={pending} />
            <DialogConfirmButton onClick={onConfirm} disabled={pending}>
              {pending ? "Publishing…" : "Publish"}
            </DialogConfirmButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
