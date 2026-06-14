"use client";

import { useMemo } from "react";
import { ArrowUpRightIcon, ExternalLinkIcon } from "lucide-react";

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { cn } from "@repo/ui/lib/cn";

import type { TasksetTaskRow } from "@/lib/mock/tasksets";

import { DistBars } from "./tasks-tab-cells";

interface TaskDrawerProps {
  /** Open when non-null; null = closed. Pairs with onClose for controlled use. */
  task: TasksetTaskRow | null;
  onClose: () => void;
}

interface MockRun {
  reward: number;
  model: string;
  when: string;
  scored: boolean;
}

interface MockJob {
  name: string;
  when: string;
}

const RECENT_MODELS = [
  "claude-haiku-4-5",
  "gpt-4o-mini",
  "gpt-5-mini",
  "claude-3-5-sonnet",
  "qwen-2.5-14b",
] as const;

const RECENT_WHENS = [
  "3h ago",
  "1d ago",
  "2d ago",
  "3d ago",
  "4d ago",
  "1w ago",
] as const;

const MOCK_JOBS_POOL: ReadonlyArray<MockJob> = [
  { name: "training-run-v12", when: "4d ago" },
  { name: "baseline-eval-003", when: "7d ago" },
  { name: "nightly-eval-2026-06-09", when: "1w ago" },
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function buildMockRuns(task: TasksetTaskRow): ReadonlyArray<MockRun> {
  if (task.tr === 0) return [];

  const count = Math.min(task.tr, 10);
  const seed = task.taskId + task.scenario;
  const base = task.reward;
  const out: Array<MockRun> = [];
  for (let i = 0; i < count; i++) {
    const h = hash(seed + i);
    // Spread rewards around the task's mean within ±0.2, clamp to [0,1].
    const jitter = ((h % 41) - 20) / 100; // -0.2 .. +0.2
    const reward = Math.max(0, Math.min(1, base + jitter));
    out.push({
      reward,
      model: RECENT_MODELS[h % RECENT_MODELS.length] ?? RECENT_MODELS[0],
      when: RECENT_WHENS[i % RECENT_WHENS.length] ?? RECENT_WHENS[0],
      scored: true,
    });
  }
  return out;
}

function buildMockJobs(task: TasksetTaskRow): ReadonlyArray<MockJob> {
  if (task.tr === 0) return [];
  const h = hash(task.taskId);
  const start = h % MOCK_JOBS_POOL.length;
  const count = 2 + (h % 2);
  const out: Array<MockJob> = [];
  for (let i = 0; i < count; i++) {
    const job = MOCK_JOBS_POOL[(start + i) % MOCK_JOBS_POOL.length];
    if (job) out.push(job);
  }
  return out;
}

function bandCounts(task: TasksetTaskRow): {
  pass: number;
  partial: number;
  fail: number;
} {
  const tr = task.tr;
  if (tr === 0) return { pass: 0, partial: 0, fail: 0 };
  const r = task.reward;
  // Single-sample interpretation: a Task with mean reward `r` over `tr` runs.
  // Distribute proportionally weighted toward the band the mean lives in.
  if (r >= 0.75) {
    const pass = Math.round(tr * 0.6);
    const partial = Math.round(tr * 0.3);
    return { pass, partial, fail: Math.max(0, tr - pass - partial) };
  }
  if (r >= 0.25) {
    const partial = Math.round(tr * 0.5);
    const pass = Math.round(tr * 0.25);
    return { pass, partial, fail: Math.max(0, tr - pass - partial) };
  }
  const fail = Math.round(tr * 0.6);
  const partial = Math.round(tr * 0.3);
  return { pass: Math.max(0, tr - fail - partial), partial, fail };
}

export function TaskDrawer({ task, onClose }: TaskDrawerProps) {
  const recentRuns = useMemo(() => (task ? buildMockRuns(task) : []), [task]);
  const recentJobs = useMemo(() => (task ? buildMockJobs(task) : []), [task]);
  const counts = useMemo(
    () => (task ? bandCounts(task) : null),
    [task],
  );

  const isOpen = task !== null;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DrawerContent size="md">
        <DrawerHeader>
          <div className="flex min-w-0 flex-col gap-1">
            <DrawerTitle>
              {task ? `${task.taskId} | v${task.taskVersion}` : ""}
            </DrawerTitle>
            {task && (
              <DrawerDescription className="font-mono text-code">
                {task.scenario}
              </DrawerDescription>
            )}
          </div>
          <DrawerCloseButton />
        </DrawerHeader>

        <DrawerBody className="flex flex-col gap-6">
          {task && (
            <>
              <Section title="Task summary">
                <SummaryRow
                  label="args"
                  value={task.args ? task.args : "—"}
                  mono
                />
                <SummaryRow label="expected output" value="—" />
                <SummaryRow label="scorer" value="numeric_match" mono />
              </Section>

              <Section title="Reward & Dist">
                {task.tr === 0 ? (
                  <p
                    aria-label="No Runs yet"
                    className="text-body text-muted-foreground"
                  >
                    —
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-mono text-subtitle font-semibold text-foreground tabular-nums">
                        {task.reward.toFixed(4)}
                      </span>
                      <span className="text-label text-muted-foreground">
                        {task.tr} runs
                      </span>
                    </div>
                    <DistBars value={task.dist} width={320} height={20} />
                    {counts && (
                      <p className="text-label text-muted-foreground">
                        Pass {counts.pass} · Partial {counts.partial} · Fail{" "}
                        {counts.fail}
                      </p>
                    )}
                  </div>
                )}
              </Section>

              <Section title="Recent Runs">
                {recentRuns.length === 0 ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-body text-foreground">No Runs yet.</p>
                    <p className="text-body text-muted-foreground">
                      <code className="font-mono text-code">
                        hud run hud-browser:{task.taskId}
                      </code>{" "}
                      to start.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col">
                    {recentRuns.map((run, i) => (
                      <li
                        key={i}
                        className={cn(
                          "flex items-center justify-between gap-3 py-1.5",
                          i > 0 && "border-t border-border",
                        )}
                      >
                        <span className="font-mono text-code tabular-nums text-foreground">
                          {run.reward.toFixed(4)}
                        </span>
                        <span className="flex-1 truncate font-mono text-code text-muted-foreground">
                          {run.model}
                        </span>
                        <span className="text-label text-muted-foreground">
                          {run.when}
                        </span>
                        <a
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "inline-flex items-center gap-1",
                            "text-label text-primary",
                            "hover:underline",
                          )}
                        >
                          View trace
                          <ExternalLinkIcon
                            aria-hidden="true"
                            className="size-3"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {recentJobs.length > 0 && (
                <Section title="Jobs that ran this Task">
                  <ul className="flex flex-col">
                    {recentJobs.map((job, i) => (
                      <li
                        key={job.name}
                        className={cn(
                          "flex items-center justify-between gap-3 py-1.5",
                          i > 0 && "border-t border-border",
                        )}
                      >
                        <span className="truncate font-mono text-code text-foreground">
                          {job.name}
                        </span>
                        <span className="text-label text-muted-foreground">
                          {job.when}
                        </span>
                        <a
                          href="#"
                          className={cn(
                            "inline-flex items-center gap-1",
                            "text-label text-primary",
                            "hover:underline",
                          )}
                        >
                          Open
                          <ArrowUpRightIcon
                            aria-hidden="true"
                            className="size-3"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-label font-medium uppercase text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-32 shrink-0 text-label text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 break-all text-body text-foreground",
          mono && "font-mono text-code",
        )}
      >
        {value}
      </span>
    </div>
  );
}
