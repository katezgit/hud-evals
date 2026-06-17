"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@repo/ui/components/brand-mark";
import { BrandPanel } from "./onboarding/_components/brand-panel";
import { ProgressStrip } from "./onboarding/_components/progress-strip";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isInviteStep = pathname?.startsWith("/onboarding/invite") ?? false;
  const step = isInviteStep ? 2 : 1;

  return (
    <main className="flex min-h-screen flex-col bg-background lg:flex-row">
      <BrandPanel />
      <section className="flex flex-1 flex-col items-center justify-center bg-panel bg-grid-overlay px-6 py-10 lg:border-l lg:border-border-strong lg:px-16 lg:py-16">
        <div className="flex w-full max-w-[420px] flex-col">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark />
          </div>
          <div className="rounded-lg bg-card p-6 lg:border lg:border-border lg:p-10">
            <div className="mb-8 flex min-h-5 items-center justify-between">
              <ProgressStrip step={step} />
              {isInviteStep && (
                <Link
                  href="/onboarding/org"
                  className="inline-flex items-center gap-1 text-caption text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  <ArrowLeft aria-hidden="true" className="size-3.5" />
                  Back
                </Link>
              )}
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
