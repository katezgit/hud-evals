"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { CopyButton } from "@repo/ui/components/copy-button";
import { VisibilityIcon } from "@repo/ui/components/visibility-icon";
import { EnvTypeIcon } from "@/app/(app)/environments/_components/env-type-icon";
import type { EnvType, EnvVisibility } from "@/app/(app)/environments/[id]/_data/types";

const ENV_VISIBILITY_TO_ICON: Record<EnvVisibility, "public" | "private"> = {
  public: "public",
  team: "private",
};

const ENV_TYPE_LABEL: Record<EnvType, string> = {
  browser: "Browser",
  "code-swe": "Code/SWE",
  "os-desktop": "OS/Desktop",
  domain: "Domain",
  custom: "Custom",
};

/**
 * Sticky page header for the env detail surface — two-altitude pattern
 * shared with model-detail and taskset-detail. Breadcrumb · title row ·
 * descriptor strip. The descriptor strip is the single metadata source
 * (slug, source, created-at); the Overview body intentionally repeats
 * none of it.
 *
 * Anchor sections in the body must use `scroll-mt-32` (~96px) so deep-link
 * jumps land below the combined sticky header + tab strip.
 */
export interface EnvDetailHeaderProps {
  name: string;
  type: EnvType;
  slug: string;
  organization: string;
  visibility: EnvVisibility;
}

export function EnvDetailHeader({
  name,
  type,
  slug,
  organization,
  visibility,
}: EnvDetailHeaderProps) {
  return (
    <header className="flex flex-col gap-3 pt-2 pb-4">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-label tracking-normal normal-case text-muted-foreground"
      >
        <Link
          href="/environments"
          className="rounded-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Environments
        </Link>
        <ChevronRight
          aria-hidden="true"
          className="size-3 text-meta-foreground"
        />
        <span aria-current="page" className="truncate text-foreground">
          {name}
        </span>
      </nav>

      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate text-display font-semibold text-foreground leading-none">
              {name}
            </h1>
            <VisibilityIcon visibility={ENV_VISIBILITY_TO_ICON[visibility]} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-body text-muted-foreground">
            <span className="hidden md:inline-flex md:items-center md:gap-1.5">
              <EnvTypeChip type={type} />
            </span>
            <Separator className="hidden md:inline" />
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono">{slug}</span>
              <CopyButton
                value={slug}
                ariaLabel={`Copy environment slug ${slug}`}
                tooltipLabel="Copy slug"
              />
            </span>
            <Separator />
            <span>Owned by: {organization}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function EnvTypeChip({ type }: { type: EnvType }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <EnvTypeIcon type={type} />
      <span className="text-foreground">{ENV_TYPE_LABEL[type]}</span>
    </span>
  );
}

function Separator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("text-meta-foreground", className)}
    >
      ·
    </span>
  );
}
