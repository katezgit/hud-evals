"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/cn";

interface NameSectionProps {
  name: string;
}

export default function NameSection({ name: committed }: NameSectionProps) {
  const inputId = useId();
  const [saved, setSaved] = useState(committed);
  const [draft, setDraft] = useState(committed);
  const [pending, setPending] = useState(false);

  const trimmed = draft.trim();
  const isEmpty = trimmed.length === 0;
  const isDirty = draft !== saved;

  const onSave = async () => {
    if (isEmpty) {
      // Save remains enabled per form-actions convention; validation surfaces inline.
      return;
    }
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSaved(draft);
    setPending(false);
    toast.success("Taskset Name updated.");
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-body font-semibold text-foreground">Taskset Name</h3>

      <FormField
        id={inputId}
        error={isDirty && isEmpty ? "Name cannot be empty." : undefined}
      >
        <Input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={pending}
          autoComplete="off"
          spellCheck={false}
          aria-label="Taskset Name"
        />
      </FormField>

      <p className="text-caption text-muted-foreground">
        This name is displayed throughout the platform.
      </p>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setDraft(saved)}
          aria-hidden={!isDirty}
          tabIndex={!isDirty || pending ? -1 : undefined}
          className={cn(
            (!isDirty || pending) && "pointer-events-none opacity-0",
          )}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={pending}
          onClick={onSave}
          aria-label="Save Taskset Name"
        >
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </section>
  );
}
