"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { CodeBlock } from "@repo/ui/components/code-block";
import { cn } from "@repo/ui/lib/cn";
import { InfoIcon } from "lucide-react";

interface Step {
  index: number;
  label: string;
  description: string;
  code: string;
}

const STEPS: ReadonlyArray<Step> = [
  {
    index: 1,
    label: "Initialize",
    description:
      "Spin up a new HUD environment from a CLI preset (blank, browser, or deep-research):",
    code: `# Choose preset interactively
hud init
# Or jump straight to a preset
hud init my-deep -p deep-research`,
  },
  {
    index: 2,
    label: "Setup",
    description: "Install dependencies and wire up your HUD API key.",
    code: `uv sync
cp .env.example .env             # fill in HUD_API_KEY (injected into the deployed container for grading)
hud set HUD_API_KEY=your-key-here # CLI auth, get one at hud.ai/project/api-keys`,
  },
  {
    index: 3,
    label: "Deploy & Run",
    description: "Push the environment, sync your tasks, and run an eval:",
    code: `hud deploy .                      # deploy the environment (once)
hud sync tasks <taskset-name>     # push tasks to a taskset (fast, re-run on every task change)
hud eval <taskset-name> claude --remote --full`,
  },
];

export function CliQuickstart() {
  return (
    <section aria-labelledby="cli-heading" className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2
          id="cli-heading"
          className="text-subtitle font-semibold text-foreground"
        >
          Get started with the CLI
        </h2>
        <p className="text-label text-muted-foreground">
          Three CLI commands from{" "}
          <code className="font-mono text-code">hud init</code> to a remote
          eval.
        </p>
      </header>

      <ol className="flex flex-col">
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1;
          return (
            <li key={step.index} className={cn("flex gap-3", !isLast && "pb-6")}>
              <div className="flex flex-col items-center self-stretch">
                <span
                  aria-hidden="true"
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-meta font-semibold text-muted-foreground"
                >
                  {step.index}
                </span>
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="mt-1.5 w-px flex-1 bg-border"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <h3 className="text-body font-medium text-foreground">
                    {step.label}
                  </h3>
                  <p className="text-label text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <CodeBlock variant="block" language="bash" code={step.code} />
              </div>
            </li>
          );
        })}
      </ol>

      <Alert variant="info">
        <InfoIcon aria-hidden="true" />
        <AlertTitle>Iteration loop</AlertTitle>
        <AlertDescription>
          <p>
            <code className="font-mono text-code">hud deploy</code> is the
            slow step — run it once. After that, edit{" "}
            <code className="font-mono text-code">tasks.py</code> and re-run{" "}
            <code className="font-mono text-code">hud sync tasks</code> (takes
            seconds). Only redeploy when{" "}
            <code className="font-mono text-code">env.py</code> or the
            Dockerfile changes.
          </p>
        </AlertDescription>
      </Alert>

      <p className="text-label text-muted-foreground">
        See{" "}
        <span className="font-medium text-foreground">Deploy & Go Remote</span>{" "}
        for deploy flags, secrets, and auto-deploy options.
      </p>
    </section>
  );
}
