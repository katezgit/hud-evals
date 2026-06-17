"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@repo/ui/components/toast";
import { RouteDirectionTagger } from "@/components/shell/route-direction-tagger";

// next-themes is wired with `attribute="data-theme"` because token themes key off
// [data-theme="dark"] in packages/ui/src/styles/color.css. The provider lives in a
// client component so the FOUC-prevention <script> next-themes injects is owned by
// a client boundary (React 19 + Next 16 warn when server components render it).
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <RouteDirectionTagger />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
