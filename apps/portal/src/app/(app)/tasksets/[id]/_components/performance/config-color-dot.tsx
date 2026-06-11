import { cn } from "@repo/ui/lib/cn";
import type { PerformanceConfig } from "@/lib/mock/performance";

export function configDotClass(id: PerformanceConfig["id"]): string {
  switch (id) {
    case "A":
      return "bg-chart-1";
    case "B":
      return "bg-chart-2";
    case "C":
      return "bg-chart-3";
    default:
      return "bg-chart-4";
  }
}

export function configTextClass(id: PerformanceConfig["id"]): string {
  switch (id) {
    case "A":
      return "text-chart-1";
    case "B":
      return "text-chart-2";
    case "C":
      return "text-chart-3";
    default:
      return "text-chart-4";
  }
}

export function configStrokeClass(id: PerformanceConfig["id"]): string {
  switch (id) {
    case "A":
      return "stroke-chart-1";
    case "B":
      return "stroke-chart-2";
    case "C":
      return "stroke-chart-3";
    default:
      return "stroke-chart-4";
  }
}

export function configFillClass(id: PerformanceConfig["id"]): string {
  switch (id) {
    case "A":
      return "fill-chart-1";
    case "B":
      return "fill-chart-2";
    case "C":
      return "fill-chart-3";
    default:
      return "fill-chart-4";
  }
}

export default function ConfigColorDot({
  id,
  className,
}: {
  id: PerformanceConfig["id"];
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        configDotClass(id),
        className,
      )}
    />
  );
}
