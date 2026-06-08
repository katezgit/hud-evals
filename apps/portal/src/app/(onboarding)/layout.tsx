import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

// (onboarding) group — gated to authed-but-not-onboarded users only.
// Composes with (app) layout's reverse check: this layout redirects onboarded
// users to /, and (app) redirects not-onboarded users into onboarding. Together
// the two ensure a user is always in exactly one of (onboarding) or (app).
export default async function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const session = await requireSession();
  if (session.onboarded) redirect("/");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
