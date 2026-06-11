"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import type { AgentKind } from "@/lib/mock/agents";

import { AutomationForm } from "./new-agent/automation-form";
import { ChatAgentForm } from "./new-agent/chat-agent-form";
import { NewAgentTypeSelector } from "./new-agent/type-selector";
import { QaAgentForm } from "./new-agent/qa-agent-form";

const PARAM = "create";

type Step = "select" | AgentKind;

function parseStep(value: string | null): Step | null {
  if (value === null) return null;
  if (value === "") return "select";
  if (value === "automation" || value === "qa" || value === "chat") return value;
  // Unknown value — treat as type-selector to avoid blank state.
  return "select";
}

const TITLE: Record<Step, string> = {
  select: "New Agent",
  automation: "New Automation",
  qa: "New QA Agent",
  chat: "New Chat Agent",
};

const SUBTITLE: Record<Step, string> = {
  select: "Choose the type of agent you want to create.",
  automation: "Select an environment, then pick a scenario and model.",
  qa: "Pick a workflow scenario, then choose a model.",
  chat: "Pick an environment and a model.",
};

export function NewAgentDrawer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseStep(searchParams.get(PARAM));
  const isOpen = step !== null;

  const setParam = useCallback(
    (value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(PARAM);
      } else {
        params.set(PARAM, value);
      }
      const qs = params.toString();
      router.replace(qs ? `/agents?${qs}` : "/agents", { scroll: false });
    },
    [router, searchParams],
  );

  const close = useCallback(() => setParam(null), [setParam]);

  if (!isOpen) return null;
  return <NewAgentDrawerBody step={step} setParam={setParam} close={close} />;
}

interface BodyProps {
  step: Step;
  setParam: (value: string | null) => void;
  close: () => void;
}

function NewAgentDrawerBody({ step, setParam, close }: BodyProps) {
  // All four exit paths (×, Esc, backdrop, Cancel) silent-close — dirty form
  // values are discarded without a confirm prompt.

  const handleSelectType = useCallback(
    (kind: AgentKind) => setParam(kind),
    [setParam],
  );

  const handleBack = useCallback(() => setParam(""), [setParam]);

  const handleCreated = useCallback(() => setParam(null), [setParam]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) return;
      close();
    },
    [close],
  );

  return (
    <Drawer open onOpenChange={handleOpenChange} direction="right">
      <DrawerContent size="lg">
        <DrawerHeader>
          <div className="flex min-w-0 flex-col gap-1">
            <DrawerTitle>{TITLE[step]}</DrawerTitle>
            <DrawerDescription>{SUBTITLE[step]}</DrawerDescription>
          </div>
          <DrawerCloseButton aria-label="Close drawer" className="-mt-1" />
        </DrawerHeader>

        <DrawerBody>
          <div className="flex h-full flex-col pt-2">
            <StepBody
              step={step}
              onSelectType={handleSelectType}
              onBack={handleBack}
              onCancel={close}
              onCreated={handleCreated}
            />
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

interface StepBodyProps {
  step: Step;
  onSelectType: (kind: AgentKind) => void;
  onBack: () => void;
  onCancel: () => void;
  onCreated: () => void;
}

// Key by step so React unmounts the form when the user goes back to the
// type-selector or switches type — guarantees state isolation per type.
function StepBody({
  step,
  onSelectType,
  onBack,
  onCancel,
  onCreated,
}: StepBodyProps) {
  if (step === "select") {
    return <NewAgentTypeSelector key={step} onSelect={onSelectType} />;
  }
  if (step === "automation") {
    return (
      <AutomationForm
        key={step}
        onBack={onBack}
        onCancel={onCancel}
        onCreated={onCreated}
      />
    );
  }
  if (step === "qa") {
    return (
      <QaAgentForm
        key={step}
        onBack={onBack}
        onCancel={onCancel}
        onCreated={onCreated}
      />
    );
  }
  return (
    <ChatAgentForm
      key={step}
      onBack={onBack}
      onCancel={onCancel}
      onCreated={onCreated}
    />
  );
}
