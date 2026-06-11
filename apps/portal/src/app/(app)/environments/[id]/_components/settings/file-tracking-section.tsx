"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckIcon, Loader2, Plus, X } from "lucide-react";
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
  const [draft, setDraft] = useState<FileTrackingState>(INITIAL_STATE);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const switchId = useId();

  const dirty =
    draft.enabled !== saved.enabled ||
    !arraysEqual(draft.trackedPaths, saved.trackedPaths) ||
    !arraysEqual(draft.excludePatterns, saved.excludePatterns);
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

  const handleSave = useCallback(async () => {
    setError(null);
    setSaveState("saving");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaved(draft);
      setSaveState("saved");
      toast.success("File tracking configuration updated");
      window.setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save.");
    }
  }, [draft]);

  const handleCancel = useCallback(() => {
    setDraft(saved);
    setError(null);
    setSaveState("idle");
  }, [saved]);

  return (
    <Card
      id="file-tracking"
      aria-labelledby="file-tracking-title"
      className="scroll-mt-32"
    >
      <CardHeader>
        <CardTitle>
          <h2
            id="file-tracking-title"
            className="text-subtitle font-semibold text-foreground"
          >
            File Tracking
          </h2>
        </CardTitle>
        <CardDescription>
          File changes in the container will appear as diffs on the trace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
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
              {(saveState === "idle" || saveState === "error") &&
                "Save File Tracking"}
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
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-label font-medium text-foreground">{label}</legend>
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
              variant="ghost"
              size="sm"
              aria-label={`Remove ${value}`}
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
          variant="secondary"
          size="sm"
          onClick={handleAdd}
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
