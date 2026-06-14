import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgressStrip } from "../_components/progress-strip";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = {
  title: "Invite members",
};

export default function OnboardingInvitePage() {
  return (
    <>
      <ProgressStrip step={2} />

      <div className="mb-3 flex">
        <Link
          href="/onboarding/org"
          className="inline-flex items-center gap-1 text-caption text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Back
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-subtitle font-medium text-foreground">
          Invite members
        </h1>
        <p className="text-body text-muted-foreground">
          Optional — add teammates now or skip this step.
        </p>
      </div>

      <InviteForm />
    </>
  );
}
