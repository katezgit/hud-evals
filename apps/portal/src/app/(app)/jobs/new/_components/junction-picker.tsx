"use client";

import { useRouter } from "next/navigation";
import { PlayIcon, TargetIcon } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/alert";

export interface JunctionPickerProps {
  invalidType?: string;
}

export function JunctionPicker({ invalidType }: JunctionPickerProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      {invalidType && (
        <Alert variant="destructive">
          <AlertTitle>Unknown job type</AlertTitle>
          <AlertDescription>
            <p className="text-body text-foreground">
              {`We don’t recognize job type “${invalidType}”. Pick one below to continue.`}
            </p>
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <JunctionCard
          icon={<PlayIcon aria-hidden="true" className="size-4" />}
          title="Run Eval"
          description="Compare one or more models against a taskset."
          costFigure="~$2"
          costSuffix="per run"
          onClick={() => router.replace("/jobs/new?type=eval")}
        />
        <JunctionCard
          icon={<TargetIcon aria-hidden="true" className="size-4" />}
          title="Train a Model"
          description="Fine-tune a model checkpoint using reinforcement learning."
          costFigure="~$1,200+"
          costSuffix="per run"
          onClick={() => router.replace("/jobs/new?type=training")}
        />
      </div>
    </div>
  );
}

interface JunctionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  costFigure: string;
  costSuffix: string;
  onClick: () => void;
}

function JunctionCard({
  icon,
  title,
  description,
  costFigure,
  costSuffix,
  onClick,
}: JunctionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex cursor-pointer flex-col gap-2 rounded-lg border border-border bg-panel p-6 text-left transition-colors hover:border-primary focus-visible:border-primary focus-visible:shadow-focus-ring outline-hidden"
    >
      <span className="text-muted-foreground transition-colors group-hover:text-primary">
        {icon}
      </span>
      <h3 className="text-subtitle font-semibold text-foreground">{title}</h3>
      <p className="text-body text-muted-foreground">{description}</p>
      <p className="mt-2 text-meta text-meta-foreground uppercase">
        <span className="font-semibold text-foreground">{costFigure}</span>
        {` ${costSuffix}`}
      </p>
    </button>
  );
}
