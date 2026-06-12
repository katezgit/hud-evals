"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, CircleHelp, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import { SearchInput } from "@repo/ui/components/search-input";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { usePageScrolled } from "@repo/libs/hooks";
import {
  type AgentKind,
  type PresetAgent,
  type UserAgent,
  getUserAgents,
  subscribeUserAgents,
} from "@/lib/mock/agents";
import { NewAgentDrawer } from "./new-agent-drawer";
import { PresetAgentCard } from "./preset-agent-card";
import { PresetAgentDetailDrawer } from "./preset-agent-detail-drawer";
import { UserAgentCard } from "./user-agent-card";
import { UserAgentDetailDrawer } from "./user-agent-detail-drawer";

type TabKey = AgentKind;

interface AgentsCatalogProps {
  presetAgents: ReadonlyArray<PresetAgent>;
  userAgents: ReadonlyArray<UserAgent>;
}

export function AgentsCatalog({
  presetAgents,
  userAgents: seedUserAgents,
}: AgentsCatalogProps) {
  // Subscribe to the live store so newly-created agents from the +New Agent
  // drawer appear immediately. Server-rendered seed is used as the initial
  // value and as the SSR snapshot.
  const userAgents = useSyncExternalStore(
    subscribeUserAgents,
    getUserAgents,
    () => seedUserAgents,
  );
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("automation");

  const searchParams = useSearchParams();
  const inspectId = searchParams.get("inspect");

  const stickyRef = useRef<HTMLDivElement>(null);
  const scrolled = usePageScrolled({ ref: stickyRef });

  const q = query.trim().toLowerCase();

  const matchesQuery = (
    a: { name: string; description: string; scenarioId: string; model: string },
  ) => {
    if (q === "") return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.scenarioId.toLowerCase().includes(q) ||
      a.model.toLowerCase().includes(q)
    );
  };

  const filteredPresets = useMemo(
    () => presetAgents.filter(matchesQuery),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matchesQuery closes over q only
    [presetAgents, q],
  );

  const userByKind = useMemo(() => {
    const matching = userAgents.filter(matchesQuery);
    return {
      qa: matching.filter((a) => a.kind === "qa"),
      automation: matching.filter((a) => a.kind === "automation"),
      chat: matching.filter((a) => a.kind === "chat"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAgents, q]);

  return (
    <div className="flex min-h-full flex-col">
      <InspectDrawerMount presetAgents={presetAgents} userAgents={userAgents} />
      <NewAgentDrawer />
      <div
        ref={stickyRef}
        className={cn(
          "sticky top-0 z-page-chrome bg-background pt-6",
          "border-b",
          scrolled ? "border-border" : "border-transparent",
          scrolled ? "shadow-scroll-cue" : "shadow-none",
          "transition-[border-color,box-shadow] prop-(--motion-state-change)",
        )}
      >
        <div className="page-shell block py-0">
          <header className="flex flex-col gap-4 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-display font-medium text-foreground">Agents</h1>
              <div className="sm:hidden">
                <NewAgentIconButton />
              </div>
            </div>

            <p className="max-w-2xl text-body">
              Agents connect a model to an environment scenario. Create
              automations for CI, QA agents for taskset analysis, or chat agents
              for interactive conversations.
            </p>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="w-full max-w-sm">
                <SearchInput
                  size="sm"
                  defaultValue=""
                  onValueChange={setQuery}
                  placeholder="Search agents…"
                  aria-label="Search agents"
                />
              </div>
              <div className="hidden sm:block">
                <NewAgentButton />
              </div>
            </div>
          </header>
        </div>
      </div>

      <div className="page-shell">
        <PresetSection
          presets={filteredPresets}
          hasQuery={q !== ""}
          inspectId={inspectId}
        />

        <UserSection
          agents={userByKind[tab]}
          tab={tab}
          onTabChange={setTab}
          counts={{
            qa: userByKind.qa.length,
            automation: userByKind.automation.length,
            chat: userByKind.chat.length,
          }}
          hasUserAgentsAtAll={userAgents.length > 0}
          hasQuery={q !== ""}
          inspectId={inspectId}
        />
      </div>
    </div>
  );
}

function PresetSection({
  presets,
  hasQuery,
  inspectId,
}: {
  presets: ReadonlyArray<PresetAgent>;
  hasQuery: boolean;
  inspectId: string | null;
}) {
  return (
    <section aria-labelledby="standard-agents-heading" className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <h2
          id="standard-agents-heading"
          className="text-subtitle font-semibold text-foreground"
        >
          Built-in QA Agents
        </h2>
        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-label="About Built-in QA Agents"
            className="inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring outline-hidden"
          >
            <CircleHelp aria-hidden="true" className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>
            Configuration is fixed. Attach to a taskset to run.
          </TooltipContent>
        </Tooltip>
      </div>

      {presets.length === 0 ? (
        <p className="text-body text-muted-foreground">
          {hasQuery
            ? "No built-in agents match."
            : "No built-in agents available."}
        </p>
      ) : (
        <ul
          aria-label="Built-in QA Agents"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {presets.map((p) => (
            <li key={p.id} className="flex">
              <PresetAgentCard agent={p} selected={p.id === inspectId} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface UserSectionProps {
  agents: ReadonlyArray<UserAgent>;
  tab: TabKey;
  onTabChange: (next: TabKey) => void;
  counts: Record<TabKey, number>;
  hasUserAgentsAtAll: boolean;
  hasQuery: boolean;
  inspectId: string | null;
}

function UserSection({
  agents,
  tab,
  onTabChange,
  counts,
  hasUserAgentsAtAll,
  hasQuery,
  inspectId,
}: UserSectionProps) {
  return (
    <section aria-labelledby="your-agents-heading" className="flex flex-col gap-3">
      <h2
        id="your-agents-heading"
        className="text-subtitle font-semibold text-foreground"
      >
        My Agents
      </h2>

      <Tabs
        value={tab}
        onValueChange={(v) => onTabChange(v as TabKey)}
        className="gap-0"
      >
        <TabsList variant="underline">
          <TabsTrigger value="automation">
            Automations
            <TabCount value={counts.automation} />
          </TabsTrigger>
          <TabsTrigger value="chat">
            Chat
            <TabCount value={counts.chat} />
          </TabsTrigger>
          <TabsTrigger value="qa">
            QA
            <TabCount value={counts.qa} />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <UserResults
        agents={agents}
        tab={tab}
        hasUserAgentsAtAll={hasUserAgentsAtAll}
        hasQuery={hasQuery}
        inspectId={inspectId}
      />
    </section>
  );
}

function TabCount({ value }: { value: number }) {
  return (
    <span className="ml-1.5 font-mono text-caption tabular-nums text-muted-foreground">
      {value}
    </span>
  );
}

function UserResults({
  agents,
  tab,
  hasUserAgentsAtAll,
  hasQuery,
  inspectId,
}: {
  agents: ReadonlyArray<UserAgent>;
  tab: TabKey;
  hasUserAgentsAtAll: boolean;
  hasQuery: boolean;
  inspectId: string | null;
}) {
  if (agents.length > 0) {
    return (
      <ul
        aria-label="Your Agents"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {agents.map((a) => (
          <li key={a.id} className="flex">
            <UserAgentCard agent={a} selected={a.id === inspectId} />
          </li>
        ))}
      </ul>
    );
  }

  // Empty: search active and matched zero — show muted one-liner.
  if (hasQuery) {
    return (
      <p className="text-body text-muted-foreground">
        No agents match your search.
      </p>
    );
  }

  // Empty: no user agents at all (any tab) — show the canonical zero state.
  if (!hasUserAgentsAtAll) {
    return <ZeroUserAgents />;
  }

  // Has user agents, but selected sub-tab is empty.
  return <ZeroOfKind tab={tab} />;
}

function ZeroUserAgents() {
  return (
    <EmptyState
      variant="zero-state"
      icon={Bot}
      title="No agents yet"
      subtitle="Create one from the CLI:"
      cta={
        <pre className="rounded-md border border-border bg-muted-surface px-3 py-2 font-mono text-code text-foreground">
          {`hud agent create --type qa\nhud agent create --type automation`}
        </pre>
      }
    />
  );
}

function ZeroOfKind({ tab }: { tab: TabKey }) {
  const cmd = CLI_BY_TAB[tab];
  return (
    <EmptyState
      variant="zero-state"
      icon={Bot}
      title={`No ${LABEL_BY_TAB[tab]} agents yet`}
      subtitle="Create one from the CLI:"
      cta={
        <pre className="rounded-md border border-border bg-muted-surface px-3 py-2 font-mono text-code text-foreground">
          {cmd}
        </pre>
      }
    />
  );
}

function useOpenNewAgentDrawer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  return () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("create", "");
    router.replace(`/agents?${params.toString()}`, { scroll: false });
  };
}

function NewAgentButton() {
  const handleClick = useOpenNewAgentDrawer();
  return (
    <Button variant="primary" size="sm" onClick={handleClick}>
      <Plus aria-hidden="true" />
      Add Agent
    </Button>
  );
}

function NewAgentIconButton() {
  const handleClick = useOpenNewAgentDrawer();
  return (
    <IconButton
      variant="primary"
      size="sm"
      aria-label="Add Agent"
      onClick={handleClick}
    >
      <Plus aria-hidden="true" />
    </IconButton>
  );
}

function InspectDrawerMount({
  presetAgents,
  userAgents,
}: {
  presetAgents: ReadonlyArray<PresetAgent>;
  userAgents: ReadonlyArray<UserAgent>;
}) {
  const searchParams = useSearchParams();
  const inspectId = searchParams.get("inspect");
  if (!inspectId) return null;
  const preset = presetAgents.find((a) => a.id === inspectId);
  if (preset) return <PresetAgentDetailDrawer agent={preset} />;
  const userAgent = userAgents.find((a) => a.id === inspectId);
  if (userAgent) return <UserAgentDetailDrawer agent={userAgent} />;
  return null;
}

const LABEL_BY_TAB: Record<TabKey, string> = {
  qa: "QA",
  automation: "Automation",
  chat: "Chat",
};

const CLI_BY_TAB: Record<TabKey, string> = {
  qa: "hud agent create --type qa --scenario trace-explorer:failure_analysis",
  automation: "hud agent create --type automation --scenario trace-explorer:prompt_alignment_analysis",
  chat: "hud agent create --type chat --scenario trace-explorer:failure_analysis",
};
