"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import { usePageScrolled } from "@repo/libs/hooks";
import { CliQuickstart } from "./cli-quickstart";
import { TemplatesSection } from "./templates-section";

export function NewEnvironmentShell() {
  const stickyRef = useRef<HTMLDivElement>(null);
  const scrolled = usePageScrolled({ ref: stickyRef });

  return (
    <div className="flex min-h-full flex-col px-4 pb-6 md:px-8">
      <div
        ref={stickyRef}
        // Sticky header (breadcrumb + title + subhead) pinned to the top of
        // the (app) scroll container. Inherits the detail-page pattern:
        // pt-6 lives INSIDE the sticky element (not on the outer page wrap)
        // so the sticky's natural top edge sits at scroll y=0; otherwise
        // outer padding would push it down and it would visibly creep upward
        // during scroll 0→24 before pinning. See env-detail-shell.tsx.
        className={cn(
          "sticky top-0 z-page-chrome bg-background pt-6",
          // Scroll-cue: border slot is always occupied so flipping
          // border-color does not shift layout.
          "border-b",
          scrolled ? "border-border" : "border-transparent",
          scrolled ? "shadow-scroll-cue" : "shadow-none",
          "transition-[border-color,box-shadow] prop-(--motion-state-change)",
        )}
      >
        <header className="flex flex-col gap-3 pt-2 pb-6">
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
              New
            </span>
          </nav>
          <h1 className="text-display font-semibold text-foreground">
            Let&apos;s create your custom environment
          </h1>
          <p className="text-body text-muted-foreground">
            The fastest path is the CLI{" "}
            <code className="font-mono text-code">hud init</code> scaffolds a
            working environment in seconds. Or fork a template repo below to
            start from a known-good shape.
          </p>
        </header>
      </div>

      <div className="flex flex-col gap-8 pt-6">
        <CliQuickstart />
        <hr className="border-border" />
        <TemplatesSection />
      </div>
    </div>
  );
}
