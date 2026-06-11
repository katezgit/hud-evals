"use client";

import { X } from "lucide-react";

import { IconButton } from "@repo/ui/components/icon-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { AgentSchemaField } from "@/lib/mock/agents";
import { tasksets, type Taskset } from "@/lib/mock/tasksets";
import ProviderIcon from "../../models/_components/provider-icon";
import type { inferProviderFromModel } from "./infer-provider";

import { InlineAttachRow } from "./inline-attach-row";

function formatCost(value: number): string {
  return `$${value.toFixed(2)}`;
}

const SECTION_HEADING_CLASS =
  "text-label font-medium uppercase text-muted-foreground";

// Schema field types render as title-case proper nouns (Number, String, Boolean),
// not acronyms — no `uppercase` and no paired `tracking-wide` letter-spacing.
const SCHEMA_TYPE_CHIP_CLASS =
  "inline-flex shrink-0 items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-meta text-muted-foreground";

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function PurposeSection({
  scenarioId,
  description,
}: {
  scenarioId: string;
  description?: string;
}) {
  const headingId = `purpose-${scenarioId}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col">
      <h3 id={headingId} className={SECTION_HEADING_CLASS}>
        Purpose
      </h3>
      <div className="mt-3 rounded-md border border-border bg-panel px-3 py-2">
        <span className="block truncate font-mono text-body text-foreground">
          {scenarioId}
        </span>
      </div>
      {description ? (
        <p className="mt-2 text-body text-muted-foreground">{description}</p>
      ) : null}
    </section>
  );
}

export function OutputSchemaSection({
  agentId,
  fields,
}: {
  agentId: string;
  fields: ReadonlyArray<AgentSchemaField>;
}) {
  const headingId = `schema-${agentId}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col">
      <h3 id={headingId} className={SECTION_HEADING_CLASS}>
        Output
      </h3>
      <ul
        tabIndex={-1}
        className="mt-3 flex max-h-[38vh] min-h-[18vh] flex-col gap-2 overflow-y-auto"
      >
        {fields.map((field) => (
          <li key={field.name}>
            <SchemaFieldRow field={field} />
          </li>
        ))}
      </ul>
    </section>
  );
}

interface TasksetsSectionProps {
  agentId: string;
  committedRows: ReadonlyArray<string>;
  pendingAddRows: ReadonlyArray<string>;
  availableTasksets: ReadonlyArray<Taskset>;
  onSelectStage: (tasksetId: string) => void;
  onMarkRemove: (tasksetId: string) => void;
  onUndoAdd: (tasksetId: string) => void;
}

export function TasksetsSection({
  agentId,
  committedRows,
  pendingAddRows,
  availableTasksets,
  onSelectStage,
  onMarkRemove,
  onUndoAdd,
}: TasksetsSectionProps) {
  const headingId = `tasksets-${agentId}`;
  const isEmpty = committedRows.length === 0 && pendingAddRows.length === 0;
  return (
    <section aria-labelledby={headingId} className="flex flex-col">
      <h3 id={headingId} className={SECTION_HEADING_CLASS}>
        Attached Tasksets
      </h3>
      <div className="mt-3">
        <InlineAttachRow
          availableTasksets={availableTasksets}
          onSelectStage={onSelectStage}
        />
      </div>
      {isEmpty ? (
        <p className="mt-3 text-label text-muted-foreground">
          Not attached to any taskset — this agent won&apos;t run.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {committedRows.map((tasksetId) => (
            <li key={tasksetId}>
              <CommittedRow
                tasksetId={tasksetId}
                onMarkRemove={() => onMarkRemove(tasksetId)}
              />
            </li>
          ))}
          {pendingAddRows.map((tasksetId) => (
            <li key={tasksetId}>
              <PendingAddRow
                tasksetId={tasksetId}
                onUndo={() => onUndoAdd(tasksetId)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface FooterMetadataProps {
  model: string;
  provider: ReturnType<typeof inferProviderFromModel>;
  costPerRun: number | null;
}

export function FooterMetadata({
  model,
  provider,
  costPerRun,
}: FooterMetadataProps) {
  return (
    <dl className="flex flex-col gap-1 text-label">
      <div className="flex items-baseline gap-2">
        <dt className="w-12 shrink-0 text-muted-foreground">Model</dt>
        <dd className="flex min-w-0 items-baseline gap-1.5 text-foreground">
          {/* translate-y-0.5 nudges the 16px provider glyph down so its
              optical center sits on the text baseline of the model string. */}
          <ProviderIcon
            provider={provider}
            className="translate-y-0.5 self-baseline"
          />
          <span className="truncate">{model}</span>
        </dd>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="w-12 shrink-0 text-muted-foreground">Cost</dt>
        <dd className="flex items-baseline gap-1 text-foreground">
          <CostValue costPerRun={costPerRun} />
        </dd>
      </div>
    </dl>
  );
}

function CostValue({ costPerRun }: { costPerRun: number | null }) {
  if (costPerRun == null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="cursor-default font-mono text-muted-foreground"
            aria-label="Estimate unavailable for this model."
          >
            —
          </span>
        </TooltipTrigger>
        <TooltipContent>Estimate unavailable for this model.</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-muted-foreground">~</span>
      <span className="font-mono text-foreground">{formatCost(costPerRun)}</span>
      <span className="text-muted-foreground">per run</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default text-muted-foreground underline decoration-dotted decoration-1 underline-offset-2">
            (estimated)
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Per-run cost depends on agent verbosity and trace length. Actual cost
          may vary ±30%.
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

function SchemaFieldRow({ field }: { field: AgentSchemaField }) {
  return (
    <div className="rounded-md border border-border bg-panel px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 truncate font-mono text-body font-medium text-foreground">
          {field.name}
        </span>
        <span className={SCHEMA_TYPE_CHIP_CLASS}>{titleCase(field.type)}</span>
      </div>
      <p className="mt-1 text-label text-muted-foreground">
        {field.description}
      </p>
    </div>
  );
}

function tasksetName(id: string): string {
  return tasksets.find((t) => t.id === id)?.name ?? id;
}

function tasksetMeta(id: string): string | null {
  const t = tasksets.find((x) => x.id === id);
  if (!t) return null;
  const taskWord = t.taskCount === 1 ? "task" : "tasks";
  return `${t.taskCount} ${taskWord}`;
}

function CommittedRow({
  tasksetId,
  onMarkRemove,
}: {
  tasksetId: string;
  onMarkRemove: () => void;
}) {
  const name = tasksetName(tasksetId);
  const meta = tasksetMeta(tasksetId);
  return (
    <div className="group flex items-start justify-between gap-2 rounded-md border border-border bg-panel px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-label font-medium text-foreground">{name}</div>
        {meta ? (
          <div className="truncate text-meta text-muted-foreground">{meta}</div>
        ) : null}
      </div>
      <IconButton
        variant="ghost"
        size="xs"
        aria-label={`Mark for removal: ${name}`}
        onClick={onMarkRemove}
        className="text-meta-foreground group-hover:text-foreground focus-visible:text-foreground"
      >
        <X aria-hidden="true" />
      </IconButton>
    </div>
  );
}

function PendingAddRow({
  tasksetId,
  onUndo,
}: {
  tasksetId: string;
  onUndo: () => void;
}) {
  const name = tasksetName(tasksetId);
  const meta = tasksetMeta(tasksetId);
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-border border-l-2 border-l-primary bg-primary-glow px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-label font-medium text-foreground">{name}</div>
        {meta ? (
          <div className="truncate text-meta text-muted-foreground">{meta}</div>
        ) : null}
      </div>
      <IconButton
        variant="ghost"
        size="xs"
        aria-label={`Remove pending attachment: ${name}`}
        onClick={onUndo}
      >
        <X aria-hidden="true" />
      </IconButton>
    </div>
  );
}
