"use client";

import { cn } from "@repo/ui/lib/cn";
import type { Model } from "../_data/types";
import { CopyableValue, formatRelative, Row, truncateUuid } from "./section-row";

export function SystemDetailsSection({ model }: { model: Model }) {
  return (
    <section aria-labelledby="system-details-heading" className="max-w-3xl">
      <div className="rounded-surface border border-border bg-panel px-5 py-4">
        <h2
          id="system-details-heading"
          className="text-subtitle font-medium text-foreground"
        >
          System Details
        </h2>
        <dl
          className={cn(
            "mt-4 grid grid-cols-[max-content_1fr] items-center gap-x-6 gap-y-3",
          )}
        >
          <Row label="Model ID">
            <CopyableValue
              value={model.internalId}
              displayValue={truncateUuid(model.internalId)}
              mono
              ariaLabel="Copy model ID"
            />
          </Row>
          <Row label="Created">
            <span className="text-body text-foreground" title={model.createdAt}>
              {formatRelative(model.createdAt)}
            </span>
          </Row>
        </dl>
      </div>
    </section>
  );
}
