import { HelpCircleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

interface UnknownIndicatorProps {
  /** Tooltip body — describes what's unknown (e.g. "Reasoning support unknown"). */
  label: string;
}

/**
 * Question-mark icon with hover tooltip. Used in capability cells (Reasoning,
 * Speed) where the upstream provider doesn't publish the flag — distinguishes
 * "not supported" (X icon) from "no data" (?).
 */
export default function UnknownIndicator({ label }: UnknownIndicatorProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          aria-label={label}
          className="inline-flex cursor-help rounded-full text-meta-foreground focus-visible:text-foreground"
        >
          <HelpCircleIcon aria-hidden="true" className="size-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
