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
import { Input } from "@repo/ui/components/input";
import { CopyButton } from "@repo/ui/components/copy-button";
import { cn } from "@repo/ui/lib/cn";

type SaveState = "idle" | "saving" | "saved" | "error";

interface EnvInfoSectionProps {
  envId: string;
  displayName: string;
}

export function EnvInfoSection({ envId, displayName }: EnvInfoSectionProps) {
  const [savedName, setSavedName] = useState(displayName);
  const [name, setName] = useState(displayName);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const nameId = useId();
  const envIdInputId = useId();

  const dirty = name.trim() !== savedName.trim() && name.trim() !== "";
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
      setSavedName(name.trim());
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save.");
    }
  }

  function handleCancel() {
    setName(savedName);
    setError(null);
    setSaveState("idle");
  }

  return (
    <Card
      id="env-info"
      aria-labelledby="env-info-title"
      className="scroll-mt-32"
    >
      <CardHeader>
        <CardTitle>
          <h2
            id="env-info-title"
            className="text-subtitle font-semibold text-foreground"
          >
            Environment Info
          </h2>
        </CardTitle>
        <CardDescription>
          Identity that surfaces wherever this environment is referenced.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <FormField id={nameId} label="Display Name">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Display Name"
            />
          </FormField>

          <FormField
            id={envIdInputId}
            label="Environment ID"
            helper={
              <>
                Link via{" "}
                <code className="font-mono text-meta rounded bg-muted px-1 py-0.5 text-foreground">
                  hud link --id {envId}
                </code>
              </>
            }
          >
            <div className="flex items-center gap-2">
              <Input
                value={envId}
                readOnly
                aria-label="Environment ID"
                className={cn("font-mono flex-1")}
              />
              <CopyButton value={envId} ariaLabel={`Copy environment ID ${envId}`} />
            </div>
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
            <p className="text-state-errored text-right">{error}</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
