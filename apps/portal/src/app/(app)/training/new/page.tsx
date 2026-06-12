import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/empty-state";

export const metadata: Metadata = { title: "Start training" };

export default function NewTrainingPage() {
  return (
    <div className="page-shell min-h-full">
      <EmptyState
        variant="zero-state"
        icon={GraduationCap}
        title="Training UI in progress"
        subtitle="The training launch flow isn't ready yet. Pick a trainable model from the catalog and check back soon."
        cta={
          <Button asChild variant="secondary">
            <Link href="/models">Back to Models</Link>
          </Button>
        }
      />
    </div>
  );
}
