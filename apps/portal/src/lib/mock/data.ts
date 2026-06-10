/**
 * Static mock fixtures driving the portal scaffold.
 * Values mirror docs/design/mockups/settings-account-org-redesign-2026-05-29.html
 * so visual references line up. No persistence — these are imports, not stores.
 */

import type {
  ApiKey,
  BillingHistoryEntry,
  CreditState,
  LimitRow,
  Member,
  Org,
  OrgAddress,
  OrgMembership,
  Role,
  Secret,
  UsageRow,
  User,
} from "@/lib/mock/types";

export const currentUser: User = {
  id: "u_avery",
  name: "Avery Lin",
  email: "avery@acme.dev",
};

export const currentOrg: Org = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Acme Robotics",
  avatarInitial: "A",
  hint: "12 members · you own this",
  members: 12,
};

export const orgList: ReadonlyArray<OrgMembership> = [
  { org: currentOrg, role: "owner" },
  {
    org: {
      id: "org_atlas",
      name: "Atlas RL",
      avatarInitial: "A",
      hint: "12 members · admin",
      members: 12,
    },
    role: "admin",
  },
  {
    org: {
      id: "org_sandbox",
      name: "Sandbox",
      avatarInitial: "S",
      hint: "3 members · member",
      members: 3,
    },
    role: "member",
  },
];

export const orgAddress: OrgAddress = {
  line1: "100 Demo Street",
  line2: "",
  country: "United States",
  state: "CA",
  city: "Springfield",
  postalCode: "94000",
};

/**
 * Default role used to gate UI in this pre-auth scaffold.
 * Owner = full admin-tier coverage by default.
 * Override in dev via the role switcher (gated to !production).
 */
export const DEFAULT_MOCK_ROLE: Role = "owner";

/**
 * Admin-tier roster — a single owner so the role-diff banner copy
 * ("Just you so far — invite teammates…") matches the wireframe.
 */
export const membersAdmin: ReadonlyArray<Member> = [
  { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: "owner" },
];

/**
 * User-tier roster — three members; the active user appears as a member.
 * Order: owner → admin → member, matching the mockup.
 */
export const membersUser: ReadonlyArray<Member> = [
  { id: "u_kai", name: "Kai Chen", email: "kai@acme.dev", role: "owner" },
  { id: "u_mira", name: "Mira Patel", email: "mira@acme.dev", role: "admin" },
  { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: "member", isYou: true },
];

export const apiKeys: ReadonlyArray<ApiKey> = [
  { id: "k_browser", name: "browser", masked: "sk-hud-…-w6", createdAt: "2026-05-23", expiresAt: null },
  { id: "k_eval_local", name: "eval_local", masked: "sk-hud-…-qZ", createdAt: "2026-05-16", expiresAt: null },
  { id: "k_capture", name: "capture-agent-prod", masked: "sk-hud-…-l_", createdAt: "2026-05-15", expiresAt: null },
];

export const secrets: ReadonlyArray<Secret> = [
  {
    id: "s_wandb",
    name: "WANDB_API_KEY",
    scope: "all envs",
    value: "wandb_local_abcdef1234567890fedcba0987654321",
  },
  {
    id: "s_hf",
    name: "HF_TOKEN",
    scope: "all envs",
    value: "hf_QrStUvWxYz0123456789AbCdEfGhIjKlMnOp",
  },
];

export const usageRows: ReadonlyArray<UsageRow> = [
  { resource: "GPU hours (A100)", used: "142.6 h", credits: 3540 },
  { resource: "Job runs", used: "88", credits: 510 },
  { resource: "Storage", used: "240 GB", credits: 180 },
];

export const limits: ReadonlyArray<LimitRow> = [
  { name: "Concurrent jobs", current: 3, max: 8 },
  { name: "Requests / min", current: 120, max: 600 },
  { name: "Max GPUs / job", current: 4, max: 16 },
];

export const creditState: CreditState = {
  balance: 4230,
  total: 10000,
  burnRatePerHour: 92,
  runwayHours: 38,
};

/**
 * 30-day cumulative credit burn (day 0 = 30 days ago, day 30 = today).
 * Convex curve `total * (day/30)^2` — slow start, accelerating into the last 7
 * days. Endpoint matches `creditState.total - creditState.balance` (= 5770)
 * so the chart caption stays consistent with the KPI row.
 */
const BURN_TOTAL = creditState.total - creditState.balance;

export const burnHistory: ReadonlyArray<{ day: number; spent: number }> =
  Array.from({ length: 31 }, (_, day) => ({
    day,
    spent: Math.round(BURN_TOTAL * (day / 30) ** 2),
  }));

/** Prior 30-day window's total burn — used to compute the delta badge. */
export const priorPeriodBurn = 5340;

/** Privacy toggles — initial state for scaffolded UI. */
export const privacyToggles = {
  retainRunLogs: true,
  shareTelemetry: false,
} as const;

/** Org-level "allow new API keys" toggle (Organization page, admin-tier). */
export const allowApiKeyMinting = true;

/**
 * Billing history — recent credit purchases and transactions for the org.
 * Ordered newest-first; the page renders in fixture order.
 */
export const billingHistory: ReadonlyArray<BillingHistoryEntry> = [
  { id: "b_2026_05_29", date: "2026-05-29", type: "Credit purchase", status: "completed", credits: 5000, amount: 50 },
  { id: "b_2026_05_15", date: "2026-05-15", type: "Monthly invoice", status: "completed", credits: null, amount: 42.3 },
  { id: "b_2026_05_01", date: "2026-05-01", type: "Credit purchase", status: "completed", credits: 1000, amount: 10 },
  { id: "b_2026_04_02", date: "2026-04-02", type: "User signup", status: "completed", credits: 10, amount: 0 },
];
