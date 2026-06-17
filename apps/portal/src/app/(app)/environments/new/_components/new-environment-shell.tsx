"use client";

import { useRef } from "react";
import { cn } from "@repo/ui/lib/cn";
import { usePageScrolled } from "@repo/libs/hooks";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import { CliQuickstart } from "./cli-quickstart";
import { TemplatesSection } from "./templates-section";

export function NewEnvironmentShell() {
  const stickyRef = useRef<HTMLDivElement>(null);
  const scrolled = usePageScrolled({ ref: stickyRef });

  return (
    <div className="flex min-h-full flex-col pb-6">
      <div
        ref={stickyRef}
        // Sticky header (breadcrumb + title + subhead) pinned to the top of
        // the (app) scroll container. Inherits the detail-page pattern:
        // pt-6 lives INSIDE the sticky element (not on the outer page wrap)
        // so the sticky's natural top edge sits at scroll y=0; otherwise
        // outer padding would push it down and it would visibly creep upward
        // during scroll 0→24 before pinning. See env-detail-shell.tsx.
        //
        // Chrome (bg + border + shadow) is FULL-BLEED across <main>; only the
        // visible header content is capped at 1536 via the inner wrapper. See
        // docs/design/guidelines/app-shell-layout.md §2.
        className={cn(
          "sticky top-0 z-page-chrome bg-panel pt-6",
          // Scroll-cue: border slot is always occupied so flipping
          // border-color does not shift layout.
          "border-b",
          scrolled ? "border-border" : "border-transparent",
          scrolled ? "shadow-scroll-cue" : "shadow-none",
          "transition-[border-color,box-shadow] prop-(--motion-state-change)",
        )}
      >
        <div className="page-shell block py-0">
          <header className="flex flex-col gap-3 pt-2 pb-6">
            <Breadcrumb parent={{ href: "/environments", label: "Environments" }} current="New" />
            <div className="page-header">
              <h1 className="text-display font-semibold text-foreground">
                Let&apos;s create your custom environment
              </h1>
              <p className="text-muted-foreground">
                The fastest path is the CLI{" "}
                <code className="font-mono text-code">hud init</code> scaffolds a
                working environment in seconds. Or fork a template repo below to
                start from a known-good shape.
              </p>
            </div>
          </header>
        </div>
      </div>

      <div className="page-shell py-0 pt-6">
        <CliQuickstart />
        <hr className="border-border" />
        <TemplatesSection />
      </div>
    </div>
  );
}
