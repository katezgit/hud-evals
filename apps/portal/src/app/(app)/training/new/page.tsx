import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/empty-state";

export const metadata: Metadata = { title: "Start training" };

const DEFAULT_SUBTITLE =
  "The training launch flow isn't ready yet. Pick a trainable model from the catalog and check back soon.";

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function resolveSubtitle(params: { [key: string]: string | string[] | undefined }): string {
  const from = firstParam(params.from);
  if (from) {
    return `This will create a new model forked from \`${from}\`. Run \`hud rl run --from ${from}\` in your terminal to launch training.`;
  }
  const model = firstParam(params.model);
  if (model) {
    return `Continue training \`${model}\`. Run \`hud rl run -m ${model}\` in your terminal to launch training.`;
  }
  return DEFAULT_SUBTITLE;
}

export default async function NewTrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const subtitle = resolveSubtitle(params);

  return (
    <div className="page-shell min-h-full">
      <EmptyState
        variant="zero-state"
        icon={GraduationCap}
        title="Training UI in progress"
        subtitle={subtitle}
        cta={
          <Button asChild variant="secondary">
            <Link href="/models">Back to Models</Link>
          </Button>
        }
      />
    </div>
  );
}
