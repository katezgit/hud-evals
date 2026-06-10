"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createTasksetAction } from "@/lib/mock/taskset-actions";
import type { TasksetPurpose } from "@/lib/mock/tasksets";

const DEFAULT_PURPOSE: TasksetPurpose = "benchmark";

export default function CreateTasksetDialog() {
  const router = useRouter();
  const nameId = useId();
  const purposeId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState<TasksetPurpose>(DEFAULT_PURPOSE);
  const [submitting, setSubmitting] = useState(false);

  // Reset on close — Radix keeps panel mounted, so without this the next open
  // reflects the previous attempt.
  useEffect(() => {
    if (!open) {
      setName("");
      setPurpose(DEFAULT_PURPOSE);
      setSubmitting(false);
    }
  }, [open]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !submitting;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const created = await createTasksetAction({ name: trimmedName, purpose });
    setOpen(false);
    router.push(`/tasksets/${created.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          New Taskset
        </Button>
      </DialogTrigger>
      <DialogContent
        size="sm"
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          nameInputRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>New Taskset</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreate();
            }}
          >
            <FormField id={nameId} label="Name" required>
              <Input
                ref={nameInputRef}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                disabled={submitting}
              />
            </FormField>

            <FormField id={purposeId} label="Purpose" required>
              <Select
                value={purpose}
                onValueChange={(v) => setPurpose(v as TasksetPurpose)}
                disabled={submitting}
              >
                <SelectTrigger size="sm" className="w-fit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="benchmark">Benchmark</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <button type="submit" className="hidden" aria-hidden="true" />
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleCreate}
            disabled={!canSubmit}
          >
            {submitting ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
