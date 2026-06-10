"use client";

import { useTheme } from "next-themes";
import { cn } from "@repo/ui/lib/cn";
import { Panel } from "@/app/(manage)/_components/page-primitives";

type ThemeChoice = "light" | "dark" | "system";

interface ThemeOption {
  value: ThemeChoice;
  label: string;
  /** Inline gradient describing the preview surface. */
  previewStyle: React.CSSProperties;
}

const OPTIONS: ReadonlyArray<ThemeOption> = [
  { value: "light", label: "Light", previewStyle: { background: "#f4f6f4" } },
  { value: "dark", label: "Dark", previewStyle: { background: "#0c1016" } },
  {
    value: "system",
    label: "System",
    previewStyle: { background: "linear-gradient(90deg, #f4f6f4 50%, #0c1016 50%)" },
  },
];

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();
  // `theme` is undefined on first render before next-themes hydrates from
  // storage; treat that window as "system" so the radio shows a sensible default.
  const choice: ThemeChoice = (theme ?? "system") as ThemeChoice;

  return (
    <Panel title="Theme">
        <div
          role="radiogroup"
          aria-label="Theme"
          className="grid gap-3 md:grid-cols-3"
        >
          {OPTIONS.map((option) => {
            const isActive = choice === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "group flex cursor-pointer flex-col gap-2 rounded-md border border-border bg-card p-2 text-left transition-colors duration-fast ease-out-standard hover:border-border-strong",
                  isActive && "border-2 border-foreground shadow-card",
                )}
              >
                <span
                  aria-hidden="true"
                  className="block h-12 w-full rounded-sm border border-border"
                  style={option.previewStyle}
                />
                <span className="text-center text-label font-semibold text-foreground">{option.label}</span>
              </button>
            );
          })}
        </div>
    </Panel>
  );
}
