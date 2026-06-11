"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, CircleHelp, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/empty-state";
import { SearchInput } from "@repo/ui/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
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

type SortKey = "newest" | "oldest" | "name-asc";

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A–Z" },
];

type TabKey = "all" | AgentKind;

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
  const [tab, setTab] = useState<TabKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");

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
      all: matching,
      qa: matching.filter((a) => a.kind === "qa"),
      automation: matching.filter((a) => a.kind === "automation"),
      chat: matching.filter((a) => a.kind === "chat"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAgents, q]);

  const sortedVisibleUserAgents = useMemo(() => {
    const list = [...userByKind[tab]];
    return list.sort((a, b) => {
      switch (sort) {
        case "newest":
          return a.createdOrder - b.createdOrder;
        case "oldest":
          return b.createdOrder - a.createdOrder;
        case "name-asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [userByKind, tab, sort]);

  return (
    <div className="flex flex-col gap-8 px-8 py-6">
      <InspectDrawerMount presetAgents={presetAgents} userAgents={userAgents} />
      <NewAgentDrawer />
      <header className="flex flex-col gap-4">
        <h1 className="text-display font-medium text-foreground">Agents</h1>

        <p className="max-w-2xl text-body">
          Agents connect a model to an environment scenario. Create automations
          for CI, QA agents for taskset analysis, or chat agents for interactive
          conversations.
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
          <NewAgentButton />
        </div>
      </header>

      <PresetSection presets={filteredPresets} hasQuery={q !== ""} />

      <UserSection
        agents={sortedVisibleUserAgents}
        tab={tab}
        onTabChange={setTab}
        sort={sort}
        onSortChange={setSort}
        counts={{
          all: userByKind.all.length,
          qa: userByKind.qa.length,
          automation: userByKind.automation.length,
          chat: userByKind.chat.length,
        }}
        hasUserAgentsAtAll={userAgents.length > 0}
        hasQuery={q !== ""}
      />
    </div>
  );
}

function PresetSection({
  presets,
  hasQuery,
}: {
  presets: ReadonlyArray<PresetAgent>;
  hasQuery: boolean;
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
              <PresetAgentCard agent={p} />
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
  sort: SortKey;
  onSortChange: (next: SortKey) => void;
  counts: Record<TabKey, number>;
  hasUserAgentsAtAll: boolean;
  hasQuery: boolean;
}

function UserSection({
  agents,
  tab,
  onTabChange,
  sort,
  onSortChange,
  counts,
  hasUserAgentsAtAll,
  hasQuery,
}: UserSectionProps) {
  return (
    <section aria-labelledby="your-agents-heading" className="flex flex-col gap-3">
      <h2
        id="your-agents-heading"
        className="text-subtitle font-semibold text-foreground"
      >
        My Agents
      </h2>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as TabKey)}
          className="gap-0"
        >
          <TabsList variant="underline">
            <TabsTrigger value="all">
              All
              <TabCount value={counts.all} />
            </TabsTrigger>
            <TabsTrigger value="qa">
              QA
              <TabCount value={counts.qa} />
            </TabsTrigger>
            <TabsTrigger value="automation">
              Automations
              <TabCount value={counts.automation} />
            </TabsTrigger>
            <TabsTrigger value="chat">
              Chat
              <TabCount value={counts.chat} />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={sort}
          onValueChange={(v) => onSortChange(v as SortKey)}
        >
          <SelectTrigger size="sm" aria-label="Sort agents" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <UserResults
        agents={agents}
        tab={tab}
        hasUserAgentsAtAll={hasUserAgentsAtAll}
        hasQuery={hasQuery}
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
}: {
  agents: ReadonlyArray<UserAgent>;
  tab: TabKey;
  hasUserAgentsAtAll: boolean;
  hasQuery: boolean;
}) {
  if (agents.length > 0) {
    return (
      <ul
        aria-label="Your Agents"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {agents.map((a) => (
          <li key={a.id} className="flex">
            <UserAgentCard agent={a} />
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

function NewAgentButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("create", "");
    router.replace(`/agents?${params.toString()}`, { scroll: false });
  };
  return (
    <Button variant="primary" size="sm" onClick={handleClick}>
      <Plus aria-hidden="true" />
      New Agent
    </Button>
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
  all: "",
  qa: "QA",
  automation: "Automation",
  chat: "Chat",
};

const CLI_BY_TAB: Record<TabKey, string> = {
  all: "hud agent create --type qa",
  qa: "hud agent create --type qa --scenario trace-explorer:failure_analysis",
  automation: "hud agent create --type automation --scenario trace-explorer:prompt_alignment_analysis",
  chat: "hud agent create --type chat --scenario trace-explorer:failure_analysis",
};
