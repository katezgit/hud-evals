"use client";

import Link from "next/link";
import { cn } from "@repo/ui/lib/cn";
import type { Model } from "../_data/types";
import { CopyableValue, Row } from "./section-row";

export function UsageSection({ model }: { model: Model }) {
  return (
    <section aria-labelledby="usage-heading" className="max-w-3xl">
      <div className="rounded-surface border border-border bg-panel px-5 py-4">
        <h2
          id="usage-heading"
          className="text-subtitle font-medium text-foreground"
        >
          Usage
        </h2>
        <dl
          className={cn(
            "mt-4 grid grid-cols-[max-content_1fr] items-center gap-x-6 gap-y-3",
          )}
        >
          <Row label="API Name">
            <CopyableValue value={model.apiName} mono ariaLabel="Copy API name" />
          </Row>
          <Row label="Provider">
            <span className="text-body text-foreground">{model.provider}</span>
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
          <Row label="Trainable">
            <span className="text-body text-foreground">
              {model.trainable ? "Yes" : "No"}
            </span>
          </Row>
          {model.activeCheckpointId !== null && (
            <Row label="Active checkpoint">
              <CopyableValue
                value={model.activeCheckpointId}
                mono
                ariaLabel="Copy active checkpoint ID"
              />
              {model.activeCheckpointStep !== null && (
                <span className="text-meta-foreground">
                  · step {model.activeCheckpointStep}
                </span>
              )}
            </Row>
          )}
          {model.forkedFrom !== null && (
            <Row label="Forked from">
              <Link
                href={`/models/${model.forkedFrom.modelId}`}
                className={cn(
                  "rounded-sm",
                  "font-mono text-foreground underline-offset-4",
                  "hover:text-foreground hover:underline",
                )}
              >
                {model.forkedFrom.apiName}
              </Link>
            </Row>
          )}
        </dl>
      </div>
    </section>
  );
}
