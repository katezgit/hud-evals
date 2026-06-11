"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
import { usePageScrolled } from "@repo/libs/hooks";
import type { Taskset } from "@/lib/mock/tasksets";
import JobsTab from "./jobs-tab";
import OverviewTab from "./overview-tab";
import PerformanceTab from "./performance-tab";
import SettingsTab from "./settings-tab";
import TasksTab from "./tasks-tab";
import TasksetDetailHeader from "./taskset-detail-header";

const TAB_KEYS = ["overview", "tasks", "jobs", "performance", "settings"] as const;
type TabKey = (typeof TAB_KEYS)[number];

function parseTab(v: string | null): TabKey {
  return (TAB_KEYS as ReadonlyArray<string>).includes(v ?? "")
    ? (v as TabKey)
    : "overview";
}

interface TasksetDetailProps {
  taskset: Taskset;
}

export default function TasksetDetail({ taskset }: TasksetDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  const stickyRef = useRef<HTMLDivElement>(null);
  const scrolled = usePageScrolled({ ref: stickyRef });

  const handleTabChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(
      qs ? `/tasksets/${taskset.id}?${qs}` : `/tasksets/${taskset.id}`,
      { scroll: false },
    );
  };

  return (
    <div className="flex min-h-full flex-col px-4 md:px-8">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-1 min-w-0 flex-col gap-0"
      >
        <div
          ref={stickyRef}
          // Sticky block — header + tab strip pinned to the top of the (app)
          // scroll container.
          //
          // pt-6 lives INSIDE the sticky element (not on the page wrap) so the
          // sticky's natural top edge sits at scroll y=0; otherwise the 24px
          // outer padding would push the sticky element to y=24 and it would
          // visibly creep upward during scroll 0→24 before pinning.
          //
          // `z-page-chrome` (=20) paints above tab-content stickies
          // (`z-sticky`=10) and any raw `z-10`/`z-20` inside tab panels
          // (e.g. the Performance tab's compare-configs sticky-left columns,
          // the Jobs tab's filter bar), and below all overlays (`z-overlay`=50).
          // Portaled dialogs/drawers are rooted to <body> and still win.
          // Tiered tokens live in `packages/ui/src/styles/primitive.css`.
          className={cn(
            "sticky top-0 z-page-chrome bg-background pt-6",
            // Scroll-cue: border slot is always occupied (border-b) so flipping
            // border-color does not shift layout. Pattern mirrors DialogHeader.
            "border-b",
            scrolled ? "border-border" : "border-transparent",
            scrolled ? "shadow-scroll-cue" : "shadow-none",
            "transition-[border-color,box-shadow] prop-(--motion-state-change)",
          )}
        >
          <TasksetDetailHeader taskset={taskset} />
          <TabsList variant="underline" className="border-b-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="pt-6">
          <OverviewTab taskset={taskset} />
        </TabsContent>
        <TabsContent value="tasks" className="pt-6">
          <TasksTab taskset={taskset} />
        </TabsContent>
        <TabsContent value="jobs" className="pt-6">
          <JobsTab taskset={taskset} />
        </TabsContent>
        <TabsContent value="performance" className="pt-6">
          <PerformanceTab taskset={taskset} />
        </TabsContent>
        <TabsContent value="settings" className="pt-6">
          <SettingsTab taskset={taskset} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
