import type { Model, OwnershipClass, Viewer } from "../_data/types";
import { GeneralSection } from "./general-section";
import { SystemDetailsSection } from "./system-details-section";
import { UsageSection } from "./usage-section";

export function SettingsTab({
  model,
  viewer,
  ownershipClass,
}: {
  model: Model;
  viewer: Viewer;
  ownershipClass: OwnershipClass;
}) {
  const isEditorClass =
    ownershipClass === "user-trained:owner" ||
    ownershipClass === "user-trained:admin";
  const canEdit = isEditorClass && viewer.persona === "rl-researcher";

  return (
    <div className="flex w-full flex-col gap-6 py-4">
      <GeneralSection model={model} disabled={!canEdit} />
      <UsageSection model={model} />
      <SystemDetailsSection model={model} />
    </div>
  );
}
