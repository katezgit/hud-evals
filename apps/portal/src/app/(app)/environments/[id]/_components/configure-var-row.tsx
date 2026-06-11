"use client";

import { useState } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/cn";
import type { EnvVarSpec } from "../_data/types";

export interface ConfigureVarRowProps {
  spec: EnvVarSpec;
  value: string;
  saved: boolean;
  dirty: boolean;
  onChange: (value: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
}

export function ConfigureVarRow({
  spec,
  value,
  saved,
  dirty,
  onChange,
  inputRef,
}: ConfigureVarRowProps) {
  const [revealed, setRevealed] = useState(false);
  const showCheck = saved && !dirty;
  const requiredMissing = spec.required && value.trim() === "";

  return (
    <div
      id={`configure-var-row-${spec.key}`}
      data-env-var-key={spec.key}
      className={cn(
        "flex flex-col gap-1.5 rounded-md p-2 -mx-2 transition-colors",
        "data-[pulse=true]:bg-state-warning-subtle",
      )}
    >
      <label
        htmlFor={`configure-var-input-${spec.key}`}
        className="flex items-center gap-1 font-mono text-meta text-foreground"
      >
        <span>{spec.key}</span>
        {requiredMissing && (
          <span aria-hidden="true" className="text-state-warning">
            *
          </span>
        )}
      </label>

      <div className="flex items-center gap-1.5">
        <Input
          id={`configure-var-input-${spec.key}`}
          ref={inputRef}
          type={revealed && value !== "" ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={spec.required ? "Value" : "Optional"}
          size="sm"
          aria-label={spec.key}
          aria-required={spec.required}
          autoComplete="off"
          spellCheck={false}
          className="font-mono flex-1 min-w-0"
        />

        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          aria-label={
            value === ""
              ? `${spec.key} has no value to reveal`
              : revealed
                ? `Hide ${spec.key}`
                : `Reveal ${spec.key}`
          }
          disabled={value === ""}
          onClick={() => setRevealed((prev) => !prev)}
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </IconButton>

        <span
          aria-hidden={!showCheck}
          className={cn(
            "flex size-4 items-center justify-center text-state-scored transition-opacity",
            showCheck ? "opacity-100" : "opacity-0",
          )}
          title={showCheck ? "Saved" : undefined}
        >
          <CheckIcon className="size-3.5" />
        </span>
      </div>
    </div>
  );
}
