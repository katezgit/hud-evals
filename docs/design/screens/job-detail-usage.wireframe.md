# Job Detail — Usage Tab Wireframe

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

**This file specifies the Usage tab anatomy only.** Job detail page header, tab bar, and sibling tabs (Overview, Runs, Traces) are out of scope here.

Mockup: `docs/design/mockups/job-detail-usage/index.html`

Cross-links:
- [`docs/design/screens/taskset-detail-tasks.wireframe.md`](./taskset-detail-tasks.wireframe.md) — peer format reference. Decision-log pattern and section conventions inherited from here.
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome.

---

## Context

The Usage tab is the third or fourth tab on the Job detail page (exact order TBD by the Job detail anchor wireframe). It is the billing and cost-decomposition surface for a single Job run.

**Primary surface goal:** Let an AI engineer compare model cost-effectiveness and identify billing waste — fast, without opening a separate billing portal.

**Persona load:**
- **Sam (primary for this tab)** — applied agent engineer optimizing production cost. Opens Usage to decide which model to keep and whether error waste is worth addressing. Arrives after a Job completes.
- **Alex (secondary)** — frontier RL researcher. Uses Usage to audit cost-per-success across model checkpoints when running multi-model comparison Jobs.
- **Riley (tertiary — incidental)** — env vendor. Rarely opens Usage directly; may review it when handing off a Job run to a buying lab as evidence of cost envelope.
- **FinOps / Procurement stakeholder (out-of-product)** — downloads the Export for a purchase order or cloud budget audit. Does not interact with the tab interactively.

---

## Design questions

### D1 — Headline framing: model comparison vs infrastructure split

> **SUPERSEDED 2026-06-14 — operator reversed; see D9.**

~~**HUD-side question:** What is the AI engineer's primary decision on the Usage tab?~~

~~**Choice:** BY MODEL comparison is the headline visual block. The Inference : Environment cost split is demoted to a single muted sub-text line under the total amount.~~

~~**Persona reason:** Sam and Alex pick a model and ship a model. The decision they need to close is "which model delivers acceptable output at the lowest cost?" — which is a cross-model comparison. Inference vs Environment is HUD's invoicing decomposition axis (relevant to FinOps procurement and Riley as an env vendor); it is not the AI engineer's optimization lever. Surfacing it as a headline visual block (stacked bar, metric tiles) would pull visual gravity toward a secondary concern.~~

**Reversal:** Model comparison is now conveyed via `Group by: Model` in the per-trace breakdown table. The summary block headline is the infrastructure split (Inference : Environment), not model comparison. BY MODEL table is removed from the tab. See D9 for the new summary block structure.

---

### D2 — `Cost / Success` column on the BY MODEL table

**HUD-side question:** What single metric closes the model-comparison decision?

**Choice:** `Cost / Success = total spend ÷ traces scoring ≥0.5`, shown per model and on the Job-total row. The audit count `(N of M)` — how many traces qualified as successful — renders as muted sub-text inline under the dollar value.

**Persona reason:** Cost per trace can mislead. A model that costs $0.05/trace but fails half the time has an effective cost of $0.10/success, worse than a model at $0.08/trace with a 90% success rate. Cost-per-success is the engineer's unit-economics number. It also makes the `(N of M)` audit count load-bearing: Sam can verify the denominator without navigating to the Traces tab.

Success threshold is fixed at 0.5 (reward ≥ 0.5 = successful trace). See Open questions OQ-2 for configurable threshold.

---

### D3 — Job-total row at the bottom of BY MODEL

**HUD-side question:** What is the baseline the per-model rows are deviating from?

**Choice:** A `Job total` row pins at the bottom of the BY MODEL table, separated by a stronger border. It shows: total trace count, avg/trace across all models, cost/success across all models `(N of M)`, and total spend. The `vs Avg Trace` cell shows `—` on this row (the row IS the average; it cannot delta against itself).

**Persona reason:** The `vs Avg Trace` delta badges on each model row (above/below mean) are only legible if the baseline is visible. The Job-total row closes the comparison, giving Sam the reference point the model rows are measured against.

---

### D4 — Wasted-cost callout between BY MODEL and per-trace breakdown

**HUD-side question:** How should pure billing waste — errored traces that incurred cost but produced no output — surface?

**Choice:** A one-line callout strip with destructive tint, rendering: warning icon · `$X.XX spent on N errored trace(s)` · `Jump to trace →` link (filters the per-trace table to errored rows). Conditional: callout only renders when ≥1 errored trace has non-zero cost.

**Persona reason:** Sam's optimization workflow is "kill waste first." Errored traces buried in the per-trace table (sorted by total descending) do not get the same attention as a dedicated callout. The `Jump to trace →` link collapses the distance between seeing the waste and acting on it (navigating to the trace to debug the error).

---

### D5 — Per-trace table: group by None default, sort by Total descending

**HUD-side question:** How is the per-trace breakdown ordered when surfacing for cost optimization?

**Choice:** Default `Group by: None` (flat trace list, sorted by Total descending). Within a group (when grouping is active), rows sort by Total descending — highest-cost traces float to the top. Group rows are collapsible; expanded by default. Group-by dropdown options: `None · Model · Status · Task`. Sort is implicit (Total desc); no separate sort control is needed for the initial spec.

**Rationale for `None` default:** `None` is the unsurprised default — the user lands on the flat trace list and opts into grouping when they want it. `Group by: Model` was the prior default; it imposed a grouping lens before the user expressed intent. For single-model Jobs, `None` was already the correct default; making `None` universal removes the conditional default logic and keeps the first-render consistent regardless of job composition.

**Persona reason:** "Find the most expensive traces to optimize" is the dominant flow for both Sam and Alex. Highest-cost rows at the top of the flat list means the answer to "what cost me the most?" requires zero scrolling regardless of which model produced the trace. Sam who wants a per-model breakdown opts into `Group by: Model`; the opt-in is one dropdown tap. `Group by: Task` lets Alex and Sam pivot to per-task cost attribution — pinpointing which task drove the most spend without navigating away. `Status` groups all errored traces together to compare their costs — a Usage-unique axis. See D6 for Task column and Group-by-Task rationale.

---

### D6 — REWARD column dropped; TASK column added

**Reward dropped — outcome metric belongs to Traces tab; Usage is cost-attribution only.**

The Reward column was a leak: Cost/Success in the BY MODEL table already surfaces the success-qualification math, and the per-trace table is a cost audit surface, not a reward audit surface. Reward values belong in the Traces tab where outcome data lives.

**Task column added between Trace and Status.**

**HUD-side question:** What per-trace grouping axis closes the cost optimization loop for all three personas?

**Choice:** A `Task` column appears between `Trace` and `Status`. Cell content: `task.id` monospace + truncated task prompt (single line, ellipsis) — the same `<id mono> <prompt truncated>` cell pattern the Traces tab uses for task display. Final column order: **Trace · Task · Status · Inference · Environment · Total**.

**Persona reason:** Alex prunes gnarly tasks driving disproportionate cost — Task-level cost answers "which task broke the bank?" without navigating away. Sam compares cost-per-task across model runs to decide where to invest prompt optimization. Riley validates per-task economics before handing a taskset off to a buying lab. Task-level cost attribution closes the loop for all three personas in one column.

**Parallel pattern:** Traces tab task cell — `task.id` monospace + single-line truncated prompt with ellipsis. This column follows the same anatomy verbatim; no new cell pattern is introduced.

---

### D7 — Demoted: Inference vs Environment split

> **SUPERSEDED 2026-06-14 — operator reversed; see D9.**

~~**HUD-side question:** Should Inference and Environment cost receive separate visual elements (metric tiles, stacked bar)?~~

~~**Choice:** No. A single line of muted monospace sub-text under the `$X.XX ESTIMATED TOTAL`: `$X.XX inference · $X.XX environment`. The information is preserved for FinOps stakeholders who export the page; the visual gravity is removed so it does not compete with the BY MODEL headline block.~~

~~**Persona reason:** See D1. Inference vs Environment is a billing line-item decomposition, not an engineer optimization lever. Rendering it as a stacked bar or metric tiles frames it as actionable, which it is not for Sam or Alex (they cannot optimize environment cost; they can switch models).~~

**Reversal:** With BY MODEL removed, the Inference : Environment split IS the headline decomposition on this tab. It is promoted into the summary stat strip (see D9) as a peer stat alongside total and avg/trace. It is still not rendered as a bar or chart — just named dollar values in the strip. The distinction from D7's original concern (don't make it look like an optimization lever with visual affordance) is preserved: it appears as flat text, not tinted tiles or stacked bars.

---

### D8 — Single freshness cue

**HUD-side question:** Where does the cost calculation timestamp live?

**Choice:** One line, `Cost calculated N minutes ago`, placed near the total in the header row. No separate footer timestamp, no "Calculated at" label in a second location.

**Persona reason:** A timestamp in two places (header + footer) signals that the data might be inconsistent between sections, which it isn't. One cue at the total is sufficient and reduces copy noise.

---

### D9 — Summary block structure (2026-06-14)

**Replaced decisions:** D1 (model comparison as headline) and D7 (infrastructure split demoted to sub-text).

**Rejected pattern (what was there before):**
- An `h1 Usage` on the left + `$2.90 ESTIMATED TOTAL` marooned right-aligned at 24px mono bold.
- A row of 3 metric tiles below: `ENVIRONMENT $1.20 · INFERENCE $1.70 · AVG PER TRACE $0.10`.

**Why rejected:**
1. The `h1 Usage` is redundant — the tab nav above already labels the page "Usage". Two titles for the same concept add noise without hierarchy.
2. The right-aligned total at full page width looks marooned and creates a visual imbalance with the left-side h1 — the pattern reads as a marketing SaaS hero card, not a dense information surface.
3. The 3-tile grid below the header row is a second visual block competing with the non-existent BY MODEL table. With BY MODEL removed, the tiles have no peer context — they become the layout's sole content above the fold, over-weighted for what they are.

**Chosen structure:** A single horizontal stat strip replaces the entire header row + tile grid. Every stat block uses the same uniform stacked anatomy — `LABEL` (small caps, top) over `value` (number, bottom) — so all four blocks stand at identical height. This fixes a prior alignment defect: the original spec stacked `$2.90` over `ESTIMATED TOTAL` on the left (2-line block) while the right stats sat on a single line, causing the right side to visually hover at the top of the strip with the bottom half empty beside the caption.

```
ESTIMATED TOTAL  INFERENCE  ENVIRONMENT  AVG/TRACE
$2.90            $1.70      $1.20        $0.10 (30 traces)        [Export ↓]
```

Each stat is a `flex-col gap-0.5` block. Adjacent stat blocks are separated by `gap-6` (24px). Export button is `ml-auto` right-aligned, vertically centered in the strip row.

- `ESTIMATED TOTAL` / `INFERENCE` / `ENVIRONMENT` / `AVG/TRACE` — meta-foreground, uppercase, text-meta (11px), `tracking-wider`, top of each block.
- `$2.90` — foreground, monospace, weight 600, text-subtitle (16px). Leftmost anchor, reads first.
- `$1.70` / `$1.20` — foreground, monospace, weight 500, text-body (14px).
- `$0.10 (30 traces)` — value `$0.10` foreground monospace weight 500 text-body (14px); `(30 traces)` meta-foreground same size, space-separated inline.
- No separator dots (`·`) between stat blocks — the `gap-6` gap between blocks is sufficient partition. Separator dots are removed to avoid ambiguity with the 2-column label row.
- No h1. No h2. No tiled cards. No stacked bar. No color tinting on any metric.

**HUD-side question:** What's the right structure when the tab nav labels the page and the primary job of the block is to surface four scalar cost values?

**Persona reason:** Alex and Sam read dashboards at speed. A single stat strip scans in one eye pass — total anchors immediately, the decomposition follows on the same line with no card borders or tile chrome intercepting the scan. Linear and Vercel dashboards use exactly this pattern for aggregate context at the top of a content section. The 3-tile grid required two eye stops (header row → tile row), adding layout weight for no information gain. With BY MODEL removed, there is no reason to keep the tiles — the strip is both more compact and more legible.

**What was explicitly rejected:**
- Hero card with one centered enormous total: marketing template, operator explicitly rejected.
- Donut/stacked bar for Inference vs Environment: see D7 reversal — these are not optimization levers, stay as flat text.
- New color tokens or semantic tinting on metric labels: all stats are neutral, no color encoding.
- Tile grid with `<Card>` wrappers: see card-usage.md — these metrics are not discrete objects with stable identity or actions. They are scalars in a reading flow.

---

### D10 — Section boundary treatment (updated 2026-06-14)

**HUD-side question:** The Usage tab has three visual layers stacked inside the sticky chrome — the stat strip (Cost breakdown), and the Per-trace breakdown. At scroll-top, only spacing separates them. How do we make each subsection's start legible without card chrome, new tokens, or permanently pinning a border on the sticky header?

**Choice:** Section-title underline on both subsection titles — the underline hugs the title text width only, NOT the full container width.

Each subsection title (`Cost breakdown`, `Per-trace breakdown`) is an `<h2>` that carries `border-b border-border pb-3` directly. The hairline sits flush under the title text and ends where the text ends. The Group-by dropdown lives in the right slot of the same flex row but sits on the baseline, not under a border — the shelf border is the title's underline, not a row-spanning rule.

**Why the implementation (text-width underline) is preferred over the prior spec (full-width rule):**

The full-width shelf rule was the original spec. The implementation put `border-b` on the `<h2>` itself, producing a text-width underline. Operator confirmed the implementation is correct. The text-width underline is lighter and more precise — it anchors the section label without drawing a horizontal rule across the full content width (which would compete visually with the table borders below).

**Why not the alternatives:**

- **(b) Full-width `<Separator>` between subsections** — the taskset-detail Overview tab uses full-width `<hr>` separators between its three major blocks (leaderboard → chart → description). Those are feature-level blocks of distinct types. Cost breakdown and Per-trace breakdown are two facets of the same cost audit — a heavier separator between them would overstate their difference. The title underline is lighter and more precise.
- **(d) Gap + weight alone** — density posture cannot carry the boundary at scroll-top with the current spacing. The stat strip reads as orphaned copy without an anchor edge.
- **(c) Tinted background** — would require elevating one subsection off the page surface, which reintroduces the surface-contrast problem the card removal solved. Per card-usage.md decision ladder §5: divider line (step 2) before tinted background (step 3).
- **(e) Full-width shelf on the row** — prior spec; reversed per operator confirmation. See above.

**Peer surface cross-reference:** Taskset-detail Overview tab uses `──────` `<hr>` separators (token: `border-t border-border`) between Leaderboard, Top 5 chart, and Description blocks. These are full-width horizontal rules placed between blocks — a heavier treatment appropriate for blocks of fundamentally different type. The Usage tab's title underline is the lighter cousin: same token (`--border`), but scoped to the title text width. Consistent family, appropriate weight for the subordinate level.

**Scroll-cue respect:** The title underlines live inside the scrollable tab content, not on the sticky chrome. The sticky header's `border-b` remains `border-transparent` at scroll-top and transitions to `border-border` on scroll. No conflict.

**Token contract (no new tokens):**
- Title underline: `border-b border-border pb-1.5` on the `<h2>` element — existing `--border` token (rgb 255 255 255 / .08 in dark mode). Underline hugs title text baseline at spacing-1.5 (6px); underline width = text content width.
- Section title: `text-label` (13px), `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.06em`, `color: var(--foreground)`.
- Shelf row top margin: `mt-8` (32px) to breathe from preceding content; `gap-4` (16px) between shelf row and content below.
- No border-strong, no new shadow, no color tinting.

**Persona reason:** Alex and Sam scan at speed. A named section with a hairline landing edge costs zero cognitive overhead — the eye reads "here is a new named thing" and keeps moving. The text-width underline is invisible when everything is going well and becomes apparent only when the user needs to locate a section. It avoids the visual noise of a full-width rule competing with the bordered table directly below.

---

## Layout

Top-to-bottom rendering order within the tab body (below the sticky tab bar):

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  COST BREAKDOWN  ── (section-title underline shelf) ─────────────────────── │
│  ESTIMATED TOTAL   INFERENCE   ENVIRONMENT   AVG/TRACE                       │
│  $2.90             $1.70       $1.20         $0.10 (30 traces)   [Export ↓] │
│                                                                               │
│  WASTED-COST CALLOUT  (conditional — only when ≥1 errored trace has cost)    │
│  ⚠  $0.13 spent on 1 errored trace    Jump to trace →                       │
│                                                                               │
│  PER-TRACE BREAKDOWN  ─ (section-title underline shelf) ── Group by: [None ▾]│
│  TRACE    TASK                          STATUS  INFERENCE  ENVIRONMENT  TOTAL▼│
│  a72f08b  t-001  Navigate checkout…    Scored  $0.13      $0.04        $0.17 │
│  c3d190f  t-002  Submit order form…    Scored  $0.12      $0.04        $0.16 │
│  8e4b22a  t-001  Navigate checkout…    Scored  $0.10      $0.04        $0.14 │
│  5bae77c  t-003  Search for product…   Error   $0.09      $0.04        $0.13 ← tinted row│
│  ...                                                                          │
│                                                                               │
│  [Show all 30 traces]                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Section shelf anatomy (D10):** Both subsections open with a `section-shelf` flex row:
- Left: section title `<h2>` carries `border-b border-border pb-1.5` directly — the underline hugs the title text width only, not the full container width.
- Right: optional control slot. Cost breakdown: empty. Per-trace breakdown: `Group by: [None ▾]` dropdown (moved here from the prior `section-row` div).
- Above each shelf: `margin-top: 32px` (first shelf from tab bar: `28px`). Below shelf to content: `gap-4` (16px). Net effect: title text → 6px (`pb-1.5`) → underline → 16px (`gap-4`) → content — the title text + underline stay coupled while the gap to content reads as proper block separation.

**Role labels:**

| Section | Role |
|---|---|
| Cost breakdown (section shelf + stat strip) | Aggregate cost summary — total + decomposition (inference, environment, avg/trace, trace count) + Export action. Shelf provides the named landing edge (D10). |
| Wasted-cost callout | Conditional alert — waste visibility before the per-trace details |
| Per-trace breakdown (section shelf + group/trace table) | Audit and optimization detail — expandable, grouped, sortable. Shelf carries the Group-by control in its right slot (D10). |
| Show all / pagination | Progressive reveal — initial cap prevents overwhelming render |

> **Removed section:** BY MODEL table (was between header row and wasted-cost callout). Model comparison is now conveyed via `Group by: Model` in the per-trace breakdown. See D9.

---

## Summary stat strip anatomy

> **Updated 2026-06-14 per D9.** The former "Tab content header row" (with `h1 Usage` + right-aligned total block) is replaced by this stat strip. The `Usage` h1 is removed entirely — the tab nav IS the title. The previous wireframe assumed an in-tab `Usage` heading; that assumption is reversed.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ESTIMATED TOTAL   INFERENCE   ENVIRONMENT   AVG/TRACE                       │
│  $2.90             $1.70       $1.20         $0.10 (30 traces)   [Export ↓] │
└──────────────────────────────────────────────────────────────────────────────┘
```

The strip is a single horizontal flex row (`flex items-end gap-6`). Every stat is a `flex-col gap-0.5` two-line block — label on top, value below — so all four blocks stand at uniform height and the label row and value row form two clean horizontal bands across the strip. Export button is `ml-auto self-center` (right-aligned, vertically centered). No card border or background fill — the strip renders directly on the tab body surface.

**Alignment contract:** `items-end` aligns all stat blocks by their value baseline (bottom line). The label row sits above in each block. Because all blocks are `flex-col` of equal structure, both the label band and the value band are visually level across the full strip width. No block is taller than another.

**Element breakdown:**

- **Total label** (`ESTIMATED TOTAL`) — `text-meta-foreground`, uppercase, `text-[11px]`, `tracking-wider`, `font-normal`. Top line of the leftmost stat block.
- **Total value** (`$2.90`) — `text-foreground`, `font-mono`, `font-bold` (weight 700), `text-display` (20px). Bottom line of the leftmost stat block. Reads first in LTR scan. The 1.43× lead-to-peer ratio (20px / 14px) satisfies the "scans in one eye-pass" mandate; the prior `text-base` (16px) produced a 1.14× ratio that failed it.
- **Inference label** (`INFERENCE`) — same label style as `ESTIMATED TOTAL`. Top line.
- **Inference value** (`$1.70`) — `text-foreground`, `font-mono`, `font-medium` (weight 500), `text-sm` (14px). Bottom line. Same pattern applies to `ENVIRONMENT` / `$1.20`.
- **Avg/trace label** (`AVG/TRACE`) — same label style.
- **Avg/trace value** (`$0.10 (30 traces)`) — value `$0.10` in `text-foreground font-mono font-medium text-sm`; `(30 traces)` in `text-meta-foreground text-sm` space-separated inline on the same bottom line.
- **No separator dots (`·`)** — the `gap-6` (24px) between stat blocks is sufficient visual partition. Separator dots are removed: they were ambiguous between the two-line structure (did the dot separate labels or values?).
- **Export button** — secondary/ghost style with download icon, right-aligned. See OQ-4 for format.

**No freshness cue in the strip.** D8 specified a single cue near the total; this is an open call for v1 — the freshness cue was previously cut from the header per the prior iteration. Engineers may omit it entirely in v1 and add it as a tooltip on the total if needed.

---

## BY MODEL table anatomy

```
MODEL          | TRACES | AVG / TRACE | COST / SUCCESS  | TOTAL | VS AVG TRACE
──────────────────────────────────────────────────────────────────────────────
claude-opus    | 9      | $0.12       | $0.15           | $1.05 | +33%
               |        |             | (7 of 9)        |       |
claude-haiku   | 9      | $0.05       | $0.07           | $0.52 | −44%
               |        |             | (7 of 9)        |       |
══════════════════════════════════════════════════════════════════════════════
Job total      | 18     | $0.09       | $0.11           | $1.57 | —
               |        |             | (14 of 18)      |       |
```

**Column spec:**

| Column | Content | Notes |
|---|---|---|
| MODEL | Model ID string, monospace | Links to Model detail page |
| TRACES | Integer count | Count of traces attributed to this model in this Job |
| AVG / TRACE | Monospace dollar, 2 decimal places | `Total ÷ Traces` |
| COST / SUCCESS | Monospace dollar, 2 decimal places + `(N of M)` muted sub-text | `Total ÷ successful traces`. Muted sub-text shows `(N of M)` where N = traces with reward ≥ 0.5, M = total traces for this model |
| TOTAL | Monospace dollar, 2 decimal places | Total spend attributed to this model |
| VS AVG TRACE | Delta badge | `(model avg/trace − job avg/trace) / job avg/trace`. Above job avg = more expensive → destructive tint badge (`+X%`). Below job avg = cheaper → scored tint badge (`−X%`). App-level color logic — do not abstract into a DS component. Job-total row shows `—` |

**Table caption** (appears above column headers in italic muted text-meta):
> "Comparing models by cost-to-reach-target. Cost / Success = total spend ÷ traces scoring ≥0.5."

This is the only place on the page that defines the success threshold. It must render unconditionally.

**Sort:** BY MODEL rows sort by TOTAL descending. The Job-total row is always pinned at the bottom regardless of sort — it is a summary row, not a data row. Strong border-top separates it from the model rows.

---

## Wasted-cost callout anatomy

```
⚠  $0.13 spent on 1 errored trace                              Jump to trace →
```

- Background: destructive-subtle tint (`--alert-destructive-bg`).
- Border: destructive color at low opacity.
- Amount (`$0.13`) — monospace, destructive text color.
- Label (`spent on 1 errored trace`) — muted foreground. Pluralizes correctly for N > 1: `1 errored trace` / `3 errored traces`.
- `Jump to trace →` — ghost-destructive link, right-aligned. Filters the per-trace breakdown to Status = Error and scrolls to the first errored row.

**Conditional rendering:** Only renders when `errored_trace_count > 0 && errored_total_cost > 0`. If all errored traces have $0.00 cost (infrastructure-side aborts with no billing), callout is suppressed. If there are zero errored traces, callout is suppressed.

---

## Per-trace breakdown anatomy

### Section header row

```
Per-Trace Breakdown                                         Group by: [Model ▾]
```

- Section label — text-label, semibold, uppercase.
- Group-by dropdown (right) — options: `None · Model · Status · Task`. Default: `None` universally. User opts into grouping. See D5.

### Group row (one per group when grouped)

**Group by Model / Status** — same anatomy as before:

```
▼ claude-opus-4-6  9 traces                                              $1.05
```

**Group by Task** — task group header mirrors Model/Status anatomy with task-specific aggregates:

```
▼ t-001  Navigate checkout page and add item to cart…   avg $0.14/trace · $1.26 total · 9 traces · 8 Scored / 1 Error
```

- Collapsible chevron (▼ expanded / ▶ collapsed).
- Left: `task.id` monospace + truncated task prompt (single line, ellipsis) — same cell pattern as the Task column and the Traces tab task display.
- Right: aggregated totals — avg cost per trace · total spend · trace count · success/error mix. All right-aligned, monospace dollar values, muted separators. Mirrors the Model/Status group-header right-side aggregate pattern.

**Group row field anatomy across all group-by options:**

| Group-by | Left label | Right aggregates |
|---|---|---|
| Model | Model ID string, monospace | trace count · total cost |
| Status | Status label (Scored / Error / …) | trace count · total cost |
| Task | `task.id` mono + truncated prompt, ellipsis | avg cost/trace · total cost · trace count · success/error mix |

### Trace rows (within an expanded group)

```
TRACE     TASK                         STATUS  INFERENCE  ENVIRONMENT        TOTAL ▼
a72f08b   t-001  Navigate checkout…   Scored  $0.13      $0.04  (5m base)   $0.17
c3d190f   t-002  Submit order form…   Scored  $0.12      $0.04  (5m base)   $0.16
8e4b22a   t-001  Navigate checkout…   Scored  $0.10      $0.04  (5m base)   $0.14
5bae77c   t-003  Search for product…  Error   $0.09      $0.04  (5m base)   $0.13  ← errored row tint
```

**Column spec — final order: Trace · Task · Status · Inference · Environment · Total**

| Column | Content | Notes |
|---|---|---|
| TRACE | Short trace ID (8 chars), monospace, primary color | Links to Trace viewer |
| TASK | `task.id` monospace + truncated task prompt, single line, ellipsis | Same cell pattern as Traces tab task display. Null/empty task renders `—`. |
| STATUS | Status pill: Scored (scored-subtle tint) / Error (errored-subtle tint) | Uses platform.md Run lifecycle states |
| INFERENCE | Dollar amount, 2 decimal places, monospace | Inference cost for this trace |
| ENVIRONMENT | Dollar amount + sub-text runtime hint (`5m base`) | Environment cost. Sub-text is muted monospace text-meta |
| TOTAL | Dollar amount, 2 decimal places. Sort indicator ▼ on header | Default sort: descending. Right-aligned |

**Sort indicator:** `▼` (descending arrow) on TOTAL column header indicates active sort direction. Clicking the header toggles ascending/descending (not specced for v1 — sort is fixed Total desc in initial implementation).

**Errored row tint:** Rows with Status = Error receive a low-opacity destructive background tint (`--alert-destructive-bg`). Does not use a strong tint — the wasted-cost callout above handles the attention; the row tint provides context without shouting.

**Row click:** Navigates to the Trace viewer for that trace. No drawer (traces have their own full viewer).

### "Show all" control

```
[Show all 18 traces]
```

- Centered ghost button with border.
- Initial render shows a capped preview (implementation decides cap — suggest first 5 rows per group, or total 20 rows).
- "Show all" loads the full set in place (no navigation).

---

## States and variants

### Multi-model Job (default)

BY MODEL table renders with ≥2 model rows + Job-total row. Per-trace breakdown defaults to `Group by: None` (flat list, sorted Total desc). This is the design as documented above.

### Single-model Job

BY MODEL table is suppressed — showing one model row + a Job-total row that mirrors it is redundant. Replace with a single headline stat block:

```
$0.52  ESTIMATED TOTAL
$0.05  avg / trace  ·  $0.07 cost / success (7 of 9)
$0.82 inference · $0.75 environment
```

Per-trace breakdown defaults to `Group by: None` (no model grouping needed).

**Open question:** See OQ-1 — whether the BY MODEL table should show even for single-model Jobs (for format consistency) is not fully resolved.

### Zero-error variant

Wasted-cost callout is suppressed entirely. BY MODEL table and per-trace breakdown render normally.

### All-errored variant

All per-trace rows have errored row tint. Wasted-cost callout shows total amount across all traces. BY MODEL table: COST / SUCCESS shows `—` or `$0.00 (0 of N)` — implementation choice (see OQ-3). The Tab content header totals still show the dollar amounts (cost was incurred even though no output was produced).

---

## Data inputs

Minimal contract the engineer needs. List shapes, not full TypeScript types.

**Per-model rollup** (one row per model in the BY MODEL table):

```
{
  model_id: string,           // "claude-opus-4-6"
  traces: number,             // 9
  avg_per_trace: number,      // 0.12 (dollar)
  cost_per_success: number,   // 0.15 (dollar)
  successful_count: number,   // 7 (traces with reward ≥ success_threshold)
  total: number,              // 1.05 (dollar)
  vs_avg_trace_pct: number,   // +0.33 (signed float, e.g. +33% above job avg)
}
```

**Per-trace rows** (one row per trace in the per-trace breakdown):

```
{
  trace_id: string,           // "a72f08b1" (short ID, 8 chars)
  model_id: string,           // for group-by logic
  task_id: string | null,     // for group-by Task; Task column cell left value
  task_prompt: string | null, // truncated at display layer; Task column cell right value
  status: "Scored" | "No score" | "Not run" | "Errored",
  reward: number | null,      // null for non-Scored statuses; used by BY MODEL Cost/Success math only — not displayed in per-trace table
  inference_cost: number,     // dollar
  environment_cost: number,   // dollar
  environment_label: string,  // "5m base" — runtime hint sub-text
  total: number,              // dollar
}
```

**Job aggregate** (single object for header row and caption logic):

```
{
  total: number,              // 1.57 (dollar)
  inference: number,          // 0.82 (dollar)
  environment: number,        // 0.75 (dollar)
  traces_count: number,       // 18
  inference_calls_count: number, // 145
  successful_count: number,   // 14
  errored_count: number,      // 1
  errored_cost: number,       // 0.13 — for wasted-cost callout
  success_threshold: number,  // 0.5 — fixed for now; see OQ-2
  cost_calculated_at: string, // ISO timestamp — for freshness cue
  avg_per_trace: number,      // 0.09 (dollar) — job-level baseline for vs-avg delta
  cost_per_success: number,   // 0.11 (dollar) — job-level
}
```

---

## Open questions

**OQ-1 — Single-model Job: BY MODEL table shown or hidden?**

This wireframe hides the BY MODEL table for single-model Jobs and replaces it with a headline stat block. Alternative: always show BY MODEL (even with one model row + totals row) for format consistency so the page does not change structure based on job type. Decision not locked — flag during implementation.

**OQ-2 — Success threshold: fixed at 0.5 or per-Job configurable?**

The caption and Cost/Success math hard-codes `≥0.5`. If Jobs allow a configurable success threshold (e.g., set at the Taskset level or Job config level), the threshold must be pulled from the Job object and substituted everywhere `0.5` appears (caption text, BY MODEL denominator logic). This is a data contract question for the backend team.

**OQ-3 — CLOSED. Reward column removed from per-trace table (see D6).**

The `0.00` vs `—` display question was specific to the Reward column, which has been dropped. The `reward` field remains in the data contract for BY MODEL Cost/Success math only; it is not rendered in the per-trace table.

**OQ-4 — Export format: CSV, JSON, or Stripe-invoice-style PDF?**

The Export button is specced but the format picker is not. Three options identified: (a) CSV (two files: model rollup + trace rows), (b) JSON (mirrors the data contract above), (c) PDF invoice-style for FinOps / procurement submission. No format has been chosen. The Export button can ship as a direct CSV download in v1 and the format picker can be added later.

---

### D-RESP — Responsive behavior (Usage tab)

**HUD-side question:** Alex and Sam open this tab in Slack-share overlays and narrow laptop/tablet splits. The Per-trace breakdown table has six columns (Trace, Task, Status, Inference, Environment, Total). What degrades, and what must stay reachable?

**Persona anchor:** The tab is unlikely to be used on a phone as a primary surface. Narrow-viewport use is real (split screen, browser sidebar, overlay) but the full column set must remain reachable — hiding columns would prevent the cost audit. Horizontal scroll on the table preserves all data. The per-trace table has six columns: Trace, Task, Status, Inference, Environment, Total.

**Breakpoints use Tailwind v4 built-ins:** `sm` = 640px · `md` = 768px · `lg` = 1024px.

**Behavior by breakpoint:**

| Breakpoint | Stat strip | Per-trace table | Group-by control |
|---|---|---|---|
| **< sm (< 640px)** | Stack vertically: `flex-col gap-3`. Each stat (`$2.90 / Inference $1.70 / Environment $1.20 / Avg/trace $0.10`) on its own line. Export button drops below the last stat, left-aligned. | Wrapped in `overflow-x-auto` container — all six columns (Trace, Task, Status, Inference, Environment, Total) reachable by horizontal swipe. No columns hidden. | Stays inline right of the section title; wraps below via `flex-wrap` if the title + control exceed the container width. |
| **sm–md (640–768px)** | Two-row wrap: total + one or two stats on row 1; remaining stats on row 2. Export button right-aligned on row 1. | All columns fit at `md` breakpoint widths; may horizontal-scroll under column compression. `overflow-x-auto` remains on the wrapper. | Inline, no wrap needed. |
| **md+ (≥ 768px)** | Current desktop layout — single horizontal strip, no changes. | Full table, no scroll. | Inline. |

**What is explicitly not done:**
- No column hiding at any breakpoint — every column (Trace, Task, Status, Inference, Environment, Total) is a cost audit input; hiding any one requires the user to navigate to Traces tab to recover the data.
- No card or accordion collapse of the stat strip on mobile — the cost summary is the primary information, not a secondary detail to collapse.

---

## Out of scope

- **Job detail page header and tab bar** — the Job page anchor wireframe owns the page header, descriptor strip, and tab bar.
- **Trace viewer** — row click on a per-trace row navigates to the existing Trace viewer. This tab does not reimplement trace content.
- **Model detail page** — the model name link in BY MODEL navigates to the existing Model detail page.
- **Usage across multiple Jobs** — this tab is scoped to a single Job run. Cross-Job cost comparison lives in a future analytics surface (not yet specced).
- **Real-time cost streaming** — cost is shown as calculated-at-last-refresh. Live streaming of cost during a running Job is out of scope; the freshness cue (D8) handles the communication gap.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md). Peer format reference: [`docs/design/screens/taskset-detail-tasks.wireframe.md`](./taskset-detail-tasks.wireframe.md). Mockup: [`docs/design/mockups/job-detail-usage/index.html`](../../design/mockups/job-detail-usage/index.html).*
