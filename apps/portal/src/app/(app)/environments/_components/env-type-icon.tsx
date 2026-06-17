import {
  Box,
  Code2,
  Globe,
  Monitor,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { EnvType } from "../[id]/_data/types";

/**
 * Card top-row leading glyph signalling environment runtime category. The
 * label adjacent to the icon (`{org} / {name}`) is the primary affordance —
 * this icon is decorative scaffolding that lets Alex scan the grid by type.
 *
 * Mapping tracks `environments.wireframe.md` §3a taxonomy.
 */
const ICONS: Record<EnvType, LucideIcon> = {
  browser: Globe,
  "code-swe": Code2,
  "os-desktop": Monitor,
  domain: Wrench,
  custom: Box,
};

export function EnvTypeIcon({ type }: { type: EnvType }) {
  const Icon = ICONS[type];
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-6 shrink-0 items-center justify-center rounded bg-muted-surface text-muted-foreground"
    >
      <Icon className="size-3.5" />
    </span>
  );
}
