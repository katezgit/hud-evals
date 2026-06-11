"use client";

import { useEffect, useId, useState } from "react";
import { CheckIcon, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { FormField } from "@repo/ui/components/form-field";
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/cn";

type SaveState = "idle" | "saving" | "saved" | "error";

export function BuildArgsSection() {
  const [saved, setSaved] = useState("NODE_VERSION=20\n");
  const [draft, setDraft] = useState("NODE_VERSION=20\n");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const textareaId = useId();

  const dirty = draft !== saved;
  const cancelHidden =
    !dirty || saveState === "saving" || saveState === "saved";

  useEffect(() => {
    if (!dirty) return;
    function handler(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  async function handleSave() {
    setError(null);
    setSaveState("saving");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaved(draft);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save.");
    }
  }

  function handleCancel() {
    setDraft(saved);
    setError(null);
    setSaveState("idle");
  }

  return (
    <Card
      id="build-args"
      aria-labelledby="build-args-title"
      className="scroll-mt-32"
    >
      <CardHeader>
        <CardTitle>
          <h2
            id="build-args-title"
            className="text-subtitle font-semibold text-foreground"
          >
            Build Arguments
          </h2>
        </CardTitle>
        <CardDescription>
          Build-time ARGs passed to the Dockerfile. Not available at runtime.
          Set via{" "}
          <code className="font-mono text-meta rounded bg-muted-surface px-1 py-0.5 text-foreground">
            hud deploy --build-arg
          </code>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <FormField
            id={textareaId}
            label="KEY=value, one per line"
            helper="Blank lines and lines starting with # are ignored."
          >
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={5}
              spellCheck={false}
              className="font-mono text-meta"
              placeholder={"NODE_VERSION=20\nPNPM_VERSION=10"}
              aria-label="Build arguments"
            />
          </FormField>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch">
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              aria-hidden={cancelHidden}
              tabIndex={cancelHidden ? -1 : undefined}
              className={cn(cancelHidden && "pointer-events-none opacity-0")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={saveState === "saving" || saveState === "saved"}
              onClick={handleSave}
              aria-busy={saveState === "saving"}
            >
              {saveState === "saving" && (
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
              )}
              {saveState === "saved" && (
                <CheckIcon aria-hidden="true" className="size-3.5" />
              )}
              {saveState === "saving" && "Saving…"}
              {saveState === "saved" && "Saved"}
              {(saveState === "idle" || saveState === "error") && "Save"}
            </Button>
          </div>
          {saveState === "error" && error && (
            <p className="text-label text-state-errored text-right">{error}</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
