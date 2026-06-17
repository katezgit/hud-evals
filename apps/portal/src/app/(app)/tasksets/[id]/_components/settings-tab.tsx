import type { Taskset } from "@/lib/mock/tasksets";
import DangerZoneSection from "./settings/danger-zone-section";
import IdentitySection from "./settings/identity-section";
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
      <SystemPromptSection systemPrompt={taskset.systemPrompt ?? ""} />
      <ProgressStepsSection />
      <VisibilitySection
        tasksetName={taskset.name}
        visibility={taskset.visibility}
      />
      <DangerZoneSection tasksetName={taskset.name} />
    </div>
  );
}
