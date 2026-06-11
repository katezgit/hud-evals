import { Braces, ClipboardList, Wrench } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";

/**
 * Three-segment density signal in the card footer: scenarios · tools · env vars.
 * Zero values render muted to visually demote them while keeping the count
 * legible — per wireframe §4.4 (zero is information, not absence).
 */
export function TriMetricStrip({
  scenarios,
  tools,
  envVars,
}: {
  scenarios: number;
  tools: number;
  envVars: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-meta text-meta-foreground">
      <Segment
        icon={<ClipboardList aria-hidden="true" className="size-3.5" />}
        count={scenarios}
        label="scenarios"
      />
      <Segment
        icon={<Wrench aria-hidden="true" className="size-3.5" />}
        count={tools}
        label="tools"
      />
      <Segment
        icon={<Braces aria-hidden="true" className="size-3.5" />}
        count={envVars}
        label="env vars"
      />
    </div>
  );
}

function Segment({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
}) {
  const isZero = count === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 tabular-nums",
        isZero && "opacity-mid",
      )}
    >
      {icon}
      <span>{count}</span>
      <span>{label}</span>
    </span>
  );
}
