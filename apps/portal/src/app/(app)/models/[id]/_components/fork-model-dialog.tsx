"use client";

import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogCancelButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import type { Model } from "../_data/types";

type ForkModelDialogProps = {
  model: Pick<
    Model,
    "id" | "displayName" | "apiName" | "activeCheckpointId" | "activeCheckpointStep"
  >;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ForkModelDialog({ model, open, onOpenChange }: ForkModelDialogProps) {
  const nameId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const defaultName = `${model.apiName}-fork`;
  const [name, setName] = useState(defaultName);
  const [submitting, setSubmitting] = useState(false);

  // Radix keeps the panel mounted across open/close — without this the next open
  // would show the previous attempt's typed value.
  useEffect(() => {
    if (!open) {
      setName(defaultName);
      setSubmitting(false);
    }
  }, [open, defaultName]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !submitting;

  const subtitle =
    model.activeCheckpointStep !== null
      ? `Create a new model from ${model.displayName} · step ${model.activeCheckpointStep}.`
      : `Create a new model from ${model.displayName}'s current checkpoint.`;

  const handleFork = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    // Mock the create round-trip — no backend, no persistence this turn.
    setTimeout(() => {
      toast.success(`Forked as "${trimmedName}"`);
      onOpenChange(false);
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="sm"
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          nameInputRef.current?.focus();
          nameInputRef.current?.select();
        }}
      >
        <DialogHeader>
          <DialogTitle>Fork {model.displayName}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleFork();
            }}
          >
            <p className="text-body text-foreground">{subtitle}</p>

            <FormField id={nameId} label="Name" required>
              <Input
                ref={nameInputRef}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                disabled={submitting}
                className="font-mono"
              />
            </FormField>

            <button type="submit" className="hidden" aria-hidden="true" />
          </form>
        </DialogBody>
        <DialogFooter>
          <DialogCancelButton disabled={submitting} />
          <Button
            type="button"
            variant="primary"
            onClick={handleFork}
            disabled={!canSubmit}
          >
            {submitting ? "Forking…" : "Fork"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
