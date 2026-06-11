"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckIcon, Info, Loader2, Plus, X } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { EnvVarSpec } from "../../_data/types";
import { ConfigureVarRow } from "../configure-var-row";
import { useEnvVarsStore } from "../env-vars-store";

type SaveState = "idle" | "saving" | "saved" | "error";

interface EnvVarsSectionProps {
  vars: ReadonlyArray<EnvVarSpec>;
}

interface AddedVar {
  uid: string;
  key: string;
}

export function EnvVarsSection({ vars }: EnvVarsSectionProps) {
  const store = useEnvVarsStore();
  const { values, savedKeys, dirtyKeys, setValue, resetAll, save } = store;

  const [addedVars, setAddedVars] = useState<ReadonlyArray<AddedVar>>([]);
  const [addedAtSavePoint, setAddedAtSavePoint] = useState<
    ReadonlyArray<AddedVar>
  >([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const required = useMemo(() => vars.filter((v) => v.required), [vars]);
  const optionalSeeded = useMemo(
    () => vars.filter((v) => !v.required),
    [vars],
  );
  const optionalAddedSpecs: ReadonlyArray<EnvVarSpec> = useMemo(
    () => addedVars.map((v) => ({ key: v.key, required: false })),
    [addedVars],
  );

  const dirty =
    dirtyKeys.size > 0 ||
    addedVars.length !== addedAtSavePoint.length ||
    addedVars.some(
      (a, i) => addedAtSavePoint[i]?.uid !== a.uid,
    );

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
      await save();
      setAddedAtSavePoint(addedVars);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save.");
    }
  }

  function handleCancel() {
    resetAll();
    setAddedVars(addedAtSavePoint);
    setError(null);
    setSaveState("idle");
  }

  const handleAddVar = useCallback(() => {
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
    const allKeys = new Set<string>([
      ...vars.map((v) => v.key),
      ...addedVars.map((v) => v.key),
    ]);
    if (allKeys.has(key)) {
      setAddError(`${key} already exists.`);
      return;
    }
    const uid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `var-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setAddedVars((prev) => [...prev, { uid, key }]);
    if (newValue !== "") setValue(key, newValue);
    setNewKey("");
    setNewValue("");
  }, [newKey, newValue, vars, addedVars, setValue]);

  const handleRemoveAdded = useCallback((uid: string) => {
    setAddedVars((prev) => prev.filter((v) => v.uid !== uid));
  }, []);

  const noopRef = useCallback(() => {
    /* no-op */
  }, []);

  return (
    <Card
      id="env-vars"
      aria-labelledby="env-vars-title"
      className="scroll-mt-32"
    >
      <CardHeader>
        <CardTitle>
          <h2
            id="env-vars-title"
            className="text-subtitle font-semibold text-foreground"
          >
            Environment Variables
          </h2>
        </CardTitle>
        <CardDescription>
          <span className="inline-flex items-center gap-1.5">
            Runtime variables injected into every sandbox spawned from this env.
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  aria-label="More info about environment variables"
                  className="inline-flex cursor-help"
                >
                  <Info
                    aria-hidden="true"
                    className="size-3.5 text-meta-foreground"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                Values are write-only; saved secrets render as ••••••••.
              </TooltipContent>
            </Tooltip>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {required.length > 0 && (
            <VarGroup
              label={
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden="true" className="text-state-warning">
                    *
                  </span>
                  Required
                </span>
              }
            >
              {required.map((spec) => (
                <EnvVarAnchor key={spec.key} envKey={spec.key}>
                  <ConfigureVarRow
                    spec={spec}
                    value={values[spec.key] ?? ""}
                    saved={savedKeys.has(spec.key)}
                    dirty={dirtyKeys.has(spec.key)}
                    onChange={(next) => setValue(spec.key, next)}
                    inputRef={noopRef}
                  />
                </EnvVarAnchor>
              ))}
            </VarGroup>
          )}

          {(optionalSeeded.length > 0 || optionalAddedSpecs.length > 0) && (
            <VarGroup label="Optional">
              {optionalSeeded.map((spec) => (
                <EnvVarAnchor key={spec.key} envKey={spec.key}>
                  <ConfigureVarRow
                    spec={spec}
                    value={values[spec.key] ?? ""}
                    saved={savedKeys.has(spec.key)}
                    dirty={dirtyKeys.has(spec.key)}
                    onChange={(next) => setValue(spec.key, next)}
                    inputRef={noopRef}
                  />
                </EnvVarAnchor>
              ))}
              {optionalAddedSpecs.map((spec, idx) => {
                const added = addedVars[idx];
                if (!added) return null;
                return (
                  <div key={added.uid} className="flex items-start gap-1">
                    <div className="flex-1 min-w-0">
                      <EnvVarAnchor envKey={spec.key}>
                        <ConfigureVarRow
                          spec={spec}
                          value={values[spec.key] ?? ""}
                          saved={savedKeys.has(spec.key)}
                          dirty={dirtyKeys.has(spec.key)}
                          onChange={(next) => setValue(spec.key, next)}
                          inputRef={noopRef}
                        />
                      </EnvVarAnchor>
                    </div>
                    <IconButton
                      type="button"
                      variant="ghost"
                      aria-label={`Remove ${spec.key}`}
                      onClick={() => handleRemoveAdded(added.uid)}
                      className="mt-2"
                    >
                      <X />
                    </IconButton>
                  </div>
                );
              })}
            </VarGroup>
          )}

          <AddVarForm
            newKey={newKey}
            newValue={newValue}
            error={addError}
            onKeyChange={(value) => {
              setNewKey(value);
              if (addError) setAddError(null);
            }}
            onValueChange={setNewValue}
            onAdd={handleAddVar}
          />

          <p className="text-label text-meta-foreground">
            Or set via{" "}
            <code className="font-mono text-meta rounded bg-muted px-1 py-0.5 text-foreground">
              hud deploy -e KEY=value
            </code>
          </p>
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

function EnvVarAnchor({
  envKey,
  children,
}: {
  envKey: string;
  children: ReactNode;
}) {
  return (
    <div id={`env-${envKey}`} className="scroll-mt-32">
      {children}
    </div>
  );
}

function VarGroup({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-label font-medium text-foreground">{label}</div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

interface AddVarFormProps {
  newKey: string;
  newValue: string;
  error: string | null;
  onKeyChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onAdd: () => void;
}

function AddVarForm({
  newKey,
  newValue,
  error,
  onKeyChange,
  onValueChange,
  onAdd,
}: AddVarFormProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Enter") return;
      const target = event.target as HTMLElement | null;
      if (!target?.closest?.("[data-add-env-var-form]")) return;
      event.preventDefault();
      onAdd();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onAdd]);

  return (
    <div
      data-add-env-var-form
      className="flex flex-col gap-1.5 rounded-md border border-dashed border-border bg-muted/30 p-2.5"
    >
      <div className="text-label font-medium text-muted-foreground">
        Add new variable
      </div>
      <div className="flex items-start gap-1.5">
        <Input
          ref={inputRef}
          value={newKey}
          onChange={(event) => onKeyChange(event.target.value)}
          placeholder="KEY"
          aria-label="New variable key"
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          spellCheck={false}
          className={cn("font-mono flex-1 min-w-0")}
        />
        <Input
          value={newValue}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="value"
          aria-label="New variable value"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={onAdd}
          disabled={newKey.trim() === ""}
        >
          <Plus aria-hidden="true" className="size-3.5" />
          Add
        </Button>
      </div>
      {error && (
        <p className="text-label text-state-errored">{error}</p>
      )}
    </div>
  );
}
