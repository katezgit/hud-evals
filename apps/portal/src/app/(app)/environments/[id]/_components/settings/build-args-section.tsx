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
import { Textarea } from "@repo/ui/components/textarea";

type SaveState = "idle" | "saving" | "saved" | "error";

const INITIAL_VALUE = "NODE_VERSION=20\n";

function countArgs(value: string): number {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#")).length;
}

export function BuildArgsSection() {
  const [saved, setSaved] = useState(INITIAL_VALUE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const argCount = countArgs(saved);

  return (
    <>
      <Card
        id="build-args"
        aria-labelledby="build-args-title"
        className="scroll-mt-32"
      >
        <CardContent>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="flex w-full items-center justify-between gap-4 text-left outline-hidden focus-visible:shadow-focus-ring rounded-md -m-1 p-1"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2
                id="build-args-title"
                className="text-subtitle font-semibold text-foreground"
              >
                Build Arguments
              </h2>
              <p className="text-muted-foreground">
                {argCount === 0
                  ? "No build args configured"
                  : `${argCount} ${argCount === 1 ? "arg" : "args"}`}
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
            <BuildArgsDrawer
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

function BuildArgsDrawer({
  saved,
  onSave,
  onClose,
}: {
  saved: string;
  onSave: (next: string) => void;
  onClose: () => void;
}) {
  const initial = useMemo(
    () => saved,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot on mount
    [],
  );
  const [draft, setDraft] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const textareaId = useId();

  const dirty = draft !== initial;

  const handleSave = useCallback(async () => {
    setError(null);
    setSaveState("saving");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaveState("saved");
      toast.success("Build arguments updated");
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
          <DrawerTitle>Build Arguments</DrawerTitle>
          <DrawerDescription>
            Build-time ARGs passed to the Dockerfile. Not available at runtime.
            Set via{" "}
            <code className="font-mono text-meta rounded bg-muted px-1 py-0.5 text-foreground">
              hud deploy --build-arg
            </code>
            .
          </DrawerDescription>
        </div>
        <DrawerCloseButton onClick={requestClose} />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-4">
        <FormField
          id={textareaId}
          label="KEY=value, one per line"
          helper="Blank lines and lines starting with # are ignored."
        >
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={8}
            spellCheck={false}
            className="font-mono text-meta"
            placeholder={"NODE_VERSION=20\nPNPM_VERSION=10"}
            aria-label="Build arguments"
          />
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
              Your changes to build arguments haven&apos;t been saved.
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
