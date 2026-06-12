"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
import { usePageScrolled } from "@repo/libs/hooks";
import type { Environment, Scenario } from "../_data/types";
import { BuildsTab } from "./builds-tab";
import { EnvDetailHeader } from "./env-detail-header";
import { EnvVarsStoreProvider } from "./env-vars-store";
import { InstancesTab } from "./instances-tab";
import { OverviewTab } from "./overview-tab";
import { RunScenarioDrawer } from "./run-scenario-drawer";
import { ScenariosTab } from "./scenarios-tab";
import { SettingsTab } from "./settings-tab";

/**
 * Inline count badge for tab labels. Teal-tinted on the active tab to align
 * with the active underline + label color; neutral muted on inactive.
 */
function TabCountBadge({
  count,
  active,
}: {
  count: number;
  active: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5",
        "font-mono text-meta tabular-nums",
        active
          ? "bg-primary-soft text-primary"
          : "bg-muted text-meta-foreground",
      )}
    >
      {count}
    </span>
  );
}

const TAB_KEYS = [
  "overview",
  "scenarios",
  "builds",
  "instances",
  "settings",
] as const;
type TabKey = (typeof TAB_KEYS)[number];

function parseTab(v: string | null): TabKey {
  return (TAB_KEYS as ReadonlyArray<string>).includes(v ?? "")
    ? (v as TabKey)
    : "overview";
}

export function EnvDetailShell({ env }: { env: Environment }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  // Run-scenario drawer is page-level so it persists across tab switches and
  // doesn't unmount when the user moves between Overview and Scenarios. null
  // doubles as "closed" — no parallel `open` boolean.
  const [openScenario, setOpenScenario] = useState<Scenario | null>(null);

  const stickyRef = useRef<HTMLDivElement>(null);
  const scrolled = usePageScrolled({ ref: stickyRef });

  function setActiveTab(next: TabKey) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(
      qs ? `/environments/${env.id}?${qs}` : `/environments/${env.id}`,
      { scroll: false },
    );
  }

  return (
    <EnvVarsStoreProvider vars={env.vars}>
      <div className="flex min-h-full flex-col">
        <Tabs
          value={activeTab}
          onValueChange={(next) => setActiveTab(next as TabKey)}
          className="flex flex-1 min-w-0 flex-col gap-0"
        >
          <div
            ref={stickyRef}
            // Sticky block (breadcrumb · name+actions · tab strip) pinned to the
            // top of the (app) scroll container. The tab strip's underline
            // lives on `TabsList` itself (which is `w-fit`), so the scroll-cue
            // border-b on this wrapper paints at the bottom of the whole band.
            //
            // pt-6 lives INSIDE the sticky element (not on the page wrap) so
            // the sticky's natural top edge sits at scroll y=0; otherwise the
            // 24px outer padding would push the sticky element to y=24 and it
            // would visibly creep upward during scroll 0→24 before pinning.
            //
            // `z-page-chrome` (=20) paints above tab-content stickies
            // (`z-sticky`=10) and any raw `z-10`/`z-20` inside tab panels
            // (e.g. `Card` descendants with `position: relative`), and below
            // all overlays. Portaled dialogs/drawers still win.
            //
            // Chrome (bg + border + shadow) is FULL-BLEED across <main>; only
            // the visible header content is capped at 1536 via the inner
            // wrapper. See docs/design/guidelines/app-shell-layout.md §2.
            className={cn(
              "sticky top-0 z-page-chrome bg-background pt-6",
              // Scroll-cue: border slot is always occupied (border-b) so
              // flipping border-color does not shift layout. Mirrors DialogHeader.
              "border-b",
              scrolled ? "border-border" : "border-transparent",
              scrolled ? "shadow-scroll-cue" : "shadow-none",
              "transition-[border-color,box-shadow] prop-(--motion-state-change)",
            )}
          >
            <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 xl:px-20">
              <EnvDetailHeader
                name={env.name}
                type={env.type}
                slug={env.id}
                organization={env.organization}
                visibility={env.visibility}
              />
              <TabsList variant="underline">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {env.tabs.scenarios && (
                  <TabsTrigger value="scenarios">
                    Scenarios
                    <TabCountBadge
                      count={env.scenarios.length}
                      active={activeTab === "scenarios"}
                    />
                  </TabsTrigger>
                )}
                {env.tabs.builds && (
                  <TabsTrigger value="builds">Builds</TabsTrigger>
                )}
                {env.tabs.instances && (
                  <TabsTrigger value="instances">Instances</TabsTrigger>
                )}
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="pt-6">
            <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 xl:px-20">
              <OverviewTab
                env={env}
                loadedScenarioId={openScenario?.id ?? null}
                onLoadScenario={setOpenScenario}
                onSwitchToScenariosTab={() => setActiveTab("scenarios")}
              />
            </div>
          </TabsContent>

          {env.tabs.scenarios && (
            <TabsContent value="scenarios" className="pt-6">
              <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 xl:px-20">
                <ScenariosTab
                  env={env}
                  loadedScenarioId={openScenario?.id ?? null}
                  onLoadScenario={setOpenScenario}
                />
              </div>
            </TabsContent>
          )}

          {env.tabs.builds && (
            <TabsContent value="builds" className="pt-6">
              <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 xl:px-20">
                <BuildsTab builds={env.builds} />
              </div>
            </TabsContent>
          )}

          {env.tabs.instances && (
            <TabsContent value="instances" className="pt-6">
              <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 xl:px-20">
                <InstancesTab envId={env.id} instances={env.instances} />
              </div>
            </TabsContent>
          )}

          <TabsContent value="settings" className="pt-6">
            <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 xl:px-20">
              <SettingsTab env={env} />
            </div>
          </TabsContent>
        </Tabs>

        <RunScenarioDrawer
          scenario={openScenario}
          env={env}
          onClose={() => setOpenScenario(null)}
        />
      </div>
    </EnvVarsStoreProvider>
  );
}
