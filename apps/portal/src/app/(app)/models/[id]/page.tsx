import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelDetailHeader } from "./_components/model-detail-header";
import { ModelDetailTabs } from "./_components/model-detail-tabs";
import {
  getCheckpoints,
  getModelById,
  getTasksetResults,
  getViewer,
} from "./_data/models";
import { deriveOwnershipClass } from "./_data/types";

export const metadata: Metadata = {
  title: "Model details",
};

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Persona/ownership derivation point: viewer comes from a typed mock until
  // the session cookie grows a persona field. See _data/models.ts → getViewer.
  const [model, viewer, tasksetResults, checkpoints] = await Promise.all([
    getModelById(id),
    getViewer(),
    getTasksetResults(id),
    getCheckpoints(id),
  ]);

  if (model === null) {
    notFound();
  }

  const ownershipClass = deriveOwnershipClass(model, viewer);

  return (
    <div className="flex min-h-full flex-col gap-2 px-4 md:px-8 py-6">
      <ModelDetailHeader model={model} viewer={viewer} />
      <ModelDetailTabs
        model={model}
        viewer={viewer}
        ownershipClass={ownershipClass}
        tasksetResults={tasksetResults}
        checkpoints={checkpoints}
      />
    </div>
  );
}
