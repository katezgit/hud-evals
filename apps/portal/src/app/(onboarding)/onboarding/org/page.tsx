import type { Metadata } from "next";
import { ProgressStrip } from "../_components/progress-strip";
import { OrgForm } from "./org-form";

export const metadata: Metadata = {
  title: "Create your organization",
};

export default function OnboardingOrgPage() {
  return (
    <>
      <ProgressStrip step={1} />
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-subtitle font-medium text-foreground">
          Create your organization
        </h1>
        <p className="text-body text-muted-foreground">
          You can change this later in Settings.
        </p>
      </div>
      <OrgForm defaultName="Acme Robotics" />
    </>
  );
}
