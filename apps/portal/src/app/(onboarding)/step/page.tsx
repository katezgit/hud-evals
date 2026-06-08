import type { Metadata } from "next";

export const metadata: Metadata = { title: "Get started" };

export default function OnboardingStepPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-display">Welcome</h1>
      <p className="text-muted-foreground">TODO: implement onboarding step.</p>
    </div>
  );
}
