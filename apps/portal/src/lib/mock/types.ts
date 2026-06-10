/**
 * Mock data types — shaped to mirror the eventual API contract.
 * Roles collapse to two UI tiers (admin-tier = owner|admin, user-tier = member),
 * but the underlying data model keeps the 3-tier distinction per
 * docs/design/screens/settings.wireframe.md decision log #2.
 */

export type Role = "owner" | "admin" | "member";

export type RoleTier = "admin-tier" | "user-tier";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Org {
  id: string;
  name: string;
  avatarInitial: string;
  /** Short hint shown under the org name in the avatar menu. */
  hint: string;
  /** Total active members in the org (display-only on the Organization page). */
  members: number;
}

export interface OrgMembership {
  org: Org;
  role: Role;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  isYou?: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  /** Masked display value, e.g. "sk-hud-…-w6". */
  masked: string;
  createdAt: string;
  expiresAt: string | null;
}

export type BillingHistoryStatus = "completed" | "pending" | "failed";

export interface BillingHistoryEntry {
  id: string;
  /** ISO-ish date string ("YYYY-MM-DD") — same shape as ApiKey.createdAt. */
  date: string;
  /** Human label, e.g. "Credit purchase", "Monthly invoice", "User signup". */
  type: string;
  status: BillingHistoryStatus;
  /** Positive number for credit grants/purchases; null for non-credit rows. */
  credits: number | null;
  /** USD amount; 0 for free credits. */
  amount: number;
}

export interface Secret {
  id: string;
  name: string;
  scope: string;
}

export interface UsageRow {
  resource: string;
  used: string;
  credits: number;
}

export interface LimitRow {
  name: string;
  current: number;
  max: number;
  unit?: string;
}

export interface CreditState {
  balance: number;
  total: number;
  burnRatePerHour: number;
  runwayHours: number;
}

export interface OrgAddress {
  /** Primary business address — line 1 (street). */
  line1: string;
  /** Optional secondary line (suite, floor, etc.). Empty string when unused. */
  line2: string;
  country: string;
  /** State / province / region — free-form to cover non-US orgs. */
  state: string;
  city: string;
  postalCode: string;
}
