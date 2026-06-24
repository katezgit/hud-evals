"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { LibraryJobs } from "./library-jobs";
import { LibraryTraces } from "./library-traces";

type TabKey = "jobs" | "traces";
const TAB_KEYS: ReadonlyArray<TabKey> = ["jobs", "traces"];

function parseTab(raw: string | null): TabKey {
  return TAB_KEYS.includes(raw as TabKey) ? (raw as TabKey) : "jobs";
}

export function LibraryShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  const handleTabChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "jobs") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }
    const query = params.toString();
    router.replace(query ? `/library?${query}` : "/library", { scroll: false });
  };

  // flex-1 min-h-0 lets Tabs claim the remaining height inside page-shell so
  // each TabsContent can flex its inner Pattern A card. TabsList is shrink-0.
  // gap-6 matches the page-section rhythm: tab strip → tab content is the same
  // 24px the page-shell uses for header → content. Reference: JobUsagePanel
  // (Usage tab) — same bounded-fill chain.
  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="min-h-0 flex-1 gap-6"
    >
      <TabsList variant="underline" className="shrink-0">
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="traces">Traces</TabsTrigger>
      </TabsList>
      <TabsContent value="jobs" className="flex min-h-0 flex-col">
        <LibraryJobs />
      </TabsContent>
      <TabsContent value="traces" className="flex min-h-0 flex-col">
        <LibraryTraces />
      </TabsContent>
    </Tabs>
  );
}
