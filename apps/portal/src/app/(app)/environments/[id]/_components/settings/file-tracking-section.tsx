"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckIcon, Loader2, Plus, X } from "lucide-react";
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
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { cn } from "@repo/ui/lib/cn";

type SaveState = "idle" | "saving" | "saved" | "error";

const DEFAULT_TRACKED_PATHS: ReadonlyArray<string> = [
  "/home",
  "/root",
  "/workspace",
  "/app",
];

const DEFAULT_EXCLUDE_PATTERNS: ReadonlyArray<string> = [
  "node_modules/",
  ".venv/",
  "__pycache__/",
  "*.pyc",
  ".cache/",
  ".npm/",
  ".git/objects/",
  ".git/logs/",
  "*.so",
  "*.o",
];

interface FileTrackingState {
  enabled: boolean;
  trackedPaths: ReadonlyArray<string>;
  excludePatterns: ReadonlyArray<string>;
}

const INITIAL_STATE: FileTrackingState = {
  enabled: false,
  trackedPaths: DEFAULT_TRACKED_PATHS,
  excludePatterns: DEFAULT_EXCLUDE_PATTERNS,
};

export function FileTrackingSection() {
  const [saved, setSaved] = useState<FileTrackingState>(INITIAL_STATE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const switchId = useId();

  return (
    <>
      <Card
        id="file-tracking"
        aria-labelledby="file-tracking-title"
        className={cn(
          "scroll-mt-32 transition-colors duration-fast ease-out-standard",
          drawerOpen && "border-primary bg-primary-glow",
        )}
      >
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2
              id="file-tracking-title"
              className="text-subtitle font-semibold text-foreground"
            >
              File Tracking
            </h2>
            <p className="text-muted-foreground">
              File changes in the container will appear as diffs on the trace.
            </p>
          </div>
          <Switch
            id={switchId}
            checked={saved.enabled}
            onCheckedChange={() => setDrawerOpen(true)}
            aria-label="Toggle file tracking"
          />
        </CardContent>
      </Card>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerContent size="md">
          {drawerOpen && (
            <FileTrackingDrawer
              saved={saved}
              proposedEnabled={!saved.enabled}
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

function FileTrackingDrawer({
  saved,
  proposedEnabled,
  onSave,
  onClose,
}: {
  saved: FileTrackingState;
  proposedEnabled: boolean;
  onSave: (next: FileTrackingState) => void;
  onClose: () => void;
}) {
  const initialDraft = useMemo<FileTrackingState>(
    () => ({ ...saved, enabled: proposedEnabled }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot on mount only
    [],
  );
  const [draft, setDraft] = useState<FileTrackingState>(initialDraft);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const switchId = useId();

  // Dirty = user has touched the form since open. Compare to the initial draft
  // (which already includes the proposed enable-flip), not to `saved` — that
  // way the pre-flip isn't counted as a user change.
  const dirty =
    draft.enabled !== initialDraft.enabled ||
    !arraysEqual(draft.trackedPaths, initialDraft.trackedPaths) ||
    !arraysEqual(draft.excludePatterns, initialDraft.excludePatterns);

  const handleSave = useCallback(async () => {
    setError(null);
    setSaveState("saving");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaveState("saved");
      toast.success("File tracking configuration updated");
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
          <DrawerTitle>File Tracking</DrawerTitle>
          <DrawerDescription>
            File changes in the container will appear as diffs on the trace.
          </DrawerDescription>
        </div>
        <DrawerCloseButton onClick={requestClose} />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor={switchId}
            className="text-label font-medium text-foreground"
          >
            {draft.enabled ? "Enabled" : "Disabled"}
          </label>
          <Switch
            id={switchId}
            checked={draft.enabled}
            onCheckedChange={(next) =>
              setDraft((prev) => ({ ...prev, enabled: next }))
            }
            aria-label="Enable file tracking"
          />
        </div>

        {draft.enabled && (
          <>
            <PatternList
              label="Tracked Paths"
              placeholder="/path/to/track"
              addButtonLabel="Add path"
              values={draft.trackedPaths}
              onAdd={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  trackedPaths: [...prev.trackedPaths, value],
                }))
              }
              onRemove={(index) =>
                setDraft((prev) => ({
                  ...prev,
                  trackedPaths: prev.trackedPaths.filter((_, i) => i !== index),
                }))
              }
            />
            <PatternList
              label="Exclude Patterns"
              placeholder="pattern"
              addButtonLabel="Add pattern"
              values={draft.excludePatterns}
              onAdd={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  excludePatterns: [...prev.excludePatterns, value],
                }))
              }
              onRemove={(index) =>
                setDraft((prev) => ({
                  ...prev,
                  excludePatterns: prev.excludePatterns.filter(
                    (_, i) => i !== index,
                  ),
                }))
              }
            />
          </>
        )}

        {saveState === "error" && error && (
          <p className="text-state-errored">{error}</p>
        )}
      </DrawerBody>

      <DrawerFooter>
        <Button
          type="button"
          variant="secondary"          onClick={requestClose}
          disabled={saveState === "saving"}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"          disabled={saveState === "saving" || saveState === "saved"}
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
              Your changes to file tracking haven&apos;t been saved. Discard
              them and close, or go back to keep editing.
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

interface PatternListProps {
  label: ReactNode;
  placeholder: string;
  addButtonLabel: string;
  values: ReadonlyArray<string>;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}

function PatternList({
  label,
  placeholder,
  addButtonLabel,
  values,
  onAdd,
  onRemove,
}: PatternListProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleAdd = useCallback(() => {
    const value = draft.trim();
    if (value === "" || values.includes(value)) {
      setDraft("");
      return;
    }
    onAdd(value);
    setDraft("");
    inputRef.current?.focus();
  }, [draft, values, onAdd]);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-label font-medium text-foreground pb-1">
        {label}
      </legend>
      <ul className="flex flex-col gap-1">
        {values.map((value, index) => (
          <li
            key={`${value}-${index}`}
            className={cn(
              "flex items-center justify-between gap-2 rounded-md",
              "border border-border bg-card px-3 py-1.5",
              "font-mono text-meta text-foreground",
            )}
          >
            <span className="truncate">{value}</span>
            <IconButton
              type="button"
              variant="ghost"              aria-label={`Remove ${value}`}
              onClick={() => onRemove(index)}
            >
              <X aria-hidden="true" />
            </IconButton>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="font-mono flex-1 min-w-0"
        />
        <Button
          type="button"
          variant="secondary"          onClick={handleAdd}
          disabled={draft.trim() === ""}
        >
          <Plus aria-hidden="true" className="size-3.5" />
          {addButtonLabel}
        </Button>
      </div>
    </fieldset>
  );
}

function arraysEqual(
  a: ReadonlyArray<string>,
  b: ReadonlyArray<string>,
): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}
