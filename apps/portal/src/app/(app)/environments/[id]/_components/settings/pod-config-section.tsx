"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { CheckIcon, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Dialog,
  DialogBody,
  DialogCancelButton,
  DialogConfirmButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
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

interface TierMeta {
  value: string;
  label: string;
  /** Short label shown in the inline chip summary. */
  chipLabel: string;
  /** Hourly cost shown next to the chip label. */
  hourlyCost: string;
}

const RESOURCE_TIERS: ReadonlyArray<TierMeta> = [
  {
    value: "default",
    label: "Default — 1 vCPU · 4 GB · $0.50/hr",
    chipLabel: "Default",
    hourlyCost: "$0.50/hr",
  },
  {
    value: "performance",
    label: "Performance — 2 vCPU · 8 GB · $1.20/hr",
    chipLabel: "Performance",
    hourlyCost: "$1.20/hr",
  },
  {
    value: "high-memory",
    label: "High Memory — 2 vCPU · 16 GB · $1.80/hr",
    chipLabel: "High Memory",
    hourlyCost: "$1.80/hr",
  },
  {
    value: "gpu-t4",
    label: "GPU T4 — 4 vCPU · 16 GB · 1×T4 · $3.40/hr",
    chipLabel: "GPU T4",
    hourlyCost: "$3.40/hr",
  },
];

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tierMeta =
    RESOURCE_TIERS.find((t) => t.value === saved.tier) ?? RESOURCE_TIERS[0]!;

  return (
    <>
      <Card
        id="pod-config"
        aria-labelledby="pod-config-title"
        className={cn(
          "scroll-mt-32 transition-colors duration-fast ease-out-standard",
          drawerOpen && "border-border-strong bg-selected-surface",
        )}
      >
        <CardContent>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="flex w-full items-center justify-between gap-4 text-left cursor-pointer outline-hidden focus-visible:shadow-focus-ring rounded-md -m-1 p-1"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2
                id="pod-config-title"
                className="text-subtitle font-semibold text-foreground"
              >
                Pod Configuration
              </h2>
              <p className="text-muted-foreground">
                <span className="text-foreground">{tierMeta.chipLabel}</span>
                <span aria-hidden="true" className="mx-1.5">
                  &middot;
                </span>
                <span className="font-mono text-meta">
                  {tierMeta.hourlyCost}
                </span>
              </p>
            </div>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
          </button>
        </CardContent>
      </Card>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerContent size="md">
          {drawerOpen && (
            <PodConfigDrawer
              saved={saved}
              onSave={(next) => {
                setSaved(next);
                setDrawerOpen(false);
              }}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

function PodConfigDrawer({
  saved,
  onSave,
  onClose,
}: {
  saved: PodConfig;
  onSave: (next: PodConfig) => void;
  onClose: () => void;
}) {
  const initial = useMemo<PodConfig>(
    () => saved,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot on mount
    [],
  );
  const [draft, setDraft] = useState<PodConfig>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const tierId = useId();
  const timeoutId = useId();
  const durationId = useId();

  const dirty =
    draft.tier !== initial.tier ||
    draft.requestTimeout !== initial.requestTimeout ||
    draft.sessionDuration !== initial.sessionDuration;

  const handleSave = useCallback(async () => {
    setError(null);
    setSaveState("saving");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaveState("saved");
      toast.success("Pod configuration updated");
      onSave(draft);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save.");
    }
  }, [draft, onSave]);

  const requestClose = useCallback(() => {
    if (dirty) {
      setConfirmDiscardOpen(true);
    } else {
      onClose();
    }
  }, [dirty, onClose]);

  return (
    <>
      <DrawerHeader>
        <div className="flex min-w-0 flex-col gap-1">
          <DrawerTitle>Pod Configuration</DrawerTitle>
          <DrawerDescription>
            Compute envelope for sandbox pods spawned by this environment.
          </DrawerDescription>
        </div>
        <DrawerCloseButton onClick={requestClose} />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-4">
        <FormField
          id={tierId}
          label="Resource Tier"
          helper="Select the compute tier for sandbox pods spawned by this environment."
        >
          <Select
            value={draft.tier}
            onValueChange={(value) => setDraft((d) => ({ ...d, tier: value }))}
          >
            <SelectTrigger id={tierId} className="w-full" aria-label="Resource Tier">
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

        {saveState === "error" && error && (
          <p className="text-state-errored">{error}</p>
        )}
      </DrawerBody>

      <DrawerFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={requestClose}
          disabled={saveState === "saving"}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={saveState === "saving" || saveState === "saved" || !dirty}
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
      </DrawerFooter>

      <Dialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-body text-muted-foreground">
              Your changes to pod configuration haven&apos;t been saved.
              Discard them and close, or go back to keep editing.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogCancelButton onClick={() => setConfirmDiscardOpen(false)}>
              Keep editing
            </DialogCancelButton>
            <DialogConfirmButton
              onClick={() => {
                setConfirmDiscardOpen(false);
                onClose();
              }}
            >
              Discard
            </DialogConfirmButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
