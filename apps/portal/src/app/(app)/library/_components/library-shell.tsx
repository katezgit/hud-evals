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

  // Content-height tabs: each TabsContent flows in normal block layout and the
  // page (<main>) handles overflow. gap-6 matches the page-section rhythm: tab
  // strip → tab content is the same 24px the page-shell uses for header →
  // content.
  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="gap-6"
    >
      <TabsList variant="underline">
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="traces">Traces</TabsTrigger>
      </TabsList>
      <TabsContent value="jobs">
        <LibraryJobs />
      </TabsContent>
      <TabsContent value="traces">
        <LibraryTraces />
      </TabsContent>
    </Tabs>
  );
}
