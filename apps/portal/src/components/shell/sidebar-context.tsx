"use client";

import { createContext, useContext } from "react";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
}

// Default value lets `SidebarNavLink` render outside a provider (e.g. the
// /manage sidebar, which never collapses). Always-expanded, toggle is a no-op.
const DEFAULT_SIDEBAR: SidebarContextValue = {
  collapsed: false,
  toggle: () => {},
};

const SidebarContext = createContext<SidebarContextValue>(DEFAULT_SIDEBAR);

export function SidebarProvider({
  collapsed,
  toggle,
  children,
}: SidebarContextValue & { children: React.ReactNode }) {
  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
