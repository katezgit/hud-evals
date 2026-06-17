"use client";

import { useState } from "react";
import { Globe, Lock, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogBody,
  DialogCancelButton,
  DialogConfirmButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import type { Taskset } from "@/lib/mock/tasksets";

type Visibility = Taskset["visibility"];

interface VisibilitySectionProps {
  tasksetName: string;
  visibility: Visibility;
}

export default function VisibilitySection({
  tasksetName,
  visibility: initial,
}: VisibilitySectionProps) {
  const [visibility, setVisibility] = useState<Visibility>(initial);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const isPrivate = visibility === "private";
  const target: Visibility = isPrivate ? "public" : "private";
  const actionLabel = isPrivate ? "Make Public" : "Make Private";

  const onConfirm = async () => {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setVisibility(target);
    setPending(false);
    setOpen(false);
    toast.success(
      target === "public"
        ? `${tasksetName} is now public.`
        : `${tasksetName} is now private.`,
    );
  };

  return (
    <>
      <Card
        id="taskset-visibility"
        aria-labelledby="taskset-visibility-title"
        className="scroll-mt-32"
      >
        <CardHeader>
          <CardTitle>
            <h2
              id="taskset-visibility-title"
              className="text-subtitle font-semibold text-foreground"
            >
              Visibility
            </h2>
          </CardTitle>
          <CardDescription>
            {isPrivate
              ? "Visible only to your organization."
              : "Visible in the public Marketplace."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-muted-surface px-3 py-1.5 font-mono text-body text-muted-foreground">
            {isPrivate ? (
              <Lock aria-hidden="true" className="size-4" />
            ) : (
              <Globe aria-hidden="true" className="size-4" />
            )}
            {isPrivate ? "Private" : "Public"}
          </span>
        </CardContent>
        <CardFooter className="flex-col items-stretch">
          <div className="flex w-full flex-col gap-1.5">
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant={isPrivate ? "primary" : "secondary"}
                onClick={() => setOpen(true)}
                aria-label={actionLabel}
              >
                {actionLabel}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlertIcon
                aria-hidden="true"
                className="size-4 text-state-warning"
              />
              {isPrivate
                ? `Publish ‘${tasksetName}’ to the Marketplace?`
                : `Make ‘${tasksetName}’ private?`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isPrivate
                ? `Confirm publishing ${tasksetName} to the Marketplace.`
                : `Confirm reverting ${tasksetName} to private.`}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-body text-foreground">
              {isPrivate
                ? "This Taskset and its leaderboard entries will be visible to others. Future Job runs on this Taskset will appear in the public leaderboard."
                : "This Taskset will no longer appear in the public Marketplace. Existing public forks remain independent. Job history stays attributed."}
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogCancelButton disabled={pending} />
            <DialogConfirmButton onClick={onConfirm} disabled={pending}>
              {pending ? "Updating…" : actionLabel}
            </DialogConfirmButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
