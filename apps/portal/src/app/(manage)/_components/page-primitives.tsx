import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/cn";
import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  /** Optional right-aligned slot rendered next to the panel title. */
  action?: ReactNode;
}

/**
 * Settings panel — wraps content in a `Card` with a structural title row.
 * Title is optional so panels can omit headers when the page already has one.
 */
export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <Card className={cn("mb-4 px-6 py-6", className)}>
      {title || action ? (
        <div className="mb-6 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="text-subtitle font-semibold text-foreground">{title}</h2>
          ) : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </Card>
  );
}

interface FieldRowProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3;
}

const FIELD_ROW_GRID: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

export function FieldRow({ children, className, cols = 2 }: FieldRowProps) {
  return (
    <div className={cn("grid gap-4", FIELD_ROW_GRID[cols], className)}>{children}</div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}

export function Field({ label, children, hint, error }: FieldProps) {
  const footer = renderFieldFooter({ error, hint });
  return (
    <label className="flex flex-col gap-1.5 text-label">
      <span className="text-muted-foreground">{label}</span>
      {children}
      {footer}
    </label>
  );
}

function renderFieldFooter({ error, hint }: { error?: string; hint?: string }) {
  if (error) {
    return (
      <span role="alert" className="text-caption font-medium text-state-errored-text">
        {error}
      </span>
    );
  }
  if (hint) {
    return <span className="text-caption text-meta-foreground">{hint}</span>;
  }
  return null;
}
