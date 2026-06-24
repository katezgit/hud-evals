import type { Metadata } from "next";
import { ArrowUpRightIcon, BookOpenIcon } from "lucide-react";
import GatewayStatus from "./_components/gateway-status";
import ModelsCatalog from "./_components/models-catalog";

export const metadata: Metadata = {
  title: "Models",
};

export default function ModelsPage() {
  // h-full + min-h-0 turn page-shell into a bounded flex column that fills
  // <main>'s content area, matching the Job-detail Usage tab reference
  // (JobUsagePanel). Header is shrink-0; ModelsCatalog takes flex-1 and owns
  // the Pattern A bordered card whose <thead sticky> needs a bounded ancestor
  // to anchor against.
  return (
    <div className="page-shell h-full min-h-0">
      <header className="shrink-0 page-header">
        <div className="flex items-center gap-2">
          <h1 className="text-display font-semibold text-foreground">Models</h1>
          <a
            href="https://docs.hud.ai/platform/models"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Models documentation, opens in new tab"
            className="inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring outline-hidden"
          >
            <BookOpenIcon aria-hidden="true" className="size-3.5" />
          </a>
        </div>
        <p className="text-muted-foreground">
          Models served via the{" "}
          <a
            href="https://docs.hud.ai/platform/models"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inference Gateway documentation, opens in new tab"
            className="inline-flex items-baseline gap-0.5 text-muted-foreground hover:text-foreground hover:underline"
          >
            Inference Gateway
            <ArrowUpRightIcon aria-hidden="true" className="size-3 self-center" />
          </a>
          .{" "}
          <GatewayStatus />
        </p>
      </header>
      <ModelsCatalog />
    </div>
  );
}
