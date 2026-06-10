"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SegmentedControl } from "@repo/ui/components/segmented-control";

type ThemeChoice = "light" | "dark" | "system";

/**
 * Two-option [Light | Dark] segmented control for the avatar menu.
 * The Appearance settings card carries the full 3-option control (incl. System)
 * — both call setTheme, so they stay in sync.
 */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  // `theme` is undefined during SSR/first render; fall back to `resolvedTheme`,
  // then "system", so the active segment doesn't flicker before hydration.
  const choice: ThemeChoice = (theme ?? resolvedTheme ?? "system") as ThemeChoice;
  // `system` resolves to light/dark — show that as the active segment so the
  // control mirrors the rendered theme rather than abandoning the cue.
  const activeValue = choice === "system" ? ((resolvedTheme ?? "light") as "light" | "dark") : choice;

  return (
    <SegmentedControl
      aria-label="Theme"
      value={activeValue}
      onValueChange={(value) => setTheme(value as ThemeChoice)}
      size="sm"
    >
      <SegmentedControl.Item value="light" aria-label="Light theme">
        <Sun aria-hidden="true" className="size-3.5" />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="dark" aria-label="Dark theme">
        <Moon aria-hidden="true" className="size-3.5" />
      </SegmentedControl.Item>
    </SegmentedControl>
  );
}
