import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Job",
};

interface NewJobPageProps {
  searchParams: Promise<{
    type?: string;
    taskset?: string;
    modelId?: string;
    forkFrom?: string;
  }>;
}

export default async function NewJobPage({ searchParams }: NewJobPageProps) {
  const { type, taskset, modelId, forkFrom } = await searchParams;

  return (
    <div className="flex flex-col gap-6 pt-2 pb-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-display font-semibold text-foreground">New Job</h1>
        <p className="text-body text-muted-foreground">
          Composition form not yet implemented.
        </p>
      </header>

      <section className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
        <h2 className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
          Resolved parameters
        </h2>
        <dl className="flex flex-col gap-1 text-body">
          {type && <ParamRow label="type" value={type} />}
          {taskset && <ParamRow label="taskset" value={taskset} />}
          {modelId && <ParamRow label="modelId" value={modelId} />}
          {forkFrom && <ParamRow label="forkFrom" value={forkFrom} />}
        </dl>
      </section>
    </div>
  );
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-foreground">{value}</dd>
    </div>
  );
}
