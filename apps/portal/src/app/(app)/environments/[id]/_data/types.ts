/**
 * Types for the Environment detail page.
 *
 * Shaped as if returned by a future `GET /api/environments/:slug` endpoint —
 * fixtures conform to these types and the section components consume them
 * without knowing they're local. When the backend lands, swap the data layer
 * (`./environments.ts`) for a fetcher; the React tree stays.
 */

export type EnvVarRequiredness = "required" | "optional";

/** Catalog tab the env appears under — "public" = Explore, "team" = My Team. */
export type EnvVisibility = "public" | "team";

/**
 * Environment runtime category — drives the type-filter taxonomy on the index
 * page (Explore tab) and the type icon shown in card top-row. Values track
 * `docs/design/screens/environments.wireframe.md` §3a; canonical list is
 * flagged as open question §15 item 1 in the wireframe.
 */
export type EnvType =
  | "browser"
  | "code-swe"
  | "os-desktop"
  | "domain"
  | "custom";

/**
 * Aggregate run activity shown in the page-header activity bar.
 * Global signal (not tab- or org-scoped); see wireframe §2 / open question §15
 * item 6.
 */
export interface EnvActivity {
  runsLast24h: number;
  activeNow: number;
}

export interface EnvVarLink {
  label: string;
  href: string;
}

export interface EnvVarSpec {
  key: string;
  required: boolean;
  /** Pre-saved value, if any. Undefined = never been set. */
  initialValue?: string;
  /** One-sentence help text shown beneath the input. */
  description?: string;
  /** Optional provider-dashboard / docs link rendered after the description. */
  link?: EnvVarLink;
  /** Optional format hint appended after a `·` separator (e.g. "32-char hex"). */
  format?: string;
}

export interface ScenarioParam {
  /** Param name shown as the input label (mono). */
  name: string;
  type: "string" | "number" | "boolean";
  /** Pre-filled value for the input, if any. */
  default?: string;
}

/**
 * Schema entry for the Run-scenario drawer inputs.
 *
 * Drawer surface contract: each entry renders one labelled form control whose
 * required/optional state and type drive validation. Distinct from the rail's
 * `ScenarioParam` (which is keyed by mono `name`) because the drawer surfaces
 * human-friendly labels and explicit required-ness.
 */
export interface ScenarioSchemaEntry {
  key: string;
  label: string;
  type: "integer" | "string" | "boolean";
  required: boolean;
  placeholder?: string;
  default?: string | number | boolean;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  /** Subset of the env's required var keys this scenario needs. */
  requiresVars: ReadonlyArray<string>;
  /** Per-scenario run params rendered in the Configure run panel. */
  params: ReadonlyArray<ScenarioParam>;
  /** Per-scenario input schema rendered in the Run-scenario drawer. */
  schema: ReadonlyArray<ScenarioSchemaEntry>;
  /**
   * Taskset back-reference shown on the Scenarios tab card footer
   * ("Used by: <name>"). Undefined renders the empty-state footer
   * ("Not yet used in a taskset"). Treated as a single ref for now;
   * the IA doc flags a future API decision on multi-taskset shape.
   */
  usedBy?: string;
}

export interface ToolParam {
  name: string;
  type: string;
  /** Suffix `?` rendered for optional params. */
  optional?: boolean;
  /** One-line description for the param, shown beneath the signature row. */
  description?: string;
  /** Marks the param required in the rendered list ("required" suffix). */
  required?: boolean;
  /** Default value rendered when the param has one (e.g. `null`). */
  default?: string;
  /** Enum of valid values for the param — rendered as a muted "values: …" line. */
  values?: ReadonlyArray<string>;
}

export interface Tool {
  name: string;
  description: string;
  params: ReadonlyArray<ToolParam>;
}

// ── Builds tab ──────────────────────────────────────────────────────────────

export type BuildStatus = "SUCCEEDED" | "FAILED" | "BUILDING" | "QUEUED";

export interface Build {
  id: string;
  /** Semver string. */
  version: string;
  /** True only on the most-recent SUCCEEDED build. */
  isLatest: boolean;
  status: BuildStatus;
  /** Author who triggered the build (email or bot id). */
  changedBy: string;
  /** Human-readable duration ("2m 14s"). `null` while building/queued. */
  duration: string | null;
  /** Relative timestamp ("3h ago"). */
  deployedAt: string;
}

// ── Instances tab ───────────────────────────────────────────────────────────

export type InstanceStatus = "running" | "idle" | "terminated";

export interface Instance {
  id: string;
  status: InstanceStatus;
  /** Model or agent identifier. */
  modelOrAgent: string;
  /** Relative start time ("12m ago"). */
  startedAt: string;
  /** Human-readable duration ("12m 4s"). */
  duration: string;
}

// ── Per-env tab visibility ──────────────────────────────────────────────────

/**
 * Tabs whose rendering is conditional on env type. Overview and Settings are
 * always present and not gated by this shape.
 */
export interface EnvTabs {
  scenarios: boolean;
  builds: boolean;
  instances: boolean;
}

export interface Environment {
  id: string;
  name: string;
  /** Publishing organization — drives the badge label (e.g. "HUD"). */
  organization: string;
  /** Catalog tab the env appears under. */
  visibility: EnvVisibility;
  /** Runtime category — drives type filter + type icon on the index card. */
  type: EnvType;
  /** Community star count rendered in the card header (mockup top-row right). */
  starCount: number;
  /** Whether the current viewer has starred this env (controlled by toggle). */
  isStarred: boolean;
  /** Run executions against this env in the trailing 24h window (card footer). */
  runsLast24h: number;
  /** Source URL or repo reference shown in the Overview info strip. */
  source: string;
  /** Human-readable creation date ("Mar 12, 2025"). */
  createdAt: string;
  /** Human-readable last deploy timestamp ("2 hours ago"). */
  lastDeployedAt: string;
  /** Body copy. Inline `<code>` segments live as raw HTML-free strings;
   *  the renderer recognises `{code:KEY}` markers and wraps them. */
  description: string;
  vars: ReadonlyArray<EnvVarSpec>;
  scenarios: ReadonlyArray<Scenario>;
  tools: ReadonlyArray<Tool>;
  /** Snippets keyed by tab label (e.g. "MCP", "Python"). */
  snippets: { readonly mcp: string; readonly python: string };
  /** Which conditional tabs render for this env. */
  tabs: EnvTabs;
  builds: ReadonlyArray<Build>;
  instances: ReadonlyArray<Instance>;
}
