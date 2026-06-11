"use client";

import { Button } from "@repo/ui/components/button";
import { CopyButton } from "@repo/ui/components/copy-button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

export interface SaveApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Full unmasked secret. Held in memory by the page; cleared once dismissed. */
  apiKey: string;
}

export function SaveApiKeyDialog({ open, onOpenChange, apiKey }: SaveApiKeyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Save your key</DialogTitle>
          <DialogDescription>
            You won&apos;t be able to view this again, so be sure to save it in a safe place. Anyone
            can make requests with this key.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-md border border-border bg-muted-surface px-3 py-2 font-mono text-body text-foreground">
              {apiKey}
            </code>
            <CopyButton
              value={apiKey}
              ariaLabel="Copy API key"
              className="shrink-0"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
