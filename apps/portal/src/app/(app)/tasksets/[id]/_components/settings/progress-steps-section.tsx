"use client";

import { useState } from "react";
import { Lock, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";

interface ProgressStepsSectionProps {
  goldenEnabled?: boolean;
}

interface CustomStep {
  id: string;
  label: string;
}

const LOCK_TOOLTIP =
  "Required step in the Taskset progress pipeline. Cannot be disabled.";

export default function ProgressStepsSection({
  goldenEnabled: initialGolden = false,
}: ProgressStepsSectionProps) {
  const [committed, setCommitted] = useState({
    golden: initialGolden,
    custom: [] as ReadonlyArray<CustomStep>,
  });
  const [golden, setGolden] = useState<boolean>(initialGolden);
  const [customSteps, setCustomSteps] = useState<ReadonlyArray<CustomStep>>([]);
  const [inserting, setInserting] = useState(false);
  const [pending, setPending] = useState(false);

  const isDirty =
    golden !== committed.golden ||
    customSteps !== committed.custom;

  const onAddCustom = (label: string) => {
    const trimmed = label.trim();
    if (trimmed.length === 0) {
      setInserting(false);
      return;
    }
    setCustomSteps((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, label: trimmed },
    ]);
    setInserting(false);
  };

  const onRemoveCustom = (id: string) => {
    setCustomSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const onSave = async () => {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setCommitted({ golden, custom: customSteps });
    setPending(false);
    toast.success("Progress Steps updated.");
  };

  const onCancel = () => {
    setGolden(committed.golden);
    setCustomSteps(committed.custom);
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-body font-semibold text-foreground">
        Progress Steps
      </h3>

      <ol className="flex flex-col rounded-md border border-border bg-card">
        <GoldenSequenceRow
          checked={golden}
          onChange={setGolden}
          disabled={pending}
        />
        <KRunsRow />
        {customSteps.map((s) => (
          <CustomStepRow
            key={s.id}
            label={s.label}
            onRemove={() => onRemoveCustom(s.id)}
            disabled={pending}
          />
        ))}
        {inserting ? (
          <InsertStepRow
            onAdd={onAddCustom}
            onCancel={() => setInserting(false)}
          />
        ) : (
          <AddStepRow
            onClick={() => setInserting(true)}
            disabled={pending}
          />
        )}
        <LockedManualRow label="Ready" />
        <LockedManualRow label="Verified" isLast />
      </ol>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          aria-hidden={!isDirty}
          tabIndex={!isDirty || pending ? -1 : undefined}
          className={cn(
            (!isDirty || pending) && "pointer-events-none opacity-0",
          )}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={pending}
          onClick={onSave}
          aria-label="Save Progress Steps"
        >
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </section>
  );
}

function RowShell({
  children,
  isLast,
  className,
}: {
  children: React.ReactNode;
  isLast?: boolean;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 px-3 py-2",
        !isLast && "border-b border-border",
        className,
      )}
    >
      {children}
    </li>
  );
}

function GoldenSequenceRow({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled: boolean;
}) {
  return (
    <RowShell>
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        disabled={disabled}
        aria-label="Enable Golden sequence step"
      />
      <span className="text-body text-foreground">Golden sequence</span>
      <span className="ml-auto text-caption text-meta-foreground">auto</span>
    </RowShell>
  );
}

function KRunsRow() {
  return (
    <RowShell>
      <span
        aria-hidden="true"
        className="inline-flex size-3.5 items-center justify-center rounded-full bg-foreground/80"
      />
      <span className="text-body text-foreground">K runs</span>
      <span className="ml-auto flex items-center gap-2 text-caption text-meta-foreground">
        <span>auto</span>
        <span aria-hidden="true">·</span>
        <span>always on</span>
        <LockIndicator />
      </span>
    </RowShell>
  );
}

function LockedManualRow({
  label,
  isLast,
}: {
  label: string;
  isLast?: boolean;
}) {
  return (
    <RowShell isLast={isLast}>
      <span
        aria-hidden="true"
        className="inline-flex size-3.5 items-center justify-center rounded-full border border-foreground/60"
      />
      <span className="text-body text-foreground">{label}</span>
      <span className="ml-auto flex items-center gap-2 text-caption text-meta-foreground">
        <span>manual</span>
        <span aria-hidden="true">·</span>
        <span>always on</span>
        <LockIndicator />
      </span>
    </RowShell>
  );
}

function LockIndicator() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label="Locked — required step"
          tabIndex={0}
          className="inline-flex"
        >
          <Lock aria-hidden="true" className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{LOCK_TOOLTIP}</TooltipContent>
    </Tooltip>
  );
}

function CustomStepRow({
  label,
  onRemove,
  disabled,
}: {
  label: string;
  onRemove: () => void;
  disabled: boolean;
}) {
  return (
    <RowShell>
      <span
        aria-hidden="true"
        className="inline-flex size-3.5 items-center justify-center rounded-full border border-foreground/60"
      />
      <span className="text-body text-foreground">{label}</span>
      <span className="ml-auto flex items-center gap-2 text-caption text-meta-foreground">
        <span>custom</span>
        <IconButton
          variant="ghost"
          aria-label={`Remove step ${label}`}
          onClick={onRemove}
          disabled={disabled}
          type="button"
        >
          <X aria-hidden="true" />
        </IconButton>
      </span>
    </RowShell>
  );
}

function AddStepRow({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <RowShell>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-2 rounded-sm text-caption text-muted-foreground",
          "hover:text-foreground disabled:opacity-50 disabled:hover:text-muted-foreground",
        )}
        aria-label="Add step between Runs and Ready"
      >
        <Plus aria-hidden="true" className="size-3.5" />
        <span>Add step between Runs and Ready</span>
      </button>
    </RowShell>
  );
}

function InsertStepRow({
  onAdd,
  onCancel,
}: {
  onAdd: (label: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  return (
    <RowShell>
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Step name"
        autoFocus
        aria-label="New step name"
        className="flex-1"
      />
      <Button
        type="button"
        variant="primary"
        disabled={trimmed.length === 0}
        onClick={() => onAdd(value)}
      >
        Add
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </RowShell>
  );
}
