"use client";

import {
  Box,
  Code2,
  Globe,
  Lock,
  Monitor,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import type {
  EnvType,
  EnvVisibility,
} from "@/app/(app)/environments/[id]/_data/types";

const TYPE_ICONS: Record<EnvType, LucideIcon> = {
  browser: Globe,
  "code-swe": Code2,
  "os-desktop": Monitor,
  domain: Wrench,
  custom: Box,
};

const TYPE_LABELS: Record<EnvType, string> = {
  browser: "Browser",
  "code-swe": "Code/SWE",
  "os-desktop": "OS/Desktop",
  domain: "Domain",
  custom: "Custom",
};

export interface EnvDetailHeaderProps {
  name: string;
  type: EnvType;
  organization: string;
  visibility: EnvVisibility;
}

export function EnvDetailHeader({
  name,
  type,
  organization,
  visibility,
}: EnvDetailHeaderProps) {
  const TypeIcon = TYPE_ICONS[type];
  const isPublic = visibility === "public";
  return (
    <header className="flex flex-col gap-3 pt-2 pb-6">
      <Breadcrumb parent={{ href: "/environments", label: "Environments" }} current={name} />

      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col page-header">
          <h1 className="truncate text-display font-semibold text-foreground">
            {name}
          </h1>
          <div className="page-header-meta">
            <span className="inline-flex items-center gap-1">
              <TypeIcon aria-hidden="true" className="size-3.5" />
              {TYPE_LABELS[type]}
            </span>
            <Separator />
            <span className="inline-flex items-center gap-1">
              {isPublic ? (
                <Globe aria-hidden="true" className="size-3.5" />
              ) : (
                <Lock aria-hidden="true" className="size-3.5" />
              )}
              {isPublic ? "Public" : "Team"}
            </span>
            <Separator />
            <span>Owned by: {organization}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Separator() {
  return <span aria-hidden="true" className="text-meta-foreground">·</span>;
}
