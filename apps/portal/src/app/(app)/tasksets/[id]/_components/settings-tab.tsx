import { Separator } from "@repo/ui/components/separator";
import type { Taskset } from "@/lib/mock/tasksets";
import DangerZoneSection from "./settings/danger-zone-section";
import IdentitySection from "./settings/identity-section";
import MetadataSection from "./settings/metadata-section";
import ProgressStepsSection from "./settings/progress-steps-section";
import SystemPromptSection from "./settings/system-prompt-section";
import VisibilitySection from "./settings/visibility-section";

interface SettingsTabProps {
  taskset: Taskset;
}

export default function SettingsTab({ taskset }: SettingsTabProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-6 pb-10">
      <IdentitySection name={taskset.name} purpose={taskset.purpose} />
      <Separator />
      <SystemPromptSection systemPrompt={taskset.systemPrompt ?? ""} />
      <Separator />
      <ProgressStepsSection />
      <Separator />
      <VisibilitySection tasksetName={taskset.name} />
      <Separator />
      <MetadataSection
        tasksetId={taskset.id}
        createdAt="2025-11-04"
        createdBy={`@${taskset.ownerName.toLowerCase().replace(/\s+/g, "-")}`}
        modifiedAt="2026-05-12"
        modifiedBy={`@${taskset.ownerName.toLowerCase().replace(/\s+/g, "-")}`}
      />
      <DangerZoneSection tasksetName={taskset.name} />
    </div>
  );
}
