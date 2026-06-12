"use client";

import {
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
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
import { FormField } from "@repo/ui/components/form-field";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/cn";
import { ConfigureVarRow } from "../configure-var-row";
import type { EnvVarSpec } from "../../_data/types";

type SaveState = "idle" | "saving" | "saved" | "error";

interface SecretRow {
  uid: string;
  key: string;
}

interface SecretsState {
  rows: ReadonlyArray<SecretRow>;
  values: Record<string, string>;
}

interface BuildConfigState {
  args: string;
  secrets: SecretsState;
}

const INITIAL_ARGS = "NODE_VERSION=20\n";

const SEED_SECRET_ROWS: ReadonlyArray<SecretRow> = [
  { uid: "seed-npm", key: "NPM_TOKEN" },
];

const SEED_SECRET_VALUES: Record<string, string> = {
  NPM_TOKEN: "npm_••••••••••••••••",
};

const INITIAL_STATE: BuildConfigState = {
  args: INITIAL_ARGS,
  secrets: { rows: SEED_SECRET_ROWS, values: SEED_SECRET_VALUES },
};

function countArgs(value: string): number {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#")).length;
}

function formatSummary(argCount: number, secretCount: number): string {
  if (argCount === 0 && secretCount === 0) return "Empty";
  const parts: string[] = [];
  if (argCount > 0) {
    parts.push(`${argCount} ${argCount === 1 ? "arg" : "args"}`);
  }
  if (secretCount > 0) {
    parts.push(`${secretCount} ${secretCount === 1 ? "secret" : "secrets"}`);
  }
  return parts.join(" · ");
}

export function BuildConfigurationSection() {
  const [saved, setSaved] = useState<BuildConfigState>(INITIAL_STATE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const argCount = countArgs(saved.args);
  const secretCount = saved.secrets.rows.length;
  const summary = formatSummary(argCount, secretCount);

  return (
    <>
      <Card
        id="build-configuration"
        aria-labelledby="build-configuration-title"
        className={cn(
          "scroll-mt-32 transition-colors duration-fast ease-out-standard",
          drawerOpen && "border-primary bg-primary-glow",
        )}
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
                id="build-configuration-title"
                className="text-subtitle font-semibold text-foreground"
              >
                Build Configuration
              </h2>
              <p className="text-muted-foreground">{summary}</p>
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
            <BuildConfigurationDrawer
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

function BuildConfigurationDrawer({
  saved,
  onSave,
  onClose,
}: {
  saved: BuildConfigState;
  onSave: (next: BuildConfigState) => void;
  onClose: () => void;
}) {
  const initial = useMemo<BuildConfigState>(
    () => saved,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot on mount
    [],
  );
  const [draft, setDraft] = useState<BuildConfigState>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const argsId = useId();

  const dirtySecretKeys = useMemo(() => {
    const next = new Set<string>();
    for (const row of draft.secrets.rows) {
      const draftVal = draft.secrets.values[row.key] ?? "";
      const initialVal = initial.secrets.values[row.key] ?? "";
      if (draftVal !== initialVal) next.add(row.key);
    }
    return next;
  }, [draft, initial]);

  const secretsChanged =
    dirtySecretKeys.size > 0 ||
    draft.secrets.rows.length !== initial.secrets.rows.length ||
    draft.secrets.rows.some((r, i) => initial.secrets.rows[i]?.uid !== r.uid);

  const dirty = draft.args !== initial.args || secretsChanged;

  const handleSave = useCallback(async () => {
    setError(null);
    setSaveState("saving");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const nextSecretValues: Record<string, string> = {};
      for (const row of draft.secrets.rows) {
        const v = draft.secrets.values[row.key];
        if (v && v.trim() !== "") nextSecretValues[row.key] = v;
      }
      setSaveState("saved");
      toast.success("Build configuration updated");
      onSave({
        args: draft.args,
        secrets: { rows: draft.secrets.rows, values: nextSecretValues },
      });
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
          <DrawerTitle>Build Configuration</DrawerTitle>
          <DrawerDescription>
            Inputs to{" "}
            <code className="font-mono text-label rounded bg-muted px-1 py-0.5 text-foreground">
              docker build
            </code>{" "}
            — build-time arguments and BuildKit-mounted secrets.
          </DrawerDescription>
        </div>
        <DrawerCloseButton onClick={requestClose} />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-6">
        <BuildArgsSubsection
          textareaId={argsId}
          value={draft.args}
          onChange={(next) =>
            setDraft((prev) => ({ ...prev, args: next }))
          }
        />

        <hr className="border-border" />

        <BuildSecretsSubsection
          rows={draft.secrets.rows}
          values={draft.secrets.values}
          initialValues={initial.secrets.values}
          dirtyKeys={dirtySecretKeys}
          onSetValue={(key, next) =>
            setDraft((prev) => ({
              ...prev,
              secrets: {
                ...prev.secrets,
                values: { ...prev.secrets.values, [key]: next },
              },
            }))
          }
          onAdd={(row, value) =>
            setDraft((prev) => ({
              ...prev,
              secrets: {
                rows: [...prev.secrets.rows, row],
                values:
                  value !== ""
                    ? { ...prev.secrets.values, [row.key]: value }
                    : prev.secrets.values,
              },
            }))
          }
          onRemove={(uid, key) =>
            setDraft((prev) => {
              const nextValues = { ...prev.secrets.values };
              delete nextValues[key];
              return {
                ...prev,
                secrets: {
                  rows: prev.secrets.rows.filter((r) => r.uid !== uid),
                  values: nextValues,
                },
              };
            })
          }
        />

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
              Your changes to build configuration haven&apos;t been saved.
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

function BuildArgsSubsection({
  textareaId,
  value,
  onChange,
}: {
  textareaId: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <section
      aria-labelledby={`${textareaId}-heading`}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h3
          id={`${textareaId}-heading`}
          className="font-semibold text-foreground"
        >
          Build Arguments
        </h3>
        <p className="text-muted-foreground">
          Build-time ARGs passed to the Dockerfile. Not available at runtime.
          Set via{" "}
          <code className="font-mono text-label rounded bg-muted px-1 py-0.5 text-foreground">
            hud deploy --build-arg
          </code>
          .
        </p>
      </div>

      <FormField
        id={textareaId}
        label="KEY=value, one per line"
        helper="Blank lines and lines starting with # are ignored."
      >
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={6}
          spellCheck={false}
          className="font-mono"
          placeholder={"NODE_VERSION=20\nPNPM_VERSION=10"}
          aria-label="Build arguments"
        />
      </FormField>
    </section>
  );
}

function BuildSecretsSubsection({
  rows,
  values,
  initialValues,
  dirtyKeys,
  onSetValue,
  onAdd,
  onRemove,
}: {
  rows: ReadonlyArray<SecretRow>;
  values: Record<string, string>;
  initialValues: Record<string, string>;
  dirtyKeys: ReadonlySet<string>;
  onSetValue: (key: string, next: string) => void;
  onAdd: (row: SecretRow, value: string) => void;
  onRemove: (uid: string, key: string) => void;
}) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const headingId = useId();

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
    if (rows.some((row) => row.key === key)) {
      setAddError(`${key} already exists.`);
      return;
    }
    const uid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `secret-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    onAdd({ uid, key }, newValue);
    setNewKey("");
    setNewValue("");
  }, [newKey, newValue, rows, onAdd]);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3
          id={headingId}
          className="font-semibold text-foreground"
        >
          Build Secrets
        </h3>
        <p className="text-muted-foreground">
          Mounted as Docker BuildKit secrets. Values are never written to image
          layers.
        </p>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-col gap-1">
          {rows.map((row) => {
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
                    value={values[row.key] ?? ""}
                    saved={(initialValues[row.key] ?? "") !== ""}
                    dirty={dirtyKeys.has(row.key)}
                    onChange={(next) => onSetValue(row.key, next)}
                    inputRef={() => {}}
                  />
                </div>
                <IconButton
                  type="button"
                  variant="ghost"
                  aria-label={`Remove ${row.key}`}
                  onClick={() => onRemove(row.uid, row.key)}
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
        className="flex flex-col gap-1.5 rounded-md border border-dashed border-border p-2.5"
      >
        <div className="font-medium text-foreground">
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
    </section>
  );
}
