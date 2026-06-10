"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Badge } from "@repo/ui/components/badge";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { burnHistory, priorPeriodBurn } from "@/lib/mock";

const NUMBER = new Intl.NumberFormat("en-US");

export function BurndownPanel() {
  const currentBurn = burnHistory[burnHistory.length - 1]?.spent ?? 0;
  const deltaPercent = Math.round(
    ((currentBurn - priorPeriodBurn) / priorPeriodBurn) * 100,
  );
  const isOverPrior = deltaPercent > 0;
  const deltaLabel = `${isOverPrior ? "+" : ""}${deltaPercent}%`;

  return (
    <Panel title="30-Day Burn" className="mb-0 flex h-full flex-col">
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={burnHistory as Array<{ day: number; spent: number }>}
            margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
          >
            <Area
              type="monotone"
              dataKey="spent"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="var(--color-primary)"
              fillOpacity={0.1}
              isAnimationActive={false}
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-3">
        <span className="font-mono text-label text-foreground tabular-nums">
          {NUMBER.format(currentBurn)} cr spent
        </span>
        <Badge variant={isOverPrior ? "warning" : "success"}>
          {deltaLabel} vs prior
        </Badge>
      </div>
    </Panel>
  );
}
