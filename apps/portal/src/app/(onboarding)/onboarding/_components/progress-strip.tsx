import { cn } from "@repo/ui/lib/cn";

interface ProgressStripProps {
  step: 1 | 2;
}

export function ProgressStrip({ step }: ProgressStripProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={2}
      aria-label={`Step ${step} of 2`}
      className="flex items-center gap-1.5"
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 rounded-full transition-all",
          step === 1 ? "w-4 bg-primary" : "w-1.5 bg-border",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 rounded-full transition-all",
          step === 2 ? "w-4 bg-primary" : "w-1.5 bg-border",
        )}
      />
    </div>
  );
}
