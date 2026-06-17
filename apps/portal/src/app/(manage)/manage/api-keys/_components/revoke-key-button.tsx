"use client";

import { useState } from "react";
import { Trash2, TriangleAlertIcon } from "lucide-react";
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
import { IconButton } from "@repo/ui/components/icon-button";

interface RevokeKeyButtonProps {
  name: string;
  onRevoke: () => void;
}

export function RevokeKeyButton({ name, onRevoke }: RevokeKeyButtonProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onRevoke();
    setOpen(false);
  };

  return (
    <>
      <IconButton
        variant="destructive-ghost"
        size="sm"
        aria-label={`Revoke ${name}`}
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
              Revoke API key
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirm permanent revocation of API key {name}.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-body text-foreground">
              This permanently revokes the key{" "}
              <code className="font-mono text-label text-foreground">
                {name}
              </code>
              . Any SDK still using it will stop authenticating. This action
              can&rsquo;t be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogCancelButton />
            <DialogDestructiveButton onClick={handleConfirm}>
              Revoke key
            </DialogDestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
