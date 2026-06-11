import {
  Anthropic,
  Bedrock,
  Gemini,
  OpenAI,
  OpenRouter,
  XAI,
} from "@lobehub/icons";

import { cn } from "@repo/ui/lib/cn";
import type { ModelProvider } from "@/lib/mock/explore-models";

interface ProviderIconProps {
  provider: ModelProvider;
  className?: string;
}

const ICON_SIZE = 16;

// Tinker is not (yet) in @lobehub/icons. Use a typographic monogram in a small
// neutral tile that visually matches the weight of the lobehub mono glyphs.
function TinkerMark() {
  return (
    <span
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-sm",
        "bg-muted font-mono text-meta font-semibold leading-none text-muted-foreground",
      )}
    >
      T
    </span>
  );
}

export default function ProviderIcon({ provider, className }: ProviderIconProps) {
  const wrapper = cn(
    "inline-flex size-4 shrink-0 items-center justify-center text-foreground",
    className,
  );

  switch (provider) {
    case "Anthropic":
      return (
        <span aria-hidden="true" className={wrapper}>
          <Anthropic size={ICON_SIZE} />
        </span>
      );
    case "OpenAI":
      return (
        <span aria-hidden="true" className={wrapper}>
          <OpenAI size={ICON_SIZE} />
        </span>
      );
    case "Gemini":
      // Gemini's colorful G is the recognizable brand mark — keep it.
      return (
        <span aria-hidden="true" className={wrapper}>
          <Gemini.Color size={ICON_SIZE} />
        </span>
      );
    case "xAI":
      return (
        <span aria-hidden="true" className={wrapper}>
          <XAI size={ICON_SIZE} />
        </span>
      );
    case "OpenRouter":
      return (
        <span aria-hidden="true" className={wrapper}>
          <OpenRouter size={ICON_SIZE} />
        </span>
      );
    case "Bedrock":
      return (
        <span aria-hidden="true" className={wrapper}>
          <Bedrock size={ICON_SIZE} />
        </span>
      );
    case "Tinker":
      return (
        <span aria-hidden="true" className={wrapper}>
          <TinkerMark />
        </span>
      );
    default: {
      // Exhaustiveness check — TypeScript fails the build if a new provider
      // is added to ModelProvider without updating this switch.
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}
