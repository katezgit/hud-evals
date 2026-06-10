"use client";

import { useSearchParams } from "next/navigation";
import { creditState as mockCreditState } from "@/lib/mock";
import type { CreditState } from "@/lib/mock/types";

/**
 * Demo override: `?credits=N` rewrites `balance` on the fly so screenshots /
 * walkthroughs can flip the sidebar between healthy and zero-balance without a
 * code change. `total` is fixed. Non-integer / negative inputs fall back to the
 * mock default — silent, no UI surface.
 *
 * When balance reaches 0 we zero out the derived runway / burn-rate fields too;
 * leaving "~ 92 cr/hr · ~38h left" next to "0 / 10,000" is internally
 * inconsistent, and the zero-state UI replaces that line entirely anyway.
 */
export function useCreditsBalance(): CreditState {
  const searchParams = useSearchParams();
  const raw = searchParams.get("credits");

  if (raw === null) return mockCreditState;

  const parsed = Number(raw);
  const isValid =
    Number.isInteger(parsed) && parsed >= 0 && parsed <= mockCreditState.total;

  if (!isValid) return mockCreditState;

  if (parsed === 0) {
    return { ...mockCreditState, balance: 0, burnRatePerHour: 0, runwayHours: 0 };
  }

  return { ...mockCreditState, balance: parsed };
}
