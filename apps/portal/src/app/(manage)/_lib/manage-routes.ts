import {
  Bell,
  CreditCard,
  Gauge,
  KeyRound,
  Lock,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface ManageRoute {
  href: string;
  label: string;
  title: string;
  lead: string;
  Icon: LucideIcon;
  adminOnly?: boolean;
}

export const PERSONAL_ROUTES: ReadonlyArray<ManageRoute> = [
  {
    href: "/manage/profile",
    label: "Profile",
    title: "Profile",
    lead: "Your personal account. Only affects you.",
    Icon: User,
  },
  {
    href: "/manage/notifications",
    label: "Notifications",
    title: "Notifications",
    lead: "Job alerts, browser push, and integration hooks.",
    Icon: Bell,
  },
];

export const ORG_ROUTES: ReadonlyArray<ManageRoute> = [
  {
    href: "/manage/organization",
    label: "Organization",
    title: "Organization",
    lead: "Shared account settings — affects everyone in the org.",
    Icon: Settings,
  },
  {
    href: "/manage/members",
    label: "Members",
    title: "Members",
    lead: "Who can access this organization.",
    Icon: Users,
  },
  {
    href: "/manage/billing",
    label: "Billing",
    title: "Billing",
    lead: "Plan, credits and payment for the organization.",
    Icon: CreditCard,
    adminOnly: true,
  },
  {
    href: "/manage/usage",
    label: "Usage",
    title: "Usage",
    lead: "Live spend for your org this month. Watch the burn while runs are in flight.",
    Icon: Gauge,
  },
  {
    href: "/manage/limits",
    label: "Limits",
    title: "Limits",
    lead: "Rate and concurrency limits for the org.",
    Icon: Gauge,
    adminOnly: true,
  },
  {
    href: "/manage/api-keys",
    label: "API keys",
    title: "API keys",
    lead: "SDK authentication for running jobs. Org-scoped.",
    Icon: KeyRound,
  },
  {
    href: "/manage/secrets",
    label: "Secrets",
    title: "Secrets",
    lead: "Environment credentials injected into runs. Org-scoped.",
    Icon: Lock,
    adminOnly: true,
  },
];

export const ALL_MANAGE_ROUTES: ReadonlyArray<ManageRoute> = [
  ...PERSONAL_ROUTES,
  ...ORG_ROUTES,
];

export function findManageRoute(pathname: string): ManageRoute | undefined {
  return ALL_MANAGE_ROUTES.find(
    (r) => pathname === r.href || pathname.startsWith(r.href + "/"),
  );
}
