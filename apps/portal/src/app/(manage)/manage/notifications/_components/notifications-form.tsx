"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { Panel } from "@/app/(manage)/_components/page-primitives";

export function NotificationsForm() {
  const [jobEnabled, setJobEnabled] = useState(true);
  const [browserEnabled, setBrowserEnabled] = useState(false);

  const handleJobToggle = (next: boolean) => {
    setJobEnabled(next);
    toast.info(next ? "Job notifications enabled" : "Job notifications disabled");
  };

  const handleBrowserToggle = (next: boolean) => {
    setBrowserEnabled(next);
    toast.info(next ? "Browser notifications enabled" : "Browser notifications disabled");
  };

  return (
    <Panel>
      <div className="flex flex-col divide-y divide-border">
        <SettingRow
          title="Job notifications"
          description="Show toast notifications when teammates start or complete jobs."
          control={
            <Switch
              checked={jobEnabled}
              onCheckedChange={handleJobToggle}
              aria-label="Job notifications"
            />
          }
        />
        <SettingRow
          title="Browser notifications"
          description="Receive a system notification when a job completes or fails while this tab is in the background."
          control={
            <Switch
              checked={browserEnabled}
              onCheckedChange={handleBrowserToggle}
              aria-label="Browser notifications"
            />
          }
        />
        <SettingRow
          title="GitHub"
          description="Manage GitHub access for building environments from your repositories."
          control={
            <Button variant="secondary" size="sm">
              Manage on GitHub
            </Button>
          }
        />
        <SettingRow
          title="Slack"
          description="Connect Slack to mention HUD in messages."
          control={
            <Button variant="secondary" size="sm">
              Connect Slack
            </Button>
          }
        />
      </div>
    </Panel>
  );
}

interface SettingRowProps {
  title: string;
  description: string;
  control: ReactNode;
}

function SettingRow({ title, description, control }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <h3 className="text-body font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-prose text-body text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
