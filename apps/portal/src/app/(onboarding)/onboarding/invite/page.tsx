import type { Metadata } from "next";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = {
  title: "Invite members",
};

export default function OnboardingInvitePage() {
  return (
    <>
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
