import type { Metadata } from "next";
import { BookOpenIcon } from "lucide-react";
import { HOME_RECENT_JOBS } from "@/lib/mock/home-jobs";
import JobsIndex, { NewJobButton } from "./_components/jobs-index";

export const metadata: Metadata = {
  title: "Jobs",
};

export default function JobsPage() {
  return (
    <div className="page-shell gap-2">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-display font-semibold text-foreground">Jobs</h1>
            <a
              href="https://docs.hud.ai/quick-links/training"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Jobs documentation, opens in new tab"
              className="inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring outline-hidden"
            >
              <BookOpenIcon aria-hidden="true" className="size-3.5" />
            </a>
          </div>
          <NewJobButton />
        </div>
      </header>
      <JobsIndex rows={HOME_RECENT_JOBS} />
    </div>
  );
}
