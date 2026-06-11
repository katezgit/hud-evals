"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckIcon, ChevronRight, Loader2, Plus, X } from "lucide-react";
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
import { cn } from "@repo/ui/lib/cn";
import { ConfigureVarRow } from "../configure-var-row";
import type { EnvVarSpec } from "../../_data/types";

type SaveState = "idle" | "saving" | "saved" | "error";

interface SecretRow {
  uid: string;
  key: string;
}

interface BuildSecretsState {
  rows: ReadonlyArray<SecretRow>;
  values: Record<string, string>;
}

const SEED_ROWS: ReadonlyArray<SecretRow> = [
  { uid: "seed-npm", key: "NPM_TOKEN" },
];

const SEED_VALUES: Record<string, string> = {
  NPM_TOKEN: "npm_••••••••••••••••",
};

const INITIAL_STATE: BuildSecretsState = {
  rows: SEED_ROWS,
  values: SEED_VALUES,
};

export function BuildSecretsSection() {
  const [saved, setSaved] = useState<BuildSecretsState>(INITIAL_STATE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const count = saved.rows.length;

  return (
    <>
      <Card
        id="build-secrets"
        aria-labelledby="build-secrets-title"
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
                id="build-secrets-title"
                className="text-subtitle font-semibold text-foreground"
              >
                Build Secrets
              </h2>
              <p className="text-muted-foreground">
                {count === 0
                  ? "No secrets configured"
                  : `${count} ${count === 1 ? "secret" : "secrets"}`}
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
            <BuildSecretsDrawer
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

function BuildSecretsDrawer({
  saved,
  onSave,
  onClose,
}: {
  saved: BuildSecretsState;
  onSave: (next: BuildSecretsState) => void;
  onClose: () => void;
}) {
  const initial = useMemo<BuildSecretsState>(
    () => saved,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot on mount
    [],
  );
  const [draft, setDraft] = useState<BuildSecretsState>(initial);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const dirtyKeys = useMemo(() => {
    const next = new Set<string>();
    for (const row of draft.rows) {
      if ((draft.values[row.key] ?? "") !== (initial.values[row.key] ?? "")) {
        next.add(row.key);
      }
    }
    return next;
  }, [draft, initial]);

  const dirty =
    dirtyKeys.size > 0 ||
    draft.rows.length !== initial.rows.length ||
    draft.rows.some((r, i) => initial.rows[i]?.uid !== r.uid);

  const handleSave = useCallback(async () => {
    setError(null);
    setSaveState("saving");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const nextValues: Record<string, string> = {};
      for (const row of draft.rows) {
        const v = draft.values[row.key];
        if (v && v.trim() !== "") nextValues[row.key] = v;
      }
      setSaveState("saved");
      toast.success("Build secrets updated");
      onSave({ rows: draft.rows, values: nextValues });
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

  const handleAdd = useCallback(() => {
    setAddError(null);
    const key = newKey.trim().toUpperCase();
    if (!key) {
      setAddError("Key is required.");
      return;
    }
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
      setAddError("Use uppercase letters, digits, and underscores only.");
      return;
    }
    if (draft.rows.some((row) => row.key === key)) {
      setAddError(`${key} already exists.`);
      return;
    }
    const uid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `secret-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setDraft((prev) => ({
      rows: [...prev.rows, { uid, key }],
      values: newValue !== "" ? { ...prev.values, [key]: newValue } : prev.values,
    }));
    setNewKey("");
    setNewValue("");
  }, [newKey, newValue, draft.rows]);

  const handleRemove = useCallback((uid: string, key: string) => {
    setDraft((prev) => {
      const nextValues = { ...prev.values };
      delete nextValues[key];
      return {
        rows: prev.rows.filter((r) => r.uid !== uid),
        values: nextValues,
      };
    });
  }, []);

  return (
    <>
      <DrawerHeader>
        <div className="flex min-w-0 flex-col gap-1">
          <DrawerTitle>Build Secrets</DrawerTitle>
          <DrawerDescription>
            Mounted as Docker BuildKit secrets. Values are never written to
            image layers.
          </DrawerDescription>
        </div>
        <DrawerCloseButton onClick={requestClose} />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-4">
        {draft.rows.length > 0 && (
          <div className="flex flex-col gap-1">
            {draft.rows.map((row) => {
              const spec: EnvVarSpec = { key: row.key, required: false };
              return (
                <div
                  key={row.uid}
                  id={`build-secret-${row.key}`}
                  className="flex items-start gap-1"
                >
                  <div className="flex-1 min-w-0">
                    <ConfigureVarRow
                      spec={spec}
                      value={draft.values[row.key] ?? ""}
                      saved={(initial.values[row.key] ?? "") !== ""}
                      dirty={dirtyKeys.has(row.key)}
                      onChange={(next) =>
                        setDraft((prev) => ({
                          ...prev,
                          values: { ...prev.values, [row.key]: next },
                        }))
                      }
                      inputRef={() => {}}
                    />
                  </div>
                  <IconButton
                    type="button"
                    variant="ghost"
                    aria-label={`Remove ${row.key}`}
                    onClick={() => handleRemove(row.uid, row.key)}
                    className="mt-2"
                  >
                    <X />
                  </IconButton>
                </div>
              );
            })}
          </div>
        )}

        <div
          data-add-build-secret-form
          className="flex flex-col gap-1.5 rounded-md border border-dashed border-border bg-muted/30 p-2.5"
        >
          <div className="text-label font-medium text-muted-foreground">
            Add new build secret
          </div>
          <div className="flex items-start gap-1.5">
            <Input
              value={newKey}
              onChange={(event) => {
                setNewKey(event.target.value);
                if (addError) setAddError(null);
              }}
              placeholder="SECRET_KEY"
              aria-label="New build secret key"
              aria-invalid={addError ? true : undefined}
              autoComplete="off"
              spellCheck={false}
              className={cn("font-mono flex-1 min-w-0")}
            />
            <Input
              value={newValue}
              onChange={(event) => setNewValue(event.target.value)}
              type="password"
              placeholder="value"
              aria-label="New build secret value"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 min-w-0"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAdd}
              disabled={newKey.trim() === ""}
            >
              <Plus aria-hidden="true" className="size-3.5" />
              Add
            </Button>
          </div>
          {addError && <p className="text-state-errored">{addError}</p>}
        </div>

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
              Your changes to build secrets haven&apos;t been saved.
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
