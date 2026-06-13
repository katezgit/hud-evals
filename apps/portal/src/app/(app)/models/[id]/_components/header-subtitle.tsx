import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Capability } from "@/lib/mock/explore-models";
import UnknownIndicator from "../../_components/unknown-indicator";
import type { Model } from "../_data/types";

/**
 * Subtitle line under the title.
 *
 * Two compositions, not one component with a flag:
 *   - `<BaseModelSubtitle>`         — checkpointCount === 0
 *   - `<UserTrainedModelSubtitle>`  — checkpointCount ≥ 1
 *
 * The page picks which to render. Each has only the props it needs.
 *
 * Layout: `flex items-center gap-2 flex-wrap` on the wrapper. The `·`
 * separators are plain flex children so the 8px inline gap is owned by the
 * parent — not duplicated via `mx-2` on each separator.
 */

interface BaseModelSubtitleProps {
  apiName: string;
  provider: string;
  kind: Capability<"chat" | "reasoning">;
  reasoning: Capability<boolean>;
}

export function BaseModelSubtitle({ apiName, provider, kind, reasoning }: BaseModelSubtitleProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-body text-muted-foreground">
      <span>{provider}</span>
      <Separator />
      <KindLabel kind={kind} />
      <Separator />
      <span className="font-mono">{apiName}</span>
      {reasoning === true && (
        <>
          <Separator />
          <ReasoningChip />
        </>
      )}
    </div>
  );
}

interface UserTrainedModelSubtitleProps {
  apiName: string;
  provider: string;
  kind: Capability<"chat" | "reasoning">;
  forkedFromApiName: string;
  forkedFromModelId: string;
  activeCheckpointId: string;
  activeCheckpointStep: number;
  reasoning: Capability<boolean>;
}

export function UserTrainedModelSubtitle({
  apiName,
  provider,
  kind,
  forkedFromApiName,
  forkedFromModelId,
  activeCheckpointId,
  activeCheckpointStep,
  reasoning,
}: UserTrainedModelSubtitleProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-body text-muted-foreground">
      <span>{provider}</span>
      <Separator />
      <KindLabel kind={kind} />
      <Separator />
      <span>
        forked from{" "}
        <Link
          href={`/models/${forkedFromModelId}`}
          className="font-mono text-primary hover:underline"
        >
          {forkedFromApiName}
        </Link>
      </span>
      <Separator />
      <span>
        Active checkpoint:{" "}
        <span className="font-mono text-foreground">{activeCheckpointId}</span>
        <span className="text-muted-foreground"> (step {activeCheckpointStep})</span>
      </span>
      <Separator />
      <span className="font-mono">{apiName}</span>
      {reasoning === true && (
        <>
          <Separator />
          <ReasoningChip />
        </>
      )}
    </div>
  );
}

export function HeaderSubtitle({ model }: { model: Model }) {
  if (
    model.checkpointCount >= 1 &&
    model.forkedFrom !== null &&
    model.activeCheckpointId !== null &&
    model.activeCheckpointStep !== null
  ) {
    return (
      <UserTrainedModelSubtitle
        apiName={model.apiName}
        provider={model.provider}
        kind={model.kind}
        forkedFromApiName={model.forkedFrom.apiName}
        forkedFromModelId={model.forkedFrom.modelId}
        activeCheckpointId={model.activeCheckpointId}
        activeCheckpointStep={model.activeCheckpointStep}
        reasoning={model.reasoning}
      />
    );
  }
  return (
    <BaseModelSubtitle
      apiName={model.apiName}
      provider={model.provider}
      kind={model.kind}
      reasoning={model.reasoning}
    />
  );
}

function Separator() {
  return <span aria-hidden="true" className="text-meta-foreground">·</span>;
}

function KindLabel({ kind }: { kind: Capability<"chat" | "reasoning"> }) {
  if (kind === "unknown") {
    return <UnknownIndicator label="Kind not published by provider" />;
  }
  return <span>{kind === "chat" ? "Chat" : "Reasoning"}</span>;
}

function ReasoningChip() {
  return (
    <span className="flex items-center gap-1">
      <Sparkles aria-hidden="true" className="size-3" />
      Reasoning
    </span>
  );
}
