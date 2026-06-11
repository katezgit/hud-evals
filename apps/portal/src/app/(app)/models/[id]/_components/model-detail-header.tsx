import Link from "next/link";
import { ChevronRight, GitFork, Play } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import { VisibilityIcon } from "@repo/ui/components/visibility-icon";
import type { Model, Viewer } from "../_data/types";
import { HeaderSubtitle } from "./header-subtitle";
import { JobsTrainingPill } from "./jobs-training-pill";
import { ModelStatusBadge } from "./model-status-badge";

export function ModelDetailHeader({
  model,
  viewer,
}: {
  model: Model;
  viewer: Viewer;
}) {
  const isResearcher = viewer.persona === "rl-researcher";
  const showJobsPill = isResearcher && model.activeTrainingJobsCount >= 1;

  return (
    <header className="flex flex-col gap-3 pt-2 pb-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-label tracking-normal normal-case text-muted-foreground"
      >
        <Link
          href="/models"
          className="rounded-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Models
        </Link>
        <ChevronRight aria-hidden="true" className="size-3 text-meta-foreground" />
        <span aria-current="page" className="truncate text-foreground">
          {model.displayName}
        </span>
      </nav>
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-display font-semibold text-foreground">
              {model.displayName}
            </h1>
            <ModelStatusBadge status={model.status} />
            <VisibilityIcon visibility={model.isPrivate ? "private" : "public"} />
          </div>
          <HeaderSubtitle model={model} />
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {model.trainable && (
              <>
                <IconButton
                  variant="secondary"
                  size="sm"
                  aria-label="Fork Model"
                  className="md:hidden"
                >
                  <GitFork aria-hidden="true" />
                </IconButton>
                <Button
                  variant="secondary"
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  <GitFork aria-hidden="true" />
                  Fork Model
                </Button>
              </>
            )}
            {isResearcher && (
              <>
                <IconButton
                  variant="primary"
                  size="sm"
                  aria-label="Train Model"
                  className="md:hidden"
                >
                  <Play aria-hidden="true" />
                </IconButton>
                <Button
                  variant="primary"
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  <Play aria-hidden="true" />
                  Train Model
                </Button>
              </>
            )}
          </div>
          {showJobsPill && (
            <JobsTrainingPill
              modelId={model.id}
              count={model.activeTrainingJobsCount}
            />
          )}
        </div>
      </div>
    </header>
  );
}
