import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TrainingWizard } from "./_components/training-wizard";
import { EvalWizard } from "./_components/eval-wizard";
import { JunctionPicker } from "./_components/junction-picker";

export const metadata: Metadata = {
  title: "New Job",
};

interface NewJobPageProps {
  searchParams: Promise<{
    type?: string;
    taskset?: string;
    modelId?: string;
  }>;
}

export default async function NewJobPage({ searchParams }: NewJobPageProps) {
  const { type, taskset, modelId } = await searchParams;

  // Page wrapper claims main's full content-box height so the wizard owns its
  // own vertical layout (header → scrollable body → footer). Without h-full
  // the wizard body grows past main's content edge into main's pb-{16,24}
  // padding band; the sticky-bottom footer then pins above that band, letting
  // content visually scroll BELOW the footer line. Owning height collapses
  // scroll into the wizard body and lets the footer sit naturally at its
  // bottom edge.
  return (
    <div className="flex h-full flex-col">
      {renderJobBody({ type, taskset, modelId })}
    </div>
  );
}

function renderJobBody({
  type,
  taskset,
  modelId,
}: {
  type: string | undefined;
  taskset: string | undefined;
  modelId: string | undefined;
}) {
  if (type === "eval") {
    return <EvalWizard prefilledTasksetId={taskset ?? null} />;
  }
  if (type === "training") {
    return (
      <TrainingWizard
        prefilledModelId={modelId ?? null}
        prefilledTasksetId={taskset ?? null}
      />
    );
  }
  return <JunctionLayout invalidType={type} />;
}

function JunctionLayout({ invalidType }: { invalidType?: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 bg-background pt-6">
        <div className="page-shell block py-0">
          <header className="flex flex-col gap-3 pt-2 pb-6">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-label tracking-normal normal-case text-muted-foreground"
            >
              <Link
                href="/jobs"
                className="rounded-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Jobs
              </Link>
              <ChevronRight
                aria-hidden="true"
                className="size-3 text-meta-foreground"
              />
              <span aria-current="page" className="truncate text-foreground">
                New job
              </span>
            </nav>
            <div className="flex flex-col gap-1">
              <h1 className="text-display font-semibold text-foreground">
                New Job
              </h1>
              <p className="text-body text-muted-foreground">
                Pick a job type to get started.
              </p>
            </div>
          </header>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="page-shell block py-0 pt-8 pb-8">
          <div className="mx-auto w-full max-w-[1100px]">
            <JunctionPicker invalidType={invalidType} />
          </div>
        </div>
      </div>
    </div>
  );
}
