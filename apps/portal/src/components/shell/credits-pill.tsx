"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge } from "lucide-react";
import { Progress } from "@repo/ui/components/progress";
import { StatusBlock } from "@repo/ui/components/status-block";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import type { CreditState } from "@/lib/mock/types";

interface CreditsPillProps {
  state: CreditState;
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");
const ADD_CREDITS_HREF = "/manage/billing";

/**
 * Clickable sidebar credits section — opens the in-shell Usage view.
 * Branches on `state.balance === 0`: the zero-balance variant uses the
 * destructive-tinted StatusBlock surface; the healthy variant uses a
 * bg-muted-surface/60 panel for containment off the nav stack. Both share the
 * mx-2 mb-2 rounded-md inset to read as a discrete status surface.
 */
export function CreditsPill({ state }: CreditsPillProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/manage/usage");
  const balance = NUMBER_FORMAT.format(state.balance);
  const total = NUMBER_FORMAT.format(state.total);

  if (state.balance === 0) {
    return (
      <StatusBlock
        tone="destructive"
        className={cn(
          "mx-2 mb-2 overflow-hidden rounded-md border-t-0 px-3 py-2.5 transition-colors duration-fast ease-out-standard hover:bg-destructive/10",
          isActive && "bg-destructive/10",
        )}
      >
        <Link
          href="/manage/usage"
          aria-label={`Credits: 0 of ${total}. View usage.`}
          className="block"
        >
          <div className="flex items-baseline justify-between gap-2 font-mono text-label">
            <span className="font-medium shrink-0">credits</span>
            <span className="font-semibold tabular-nums truncate text-right">
              0 / {total}
            </span>
          </div>
          <div className="mt-1.5">
            <Progress
              value={0}
              state="error"
              className="bg-destructive/20"
              aria-hidden="true"
            />
          </div>
        </Link>
        <div className="mt-1.5 flex items-baseline justify-between gap-2 font-mono text-label font-medium">
          <span>No credits remaining</span>
          <Link href={ADD_CREDITS_HREF} className="whitespace-nowrap hover:underline">
            Add Credits →
          </Link>
        </div>
      </StatusBlock>
    );
  }

  const percentRemaining = Math.round((state.balance / state.total) * 100);

  return (
    <div className="mx-2 mb-2 rounded-md bg-muted-surface/60">
      <Link
        href="/manage/usage"
        aria-label={`Credits: ${balance} of ${total}. Click to view usage.`}
        className={cn(
          "group/credits block rounded-md px-3 py-2.5 transition-colors duration-fast ease-out-standard hover:bg-hover-surface",
          isActive && "bg-selected-surface",
        )}
      >
        <div className="flex items-baseline justify-between gap-2 font-mono text-label">
          <span className="text-muted-foreground shrink-0">credits</span>
          <span className="text-meta-foreground group-hover/credits:text-foreground tabular-nums truncate text-right">
            {balance} / {total}
          </span>
        </div>
        <div className="mt-1.5">
          <Progress
            value={percentRemaining}
            aria-hidden="true"
            className="bg-muted-foreground/15 [&>[data-slot=progress-indicator]]:bg-muted-foreground/30 [&>[data-slot=progress-indicator]]:bg-none [&>[data-slot=progress-indicator]]:shadow-none"
          />
        </div>
      </Link>
    </div>
  );
}

// Collapsed-sidebar counterpart: icon-only entry into /manage/usage. Burn rate
// + balance surface in the tooltip so the operator keeps the at-a-glance signal
// they had in the full pill. Zero balance flips the Gauge icon to destructive
// and surfaces the "Add Credits" CTA in the tooltip body.
export function CreditsIconButton({ state }: CreditsPillProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/manage/usage");
  const balance = NUMBER_FORMAT.format(state.balance);
  const total = NUMBER_FORMAT.format(state.total);
  const isZero = state.balance === 0;

  return (
    <div className="px-1.5 pt-2 pb-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/manage/usage"
            aria-label={
              isZero
                ? `No credits remaining. View billing.`
                : `Credits: ${balance} of ${total}. Click to view usage.`
            }
            className={cn(
              "flex h-7 w-full items-center justify-center rounded-md",
              isZero
                ? "text-destructive hover:bg-destructive/10"
                : "text-meta-foreground hover:bg-hover-surface hover:text-foreground",
              isActive && !isZero && "bg-selected-surface text-foreground",
              isActive && isZero && "bg-destructive/10",
            )}
          >
            <Gauge aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          {isZero
            ? "No credits remaining — Add Credits"
            : `Credits: ${balance} / ${total} · ~${state.burnRatePerHour} cr/hr`}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
