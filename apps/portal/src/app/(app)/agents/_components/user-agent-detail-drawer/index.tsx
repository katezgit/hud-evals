"use client";

import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Play, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { AgentKind, UserAgent } from "@/lib/mock/agents";
import {
  getAgentAttachments,
  saveAgentAttachments,
  subscribeAgentAttachments,
} from "@/lib/mock/agent-attachments";
import { tasksets, type Taskset } from "@/lib/mock/tasksets";
import {
  FooterMetadata,
  PurposeSection,
  TasksetsSection,
} from "../drawer-sections";
import { inferProviderFromModel } from "../infer-provider";

const KIND_BADGE: Record<AgentKind, string> = {
  qa: "QA",
  automation: "Automation",
  chat: "Chat",
};

const KIND_ICON: Record<AgentKind, LucideIcon> = {
  qa: ShieldCheck,
  automation: Play,
  chat: MessageSquare,
};

function formatTasksetList(names: ReadonlyArray<string>): string {
  if (names.length <= 3) return names.join(", ");
  const head = names.slice(0, 3).join(", ");
  return `${head} +${names.length - 3} more`;
}

function buildToastMessage(
  agentName: string,
  addedNames: ReadonlyArray<string>,
  removedNames: ReadonlyArray<string>,
): string {
  const addsWord = addedNames.length === 1 ? "taskset" : "tasksets";
  const removesWord = removedNames.length === 1 ? "taskset" : "tasksets";
  const attached =
    addedNames.length > 0
      ? `${agentName} attached to ${addsWord} ${formatTasksetList(addedNames)}`
      : "";
  const detached =
    removedNames.length > 0
      ? `detached from ${removesWord} ${formatTasksetList(removedNames)}`
      : "";
  if (attached && detached) return `${attached}, ${detached}`;
  if (attached) return attached;
  if (detached) return `${agentName} ${detached}`;
  return `${agentName} attachments updated`;
}

function tasksetName(id: string): string {
  return tasksets.find((t) => t.id === id)?.name ?? id;
}

export function UserAgentDetailDrawer({ agent }: { agent: UserAgent }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("inspect") === agent.id;

  const closeDrawer = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("inspect");
    const qs = params.toString();
    router.replace(qs ? `/agents?${qs}` : "/agents", { scroll: false });
  }, [router, searchParams]);

  if (!isOpen) return null;
  return <UserAgentDetailDrawerBody agent={agent} onClose={closeDrawer} />;
}

interface DrawerBodyProps {
  agent: UserAgent;
  onClose: () => void;
}

function UserAgentDetailDrawerBody({ agent, onClose }: DrawerBodyProps) {
  const baseline = useSyncExternalStore(
    subscribeAgentAttachments,
    () => getAgentAttachments(agent.id),
    () => agent.initialAttachedTasksetIds as ReadonlyArray<string>,
  );
  const baselineSet = useMemo(() => new Set(baseline), [baseline]);

  const [pendingAdds, setPendingAdds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [pendingRemoves, setPendingRemoves] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [isSaving, setIsSaving] = useState(false);

  const pendingAddCount = pendingAdds.size;
  const pendingRemoveCount = pendingRemoves.size;
  const isDirty = pendingAddCount > 0 || pendingRemoveCount > 0;
  const changeCount = pendingAddCount + pendingRemoveCount;

  const saveButtonLabel = (() => {
    if (isSaving) return "Saving…";
    if (!isDirty) return "Save";
    const noun = changeCount === 1 ? "change" : "changes";
    return `Save (${changeCount} ${noun})`;
  })();

  const committedRows = baseline.filter((tid) => !pendingRemoves.has(tid));
  const pendingAddRows = Array.from(pendingAdds);

  const availableTasksets: ReadonlyArray<Taskset> = useMemo(() => {
    return tasksets.filter((t) => {
      if (pendingAdds.has(t.id)) return false;
      if (baselineSet.has(t.id) && !pendingRemoves.has(t.id)) return false;
      return true;
    });
  }, [baselineSet, pendingAdds, pendingRemoves]);

  const handleMarkRemove = useCallback((tasksetId: string) => {
    setPendingRemoves((prev) => {
      const next = new Set(prev);
      next.add(tasksetId);
      return next;
    });
  }, []);

  const handleUndoAdd = useCallback((tasksetId: string) => {
    setPendingAdds((prev) => {
      const next = new Set(prev);
      next.delete(tasksetId);
      return next;
    });
  }, []);

  const handleSelectStage = useCallback(
    (tasksetId: string) => {
      if (!tasksetId) return;
      if (pendingRemoves.has(tasksetId)) {
        setPendingRemoves((prev) => {
          const next = new Set(prev);
          next.delete(tasksetId);
          return next;
        });
        return;
      }
      if (baselineSet.has(tasksetId)) return;
      setPendingAdds((prev) => {
        const next = new Set(prev);
        next.add(tasksetId);
        return next;
      });
    },
    [baselineSet, pendingRemoves],
  );

  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return;
    const addsArr = Array.from(pendingAdds);
    const removesArr = Array.from(pendingRemoves);
    const addedNames = addsArr.map((id) => tasksetName(id));
    const removedNames = removesArr.map((id) => tasksetName(id));
    setIsSaving(true);
    try {
      await saveAgentAttachments(agent.id, {
        adds: addsArr,
        removes: removesArr,
      });
      toast.success(buildToastMessage(agent.name, addedNames, removedNames));
      setPendingAdds(new Set());
      setPendingRemoves(new Set());
      onClose();
    } finally {
      setIsSaving(false);
    }
  }, [agent.id, agent.name, isDirty, isSaving, onClose, pendingAdds, pendingRemoves]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) return;
      onClose();
    },
    [onClose],
  );

  const provider = inferProviderFromModel(agent.model);
  const KindIcon = KIND_ICON[agent.kind];
  const badgeLabel = KIND_BADGE[agent.kind];

  return (
    <Drawer open onOpenChange={handleOpenChange} direction="right">
      {/* `[&>div]:…` propagates flex sizing through Radix's FocusScope wrapper,
          which would otherwise leave DrawerBody unconstrained and let the body
          content push the footer below the viewport on tall content. */}
      <DrawerContent
        size="lg"
        className="[&>div]:flex [&>div]:h-full [&>div]:min-h-0 [&>div]:flex-col"
      >
        <DrawerHeader>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <DrawerTitle className="font-mono">{agent.name}</DrawerTitle>
            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-muted-surface px-1.5 py-0.5 font-mono text-meta text-muted-foreground">
              <KindIcon aria-hidden="true" className="size-3" />
              {badgeLabel}
            </span>
          </div>
          <DrawerCloseButton aria-label="Close drawer" className="-mt-1" />
        </DrawerHeader>

        <DrawerBody className="pb-8">
          <div className="flex flex-col gap-6 pt-2">
            <PurposeSection
              scenarioId={agent.scenarioId}
              description={agent.description}
            />
            <TasksetsSection
              agentId={agent.id}
              committedRows={committedRows}
              pendingAddRows={pendingAddRows}
              availableTasksets={availableTasksets}
              onSelectStage={handleSelectStage}
              onMarkRemove={handleMarkRemove}
              onUndoAdd={handleUndoAdd}
            />
          </div>
        </DrawerBody>

        <DrawerFooter className="flex-col items-stretch justify-start gap-3 border-t border-border">
          <PendingNote
            pendingAddCount={pendingAddCount}
            pendingRemoveCount={pendingRemoveCount}
          />
          {/* UserAgent has no `costPerRun` field; pass null so the cost row renders the "—" tooltip. */}
          <FooterMetadata
            model={agent.model}
            provider={provider}
            costPerRun={null}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              aria-disabled={!isDirty || isSaving}
            >
              {saveButtonLabel}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface PendingNoteProps {
  pendingAddCount: number;
  pendingRemoveCount: number;
}

function PendingNote({ pendingAddCount, pendingRemoveCount }: PendingNoteProps) {
  return (
    <div role="status" aria-live="polite" className="min-w-0">
      <PendingNoteMessage
        pendingAddCount={pendingAddCount}
        pendingRemoveCount={pendingRemoveCount}
      />
    </div>
  );
}

function PendingNoteMessage({
  pendingAddCount,
  pendingRemoveCount,
}: PendingNoteProps) {
  const total = pendingAddCount + pendingRemoveCount;
  if (total === 0) return null;
  const parts: string[] = [];
  if (pendingAddCount > 0) {
    const word = pendingAddCount === 1 ? "taskset" : "tasksets";
    parts.push(`attach ${pendingAddCount} ${word}`);
  }
  if (pendingRemoveCount > 0) {
    const word = pendingRemoveCount === 1 ? "taskset" : "tasksets";
    parts.push(`detach ${pendingRemoveCount} ${word}`);
  }
  const body = `Will ${parts.join(", ")} on save`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block truncate text-body text-foreground">
          {body}
        </span>
      </TooltipTrigger>
      <TooltipContent variant="truncation">{body}</TooltipContent>
    </Tooltip>
  );
}

