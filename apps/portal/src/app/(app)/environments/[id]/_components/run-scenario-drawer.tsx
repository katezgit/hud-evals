"use client";

import { useMemo, useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Drawer, DrawerContent } from "@repo/ui/components/drawer";
import type { Environment, EnvVarSpec, Scenario } from "../_data/types";
import ConfigureStep from "./configure-step";
import { useEnvVarsStore } from "./env-vars-store";
import { RunScenarioPane } from "./run-scenario-pane";
import {
  computeMissingRequired,
  seedValues,
  seedVarEdits,
  type FieldErrors,
  type FieldValues,
} from "./run-scenario-utils";

/**
 * Two flows decided once at drawer-open:
 *
 *  - Wizard (required vars missing): Step 1 "Configure environment" collects
 *    the missing *required* vars into drawer-local state; Optional and Secret
 *    vars are out of scope (configured in the Settings tab). Step 2 runs the
 *    scenario. Back preserves both step buffers.
 *
 *  - Single-step (no missing required vars): the scenario form renders
 *    directly with [Cancel] [Run].
 *
 * `missingRequired` is snapshotted on mount — typing into local edits must
 * not flip the wizard off mid-flow. X / ESC / outside-click discards all
 * drawer-local state.
 */
interface RunScenarioDrawerProps {
  scenario: Scenario | null;
  env: Environment;
  onClose: () => void;
}

export function RunScenarioDrawer({
  scenario,
  env,
  onClose,
}: RunScenarioDrawerProps) {
  return (
    <Drawer
      open={scenario !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      direction="right"
    >
      <DrawerContent size="lg">
        {scenario && (
          <RunScenarioBody scenario={scenario} env={env} onClose={onClose} />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function RunScenarioBody({
  scenario,
  env,
  onClose,
}: {
  scenario: Scenario;
  env: Environment;
  onClose: () => void;
}) {
  const { values: savedVarValues } = useEnvVarsStore();

  // Snapshot at open time — wizard mode persists for the drawer's lifetime.
  const missingRequiredSpecs = useMemo(
    () => computeMissingRequired(env, scenario, savedVarValues),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot on mount only
    [],
  );

  if (missingRequiredSpecs.length > 0) {
    return (
      <WizardBody
        scenario={scenario}
        env={env}
        missingRequiredSpecs={missingRequiredSpecs}
        onClose={onClose}
      />
    );
  }

  return <SingleStepBody scenario={scenario} env={env} onClose={onClose} />;
}

function WizardBody({
  scenario,
  env,
  missingRequiredSpecs,
  onClose,
}: {
  scenario: Scenario;
  env: Environment;
  missingRequiredSpecs: ReadonlyArray<EnvVarSpec>;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"configure" | "run">("configure");

  // Drawer-local edits for the missing required vars. Preserved across step
  // transitions but never persisted to the env-vars store.
  const [varEdits, setVarEdits] = useState<Record<string, string>>(() =>
    seedVarEdits(missingRequiredSpecs),
  );
  const allRequiredFilled = missingRequiredSpecs.every(
    (spec) => (varEdits[spec.key] ?? "").trim() !== "",
  );

  // Scenario inputs — preserved across step transitions too.
  const [values, setValues] = useState<FieldValues>(() =>
    seedValues(scenario.schema),
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  if (step === "configure") {
    return (
      <ConfigureStep
        scenario={scenario}
        specs={missingRequiredSpecs}
        values={varEdits}
        canContinue={allRequiredFilled}
        onChange={(key, next) =>
          setVarEdits((prev) => ({ ...prev, [key]: next }))
        }
        onCancel={onClose}
        onContinue={() => setStep("run")}
      />
    );
  }

  return (
    <RunScenarioPane
      scenario={scenario}
      env={env}
      values={values}
      errors={errors}
      varEdits={varEdits}
      stepCaption="Step 2 of 2"
      onValuesChange={setValues}
      onErrorsChange={setErrors}
      onClose={onClose}
      leftButton={
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep("configure")}
          className="mr-auto"
        >
          <ArrowLeftIcon aria-hidden="true" />
          Back
        </Button>
      }
    />
  );
}

function SingleStepBody({
  scenario,
  env,
  onClose,
}: {
  scenario: Scenario;
  env: Environment;
  onClose: () => void;
}) {
  const [values, setValues] = useState<FieldValues>(() =>
    seedValues(scenario.schema),
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  return (
    <RunScenarioPane
      scenario={scenario}
      env={env}
      values={values}
      errors={errors}
      varEdits={null}
      stepCaption={null}
      onValuesChange={setValues}
      onErrorsChange={setErrors}
      onClose={onClose}
      leftButton={
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      }
    />
  );
}
