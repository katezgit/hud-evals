import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Switch } from "@repo/ui/components/switch";
import AdminGate from "@/app/(manage)/_components/admin-gate";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { privacyToggles } from "@/lib/mock";

export const metadata: Metadata = {
  title: "Privacy controls",
};

export default function PrivacyPage() {
  return (
    <AdminGate>
      <Panel>
        <div className="flex flex-col divide-y divide-border">
          <PrivacyRow
            title="Retain run logs"
            description="Keep stdout/stderr and metrics for 90 days."
            control={
              <Switch
                defaultChecked={privacyToggles.retainRunLogs}
                aria-label="Retain run logs"
              />
            }
          />
          <PrivacyRow
            title="Share anonymized telemetry"
            description="Help improve scheduling. No code or data leaves your org."
            control={
              <Switch
                defaultChecked={privacyToggles.shareTelemetry}
                aria-label="Share anonymized telemetry"
              />
            }
          />
        </div>
      </Panel>
    </AdminGate>
  );
}

interface PrivacyRowProps {
  title: string;
  description: string;
  control: ReactNode;
}

function PrivacyRow({ title, description, control }: PrivacyRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <h3 className="text-body font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-prose text-body text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
