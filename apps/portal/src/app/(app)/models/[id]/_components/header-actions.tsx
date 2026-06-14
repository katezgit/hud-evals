"use client";

import { useRouter } from "next/navigation";
import { GitFork, GraduationCap } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import type { Model } from "../_data/types";

export function HeaderActions({
  model,
}: {
  model: Model;
}) {
  const router = useRouter();

  if (!model.trainable) return null;

  if (model.checkpointCount === 0) {
    const onClick = () =>
      router.push(`/jobs/new?type=training&modelId=${model.id}`);
    return (
      <div className="flex items-center gap-2">
        <IconButton
          variant="primary"
          size="sm"
          aria-label="Fork & Train"
          className="md:hidden"
          onClick={onClick}
        >
          <GitFork aria-hidden="true" />
        </IconButton>
        <Button
          variant="primary"
          className="hidden md:inline-flex"
          onClick={onClick}
        >
          <GitFork aria-hidden="true" />
          Fork & Train
        </Button>
      </div>
    );
  }

  const forkSource = model.activeCheckpointId ?? model.id;
  const onFork = () =>
    router.push(`/jobs/new?type=training&modelId=${forkSource}`);
  const onTrain = () =>
    router.push(`/jobs/new?type=training&modelId=${model.id}`);

  return (
    <div className="flex items-center gap-2">
      <IconButton
        variant="secondary"
        size="sm"
        aria-label="Fork"
        className="md:hidden"
        onClick={onFork}
      >
        <GitFork aria-hidden="true" />
      </IconButton>
      <Button
        variant="secondary"
        className="hidden md:inline-flex"
        onClick={onFork}
      >
        <GitFork aria-hidden="true" />
        Fork
      </Button>
      <IconButton
        variant="primary"
        size="sm"
        aria-label="Train"
        className="md:hidden"
        onClick={onTrain}
      >
        <GraduationCap aria-hidden="true" />
      </IconButton>
      <Button
        variant="primary"
        className="hidden md:inline-flex"
        onClick={onTrain}
      >
        <GraduationCap aria-hidden="true" />
        Train
      </Button>
    </div>
  );
}
