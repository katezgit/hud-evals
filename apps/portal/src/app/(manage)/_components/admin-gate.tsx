"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useRole } from "@/lib/mock/role-context";

/**
 * Client-side fall-through for admin-only settings pages. Renders children
 * when the user is admin-tier; redirects user-tier to `/manage/profile`
 * (the safe landing) per docs/design/screens/settings.wireframe.md.
 *
 * Real RBAC enforcement belongs server-side once the API is wired; this is
 * the scaffold-time UI guard.
 */
export default function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAdmin } = useRole();

  useEffect(() => {
    if (!isAdmin) router.replace("/manage/profile");
  }, [isAdmin, router]);

  if (!isAdmin) return null;
  return <>{children}</>;
}
