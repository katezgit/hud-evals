"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_MOCK_ROLE } from "@/lib/mock/data";
import { isAdminTier, tierFor } from "@/lib/mock/role";
import type { Role, RoleTier } from "@/lib/mock/types";

const ROLE_STORAGE_KEY = "portal:mock-role";

interface RoleContextValue {
  role: Role;
  tier: RoleTier;
  isAdmin: boolean;
  setRole: (next: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

function isRole(value: unknown): value is Role {
  return value === "owner" || value === "admin" || value === "member";
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(DEFAULT_MOCK_ROLE);

  useEffect(() => {
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
    if (isRole(stored)) setRoleState(stored);
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    window.localStorage.setItem(ROLE_STORAGE_KEY, next);
  }, []);

  const value = useMemo<RoleContextValue>(
    () => ({ role, tier: tierFor(role), isAdmin: isAdminTier(role), setRole }),
    [role, setRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return ctx;
}
