/**
 * Role-tier helpers. The wireframe collapses the 3-role RBAC model into two
 * UI tiers — admin-tier (owner|admin) and user-tier (member) — and gates
 * sections accordingly.
 */

import type { Role, RoleTier } from "@/lib/mock/types";

export function tierFor(role: Role): RoleTier {
  return role === "member" ? "user-tier" : "admin-tier";
}

export function isAdminTier(role: Role): boolean {
  return role !== "member";
}

/**
 * Pages restricted to admin-tier (hidden from member nav).
 * Mirrors docs/design/screens/settings.wireframe.md "Nav rail diff" section.
 */
export const ADMIN_ONLY_ROUTES: ReadonlySet<string> = new Set([
  "/manage/billing",
  "/manage/limits",
  "/manage/secrets",
]);

export function isAdminOnlyRoute(href: string): boolean {
  return ADMIN_ONLY_ROUTES.has(href);
}
