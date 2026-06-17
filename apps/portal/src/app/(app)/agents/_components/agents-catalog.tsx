"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/empty-state";
import { IconButton } from "@repo/ui/components/icon-button";
import { SearchInput } from "@repo/ui/components/search-input";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
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

type TabKey = "all" | AgentKind;

interface AgentsCatalogProps {
  presetAgents: ReadonlyArray<PresetAgent>;
  userAgents: ReadonlyArray<UserAgent>;
}

// Discriminated union — both card variants render through one grid pass.
type CatalogEntry =
  | { variant: "preset"; agent: PresetAgent; kind: "qa" }
  | { variant: "user"; agent: UserAgent; kind: AgentKind };

export function AgentsCatalog({
  presetAgents,
  userAgents: seedUserAgents,
}: AgentsCatalogProps) {
  // Subscribe to the live store so newly-created agents from the create drawer
  // appear immediately. Server-rendered seed is the initial + SSR snapshot.
  const userAgents = useSyncExternalStore(
    subscribeUserAgents,
    getUserAgents,
    () => seedUserAgents,
  );
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("all");

  const searchParams = useSearchParams();
  const inspectId = searchParams.get("inspect");

  const stickyRef = useRef<HTMLDivElement>(null);
  const scrolled = usePageScrolled({ ref: stickyRef });

  const q = query.trim().toLowerCase();

  // Merge presets + user agents into one search-filtered universe.
  // Built-in (preset) always sorts first; user agents follow by createdOrder.
  const universe: ReadonlyArray<CatalogEntry> = useMemo(() => {
    const matches = (text: string) => text.toLowerCase().includes(q);
    const matchesAny = (
      a: { name: string; description: string; scenarioId: string; model: string },
    ) =>
      q === "" ||
      matches(a.name) ||
      matches(a.description) ||
      matches(a.scenarioId) ||
      matches(a.model);

    const presetEntries: CatalogEntry[] = presetAgents
      .filter(matchesAny)
      .map((p) => ({ variant: "preset", agent: p, kind: "qa" }));

    const userEntries: CatalogEntry[] = [...userAgents]
      .sort((a, b) => a.createdOrder - b.createdOrder)
      .filter(matchesAny)
      .map((u) => ({ variant: "user", agent: u, kind: u.kind }));

    return [...presetEntries, ...userEntries];
  }, [presetAgents, userAgents, q]);

  const counts = useMemo(
    () => ({
      all: universe.length,
      qa: universe.filter((e) => e.kind === "qa").length,
      automation: universe.filter((e) => e.kind === "automation").length,
      chat: universe.filter((e) => e.kind === "chat").length,
    }),
    [universe],
  );

  const visible = useMemo(
    () => (tab === "all" ? universe : universe.filter((e) => e.kind === tab)),
    [universe, tab],
  );

  return (
    <div className="flex min-h-full flex-col">
      <InspectDrawerMount presetAgents={presetAgents} userAgents={userAgents} />
      <NewAgentDrawer />
      <div
        ref={stickyRef}
        className={cn(
          "sticky top-0 z-page-chrome bg-panel pt-6",
          "border-b",
          scrolled ? "border-border" : "border-transparent",
          scrolled ? "shadow-scroll-cue" : "shadow-none",
          "transition-[border-color,box-shadow] prop-(--motion-state-change)",
        )}
      >
        <div className="page-shell block py-0">
          <header className="flex flex-col gap-4 pb-6">
            <div className="page-header">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-display font-medium text-foreground">Agents</h1>
                <div className="hidden sm:block">
                  <NewAgentButton />
                </div>
                <div className="sm:hidden">
                  <NewAgentIconButton />
                </div>
              </div>

              <p className="max-w-2xl text-body text-muted-foreground">
                Agents connect a model to an environment scenario. Run QA on
                tasksets, automations on CI, or chat for interactive sessions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="w-full max-w-sm">
                <SearchInput
                  defaultValue=""
                  onValueChange={setQuery}
                  placeholder="Search agents…"
                  aria-label="Search agents"
                />
              </div>
              <SegmentedControl
                value={tab}
                onValueChange={(v) => setTab(v as TabKey)}
                aria-label="Filter by agent kind"
              >
                <SegmentedControl.Item value="all">
                  <SegmentLabel label="All" count={counts.all} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="qa">
                  <SegmentLabel label="QA" count={counts.qa} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="automation">
                  <SegmentLabel label="Automation" count={counts.automation} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="chat">
                  <SegmentLabel label="Chat" count={counts.chat} />
                </SegmentedControl.Item>
              </SegmentedControl>
            </div>
          </header>
        </div>
      </div>

      <div className="page-shell">
        <AgentGrid
          entries={visible}
          tab={tab}
          inspectId={inspectId}
          hasQuery={q !== ""}
        />
      </div>
    </div>
  );
}

function SegmentLabel({ label, count }: { label: string; count: number }) {
  return (
    <>
      {label}
      <span className="font-mono text-meta tabular-nums text-muted-foreground">
        {count}
      </span>
    </>
  );
}

function AgentGrid({
  entries,
  tab,
  inspectId,
  hasQuery,
}: {
  entries: ReadonlyArray<CatalogEntry>;
  tab: TabKey;
  inspectId: string | null;
  hasQuery: boolean;
}) {
  if (entries.length > 0) {
    return (
      <ul
        aria-label="Agents"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {entries.map((e) =>
          e.variant === "preset" ? (
            <li key={e.agent.id} className="flex">
              <PresetAgentCard
                agent={e.agent}
                selected={e.agent.id === inspectId}
              />
            </li>
          ) : (
            <li key={e.agent.id} className="flex">
              <UserAgentCard
                agent={e.agent}
                selected={e.agent.id === inspectId}
              />
            </li>
          ),
        )}
      </ul>
    );
  }

  if (hasQuery) {
    return (
      <p className="text-body text-muted-foreground">
        No agents match your search.
      </p>
    );
  }

  return <ZeroForTab tab={tab} />;
}

function ZeroForTab({ tab }: { tab: TabKey }) {
  // `all` and `qa` can't be empty without a query — built-ins always exist.
  // Only `automation` and `chat` reach this state (when user has none of that kind).
  const cmd =
    tab === "chat"
      ? "hud agent create --type chat"
      : tab === "automation"
        ? "hud agent create --type automation"
        : "hud agent create --type qa";
  const label =
    tab === "all"
      ? ""
      : tab === "automation"
        ? "automation"
        : tab === "chat"
          ? "chat"
          : "QA";
  return (
    <EmptyState
      variant="zero-state"
      icon={Bot}
      title={tab === "all" ? "No agents yet" : `No ${label} agents yet`}
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
    <Button variant="primary" onClick={handleClick}>
      <Plus aria-hidden="true" />
      Create Agent
    </Button>
  );
}

function NewAgentIconButton() {
  const handleClick = useOpenNewAgentDrawer();
  return (
    <IconButton
      variant="primary"
      size="sm"
      aria-label="Create Agent"
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
