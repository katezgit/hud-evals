/**
 * QA Agent workflow scenarios — fixture for the New QA Agent form.
 *
 * Shape mirrors what a future `GET /api/agents/scenarios?kind=qa` would return:
 *  - `id` is the addressable scenario identifier ("trace-explorer:analyze").
 *  - `name` is the bare scenario name shown on the tile.
 *  - `namespace` is the env/source group ("trace-explorer") — the small mono
 *    sub-line on each tile.
 *  - `mode` is the run mode badge displayed inline next to the name. Right now
 *    only "per-trace" exists; modeled as a union so a future "per-task" mode
 *    can be added without a callsite change.
 */
export type WorkflowScenarioMode = "per-trace";

export interface WorkflowScenario {
  id: string;
  name: string;
  namespace: string;
  mode: WorkflowScenarioMode;
  description: string;
}

export const qaWorkflowScenarios: ReadonlyArray<WorkflowScenario> = [
  {
    id: "trace-explorer:analyze",
    name: "analyze",
    namespace: "trace-explorer",
    mode: "per-trace",
    description: "Analyze a HUD trace to answer a query.",
  },
  {
    id: "trace-explorer:failure_analysis",
    name: "failure_analysis",
    namespace: "trace-explorer",
    mode: "per-trace",
    description:
      "Analyze why a trace failed — find all problems, not just a single root cause.",
  },
  {
    id: "trace-explorer:false_negative_analysis",
    name: "false_negative_analysis",
    namespace: "trace-explorer",
    mode: "per-trace",
    description:
      "Determine whether a low-reward trace is a false negative.",
  },
  {
    id: "trace-explorer:false_positive_analysis",
    name: "false_positive_analysis",
    namespace: "trace-explorer",
    mode: "per-trace",
    description:
      "Determine whether a passing trace is a false positive.",
  },
  {
    id: "trace-explorer:prompt_alignment_analysis",
    name: "prompt_alignment_analysis",
    namespace: "trace-explorer",
    mode: "per-trace",
    description:
      "Score a trace against the original system prompt and task spec; flag off-policy steps.",
  },
  {
    id: "trace-explorer:reward_hacking_analysis",
    name: "reward_hacking_analysis",
    namespace: "trace-explorer",
    mode: "per-trace",
    description:
      "Detect whether the agent gamed the reward signal instead of completing the task.",
  },
  {
    id: "trace-explorer:tool_usage_analysis",
    name: "tool_usage_analysis",
    namespace: "trace-explorer",
    mode: "per-trace",
    description:
      "Profile tool-call distribution; surface redundant or hallucinated invocations.",
  },
  {
    id: "trace-explorer:trajectory_coherence",
    name: "trajectory_coherence",
    namespace: "trace-explorer",
    mode: "per-trace",
    description:
      "Measure step-to-step consistency; detect backtracks, loops, and redundant steps.",
  },
];
