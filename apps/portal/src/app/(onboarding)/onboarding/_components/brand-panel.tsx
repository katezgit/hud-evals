import { BrandMark } from "@repo/ui/components/brand-mark";

// Decorative metrics — aria-hidden static texture that reads as telemetry,
// not real data. Bar fills are visual rhythm, not values.
const metrics = [
  { label: "reward", fillPct: 74, value: "0.7341" },
  { label: "runs", fillPct: 100, value: "50" },
  { label: "step", fillPct: 50, value: "4,096" },
  { label: "cost/run", fillPct: 12, value: "$0.0043" },
] as const;

export function BrandPanel() {
  return (
    <aside
      aria-label="HUD product identity"
      className="hidden flex-col justify-between bg-brand-surface px-12 py-12 lg:flex lg:w-[45%]"
    >
      <div className="flex flex-col gap-16">
        {/* BrandMark wordmark defaults to text-foreground (dark ink). On the
         * pinned dark-teal brand panel that's invisible — override to full white. */}
        <BrandMark className="[&>span:last-child]:text-white" />

        <div className="flex flex-col gap-5">
          <h2
            className="leading-[1.1] font-medium tracking-[-0.03em] text-white"
            style={{ fontSize: "42px" }}
          >
            The platform for building RL environments
          </h2>
          <p
            className="max-w-[340px] leading-[1.6] text-white/85"
            style={{ fontSize: "17px" }}
          >
            Encode your expertise into environments to train and evaluate
            models, and create the post-training data that aligns AI to your
            work.
          </p>
        </div>

        <div aria-hidden="true" className="mt-16 flex flex-col gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <span className="w-16 shrink-0 font-mono text-label text-white/75">
                {m.label}
              </span>
              <div className="h-0.5 flex-1 overflow-hidden rounded-sm bg-white/12">
                <div
                  className="h-full rounded-sm bg-white/55"
                  style={{ width: `${m.fillPct}%` }}
                />
              </div>
              <span className="w-12 text-right font-mono text-label text-white/75">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="font-mono text-meta text-white/75">
        hud-platform · enterprise infrastructure
      </div>
    </aside>
  );
}
