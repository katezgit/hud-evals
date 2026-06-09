# Taskset Detail — Tasks Tab Wireframe

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

**This file specifies the Tasks tab anatomy only.** Header, tab bar, variant matrix, and Overview tab live in the anchor file. Do not re-derive them here.

Cross-links:
- [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md) — **anchor**. Page header, descriptor strip, variant matrix (A/B/C), tab bar, visibility rules, Overview tab. All patterns inherited here verbatim.
- [`docs/design/screens/tasksets.wireframe.md`](./tasksets.wireframe.md) — sibling index. Inline filter chip patterns, sort menu, list-row density, progressive-disclosure grouping.
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome. This file covers tab content only.
- [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md) — peer pattern reference. §4 Results tab: filter-row shape, distribution mini-bar semantics, Pass/Partial/Fail band definitions, "View Traces" inline row action, two-line cell pattern. Borrowed here for the Tasks table.

Visual reference: Image #29 (Tasks tab, current production hud.ai Taskset Detail page — Jun 2026). Patterns inherited only where they pass the persona/job test.

---

## HUD-side question answered

**Alex (PRIMARY):** "What's in this Taskset? Which Tasks are weakest?" — sort Reward ascending to surface the failing Tasks, drill a row to the Task detail to read the Trace. Phase 3 orientation: confirms authored Tasks appear here and scores propagate to the leaderboard correctly.

**Sam (SECONDARY):** "Which Task is causing the regression?" — filter by Scenario or by recent update timestamp to narrow the set, drill the row to the Task's Run history. Incident-response path.

**Riley (TERTIARY — load-bearing for this tab):** "Of my 500 Tasks, which failed QA? Fix them in bulk before the Friday delivery." — filter by QA status = Flagged, bulk-select all matching rows, re-run QA Agent or re-author. Riley spends more time on this tab than any other persona. The entire bulk-select and QA Agent integration surfaces for Riley's scale.

---

## Decision log

### Decision 1: Default column set

**HUD-side question:** Of the columns visible in production (`# · Tr · Task · Progress · Reward · Dist · Updated · Scenario · [Scenario arg columns]`), which are load-bearing for the primary landing scan versus optional?

**Choice:** Seven default columns + `+ Add Column` extension:

| Column | Default | Rationale |
|---|---|---|
| Bulk-select checkbox | Default (owner variants only) | Leftmost; Riley's load-bearing affordance. Absent on Public non-owner (Variant B). |
| `#` | Default | Row index (1-based). Provides a stable reference for "Task 47 failed" in a team discussion. |
| Task | Default | Task ID as a pill `<scenario-arg-N> \| <variant>`. Primary identifier. Two-line cell: Task ID pill on top, Scenario name below (muted). Collapses the `Task` + `Scenario` production columns into one two-line cell — see Decision 3. |
| Progress | Default | 3-step connected-dot sequence showing Golden → K runs → Ready → Verified. Reflects the Taskset's configured Progress Steps. Alex and Riley both need this to know if authoring is complete. |
| Reward | Default | Mean reward float across all Runs on this Task, 4 decimal places (`0.7341`). Mini-bar alongside the float. Alex's primary quality signal per Task. |
| Dist | Default | Pass/Partial/Fail distribution mini-bar. Same band semantics as model-detail Results: Pass ≥0.75, Partial 0.25–0.74, Fail <0.25. Tooltip on column header confirms bands. |
| Tr | Default | Run count on this Task (how many Runs have been completed). Renamed to `Runs` in the column header for legibility — `Tr` is the production abbreviation, but "Runs" is the canonical vocabulary. |
| Updated | Default | Relative timestamp of the last Run on this Task. Riley uses this to distinguish freshly-authored Tasks from stale ones. |

**`+ Add Column` extension (opt-in):** Scenario argument columns (`target`, `expected_count`, and any other `scenario.task(arg=value)` args). QA Status (auto-added when a QA Agent is run — see Decision 6). These are not default because the argument set is Scenario-specific and would vary per Taskset, making a fixed default meaningless.

**Persona reason:** Alex's "which Tasks are weakest?" is answered by Reward + Dist. Sam's "which Task caused the regression?" is answered by Updated + Scenario (visible in the two-line Task cell). Riley's "have all Tasks completed the QA pipeline?" is answered by Progress + QA Status (opt-in until first QA Agent run, then auto-added). The Scenario column is folded into the two-line Task cell to reduce column count without losing the information — see Decision 3.

**Not included by default:** QA Status (Riley's workflow surfaces it on first QA Agent run), Scenario arg columns (Taskset-specific).

### Decision 2: Bulk-select column (Riley's load-bearing affordance)

**HUD-side question:** Riley needs to select all 47 failed Tasks and apply a QA Agent in one action. What is the minimal bulk-select model that serves this without adding friction to Alex's read-only scan?

**Choice:** Checkbox in the leftmost column, present only on owner variants (A and C — Private owner, Public owner). Variant B (Public non-owner) has no checkbox column — bulk actions are unavailable for non-owners.

Behavior:
- **Zero rows selected:** checkbox column is visible but unchecked. Filter row visible normally.
- **One or more rows selected:** a bulk action bar appears as a pinned strip between the filter row and the table header. The filter row remains visible — it must not be replaced, because Riley may have an active filter (e.g., QA Status = Flagged) that scoped the selection. Replacing the filter row would discard the visible filter context. The bulk action bar adds altitude above the table header.
- **Column header checkbox:** tri-state. Unchecked = none selected. Indeterminate `[—]` = some selected. Checked = all visible (filtered) rows selected.
- **"Select all N Tasks" affordance:** when the column header checkbox selects all visible rows, if there are more rows beyond the current viewport (virtualized scroll — see Decision 8), a banner appears: "47 rows visible. Select all 500 Tasks in this Taskset? [Select all]". Riley's 500-task batch requires this.

**Persona reason:** Alex never bulk-selects — he reads the table and drills rows. The checkbox column is present in owner variants but does not obstruct his scan because the leftmost-column affordance is visually minimal (unchecked state is a ghost/outline checkbox that does not draw the eye). Riley's entire QA workflow requires selecting 50–500 Tasks at once; without this, she operates one task at a time.

### Decision 3: Two-line Task cell — Task ID + Scenario name

**HUD-side question:** Production has separate `Task` (ID pill) and `Scenario` (name string) columns. Should these remain separate or merge into a two-line cell?

**Choice:** Merge into a single two-line Task cell. Line 1: Task ID pill `[<arg-N> | <variant>]`. Line 2: Scenario name, muted, smaller register.

Rationale: The Scenario name is context for the Task ID — you read them together. Two adjacent narrow columns for related information at different register levels is better expressed as a two-line cell. This also reclaims one column slot for the Reward mini-bar to breathe. The Scenario name in line 2 is still a link — it navigates to the Scenario's Environment. Production's standalone `Scenario` column is not dropped; its information is surfaced at second-line altitude in the same cell.

**Persona reason:** Alex scans the Task ID to recognize a specific task from a CLI run. He reads the Scenario name to understand which Scenario produced it. Both are relevant together; separate columns require lateral eye movement for information he consumes simultaneously.

### Decision 4: Filter row content

**HUD-side question:** Riley needs to filter 500 Tasks to the subset that failed QA. Alex needs to find the lowest-scoring tasks. Sam needs to find tasks updated in the last 7 days. What is the minimal filter set that serves all three without a dense filter panel?

**Choice:** Inline filter row with four chips + sort + count anchor:

```
[🔍] Search Task ID or Scenario…  [Scenario ▾]  [Progress ▾]  [QA Status ▾]  [Reward ▾]
[N Tasks · Sort: Reward ▾]  (right-justified)
```

- **Search** — filters by Task ID (arg string) or Scenario name. Freeform text.
- **Scenario ▾** — multi-select from the Scenarios present in this Taskset. Riley filters to a specific Scenario to triage a batch.
- **Progress ▾** — multi-select: Golden sequence / K runs / Ready / Verified. Alex filters to Verified tasks; Riley filters to tasks stuck at K runs.
- **QA Status ▾** — multi-select: Pass / Flagged / Pending / Not run. Riley's primary filter. Visible even before a QA Agent has run — "Not run" is the default state for all Tasks.
- **Reward ▾** — range picker (min–max float). Alex filters to Tasks with Reward < 0.25 to find failures.
- **Row count anchor (right):** `N Tasks` — updates in real time as filters are applied. Riley's delivery status check: "Are there still any Flagged tasks? 0 Flagged."
- **Sort menu (right):** Reward asc/desc (default: Reward desc), Updated newest/oldest, Task ID A–Z, Progress state.

**Persona reason:** Four chips cover Riley's QA triage (QA Status), Alex's weakness-finding (Reward range), Sam's regression hunt (Scenario + Updated via sort), and authoring completeness (Progress). Production's single `[🔽 Filters]` button is replaced by inline chips at this density because Riley needs to reach QA Status without opening a panel — one less click on a high-frequency action.

### Decision 5: Row actions by variant

**Private owner / Public owner (Variants A and C):**
- Row click → Task detail page (edit mode).
- Hover → reveal chevron `⋯` menu at row right: `Edit · Duplicate · Delete · Re-run`. No inline icon buttons — one overflow menu keeps the row uncluttered at 500-row density.
- `+ Create Task` button: lives in the page header overflow `≡` per anchor spec. Owner-variant Task creation flows exclusively through the page header overflow `≡` menu — no trailing row affordance in the table.

**Public non-owner (Variant B):**
- Row click → Task detail page (view-only mode).
- No hover affordance. No `⋯` menu. No `+ Add Task` trailing row.
- Bulk-select column absent.

**Persona reason:** Alex (owner of his Private Taskset) edits Tasks in place. Riley (owner delivering a Private Taskset) needs Duplicate (bulk-author via duplication) and Delete (prune failed tasks). Public non-owner (Alex browsing a community Taskset) is read-only — no affordances that imply editability.

### Decision 6: QA Agent integration (Riley's primary workflow)

**HUD-side question:** Riley applies a QA Agent to 47 flagged Tasks and needs to see results without navigating away. What is the trigger surface, the feedback model, and the column lifecycle?

**Choice:**

**Trigger:** Bulk action bar (see §4) → `[Apply QA Agent ▾]` dropdown lists available QA Agent types: `Prompt Alignment · Failure · False Negative · False Positive · Reward Hacking`. Selecting one fires the QA Agent against the selected Tasks. Multiple QA Agent types may be applied in sequence.

**Column lifecycle:**
- Before any QA Agent has run: `QA Status` column is absent from the default view. It appears in `+ Add Column`.
- When a QA Agent run is triggered: `QA Status` column is automatically inserted into the table as the rightmost default column. Its cells show `Pending` for the selected rows, `Not run` for all others.
- As results arrive: cells update from `Pending` to `Pass` or `Flagged`. This is ambient status — no page refresh, no navigation.
- After run completes: Riley can filter `QA Status = Flagged` to triage failures immediately.

**QA Status cell values:** `Pass` · `Flagged` · `Pending` · `Not run`. `Flagged` cells show a brief reason label on hover (e.g., "Reward Hacking detected").

**Persona reason:** Riley's clock is Friday delivery. The QA Agent workflow must be triggerable in three actions (filter to target tasks → bulk-select → apply QA Agent) and show results without a navigation hop. The auto-insert of the QA Status column after first run avoids a manual `+ Add Column` step that would interrupt the triage flow.

### Decision 7: Dist column band semantics

**HUD-side question:** Are the Dist mini-bar bands the same Pass/Partial/Fail thresholds as the model-detail Results tab?

**Choice:** Yes. Identical band definitions inherited from model-detail Decision 2:
- Pass: Reward ≥ 0.75
- Partial: 0.25 ≤ Reward < 0.75
- Fail: Reward < 0.25

Column header tooltip: "Pass ≥0.75 · Partial 0.25–0.74 · Fail <0.25". Same tooltip text as model-detail for cross-page consistency.

**Important:** These are reward-score band labels, not Run lifecycle states. The canonical Run lifecycle states per `platform.md` are `Scored / No score / Not run / Errored`. The Dist bands (`Pass / Partial / Fail`) describe where a Run's reward score falls on a 0–1 scale — a `Scored` Run (any numerical reward returned) can fall in any band including `Fail` (score < 0.25). Do not conflate the two systems.

**Persona reason:** Alex switches between the model-detail Results tab and the Taskset Tasks tab during a forensics session. Identical band thresholds eliminate a re-calibration step. Same for Sam running a regression check.

### Decision 8: Pagination strategy

**HUD-side question:** Riley's Tasksets have 500 Tasks. Load-more pagination means she re-triggers a load to reach Task 400. What is the right strategy at this scale?

**Choice:** Virtualized scroll. The table renders only the rows visible in the viewport plus a small buffer. Scrolling is continuous — no load-more button, no page numbers. The row count anchor in the filter row (`N Tasks`) is the orientation signal Riley needs ("I have 500 Tasks, 47 flagged").

For small Tasksets (≤50 Tasks): virtualized scroll is imperceptible — it behaves the same as a full render. No threshold logic needed in the spec; implementation chooses the virtualization window.

**Not chosen:** Paginated (page 1 of 50). Pagination breaks Riley's bulk-select flow — "select all on this page" is not "select all 500". Virtualized scroll with the "Select all N Tasks" banner (Decision 2) resolves this correctly.

**Persona reason:** Riley's primary flow is bulk-select + filter. Both require the full row set to be addressable without navigating pages. Virtualized scroll gives performance at 500 rows without imposing page-navigation overhead.

---

## §1 Tab content layout

The Tasks tab body occupies the scrollable region below the sticky tab bar. The tab bar itself is defined in the anchor.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [STICKY PAGE HEADER — see anchor §2]                                            │
│  [STICKY TAB BAR — see anchor §3]                                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│  TASKS TAB BODY                                                                  │
│                                                                                  │
│  FILTER ROW  (sticky, pinned below tab bar)                                      │
│  [bulk action bar when ≥1 row selected — above filter row, same sticky zone]     │
│  ─────────────────────────────────────────────────────────────────────────────   │
│  TASK TABLE  (virtualized scroll, fills remaining viewport height)               │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## §2 Filter row anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  FILTER ROW  (sticky — pinned below tab bar)                                     │
│                                                                                  │
│  [🔍 Search Task ID or Scenario…]  [Scenario ▾]  [Progress ▾]  [QA Status ▾]   │
│  [Reward ▾]                                                                      │
│                                    [500 Tasks · Sort: Reward ▾]  (right)        │
│                                                                                  │
│  — when ≥1 row selected, bulk action bar pins above this filter row —           │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  47 selected  [Apply QA Agent ▾]  [Re-run]  [Delete]  [× Cancel]        │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Filter chip annotations:**
- **Scenario ▾** — dropdown multi-select. Lists only Scenarios present in this Taskset. Shows Scenario names verbatim from `@env.scenario("name")`.
- **Progress ▾** — dropdown multi-select: `Golden sequence` / `K runs` / `Ready` / `Verified`. Labels match the Progress Step names as configured in the Taskset's Settings tab. If Settings has not configured custom names, defaults fall back to these four.
- **QA Status ▾** — dropdown multi-select: `Pass` / `Flagged` / `Pending` / `Not run`. Visible at all times even before a QA Agent has run — "Not run" is the initial state of all Tasks.
- **Reward ▾** — range picker. Min and Max float inputs (0.00–1.00). Apply to filter. Cleared by an × on the chip.
- **Row count anchor:** `N Tasks` — live count, updates as filters are applied. When no filters are active: shows total Task count (matches the tab badge). When filters are active: shows matching count, e.g., `47 of 500 Tasks`.
- **Sort menu:** Reward desc (default) / Reward asc / Updated newest / Updated oldest / Task ID A–Z / Progress state.

---

## §3 Table anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TASK TABLE                                                                      │
│                                                                                  │
│  [☐] │ # │ TASK                        │ PROGRESS  │ REWARD  │ DIST   │ RUNS │ UPDATED │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  [☐] │ 1 │ [0000 | 1]                  │ ●──●──○   │ 0.8600  │ [▓▒░]  │  10  │ 24d ago │
│       │   │  browser:2048-near-win      │           │ [▓▓░░]  │        │      │         │
│  [☐] │ 2 │ [0002 | 1]                  │ ○──○──○   │ 0.6700  │ [▓▒░]  │   2  │  7d ago │
│       │   │  browser:todo-complete      │           │ [▓▓▓░]  │        │      │         │
│  [☐] │ 3 │ [0001 | 1]                  │ ●──○──○   │ 0.8600  │ [▓▒░]  │  10  │ 24d ago │
│       │   │  browser:2048-near-win      │           │ [▓░░░]  │        │      │         │
│  ...                                                                             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Column-by-column spec:**

| Column | Header label | Cell content | Notes |
|---|---|---|---|
| Checkbox | `[☐]` (header = tri-state) | Per-row checkbox | Owner variants only (A, C). Absent on Variant B. |
| `#` | `#` | 1-based row index integer | Stable within the current sort; re-numbers when filtered. |
| Task | `TASK` | **Line 1:** Task ID pill `[<scenario-arg-N> \| <variant>]`. **Line 2:** Scenario name, muted, links to Scenario's Environment | Two-line cell. Task ID pill links to Task detail page. Scenario name is the canonical name from `@env.scenario("name")`. |
| Progress | `PROGRESS` | 3-dot connected sequence: filled dot = step complete, empty dot = not yet | Dots connected by a line. Checked mark on completed terminal step. Tooltip per dot: step name from Settings. |
| Reward | `REWARD` | Float 4 decimal places + mini-bar below the float | Right-aligned float. Mini-bar width proportional to 0–1 scale. `—` if no Runs yet. |
| Dist | `DIST` | Stacked mini-bar: Pass / Partial / Fail proportion across all Runs | **Reward-score bands, not Run lifecycle states.** Pass = Reward ≥0.75; Partial = 0.25–0.74; Fail = <0.25. These thresholds are independent of `platform.md` Run lifecycle states (`Scored` / `No score` / `Not run` / `Errored`). Same visual as model-detail Distribution column. Hover tooltip: counts + band thresholds. `—` if no Runs yet. |
| Runs | `RUNS` | Integer — count of completed Runs on this Task | Right-aligned. Matches `Tr` in production (renamed to canonical vocabulary). |
| Updated | `UPDATED` | Relative time of last Run on this Task | `24d ago`, `7d ago`, `just now`. Absolute date on hover tooltip. |

**QA Status column (auto-inserted after first QA Agent run):**

| Column | Header label | Cell content | Notes |
|---|---|---|---|
| QA Status | `QA STATUS` | `Pass` / `Flagged` / `Pending` / `Not run` | Inserted as rightmost default column after first QA Agent run. `Flagged` cells show reason label on hover. |

**Row hover behavior (owner variants):**
- Row highlight (background tint).
- `⋯` overflow menu appears at row-right: `Edit · Duplicate · Delete · Re-run`.
- Checkbox becomes fully visible (no opacity fade).

**Row click target:**
- Entire row except the checkbox, copy buttons, and Scenario name link navigates to Task detail.
- Checkbox is its own click target.
- Scenario name (line 2 of Task cell) links to the Scenario's Environment — not to the Task detail.

---

## §4 Bulk action bar

Appears pinned above the filter row when ≥1 row is selected. The filter row remains visible below it — active filter context must not be lost.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  BULK ACTION BAR  (pinned above filter row when ≥1 row selected)                 │
│                                                                                  │
│  47 selected  [Apply QA Agent ▾]  [Re-run]  [Delete]       [× Cancel]           │
│               └─ Prompt Alignment                                                │
│                  Failure                                                          │
│                  False Negative                                                   │
│                  False Positive                                                   │
│                  Reward Hacking                                                   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Action annotations:**
- **`N selected`** — count reflects currently selected rows. Updates in real time as checkboxes are toggled.
- **`[Apply QA Agent ▾]`** — dropdown. Lists five QA Agent types: `Prompt Alignment · Failure · False Negative · False Positive · Reward Hacking`. Selecting one fires that QA Agent against all selected Tasks immediately. No confirmation modal — the action is reversible (run again, results overwrite). QA Status cells for selected rows flip to `Pending` immediately; results arrive as streaming ambient updates.
- **`[Re-run]`** — triggers a new Run on all selected Tasks using the Taskset's current Job configuration. Opens a lightweight inline prompt: "Re-run N Tasks? This will consume credits. [Confirm] [Cancel]". Credit cost is estimated inline before confirm.
- **`[Delete]`** — destructive. Opens a confirmation: "Delete N Tasks? This cannot be undone. [Delete N Tasks] [Cancel]". Destructive action uses the canonical danger-copy pattern.
- **`[× Cancel]`** — clears all selections. Bulk action bar dismisses. Filter row returns to sole occupant of the sticky zone.

**"Select all" banner (when column-header checkbox is checked and more rows exist beyond viewport):**
```
47 rows visible are selected. Select all 500 Tasks in this Taskset?  [Select all 500]
```
Appears as an inline notice directly below the bulk action bar. Dismissed when `[Select all 500]` is clicked (selection expands to all Tasks) or when `[× Cancel]` clears the selection.

---

## §5 Empty states

### §5a Zero Tasks (Taskset has no Tasks yet)

**Private owner / Public owner (Variants A and C):**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  No Tasks yet.                                                                   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  hud taskset add-task <taskset-slug> --scenario <scenario>        [⎘]   │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  [+ Create Task]                                                                 │
│  Read the docs ↗                                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- CLI command uses the actual Taskset slug, not a placeholder.
- `[+ Create Task]` button duplicates the header overflow affordance — same justification as the anchor's Overview empty state repeating `[▶ Run Taskset]`.

**Public non-owner (Variant B):**
```
This Taskset has no Tasks yet.
```
No CTA, no CLI command — non-owners cannot add Tasks.

### §5b Filter / search returns zero matches

```
No Tasks match the current filters.

[Clear filters]
```

No CLI command — the Taskset has Tasks; the filters are empty, not the Taskset. The single action is `[Clear filters]`. Copy is minimal and factual.

---

## §6 Loading state

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  FILTER ROW — controls rendered but disabled (skeleton state on dropdowns)       │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  TASK TABLE SKELETON                                                             │
│                                                                                  │
│  [░] │ ░ │ [░░░░░░░░░]              │ ░──░──░  │ ░░░░░  │ [░░░] │ ░░ │ ░░░░ │   │
│       │   │  [░░░░░░░░░░░░░░░]      │          │ [░░░░] │       │    │      │   │
│  [░] │ ░ │ [░░░░░░░░░░░░]          │ ░──░──░  │ ░░░░░  │ [░░░] │ ░░ │ ░░░░ │   │
│       │   │  [░░░░░░░░░░░░░░]       │          │ [░░░░] │       │    │      │   │
│  [░] │ ░ │ [░░░░░░░░░]              │ ░──░──░  │ ░░░░░  │ [░░░] │ ░░ │ ░░░░ │   │
│       │   │  [░░░░░░░░░░░]          │          │ [░░░░] │       │    │      │   │
│  (5 skeleton rows — two-line cell shape prevents layout shift on data load)      │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- `aria-busy="true"` on the tabpanel.
- Off-screen `aria-live="polite"` region announces "Loading Tasks".
- Skeleton rows match the two-line Task cell shape so layout does not shift when data loads.

---

## §7 Error state

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Failed to load Tasks.                                                           │
│  [Retry]                                                                         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Earnest voice: states cause (fetch failure), not apology. If the error carries a detail (e.g., "503 from Tasks service"), that detail is shown verbatim below the label: `Failed to load Tasks — 503 Service Unavailable. [Retry]`. No illustration, no decorative chrome.

---

## §8 Responsive behavior

### Desktop — full layout

All columns visible. Bulk action bar and filter row both fit on one line. Two-line Task cell readable at comfortable density.

### Tablet — reduced

Column drop priority (drops first):
1. `Updated` — least load-bearing at glance altitude; available in Task detail.
2. `Runs` — secondary signal; visible in Task detail.
3. `#` — index is lowest-priority; Task ID in the cell is sufficient.

Columns retained at tablet: Checkbox (owner) · Task (two-line) · Progress · Reward · Dist.

Filter row: chips may wrap to a second line if all five don't fit. Sort control stays right-justified on the first line.

### Mobile

- Filter row collapses to: `[🔍]` (icon only, expands to full-width search on tap) + `[⊞ Filters]` button that opens a bottom sheet with all filter chips.
- Table collapses to a card-stack layout. Each card: Task ID pill + Scenario name + Reward float + Progress dots + Dist mini-bar. Runs / Updated / QA Status in collapsed state; expandable per card.
- Bulk-select: checkbox replaces the row-index `#` column in the leftmost slot.

---

## §9 Keyboard and accessibility

- `<table>` element with `<thead>`, `<tbody>`. `role="grid"` on the table to enable arrow-key cell navigation.
- **Column header checkboxes:** `<th scope="col">` wrapping `<input type="checkbox" aria-label="Select all Tasks" aria-checked="true|false|mixed">`.
- **Row checkboxes:** `<td>` wrapping `<input type="checkbox" aria-label="Select Task [Task ID]">`. Not `role="checkbox"` — native `<input>` for full keyboard + AT support.
- **Task cell (two-line):** Task ID pill is an `<a>` linking to the Task detail page; `aria-label="Task [ID], Scenario [name]"`. Scenario name on line 2 is a separate `<a>` linking to the Scenario's Environment.
- **Progress column:** `<span aria-label="Progress: [step-N] of 3 complete">`. Dot visualization is decorative; the aria-label carries the state for screen readers.
- **Reward column:** `<td aria-label="Reward [value]">`. Mini-bar is `aria-hidden="true"`.
- **Dist column:** `<td aria-label="Distribution: Pass [N], Partial [N], Fail [N]">`. Mini-bar is `aria-hidden="true"`. Column header has a `<button aria-label="Distribution column info">` tooltip trigger that describes band thresholds.
- **`—` cells (no Runs yet):** `aria-label="No Runs yet"` — not "dash".
- **Row hover `⋯` menu:** `<button aria-label="Task [ID] actions" aria-haspopup="menu">`. Menu items: `Edit`, `Duplicate`, `Delete`, `Re-run`. `Delete` carries `aria-describedby` pointing to a brief destructive-action description.
- **Bulk action bar:** `role="toolbar" aria-label="Bulk actions for N selected Tasks"`. `[Apply QA Agent ▾]` is `aria-haspopup="listbox"`. `[× Cancel]` announces selection count cleared via `aria-live="polite"`.
- **Filter chips:** each `<button aria-pressed="true/false">` chip announces its active state. When a chip filter is active, the row count updates; `aria-live="polite"` on the count announces the new count.
- **Virtualized scroll:** accessible scroll container; `aria-rowcount` on the table equals total row count (not visible row count) so screen reader count matches the filter-row anchor.
- **Keyboard navigation within table:** arrow keys move between cells; `Space` toggles row checkbox; `Enter` opens Task detail; `Escape` clears bulk selection when focus is in the bulk action bar.

---

## §10 Persona notes by surface decision

| Decision | Alex (PRIMARY) | Sam (SECONDARY) | Riley (TERTIARY) |
|---|---|---|---|
| Decision 1: Column set | Reward + Dist are the primary scan columns. Task ID links to Task detail for drill. Progress confirms authoring completeness. | Updated + Scenario (via two-line Task cell) are the regression-hunt columns. Reward confirms regression severity. | Progress + QA Status (auto-inserted) are the delivery-readiness columns. Reward + Dist confirm score range for buying lab. |
| Decision 2: Bulk-select (owner only) | Never uses bulk select — reads the table row by row. Checkbox column is visually minimal in unchecked state and does not obstruct. | Rarely uses bulk select — may re-run a batch after a regression, but not the primary flow. | Load-bearing. Select 47 flagged Tasks → Apply QA Agent in 3 actions. The "Select all 500" banner is specifically for Riley's batch scale. |
| Decision 3: Two-line Task cell | Task ID pill on line 1 = the string Alex pastes when referencing a task in a team discussion. Scenario name on line 2 = context he reads simultaneously. Fewer eye-movement hops than two columns. | Scenario name on line 2 is Sam's primary filter target — he scans it to find which Scenario class produced the failing Tasks. | Task ID pill is Riley's per-task identifier in QA reports. Scenario name confirms the task belongs to the right Scenario. |
| Decision 4: Filter row chips | Reward range chip is Alex's primary tool for finding weak Tasks. | Scenario + Updated (via sort) cover Sam's regression triage. | QA Status chip is Riley's primary tool. Scenario chip scopes triage to a single contract deliverable. |
| Decision 5: Row actions by variant | Row click → Task detail. Hover `⋯` for Edit/Re-run on owned Tasks. | Row click → Task detail (view-only on Public Tasksets). | Hover `⋯` for Edit/Duplicate/Delete — Riley authors at scale; all three actions are high-frequency. |
| Decision 6: QA Agent integration | Not applicable — Alex does not apply QA Agents on Tasks. | Not applicable — Sam uses QA Agents on Automation flows, not per-Task bulk apply. | Load-bearing. Bulk apply → auto-insert QA Status column → filter to Flagged → re-author → re-run QA Agent is the core delivery loop. |
| Decision 7: Dist band semantics | Identical bands to model-detail Results tab — cross-tab consistency for Alex's forensics session. | Same benefit — Sam switches between model-detail and Taskset Tasks during regression work. | Reward Hacking detection in QA Status is the primary quality gate. Dist bands are a secondary sanity check. |
| Decision 8: Virtualized scroll | Imperceptible at 10–50-task Tasksets Alex typically owns. No cost. | Imperceptible at typical Sam Taskset sizes. | Required. Riley's 500-task Tasksets cannot use paginated scroll without breaking the "Select all 500" bulk-select model. |

---

## §11 Open questions

1. **Progress column — fixed 3-step pipeline or dynamic per Taskset?** Image #26 (Settings tab) shows a configurable Progress Steps spec. Does the Tasks tab always show 3 dots, or does the dot count match the number of configured Progress Steps in Settings? If dynamic, the column width must accommodate 2–5 dots. If always 3, simpler.

2. **`Tr` vs `Runs` column label:** Production uses `Tr` (abbreviation). This wireframe renames it `RUNS` to align with canonical vocabulary. Confirm this rename doesn't collide with `Runs/Task` semantics from the model-detail Results tab (`RUNS/TASK` column). They measure different things: model-detail `RUNS/TASK` = repetitions per task in a Job; Taskset Tasks `RUNS` = total Runs ever completed on this Task across all Jobs. The column tooltip must disambiguate.

3. **QA Status column auto-insert placement:** When QA Status auto-inserts after the first QA Agent run, it is specced as the rightmost default column. Riley may have manually added Scenario arg columns via `+ Add Column` to the right. Does auto-insert go after all existing columns, or does it insert at a fixed position (e.g., after Dist)? Fixed position after Dist seems more predictable.

4. **Task ID pill format:** Production shows `[<scenario-arg-N> | <variant>]` as a purple pill with two parts separated by `|`. Is the `<variant>` part a version integer (always 1) or something else (checkpoint slug, job ID)? Affects the copy displayed in the pill and the `aria-label`.

5. **"Re-run" bulk action — which Job configuration?** When Riley re-runs selected Tasks, which Job config applies: the most recent Job config for this Taskset, or a new configurable one? If configurable, does a lightweight Job config panel appear? This determines whether `[Re-run]` is a one-click action or requires a confirmation step with config options.

6. **Delete Task on a Public Taskset (owner):** Variant C is Public owner. If Riley deletes a Task from a Public Taskset, does this affect external users who have run Jobs against that Task? Confirm whether Task deletion is soft (hidden) or hard (permanent) and whether it requires a stronger warning for Public Tasksets.

7. **`+ Create Task` in header overflow only:** The anchor spec places `+ Create Task` in the page header overflow `≡`. This wireframe no longer surfaces a trailing table row — owner-variant Task creation flows exclusively through the overflow menu. Confirmed: no trailing row.

---

## Out of scope

- **`+ Create Task` modal / page** — the Task creation flow (choosing a Scenario, setting arg values) is a separate wireframe.
- **Task detail page** — drilling from a row navigates here; the Task detail wireframe is a separate artifact.
- **QA Agent author / config flow** — the surface for creating or configuring QA Agent types is out of scope. This tab surfaces existing QA Agent types only.
- **Scenario authoring** — Tasks reference Scenarios authored in the Environment. The `@env.scenario()` authoring surface is the Environment detail page, not this tab.
- **Export / download** — bulk export of the Task list (CSV, JSON) is referenced in the anchor's overflow `≡` menu. The export flow itself is out of scope.

---

## Drift log

- **Filter row: inline chips vs production `[🔽 Filters]` button.** Production uses a single `[🔽 Filters]` button. This wireframe replaces it with four inline chips (Scenario, Progress, QA Status, Reward). Justified: Riley's primary workflow requires QA Status to be reachable in one click without opening a panel. The production single-button approach adds one click on a high-frequency filter action. Inline chips at this count (four) do not produce cognitive overload.

- **`Scenario` column merged into two-line Task cell.** Production has separate `Task` and `Scenario` columns. This wireframe merges them. Justified: they are consumed together; merging reduces column count and lateral scan distance. Scenario name remains fully visible in line 2 of the Task cell.

- **Bulk action bar pins above filter row (does not replace it).** The brief suggested the bulk action bar "replaces" the filter row. This wireframe keeps the filter row visible below the bulk action bar. Justified: Riley applies QA Agent to tasks she already filtered (e.g., QA Status = Flagged). Replacing the filter row hides the active filter context at the moment she most needs to see it — "I've selected 47 of my 47 filtered rows." The filter row and bulk action bar coexist in the same sticky zone, stacked vertically.

- **`Runs` column (renamed from `Tr`).** Production abbreviation `Tr` is non-standard. This wireframe uses `RUNS` in the column header to align with platform vocabulary (`Run` = one trajectory inside a Job). Tooltip disambiguates from model-detail `RUNS/TASK`.

- **QA Status column lifecycle: absent by default, auto-inserted on first run.** Production screenshot (Image #29) does not show a QA Status column. This wireframe introduces it as an auto-inserted column triggered by the first QA Agent bulk action. Justified: the column is meaningless before any QA Agent has run (all values would be `Not run`). Auto-inserting it when it first carries signal reduces default column noise.

- **Removed trailing `+ Add Task` row from Tasks table.** Production shows an inline trailing row for in-flow Task creation. This wireframe removes it. Reason: domain-review FAIL — Alex anti-pattern (`personas.md:10`). Alex authors Tasks via `hud taskset add-task` or Python, never via a form. All Task creation surfaces for owners flow through the page header overflow `≡` menu. Production has the trailing row; this is intentional divergence justified by persona discipline.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md). Visual reference: Image #29 (Tasks tab, current production hud.ai — Jun 2026). Anchor: [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md). Peer pattern reference: [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md) §4 (Results tab). Sibling index: [`docs/design/screens/tasksets.wireframe.md`](./tasksets.wireframe.md).*
