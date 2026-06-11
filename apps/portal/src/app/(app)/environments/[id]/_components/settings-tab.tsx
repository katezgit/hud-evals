"use client";

import type { Environment } from "../_data/types";
import { BuildConfigurationSection } from "./settings/build-configuration-section";
import { DangerZoneSection } from "./settings/danger-zone-section";
import { EnvInfoSection } from "./settings/env-info-section";
import { EnvVarsSection } from "./settings/env-vars-section";
import { FileTrackingSection } from "./settings/file-tracking-section";
import { PodConfigSection } from "./settings/pod-config-section";

export function SettingsTab({ env }: { env: Environment }) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <EnvInfoSection envId={env.id} displayName={env.name} />
      <EnvVarsSection vars={env.vars} />
      <PodConfigSection />
      <FileTrackingSection />
      <BuildConfigurationSection />
      <DangerZoneSection envName={env.name} />
    </div>
  );
}
