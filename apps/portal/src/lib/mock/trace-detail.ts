// Trace detail mock. Adapted from a real trajectory JSON. The page
// consumes a flattened step list interleaved from the trajectory's
// `inference.messages` + `tools/call.mcp` spans, plus a small handful of
// header / facts / config fields. Raw JSON is kept on the detail for the
// "Raw data" accordion.

export type TraceStepKind =
  | "setup"
  | "inference"
  | "tool_call"
  | "tool_result"
  | "final";

export type TraceStepStatus = "ok" | "suspicious" | "error";

export type TraceVisibility = "Private" | "Public";

export interface TraceStep {
  /** 1-based step index. */
  number: number;
  kind: TraceStepKind;
  /** Short label rendered in the step list ("Tool call: left_click"). */
  label: string;
  status: TraceStepStatus;
  /** Absolute time from rollout start, mm:ss ("00:01"). */
  timeLabel: string;
  /** Plain-language summary used in the detail card under the label. */
  summary: string;
  /** When present, rendered as a screenshot above the JSON in the detail card. */
  observationUrl?: string;
  /** Short input recap (mono one-liner). Falls back to JSON when omitted. */
  inputLabel?: string;
  /** Short output recap (mono one-liner). Falls back to JSON when omitted. */
  outputLabel?: string;
  /** Whether this row is a key agent-decision moment (filters timeline + step pager). Non-key rows are noise: per-span detail that shares a frame with the nearest key step. */
  isKey: boolean;
  /** Underlying span — round-trips into the Raw JSON accordion section. */
  rawSpan: unknown;
}

export interface TraceContextLink {
  /** "Evaluation - Claude Haiku 4.5". */
  label: string;
  /** Stub href (`/jobs/<id>` etc). */
  href: string;
}

export interface TraceContext {
  job: TraceContextLink;
  environment: TraceContextLink;
  model: TraceContextLink;
  taskset: TraceContextLink;
}

export interface TraceEvaluation {
  done: boolean;
  reward: number;
  isError: boolean;
}

export interface TracePerformance {
  totalCost: number;
  inferenceCost: number;
  environmentCost: number;
  inferenceCalls: number;
  agentActions: number;
  agentSteps: number;
  mcpToolSteps: number;
  baseMcpSteps: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgOutputTokensPerCall: number;
  maxOutputTokensPerCall: number;
  environmentHourlyRate: number;
  environmentBaselineCost: number;
  environmentBaselineMinutes: number;
  environmentTransactions: number;
  environmentStillRunning: boolean;
}

export interface TraceMetadata {
  /** Echoed task prompt, the long form. */
  prompt: string;
  /** Container image SHA — surfaced in the Metadata section. */
  image: string;
  /** Trace display name. */
  traceName: string;
}

export interface TraceTask {
  /** Short slug ("0001"). */
  slug: string;
  /** Scenario id ("browser:todo-create"). */
  scenarioId: string;
  /** Args passed into the prompt. */
  args: Record<string, string>;
  /** Display title used in the H1 (the resolved task prompt). */
  promptTitle: string;
}

export interface TraceDetail {
  /** Short slug — the URL key. */
  id: string;
  /** Raw trace UUID for the Metadata accordion. */
  rawId: string;
  task: TraceTask;
  context: TraceContext;
  /** Status — `failed` when reward === 0 and `done === true`; `errored` when
   * `isError`; `passed` otherwise. */
  status: "passed" | "failed" | "errored";
  /** 0..1 reward. */
  reward: number;
  /** "Claude Haiku 4.5" — display label. */
  modelLabel: string;
  /** "browser:todo-create" — mono scenario label for header. */
  scenarioLabel: string;
  /** "33s" — total wall-clock. */
  durationLabel: string;
  /** "$0.08" — total cost rounded for header. */
  costLabel: string;
  /** "19 days ago" — relative timestamp. */
  createdRelativeLabel: string;
  /** ISO timestamp for tooltips. */
  createdAt: string;
  visibility: TraceVisibility;
  evaluation: TraceEvaluation;
  performance: TracePerformance;
  metadata: TraceMetadata;
  /** Ordered step list. */
  steps: ReadonlyArray<TraceStep>;
  /** Raw trajectory JSON — round-trip for the bottom "Raw data" accordion. */
  raw: unknown;
}

// ─── Trace 0001 — browser:todo-create, "check errands" ──────────────────────

const TRAJECTORY_0001 = [
  {
    name: "prompts/get.mcp",
    span_id: "c9322ebb4d674175",
    start_time: "2026-05-29T00:51:16.846417+00:00",
    end_time: "2026-05-29T00:51:27.963107+00:00",
    attributes: {
      category: "mcp",
      request: {
        method: "prompts/get",
        params: {
          name: "browser:todo-create",
          arguments: { title: "check errands" },
        },
      },
      result: {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                'Create a new todo item with the title: "check errands"...',
            },
          },
        ],
      },
    },
  },
  {
    name: "inference.messages",
    span_id: "ad6c6fad560e418a",
    start_time: "2026-05-29T00:51:29.432462+00:00",
    end_time: "2026-05-29T00:51:29.738868+00:00",
    attributes: {
      category: "inference-2",
      result: {
        content:
          "I'll help you create a new todo item. Let me start by taking a screenshot to see the todo app.",
        tool_calls: [
          {
            function: {
              arguments: '{"action": "screenshot"}',
              name: "computer",
            },
            id: "toolu_01FhwQfMD6VgXMsXnMn5Z1th",
            type: "function",
          },
        ],
      },
      model: "anthropic/claude-haiku-4-5-20251001",
      duration_ms: 306,
      input_tokens: 3195,
      output_tokens: 66,
    },
  },
  {
    name: "tools/call.mcp",
    span_id: "0ca63972acb14c0c",
    start_time: "2026-05-29T00:51:30.262960+00:00",
    end_time: "2026-05-29T00:51:31.727665+00:00",
    attributes: {
      category: "mcp",
      request: {
        method: "tools/call",
        params: {
          name: "anthropic_computer",
          arguments: { action: "screenshot" },
        },
      },
      result: {
        content: [
          { type: "image", data: "[IMAGE REDACTED]", mimeType: "image/png" },
        ],
        isError: false,
      },
      has_screenshot: true,
    },
    internal_type: "mcp-screenshot",
    observation_url:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/0.png",
  },
  {
    name: "inference.messages",
    span_id: "a424518584504989",
    start_time: "2026-05-29T00:51:32.795040+00:00",
    end_time: "2026-05-29T00:51:33.935579+00:00",
    attributes: {
      category: "inference-2",
      result: {
        content:
          'Perfect! I can see the Todo App is loaded. There\'s an "Add New Item" section with a Title input field. Now I\'ll click on the Title field and type "check errands".',
        tool_calls: [
          {
            function: {
              arguments:
                '{"action": "left_click", "coordinate": [700,283]}',
              name: "computer",
            },
          },
        ],
      },
      model: "anthropic/claude-haiku-4-5-20251001",
      duration_ms: 1140,
      output_tokens: 108,
      has_screenshot: true,
    },
    observation_url:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/1.png",
  },
  {
    name: "tools/call.mcp",
    span_id: "17847faffde3425b",
    start_time: "2026-05-29T00:51:34.657300+00:00",
    end_time: "2026-05-29T00:51:36.260722+00:00",
    attributes: {
      category: "mcp",
      request: {
        method: "tools/call",
        params: {
          name: "anthropic_computer",
          arguments: {
            action: "left_click",
            coordinate: [700, 283],
          },
        },
      },
    },
    observation_url:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/2.png",
  },
  {
    name: "inference.messages",
    span_id: "dcf2b19331e14ec2",
    start_time: "2026-05-29T00:51:37.256072+00:00",
    end_time: "2026-05-29T00:51:38.040016+00:00",
    attributes: {
      category: "inference-2",
      result: {
        content:
          'Good, I\'ve clicked on the Title field. Now I\'ll type "check errands" into it.',
        tool_calls: [
          {
            function: {
              arguments: '{"action": "type", "text": "check errands"}',
              name: "computer",
            },
          },
        ],
      },
      duration_ms: 784,
      output_tokens: 84,
    },
    observation_url:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/3.png",
  },
  {
    name: "tools/call.mcp",
    span_id: "fce628a75a3c40bc",
    start_time: "2026-05-29T00:51:38.650883+00:00",
    end_time: "2026-05-29T00:51:39.767652+00:00",
    attributes: {
      category: "mcp",
      request: {
        method: "tools/call",
        params: {
          name: "anthropic_computer",
          arguments: { action: "type", text: "check errands" },
        },
      },
    },
    observation_url:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/4.png",
  },
  {
    name: "inference.messages",
    span_id: "967eb600041e4fc1",
    start_time: "2026-05-29T00:51:41.186094+00:00",
    end_time: "2026-05-29T00:51:41.960874+00:00",
    attributes: {
      category: "inference-2",
      result: {
        content:
          "I notice the text didn't appear in the Title field. Let me click on the Title field again to ensure it's focused, and then type the text.",
        tool_calls: [
          {
            function: {
              arguments:
                '{"action": "left_click", "coordinate": [700,283]}',
              name: "computer",
            },
          },
        ],
      },
      duration_ms: 775,
      output_tokens: 99,
    },
    observation_url:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/5.png",
  },
  {
    name: "tools/call.mcp",
    span_id: "41d62efe6b9b4ea8",
    start_time: "2026-05-29T00:51:43.087727+00:00",
    end_time: "2026-05-29T00:51:44.610522+00:00",
    attributes: {
      category: "mcp",
      request: {
        method: "tools/call",
        params: {
          name: "anthropic_computer",
          arguments: {
            action: "left_click",
            coordinate: [700, 283],
          },
        },
      },
    },
    observation_url:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/6.png",
  },
  {
    name: "inference.messages",
    span_id: "986e643d295a41bf",
    start_time: "2026-05-29T00:51:46.203294+00:00",
    end_time: "2026-05-29T00:51:46.715850+00:00",
    attributes: {
      category: "inference-2",
      result: {
        content:
          "Let me try using the hud_computer function to interact with the field:",
        tool_calls: [
          {
            function: {
              arguments: '{"action": "click", "x": 700, "y": 283}',
              name: "hud_computer",
            },
          },
        ],
      },
      duration_ms: 513,
      output_tokens: 96,
    },
    observation_url:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/7.png",
  },
  {
    name: "tools/call.mcp",
    span_id: "30a9d7de6a134a76",
    start_time: "2026-05-29T00:51:47.342453+00:00",
    end_time: "2026-05-29T00:51:48.770118+00:00",
    attributes: {
      category: "mcp",
      request: {
        method: "tools/call",
        params: {
          name: "hud_computer",
          arguments: { action: "click", x: 700, y: 283 },
        },
      },
    },
    observation_url:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/8.png",
  },
  {
    name: "resources/read.mcp",
    span_id: "fac7b69b021c4064",
    start_time: "2026-05-29T00:51:49.070641+00:00",
    end_time: "2026-05-29T00:51:49.490398+00:00",
    attributes: {
      category: "mcp",
      request: {
        method: "resources/read",
        params: { uri: "browser:todo-create" },
      },
      result: {
        contents: [
          {
            uri: "browser:todo-create",
            text: '{"reward": 0.0, "done": true, "info": {}, "isError": false}',
          },
        ],
      },
    },
  },
] as const;

const RAW_0001 = {
  id: "f1a8e576-2db1-4543-866c-5e7249594d8a",
  task_id: null,
  description:
    'Create a new todo item with the title: "check errands"\n\nUs',
  tags: [],
  reward: 0.0,
  logs:
    '00:49:36 [INFO] hud.environment.connectors.remote: Connecting to hub environment: hud-browser\n00:49:36 [INFO] hud.environment.connectors.remote: Hub connected: hud-browser\n00:49:36 [INFO] httpx: HTTP Request: GET https://gahludmjcsmszgyufydt.supabase.co/rest/v1/task_runs?select=status&id=eq.f1a8e576-2db1-4543-866c-5e7249594d8a "HTTP/2 200 OK"\n00:49:36 [INFO] hud_backend.rollouts.tasks: Starting rollout execution for job 0601bc5e-f398-4e00-bfb2-6e01aff5b160 (trace_id=f1a8e576-2db1-4543-866c-5e7249594d8a) with agent claude (task={\'env\': {\'name\': \'hud-browser\'}, \'scenario\': \'browser:todo-create\', \'id\': \'85eff2ce-e4df-4762-9b94-1eafb522180c\', \'slug\': \'0001\', \'args\': {\'title\': \'check errands\'}, \'validation\': None, \'agent_config\': None, \'columns\': {}, \'metadata\': {}})\n00:49:36 [INFO] httpx: HTTP Request: POST https://api.hud.ai/trace/f1a8e576-2db1-4543-866c-5e7249594d8a/enter "HTTP/1.1 202 Accepted"\n00:51:15 [INFO] httpx: HTTP Request: POST https://mcp.hud.ai/v3/mcp "HTTP/1.1 200 OK"\n00:51:28 [WARNING] celery.redirected: Discovered 6 tools\n00:51:28 [WARNING] celery.redirected: Agent initialized with 5 tools: api_request, computer, hud_computer, launch_app, playwright\n00:51:31 [WARNING] celery.redirected: Step 1/5\n00:51:31 [WARNING] celery.redirected:   → anthropic_computer({"action":"screenshot"})\n00:51:31 [WARNING] celery.redirected:   ✓ Image\n00:51:36 [WARNING] celery.redirected: Step 2/5\n00:51:36 [WARNING] celery.redirected:   → anthropic_computer({"action":"left_click","coordinate":[700,283]})\n00:51:36 [WARNING] celery.redirected:   ✓ Image\n00:51:39 [WARNING] celery.redirected: Step 3/5\n00:51:39 [WARNING] celery.redirected:   → anthropic_computer({"action":"type","text":"check errands"})\n00:51:39 [WARNING] celery.redirected:   ✓ Image\n00:51:44 [WARNING] celery.redirected: Step 4/5\n00:51:44 [WARNING] celery.redirected:   → anthropic_computer({"action":"left_click","coordinate":[700,283]})\n00:51:44 [WARNING] celery.redirected:   ✓ Image\n00:51:48 [WARNING] celery.redirected: Step 5/5\n00:51:48 [WARNING] celery.redirected:   → hud_computer({"action":"click","x":700,"y":283})\n00:51:48 [WARNING] celery.redirected:   ✓ Image\n00:51:54 [WARNING] celery.redirected: ✓ \'85eff2ce-e4df-4762-9b94-1eafb522180c\' complete!\n  Reward: 0.000\n',
  error: null,
  metadata: {
    trace_name: 'Create a new todo item with the title: "check errands"',
    image:
      "156041433621.dkr.ecr.us-east-1.amazonaws.com/hud-reg-24176be5-ceea-4b18-aca4-42851795b672:0.1.0@sha256:007b33f63b0d6eca33a5737f30dc95cff763721be89678288775ce50a95dac49",
    prompt:
      'Create a new todo item with the title: "check errands"\n\nUse the browser to:\n1. Take a screenshot to see the todo app\n2. Find the input field for new todos\n3. Type the title and submit\n\nThe todo title must be exactly: check errands',
    base_mcp_steps: 0,
    mcp_tool_steps: 5,
    agent_steps: 5,
    usage: {
      total_cost: 0.0635,
      agent_actions: 7,
      inference_cost: 0.0218,
      inference_calls: 5,
      environment_cost: 0.0417,
      total_input_tokens: 3223,
      total_output_tokens: 453,
      environment_hourly_rate: 0.5,
      environment_transactions: 1,
      environment_baseline_cost: 0.0417,
      environment_still_running: false,
      avg_output_tokens_per_call: 90.6,
      max_output_tokens_per_call: 108,
      environment_baseline_minutes: 5,
    },
    evaluation_result: {
      done: true,
      reward: 0.0,
      isError: false,
    },
  },
  trajectory: TRAJECTORY_0001,
  created_at: "2026-05-29T00:49:36.076702+00:00",
  gold_file_url: null,
} as const;

const STEPS_0001: ReadonlyArray<TraceStep> = [
  {
    number: 1,
    kind: "setup",
    label: "Setup complete",
    status: "ok",
    timeLabel: "00:00",
    summary:
      "Resolved browser:todo-create prompt with arg title=check errands.",
    inputLabel: 'prompts/get · browser:todo-create · {"title":"check errands"}',
    outputLabel: 'Resolved prompt text (1 user message)',
    isKey: true,
    rawSpan: TRAJECTORY_0001[0],
  },
  {
    number: 2,
    kind: "inference",
    label: "Agent message",
    status: "ok",
    timeLabel: "00:01",
    summary: "Plans the open: take a screenshot to see the todo app state.",
    inputLabel: "3,195 input tokens · claude-haiku-4-5",
    outputLabel:
      '66 tokens · tool_call: computer({"action":"screenshot"})',
    isKey: false,
    rawSpan: TRAJECTORY_0001[1],
  },
  {
    number: 3,
    kind: "tool_call",
    label: "Tool call: screenshot",
    status: "ok",
    timeLabel: "00:02",
    summary: "Captured the todo app — Add New Item form visible.",
    inputLabel: 'anthropic_computer · {"action":"screenshot"}',
    outputLabel: "Image returned · isError=false",
    observationUrl:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/0.png",
    isKey: true,
    rawSpan: TRAJECTORY_0001[2],
  },
  {
    number: 4,
    kind: "inference",
    label: "Agent message",
    status: "ok",
    timeLabel: "00:04",
    summary:
      "Identifies the Title input. Plans a click on coordinate [700, 283].",
    inputLabel: "claude-haiku-4-5 · 108 output tokens",
    outputLabel:
      'tool_call: computer({"action":"left_click","coordinate":[700,283]})',
    observationUrl:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/1.png",
    isKey: false,
    rawSpan: TRAJECTORY_0001[3],
  },
  {
    number: 5,
    kind: "tool_call",
    label: "Tool call: left_click",
    status: "ok",
    timeLabel: "00:06",
    summary: "Clicked the Title input field at [700, 283].",
    inputLabel:
      'anthropic_computer · {"action":"left_click","coordinate":[700,283]}',
    outputLabel: "Image returned",
    observationUrl:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/2.png",
    isKey: true,
    rawSpan: TRAJECTORY_0001[4],
  },
  {
    number: 6,
    kind: "inference",
    label: "Agent message",
    status: "ok",
    timeLabel: "00:08",
    summary: 'Plans to type "check errands" into the focused field.',
    inputLabel: "claude-haiku-4-5 · 84 output tokens",
    outputLabel:
      'tool_call: computer({"action":"type","text":"check errands"})',
    observationUrl:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/3.png",
    isKey: false,
    rawSpan: TRAJECTORY_0001[5],
  },
  {
    number: 7,
    kind: "tool_call",
    label: "Tool call: type",
    status: "ok",
    timeLabel: "00:09",
    summary: 'Typed "check errands" — but no visible text appears in the field.',
    inputLabel: 'anthropic_computer · {"action":"type","text":"check errands"}',
    outputLabel: "Image returned",
    observationUrl:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/4.png",
    isKey: true,
    rawSpan: TRAJECTORY_0001[6],
  },
  {
    number: 8,
    kind: "inference",
    label: "Agent message — recovery attempt",
    status: "suspicious",
    timeLabel: "00:11",
    summary:
      "Notices the text didn't land. Decides to re-click the Title field to re-focus.",
    inputLabel: "claude-haiku-4-5 · 99 output tokens",
    outputLabel:
      'tool_call: computer({"action":"left_click","coordinate":[700,283]})',
    observationUrl:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/5.png",
    isKey: true,
    rawSpan: TRAJECTORY_0001[7],
  },
  {
    number: 9,
    kind: "tool_call",
    label: "Tool call: left_click (retry)",
    status: "suspicious",
    timeLabel: "00:13",
    summary:
      "Repeated click at the same coordinate. Field still does not appear focused.",
    inputLabel:
      'anthropic_computer · {"action":"left_click","coordinate":[700,283]}',
    outputLabel: "Image returned",
    observationUrl:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/6.png",
    isKey: true,
    rawSpan: TRAJECTORY_0001[8],
  },
  {
    number: 10,
    kind: "inference",
    label: "Agent message — switch tool",
    status: "suspicious",
    timeLabel: "00:16",
    summary:
      "Falls back to hud_computer.click — different tool, same coordinate.",
    inputLabel: "claude-haiku-4-5 · 96 output tokens",
    outputLabel: 'tool_call: hud_computer({"action":"click","x":700,"y":283})',
    observationUrl:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/7.png",
    isKey: false,
    rawSpan: TRAJECTORY_0001[9],
  },
  {
    number: 11,
    kind: "tool_call",
    label: "Tool call: hud_computer.click",
    status: "suspicious",
    timeLabel: "00:17",
    summary:
      "hud_computer fallback path — click registered, todo still not created.",
    inputLabel: 'hud_computer · {"action":"click","x":700,"y":283}',
    outputLabel: "Image returned",
    observationUrl:
      "https://gahludmjcsmszgyufydt.supabase.co/storage/v1/object/public/screenshots/f1a8e576-2db1-4543-866c-5e7249594d8a/8.png",
    isKey: true,
    rawSpan: TRAJECTORY_0001[10],
  },
  {
    number: 12,
    kind: "final",
    label: "Evaluation: reward 0.0",
    status: "error",
    timeLabel: "00:19",
    summary:
      'Grader reads the resource — done=true, reward=0.0. Todo "check errands" was never persisted.',
    inputLabel: "resources/read · browser:todo-create",
    outputLabel: '{"reward": 0.0, "done": true, "isError": false}',
    isKey: true,
    rawSpan: TRAJECTORY_0001[11],
  },
];

const TRACE_0001: TraceDetail = {
  id: "0001",
  rawId: "f1a8e576-2db1-4543-866c-5e7249594d8a",
  task: {
    slug: "0001",
    scenarioId: "browser:todo-create",
    args: { title: "check errands" },
    promptTitle: 'Create a new todo item with the title: "check errands"',
  },
  context: {
    job: { label: "Evaluation - Claude Haiku 4.5", href: "/jobs/job_haiku_eval_0001" },
    environment: { label: "hud-browser Build 0.1.0", href: "/environments/hud-browser" },
    model: { label: "Claude Haiku 4.5", href: "/models/claude-haiku-4-5" },
    taskset: { label: "hud-browser", href: "/tasksets/hud-browser" },
  },
  status: "failed",
  reward: 0.0,
  modelLabel: "Claude Haiku 4.5",
  scenarioLabel: "browser:todo-create",
  durationLabel: "33s",
  costLabel: "$0.08",
  createdRelativeLabel: "19 days ago",
  createdAt: "2026-05-29T00:49:36.076702+00:00",
  visibility: "Private",
  evaluation: {
    done: true,
    reward: 0.0,
    isError: false,
  },
  performance: {
    totalCost: 0.0635,
    inferenceCost: 0.0218,
    environmentCost: 0.0417,
    inferenceCalls: 5,
    agentActions: 7,
    agentSteps: 5,
    mcpToolSteps: 5,
    baseMcpSteps: 0,
    totalInputTokens: 3223,
    totalOutputTokens: 453,
    avgOutputTokensPerCall: 90.6,
    maxOutputTokensPerCall: 108,
    environmentHourlyRate: 0.5,
    environmentBaselineCost: 0.0417,
    environmentBaselineMinutes: 5,
    environmentTransactions: 1,
    environmentStillRunning: false,
  },
  metadata: {
    prompt:
      'Create a new todo item with the title: "check errands"\n\nUse the browser to:\n1. Take a screenshot to see the todo app\n2. Find the input field for new todos\n3. Type the title and submit\n\nThe todo title must be exactly: check errands',
    image:
      "156041433621.dkr.ecr.us-east-1.amazonaws.com/hud-reg-24176be5-ceea-4b18-aca4-42851795b672:0.1.0@sha256:007b33f63b0d6eca33a5737f30dc95cff763721be89678288775ce50a95dac49",
    traceName: 'Create a new todo item with the title: "check errands"',
  },
  steps: STEPS_0001,
  raw: RAW_0001,
};

// ─── Trace 0002 — passing counterpart, for /traces/0002 ──────────────────────
// Synthetic minimal-pass partner so the not-found / passing-trace UI is also
// reachable. Same scenario family, different slug.

const STEPS_0002: ReadonlyArray<TraceStep> = [
  {
    number: 1,
    kind: "setup",
    label: "Setup complete",
    status: "ok",
    timeLabel: "00:00",
    summary: "Resolved browser:todo-create prompt with arg title=ship release notes.",
    isKey: true,
    rawSpan: { name: "prompts/get.mcp", note: "synthetic-pass" },
  },
  {
    number: 2,
    kind: "tool_call",
    label: "Tool call: screenshot",
    status: "ok",
    timeLabel: "00:01",
    summary: "Captured the todo app — input cleanly visible.",
    isKey: true,
    rawSpan: { name: "tools/call.mcp", note: "synthetic-pass" },
  },
  {
    number: 3,
    kind: "tool_call",
    label: "Tool call: type",
    status: "ok",
    timeLabel: "00:04",
    summary: 'Typed "ship release notes" into the focused field.',
    isKey: true,
    rawSpan: { name: "tools/call.mcp", note: "synthetic-pass" },
  },
  {
    number: 4,
    kind: "tool_call",
    label: "Tool call: submit",
    status: "ok",
    timeLabel: "00:06",
    summary: "Pressed Add — new todo persisted.",
    isKey: true,
    rawSpan: { name: "tools/call.mcp", note: "synthetic-pass" },
  },
  {
    number: 5,
    kind: "final",
    label: "Evaluation: reward 1.0",
    status: "ok",
    timeLabel: "00:08",
    summary: "Grader confirmed the todo title exactly matches.",
    isKey: true,
    rawSpan: { name: "resources/read.mcp", note: "synthetic-pass" },
  },
];

const TRACE_0002: TraceDetail = {
  id: "0002",
  rawId: "synthetic-0002",
  task: {
    slug: "0002",
    scenarioId: "browser:todo-create",
    args: { title: "ship release notes" },
    promptTitle:
      'Create a new todo item with the title: "ship release notes"',
  },
  context: {
    job: { label: "Evaluation - Claude Haiku 4.5", href: "/jobs/job_haiku_eval_0001" },
    environment: { label: "hud-browser Build 0.1.0", href: "/environments/hud-browser" },
    model: { label: "Claude Haiku 4.5", href: "/models/claude-haiku-4-5" },
    taskset: { label: "hud-browser", href: "/tasksets/hud-browser" },
  },
  status: "passed",
  reward: 1.0,
  modelLabel: "Claude Haiku 4.5",
  scenarioLabel: "browser:todo-create",
  durationLabel: "12s",
  costLabel: "$0.04",
  createdRelativeLabel: "19 days ago",
  createdAt: "2026-05-29T00:51:00.000000+00:00",
  visibility: "Private",
  evaluation: { done: true, reward: 1.0, isError: false },
  performance: {
    totalCost: 0.0411,
    inferenceCost: 0.011,
    environmentCost: 0.0301,
    inferenceCalls: 3,
    agentActions: 4,
    agentSteps: 3,
    mcpToolSteps: 3,
    baseMcpSteps: 0,
    totalInputTokens: 2104,
    totalOutputTokens: 188,
    avgOutputTokensPerCall: 62.7,
    maxOutputTokensPerCall: 88,
    environmentHourlyRate: 0.5,
    environmentBaselineCost: 0.0301,
    environmentBaselineMinutes: 5,
    environmentTransactions: 1,
    environmentStillRunning: false,
  },
  metadata: {
    prompt:
      'Create a new todo item with the title: "ship release notes"',
    image:
      "156041433621.dkr.ecr.us-east-1.amazonaws.com/hud-reg-24176be5-ceea-4b18-aca4-42851795b672:0.1.0",
    traceName:
      'Create a new todo item with the title: "ship release notes"',
  },
  steps: STEPS_0002,
  raw: { note: "synthetic passing trace — not from a real rollout" },
};

const TRACES_BY_ID: Record<string, TraceDetail> = {
  [TRACE_0001.id]: TRACE_0001,
  [TRACE_0002.id]: TRACE_0002,
};

export function getTraceById(id: string): TraceDetail | null {
  return TRACES_BY_ID[id] ?? null;
}
