"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@repo/ui/lib/cn";
import { IconButton } from "@repo/ui/components/icon-button";
import { Switch } from "@repo/ui/components/switch";
import { SegmentedControl } from "@repo/ui/components/segmented-control";
import type { TraceDetail } from "@/lib/mock/trace-detail";

interface TraceLogsProps {
  trace: TraceDetail;
}

type PanelKey = "env" | "worker";

const PANEL_TITLES: Record<PanelKey, string> = {
  env: "Environment Logs",
  worker: "Worker Logs",
};

// Persistent header chrome on the dark code surface — IconButton ghost
// defaults are tuned for light surfaces, so glyphs disappear against
// `bg-code-bg`. Lift to `code-fg` with a softened idle state and add a
// faint foreground wash on hover for affordance.
const LOG_HEADER_ICON_BTN =
  "text-code-fg/70 hover:text-code-fg hover:bg-foreground/5";

export function TraceLogs({ trace }: TraceLogsProps) {
  const [collapsed, setCollapsed] = useState<Record<PanelKey, boolean>>({
    env: false,
    worker: false,
  });
  const [fullscreen, setFullscreen] = useState<PanelKey | null>(null);

  const toggleCollapsed = (key: PanelKey) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const openFullscreen = (key: PanelKey) => setFullscreen(key);
  const closeFullscreen = () => setFullscreen(null);

  useEffect(() => {
    if (!fullscreen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const deriveFor = (key: PanelKey): (() => ReadonlyArray<string>) =>
    key === "env" ? () => synthEnvLogs(trace) : () => synthWorkerLogs(trace);

  return (
    <div className="flex flex-col gap-4">
      <LogPanel
        title={PANEL_TITLES.env}
        derive={deriveFor("env")}
        collapsed={collapsed.env}
        onToggleCollapsed={() => toggleCollapsed("env")}
        onRequestFullscreen={() => openFullscreen("env")}
      />
      <LogPanel
        title={PANEL_TITLES.worker}
        derive={deriveFor("worker")}
        collapsed={collapsed.worker}
        onToggleCollapsed={() => toggleCollapsed("worker")}
        onRequestFullscreen={() => openFullscreen("worker")}
      />
      {fullscreen && (
        <LogPanelFullscreen
          initialSource={fullscreen}
          deriveFor={deriveFor}
          onClose={closeFullscreen}
          trace={trace}
        />
      )}
    </div>
  );
}

interface LogPanelProps {
  title: string;
  derive: () => ReadonlyArray<string>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onRequestFullscreen: () => void;
}

function LogPanel({
  title,
  derive,
  collapsed,
  onToggleCollapsed,
  onRequestFullscreen,
}: LogPanelProps) {
  const logs = useLogs(derive);

  return (
    <section className="overflow-hidden rounded-md border border-border bg-code-bg">
      <LogPanelHeader
        title={title}
        entryCount={logs.lines.length}
        autoScroll={logs.autoScroll}
        onAutoScrollChange={logs.setAutoScroll}
        onRefresh={logs.refresh}
        onCopy={logs.copy}
        isRefreshing={logs.isRefreshing}
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
        trailing={
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`Expand ${title}`}
            type="button"
            onClick={onRequestFullscreen}
            className={LOG_HEADER_ICON_BTN}
          >
            <Maximize2 aria-hidden="true" />
          </IconButton>
        }
      />
      {!collapsed && (
        <LogBody
          lines={logs.lines}
          bodyRef={logs.bodyRef}
          className="max-h-96 overflow-auto"
        />
      )}
    </section>
  );
}

interface LogPanelFullscreenProps {
  initialSource: PanelKey;
  deriveFor: (key: PanelKey) => () => ReadonlyArray<string>;
  onClose: () => void;
  trace: TraceDetail;
}

function LogPanelFullscreen({
  initialSource,
  deriveFor,
  onClose,
  trace,
}: LogPanelFullscreenProps) {
  const [activeSource, setActiveSource] = useState<PanelKey>(initialSource);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${PANEL_TITLES[activeSource]} fullscreen`}
      className="fixed inset-0 z-50 flex flex-col bg-code-bg"
    >
      <FullscreenTitleRow trace={trace} />
      {/* Remount on source switch so log state (autoScroll, isRefreshing, lines) resets. */}
      <FullscreenSourceView
        key={activeSource}
        source={activeSource}
        onSourceChange={setActiveSource}
        derive={deriveFor(activeSource)}
        onClose={onClose}
      />
    </div>
  );
}

function FullscreenTitleRow({ trace }: { trace: TraceDetail }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-code-border px-3 py-2">
      <h2 className="text-subtitle font-semibold text-code-fg">Logs</h2>
      <span className="text-meta-foreground">·</span>
      <span className="min-w-0 truncate text-body text-code-fg">
        {trace.task.promptTitle}
      </span>
    </div>
  );
}

interface FullscreenSourceViewProps {
  source: PanelKey;
  onSourceChange: (next: PanelKey) => void;
  derive: () => ReadonlyArray<string>;
  onClose: () => void;
}

function FullscreenSourceView({
  source,
  onSourceChange,
  derive,
  onClose,
}: FullscreenSourceViewProps) {
  const title = PANEL_TITLES[source];
  const logs = useLogs(derive);

  return (
    <>
      <div className="flex items-center border-b border-code-border px-3 py-2">
        <div className="ml-auto flex items-center gap-2">
          <LogPanelControls
            title={title}
            autoScroll={logs.autoScroll}
            onAutoScrollChange={logs.setAutoScroll}
            onRefresh={logs.refresh}
            onCopy={logs.copy}
            isRefreshing={logs.isRefreshing}
            collapsed={false}
            onToggleCollapsed={onClose}
          />
          {/* Compact override: shrink root + items vs the default h-8/px-3/text-body
              so the chrome reads as a secondary control, not the title. */}
          <SegmentedControl
            aria-label="Log source"
            value={source}
            onValueChange={(v) => onSourceChange(v as PanelKey)}
            className={cn(
              "h-7 text-label",
              "[&_[data-slot=segmented-control-item]]:px-2",
              "[&_[data-slot=segmented-control-item]]:text-label",
            )}
          >
            <SegmentedControl.Item value="env">Environment</SegmentedControl.Item>
            <SegmentedControl.Item value="worker">Worker</SegmentedControl.Item>
          </SegmentedControl>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`Exit fullscreen ${title}`}
            type="button"
            onClick={onClose}
            className={LOG_HEADER_ICON_BTN}
          >
            <Minimize2 aria-hidden="true" />
          </IconButton>
        </div>
      </div>
      <div className="flex items-baseline gap-2 border-b border-code-border px-3 py-2">
        <h3 className="text-body font-medium text-code-fg">{title}</h3>
        <span className="text-meta-foreground">·</span>
        <span className="font-mono text-meta text-meta-foreground">
          {logs.lines.length} entries
        </span>
      </div>
      <LogBody
        lines={logs.lines}
        bodyRef={logs.bodyRef}
        className="flex-1 min-h-0 overflow-y-auto"
      />
    </>
  );
}

interface LogBodyProps {
  lines: ReadonlyArray<string>;
  bodyRef: React.RefObject<HTMLPreElement | null>;
  className?: string;
}

function LogBody({ lines, bodyRef, className }: LogBodyProps) {
  return (
    <pre
      ref={bodyRef}
      className={cn("p-3 font-mono text-meta text-code-fg", className)}
    >
      {lines.map((line, i) => (
        <LogLine key={i} line={line} />
      ))}
    </pre>
  );
}

function LogLine({ line }: { line: string }) {
  const copyLine = async () => {
    try {
      await navigator.clipboard.writeText(line);
      toast.success("Line copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="group/line relative flex items-start justify-between gap-2">
      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
        {line}
      </span>
      <button
        type="button"
        aria-label="Copy line"
        onClick={copyLine}
        className="shrink-0 opacity-0 transition-opacity group-hover/line:opacity-100 text-muted-foreground hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Copy aria-hidden="true" className="size-3" />
      </button>
    </div>
  );
}

interface LogPanelHeaderProps {
  title: string;
  entryCount: number;
  autoScroll: boolean;
  onAutoScrollChange: (v: boolean) => void;
  onRefresh: () => void;
  onCopy: () => void;
  isRefreshing: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  trailing: React.ReactNode;
}

function LogSourceStats({
  title,
  entryCount,
}: {
  title: string;
  entryCount: number;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <h3 className="text-subtitle font-semibold text-code-fg">{title}</h3>
      <span className="font-mono text-meta text-code-muted">
        {entryCount} entries
      </span>
    </div>
  );
}

function LogPanelHeader({
  title,
  entryCount,
  autoScroll,
  onAutoScrollChange,
  onRefresh,
  onCopy,
  isRefreshing,
  collapsed,
  onToggleCollapsed,
  trailing,
}: LogPanelHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-code-border px-3 py-2">
      <LogSourceStats title={title} entryCount={entryCount} />
      <div className="ml-auto flex items-center gap-2">
        <LogPanelControls
          title={title}
          autoScroll={autoScroll}
          onAutoScrollChange={onAutoScrollChange}
          onRefresh={onRefresh}
          onCopy={onCopy}
          isRefreshing={isRefreshing}
          collapsed={collapsed}
          onToggleCollapsed={onToggleCollapsed}
        />
        {trailing}
      </div>
    </header>
  );
}

interface LogPanelControlsProps {
  title: string;
  autoScroll: boolean;
  onAutoScrollChange: (v: boolean) => void;
  onRefresh: () => void;
  onCopy: () => void;
  isRefreshing: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

function LogPanelControls({
  title,
  autoScroll,
  onAutoScrollChange,
  onRefresh,
  onCopy,
  isRefreshing,
  collapsed,
  onToggleCollapsed,
}: LogPanelControlsProps) {
  return (
    <>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
        aria-expanded={!collapsed}
        type="button"
        onClick={onToggleCollapsed}
        className={LOG_HEADER_ICON_BTN}
      >
        {collapsed ? (
          <ChevronDown aria-hidden="true" />
        ) : (
          <ChevronUp aria-hidden="true" />
        )}
      </IconButton>
      <label className="flex items-center gap-2 text-label text-code-muted">
        <span>Auto-scroll</span>
        <Switch
          checked={autoScroll}
          onCheckedChange={onAutoScrollChange}
          size="sm"
          aria-label={`Auto-scroll ${title}`}
        />
      </label>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={`Refresh ${title}`}
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className={LOG_HEADER_ICON_BTN}
      >
        <RefreshCw
          aria-hidden="true"
          className={cn(isRefreshing && "animate-spin")}
        />
      </IconButton>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={`Copy ${title}`}
        type="button"
        onClick={onCopy}
        className={LOG_HEADER_ICON_BTN}
      >
        <Copy aria-hidden="true" />
      </IconButton>
    </>
  );
}

interface LogState {
  lines: ReadonlyArray<string>;
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
  isRefreshing: boolean;
  refresh: () => void;
  copy: () => void;
  bodyRef: React.RefObject<HTMLPreElement | null>;
}

function useLogs(derive: () => ReadonlyArray<string>): LogState {
  const [lines, setLines] = useState<ReadonlyArray<string>>(() => derive());
  const [autoScroll, setAutoScroll] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const bodyRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    if (!autoScroll) return;
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [autoScroll, lines]);

  const refresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setLines(derive());
    toast("Refreshed");
    window.setTimeout(() => setIsRefreshing(false), 600);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Logs copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return {
    lines,
    autoScroll,
    setAutoScroll,
    isRefreshing,
    refresh,
    copy,
    bodyRef,
  };
}

// Demo-surface only: build plausible log lines from existing mock data
// (step time labels + tool names) so the panel reads as a real timeline.
// `wallClock()` is called per-render so refresh re-derives "now-ish"
// timestamps on the start/end lines.

const ENV_PREFIX = "[env]";
const WORKER_PREFIX = "[worker]";

function synthEnvLogs(trace: TraceDetail): ReadonlyArray<string> {
  const lines: string[] = [];
  const startedAt = wallClock(0);
  lines.push(
    `${startedAt} ${ENV_PREFIX} starting environment ${trace.context.environment.label}`,
  );
  lines.push(
    `${startedAt} ${ENV_PREFIX} pulled image ${shortImage(trace.metadata.image)}`,
  );
  lines.push(
    `${startedAt} ${ENV_PREFIX} attached worker pool (size=3) for taskset ${trace.context.taskset.label}`,
  );
  for (const step of trace.steps) {
    lines.push(`${step.timeLabel} ${ENV_PREFIX} step ${step.number}: ${step.label}`);
    if (step.observationUrl) {
      lines.push(
        `${step.timeLabel} ${ENV_PREFIX} captured observation frame ${frameId(step.observationUrl)}`,
      );
    }
  }
  lines.push(
    `${trace.durationLabel} ${ENV_PREFIX} environment shut down — total cost ${trace.costLabel}`,
  );
  while (lines.length < 30) {
    const sec = String(lines.length).padStart(2, "0");
    lines.push(`00:00:${sec} ${ENV_PREFIX} heartbeat ok`);
  }
  return lines;
}

function synthWorkerLogs(trace: TraceDetail): ReadonlyArray<string> {
  const lines: string[] = [];
  lines.push(
    `${wallClock(0)} ${WORKER_PREFIX} worker-3a1f connected · model ${trace.modelLabel}`,
  );
  lines.push(
    `${wallClock(0)} ${WORKER_PREFIX} loaded scenario ${trace.task.scenarioId}`,
  );
  for (const step of trace.steps) {
    if (step.kind === "inference") {
      lines.push(
        `${step.timeLabel} ${WORKER_PREFIX} inference call · ${step.outputLabel ?? "tool_call"}`,
      );
    } else if (step.kind === "tool_call") {
      lines.push(
        `${step.timeLabel} ${WORKER_PREFIX} dispatched ${step.inputLabel ?? "tool_call"}`,
      );
    } else if (step.kind === "final") {
      lines.push(
        `${step.timeLabel} ${WORKER_PREFIX} grader returned ${step.outputLabel ?? "result"}`,
      );
    } else {
      lines.push(`${step.timeLabel} ${WORKER_PREFIX} ${step.label}`);
    }
  }
  lines.push(`${trace.durationLabel} ${WORKER_PREFIX} worker-3a1f detached`);
  while (lines.length < 30) {
    const sec = String(lines.length).padStart(2, "0");
    lines.push(`00:00:${sec} ${WORKER_PREFIX} idle`);
  }
  return lines;
}

function wallClock(offsetSec: number): string {
  const d = new Date(Date.now() + offsetSec * 1000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function shortImage(image: string): string {
  const at = image.indexOf("@");
  if (at === -1) return image;
  return `${image.slice(0, at)}@${image.slice(at + 1, at + 19)}…`;
}

function frameId(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1] ?? url;
}
