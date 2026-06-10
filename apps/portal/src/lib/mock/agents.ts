/**
 * Mock agents data — shaped to mirror the eventual API contract.
 *
 * Two flavors:
 *   - `PresetAgent` — platform-standard QA agents. Config is fixed; users attach
 *     them to Tasksets. Always kind="qa".
 *   - `UserAgent` — user-created agents. Kind ∈ {qa, automation, chat}. Has
 *     an owner; supports edit/duplicate/delete via the catalog kebab menu.
 *
 * Relative time strings are pre-baked (the API will return ISO timestamps;
 * formatter would live in @repo/libs once introduced).
 */

export type AgentKind = "qa" | "automation" | "chat";

/** A single output field emitted by an agent. Mirrors a JSON schema property. */
export type AgentSchemaFieldType =
  | "number"
  | "string"
  | "boolean"
  | "object"
  | "array";

export interface AgentSchemaField {
  name: string;
  type: AgentSchemaFieldType;
  description: string;
}

export interface PresetAgent {
  id: string;
  name: string;
  description: string;
  scenarioId: string;
  model: string;
  /** Total runs across all attachments. */
  runCount: number;
  /** Human relative timestamp e.g. "2h ago" / "3d ago". Null = never run. */
  lastRun: string | null;
  /** Number of user-owned Tasksets this preset is currently attached to. */
  attachedTasksetCount: number;
  /**
   * Estimated cost per run in USD. Null = estimate unavailable (renders as "—"
   * with a tooltip).
   */
  costPerRun: number | null;
  /**
   * Tasksets this preset is attached to by default (initial server state). The
   * detail dialog uses this as the baseline for batch-edit; in-memory mutations
   * live in `agent-attachments.ts`.
   */
  initialAttachedTasksetIds: ReadonlyArray<string>;
  /** Output schema fields surfaced in the detail dialog. */
  outputSchema: ReadonlyArray<AgentSchemaField>;
}

export interface UserAgent {
  id: string;
  name: string;
  description: string;
  kind: AgentKind;
  scenarioId: string;
  model: string;
  runCount: number;
  lastRun: string | null;
  /** Sort surrogate: lower = newer. Stable across reloads. */
  createdOrder: number;
  /**
   * Tasksets this user agent is attached to by default (initial server state).
   * Mirrors `PresetAgent.initialAttachedTasksetIds`; in-memory mutations live
   * in `agent-attachments.ts`.
   */
  initialAttachedTasksetIds: ReadonlyArray<string>;
}

/** Payload accepted by `createUserAgent`. Required fields vary by kind:
 *  - automation: `name`, `environmentId`, `scenarioId`
 *  - qa:         `scenarioId` (name optional — falls back to scenario)
 *  - chat:       `name`, `environmentId`
 *  Model defaults to "Claude Sonnet 4.5" when omitted.
 */
export interface CreateUserAgentInput {
  kind: AgentKind;
  name?: string;
  scenarioId?: string;
  environmentId?: string;
  model?: string;
  systemPrompt?: string;
}

// ── Preset (Standard QA) agents ─────────────────────────────────────────────

const PROMPT_ALIGNMENT_SCHEMA: ReadonlyArray<AgentSchemaField> = [
  {
    name: "confidence",
    type: "number",
    description:
      "0.9 = sharp misalignment proof with a direct grader quote; 0.5 = two reasonable readings exist; 0.2 = guessing.",
  },
  {
    name: "grader_check",
    type: "string",
    description:
      "The specific grader check or expectation that matters for the verdict, quoted or summarized concretely.",
  },
  {
    name: "is_prompt_misaligned",
    type: "boolean",
    description:
      "True only if you can state a concrete proof that a solution satisfying the visible requirements could still fail.",
  },
  {
    name: "misalignment_proof",
    type: "string",
    description:
      "Required when is_prompt_misaligned=true: one sentence of the form 'A solution could satisfy every visible prompt requirement and still fail because <check X> requires <condition Y>.'",
  },
];

const FAILURE_ANALYSIS_SCHEMA: ReadonlyArray<AgentSchemaField> = [
  {
    name: "first_divergence_step",
    type: "number",
    description:
      "Zero-indexed step at which the trace first deviates from an expected trajectory.",
  },
  {
    name: "divergence_cause",
    type: "string",
    description:
      "One-line description of the failure mode at the first-divergence step (e.g. 'tool returned stale data', 'planner skipped subgoal').",
  },
  {
    name: "is_recoverable",
    type: "boolean",
    description:
      "True if a corrective prompt or tool re-call could plausibly recover from the divergence.",
  },
  {
    name: "evidence_quote",
    type: "string",
    description:
      "Verbatim model output or tool response that proves the divergence cause.",
  },
];

const TOOL_USAGE_SCHEMA: ReadonlyArray<AgentSchemaField> = [
  {
    name: "tool_call_count",
    type: "number",
    description: "Total number of tool calls across the trace.",
  },
  {
    name: "redundant_calls",
    type: "number",
    description:
      "Number of tool calls that returned data already available from a prior call in the same trace.",
  },
  {
    name: "hallucinated_calls",
    type: "array",
    description:
      "Array of tool calls whose arguments could not have been derived from prior trace state — likely confabulated.",
  },
  {
    name: "per_tool_precision",
    type: "object",
    description:
      "Map of tool-name → precision (0–1), where precision = useful_calls / total_calls for that tool.",
  },
];

const TRAJECTORY_COHERENCE_SCHEMA: ReadonlyArray<AgentSchemaField> = [
  {
    name: "coherence_score",
    type: "number",
    description:
      "0–1 mean step-to-step consistency. 1.0 = every step extends prior context; 0 = pure noise.",
  },
  {
    name: "backtrack_count",
    type: "number",
    description:
      "Count of steps that undo or contradict an earlier step in the same trace.",
  },
  {
    name: "loop_detected",
    type: "boolean",
    description:
      "True if the trace repeats a state-action pattern more than twice without progress.",
  },
];

const DOM_ASSERTION_SCHEMA: ReadonlyArray<AgentSchemaField> = [
  {
    name: "assertions_total",
    type: "number",
    description: "Total number of assertions evaluated against the final DOM.",
  },
  {
    name: "assertions_passed",
    type: "number",
    description: "Number of assertions that matched the target contract.",
  },
  {
    name: "first_failure_selector",
    type: "string",
    description:
      "Minimal CSS selector for the first failing assertion. Empty string when all pass.",
  },
];

export const presetAgents: ReadonlyArray<PresetAgent> = [
  {
    id: "preset-failure-analysis",
    name: "Failure Analysis",
    description:
      "Triages failing traces by inspecting step-level reward, tool calls, and reasoning. Surfaces the earliest divergence from the expected trajectory.",
    scenarioId: "trace-explorer:failure_analysis",
    model: "Claude Sonnet 4.5",
    runCount: 1284,
    lastRun: "12m ago",
    attachedTasksetCount: 3,
    costPerRun: 0.04,
    initialAttachedTasksetIds: ["hud-browser", "browser-bench", "rl-coding-eval"],
    outputSchema: FAILURE_ANALYSIS_SCHEMA,
  },
  {
    id: "preset-prompt-alignment",
    name: "Prompt Alignment Analysis",
    description:
      "Scores each trace against the original system prompt and task spec. Flags off-policy steps and reports per-task alignment drift.",
    scenarioId: "trace-explorer:prompt_alignment_analysis",
    model: "Claude Sonnet 4.5",
    runCount: 642,
    lastRun: "2h ago",
    attachedTasksetCount: 1,
    costPerRun: 0.04,
    initialAttachedTasksetIds: ["hud-browser"],
    outputSchema: PROMPT_ALIGNMENT_SCHEMA,
  },
  {
    id: "preset-tool-usage",
    name: "Tool Usage Analysis",
    description:
      "Profiles the agent's tool-call distribution and identifies inefficient or hallucinated tool invocations. Outputs per-tool precision/recall.",
    scenarioId: "trace-explorer:tool_usage_analysis",
    model: "Claude Opus 4.7",
    runCount: 318,
    lastRun: "1d ago",
    attachedTasksetCount: 0,
    costPerRun: 0.12,
    initialAttachedTasksetIds: [],
    outputSchema: TOOL_USAGE_SCHEMA,
  },
  {
    id: "preset-trajectory-coherence",
    name: "Trajectory Coherence",
    description:
      "Measures step-to-step consistency across a trajectory. Detects backtracking, redundant steps, and reasoning loops that bloat trace length.",
    scenarioId: "trace-explorer:trajectory_coherence",
    model: "GPT-4o",
    runCount: 91,
    lastRun: "4d ago",
    attachedTasksetCount: 0,
    costPerRun: 0.03,
    initialAttachedTasksetIds: [],
    outputSchema: TRAJECTORY_COHERENCE_SCHEMA,
  },
  {
    id: "preset-dom-assertion",
    name: "DOM Assertion",
    description:
      "Verifies browser-eval traces against a target DOM contract. Reports per-assertion pass/fail and minimal repro selectors for failures.",
    scenarioId: "browser-eval:dom_assertion",
    model: "Claude Sonnet 4.5",
    runCount: 0,
    lastRun: null,
    attachedTasksetCount: 0,
    costPerRun: null,
    initialAttachedTasksetIds: [],
    outputSchema: DOM_ASSERTION_SCHEMA,
  },
];

export function getPresetAgent(id: string): PresetAgent | undefined {
  return presetAgents.find((a) => a.id === id);
}

// ── User agents (mixed kinds) ───────────────────────────────────────────────

export const userAgents: ReadonlyArray<UserAgent> = [
  {
    id: "user-claude-haiku-qa",
    name: "claude-haiku-qa",
    description:
      "QA regression sweep across hud-browser tasks. Runs nightly on the staging Taskset, scores against the v3 reward function.",
    kind: "qa",
    scenarioId: "trace-explorer:failure_analysis",
    model: "Claude Sonnet 4.5",
    runCount: 47,
    lastRun: "23m ago",
    createdOrder: 1,
    initialAttachedTasksetIds: ["hud-browser"],
  },
  {
    id: "user-gpt5-regression",
    name: "gpt5-tooluse-regression",
    description:
      "Compares tool-usage profiles across model checkpoints. Flags regressions ≥ 5% on per-tool precision.",
    kind: "qa",
    scenarioId: "trace-explorer:tool_usage_analysis",
    model: "GPT-4o",
    runCount: 18,
    lastRun: "3h ago",
    createdOrder: 2,
    initialAttachedTasksetIds: ["tool-use-bench", "hud-browser"],
  },
  {
    id: "user-prompt-drift-watch",
    name: "prompt-drift-watch",
    description:
      "Daily alignment scoring against the locked v2.1 system prompt. Reports drift > 0.05 to the platform-alerts channel.",
    kind: "automation",
    scenarioId: "trace-explorer:prompt_alignment_analysis",
    model: "Claude Opus 4.7",
    runCount: 312,
    lastRun: "1h ago",
    createdOrder: 3,
    initialAttachedTasksetIds: ["hud-browser", "agentic-web-shopping"],
  },
  {
    id: "user-ci-smoke",
    name: "ci-smoke-runs",
    description:
      "Triggered on every merge to main. Runs a 4-task smoke set and posts pass/fail to the CI status check.",
    kind: "automation",
    scenarioId: "browser-eval:dom_assertion",
    model: "Claude Sonnet 4.5",
    runCount: 1142,
    lastRun: "8m ago",
    createdOrder: 4,
    initialAttachedTasksetIds: ["browser-bench"],
  },
  {
    id: "user-research-chat",
    name: "research-scratchpad",
    description:
      "Free-form interactive chat over the hud-browser trace index. Used for exploratory failure analysis before formalizing a QA Agent.",
    kind: "chat",
    scenarioId: "trace-explorer:failure_analysis",
    model: "Claude Opus 4.7",
    runCount: 26,
    lastRun: "5h ago",
    createdOrder: 5,
    initialAttachedTasksetIds: ["hud-browser"],
  },
  {
    id: "user-coherence-watch",
    name: "coherence-watchdog",
    description:
      "Weekly batch over the rl-coding-eval Taskset. Surfaces tasks whose trajectory length grew >20% week-over-week.",
    kind: "qa",
    scenarioId: "trace-explorer:trajectory_coherence",
    model: "GPT-4o",
    runCount: 9,
    lastRun: "2d ago",
    createdOrder: 6,
    initialAttachedTasksetIds: ["rl-coding-eval"],
  },
  {
    id: "user-nightly-eval",
    name: "nightly-eval-sweep",
    description:
      "Runs the full QA preset stack against the latest agent checkpoint at 02:00 UTC. Posts a summary to the on-call digest.",
    kind: "automation",
    scenarioId: "trace-explorer:failure_analysis",
    model: "Claude Sonnet 4.5",
    runCount: 64,
    lastRun: "9h ago",
    createdOrder: 7,
    initialAttachedTasksetIds: ["hud-browser", "rl-coding-eval", "swe-bench-verified"],
  },
  {
    id: "user-tool-explorer",
    name: "tool-call-explorer",
    description:
      "Conversational interface for inspecting tool-call patterns across a single trace. Returns a step-keyed JSON summary on request.",
    kind: "chat",
    scenarioId: "trace-explorer:tool_usage_analysis",
    model: "Claude Sonnet 4.5",
    runCount: 4,
    lastRun: "6d ago",
    createdOrder: 8,
    initialAttachedTasksetIds: ["tool-use-bench"],
  },
  {
    id: "user-browser-assert",
    name: "browser-assert-runner",
    description:
      "Ad-hoc DOM assertion runner for one-off browser regressions. Output piped to the trace viewer's assertion panel.",
    kind: "qa",
    scenarioId: "browser-eval:dom_assertion",
    model: "Claude Sonnet 4.5",
    runCount: 0,
    lastRun: null,
    createdOrder: 9,
    initialAttachedTasksetIds: ["browser-bench"],
  },
  {
    id: "user-grpo-eval",
    name: "grpo-checkpoint-eval",
    description:
      "Evaluates fresh GRPO checkpoints against the rl-coding-eval Taskset before promoting them to the leaderboard.",
    kind: "automation",
    scenarioId: "trace-explorer:failure_analysis",
    model: "Claude Opus 4.7",
    runCount: 21,
    lastRun: "2w ago",
    createdOrder: 10,
    initialAttachedTasksetIds: ["rl-coding-eval", "math-eval"],
  },
];

// ── Mutable user-agent store (mock create flow) ─────────────────────────────
//
// Seeded from the static `userAgents` list above. New agents created via the
// `+ New Agent` drawer append here and propagate to the catalog via
// `subscribeUserAgents` / `useSyncExternalStore`. No persistence — resets on
// hard reload, which is acceptable for the demo. Mirrors the existing
// `agent-attachments` store pattern.

type Listener = () => void;

const userAgentList: UserAgent[] = [...userAgents];
let userAgentSnapshot: ReadonlyArray<UserAgent> = Object.freeze([...userAgentList]);
const userAgentListeners = new Set<Listener>();

function rebuildUserAgentSnapshot(): void {
  userAgentSnapshot = Object.freeze([...userAgentList]);
}

function notifyUserAgentListeners(): void {
  for (const listener of userAgentListeners) listener();
}

export function getUserAgents(): ReadonlyArray<UserAgent> {
  return userAgentSnapshot;
}

export function subscribeUserAgents(listener: Listener): () => void {
  userAgentListeners.add(listener);
  return () => {
    userAgentListeners.delete(listener);
  };
}

/** Auto-id used when the user does not supply a name. Each kind gets its own
 * counter so ids stay grouped + readable in the catalog. */
const autoIdCounters: Record<AgentKind, number> = {
  qa: 0,
  automation: 0,
  chat: 0,
};

function autoNameFor(kind: AgentKind): string {
  autoIdCounters[kind] += 1;
  const n = String(autoIdCounters[kind]).padStart(2, "0");
  switch (kind) {
    case "qa":
      return `qa-agent-${n}`;
    case "automation":
      return `automation-${n}`;
    case "chat":
      return `chat-agent-${n}`;
  }
}

/**
 * Append a new user agent to the in-memory store. Resolves after a short
 * delay to simulate a network round-trip; the drawer renders a saving spinner
 * during this window.
 */
export async function createUserAgent(
  input: CreateUserAgentInput,
): Promise<UserAgent> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const name = input.name?.trim() || autoNameFor(input.kind);
  const scenarioId = input.scenarioId ?? input.environmentId ?? "—";
  const model = input.model ?? "Claude Sonnet 4.5";

  const description = describeAgent(input.kind, {
    name,
    environmentId: input.environmentId,
    scenarioId: input.scenarioId,
  });

  // createdOrder: lower = newer. New agents take 0 and shift the rest down.
  for (const a of userAgentList) {
    (a as { createdOrder: number }).createdOrder += 1;
  }

  const created: UserAgent = {
    id: `user-${input.kind}-${Date.now().toString(36)}`,
    name,
    description,
    kind: input.kind,
    scenarioId,
    model,
    runCount: 0,
    lastRun: null,
    createdOrder: 0,
    initialAttachedTasksetIds: [],
  };

  userAgentList.unshift(created);
  rebuildUserAgentSnapshot();
  notifyUserAgentListeners();
  return created;
}

function describeAgent(
  kind: AgentKind,
  ctx: { name: string; environmentId?: string; scenarioId?: string },
): string {
  switch (kind) {
    case "qa":
      return ctx.scenarioId
        ? `QA agent running ${ctx.scenarioId} on attached Tasksets.`
        : "QA agent — scenario unset.";
    case "automation":
      return ctx.environmentId && ctx.scenarioId
        ? `Automation running ${ctx.scenarioId} on ${ctx.environmentId}.`
        : "Automation — config incomplete.";
    case "chat":
      return ctx.environmentId
        ? `Multi-turn conversation against ${ctx.environmentId}.`
        : "Chat agent — environment unset.";
  }
}
