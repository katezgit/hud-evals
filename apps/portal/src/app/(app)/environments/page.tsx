import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import { EnvironmentsIndex } from "./_components/environments-index";
import {
  getEnvActivity,
  listEnvironments,
} from "./[id]/_data/environments";

export const metadata: Metadata = {
  title: "Environments",
};

export default function EnvironmentsPage() {
  const environments = listEnvironments();
  const activity = getEnvActivity();

  return (
    <>
      {/* Route-level page header — H1 + docs link + "+ New Environment" CTA.
          Scrolls away with the page; the activity bar + tab strip below
          (inside <EnvironmentsIndex>) stay pinned via their own sticky band.
          Padding matches the original sticky-band top spacing so the H1's
          vertical position does not shift. */}
      <header className="page-shell block pt-6 md:pt-10 py-0">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <h1 className="text-display font-semibold text-foreground">
              Environments
            </h1>
            <Link
              href="https://docs.hud.ai/platform/environments"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Environments documentation, opens in new tab"
              className="inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring outline-hidden"
            >
              <BookOpen aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          <IconButton
            asChild
            variant="primary"
            aria-label="New Environment"
            className="md:hidden"
          >
            <Link href="/environments/new">
              <Plus aria-hidden="true" />
            </Link>
          </IconButton>
          <Button asChild variant="primary" className="hidden md:inline-flex">
            <Link href="/environments/new">
              <Plus aria-hidden="true" className="size-3.5" />
              New Environment
            </Link>
          </Button>
        </div>
      </header>

      <EnvironmentsIndex environments={environments} activity={activity} />
    </>
  );
}
