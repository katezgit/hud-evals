"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

/**
 * Expiration options surfaced in the dialog Select.
 * - "none" maps to `expiresAt: null` (Never).
 * - Day-count options resolve to `now + N days` at generation time.
 * The order matches the spec; do not reorder without updating the spec too.
 */
export type ExpirationOption = "none" | "30d" | "90d" | "180d" | "1y";

const EXPIRATION_LABEL: Record<ExpirationOption, string> = {
  none: "No expiration",
  "30d": "30 days",
  "90d": "90 days",
  "180d": "180 days",
  "1y": "1 year",
};

const EXPIRATION_ORDER: ReadonlyArray<ExpirationOption> = [
  "none",
  "30d",
  "90d",
  "180d",
  "1y",
];

const DEFAULT_EXPIRATION: ExpirationOption = "30d";

export interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires when the user clicks Generate with a valid name. */
  onGenerate: (input: { name: string; expiration: ExpirationOption }) => void;
}

/**
 * Step 1 of the API key creation flow.
 * Name is required; Generate is disabled until a non-whitespace name is entered.
 * Cancel / Esc / backdrop click all dismiss + reset via the `open` transition.
 */
export function CreateApiKeyDialog({ open, onOpenChange, onGenerate }: CreateApiKeyDialogProps) {
  const nameId = useId();
  const [name, setName] = useState("");
  const [expiration, setExpiration] = useState<ExpirationOption>(DEFAULT_EXPIRATION);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form state every time the dialog closes so reopening starts clean.
  // Radix Dialog keeps the panel mounted across open/close, so without this the
  // previous name/expiration would still be in state on next open.
  useEffect(() => {
    if (!open) {
      setName("");
      setExpiration(DEFAULT_EXPIRATION);
    }
  }, [open]);

  const trimmedName = name.trim();
  const canGenerate = trimmedName.length > 0;

  const handleGenerate = () => {
    if (!canGenerate) return;
    onGenerate({ name: trimmedName, expiration });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="sm"
        onOpenAutoFocus={(event) => {
          // Radix focuses the first focusable on open; we want the Name input
          // explicitly so the user can type immediately.
          event.preventDefault();
          nameInputRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>
            This API key will be tied to your user account and visible throughout your organization
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <FormField id={nameId} label="Name" required>
              <Input
                ref={nameInputRef}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </FormField>
            <div className="flex flex-col gap-1.5">
              <span className="text-label text-foreground">Expiration</span>
              <Select
                value={expiration}
                onValueChange={(value) => setExpiration(value as ExpirationOption)}
              >
                <SelectTrigger className="w-full" aria-label="Expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_ORDER.map((option) => (
                    <SelectItem key={option} value={option}>
                      {EXPIRATION_LABEL[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleGenerate} disabled={!canGenerate}>
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
