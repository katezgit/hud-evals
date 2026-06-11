"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  DrawerBody,
  DrawerCloseButton,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { startScenarioRun } from "@/lib/mock/start-scenario-run";
import type { Environment, Scenario } from "../_data/types";
import { InputsForm } from "./scenario-inputs-form";
import {
  validate,
  type FieldErrors,
  type FieldValues,
} from "./run-scenario-utils";

export interface RunScenarioPaneProps {
  scenario: Scenario;
  env: Environment;
  values: FieldValues;
  errors: FieldErrors;
  /** null in single-step mode (no wizard-collected vars). */
  varEdits: Record<string, string> | null;
  /** Screen-reader-only step caption ("Step 2 of 2") — null in single-step mode. */
  stepCaption: string | null;
  onValuesChange: (
    next: FieldValues | ((prev: FieldValues) => FieldValues),
  ) => void;
  onErrorsChange: (next: FieldErrors) => void;
  onClose: () => void;
  leftButton: React.ReactNode;
}

const MODEL_OPTIONS = [
  { value: "claude-opus-4-5", label: "Claude Opus 4.5" },
  { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
  { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
  { value: "gpt-5", label: "GPT-5" },
  { value: "gpt-5-mini", label: "GPT-5 mini" },
] as const;

const DEFAULT_MODEL = "claude-opus-4-5";

export function RunScenarioPane({
  scenario,
  env,
  values,
  errors,
  varEdits,
  stepCaption,
  onValuesChange,
  onErrorsChange,
  onClose,
  leftButton,
}: RunScenarioPaneProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState<string>(DEFAULT_MODEL);

  const handleRun = useCallback(async () => {
    if (submitting) return;
    const validation = validate(scenario.schema, values);
    if (validation.firstError) {
      onErrorsChange(validation.errors);
      return;
    }
    onErrorsChange({});
    setSubmitting(true);
    try {
      const { jobId } = await startScenarioRun({
        envId: env.id,
        scenarioId: scenario.id,
        inputs: values,
        // Mock side-channel for wizard-collected vars. A real backend would
        // forward as per-run env overrides.
        ...(varEdits ? { envVarOverrides: varEdits } : {}),
      });
      toast.success("Scenario started");
      router.push(`/jobs/${jobId}`);
      onClose();
    } catch (err) {
      setSubmitting(false);
      toast.error(
        err instanceof Error ? err.message : "Failed to start scenario",
      );
    }
  }, [
    submitting,
    scenario.schema,
    scenario.id,
    values,
    varEdits,
    env.id,
    router,
    onClose,
    onErrorsChange,
  ]);

  return (
    <>
      <DrawerHeader>
        <div className="flex min-w-0 flex-col gap-1">
          <DrawerTitle className="truncate font-mono">
            Run {scenario.name}
            {stepCaption && <span className="sr-only"> — {stepCaption}</span>}
          </DrawerTitle>
          <DrawerDescription>{scenario.description}</DrawerDescription>
        </div>
        <DrawerCloseButton />
      </DrawerHeader>

      <DrawerBody>
        <InputsForm
          schema={scenario.schema}
          values={values}
          errors={errors}
          onChange={(key, value) =>
            onValuesChange((prev) => ({ ...prev, [key]: value }))
          }
        />
        <div className="flex flex-col gap-1.5 pt-4">
          <Label htmlFor="run-scenario-model">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="run-scenario-model" aria-label="Model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DrawerBody>

      <DrawerFooter>
        {leftButton}
        <Button
          type="button"
          variant="primary"
          onClick={handleRun}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting && (
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          )}
          <span aria-live="polite">
            {submitting ? "Starting…" : "Run Evaluation"}
          </span>
          {!submitting && <ArrowRightIcon aria-hidden="true" />}
        </Button>
      </DrawerFooter>
    </>
  );
}
