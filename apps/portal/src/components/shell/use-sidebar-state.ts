"use client";

import { useCallback, useEffect, useState } from "react";

export const SIDEBAR_STORAGE_KEY = "portal:sidebar-collapsed";

/**
 * Single source of truth for sidebar collapse. Each shell (AppShell, ManageShell)
 * holds its own React state but reads/writes the same localStorage key — and
 * subscribes to the `storage` event so a toggle in one mounted shell is
 * reflected if the other is rendered in a parallel tab. Within a single tab,
 * shells alternate (only one mounts at a time), and the next mount hydrates
 * from storage.
 */
export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "true") setCollapsed(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== SIDEBAR_STORAGE_KEY) return;
      setCollapsed(e.newValue === "true");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { collapsed, toggle };
}
