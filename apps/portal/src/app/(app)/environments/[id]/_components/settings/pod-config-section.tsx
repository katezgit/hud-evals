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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/cn";

type SaveState = "idle" | "saving" | "saved" | "error";

const RESOURCE_TIERS = [
  { value: "default", label: "Default — 1 vCPU · 4 GB · $0.50/hr" },
  { value: "performance", label: "Performance — 2 vCPU · 8 GB · $1.20/hr" },
  { value: "high-memory", label: "High Memory — 2 vCPU · 16 GB · $1.80/hr" },
  { value: "gpu-t4", label: "GPU T4 — 4 vCPU · 16 GB · 1×T4 · $3.40/hr" },
] as const;

const REQUEST_TIMEOUTS = [
  { value: "60", label: "1 minute" },
  { value: "300", label: "5 minutes" },
  { value: "600", label: "10 minutes (default)" },
  { value: "1800", label: "30 minutes" },
  { value: "3600", label: "1 hour" },
] as const;

const SESSION_DURATIONS = [
  { value: "1800", label: "30 minutes" },
  { value: "3600", label: "1 hour" },
  { value: "10800", label: "3 hours (default)" },
  { value: "21600", label: "6 hours" },
  { value: "43200", label: "12 hours" },
] as const;

interface PodConfig {
  tier: string;
  requestTimeout: string;
  sessionDuration: string;
}

const DEFAULTS: PodConfig = {
  tier: "default",
  requestTimeout: "600",
  sessionDuration: "10800",
};

export function PodConfigSection() {
  const [saved, setSaved] = useState<PodConfig>(DEFAULTS);
  const [draft, setDraft] = useState<PodConfig>(DEFAULTS);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const tierId = useId();
  const timeoutId = useId();
  const durationId = useId();

  const dirty =
    draft.tier !== saved.tier ||
    draft.requestTimeout !== saved.requestTimeout ||
    draft.sessionDuration !== saved.sessionDuration;
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
      id="pod-config"
      aria-labelledby="pod-config-title"
      className="scroll-mt-32"
    >
      <CardHeader>
        <CardTitle>
          <h2
            id="pod-config-title"
            className="text-subtitle font-semibold text-foreground"
          >
            Pod Configuration
          </h2>
        </CardTitle>
        <CardDescription>
          Compute envelope for sandbox pods spawned by this environment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <FormField
            id={tierId}
            label="Resource Tier"
            helper="Select the compute tier for sandbox pods spawned by this environment."
          >
            <Select
              value={draft.tier}
              onValueChange={(value) => setDraft((d) => ({ ...d, tier: value }))}
            >
              <SelectTrigger id={tierId} size="sm" className="w-full" aria-label="Resource Tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TIERS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id={timeoutId} label="Request Timeout">
            <Select
              value={draft.requestTimeout}
              onValueChange={(value) =>
                setDraft((d) => ({ ...d, requestTimeout: value }))
              }
            >
              <SelectTrigger
                id={timeoutId}
                size="sm"
                className="w-full"
                aria-label="Request Timeout"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TIMEOUTS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id={durationId}
            label="Session Duration Limit"
            helper="Sessions exceeding this limit are automatically terminated."
          >
            <Select
              value={draft.sessionDuration}
              onValueChange={(value) =>
                setDraft((d) => ({ ...d, sessionDuration: value }))
              }
            >
              <SelectTrigger
                id={durationId}
                size="sm"
                className="w-full"
                aria-label="Session Duration Limit"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SESSION_DURATIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch">
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
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
              size="sm"
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
              {(saveState === "idle" || saveState === "error") && "Save Pod Configuration"}
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
