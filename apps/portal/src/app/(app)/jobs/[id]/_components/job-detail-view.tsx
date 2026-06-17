"use client";

import { useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/cn";
import { usePageScrolled } from "@repo/libs/hooks";
import type { JobDetail } from "@/lib/mock/job-detail";
import { JobHeader } from "./job-header";
import { JobOverviewPanel } from "./job-overview-panel";
import { JobTracesPanel } from "./job-traces-panel";
import { JobUsagePanel } from "./job-usage-panel";

type TabKey = "overview" | "traces" | "usage";

interface JobDetailViewProps {
  detail: JobDetail;
}

export default function JobDetailView({ detail }: JobDetailViewProps) {
  const runs = detail.initialRuns;
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const stickyRef = useRef<HTMLDivElement>(null);
  const scrolled = usePageScrolled({ ref: stickyRef });

  const { validRunCount, erroredRunCount } = useMemo(() => {
    let valid = 0;
    let errored = 0;
    for (const r of runs) {
      if (r.state === "scored") valid += 1;
      if (r.state === "error") errored += 1;
    }
    return { validRunCount: valid, erroredRunCount: errored };
  }, [runs]);

  const switchToTraces = () => setActiveTab("traces");

  return (
    // `h-full` pins the page to <main>'s height so the Tabs flex chain
    // (`flex-1 min-h-0` → TabsContent → table-scroll wrapper) can resolve. With
    // `min-h-full` the root grew with children and the page scrolled inside
    // <main> instead of the table body scrolling internally.
    <div className="flex h-full flex-col">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabKey)}
        // Traces + Usage tabs each own an internal scroll region (table body
        // only — filter chrome / banner / sticky chrome stay fixed). The Tabs
        // chain must propagate `flex-1 min-h-0` so those TabsContents can flex
        // against the sticky chrome above. Overview lets the page scroll
        // naturally — it doesn't carry the overflow class so this is harmless
        // for it.
        className="flex min-w-0 flex-1 flex-col gap-0 min-h-0"
      >
        <div
          ref={stickyRef}
          className={cn(
            "sticky top-0 z-page-chrome bg-panel pt-6 border-b transition-[border-color,box-shadow] prop-(--motion-state-change)",
            scrolled ? "border-border" : "border-transparent",
            scrolled ? "shadow-scroll-cue" : "shadow-none",
          )}
        >
          <div className="page-shell block py-0">
            <JobHeader detail={detail} validRunCount={validRunCount} />
            <TabsList variant="underline">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="traces">
                Traces
                <span className="ml-1.5 font-mono text-label text-meta-foreground">
                  {runs.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabsContent value="overview" className="pt-6">
          <div className="page-shell block py-0">
            <JobOverviewPanel
              detail={detail}
              runs={runs}
              validRunCount={validRunCount}
              erroredRunCount={erroredRunCount}
              totalRunCount={runs.length}
              onSwitchToTraces={switchToTraces}
            />
          </div>
        </TabsContent>
        {/* Traces owns an internal scroll region — only the table body scrolls
            while filter chrome + banner + bulk bar stay visible. The
            `flex flex-col flex-1 min-h-0` chain matches the Usage tab pattern. */}
        <TabsContent
          value="traces"
          className="pt-6 flex flex-col flex-1 min-h-0"
        >
          <div className="page-shell block py-0 flex-1 min-h-0 flex flex-col">
            <JobTracesPanel
              jobId={detail.job.id}
              modelId={detail.modelId}
              runs={runs}
              tasks={detail.tasks}
              qaAgents={detail.qaAgents}
              models={detail.models}
              failedByModel={detail.failedByModel}
            />
          </div>
        </TabsContent>
        {/* Usage owns an internal scroll region for its per-trace table — the
            `flex flex-col flex-1 min-h-0` chain propagates the parent height
            down through TabsContent + page-shell so the table body can flex
            against it. */}
        <TabsContent
          value="usage"
          className="pt-6 flex flex-col flex-1 min-h-0"
        >
          <div className="page-shell block py-0 flex-1 min-h-0 flex flex-col">
            <JobUsagePanel usage={detail.usage} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
