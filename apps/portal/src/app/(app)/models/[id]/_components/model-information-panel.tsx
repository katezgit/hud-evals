"use client";

import { CopyButton } from "@repo/ui/components/copy-button";
import { cn } from "@repo/ui/lib/cn";
import type { Model } from "../_data/types";
import { ModelStatusBadge } from "./model-status-badge";

export function ModelInformationPanel({ model }: { model: Model }) {
  return (
    <section aria-labelledby="model-information-heading" className="max-w-3xl">
      <h2
        id="model-information-heading"
        className="text-meta font-medium uppercase tracking-wide text-meta-foreground"
      >
        Details
      </h2>
      <dl
        className={cn(
          "mt-3 grid grid-cols-[max-content_1fr] items-center gap-x-6 gap-y-3",
          "rounded-surface border border-border bg-panel px-5 py-4",
        )}
      >
        <Row label="API Name">
          <CopyableValue value={model.apiName} mono ariaLabel="Copy API name" />
        </Row>
        <Row label="Model ID">
          <CopyableValue
            value={model.internalId}
            displayValue={truncateUuid(model.internalId)}
            mono
            ariaLabel="Copy model ID"
          />
        </Row>
        <Row label="Provider">
          <span className="text-body text-foreground">{model.provider}</span>
        </Row>
        <Row label="Status">
          <ModelStatusBadge status={model.status} />
        </Row>
        <Row label="Routes">
          <span className="text-body text-foreground">
            {model.routes.length === 0 ? (
              <span className="text-meta-foreground">—</span>
            ) : (
              model.routes.join(", ")
            )}
          </span>
        </Row>
        <Row label="Active checkpoint">
          {model.activeCheckpointId === null ? (
            <span aria-label="No active checkpoint" className="text-body text-meta-foreground">
              —
            </span>
          ) : (
            <CopyableValue
              value={model.activeCheckpointId}
              mono
              ariaLabel="Copy active checkpoint ID"
            />
          )}
        </Row>
        <Row label="Trainable">
          <span className="text-body text-foreground">
            {model.trainable ? "Yes" : (
              <span className="text-meta-foreground">—</span>
            )}
          </span>
        </Row>
        <Row label="Created">
          <span
            className="text-body text-foreground"
            title={model.createdAt}
          >
            {formatRelative(model.createdAt)}
          </span>
        </Row>
      </dl>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-body text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2 text-body">{children}</dd>
    </>
  );
}

function CopyableValue({
  value,
  displayValue,
  mono,
  ariaLabel,
}: {
  value: string;
  displayValue?: string;
  mono?: boolean;
  ariaLabel?: string;
}) {
  return (
    <>
      <span
        className={cn(
          "truncate text-foreground",
          mono && "font-mono tabular-nums",
        )}
        title={displayValue ? value : undefined}
      >
        {displayValue ?? value}
      </span>
      <CopyButton value={value} ariaLabel={ariaLabel} className="shrink-0" />
    </>
  );
}

// First 8 chars of a UUID are enough to disambiguate at a glance; the Copy
// button still hands out the full identifier.
function truncateUuid(value: string): string {
  return value.length <= 8 ? value : `${value.slice(0, 8)}…`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function formatRelative(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const delta = Date.now() - then;
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) {
    const m = Math.floor(delta / MINUTE);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (delta < DAY) {
    const h = Math.floor(delta / HOUR);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (delta < MONTH) {
    const d = Math.floor(delta / DAY);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }
  if (delta < YEAR) {
    const mo = Math.floor(delta / MONTH);
    return `${mo} month${mo === 1 ? "" : "s"} ago`;
  }
  const y = Math.floor(delta / YEAR);
  return `${y} year${y === 1 ? "" : "s"} ago`;
}
