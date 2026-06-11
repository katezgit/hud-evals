"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
import type { Environment, Scenario } from "../_data/types";
import { BuildsTab } from "./builds-tab";
import { EnvDetailHeader } from "./env-detail-header";
import { EnvVarsStoreProvider } from "./env-vars-store";
import { InstancesTab } from "./instances-tab";
import { OverviewTab } from "./overview-tab";
import { RunScenarioDrawer } from "./run-scenario-drawer";
import { ScenariosTab } from "./scenarios-tab";
import { SettingsTab } from "./settings-tab";

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
      <div className="flex min-h-full flex-col px-8">
        <Tabs
          value={activeTab}
          onValueChange={(next) => setActiveTab(next as TabKey)}
          className="flex flex-1 min-w-0 flex-col gap-0"
        >
          <div
            // Sticky block (breadcrumb · name+actions · tab strip) pinned to the
            // top of the (app) scroll container. The tab strip's underline
            // lives on `TabsList` itself (which is `w-fit`), so no wrapper
            // border here.
            //
            // pt-6 lives INSIDE the sticky element (not on the page wrap) so
            // the sticky's natural top edge sits at scroll y=0; otherwise the
            // 24px outer padding would push the sticky element to y=24 and it
            // would visibly creep upward during scroll 0→24 before pinning.
            //
            // `z-sticky` paints above tab-content content and any raw
            // `z-10`/`z-20` inside tab panels (e.g. `Card` descendants with
            // `position: relative`), and below all overlays. Portaled
            // dialogs/drawers still win.
            className={cn("sticky top-0 z-sticky bg-background pt-6")}
          >
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
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
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

          <TabsContent value="overview" className="pt-6">
            <OverviewTab
              env={env}
              loadedScenarioId={openScenario?.id ?? null}
              onLoadScenario={setOpenScenario}
              onSwitchToScenariosTab={() => setActiveTab("scenarios")}
            />
          </TabsContent>

          {env.tabs.scenarios && (
            <TabsContent value="scenarios" className="pt-6">
              <ScenariosTab
                env={env}
                loadedScenarioId={openScenario?.id ?? null}
                onLoadScenario={setOpenScenario}
              />
            </TabsContent>
          )}

          {env.tabs.builds && (
            <TabsContent value="builds" className="pt-6">
              <BuildsTab builds={env.builds} />
            </TabsContent>
          )}

          {env.tabs.instances && (
            <TabsContent value="instances" className="pt-6">
              <InstancesTab envId={env.id} instances={env.instances} />
            </TabsContent>
          )}

          <TabsContent value="settings" className="pt-6">
            <SettingsTab env={env} />
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
