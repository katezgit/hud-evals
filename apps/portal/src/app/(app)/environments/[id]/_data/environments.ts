import type { Build, EnvActivity, Environment, Instance } from "./types";

/**
 * Mock environment catalog for the demo. Three entries exercise the
 * key states on the detail page:
 *
 *  - `browser`      — HUD cloud browser; full conditional-tab set; required vars unset
 *  - `playwright`   — local sandbox; all required + optional pre-filled
 *  - `local-shell`  — zero env vars, custom env with no scenarios surface
 *
 * The catalog also includes Explore-tab stubs (public, cross-org) and
 * Team-tab stubs (team-visible, distributed across 4 mock owners) to
 * exercise the tab-aware filter bar.
 */

const HOUR_MS = 60 * 60 * 1000;
/** Fixed mock "now" — Jun 11 2026 10:00 UTC. Static for SSR determinism. */
const MOCK_NOW = Date.UTC(2026, 5, 11, 10, 0, 0);

/**
 * Team-tab mock owners — keep small (4) so the Owner filter dropdown produces
 * visibly different sets when toggled. The literal type drives `TeamStubInput`
 * so a typo in a stub entry is caught at build time.
 */
type TeamOwner = "Alex Park" | "Sam Vega" | "Riley Chen" | "Jordan Wu";

const BROWSER_BUILDS: ReadonlyArray<Build> = [
  {
    id: "b-1-4-2",
    version: "v1.4.2",
    isLatest: true,
    status: "SUCCEEDED",
    changedBy: "aman@researchlab.ai",
    duration: "2m 14s",
    deployedAt: "3h ago",
  },
  {
    id: "b-1-4-1-building",
    version: "v1.4.1",
    isLatest: false,
    status: "BUILDING",
    changedBy: "ci-bot",
    duration: null,
    deployedAt: "started 12m ago",
  },
  {
    id: "b-1-4-0-failed",
    version: "v1.4.0",
    isLatest: false,
    status: "FAILED",
    changedBy: "aman@researchlab.ai",
    duration: "0m 41s",
    deployedAt: "5h ago",
  },
  {
    id: "b-1-3-9-queued",
    version: "v1.3.9",
    isLatest: false,
    status: "QUEUED",
    changedBy: "ci-bot",
    duration: null,
    deployedAt: "queued 6h ago",
  },
  {
    id: "b-1-3-8",
    version: "v1.3.8",
    isLatest: false,
    status: "SUCCEEDED",
    changedBy: "kate@hud.ai",
    duration: "1m 58s",
    deployedAt: "2d ago",
  },
];

const BROWSER_INSTANCES: ReadonlyArray<Instance> = [
  {
    id: "inst-a7f3c2e",
    status: "running",
    modelOrAgent: "claude-opus-4-5",
    startedAt: "12m ago",
    duration: "12m 4s",
  },
  {
    id: "inst-b9d14f1",
    status: "idle",
    modelOrAgent: "gpt-5-1",
    startedAt: "1h ago",
    duration: "58m 12s",
  },
  {
    id: "inst-e4c003b",
    status: "terminated",
    modelOrAgent: "claude-haiku-4-5",
    startedAt: "3h ago",
    duration: "4m 33s",
  },
];

const ENVIRONMENTS: ReadonlyArray<Environment> = [
  {
    id: "browser",
    name: "browserbase",
    organization: "HUD",
    owner: "HUD",
    visibility: "public",
    type: "browser",
    starCount: 18,
    isStarred: false,
    runsLast24h: 47,
    lastActiveAt: MOCK_NOW - 2 * HOUR_MS,
    source: "github.com/hud-ai/browser",
    createdAt: "Mar 12, 2025",
    lastDeployedAt: "3h ago",
    description:
      "This is a hud implementation of https://www.browserbase.com/. The {code:GCP_CREDENTIALS_BASE64} variable is optional for sheets-based tasks for loading a google sheet into the browser.",
    vars: [
      {
        key: "BROWSERBASE_API_KEY",
        required: true,
        description: "Your Browserbase project API key.",
        link: {
          label: "Get an API key →",
          href: "https://settings.browserbase.com/keys",
        },
        format: "32-char hex",
      },
      {
        key: "BROWSERBASE_PROJECT_ID",
        required: true,
        description: "Your Browserbase project identifier.",
        link: {
          label: "Find in dashboard →",
          href: "https://settings.browserbase.com/projects",
        },
      },
      { key: "DISPLAY_HEIGHT", required: false },
      { key: "DISPLAY_WIDTH", required: false },
      {
        key: "GCP_CREDENTIALS_BASE64",
        required: false,
        description:
          "GCP service account credentials for sheets-based tasks. Optional — only needed for spreadsheet scenarios.",
        link: {
          label: "Encode credentials →",
          href: "https://www.base64encode.org/",
        },
        format: "base64-encoded JSON",
      },
    ],
    scenarios: [
      {
        id: "answer",
        name: "browser:answer",
        description:
          "Generic task where agent browses and returns an answer. The agent explores the page(s), then yields a final answer which is compared against the expected value (if provided).",
        requiresVars: ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"],
        usedBy: "browsing-eval-v3",
        params: [
          { name: "query", type: "string", default: "Who founded Anthropic?" },
        ],
        schema: [
          {
            key: "query",
            label: "Query",
            type: "string",
            required: true,
            default: "Who founded Anthropic?",
            placeholder: "Open-ended research question",
          },
          {
            key: "max_sources",
            label: "Max sources",
            type: "integer",
            required: false,
            default: 5,
          },
        ],
      },
      {
        id: "fill-record",
        name: "browser:fill-record",
        description:
          "Fill form fields and verify values via selectors. The agent fills in form fields. Evaluation checks that the specified selectors contain the expected values.",
        requiresVars: ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"],
        params: [
          {
            name: "target",
            type: "string",
            default: "https://forms.example.com/contact",
          },
        ],
        schema: [
          {
            key: "target",
            label: "Form URL",
            type: "string",
            required: true,
            default: "https://forms.example.com/contact",
          },
          {
            key: "submit_after_fill",
            label: "Submit after fill",
            type: "boolean",
            required: false,
            default: true,
          },
        ],
      },
      {
        id: "sheet-from-file",
        name: "browser:sheet-from-file",
        description:
          "Create a sheet from an Excel file and complete a task.",
        requiresVars: ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"],
        params: [
          { name: "target", type: "string", default: "data/leads.csv" },
        ],
        schema: [
          {
            key: "target",
            label: "CSV path",
            type: "string",
            required: true,
            default: "data/leads.csv",
          },
        ],
      },
      {
        id: "wiki-speedrun",
        name: "browser:wiki-speedrun",
        description:
          "Navigate Wikipedia from start to target using only link clicks. The agent must navigate from one Wikipedia article to another by clicking links. Fewer clicks = higher reward.",
        requiresVars: ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"],
        usedBy: "speedrun-bench",
        params: [
          {
            name: "target",
            type: "string",
            default: "https://en.wikipedia.org/wiki/Kevin_Bacon",
          },
        ],
        schema: [
          {
            key: "target",
            label: "Target article URL",
            type: "string",
            required: true,
            default: "https://en.wikipedia.org/wiki/Kevin_Bacon",
          },
          {
            key: "max_hops",
            label: "Max hops",
            type: "integer",
            required: false,
            default: 6,
          },
        ],
      },
    ],
    tools: [
      {
        name: "playwright",
        description: "Web automation tool using Playwright",
        params: [
          {
            name: "action",
            type: "string",
            required: true,
            description:
              "The action to perform (navigate, screenshot, click, type, get_page_info, wait_for_element)",
          },
          {
            name: "url",
            type: "string | null",
            default: "null",
            description: "URL to navigate to (for navigate action)",
          },
        ],
      },
      {
        name: "computer",
        description: "Control computer with mouse, keyboard, and screenshots",
        params: [
          {
            name: "action",
            type: "string",
            required: true,
            description:
              "The action name (click, press, keydown, keyup, write, scroll, move, wait, drag, response, screenshot, position, hold_key, mouse_down, mouse_up)",
            values: [
              "click",
              "press",
              "keydown",
              "keyup",
              "write",
              "scroll",
              "move",
              "wait",
              "drag",
              "response",
              "screenshot",
              "position",
              "hold_key",
              "mouse_down",
              "mouse_up",
            ],
          },
          {
            name: "x",
            type: "integer | null",
            description: "X coordinate for click/move/area actions",
          },
        ],
      },
      {
        name: "anthropic_computer",
        description: "Control computer with mouse, keyboard, and screenshot",
        params: [
          {
            name: "action",
            type: "string",
            required: true,
            description: "The action to perform on the computer",
          },
          {
            name: "coordinate",
            type: "array | null",
            default: "null",
            description:
              "The coordinate to interact with on the computer [x, y]",
          },
          {
            name: "x",
            type: "integer | null",
            description: "X coordinate for click/move/area actions",
          },
        ],
      },
      {
        name: "openai_computer",
        description: "Control computer with mouse, keyboard, and screenshots",
        params: [
          {
            name: "type",
            type: "string",
            required: true,
            description: "The action type to perform",
            values: [
              "screenshot",
              "click",
              "double_click",
              "scroll",
              "type",
              "wait",
              "move",
              "keypress",
              "drag",
              "response",
              "custom",
            ],
          },
          {
            name: "x",
            type: "integer | null",
            description: "X coordinate for click/move/area actions",
          },
        ],
      },
    ],
    snippets: {
      mcp: `{
  "mcpServers": {
    "hud-browser": {
      "command": "npx",
      "args": ["-y", "@hud/mcp", "env", "run", "browser"],
      "env": {
        "BROWSERBASE_API_KEY": "\${BROWSERBASE_API_KEY}",
        "BROWSERBASE_PROJECT_ID": "\${BROWSERBASE_PROJECT_ID}"
      }
    }
  }
}`,
      python: `import hud

env = hud.environments.get("browser")
session = env.start(
    vars={
        "BROWSERBASE_API_KEY": "...",
        "BROWSERBASE_PROJECT_ID": "...",
    },
)

result = session.run("Open google.com and search for 'hud evals'.")
print(result.transcript)`,
    },
    tabs: { scenarios: true, builds: true, instances: true },
    builds: BROWSER_BUILDS,
    instances: BROWSER_INSTANCES,
  },
  {
    id: "playwright",
    name: "playwright-sandbox",
    organization: "Anthropic Research",
    owner: "Anthropic Research",
    visibility: "public",
    type: "browser",
    starCount: 8,
    isStarred: false,
    runsLast24h: 12,
    lastActiveAt: MOCK_NOW - 28 * HOUR_MS,
    source: "github.com/hud-ai/playwright-sandbox",
    createdAt: "Feb 4, 2025",
    lastDeployedAt: "1d ago",
    description:
      "Headless Playwright sandbox running on local infra — no external API keys needed. Use this for deterministic browser eval scenarios where you control the target site. Optional {code:HEADFUL} flips to a visible browser window for debugging.",
    vars: [
      {
        key: "BROWSER_CONCURRENCY",
        required: true,
        initialValue: "4",
        description:
          "Maximum parallel browser contexts per worker. Higher values speed up batch evals at the cost of memory.",
        format: "1–16",
      },
      {
        key: "DEFAULT_TIMEOUT_MS",
        required: true,
        initialValue: "30000",
        description:
          "Default Playwright operation timeout. Applied to navigation, selectors, and tool calls when no explicit timeout is passed.",
        format: "milliseconds",
      },
      {
        key: "HEADFUL",
        required: false,
        initialValue: "false",
        description:
          "Run with a visible browser window. Useful for live debugging; leave off for batch runs.",
        format: "true | false",
      },
      {
        key: "USER_AGENT",
        required: false,
        initialValue:
          "Mozilla/5.0 (HUD-Eval) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0",
        description:
          "User-Agent string sent on every request. Override to match a specific browser fingerprint.",
      },
    ],
    scenarios: [
      {
        id: "smoke-test",
        name: "smoke-test",
        description:
          "Navigate to about:blank, take a screenshot, close. Confirms the harness wiring end-to-end.",
        requiresVars: ["BROWSER_CONCURRENCY", "DEFAULT_TIMEOUT_MS"],
        usedBy: "playwright-smoke",
        params: [
          { name: "target", type: "string", default: "about:blank" },
        ],
        schema: [
          {
            key: "target",
            label: "Target URL",
            type: "string",
            required: true,
            default: "about:blank",
          },
        ],
      },
      {
        id: "form-fill-local",
        name: "form-fill-local",
        description:
          "Open a local form fixture and complete it field-by-field. Useful for testing tool determinism.",
        requiresVars: ["BROWSER_CONCURRENCY", "DEFAULT_TIMEOUT_MS"],
        params: [
          { name: "target", type: "string", default: "fixtures/form.html" },
        ],
        schema: [
          {
            key: "target",
            label: "Fixture path",
            type: "string",
            required: true,
            default: "fixtures/form.html",
          },
          {
            key: "iterations",
            label: "Iterations",
            type: "integer",
            required: false,
            default: 1,
          },
        ],
      },
    ],
    tools: [
      {
        name: "playwright",
        description:
          "Direct Playwright bindings. No vision layer — selector-driven.",
        params: [
          { name: "action", type: "string" },
          { name: "selector", type: "string" },
          { name: "value", type: "string", optional: true },
        ],
      },
      {
        name: "screenshot",
        description: "Capture the current viewport and persist it to the trace.",
        params: [{ name: "fullPage", type: "boolean", optional: true }],
      },
    ],
    snippets: {
      mcp: `{
  "mcpServers": {
    "hud-playwright": {
      "command": "npx",
      "args": ["-y", "@hud/mcp", "env", "run", "playwright"]
    }
  }
}`,
      python: `import hud

env = hud.environments.get("playwright")
session = env.start()

result = session.run("Navigate to https://example.com and read the heading.")
print(result.transcript)`,
    },
    tabs: { scenarios: true, builds: true, instances: true },
    builds: [
      {
        id: "pw-0-9-1",
        version: "v0.9.1",
        isLatest: true,
        status: "SUCCEEDED",
        changedBy: "kate@hud.ai",
        duration: "1m 12s",
        deployedAt: "1d ago",
      },
      {
        id: "pw-0-9-0",
        version: "v0.9.0",
        isLatest: false,
        status: "SUCCEEDED",
        changedBy: "kate@hud.ai",
        duration: "1m 5s",
        deployedAt: "4d ago",
      },
    ],
    instances: [],
  },
  {
    id: "local-shell",
    name: "local-shell",
    organization: "HUD",
    owner: "Alex Park",
    visibility: "team",
    type: "code-swe",
    starCount: 0,
    isStarred: false,
    runsLast24h: 4,
    lastActiveAt: MOCK_NOW - 6 * HOUR_MS,
    source: "internal/local-shell",
    createdAt: "Jan 18, 2025",
    lastDeployedAt: "4d ago",
    description:
      "Sandboxed POSIX shell with the standard coreutils, git, and a writable scratch directory. No credentials needed — runs entirely inside the HUD sandbox. Use this for code-review, file-shaping, and small repro evals.",
    vars: [],
    scenarios: [
      {
        id: "git-bisect",
        name: "git-bisect",
        description:
          "Clone a repo, bisect to find the commit that introduced a regression, and write a one-line root-cause note.",
        requiresVars: [],
        usedBy: "shell-debugging-bench",
        params: [
          {
            name: "target",
            type: "string",
            default: "https://github.com/example/repo",
          },
        ],
        schema: [
          {
            key: "target",
            label: "Repo URL",
            type: "string",
            required: true,
            default: "https://github.com/example/repo",
          },
        ],
      },
      {
        id: "patch-and-test",
        name: "patch-and-test",
        description:
          "Apply a unified-diff patch to a checked-out repo and run its test suite, capturing the result.",
        requiresVars: [],
        params: [
          { name: "target", type: "string", default: "patches/fix.diff" },
        ],
        schema: [
          {
            key: "target",
            label: "Patch path",
            type: "string",
            required: true,
            default: "patches/fix.diff",
          },
        ],
      },
      {
        id: "csv-summarize",
        name: "csv-summarize",
        description:
          "Read a CSV, compute column summary stats, and emit a markdown report.",
        requiresVars: [],
        params: [
          { name: "target", type: "string", default: "data/input.csv" },
        ],
        schema: [
          {
            key: "target",
            label: "CSV path",
            type: "string",
            required: true,
            default: "data/input.csv",
          },
        ],
      },
    ],
    tools: [
      {
        name: "bash",
        description: "Execute a shell command and capture stdout/stderr.",
        params: [
          { name: "command", type: "string" },
          { name: "timeout", type: "number", optional: true },
        ],
      },
      {
        name: "edit_file",
        description: "Read and write files inside the sandbox scratch root.",
        params: [
          { name: "path", type: "string" },
          { name: "contents", type: "string" },
        ],
      },
    ],
    snippets: {
      mcp: `{
  "mcpServers": {
    "hud-local-shell": {
      "command": "npx",
      "args": ["-y", "@hud/mcp", "env", "run", "local-shell"]
    }
  }
}`,
      python: `import hud

env = hud.environments.get("local-shell")
session = env.start()

result = session.run("Clone https://github.com/example/repo and list the top-level files.")
print(result.transcript)`,
    },
    tabs: { scenarios: true, builds: false, instances: false },
    builds: [],
    instances: [],
  },
  ...makeExploreStubs(),
  ...makeTeamStubs(),
];

/**
 * Curated Explore-tab stubs that hydrate the index card grid to match
 * `.intermediate/design/environments/mockup-explore-layout.png`. Each entry is
 * a card-shape-only fixture: detail-page bodies are intentionally sparse
 * (zero scenarios/tools/builds) — those tabs are populated by the three
 * production fixtures above. When real backend data lands, these are
 * replaced wholesale.
 */
function makeExploreStubs(): ReadonlyArray<Environment> {
  return [
    makeExploreStub({
      id: "trace-explorer",
      name: "trace-explorer",
      organization: "HUD",
      type: "browser",
      starCount: 7,
      runsLast24h: 23,
      lastActiveHoursAgo: 5,
      description:
        "Explore and replay agent execution traces in a real browser environment. Inspect tool calls, model outputs, and screenshots step-by-step.",
      scenarioCount: 4,
      toolCount: 9,
      envVarCount: 2,
    }),
    makeExploreStub({
      id: "trading-rl-env",
      name: "trading-rl-env",
      organization: "kv",
      type: "domain",
      starCount: 7,
      runsLast24h: 18,
      lastActiveHoursAgo: 10,
      description: "",
      scenarioCount: 8,
      toolCount: 6,
      envVarCount: 5,
    }),
    makeExploreStub({
      id: "swebench-verified",
      name: "swebench-verified",
      organization: "Princeton NLP",
      type: "code-swe",
      starCount: 42,
      runsLast24h: 301,
      lastActiveHoursAgo: 1,
      description:
        "Full SWE-bench Verified environment. Includes test harness, code execution sandbox, and 500 verified instance tasks.",
      scenarioCount: 500,
      toolCount: 22,
      envVarCount: 9,
    }),
    makeExploreStub({
      id: "ubuntu-desktop-vnc",
      name: "ubuntu-desktop-vnc",
      organization: "Sharpe",
      type: "os-desktop",
      starCount: 11,
      runsLast24h: 88,
      lastActiveHoursAgo: 3,
      description:
        "Ubuntu 22.04 LTS with full desktop via VNC. Suitable for GUI agent tasks; the system ops, and multi-app workflows.",
      scenarioCount: 8,
      toolCount: 17,
      envVarCount: 7,
    }),
    makeExploreStub({
      id: "doordash-menu-ops",
      name: "doordash-menu-ops",
      organization: "DoorDash",
      type: "domain",
      starCount: 2,
      runsLast24h: 9,
      lastActiveHoursAgo: 36,
      description:
        "Internal DoorDash menu-ops environment. https://doordash.engineering/ for context.",
      scenarioCount: 22,
      toolCount: 11,
      envVarCount: 6,
    }),
    makeExploreStub({
      id: "custom-rl-loop-v2",
      name: "custom-rl-loop-v2",
      organization: "UiPath",
      type: "custom",
      starCount: 5,
      runsLast24h: 14,
      lastActiveHoursAgo: 18,
      description: "",
      scenarioCount: 6,
      toolCount: 8,
      envVarCount: 3,
    }),
    makeExploreStub({
      id: "code-interpreter-stub",
      name: "code-interpreter-stub",
      organization: "HUD",
      type: "code-swe",
      starCount: 1,
      runsLast24h: 2,
      lastActiveHoursAgo: 72,
      description:
        "Stub environment for testing code execution pipelines. Not configured.",
      scenarioCount: 0,
      toolCount: 1,
      envVarCount: 0,
    }),
  ];
}

interface ExploreStubInput {
  id: string;
  name: string;
  organization: string;
  type: Environment["type"];
  starCount: number;
  runsLast24h: number;
  lastActiveHoursAgo: number;
  description: string;
  scenarioCount: number;
  toolCount: number;
  envVarCount: number;
}

function makeExploreStub(input: ExploreStubInput): Environment {
  const vars = Array.from({ length: input.envVarCount }, (_, i) => ({
    key: `STUB_VAR_${i + 1}`,
    required: i === 0,
  }));
  const scenarios = Array.from({ length: input.scenarioCount }, (_, i) => ({
    id: `${input.id}-s${i + 1}`,
    name: `${input.id}:scenario-${i + 1}`,
    description: "Stub scenario — detail-page content is out of scope.",
    requiresVars: [] as ReadonlyArray<string>,
    params: [] as ReadonlyArray<{
      name: string;
      type: "string" | "number" | "boolean";
      default?: string;
    }>,
    schema: [],
  }));
  const tools = Array.from({ length: input.toolCount }, (_, i) => ({
    name: `tool_${i + 1}`,
    description: "Stub tool.",
    params: [] as ReadonlyArray<{ name: string; type: string }>,
  }));
  return {
    id: input.id,
    name: input.name,
    organization: input.organization,
    // Explore envs are cross-org; owner duplicates the publishing org since
    // there's no team affiliation. Filter still works without divergence.
    owner: input.organization,
    visibility: "public",
    type: input.type,
    starCount: input.starCount,
    isStarred: false,
    runsLast24h: input.runsLast24h,
    lastActiveAt: MOCK_NOW - input.lastActiveHoursAgo * HOUR_MS,
    source: `internal/${input.id}`,
    createdAt: "Jun 1, 2026",
    lastDeployedAt: "recent",
    description: input.description,
    vars,
    scenarios,
    tools,
    snippets: { mcp: "", python: "" },
    tabs: { scenarios: false, builds: false, instances: false },
    builds: [],
    instances: [],
  };
}

/**
 * Team-tab stubs spread across 4 mock owners so the Owner filter on My Team
 * produces visibly different sets when toggled. lastActiveAt offsets are
 * staggered so the default "Last active" sort orders meaningfully.
 */
function makeTeamStubs(): ReadonlyArray<Environment> {
  return [
    makeTeamStub({
      id: "team-rag-eval-harness",
      name: "rag-eval-harness",
      owner: "Alex Park",
      type: "code-swe",
      runsLast24h: 124,
      lastActiveHoursAgo: 1,
      description:
        "Internal harness for RAG regression eval. Wraps the prod retrieval stack with a frozen corpus snapshot.",
      scenarioCount: 6,
      toolCount: 4,
      envVarCount: 3,
    }),
    makeTeamStub({
      id: "team-prompt-bench",
      name: "prompt-bench",
      owner: "Sam Vega",
      type: "domain",
      runsLast24h: 38,
      lastActiveHoursAgo: 4,
      description:
        "Prompt-comparison sandbox. Spins up a model under test against a curated 200-prompt evaluation set.",
      scenarioCount: 12,
      toolCount: 3,
      envVarCount: 2,
    }),
    makeTeamStub({
      id: "team-mobile-flow-recorder",
      name: "mobile-flow-recorder",
      owner: "Riley Chen",
      type: "browser",
      runsLast24h: 21,
      lastActiveHoursAgo: 9,
      description:
        "Records and replays mobile web flows for regression testing. Output traces feed into the QA pipeline.",
      scenarioCount: 15,
      toolCount: 8,
      envVarCount: 4,
    }),
    makeTeamStub({
      id: "team-csv-grader-suite",
      name: "csv-grader-suite",
      owner: "Sam Vega",
      type: "custom",
      runsLast24h: 17,
      lastActiveHoursAgo: 14,
      description:
        "Custom grader bundle for spreadsheet QA workflows. Compares structured output against reference CSVs.",
      scenarioCount: 9,
      toolCount: 5,
      envVarCount: 2,
    }),
    makeTeamStub({
      id: "team-internal-docs-rag",
      name: "internal-docs-rag",
      owner: "Jordan Wu",
      type: "code-swe",
      runsLast24h: 8,
      lastActiveHoursAgo: 22,
      description:
        "Internal documentation RAG environment. Mirrors the engineering Notion workspace as a vector index.",
      scenarioCount: 4,
      toolCount: 2,
      envVarCount: 3,
    }),
    makeTeamStub({
      id: "team-vnc-uat-runner",
      name: "vnc-uat-runner",
      owner: "Alex Park",
      type: "os-desktop",
      runsLast24h: 11,
      lastActiveHoursAgo: 30,
      description:
        "Ubuntu VNC env preconfigured with the staging client. Used for end-to-end UAT runs on candidate models.",
      scenarioCount: 5,
      toolCount: 9,
      envVarCount: 5,
    }),
    makeTeamStub({
      id: "team-cli-tools-fixture",
      name: "cli-tools-fixture",
      owner: "Riley Chen",
      type: "code-swe",
      runsLast24h: 5,
      lastActiveHoursAgo: 48,
      description:
        "Pinned CLI toolset for reproducible code-task evals. Frozen versions of git, ripgrep, jq, and node.",
      scenarioCount: 3,
      toolCount: 6,
      envVarCount: 2,
    }),
    makeTeamStub({
      id: "team-billing-replay",
      name: "billing-replay",
      owner: "Jordan Wu",
      type: "domain",
      runsLast24h: 0,
      lastActiveHoursAgo: 96,
      description:
        "Replay environment for billing-flow regression. Mirrors prod billing API with synthetic accounts.",
      scenarioCount: 2,
      toolCount: 4,
      envVarCount: 4,
    }),
  ];
}

interface TeamStubInput {
  id: string;
  name: string;
  owner: TeamOwner;
  type: Environment["type"];
  runsLast24h: number;
  lastActiveHoursAgo: number;
  description: string;
  scenarioCount: number;
  toolCount: number;
  envVarCount: number;
}

function makeTeamStub(input: TeamStubInput): Environment {
  // Team stubs reuse the explore-stub body shape (sparse detail-page content)
  // but with team visibility and an owner drawn from the mock pool.
  const base = makeExploreStub({
    id: input.id,
    name: input.name,
    organization: input.owner,
    type: input.type,
    starCount: 0,
    runsLast24h: input.runsLast24h,
    lastActiveHoursAgo: input.lastActiveHoursAgo,
    description: input.description,
    scenarioCount: input.scenarioCount,
    toolCount: input.toolCount,
    envVarCount: input.envVarCount,
  });
  return {
    ...base,
    owner: input.owner,
    visibility: "team",
  };
}

export function listEnvironments(): ReadonlyArray<Environment> {
  return ENVIRONMENTS;
}

/**
 * Aggregate activity used by the index page-header activity bar. Mock fixture
 * value matches the mockup ("301 runs in last 24h · 0 active now"); when the
 * backend lands, replace with a real aggregate query.
 */
export function getEnvActivity(): EnvActivity {
  return { runsLast24h: 301, activeNow: 0 };
}

export function getEnvironmentById(id: string): Environment | null {
  return ENVIRONMENTS.find((env) => env.id === id) ?? null;
}
