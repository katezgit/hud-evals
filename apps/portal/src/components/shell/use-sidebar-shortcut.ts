"use client";

import { useEffect } from "react";

// Cmd/Ctrl+B toggles the sidebar. preventDefault keeps Safari/Firefox from
// hijacking the chord for the bookmarks bar.
export function useSidebarShortcut(toggle: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "b") return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);
}
