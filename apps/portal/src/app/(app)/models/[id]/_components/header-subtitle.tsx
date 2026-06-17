import Link from "next/link";
import type { Model } from "../_data/types";
import { formatRelative } from "./relative-time";

export function HeaderSubtitle({
  model,
  lastEvaluatedAt,
}: {
  model: Model;
  lastEvaluatedAt: string | null;
}) {
  const showLineage =
    model.ownerType === "user-trained" && model.forkedFrom !== null;

  if (!showLineage || model.forkedFrom === null) return null;

  return (
    <div className="page-header-meta">
      <span>
        Forked from{" "}
        <Link
          href={`/models/${model.forkedFrom.modelId}`}
          className="font-mono transition-colors hover:text-foreground"
        >
          {model.forkedFrom.apiName}
        </Link>
      </span>
      {lastEvaluatedAt !== null && (
        <>
          <span aria-hidden="true" className="text-meta-foreground">
            ·
          </span>
          <span title={lastEvaluatedAt}>
            Last evaluated {formatRelative(lastEvaluatedAt)}
          </span>
        </>
      )}
    </div>
  );
}
