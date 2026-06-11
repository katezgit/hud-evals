"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ManagePageActionContextValue {
  action: ReactNode;
  setAction: (action: ReactNode) => void;
}

const ManagePageActionContext =
  createContext<ManagePageActionContextValue | null>(null);

export function ManagePageActionProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<ReactNode>(null);
  return (
    <ManagePageActionContext.Provider value={{ action, setAction }}>
      {children}
    </ManagePageActionContext.Provider>
  );
}

export function useManagePageAction() {
  const ctx = useContext(ManagePageActionContext);
  if (!ctx) {
    throw new Error(
      "useManagePageAction must be used within ManagePageActionProvider",
    );
  }
  return ctx;
}

/**
 * Slot — children render into the layout-owned `ManagePageHeader` right side
 * (typically a primary CTA). Mount inside any /manage/* page; on unmount the
 * slot clears, so navigation between pages doesn't leak stale actions.
 */
export function ManagePageAction({ children }: { children: ReactNode }) {
  const { setAction } = useManagePageAction();
  useEffect(() => {
    setAction(children);
    return () => setAction(null);
  }, [children, setAction]);
  return null;
}
