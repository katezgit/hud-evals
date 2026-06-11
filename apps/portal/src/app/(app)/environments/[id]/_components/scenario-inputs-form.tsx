"use client";

import { useId } from "react";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
import { cn } from "@repo/ui/lib/cn";
import type { ScenarioSchemaEntry } from "../_data/types";
import { coerceToString, type FieldErrors, type FieldValue, type FieldValues } from "./run-scenario-utils";

export interface InputsFormProps {
  schema: ReadonlyArray<ScenarioSchemaEntry>;
  values: FieldValues;
  errors: FieldErrors;
  onChange: (key: string, value: FieldValue) => void;
}

export function InputsForm({ schema, values, errors, onChange }: InputsFormProps) {
  if (schema.length === 0) {
    return (
      <p className="text-body text-muted-foreground">
        This scenario takes no inputs. Press <strong>Run</strong> to start.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      {schema.map((field) => (
        <SchemaField
          key={field.key}
          field={field}
          value={values[field.key]}
          error={errors[field.key]}
          onChange={onChange}
        />
      ))}
    </form>
  );
}

function SchemaField({
  field,
  value,
  error,
  onChange,
}: {
  field: ScenarioSchemaEntry;
  value: FieldValue | undefined;
  error: string | undefined;
  onChange: (key: string, value: FieldValue) => void;
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  if (field.type === "boolean") {
    const checked = typeof value === "boolean" ? value : false;
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor={inputId} className="font-mono text-meta">
            {field.label}
            {field.required && (
              <span className="ml-1 text-state-errored" aria-hidden="true">
                *
              </span>
            )}
          </Label>
          <span className="font-mono text-meta text-muted-foreground">
            {field.key}
          </span>
        </div>
        <Switch
          id={inputId}
          checked={checked}
          onCheckedChange={(next) => onChange(field.key, next)}
        />
      </div>
    );
  }

  const stringValue = coerceToString(value);
  const inputType = field.type === "integer" ? "number" : "text";

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId} className="font-mono text-meta">
        {field.label}
        {field.required && (
          <span className="ml-1 text-state-errored" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <Input
        id={inputId}
        type={inputType}
        inputMode={field.type === "integer" ? "numeric" : undefined}
        value={stringValue}
        placeholder={field.placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(field.key, event.target.value)}
        className={cn("font-mono")}
        autoComplete="off"
        spellCheck={false}
      />
      <span className="font-mono text-meta text-muted-foreground">
        {field.key}
      </span>
      {error && (
        <p id={errorId} className="text-meta text-state-errored">
          {error}
        </p>
      )}
    </div>
  );
}
