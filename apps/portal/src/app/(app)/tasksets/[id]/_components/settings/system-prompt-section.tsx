"use client";

import { useId, useState } from "react";
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
    <Card
      id="taskset-system-prompt"
      aria-labelledby="taskset-system-prompt-title"
      className="scroll-mt-32"
    >
      <CardHeader>
        <CardTitle>
          <h2
            id="taskset-system-prompt-title"
            className="text-subtitle font-semibold text-foreground"
          >
            System Prompt
          </h2>
        </CardTitle>
        <CardDescription id={helpId}>
          Applied to every task in this taskset. Changes affect future job runs
          only — existing leaderboard scores remain unchanged.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
      <CardFooter className="flex-col items-stretch">
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center justify-end gap-2">
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
        </div>
      </CardFooter>
    </Card>
  );
}
