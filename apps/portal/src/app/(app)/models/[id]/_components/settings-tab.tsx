import type { Model, OwnershipClass, Viewer } from "../_data/types";
import { ConfigurationPanel } from "./configuration-panel";
import { DangerZonePanel } from "./danger-zone-panel";
import { ModelInformationPanel } from "./model-information-panel";

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

  const showDangerZone =
    model.ownerType === "user-trained" && isEditorClass;

  return (
    <div className="flex w-full flex-col gap-6 py-4">
      <ConfigurationPanel model={model} disabled={!canEdit} />
      <ModelInformationPanel model={model} />
      {showDangerZone && <DangerZonePanel model={model} />}
    </div>
  );
}
