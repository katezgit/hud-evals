# Taskset Detail — Performance Tab Wireframe

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md) — **anchor file.** Header, variant matrix, tab bar, and Overview tab are fully specced there. This file covers the Performance tab only. Do not restate shared anatomy.
- [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md) — peer reference for table density, filter row pattern, and the `aria-hidden` chart + accessible table source pattern.

Visual reference: operator-supplied production screenshot Image #27 (Performance tab, current production hud.ai) — Jun 2026. Patterns inherited only where they pass the persona/job test; production is input, not spec.

---

## HUD-side question answered

### What does each persona DO on this tab, and why?

**Alex (Frontier RL Researcher — PRIMARY — LOAD-BEARING)**

Alex arrives here in Phase 5 (reward-hack inspection) or returning from Phase 4 (training loop). The Performance tab is his forensic instrument for this specific Taskset. His questions, in order of urgency:

1. "Why did Config A (checkpoint-step-4096) reward-hack on this Taskset and Config B (baseline) not? What tool sequence does the winning policy use?"
2. "What tool sequence correlates with high reward versus low reward on these Tasks?"
3. "Did latency improve when I added the honesty penalty? Did the agent's pacing change across the trace?"
4. "Is the pattern that fires in top-reward Traces absent in bottom-reward Traces? That asymmetry is my reward-hack signature."

The Performance tab answers these questions in one screen session, without tab-hopping. Every chart is backed by a drillable table; every aggregate has a trace path.

**Sam (Applied Agent Engineer — SECONDARY)**

Sam uses this tab for cross-model comparison on a regression Taskset. His question: "Model A vs Model B — which one ships?" He reads the Overview table (reward delta), the Tool Usage distribution (does the winning model use fewer steps?), and stops. He does not need the Trace Dynamics phase distribution or the Pattern/Reward heatmap unless there is a regression to investigate. The tab serves Sam by giving him the Overview table first, with deeper sections below the fold.

**Riley (RL Environment Vendor — TERTIARY)**

Not a primary surface for Riley. Riley's work is task-level QA, not cross-run behavioral analysis. Riley may land here as a sanity check before delivery ("does the expected model score in the expected range?") but the Performance tab is not designed for Riley's workflow. The Overview tab and Jobs tab cover Riley's needs.

---

## Decision log

### Decision 1: Configure rail is sticky-left

**HUD-side question:** Alex reconfigures the analysis slice many times per session — different checkpoint, different model, different task filter. How close is the Configure panel to his hands at all times?

**Choice:** Left rail, ~25% width, sticky on scroll. Right content scrolls; the rail does not.

**Rationale:** The Configure panel and the Re-run Analysis button are the two most-used controls on the tab. Sticking the rail left means Alex can change a dropdown and hit Re-run without scrolling back to the top between every iteration. The right content (Overview, Tool Usage, Trace Dynamics) can be long — up to several viewport heights for large tasksets with many tools. A non-sticky rail forces scroll-back on every re-configuration, multiplying the interaction cost for Alex's iterative workflow.

### Decision 2: Two configs by default; Add comparison extends to N ≤ 4

**HUD-side question:** Most comparisons are A/B (baseline vs checkpoint). Alex sometimes wants three (baseline + checkpoint-A + checkpoint-B). How many configs does the rail support without breaking chart legibility?

**Choice:** Default = two config cards (Config A and Config B). `+ Add comparison` adds a third, then a fourth. Cap at 4. Beyond 4, the line charts and heatmaps become illegible and the color-identity system breaks down.

When only one Job has run, Config B is absent on load (see Decision 11, single-config state).

### Decision 3: Config-color identity

**HUD-side question:** Config A and Config B each need a stable color that carries through every chart, table row, chip, and legend entry on the tab. Which color slots?

**Choice:** Config A = blue dot `●`; Config B = orange dot `●`; Config C (if added) = green dot; Config D = purple dot. Color assignment is stable per slot — Config A is always blue, Config B always orange, regardless of what model/checkpoint is loaded. The slot owns the color; the content of the slot changes without changing the hue.

Hue values are a design-tokens-phase decision. The pattern — stable hue per slot, carried through every downstream element — is set here.

### Decision 4: Re-run Analysis is an explicit commit action

**HUD-side question:** Should analysis recompute on every dropdown change (auto-trigger), or require an explicit Re-run click?

**Choice:** Explicit Re-run. Charts and tables dim to a low-opacity state ("dimmed" — design-tokens-phase handles the opacity value) between a dropdown change and a Re-run click. A banner or inline notice reads: "Configuration changed — click Re-run Analysis to update."

**Rationale:** This analysis is compute-heavy (cross-trace tool-call pattern aggregation). Auto-trigger on every dropdown touch would fire mid-configuration, wasting credits and producing intermediate results Alex doesn't want. The dimmed state is honest: the displayed data no longer matches the current configuration. Explicit commit is the correct contract for expensive operations on this platform.

### Decision 5: Overview table has a sticky-left config column

**HUD-side question:** The Overview table shows one row per Config. As the user scrolls right through wide metric columns, which column must stay visible?

**Choice:** Config column (the `● A` / `● B` color-dot + label) is sticky-left. Each metric column scrolls. Same pattern as comparison frameworks (Linear, Figma's comparison tables) and as this codebase's model-detail Results table. Sticky-left config column = the reader always knows which row they are reading.

### Decision 6: Tool Usage Distribution sorts by Avg/Tr descending

**HUD-side question:** The Tool Usage Distribution table lists every Tool the agent called across Runs. What sort order surfaces the most diagnostic signal first?

**Choice:** Sort by Avg/Tr (average calls per Trace) descending. The most-called tool is typically the most load-bearing affordance; seeing it first orients Alex's reading of the distribution. Sort is user-adjustable (click column header to toggle).

### Decision 7: Pattern/Reward matrix shows top-reward Traces and bottom-reward Traces side by side

**HUD-side question:** How does Alex identify a reward-hack pattern? A reward-hack signature is a tool-call sequence that fires in low-reward Traces but is absent (or inverted) in high-reward Traces.

**Choice:** Two heatmaps side by side: "Top Traces (highest reward)" on the left; "Bottom Traces (lowest reward)" on the right. Y-axis = patterns P1–PN; X-axis = individual Trace columns. Cells show the reward score at each Trace × pattern intersection when the pattern fired. Top Traces cells are colored (high-reward palette); Bottom Traces cells are colored (low-reward palette); empty cells indicate the pattern did not fire in that Trace.

**Why both halves are required:** A pattern that fires only in Bottom Traces is the reward-hack candidate. A pattern that fires only in Top Traces is the winning-policy signature. Seeing both halves simultaneously is what enables the diagnosis. Showing only one half forces the user to hold the other half in memory — violates Phase 5 load-bearing UX.

### Decision 8: Trace Dynamics line charts overlay both configs, color-matched

**HUD-side question:** The Pacing chart and Usage chart each show one data series per config. How are the two configs distinguished?

**Choice:** Line series color-matched to config slot — Config A = blue line; Config B = orange line. Dashed line = LLM inference latency; solid line = tool-call latency. A single shared legend below both charts: `● Config A · ● Config B · — Tool calls · --- LLM inference`.

**Rationale:** Overlaying both configs in one chart makes the divergence visible instantly — "Config B's latency degraded mid-trace; Config A held flat" reads as a visual angle difference, not a table comparison. Separate charts per config would require Alex to mentally overlay them.

### Decision 9: Phase distribution is a separate stacked bar per config

**HUD-side question:** What does "Start / Middle / End of trace" tool mix tell Alex?

**Choice:** One stacked horizontal bar per config, labeled by phase (Start = first ⅓ of tool calls; Middle = middle ⅓; End = final ⅓). Bar segment colors show tool mix within each phase, color-matched to tool identity (hue assignment = design-tokens-phase decision). Config A and Config B bars rendered side-by-side for comparison. Caption defines the phase partition explicitly.

**Rationale:** A model that calls `screenshot` in the End phase is hallucinating context (looking around instead of committing). A model that calls `submit` in the End phase is committing confidently. This phase-distribution view surfaces that behavior without requiring Alex to read individual Traces — it's a pre-drill signal that focuses his Trace inspection on the specific phase where behavior diverges.

### Decision 10: Empty state when no Jobs have run

**HUD-side question:** If no Jobs have run on this Taskset, the Performance tab has nothing to show. What does the user see?

**Choice:** Full-tab empty state with contextual copy:

```
Performance requires at least one Job run on this Taskset.

hud eval <taskset-slug> -m <model>   [⎘]

[▶ Run Taskset]
```

The entire content region (right of the Configure rail) is replaced by this empty state. The Configure rail is still rendered but all dropdowns are disabled and the Re-run Analysis button is disabled with a tooltip: "No Job data available."

**Rationale:** Earnest copy, no wizard. The CLI command is the exact next action. The `▶ Run Taskset` button duplicates the header CTA for the same reason as the Overview tab's empty state (the header may be scrolled; the user should not need to scroll back to act).

### Decision 11: Single-config state when exactly one Job has run

**HUD-side question:** The A/B comparison layout assumes two configs. What if only one Job has run?

**Choice:** Default to single-config view. Config A card is populated; Config B card renders as a disabled placeholder: `● Config B — Add a second Job to compare`. The Add comparison button is hidden (Config B is the slot, not an additional one). Re-run Analysis runs analysis on Config A alone. All charts and tables render with single-series (no orange/Config-B series). The Overview table renders with one row.

**Rationale:** Disabling Config B is more honest than hiding the comparison layout entirely. It signals to Alex that comparison is available once he adds a second run, without forcing him to read documentation. Single-series charts are immediately useful; an empty/broken two-series layout is not.

### Decision: `Include Invalidated` toggle per Config

**HUD-side question:** Should the Performance analysis match the Overview's Valid-only scope, or expose Invalidated Runs for forensic comparison?

**Choice:** Default scope is Valid only (matches Overview). Each Config has an opt-in `☐ Include Invalidated Jobs` checkbox that includes Invalidated Runs in that Config's slice. The toggle is per-Config — Config A can include Invalidated, Config B can exclude. This enables the specific forensic comparison: "did the reward-hack bug change the score distribution?" — set Config A to Valid only, Config B to Valid + Invalidated (or invert).

**Persona reason:** Alex's Phase 5 forensic loop — after patching a Grader bug, he wants to compare the patched Job's distribution against the gamed Job's distribution to confirm the patch worked. Without an Include-Invalidated toggle, the pre-patch (now-invalidated) data is invisible to Performance and he can't do the comparison. Sam doesn't use this toggle (his regression check uses Valid-only). Riley doesn't use the Performance tab.

### Decision 13: Naming — "Config" vs "Agent" for comparison slots

**HUD-side question:** Is the comparison slot on this tab an Agent (per `platform.md`, Model + target) or a Config (a query-filter slice)?

**Choice: `Config A/B`** (not `Agent A/B`). Each Config holds three dropdowns: Task slice · Model · Checkpoint. When `MODEL: All models` is selected, the Config spans many Models — which is not a single Agent. A Config is a query primitive specific to this tab; an Agent is a platform-level entity. The wireframe does not invent vocabulary in the platform sense — `Config` is a UI-local term for the analysis slice, declared explicitly here. Production (Image #27) uses `Config` verbatim.

**Persona reason:** Alex's most common Performance use is Agent-vs-Agent (Model A vs Model B at the same Task slice) — which a Config captures perfectly. But he also runs Model=All-vs-Model=All with different Checkpoints — pinning to `Agent` would mislabel that comparison. Sam compares specific Models. Riley does not use this tab. None of the personas are confused by `Config`; all would be confused if a Config that spans Models is labeled `Agent`.

### Decision 12: Charts dim between config change and Re-run

**HUD-side question:** After Alex changes a dropdown but before he clicks Re-run, the displayed data is stale. How is this communicated?

**Choice:** All charts and tables in the right content region dim. An inline notice appears at the top of the content region: "Configuration changed — click Re-run Analysis to update." The Re-run Analysis button in the rail changes to a more prominent state (e.g., outline button upgrades to filled). Charts are not replaced by skeletons — the previous data remains readable, just dimmed, so Alex can compare "what it was" with "what I'm about to run."

---

## §1 Tab content layout

The Performance tab uses a two-column layout: sticky left rail (Configure, ~25% content width) and scrollable right content (~75%). This layout does not apply any other tab.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PERFORMANCE TAB                                                                 │
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────────────────────────────────────────┐  │
│  │  CONFIGURE RAIL  │  │  RIGHT CONTENT (scrolls)                             │  │
│  │  (sticky)        │  │                                                      │  │
│  │  ~25% width      │  │  §3 Overview metrics table                           │  │
│  │                  │  │  §4 Top workflows per config                         │  │
│  │  §2 anatomy      │  │  §5 Tool Usage (Distribution + Patterns + Matrix)    │  │
│  │                  │  │  §6 Trace Dynamics (Pacing + Usage + Phase dist.)    │  │
│  └──────────────────┘  └──────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

The sticky rail pins at the top of the tab content area (below the sticky page header and sticky tab bar). As right content scrolls, the rail stays in place.

---

## §2 Configure rail anatomy

```
┌──────────────────────────────────────┐
│  CONFIGURE RAIL                      │
│                                      │
│  (1) Configure                       │
│  ─────────────────────────────────   │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  ● Config A                 ×  │  │
│  │  TASK       [All tasks     ▾]  │  │
│  │  MODEL      [All models    ▾]  │  │
│  │  CHECKPOINT [All checkpts  ▾]  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  ● Config B                 ×  │  │
│  │  TASK       [All tasks     ▾]  │  │
│  │  MODEL      [All models    ▾]  │  │
│  │  CHECKPOINT [All checkpts  ▾]  │  │
│  └────────────────────────────────┘  │
│                                      │
│  + Add comparison                    │
│  (text button; disabled at 4 configs)│
│                                      │
│  ─────────────────────────────────   │
│  (2) Run                             │
│  ─────────────────────────────────   │
│                                      │
│  [▶ Re-run Analysis]                 │
│  (outline button; fills on change)   │
│                                      │
└──────────────────────────────────────┘
```

**Config card anatomy:**

- **`☐ Include Invalidated Jobs`** — checkbox toggle on each Config card, default off. When on, the Config's analysis slice includes Runs from Invalidated Jobs. When off (default), analysis matches the Overview scope (Valid only).
- **Color dot** (`●`) — blue for Config A, orange for Config B. Hue is stable per slot (Decision 3). Not a status indicator — purely a config identity marker.
- **Dismiss `×`** — removes this config from the comparison. When Config A is dismissed, Config B promotes to Config A (slot reassignment). Not destructive — no data is deleted. When only one config remains, the `×` on that config is disabled (cannot dismiss the last config).
- **TASK dropdown** — filter to a specific Task or subset. "All tasks" = no filter. Populated from this Taskset's Task list.
- **MODEL dropdown** — filter to a specific Model. "All models" = no filter. Populated from Models that have run Jobs against this Taskset.
- **CHECKPOINT dropdown** — filter to a specific checkpoint (e.g., `step-4096`). "All checkpoints" = aggregate across checkpoints. Populated from checkpoint snapshots available for the selected Model. Disabled if no Model is selected or the selected Model has no checkpoints.
- **Stale state:** when a dropdown is changed but Re-run has not been clicked, the card border shows a visual indication of pending change (exact treatment = design-tokens-phase decision). The "Configuration changed" notice appears in the right content region.

**Run section:**

- **`▶ Re-run Analysis`** — triggers analysis computation for the current configuration. Disabled when: no Jobs exist (empty state), or no config has been changed since last run (nothing to re-run). On click: right content enters loading state (skeleton shimmer per §7).

---

## §3 Overview metrics table

The Overview table is the first section in the right content. It provides an at-a-glance cross-config comparison across all key metrics for Alex's Phase 5 orientation.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Overview                                                                                                                                         │
│                                                                                                                                                   │
│  CONFIG (sticky-left) │ REWARD  │ STEPS │ TRACES │ TASKS  │ DURATION │ COST    │ LLM CALLS │ THINK/ACT │ ERRORS │ ENTROPY      │ TOP TOOL        │
│  ─────────────────────┼─────────┼───────┼────────┼────────┼──────────┼─────────┼───────────┼───────────┼────────┼──────────────┼─────────────────│
│  ● Config A           │ 59%     │ 3     │ 26     │ 3/3    │ 2.2m     │ $0.099  │ 3         │ 1.8×      │ 35%    │ 3.21 / 4.00  │ hud_submit (26%)│
│  ● Config B           │ 59%     │ 3     │ 26     │ 3/3    │ 2.2m     │ $0.099  │ 3         │ 1.8×      │ 35%    │ 3.21 / 4.00  │ hud_submit (26%)│
│                                                                                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Column-by-column semantics:**

| Column | What it measures | Format | Color rules |
|---|---|---|---|
| CONFIG | Config slot identity — color dot + label | `● Config A`, `● Config B` | dot color = config slot color |
| REWARD | Mean reward float across all Runs in this config slice. This is the primary outcome signal — the number Alex is training toward. | Percentage to 1 decimal (e.g., `59.0%`) | Red-band when below threshold (threshold = design-tokens-phase + open question §11.1); neutral otherwise. Production shows red-orange at 59% — exact threshold TBD. |
| STEPS | Mean tool-turn count per Run. Proxy for latency and credit cost — fewer steps = more efficient policy. | Integer with 1 decimal (e.g., `3.2`) | No color band. Sort-comparable. |
| TRACES | Total number of Traces in this config slice. Raw count, not a rate. | Integer (e.g., `26`) | No color band. |
| TASKS | Tasks with at least one scored Run out of total Tasks in the Taskset. | `N/M` format (e.g., `3/3`) | No color band. `—` when 0 Runs. |
| DURATION | Mean Run duration (wall-clock time from Job start to last tool call per Run). | Compact time string (e.g., `2.2m`, `45s`) | No color band. |
| COST | Mean cost per Run in USD, derived from Gateway inference credits. | `$0.000` format (3 decimal places for sub-cent precision — Exact personality principle) | No color band. |
| LLM CALLS | Mean number of LLM inference calls per Run (not tool calls — specifically inference requests). Disambiguates inference overhead from tool-call overhead. | Integer with 1 decimal | No color band. |
| THINK/ACT | Ratio of LLM inference calls to tool-action calls per Run. A THINK/ACT ratio >2 means the agent is calling the LLM more than twice per tool action — may indicate reasoning loops or indecision. | Ratio float (e.g., `1.8×`) | Flag for review when >3× (threshold = design-tokens-phase decision). |
| ERRORS | Proportion of `Errored` Runs (per-Run state per `platform.md` Run lifecycle: Run itself crashed — tool error, env error, infrastructure error) out of total Runs in this config slice. This is a Run-level `Errored` count, **not** a count of `Errored` Jobs. Distinct from failed Runs — a Job can be `Completed` while containing several `Errored` Runs. | Percentage (e.g., `35%`) | Red-band when above threshold (production shows red at 35%; exact threshold TBD — open question §11.1). |
| ENTROPY | Tool-call entropy (observed) / maximum possible entropy for this Tool set. A ratio of how "varied" the agent's tool usage is. Ratio approaches 1.0 if the agent uses all tools equally; approaches 0 if it uses one tool exclusively. Low entropy may signal exploitation or reward-hacking. | `observed / max` format (e.g., `3.21 / 4.00`) | No color band; Alex interprets directly. |
| TOP TOOL | The single most-called Tool by name + call frequency as a percentage of all tool calls in this slice. Rendered as a code-style chip (monospace, contained). | `tool_name (N%)` | No color band. |

**Table scroll:** the CONFIG column is sticky-left. All other columns scroll horizontally on narrow right-content widths. Column headers are frozen at the top of the table (standard `<thead>` sticky behavior).

---

## §4 Top workflows per config

Immediately below the Overview table, one "Top workflows" sub-section per config, side by side.

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                        │
│  ● Top workflows (Config A)          │  ● Top workflows (Config B)                    │
│  ──────────────────────────────────  │  ──────────────────────────────────            │
│  23%  [tool:a → tool:b]              │  23%  [tool:a → tool:b]                        │
│   8%  [tool:a → tool:c → tool:a]     │   8%  [tool:a → tool:c → tool:a loop]          │
│   4%  [tool:d → tool:e → tool:f]     │   4%  [tool:d → tool:e → tool:f]               │
│  (show top 5 sequences by frequency) │                                                 │
│                                                                                        │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

- **Frequency %** — left-aligned, monospace, right-padded so percentages align. Percentage of Traces in this config slice that contain this tool sequence.
- **Tool sequence chips** — Tool names rendered as code-style chips connected by `→` arrows. Truncate long tool names to ~20 chars with `...` suffix; full name on hover (tooltip). Each chip carries the config's color dot as a subtle left border or background tint — identifies which config the row belongs to.
- **Show top 5 by default** — a `Show more` text link appears if there are more than 5 sequences. Revealing more is an expansion, not navigation.
- **Single-config state** — when only Config A is configured, only the Config A column renders (full width, no Config B column).

---

## §5 Tool Usage — Distribution, Common Patterns, Pattern/Reward matrix

h2 "Tool Usage" with caption: "How the agent uses available tools across Traces."

### §5a Distribution table

Left half of a two-column layout (or full-width on narrow right content). Shows per-tool statistics with inline bar visualization.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  Distribution                                                                                  │
│                                                                                                │
│  TOOL               │ (bar viz)  │ AVG/TR   │ PASS RATE      │ R²               │ EMPTY%  │ AVG OUT │
│  ───────────────────┼────────────┼──────────┼────────────────┼──────────────────┼─────────┼─────────│
│  tool:name          │  ●──────   │ 0.62     │ 100.0%         │ +0.37            │ 100%    │ —       │
│  (Config A row)     │  ●──────   │ 0.62     │ 100.0%         │ +0.37            │ 100%    │ —       │
│  (Config B row)     │            │          │                │                  │         │         │
│  ───────────────────┼────────────┼──────────┼────────────────┼──────────────────┼─────────┼─────────│
│  tool:other         │  ●───      │ 0.42     │  81.8%         │ +0.17            │ 100%    │ —       │
│                     │  ●───      │ 0.42     │  81.8%         │ +0.17            │ 100%    │ —       │
│  ...                                                                                               │
│                                                                                                │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Column semantics:**

| Column | What it measures |
|---|---|
| TOOL | Tool name (platform vocabulary — never "function"). Monospace. Each tool spans two rows: Config A row on top (blue dot prefix), Config B row below (orange dot prefix). |
| (bar viz) | Horizontal proportional bar, width relative to the max Avg/Tr in this table. One bar per config row, color-matched to config slot. Provides immediate visual ranking. |
| AVG/TR | Average calls to this Tool per Trace across all Runs in this config slice. |
| PASS RATE | Percentage of Runs in which this Tool was used that produced a successful scored outcome (Run scored ≥ Pass threshold). Represents: "when the agent used this tool, how often did the Run ultimately succeed?" Not a causal claim — a correlation. |
| R² | Pearson correlation between tool-call frequency and Run reward in this config slice. Positive values = higher use correlates with better reward; negative = inversely related; `—` when insufficient data for statistical significance. |
| EMPTY% | Proportion of Traces where this Tool returned an empty response. High EMPTY% on a critical tool is a signal of environment misconfiguration or tool failure. |
| AVG OUT | Average output size in characters from this Tool across all calls. `—` when the tool returns non-text output (screenshots, binary). Useful for diagnosing unusually large or small tool responses. |

**Sort:** Avg/Tr descending by default (Decision 6). Column header click toggles sort.

### §5b Common Patterns table

Right half of the §5 two-column layout (or below Distribution on narrow right content). Shows recurrent multi-tool sequences.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Common Patterns                                                              │
│                                                                               │
│  PATTERN                              │ N                    │ SCORE          │
│  ─────────────────────────────────────┼──────────────────────┼────────────────│
│  P1  [tool:a → tool:b]                │ ● 6/26  · ● 6/26     │ 100.0% / 100.0%│
│  P2  [tool:a → tool:c → tool:a loop]  │ ● 3/26  · ● 4/26     │  66.7% /  75.0%│
│  P3  [tool:d → tool:e]                │ ● 2/26  · ● 2/26     │  50.0% /  50.0%│
│  ...                                  │                      │                │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Column semantics:**

| Column | What it measures |
|---|---|
| PATTERN | Pattern identifier (P1, P2, ...) + tool sequence chips. Chips use same render as Top workflows — monospace, `→` arrows. Pattern IDs are stable across the session (P1 stays P1 regardless of config changes). |
| N | Count of Traces containing this pattern out of total Traces, per config. Format: `● 6/26 · ● 4/26` — config A count dot, then config B count dot, separated by middle dot. Fraction = "N Traces out of total Traces in this config slice." |
| SCORE | Mean reward score across Runs where this pattern fired, per config. Format: `100.0% / 100.0%` (Config A / Config B). `—` when pattern did not fire in that config. |

**Show top 7 by default.** `Show more` expansion link for additional patterns.

### §5c Pattern/Reward matrix

Below the Distribution + Common Patterns section. Full-width section with h3 "Pattern / Reward matrix."

Two heatmaps side by side:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  Pattern / Reward matrix                                                                       │
│                                                                                                │
│  Top Traces (highest reward)               │  Bottom Traces (lowest reward)                  │
│  ────────────────────────────────          │  ────────────────────────────────               │
│       T01 T02 T03 T04 T05 T06 ...          │       T01 T02 T03 T04 T05 T06 ...               │
│  P1   [■] [■] [■] [■] [■] [■]             │  P1   [ ] [ ] [ ] [ ] [ ] [ ]                  │
│  P2   [■] [ ] [■] [■] [ ] [■]             │  P2   [■] [■] [■] [ ] [■] [■]                  │
│  P3   [ ] [■] [ ] [ ] [■] [ ]             │  P3   [ ] [ ] [■] [■] [ ] [ ]                  │
│  P4   [■] [■] [■] [ ] [ ] [■]             │  P4   [ ] [ ] [ ] [ ] [ ] [ ]                  │
│  P5   [ ] [ ] [ ] [ ] [ ] [ ]             │  P5   [■] [■] [■] [■] [■] [■]                  │
│  ...                                       │  ...                                            │
│                                            │                                                 │
│  Cell = reward score when pattern fired;   │  Cell color = low-reward palette                │
│  empty cell = pattern did not fire         │                                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

- **Y-axis:** Patterns P1–PN (same labels as Common Patterns table).
- **X-axis:** Individual Traces, labeled T01–TN. Top Traces = highest-reward Runs in this config slice (up to 10 Traces shown; exact cut = top quartile or top 10, design-tokens-phase decision). Bottom Traces = lowest-reward Runs (same count rule).
- **Cell:** When a pattern fired in that Trace, the cell is filled with the Run's reward value (numeric label in cell). When the pattern did not fire, cell is empty.
- **Color encoding:** Top Traces heatmap cells colored on a high-reward palette (deep color = reward close to 1.0; light = closer to threshold). Bottom Traces heatmap cells colored on a low-reward palette (distinct hue, inverted scale). Exact hues = design-tokens-phase. Pattern: "P5 fires in every Bottom Trace but zero Top Traces = P5 is a reward-hack candidate."
- **Config selector:** when two configs are active, a tab strip above the two heatmaps switches between "Config A" and "Config B" views. The heatmap shows one config at a time (side-by-side per config would exceed legible cell count). This is the one place in the tab where per-config comparison is not simultaneous — space constraint.
- **Both halves always rendered** — the top/bottom split is required for Alex's reward-hack diagnosis (Decision 7). If fewer than 5 Traces exist, the heatmap renders with available Traces (no minimum threshold to display).

---

## §6 Trace Dynamics — Pacing, Usage, Phase distribution

h2 "Trace Dynamics" with caption: "How agent behavior evolves over the course of a Trace."

### §6a Pacing and Usage charts

Two line charts side by side.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  Pacing                                          │  Usage                               │
│  ──────────────────────────────────────          │  ──────────────────────────────────  │
│  Caption: Average action duration over           │  Caption: Average tool response      │
│  trace progress. Dashed = LLM inference.         │  size (chars) over trace progress.   │
│                                                  │                                      │
│  9.3s ┤   /\                                     │  70  ┤                        /      │
│  6.0s ┤  /  \                                    │  50  ┤              /\       /       │
│  3.0s ┤ /    \──────────────                     │  30  ┤─────────────  \──────/        │
│  0.0s ┤                                          │   0  ┤                               │
│        0%   33%   66%  100%                      │       0%   33%   66%  100%            │
│        (trace progress)                          │       (trace progress)                │
│                                                  │                                      │
│  Blue solid = Config A tool calls                │  Blue solid = Config A               │
│  Orange solid = Config B tool calls              │  Orange solid = Config B             │
│  Blue dashed = Config A LLM inference            │                                      │
│  Orange dashed = Config B LLM inference          │                                      │
│                                                  │                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Shared legend below both charts:
`● Config A · ● Config B · — Tool calls · --- LLM inference`

**Pacing chart semantics:** X-axis = trace progress (0% = first tool call; 100% = last tool call, normalized). Y-axis = average duration in seconds for calls at that percentile across all Runs. Two series: tool-call latency (solid line) and LLM inference latency (dashed line). The solid vs dashed separation is load-bearing — it distinguishes action cost (tool execution time) from reasoning cost (inference time), which Alex monitors separately when adjusting his reward function's latency term.

**Usage chart semantics:** X-axis = trace progress (same normalization). Y-axis = average tool response size in characters. Tracks how much data the agent is receiving from its tools as the trace progresses. Rising Usage at End of trace while reward is low = the agent is still gathering context at the point it should be committing — a behavioral signal.

### §6b Phase distribution

Below the Pacing/Usage charts. Full-width section.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Phase distribution                                                                      │
│                                                                                          │
│  Caption: Each Trace's tool calls are split by call order: Start (first ⅓ of calls),   │
│  Middle (middle ⅓), End (last ⅓). Bar height shows relative call volume; colors show   │
│  tool mix within each phase.                                                             │
│                                                                                          │
│  ● Config A                                                                              │
│  START         MIDDLE          END                                                       │
│  [████████]    [██████████]     [█████]                                                  │
│  (stacked bars, tool-color mix within each phase bar)                                    │
│                                                                                          │
│  ● Config B                                                                              │
│  START         MIDDLE          END                                                       │
│  [████████]    [██████████]     [█████]                                                  │
│                                                                                          │
│  Legend: [tool colors per tool identity — design-tokens-phase hue assignment]            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Anatomy:**

- Three bars per config: Start, Middle, End. Bar height (or width — design-tokens-phase choice) proportional to call volume in that phase relative to total calls across all three phases.
- Each bar is a stacked composition: bar segments colored by Tool identity. The same Tool identity color is reused across Pacing, Usage, and Phase distribution for visual continuity.
- Configs are rendered as separate labeled groups (Config A above, Config B below), not overlaid. Justification: overlaying three stacked bars per config per phase would produce 18 bar segments in one chart — illegible. Sequential rendering trades the simultaneity for legibility.
- The Tool identity color legend is shared across all three §6 sections.

---

## §7 Empty / loading / error states

### §7a Empty state — no Jobs run (Decision 10)

```
┌──────────────────────────────────────────────────────────────────────┐
│  RIGHT CONTENT — empty state                                          │
│                                                                        │
│  Performance requires at least one Job run on this Taskset.           │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  hud eval <taskset-slug> -m <model>                     [⎘]   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  [▶ Run Taskset]                                                       │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

Configure rail: rendered, all dropdowns disabled, Re-run Analysis button disabled with tooltip "No Job data available."

### §7b Single-config state — exactly one Job run (Decision 11)

Configure rail: Config A populated. Config B card renders as disabled placeholder:

```
┌────────────────────────────────┐
│  ● Config B                    │
│  Add a second Job to compare.  │
│  (+ Add comparison — hidden;   │
│   Config B IS the second slot) │
└────────────────────────────────┘
```

Right content renders normally with single-series charts (no orange Config B lines). Top workflows shows Config A column only (full width). Common Patterns N column shows `● N/T` only (one dot, no Config B dot). Heatmap config selector shows "Config A" only.

### §7c Loading state — post Re-run Analysis click

Right content enters skeleton state. Configure rail remains interactive (Alex can cancel or wait). Loading progresses top-to-bottom:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Overview                                                              │
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  (2 rows)  │
│                                                                        │
│  Tool Usage                                                            │
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  (table shimmer)        │
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  (patterns shimmer)     │
│                                                                        │
│  Pattern / Reward matrix                                               │
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  │
│                                                                        │
│  Trace Dynamics                                                         │
│  [░░░░░░░░░░░░░░░░░░░░░]  [░░░░░░░░░░░░░░░░░░░░░]  (chart shimmers)   │
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  (phase dist shimmer)   │
└──────────────────────────────────────────────────────────────────────┘
```

Skeleton shimmers match the shape of each section. `aria-busy="true"` on the content region. Off-screen `aria-live="polite"` announces "Analysis running." When complete, `aria-live` announces "Analysis complete."

### §7d Error state — analysis failed

```
┌──────────────────────────────────────────────────────────────────────┐
│  Analysis failed — [error reason, direct cause].                      │
│  Job ID: [job-id-monospace]                                           │
│  [▶ Retry Analysis]                                                   │
└──────────────────────────────────────────────────────────────────────┘
```

Error copy follows Earnest voice: state the cause, not an apology. Expose the Job ID (platform provenance principle). Retry button re-runs the same analysis. Previous results are not cleared (remain dimmed in the background, still accessible for reading).

### §7e Stale-config state — config changed, Re-run not yet clicked

A notice bar renders at the top of the right content region (full width, dismissible):

```
Configuration changed — click Re-run Analysis to update.
```

Charts and tables are dimmed (Decision 12). Previous results are still readable in the dimmed state.

---

## §8 Responsive behavior

### Desktop — full layout

Two-column layout (sticky Configure rail + scrollable right content). All sections fully expanded. Pacing/Usage charts side by side. Distribution + Common Patterns side by side.

### Tablet — Configure rail collapses to accordion

At tablet width, the two-column layout collapses. Configure rail becomes a collapsed accordion at the top of the tab, labeled "(1) Configure · (2) Run" with a chevron to expand. When expanded, the full rail content renders as an overlay or inline expansion above the right content. This preserves screen width for the chart and table content, which are the primary read surfaces at this breakpoint.

The right content renders full-width below the accordion. Distribution and Common Patterns stack vertically. Pacing/Usage charts stack vertically.

### Mobile — not load-bearing; show interstitial

Alex's reward-hack forensics workflow is performed on a desktop or laptop. The Performance tab at mobile width is not a primary use case for any of the three personas. Show an interstitial instead of attempting to fit the tab content:

```
┌──────────────────────────────────────────────────────────────┐
│  Performance analysis is designed for larger screens.         │
│                                                               │
│  [← View Overview]                                            │
└──────────────────────────────────────────────────────────────┘
```

**Rationale:** The Pattern/Reward heatmap, the Pacing chart, and the Distribution table depend on horizontal width to be legible. Responsive-collapsing them to mobile width would produce an illegible surface rather than a useful one. An honest interstitial with a return path is more earnest than a broken layout.

---

## §9 Keyboard and accessibility

- **Two-column layout:** the left Configure rail and right content region are sibling sections. Tab order: Configure rail controls first (top to bottom: Config A dropdowns, dismiss ×, Config B dropdowns, dismiss ×, Add comparison, Re-run Analysis), then right content (top to bottom: Overview table, Top workflows, Distribution table, Common Patterns table, heatmap, charts, phase distribution).
- **Configure dropdowns:** standard `<select>` or custom combobox with `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`. All three dropdowns per config are labeled: `<label>` for each (TASK, MODEL, CHECKPOINT). Labels may be visually small but must be in the DOM for screen readers.
- **Re-run Analysis button:** `<button aria-label="Re-run Analysis">`. When disabled, `aria-disabled="true"`. Tooltip on disabled state: `title="No Job data available"` or a `<span aria-live>` announcement.
- **Overview table:** `<table>` with `<thead>`. CONFIG column is `position: sticky; left: 0` — no additional a11y attribute needed for sticky; the visual affordance is sufficient. Cells with color-coded values (Reward red-band, Errors red-band) must not rely on color alone — the value itself is the signal; color is a redundant emphasis. `aria-sort` on any sorted column header.
- **Charts (Pacing, Usage):** `aria-hidden="true"` on SVG elements. Each chart has a visually-hidden `<caption>` or adjacent `<p>` with: "Line chart showing [Pacing/Usage] over trace progress. Data available in the Distribution table above." The distribution table is the accessible data source.
- **Phase distribution bars:** `aria-hidden="true"` on bar SVGs. A visually-hidden description: "Bar chart showing tool mix across Start, Middle, and End phases per config. Accessible data: Tool Usage Distribution table above."
- **Pattern/Reward heatmap:** `aria-hidden="true"` on SVG. A `<table>` rendered visually-hidden alongside the heatmap provides the accessible matrix data (patterns as rows, Traces as columns, cell values as text).
- **Config dismiss × button:** `<button aria-label="Remove Config A">` (or "Remove Config B"). On dismiss, focus moves to the next config card or to the Add comparison button if no other config exists.
- **Loading state:** `aria-busy="true"` on `role="region"` wrapping the right content. `<span aria-live="polite" class="sr-only">Analysis running.</span>` on start; updates to "Analysis complete." on finish.
- **Error state:** `role="alert"` on the error message container. Error is announced immediately on render.
- **Stale-config notice:** `role="status"` on the notice bar ("Configuration changed — click Re-run Analysis to update"). Announced when it appears.
- **Heatmap config tab strip:** `role="tablist"`, each tab `role="tab"`, `aria-selected`, `aria-controls`. Arrow-key navigation between Config A / Config B tabs.

---

## §10 Persona notes by surface decision

| Decision | Alex (PRIMARY) | Sam (SECONDARY) | Riley (TERTIARY) |
|---|---|---|---|
| D1: Sticky Configure rail | Load-bearing — Alex re-configures many times per forensics session; always-reachable controls are essential | Helpful — Sam may re-run with a different model filter to confirm the comparison | Not a primary surface; sticky rail adds no friction |
| D2: Two configs default, N≤4 | Correct — most comparisons are baseline vs checkpoint; 3-way (two checkpoints + baseline) is a real Alex workflow | Correct — Sam's comparison is almost always A vs B | Not applicable |
| D3: Config color identity | Load-bearing — Alex reads the color dot to track which config's data he is looking at across multiple charts | Correct — color identity carries through all comparison views | Not applicable |
| D4: Explicit Re-run commit | Correct — Alex configures the full slice before committing; mid-configuration auto-trigger wastes credits | Correct — Sam also doesn't want half-configured results | Not applicable |
| D5: Sticky-left CONFIG column | Load-bearing — Overview table may be wide; Alex must always see which row is which config | Correct | Not applicable |
| D6: Tool Distribution sort Avg/Tr desc | Correct — most-called tool surfaces first; Alex reads top 3 tools to orient before drilling | Correct — Sam reads the top tools to understand which model uses fewer steps | Not applicable |
| D7: Pattern/Reward matrix — both halves required | LOAD-BEARING Phase 5 — this is how Alex identifies reward-hack signatures; absence of a pattern in Top Traces + presence in Bottom Traces = the hack | Useful for regression investigation; not the primary surface for model selection | Not applicable |
| D8: Chart series color-matched to config | Correct — overlaid series per config makes divergence immediately visible | Correct | Not applicable |
| D9: Phase distribution per config | Correct — "Config B uses screenshot at End; Config A uses submit at End" is a Phase 5 behavioral signal | Useful for diagnosing behavioral differences between models | Not applicable |
| D10: Empty state with CLI command | Correct — Earnest empty state; CLI command is the exact next action | Correct | Acceptable |
| D11: Single-config state | Correct — single-config view is useful; disabled Config B communicates comparison availability | Correct | Not applicable |
| D12: Charts dim on config change | Correct — stale data is visually distinct; Alex can see "what it was" while configuring "what to run" | Correct | Not applicable |

---

## §11 Open questions — do not block, flag for follow-up

1. **Reward and Errors color band thresholds:** Production shows Reward red-orange at 59% and Errors red at 35%. What are the exact thresholds? Are these user-configurable per Taskset, or platform-defined? Alex may have different acceptable thresholds than Sam. Flag for platform team and design-tokens phase.

2. **Think/Act definition:** Is THINK/ACT the ratio of LLM inference calls to tool-action calls, or a different ratio? "1.8×" in production — confirm the denominator. If it is LLM calls / tool calls, "1.8×" means 1.8 LLM calls per tool action, which seems reasonable. Confirm with platform team.

3. **Entropy definition:** Is Entropy tool-call Shannon entropy (based on frequency of each Tool in the trace), token-level entropy from the LLM output, or action entropy? The `observed / max` display suggests Shannon entropy over the tool-call distribution. Confirm with platform team. Also confirm: is max entropy computed from the number of unique Tools available in this Environment, or from the number of unique Tools actually called?

4. **R² column definition:** R² in the Distribution table — is this the R-squared of a linear regression between tool-call frequency and Run reward across all Runs in the slice? If so, is the sign (+ / −) the slope direction? Confirm with platform team.

5. **AVG OUT column:** Is AVG OUT the average output character count per call, or per Trace? And does it include binary (screenshot) output as a byte count, or only text output? The `—` for binary tools in the description should be confirmed.

6. **Heatmap "Top Traces" cut:** What defines "Top Traces" — top N by reward, top quartile, top half? At small trace counts (e.g., 5 Traces), the split would be 3 Top / 2 Bottom or similar. What is the minimum trace count before the heatmap renders, if any?

7. **Pattern identity stability:** Pattern IDs P1–PN are described as "stable per session." Are they stable across Re-run Analysis calls? If Alex changes Config A's model filter and re-runs, do the same tool sequences get the same P-numbers? If patterns re-rank, the heatmap comparison across Re-runs becomes confusing. Confirm whether pattern IDs are stable within a session only or across sessions.

8. **Config B disabled state in single-config mode:** When exactly one Job has run, Config B renders as a disabled placeholder. Does this placeholder also show a hint pointing to how to add a second Job (e.g., "Run Taskset with a different model")? Or is it plain copy "Add a second Job to compare"? The CTA behavior matters for the disabled card.

9. **Pattern/Reward heatmap — per-config or cross-config:** The brief specifies a config tab strip to switch between Config A and Config B in the heatmap. However, the diagnostic value is comparing "which patterns appear in Config A's Bottom Traces but Config A's Top Traces" — that comparison is within one config. Cross-config heatmap comparison ("Config A Top vs Config B Top") is a separate and lower-priority question. Confirm whether the heatmap should ever show cross-config comparison or always within-config only.

10. **Top workflows `loop` label:** Production screenshot shows `anthropic_computer → launch_app → anthropic_computer loop` with "loop" as a label suffix. Is "loop" a platform-detected pattern type (a detected cycle in the tool sequence), or just descriptive copy? If platform-detected, what is the detection threshold (e.g., the same 3-step sequence repeating ≥2 times)?

---

## Variant note

The Performance tab content is **identical across all page variants** (Private/owner, Public/non-owner, Public/owner). The tab renders analysis of Jobs that have run against this Taskset — it is a read-only computed view. No write operations live on this tab; no variant-conditional UI is required. The variant matrix in the anchor (§9 of `taskset-detail.wireframe.md`) governs the header, CTAs, and tab set visibility; the Performance tab's internal content is not affected by variant.

---

## Out of scope

- **Drill from chart point to underlying Traces** — clicking a data point on the Pacing or Usage chart, or clicking a cell in the Pattern/Reward heatmap, to open a filtered Trace list. This is the natural next interaction but requires a Trace list / Trace detail wireframe as the drill target. Flagged for a subsequent pass.
- **Tool list / Scenario list detail** — understanding what a specific Tool does or what a Scenario's reward logic is. These live on the Environment detail wireframe, not here.
- **LLM judge (Grader) config** — editing or inspecting the reward function from this tab. The Performance tab shows Grader outputs (reward scores); Grader authoring and editing live in the Phase 3 Scenario/Grader editor surface. The contextual drill from Trace → Grader editor is a Phase 5 surface implication but belongs on the Trace detail wireframe.
- **Exporting analysis results** — CSV / JSON export of the Distribution table or heatmap. In scope for a subsequent pass; not specified here.
- **Credits cost of Re-run Analysis** — the analysis computation itself may consume Credits. If so, a credits-cost estimate before Re-run (similar to pre-Job cost estimates) belongs here. Flag for platform team.

---

## Drift log

- **Configure rail `×` dismiss promotes Config B to Config A (not in production spec).** Production shows a static two-config layout. This wireframe adds dismiss-and-promote behavior (removing Config A makes Config B become Config A). Justified: if the user wants to swap the baseline and replace it with a new one, dismiss-then-add is more natural than editing Config A in place. The slot-stable color assignment (Decision 3) means Config A is always blue — if Config B remains orange after Config A is dismissed, the color slot survives.

- **Stale-config dimming (new design; not in production).** Production shows no stale-state indication between dropdown change and Re-run. This wireframe adds chart dimming + a notice bar. Justified: without visual feedback, Alex cannot tell whether the displayed data reflects the current configuration or a previous one. Honesty principle from personality.md: the dashboard does not perform confidence it doesn't have.

- **Phase distribution bars — stacked horizontal (not vertical).** Production shows vertical stacked bars (bar height = call volume). This wireframe specifies "bar height or width — design-tokens-phase choice" to leave the orientation open. The production convention is kept as the default; exact treatment is design-tokens-phase. No functional drift.

- **Pattern/Reward heatmap per-config tab strip (new design).** Production shows heatmaps side by side (Config A and Config B simultaneously). This wireframe uses a tab strip to switch between configs. Justified: the side-by-side layout requires each config's heatmap to be at half the total width — at 10+ patterns × 10+ Traces, cells become too small to read. Single-config full-width is more legible. The diagnostic value is within-config (Top vs Bottom), not cross-config, making sequential viewing acceptable.

- **Mobile interstitial instead of responsive layout.** Production page is not tested at mobile width. This wireframe chooses an honest interstitial over a forced responsive collapse of the heatmap and multi-series charts. Justified: personality principle "Spare → prototype-grade" — removing chrome to feel expert crosses into feeling unfinished. A legible interstitial is more earned than an illegible collapsed layout.

- **Configure rail now exposes per-Config `Include Invalidated` toggle.** Required for Alex's Phase 5 forensic comparison (patched-vs-gamed distribution diff). Production did not have this — new affordance.

- **`Config A/B` naming defended against domain-reviewer suggestion of `Agent A/B`.** Domain-reviewer flagged `Config` as non-canonical (preferring `Agent` per `platform.md`). Defended — Config is a query slice that can span multiple Models; an Agent is a pinned Model + target. When `MODEL: All models` is selected, the Config is not a single Agent. Production (Image #27) uses `Config` verbatim. Decision log updated with justification (Decision 13).

- **Renamed Tool Usage Distribution column `SCORE` → `PASS RATE`.** Reason: domain-review FAIL — `SCORE` is ambiguous with Reward Score; the column measures the pass-rate of Runs in which a given Tool was used (percentage of those Runs that produced a successful scored outcome). Production used `SCORE`; intentional divergence for clarity per `personality.md` Exact principle.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md). Visual reference: operator-supplied production screenshot Image #27 (Performance tab, hud.ai) — Jun 2026. Anchor: [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md). Peer reference: [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md).*
