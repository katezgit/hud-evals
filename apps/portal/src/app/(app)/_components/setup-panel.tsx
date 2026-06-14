"use client";

import { useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Button } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { IconButton } from "@repo/ui/components/icon-button";
import { cn } from "@repo/ui/lib/cn";

interface SetupPanelProps {
  onDismiss: () => void;
}

const STEPS: ReadonlyArray<{
  id: string;
  title: string;
  body: string;
}> = [
  {
    id: "install-uv",
    title: "Install uv",
    body:
      "Install uv — the package manager HUD uses for fast, reproducible Python environments. Run `curl -LsSf https://astral.sh/uv/install.sh | sh` on macOS or Linux.",
  },
  {
    id: "install-tool",
    title: "Install HUD Tool",
    body: "Install the HUD CLI with `uv tool install hud-python`. This gives you the `hud` command.",
  },
  {
    id: "api-keys",
    title: "Get and Set API Keys",
    body: "Generate a test key from the dashboard, then set it as `HUD_API_KEY` in your environment.",
  },
  {
    id: "first-env",
    title: "Create Your First Environment",
    body: "Run `hud init` in an empty directory to scaffold a starter Environment.",
  },
  {
    id: "explore-docs",
    title: "Explore Documentation",
    body: "Read the quickstart at docs.hud.ai to learn how Environments, Tasksets, and Jobs fit together.",
  },
];

export function SetupPanel({ onDismiss }: SetupPanelProps) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<ReadonlyArray<string>>([]);

  function toggleDone(id: string) {
    setDone((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  }

  return (
    <section
      aria-label="Setup"
      className="max-w-[640px] rounded-md border border-border bg-elevated-surface"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2 px-4 py-3">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="group flex flex-1 items-center gap-2 text-left"
            >
              <ChevronRight
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-fast ease-out-standard",
                  open && "rotate-90",
                )}
              />
              <span className="font-mono text-meta font-semibold uppercase tracking-wide text-muted-foreground">
                Set up
              </span>
            </button>
          </CollapsibleTrigger>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Dismiss setup panel"
            onClick={onDismiss}
          >
            <X aria-hidden="true" />
          </IconButton>
        </div>

        <CollapsibleContent>
          <div className="border-t border-border px-4 pt-1 pb-3">
            <Accordion type="multiple" className="w-full">
              {STEPS.map((step) => {
                const isDone = done.includes(step.id);
                return (
                  <AccordionItem key={step.id} value={step.id}>
                    <AccordionTrigger
                      badge={
                        isDone ? (
                          <span
                            aria-label="Completed"
                            className="inline-flex size-4 items-center justify-center rounded-full bg-state-scored-subtle text-state-scored"
                          >
                            <Check
                              aria-hidden="true"
                              className="size-3"
                            />
                          </span>
                        ) : undefined
                      }
                    >
                      {step.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-3 pt-1">
                        <p className="text-body text-muted-foreground">
                          {step.body}
                        </p>
                        <Button
                          type="button"
                          variant={isDone ? "ghost" : "secondary"}
                          onClick={() => toggleDone(step.id)}
                          className="self-start"
                        >
                          {isDone ? "Mark as not done" : "I've done this"}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
