"use client";

import { useState } from "react";
import { Trash2, TriangleAlertIcon } from "lucide-react";
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
import { IconButton } from "@repo/ui/components/icon-button";

interface RemoveMemberButtonProps {
  name: string;
  onRemove: () => void;
}

export function RemoveMemberButton({ name, onRemove }: RemoveMemberButtonProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onRemove();
    setOpen(false);
  };

  return (
    <>
      <IconButton
        variant="destructive-ghost"
        size="sm"
        aria-label={`Remove ${name}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden="true" className="size-3.5" />
      </IconButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlertIcon
                aria-hidden="true"
                className="size-4 text-state-errored"
              />
              Remove member
            </DialogTitle>
            <DialogDescription>
              Remove{" "}
              <span className="font-medium text-foreground">{name}</span> from
              this organization. They&rsquo;ll lose access immediately. You can
              re-invite them later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogCancelButton />
            <DialogDestructiveButton onClick={handleConfirm}>
              Remove member
            </DialogDestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
