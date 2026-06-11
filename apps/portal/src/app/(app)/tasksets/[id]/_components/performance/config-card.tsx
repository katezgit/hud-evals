"use client";

import { useId } from "react";
import { X } from "lucide-react";
import { Checkbox } from "@repo/ui/components/checkbox";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/cn";
import type { PerformanceConfig } from "@/lib/mock/performance";
import { CHECKPOINT_OPTIONS } from "@/lib/mock/performance";
import ConfigColorDot from "./config-color-dot";

interface ConfigCardProps {
  config: PerformanceConfig;
  taskOptions: ReadonlyArray<{ value: string; label: string }>;
  modelOptions: ReadonlyArray<{ value: string; label: string }>;
  canDismiss: boolean;
  onChange: (next: PerformanceConfig) => void;
  onDismiss: () => void;
  disabled?: boolean;
}

export default function ConfigCard({
  config,
  taskOptions,
  modelOptions,
  canDismiss,
  onChange,
  onDismiss,
  disabled,
}: ConfigCardProps) {
  const taskId = useId();
  const modelId = useId();
  const checkpointId = useId();
  const invalidId = useId();

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ConfigColorDot id={config.id} />
          <span className="text-body font-medium text-foreground">
            {config.label}
          </span>
        </div>
        <IconButton
          variant="ghost"
          aria-label={`Remove ${config.label}`}
          onClick={onDismiss}
          disabled={!canDismiss || disabled}
          type="button"
        >
          <X aria-hidden="true" />
        </IconButton>
      </div>

      <FieldRow id={taskId} label="TASK">
        <Select
          value={config.taskFilter}
          onValueChange={(v) => onChange({ ...config, taskFilter: v })}
          disabled={disabled}
        >
          <SelectTrigger id={taskId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {taskOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow id={modelId} label="MODEL">
        <Select
          value={config.modelFilter}
          onValueChange={(v) => onChange({ ...config, modelFilter: v })}
          disabled={disabled}
        >
          <SelectTrigger id={modelId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow id={checkpointId} label="CHECKPOINT">
        <Select
          value={config.checkpointFilter}
          onValueChange={(v) => onChange({ ...config, checkpointFilter: v })}
          disabled={disabled || config.modelFilter === "all"}
        >
          <SelectTrigger id={checkpointId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHECKPOINT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <label
        htmlFor={invalidId}
        className={cn(
          "mt-1 flex cursor-pointer items-center gap-2 text-caption text-foreground",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <Checkbox
          id={invalidId}
          checked={config.includeInvalidated}
          onCheckedChange={(v) =>
            onChange({ ...config, includeInvalidated: v === true })
          }
          disabled={disabled}
          size="sm"
        />
        Include Invalidated Jobs
      </label>
    </div>
  );
}

function FieldRow({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-center gap-2">
      <label
        htmlFor={id}
        className="text-meta font-medium uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
