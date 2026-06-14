"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Boxes, FileText } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/cn";
import { SetupPanel } from "./setup-panel";

export function GetStartedLanding() {
  const router = useRouter();
  const [setupDismissed, setSetupDismissed] = useState(false);

  function handleTemplateClick() {
    router.push("/environments/new");
  }

  function handleSkip() {
    router.push("/jobs");
  }

  function handleDismissSetup() {
    setSetupDismissed(true);
  }

  return (
    <div className="flex flex-col gap-8 px-8 pt-6 pb-12">
      <h1 className="text-display font-medium text-foreground">
        Get started with HUD
      </h1>

      <div className="flex flex-col gap-4">
        <h2 className="text-title font-medium text-foreground">
          How do you want to get started?
        </h2>

        <div className="grid max-w-[640px] grid-cols-1 gap-4 md:grid-cols-2">
          <Card
            variant="interactive"
            onClick={handleTemplateClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleTemplateClick();
              }
            }}
            className="flex flex-col gap-3 p-5"
          >
            <Boxes
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-body font-semibold text-foreground">
                Use an Environment template
              </span>
              <Badge variant="brand-soft" size="sm">
                Most popular
              </Badge>
            </div>
            <p className="text-caption text-muted-foreground">
              Deploy from a template and run your first eval.
            </p>
          </Card>

          <a
            href="https://docs.hud.ai"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "no-underline",
              // Mirror Card variant="interactive" chrome inline for the anchor.
              "relative flex flex-col gap-3 rounded-surface border border-border bg-panel p-5",
              "text-foreground transition-colors duration-fast hover:bg-hover-surface",
            )}
          >
            <FileText
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-body font-semibold text-foreground">
                Read the docs
              </span>
              <span className="inline-flex items-center gap-1 text-meta text-muted-foreground">
                docs.hud.ai
                <ArrowUpRight aria-hidden="true" className="size-3" />
              </span>
            </div>
            <p className="text-caption text-muted-foreground">
              Quickstart, SDK reference, and examples.
            </p>
          </a>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="self-start text-caption text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Skip <span aria-hidden="true">/</span> or go to your dashboard{" "}
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {!setupDismissed && <SetupPanel onDismiss={handleDismissSetup} />}
    </div>
  );
}
