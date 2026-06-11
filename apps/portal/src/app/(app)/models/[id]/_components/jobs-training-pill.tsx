import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

/**
 * "N jobs training from this model" — muted outline pill with a navigation
 * action. Rendered only by the page when persona === 'rl-researcher' AND
 * activeTrainingJobsCount >= 1, so this component does no gating itself.
 *
 * Link target is a TODO anchor — `/jobs?source_model_id=<id>` is not yet
 * a confirmed route (see implementation-prompt pending confirmations).
 */
export function JobsTrainingPill({
  modelId,
  count,
}: {
  modelId: string;
  count: number;
}) {
  const label = `${count} ${count === 1 ? "job" : "jobs"} training`;
  return (
    <Link
      href={`/jobs?source_model_id=${modelId}`}
      className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-transparent px-3 text-label text-muted-foreground hover:border-foreground hover:text-foreground"
    >
      {label}
      <ArrowUpRightIcon aria-hidden="true" className="size-3.5" />
    </Link>
  );
}
