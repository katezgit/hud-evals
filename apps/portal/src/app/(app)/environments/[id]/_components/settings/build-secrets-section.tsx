"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckIcon, Loader2, Plus, X } from "lucide-react";
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
import { cn } from "@repo/ui/lib/cn";
import { ConfigureVarRow } from "../configure-var-row";
import type { EnvVarSpec } from "../../_data/types";

type SaveState = "idle" | "saving" | "saved" | "error";

interface SecretRow {
  uid: string;
  key: string;
}

const SEED_SECRETS: ReadonlyArray<SecretRow> = [
  { uid: "seed-npm", key: "NPM_TOKEN" },
];

const SEED_SAVED_VALUES: Record<string, string> = {
  NPM_TOKEN: "npm_••••••••••••••••",
};

export function BuildSecretsSection() {
  const [rows, setRows] = useState<ReadonlyArray<SecretRow>>(SEED_SECRETS);
  const [savedRows, setSavedRows] = useState<ReadonlyArray<SecretRow>>(SEED_SECRETS);
  const [savedValues, setSavedValues] =
    useState<Record<string, string>>(SEED_SAVED_VALUES);
  const [values, setValues] = useState<Record<string, string>>(SEED_SAVED_VALUES);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const dirtyKeys = useMemo(() => {
    const next = new Set<string>();
    for (const row of rows) {
      if ((values[row.key] ?? "") !== (savedValues[row.key] ?? "")) {
        next.add(row.key);
      }
    }
    return next;
  }, [rows, values, savedValues]);

  const dirty =
    dirtyKeys.size > 0 ||
    rows.length !== savedRows.length ||
    rows.some((r, i) => savedRows[i]?.uid !== r.uid);

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
      const nextSaved: Record<string, string> = {};
      for (const row of rows) {
        const v = values[row.key];
        if (v && v.trim() !== "") nextSaved[row.key] = v;
      }
      setSavedValues(nextSaved);
      setSavedRows(rows);
      setValues((prev) => {
        const next = { ...prev };
        for (const row of rows) {
          if (nextSaved[row.key]) next[row.key] = nextSaved[row.key] ?? "";
        }
        return next;
      });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save.");
    }
  }

  function handleCancel() {
    setRows(savedRows);
    setValues({ ...savedValues });
    setError(null);
    setSaveState("idle");
  }

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
    setRows((prev) => [...prev, { uid, key }]);
    if (newValue !== "") setValues((prev) => ({ ...prev, [key]: newValue }));
    setNewKey("");
    setNewValue("");
  }, [newKey, newValue, rows]);

  const handleRemove = useCallback((uid: string, key: string) => {
    setRows((prev) => prev.filter((r) => r.uid !== uid));
    setValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return (
    <Card
      id="build-secrets"
      aria-labelledby="build-secrets-title"
      className="scroll-mt-32"
    >
      <CardHeader>
        <CardTitle>
          <h2
            id="build-secrets-title"
            className="text-subtitle font-semibold text-foreground"
          >
            Build Secrets
          </h2>
        </CardTitle>
        <CardDescription>
          Mounted as Docker BuildKit secrets. Values are never written to image layers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            {rows.map((row) => {
              const spec: EnvVarSpec = { key: row.key, required: false };
              return (
                <div
                  key={row.uid}
                  id={`build-secret-${row.key}`}
                  className="flex items-start gap-1 scroll-mt-32"
                >
                  <div className="flex-1 min-w-0">
                    <ConfigureVarRow
                      spec={spec}
                      value={values[row.key] ?? ""}
                      saved={(savedValues[row.key] ?? "") !== ""}
                      dirty={dirtyKeys.has(row.key)}
                      onChange={(next) =>
                        setValues((prev) => ({ ...prev, [row.key]: next }))
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

          <div
            data-add-build-secret-form
            className="flex flex-col gap-1.5 rounded-md border border-dashed border-border bg-muted-surface/30 p-2.5"
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
            {addError && (
              <p className="text-label text-state-errored">{addError}</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch">
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center justify-end gap-2">
            {dirty && (
              <Button
                type="button"
                variant="secondary"
                disabled={saveState === "saving"}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
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
          </div>
          {saveState === "error" && error && (
            <p className="text-label text-state-errored text-right">{error}</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
