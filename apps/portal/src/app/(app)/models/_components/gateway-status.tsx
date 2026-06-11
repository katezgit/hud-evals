"use client";

import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";

const GATEWAY_URL = "https://inference.hud.ai/";

interface GatewayInfo {
  service: string;
  version: string;
  status: string;
}

type FetchState =
  | { kind: "pending" }
  | { kind: "ok"; data: GatewayInfo; checkedAt: Date }
  | { kind: "error"; message: string; checkedAt: Date };

export default function GatewayStatus() {
  const [state, setState] = useState<FetchState>({ kind: "pending" });

  useEffect(() => {
    const controller = new AbortController();
    fetch(GATEWAY_URL, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as GatewayInfo;
        setState({ kind: "ok", data, checkedAt: new Date() });
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setState({
          kind: "error",
          message: err.message,
          checkedAt: new Date(),
        });
      });
    return () => controller.abort();
  }, []);

  return (
    <span
      className="inline-flex items-center gap-1.5 align-baseline"
      aria-live="polite"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="inline-flex cursor-help items-center gap-1.5"
          >
            <span
              aria-hidden="true"
              className={cn("size-1.5 rounded-full", dotClassFor(state))}
            />
            <span className={cn("text-body", statusWordClassFor(state))}>
              {statusWordFor(state)}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltipFor(state)}</TooltipContent>
      </Tooltip>
      {state.kind === "ok" && (
        <span className="text-body text-meta-foreground">
          v{state.data.version}
        </span>
      )}
    </span>
  );
}

function dotClassFor(state: FetchState): string {
  if (state.kind === "ok") return "bg-state-scored";
  if (state.kind === "error") return "bg-destructive";
  return "bg-muted-foreground";
}

function statusWordFor(state: FetchState): string {
  if (state.kind === "ok") return "Running";
  if (state.kind === "error") return "Degraded";
  return "Checking…";
}

function statusWordClassFor(state: FetchState): string {
  if (state.kind === "error") return "text-destructive";
  return "text-muted-foreground";
}

function tooltipFor(state: FetchState): string {
  if (state.kind === "ok") {
    return `${state.data.service} · checked ${formatTime(state.checkedAt)}`;
  }
  if (state.kind === "error") {
    return `Error: ${state.message} · checked ${formatTime(state.checkedAt)}`;
  }
  return "Checking Model Gateway status…";
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
