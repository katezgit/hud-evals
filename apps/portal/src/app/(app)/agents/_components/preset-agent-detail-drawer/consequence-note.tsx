"use client";

import { ArrowUpRight } from "lucide-react";

function formatCost(value: number): string {
  return `$${value.toFixed(2)}`;
}

interface ConsequenceNoteProps {
  pendingAddCount: number;
  pendingRemoveCount: number;
  costPerRun: number | null;
}

export function ConsequenceNote({
  pendingAddCount,
  pendingRemoveCount,
  costPerRun,
}: ConsequenceNoteProps) {
  // role=status + aria-live=polite so screen readers announce pending-change
  // copy when adds/removes update. The wrapper element renders even when the
  // visible message is absent — keeps the live region attached across renders.
  return (
    <div role="status" aria-live="polite" className="min-w-0">
      <Message
        pendingAddCount={pendingAddCount}
        pendingRemoveCount={pendingRemoveCount}
        costPerRun={costPerRun}
      />
    </div>
  );
}

function Message({
  pendingAddCount,
  pendingRemoveCount,
  costPerRun,
}: ConsequenceNoteProps) {
  if (pendingAddCount === 0 && pendingRemoveCount === 0) return null;

  let body: string;
  if (pendingAddCount > 0 && pendingRemoveCount > 0) {
    const costSuffix =
      costPerRun != null
        ? ` — cost (~${formatCost(costPerRun)} / run) applies to each active attachment.`
        : ".";
    body = `Adding ${pendingAddCount}, detaching ${pendingRemoveCount} tasksets${costSuffix}`;
  } else if (pendingAddCount > 0) {
    const tasksetWord = pendingAddCount === 1 ? "taskset" : "tasksets";
    const costSuffix =
      costPerRun != null
        ? ` (~${formatCost(costPerRun)} / run when active)`
        : "";
    body = `Adding ${pendingAddCount} ${tasksetWord} — this agent will run on each${costSuffix}.`;
  } else {
    const tasksetWord = pendingRemoveCount === 1 ? "taskset" : "tasksets";
    body = `Detaching ${pendingRemoveCount} ${tasksetWord} — no further runs there.`;
  }

  return (
    <div className="flex items-start gap-1.5 text-label text-muted-foreground">
      <ArrowUpRight aria-hidden="true" className="mt-0.5 size-3" />
      <span>{body}</span>
    </div>
  );
}
