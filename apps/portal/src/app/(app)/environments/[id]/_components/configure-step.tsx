"use client";

import { useId } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DrawerBody,
  DrawerCloseButton,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import type { EnvVarSpec, Scenario } from "../_data/types";

export interface ConfigureStepProps {
  scenario: Scenario;
  specs: ReadonlyArray<EnvVarSpec>;
  values: Record<string, string>;
  canContinue: boolean;
  onChange: (key: string, value: string) => void;
  onCancel: () => void;
  onContinue: () => void;
}

export default function ConfigureStep({
  scenario,
  specs,
  values,
  canContinue,
  onChange,
  onCancel,
  onContinue,
}: ConfigureStepProps) {
  const groupHeadingId = useId();
  return (
    <>
      <DrawerHeader>
        <div className="flex min-w-0 flex-col gap-1">
          <DrawerTitle className="truncate font-mono">
            Run {scenario.name}
            <span className="sr-only"> — Step 1 of 2</span>
          </DrawerTitle>
          <DrawerDescription>{scenario.description}</DrawerDescription>
        </div>
        <DrawerCloseButton />
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-subtitle font-semibold text-foreground">
            Configure environment variables
          </h3>
          <p className="text-body text-muted-foreground">
            These variables are required to run this scenario. Values provided here will be saved to this environment&apos;s <span className="font-semibold text-foreground">Settings &gt;  Environment Variables</span> for all future runs.
          </p>
        </div>
        <section
          aria-labelledby={groupHeadingId}
          className="flex flex-col gap-3"
        >
          <h3
            id={groupHeadingId}
            className="text-label font-medium text-muted-foreground"
          >
            <span aria-hidden="true" className="text-state-errored">
              *{" "}
            </span>
            Required
          </h3>
          <div className="flex flex-col gap-4">
            {specs.map((spec) => (
              <MissingVarInput
                key={spec.key}
                spec={spec}
                value={values[spec.key] ?? ""}
                onChange={(next) => onChange(spec.key, next)}
              />
            ))}
          </div>
        </section>
      </DrawerBody>

      <DrawerFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          disabled={!canContinue}
        >
          Continue
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </DrawerFooter>
    </>
  );
}

function MissingVarInput({
  spec,
  value,
  onChange,
}: {
  spec: EnvVarSpec;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId} className="font-mono text-meta">
        {spec.key}
        <span aria-hidden="true" className="ml-1 text-state-errored">
          *
        </span>
      </Label>
      <Input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Value"
        aria-required={true}
        autoComplete="off"
        spellCheck={false}
        className="font-mono"
      />
    </div>
  );
}
