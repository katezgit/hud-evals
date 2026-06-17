"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Check,
  ChevronRight,
  Edit3,
  ExternalLink,
  Eye,
  Info,
  Layers,
  Link2,
  MoreHorizontal,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@repo/ui/lib/cn";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import { CopyButton } from "@repo/ui/components/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import type { TraceContextLink, TraceDetail } from "@/lib/mock/trace-detail";

interface RelatedTraceItem {
  id: string;
  scenarioId: string;
  status: "passed" | "failed";
  scorePct: number;
  relativeTime: string;
}

const RELATED_TRACES_MOCK: { recommended: RelatedTraceItem[]; recent: RelatedTraceItem[] } = {
  recommended: [
    { id: "0003", scenarioId: "browser:todo-create", status: "failed", scorePct: 0, relativeTime: "5 days ago" },
    { id: "0008", scenarioId: "browser:todo-create", status: "passed", scorePct: 100, relativeTime: "5 days ago" },
    { id: "0012", scenarioId: "browser:todo-create", status: "passed", scorePct: 75, relativeTime: "5 days ago" },
    { id: "0021", scenarioId: "browser:todo-edit", status: "failed", scorePct: 0, relativeTime: "5 days ago" },
    { id: "0034", scenarioId: "browser:todo-create", status: "passed", scorePct: 100, relativeTime: "6 days ago" },
  ],
  recent: [
    { id: "0091", scenarioId: "browser:todo-create", status: "failed", scorePct: 0, relativeTime: "16 days ago" },
    { id: "0093", scenarioId: "browser:todo-create", status: "passed", scorePct: 60, relativeTime: "16 days ago" },
    { id: "0095", scenarioId: "browser:todo-create", status: "failed", scorePct: 0, relativeTime: "16 days ago" },
  ],
};

interface TraceHeaderProps {
  trace: TraceDetail;
  onAskAi: () => void;
}

function pickScoreVariant(
  reward: number,
): "success" | "warning" | "destructive" {
  if (reward >= 0.7) return "success";
  if (reward >= 0.4) return "warning";
  return "destructive";
}

const CREATED_AT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCreatedAt(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return CREATED_AT_FORMATTER.format(parsed);
}

export function TraceHeader({ trace, onAskAi }: TraceHeaderProps) {
  const scorePct = Math.round(trace.reward * 100);
  const scoreVariant = pickScoreVariant(trace.reward);
  const [contextOpen, setContextOpen] = useState(false);
  const [relatedOpen, setRelatedOpen] = useState(false);

  const handleRerun = () => toast(`Re-running scenario ${trace.task.scenarioId}`);
  const handleRelatedSelect = (id: string) => toast(`→ Trace ${id}`);
  const handleCopyLink = () => {
    const url = `${window.location.origin}/traces/${trace.id}`;
    void navigator.clipboard.writeText(url);
    toast.success("Trace link copied");
  };
  const handleEditTitle = () => toast("Edit title — not implemented in demo");
  const handleChangeVisibility = () =>
    toast(`Visibility toggled (was ${trace.visibility})`);
  const handleInvalidate = () =>
    toast(`Trace ${trace.id} marked invalid — excluded from aggregates`);
  const handleViewScenario = () =>
    toast(`→ Scenario ${trace.task.scenarioId}`);

  const taskArgEntries = Object.entries(trace.task.args);
  const tasksetHref = trace.context.taskset.href;

  return (
    <header className="flex flex-col gap-3 pt-2">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-display font-semibold tracking-tight text-foreground break-words">
            {trace.task.promptTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-label">
            <Link
              href={tasksetHref}
              className="inline-flex items-baseline gap-1 font-mono text-meta text-foreground transition-colors hover:text-primary hover:underline underline-offset-2"
            >
              <span>{trace.task.slug}</span>
              <span className="text-meta-foreground">/</span>
              <span>{trace.task.scenarioId}</span>
              <ExternalLink aria-hidden="true" className="size-3 self-center text-meta-foreground" />
            </Link>
            <Separator />
            <span className="font-mono text-meta-foreground">
              {trace.modelLabel}
            </span>
            <Separator />
            <span className="text-meta-foreground">
              {trace.createdRelativeLabel}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="primary" onClick={onAskAi}>
            <Sparkles aria-hidden="true" />
            Ask AI to analyze
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                size="md"
                aria-label="More trace actions"
                type="button"
              >
                <MoreHorizontal aria-hidden="true" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setContextOpen(true)}>
                <Info aria-hidden="true" />
                Open trace context
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRelatedOpen(true)}>
                <Layers aria-hidden="true" />
                View related traces
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleRerun}>
                <RotateCcw aria-hidden="true" />
                Rerun scenario
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCopyLink}>
                <Link2 aria-hidden="true" />
                Copy trace link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleEditTitle}>
                <Edit3 aria-hidden="true" />
                Edit title
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleChangeVisibility}>
                <Eye aria-hidden="true" />
                Change visibility
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleInvalidate} variant="destructive">
                <Ban aria-hidden="true" />
                Invalidate trace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {trace.status === "errored" ? (
          <Badge variant="destructive" showDot>
            Score —
          </Badge>
        ) : (
          <Badge variant={scoreVariant} showDot>
            Score {scorePct}%
          </Badge>
        )}
        <Badge variant="success">Valid</Badge>
        <Badge variant="neutral">Included in eval</Badge>
      </div>

      <Drawer open={contextOpen} onOpenChange={setContextOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Trace context</DrawerTitle>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody>
            <dl className="flex flex-col gap-4">
              <ContextRow label="Job" link={trace.context.job} />
              <ContextRow label="Environment" link={trace.context.environment} />
              <ContextRow label="Model" link={trace.context.model} />
              <ContextRow label="Taskset" link={trace.context.taskset} />
              <div className="flex flex-col gap-1.5">
                <dt className="text-meta-foreground text-label">Task args</dt>
                <dd>
                  {taskArgEntries.length === 0 ? (
                    <span className="text-meta-foreground text-label">No args.</span>
                  ) : (
                    <ul className="flex flex-col gap-1 font-mono text-label">
                      {taskArgEntries.map(([k, v]) => (
                        <li key={k} className="flex gap-2">
                          <span className="text-meta-foreground">{k}:</span>
                          <span className="text-foreground break-all">{v}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
              <PlainRow label="Created" value={formatCreatedAt(trace.createdAt)} />
              <PlainRow label="Visibility" value={trace.visibility} />
              <div className="flex flex-col gap-1.5">
                <dt className="text-meta-foreground text-label">Trace ID</dt>
                <dd className="flex items-center gap-1.5">
                  <span className="font-mono text-label text-foreground break-all">
                    {trace.rawId}
                  </span>
                  <CopyButton value={trace.rawId} ariaLabel="Copy trace ID" />
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={handleViewScenario}
              className="mt-4 inline-flex items-center gap-1 self-start text-label text-muted-foreground hover:text-foreground hover:underline"
            >
              View scenario
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer open={relatedOpen} onOpenChange={setRelatedOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Related traces</DrawerTitle>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody>
            <div className="flex flex-col gap-6">
              <section className="flex flex-col gap-2">
                <h3 className="text-meta text-muted-foreground">Recommended</h3>
                <ul className="flex flex-col gap-0.5">
                  {RELATED_TRACES_MOCK.recommended.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleRelatedSelect(item.id)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-hover-surface cursor-pointer"
                      >
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md text-primary-foreground",
                            item.status === "failed"
                              ? "bg-state-errored"
                              : "bg-state-scored",
                          )}
                        >
                          {item.status === "failed" ? (
                            <X aria-hidden="true" className="size-4" />
                          ) : (
                            <Check aria-hidden="true" className="size-4" />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-body font-medium text-foreground">
                            {item.id} · {item.scenarioId}
                          </span>
                          <span className="text-meta text-meta-foreground">
                            <span className="font-mono">Score {item.scorePct}%</span>
                            {" · "}
                            {item.relativeTime}
                          </span>
                        </div>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-meta-foreground"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="flex flex-col gap-2">
                <h3 className="text-meta text-muted-foreground">Recent</h3>
                <ul className="flex flex-col gap-0.5">
                  {RELATED_TRACES_MOCK.recent.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleRelatedSelect(item.id)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-hover-surface cursor-pointer"
                      >
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md text-primary-foreground",
                            item.status === "failed"
                              ? "bg-state-errored"
                              : "bg-state-scored",
                          )}
                        >
                          {item.status === "failed" ? (
                            <X aria-hidden="true" className="size-4" />
                          ) : (
                            <Check aria-hidden="true" className="size-4" />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-body font-medium text-foreground">
                            {item.id} · {item.scenarioId}
                          </span>
                          <span className="text-meta text-meta-foreground">
                            <span className="font-mono">Score {item.scorePct}%</span>
                            {" · "}
                            {item.relativeTime}
                          </span>
                        </div>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-meta-foreground"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </header>
  );
}

function ContextRow({ label, link }: { label: string; link: TraceContextLink }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-meta-foreground text-label">{label}</dt>
      <dd>
        <Link
          href={link.href}
          className="rounded-sm text-foreground transition-colors hover:text-primary hover:underline"
        >
          {link.label}
        </Link>
      </dd>
    </div>
  );
}

function PlainRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-meta-foreground text-label">{label}</dt>
      <dd className="text-foreground text-label">{value}</dd>
    </div>
  );
}

function Separator() {
  return <span aria-hidden="true" className="text-meta-foreground">·</span>;
}
