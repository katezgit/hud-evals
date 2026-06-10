import type { Metadata } from "next";
import { Switch } from "@repo/ui/components/switch";
import { Card } from "@repo/ui/components/card";
import AdminGate from "@/app/(manage)/_components/admin-gate";
import { privacyToggles } from "@/lib/mock";

export const metadata: Metadata = {
  title: "Privacy controls",
};

export default function PrivacyPage() {
  return (
    <AdminGate>
      <PrivacyToggle
        title="Retain run logs"
        description="Keep stdout/stderr and metrics for 90 days."
        defaultChecked={privacyToggles.retainRunLogs}
      />
      <PrivacyToggle
        title="Share anonymized telemetry"
        description="Help improve scheduling. No code or data leaves your org."
        defaultChecked={privacyToggles.shareTelemetry}
      />
    </AdminGate>
  );
}

interface PrivacyToggleProps {
  title: string;
  description: string;
  defaultChecked: boolean;
}

function PrivacyToggle({ title, description, defaultChecked }: PrivacyToggleProps) {
  return (
    <Card className="mb-4 flex flex-row items-start justify-between gap-4 px-4 py-4">
      <div className="flex-1">
        <h3 className="text-body font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-prose text-body text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} aria-label={title} />
    </Card>
  );
}
