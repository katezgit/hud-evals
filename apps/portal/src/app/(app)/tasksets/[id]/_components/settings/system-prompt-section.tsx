"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/cn";

interface SystemPromptSectionProps {
  systemPrompt: string;
}

export default function SystemPromptSection({
  systemPrompt: committed,
}: SystemPromptSectionProps) {
  const helpId = useId();
  const fieldId = useId();
  const [saved, setSaved] = useState(committed);
  const [draft, setDraft] = useState(committed);
  const [pending, setPending] = useState(false);

  const isDirty = draft !== saved;

  const onSave = async () => {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSaved(draft);
    setPending(false);
    toast.success("System Prompt updated.");
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-body font-semibold text-foreground">System Prompt</h3>

      <Textarea
        id={fieldId}
        rows={5}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={pending}
        placeholder="Enter a system prompt to apply to all Tasks in this Taskset…"
        aria-label="System Prompt"
        aria-describedby={helpId}
      />

      <p id={helpId} className="text-caption text-muted-foreground">
        This prompt is prepended to every Task&apos;s system prompt when running
        Jobs. Changing this prompt affects future Job runs only. Existing
        leaderboard scores stay as recorded.
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
          aria-label="Save System Prompt"
        >
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </section>
  );
}
