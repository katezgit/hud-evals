export type HomeActivityKind = "user" | "cron";
export type HomeActivityVerb =
  | "started"
  | "completed"
  | "failed"
  | "errored"
  | "passed";

export interface HomeActivityActor {
  /** Single-character avatar initial. */
  initial: string;
  /** Display name; ignored when `kind === "cron"`. */
  name: string;
  /** Token name for avatar background tint. */
  tint: "primary" | "neutral";
  kind: HomeActivityKind;
}

export interface HomeActivityItem {
  id: string;
  actor: HomeActivityActor;
  /** Free-text label rendered between actor name and the job link. */
  verb: HomeActivityVerb | "ran";
  /** Job link target (a job ID — resolved via `jobHref`). */
  jobId: string;
  /** Human-facing job name surfaced inside the link. */
  jobLabel: string;
  /** Optional trailing detail rendered after the job link (mono, neutral). */
  detail?: string;
  /** Optional warning tag rendered after detail in warning-text colour. */
  warning?: string;
  /** Relative timestamp ("just now", "12m ago"). */
  when: string;
}

const AMAN: HomeActivityActor = {
  initial: "A",
  name: "Aman",
  tint: "primary",
  kind: "user",
};
const PRIYA: HomeActivityActor = {
  initial: "P",
  name: "Priya",
  tint: "neutral",
  kind: "user",
};
const CRON: HomeActivityActor = {
  initial: "C",
  name: "Cron",
  tint: "neutral",
  kind: "cron",
};

export const HOME_ORG_ACTIVITY: ReadonlyArray<HomeActivityItem> = [
  {
    id: "act_1",
    actor: AMAN,
    verb: "started",
    jobId: "job_9f3ac1",
    jobLabel: "GRPO sweep · lr=2e-6",
    when: "just now",
  },
  {
    id: "act_2",
    actor: AMAN,
    verb: "started",
    jobId: "job_4b7e22",
    jobLabel: "Prompted baseline — opus",
    when: "just now",
  },
  {
    id: "act_3",
    actor: CRON,
    verb: "ran",
    jobId: "job_55a7c0",
    jobLabel: "Regression 0042",
    detail: "passed 3/4",
    when: "12m ago",
  },
  {
    id: "act_4",
    actor: AMAN,
    verb: "completed",
    jobId: "job_8c01af",
    jobLabel: "lr=1e-6",
    detail: "0.7912 (+0.057)",
    when: "38m ago",
  },
  {
    id: "act_5",
    actor: AMAN,
    verb: "failed",
    jobId: "job_2a55de",
    jobLabel: "kl=0.05",
    warning: "reward-hack?",
    when: "1h ago",
  },
  {
    id: "act_6",
    actor: AMAN,
    verb: "errored",
    jobId: "job_d10b94",
    jobLabel: "bf16",
    detail: "infra",
    when: "1h ago",
  },
  {
    id: "act_7",
    actor: PRIYA,
    verb: "completed",
    jobId: "job_1ee330",
    jobLabel: "Batch: 4 tasks",
    detail: "4/4",
    when: "1d ago",
  },
  {
    id: "act_8",
    actor: PRIYA,
    verb: "completed",
    jobId: "job_b3d9f1",
    jobLabel: "GPT-5 sweep",
    detail: "3/4, 1 below threshold",
    when: "2d ago",
  },
];
