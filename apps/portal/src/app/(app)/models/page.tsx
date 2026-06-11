import type { Metadata } from "next";
import { ArrowUpRightIcon, BookOpenIcon } from "lucide-react";
import GatewayStatus from "./_components/gateway-status";
import ModelsCatalog from "./_components/models-catalog";

export const metadata: Metadata = {
  title: "Models",
};

export default function ModelsPage() {
  return (
    <div className="mx-auto w-full max-w-[1536px] flex flex-col gap-2 px-4 md:px-6 lg:px-8 py-6">
      <header className="flex flex-col gap-1">
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
        <p className="text-body text-muted-foreground">
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
