import type { ReactNode } from "react";
import { BrandMark } from "@repo/ui/components/brand-mark";
import { BrandPanel } from "./onboarding/_components/brand-panel";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-background md:flex-row">
      <BrandPanel />
      <section className="flex flex-1 flex-col items-center justify-center bg-elevated-surface bg-grid-overlay px-6 py-10 md:border-l md:border-border-strong md:px-16 md:py-16">
        <div className="flex w-full max-w-[360px] flex-col">
          <div className="mb-8 flex justify-center md:hidden">
            <BrandMark />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
