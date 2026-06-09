# Taskset Detail — Jobs Tab Wireframe

> Wireframe convention: structure, hierarchy, copy, and flow only. No pixel sizes, Tailwind classes, or color tokens — those belong to screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md) — **anchor file.** Page header, variant matrix, tab bar, Overview tab, and all shared patterns are specified there. This file specifies the Jobs tab body only. Do not redesign anything the anchor has locked.
- [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md) — peer. §6 Traces tab supplies the batch-grid micro-component pattern (one square per Run, colored by outcome) and the per-Job group header shape. §7 Gateway Logs tab supplies the filter-row + dense table pattern. Both are referenced verbatim here.
- [`docs/design/screens/tasksets.wireframe.md`](./tasksets.wireframe.md) — sibling index. Filter chip set shape, Owner filter progressive disclosure, load-more pagination, and list-row density inherited here.

Visual reference: Image #28 (Jobs tab, current production — operator-supplied Jun 2026). Inherited only where patterns pass the persona / job test.

---

## HUD-side question answered

**Alex (Phase 4 training loop / Phase 5 reward-hack inspection — PRIMARY):** "I ran several Jobs against this Taskset over the last few days. Which one do I inspect for the curve shape that worried me? Where is the job that spiked at step 4,096?" — Sort by date descending (default), scan status badges and batch-grid previews, click into the Job that looks anomalous. The Jobs tab is the entry point to the Trace drill path when Alex arrives from the Taskset page rather than from the training curve.

**Sam (weekly regression audit — LOAD-BEARING for this tab):** "Did this week's Eval Job complete? Did it pass or error? Is the one from two weeks ago still the most recent completed run?" — Sam arrives here every Monday. Default sort (most recent first) puts the latest Job at row 1. One glance at the status badge answers the question. If it errored, Sam drills directly to the Job detail for failure context before the 11 AM call.

**Riley (RL Environment Vendor — rarely uses this tab):** Riley drives runs via CLI and checks quality via Tasks tab, not Jobs. He arrives here only when a buying lab asks "how many eval runs have been completed?" — a count read, not a drill. The Jobs tab count badge on the tab bar already answers this; Riley rarely opens the tab body.

---

## Decision log

### Decision 1: Default sort — Most recent first

Sam's Monday check and Alex's "find the job that worried me" both default to recency. Jobs are time-ordered artifacts; the most recent is always the first question. Sort options: Most recent (default), Oldest first, Highest score, Lowest score, Name A–Z. Sort menu label mirrors tasksets index: `Most recent ▾` (right-justified in the filter row).

### Decision 2: Filter chip set

Three chip groups, left to right in the filter row:

1. **Type:** `All · Eval · Training` — mirrors the production filter (Image #28 confirmed). Eval and Training are the two Job kinds per platform vocabulary.
2. **Validity:** `Valid · Invalidated` — mirrors production. An Invalidated Job is not deleted; it is excluded from the Overview leaderboard and averages. The chip surfaces this distinction.
3. **Outcome:** `Completed · Running · Errored` — production shows status in row badges; adding an Outcome chip lets Sam filter to "show me all Errored jobs" or Alex filter to "show me all Running jobs" without scanning every row. This chip group is not in production — it is a new addition. Justified: Sam's incident-response job ("find the errored job") at scale requires a filter, not a scan.

**Search:** `[🔍 Search Jobs…]` left-aligned, before the chips. Matches Job name or Job ID.

**Owner filter:** `[Owner ▾]` — follows tasksets index progressive-disclosure rule: rendered only when ≥10 distinct owners have run Jobs on this Taskset. At DoorDash-scale, a shared Public Taskset may have dozens of org owners; the filter brings Sam's team's Jobs to the top. Hidden at Alex-scale (1–5 owners). When rendered, positioned right of the Outcome chip, left of the sort menu.

**Scope toggle:** `[My team's Jobs ▾]` — default scope = current user's org only. Toggle opens a dropdown: `My team's Jobs / All teams' Jobs`. All teams' Jobs surfaces Public Jobs from other orgs that have run against a Public Taskset. Default is My team's only — Sam's regression signal is buried by hundreds of external runs if scope defaults to all. Position: rightmost in the filter row, left of the sort menu. When "All teams' Jobs" is active, the Owner filter (if ≥10 owners) becomes especially useful for narrowing.

### Decision 3: Job row anatomy — two-line cell

Production row anatomy (Image #28) is the basis. Each row:

**Line 1 — primary identifiers:**
`☐` checkbox · status icon · Job name (clickable) · status badge · model chip(s) · batch-grid preview

**Line 2 — metadata:**
owner · relative date · scored-% progress bar

Details per field:

| Field | Content | Notes |
|---|---|---|
| Checkbox `☐` | Row selection for bulk actions | Far-left; same pattern as production |
| Status icon | `▶` running/queued; `✓` completed; `×` errored; `⬚` invalidated | Small icon left of Job name; visual redundancy with status badge intentional (scannable at glance altitude) |
| Job name | Clickable; opens Job detail page | Format: `[Type]: [Model name truncated]` (e.g., `Eval: Claude Haiku 4.5`) — matches production. Full name in tooltip when truncated |
| Lock icon `🔒` | Private Job | Present when Job is org-private; matches production |
| Status badge | `[✓ COMPLETED]` · `[× ERROR]` · `[Invalidated]` · `[● Running]` · `[◌ Queued]` | Inline after Job name on line 1. Badge text MAY render uppercase (`COMPLETED`, `ERROR`, `RUNNING`) per platform.md UI label conventions; canonical state names remain `Completed`, `Errored`, `Running`. Color treatment is design-tokens phase |
| Model chip(s) | Primary model chip + `+N` for multi-model Jobs | Same chip shape as production. `+N` on hover reveals full model list in tooltip |
| Batch-grid preview | Inline mini-grid of Run outcomes (one square per Run) | Same square-per-Run pattern as model-detail §6 Traces tab, scaled down to row height. Legend: `■ Scored · □ No score · ◪ Not run · ⊘ Errored`. Clicking any square opens the Trace for that Run |
| Owner | Org name (muted) | Present on line 2 left |
| Relative date | `3 days ago`, `13 days ago` etc. | Present on line 2, after owner; full ISO date in tooltip on hover |
| Progress bar `0% ──── 100%` | Scored Runs / total Runs expressed as a fill proportion with `N%` label | Present on line 2 right; matches production layout. Label shows exact percentage (e.g., `67%`), not rounded to 0% or 100% unless the value is exactly that |

**Batch-grid overflow choice:** Horizontal virtualized scroll — all Run squares are directly clickable → Trace. No `+N more` overflow truncation. This is the Phase 5 one-click drill contract: every Run square opens the Trace for that Run in one click, regardless of Run count. At large Run counts (50+), the grid scrolls horizontally inside the row.

### Decision 4: Invalidated row treatment — full-row diagonal hatch

Invalidated Jobs receive a full-row diagonal hatch overlay on top of the row background, plus the `[Invalidated]` chip status badge. Hatch visual treatment matches production (Image #28 row 3 shows entire row diagonally hatched). The row stays fully clickable — clicking opens the Job detail page. The hatch communicates unambiguously that this Job is excluded from the Overview leaderboard and averages without removing the forensic drill path. Hue treatment (hatch color) is design-tokens phase.

Annotation: the hatch is a CSS overlay on the row element — it does not change the row's DOM structure or remove the clickable region.

**Invalidated chip — audit metadata.** The `Invalidated` chip on the row carries:
- Tooltip on hover/focus: `Invalidated by <user display name> · <date> · "<reason if provided>"`
- On row expand (click): a small audit strip surfaces below the row anatomy: `Invalidated <date> by <user>. Reason: <reason or "—">. [Re-validate]` (Re-validate visible only to owner + admins).

**Riley's buying-lab path** specifically requires `who · when · why` to be inspectable without a navigation hop — the audit strip on expand is the load-bearing affordance for that persona.

### Decision 5: Bulk action bar

**Where the Invalidate action lives.** The primary Invalidate trigger is on the Job detail page (per operator screenshot, Image #35: top-right destructive `[⚠ Invalidate Job]` button on Job detail Overview tab — separate wireframe, out of scope for the Taskset Detail set). The Taskset Detail Jobs tab supports Invalidate / Re-validate via the **bulk action bar** for multi-Job operations (Sam clearing a batch of false-regression Jobs; Riley invalidating disputed deliverable runs). Per-row Invalidate (single Job) navigates to Job detail.

When ≥1 row is selected, the filter row is replaced by the bulk action bar:

```
[N selected]  [Invalidate]  [Re-validate]  [Cancel]
```

- **N selected** — count of selected rows, left-anchored. Not a button.
- **Invalidate** — marks selected Jobs as Invalidated. They are excluded from leaderboard averages. Triggers a brief inline confirmation: "Invalidate N Jobs? They will be excluded from leaderboard scores." Confirm / Cancel. Justified: Invalidate affects Overview leaderboard data; it merits a confirmation, not a silent action.
- **Re-validate** — reverses an Invalidation on selected Jobs. Available only when all selected rows are in `Invalidated` state (mixed selection hides Re-validate and shows Invalidate only). Triggers same brief inline confirmation.
- **Cancel** — clears selection, restores filter row.

**Not in the bulk bar:** Delete. Job deletion requires Job-detail-page confirmation — it is too destructive for a multi-select surface. The bulk bar is for state changes (validity), not deletion.

**Mixed-state selection:** if selected rows include both Valid and Invalidated Jobs, the bulk bar shows `[Invalidate]` only (not `[Re-validate]`). A mixed bulk action on validity is ambiguous; force the user to select one state group for the re-validate path.

### Decision 6: Public non-owner scope — My team's Jobs default

Default scope = `My team's Jobs`. Sam's regression signal is the primary use case; surfacing every org's Jobs by default on a popular Public Taskset buries Sam's signal in noise. The `[My team's Jobs ▾]` scope toggle is positioned at the top-right of the filter row and persists its state per Taskset in session storage. When the user has no Jobs on a Public Taskset, the empty state (§5a non-owner variant) surfaces the scope toggle as a discoverability affordance.

### Decision 7: Row drill path — full row clickable, inline new-tab

Full row click (excluding checkbox) navigates to the Job detail page. On hover, an `↗` open-in-new-tab icon appears at the far right of the row (after the progress bar). No row action menu is needed; the drill path is direct. Tooltip on `↗`: `"Open Job in new tab"`.

Clicking any batch-grid square opens the Trace for that Run — this is the Phase 5 one-click drill path from the Jobs tab. The grid square drill does not navigate to Job detail; it opens the Trace viewer directly.

### Decision 8: Pagination — load-more, default 50

Default page size: 50 Jobs (matches tasksets index). A `[Load more Jobs]` text button appears below the list when additional Jobs exist. Count label right of the sort menu: `N Jobs total`. At load-more threshold, `[Load more Jobs]` becomes `[Load 50 more · N remaining]`.

---

## §1 Tab content layout

The Jobs tab body occupies the full tab panel below the shared sticky header and tab bar (both specified in the anchor file). Contents from top to bottom:

1. Filter row (search + type chips + validity chips + outcome chips + owner filter [conditional] + scope toggle + sort)
2. Bulk action bar (replaces filter row when ≥1 row selected)
3. Job list (rows, each with two-line cell anatomy)
4. `No more items` divider / `[Load more Jobs]` action

---

## §2 Filter row anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  FILTER ROW (default — no rows selected)                                         │
│                                                                                  │
│  [🔍 Search Jobs…]                                                                │
│  [All | Eval | Training]  [Valid | Invalidated]  [Completed | Running | Errored] │
│  [Owner ▾]  (shown only when ≥10 distinct owners)                                │
│  [My team's Jobs ▾]  [Most recent ▾]       (right side)                          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- Chip groups use segmented chip pattern (underline-active variant, same as model-detail filter rows). Selecting a chip within a group is single-select; selecting `All` deactivates other chips in that group.
- Search input clears with `✕` when populated. Placeholder: `Search Jobs…`.
- Sort menu `[Most recent ▾]` is a select dropdown: `Most recent / Oldest first / Highest score / Lowest score / Name A–Z`.
- `[Owner ▾]` is a popover multi-select list. Visible only when ≥10 distinct owners exist on the current scope. Label updates when filtered: `[Owner: acme, hud]` (truncated to first 2 + `+N`).
- `[My team's Jobs ▾]` scope toggle is a select dropdown: `My team's Jobs / All teams' Jobs`. When "All teams' Jobs" is selected, a muted note appears below the filter row: `"Showing Jobs from all teams. Your team's Jobs are highlighted."` — distinguishes the signal without hiding external rows.

---

## §3 Job row anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  JOB LIST — populated state                                                      │
│                                                                                  │
│  ROW (default, Valid, Completed):                                                │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  ☐  ✓  Eval: Claude Haiku 4.5 🔒         [✓ COMPLETED]                    │  │
│  │        [Claude Haiku 4.5]                 [■][■][■][□][■][■][□][■][■][■]  │  │
│  │                                           [■][□][■][■][■][□][■][■][□][■]  │  │
│  │        superbrew llc  ·  3 days ago       ██████████░░░░░░░░░  67%        │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ROW (Errored):                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  ☐  ×  Batch Run: 3 tasks 🔒             [× ERROR]                         │  │
│  │        [Kimi K2.5] +1                    [■][■][×]                         │  │
│  │        superbrew llc  ·  3 days ago       ██████░░░░░░░░░░░░░  33%        │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ROW (Invalidated — full-row hatch overlay):                                    │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│  │
│  │▒ ☐  ⬚  Eval: Claude Opus 4.6 🔒         [Invalidated]              ▒▒▒▒▒▒│  │
│  │▒       [Claude Opus 4.6]                 [■][□][◪]                 ▒▒▒▒▒▒│  │
│  │▒       superbrew llc  ·  18 days ago     ████░░░░░░░░░░░░░░░░░  33%▒▒▒▒▒▒│  │
│  │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ─────────────────────────────────────  No more items  ──────────────────────── │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Batch-grid micro-component:**

The batch-grid preview is the same Run-outcome grid pattern specified in model-detail §6 Traces tab, scaled down to inline row height. One square per Run. Legend applies to the row's legend display only (not repeated per row — legend appears once below the filter row):

```
■ Scored  ·  □ No score  ·  ◪ Not run  ·  ⊘ Errored
```

Each square is individually clickable → opens the Trace for that Run (Phase 5 one-click drill path). Grid wraps to a second line when the Job has more than 10–15 Runs (exact wrap threshold is screen-spec phase). Batch grid: horizontal virtualized scroll. All N Run squares are rendered (or virtualized in DOM but available in the scroll buffer). Every square is one-click clickable → Trace for that Run. No `+N more` overflow indicator. At very wide Run counts (e.g., 500-Task × 5 Runs/Task = 2500 squares), the grid scrolls horizontally inside the row — Runs do not collapse behind an overflow.

**Progress bar:**

Shows `scored Runs / total Runs` as a proportional fill. Label is exact percentage. If no Runs have scored yet: `0%`. If all have scored: `100%`. The bar is presentational only — not interactive.

---

## §4 Bulk action bar

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  BULK ACTION BAR (replaces filter row when ≥1 row selected)                      │
│                                                                                  │
│  3 selected   [Invalidate]   [Re-validate]   [Cancel]                            │
│  (count)      (destructive)  (shown only when all selected are Invalidated)      │
│                                                                                  │
│  — Invalidate confirmation (inline, below bar):                                  │
│  "Invalidate 3 Jobs? They will be excluded from leaderboard scores."             │
│  [Confirm]  [Cancel]                                                             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Confirmation pattern:** Inline below the bulk bar (not a modal). Same surface level as the bar — no z-index pop. Dismissed by Confirm or Cancel. If the user selects more rows while the confirmation is pending, the confirmation updates the count inline. Keyboard: `Enter` confirms; `Escape` cancels.

---

## §5 Empty states

### §5a Zero Jobs run

**Private owner:**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  No Jobs run yet.                                                                │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  hud eval <taskset-slug> -m <model>                               [⎘]   │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  [▶ Run Taskset]                                                                  │
│                                                                                  │
│  Read the docs ↗                                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Slug is the Taskset's actual slug (from the header strip), not a `<placeholder>`. `▶ Run Taskset` duplicates the header CTA for the same reason as the Overview empty state — the header may be above the fold.

**Public non-owner (no Jobs run by this team on this Taskset):**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  No Jobs run on this Taskset by your team yet.                                   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  hud eval <taskset-slug> -m <model>                               [⎘]   │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  [▶ Run Taskset]                                                                  │
│                                                                                  │
│  Other teams' runs hidden — toggle scope to view all.                            │
│  [Show all teams' Jobs ▾]                                                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

The scope toggle is surfaced directly in the empty state as a discoverability affordance. The note is earnest: factual, not apologetic.

### §5b Filter / search no matches

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  No Jobs match the current filters.                                              │
│                                                                                  │
│  [Clear filters]                                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Filter row remains rendered above the empty state — the user can see and modify the active filters without clearing everything. `[Clear filters]` resets all chips, search, and scope to defaults.

---

## §6 Loading state

Skeleton rows match the populated two-line cell shape exactly to prevent layout shift:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  LOADING STATE                                                                   │
│                                                                                  │
│  FILTER ROW — controls rendered but disabled (muted, non-interactive)            │
│                                                                                  │
│  ROW SKELETON (repeat 3–5 times):                                                │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  ☐  [░] [░░░░░░░░░░░░░░░░░░░░░░░░░░]  [░░░░░░░░░░]                       │  │
│  │             [░░░░░░░░░]               [░][░][░][░][░][░][░][░][░][░]      │  │
│  │             [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Line 1 skeleton: status-icon placeholder + name bar (wide) + badge placeholder.
Line 2 skeleton: model chip bar + batch-grid placeholders (10 small squares).
Line 3 skeleton: progress bar shimmer (full row width).

`aria-busy="true"` on `role="tabpanel"`. Off-screen `aria-live="polite"` region announces "Loading Jobs".

---

## §7 Error state

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Failed to load Jobs.                                                            │
│                                                                                  │
│  [Retry]                                                                         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Error copy follows personality: direct cause statement, not apology. If the error has a machine-readable code surfaced by the API, it is shown inline: `"Failed to load Jobs — 503 upstream timeout. [Retry]"`. No illustration.

---

## §8 Responsive behavior

### Desktop — full layout

All row fields visible. Batch-grid expands to show all Runs up to the wrap threshold. Progress bar full width. Owner + date on line 2 left. Filter row on a single line.

### Tablet — reduced

- Batch-grid: shrinks square size; wraps at the same Run count but in a more compact layout.
- Progress bar: retained at reduced width. Label `67%` replaces the bar on very narrow tablets (bar collapses; percentage label stays).
- Owner: hidden; date retained. Owner is secondary metadata; date is the primary scan signal for Sam's weekly check.
- Filter row: chips wrap to a second line. Scope toggle and sort menu stay right-justified on their own row.

### Mobile

- Batch-grid: collapses to a percentage label only (`67% scored`) — grid squares are not interactive targets at mobile touch size.
- Progress bar: replaced by the `67%` label inline.
- Owner: hidden.
- Filter chips: collapse to a `[Filters ▾]` dropdown that opens a bottom sheet with all chip groups.
- Job name: may truncate to 2 lines with ellipsis; full name in tap-to-expand tooltip.

---

## §9 Keyboard and accessibility

- **List semantics:** the Job list is rendered as `<ul role="list">` with each row as `<li>`. Rows are not `<tr>` cells — this is a list, not a table, because the row anatomy (two lines, grid sub-component) is structurally more list than table.
- **Row keyboard nav:** `Tab` moves between rows. `Enter` / `Space` on a row navigates to Job detail. `Tab` within a row moves through interactive sub-elements: checkbox → batch-grid squares → open-in-new-tab icon.
- **Batch-grid squares:** `role="gridcell"` within a `role="grid"` container. `aria-label="Run N: Scored"` / `"Run N: No score"` / `"Run N: Errored"` per square. Grid is navigable with arrow keys. `Enter` on a square opens the Trace.
- **Bulk-select model:** checkbox `<input type="checkbox">` with `aria-label="Select Job: [job name]"`. Select-all checkbox in the filter row header: `aria-label="Select all Jobs"` with `aria-checked="mixed"` when partial selection. Keyboard: `Space` toggles checkbox; `Shift+Space` extends selection.
- **Filter chips:** `role="group"` with `aria-label="Filter by type"` / `"Filter by validity"` / `"Filter by outcome"` per group. Each chip is a `<button aria-pressed="true/false">`.
- **Scope toggle:** `<select>` or `<button aria-haspopup="listbox">` with current scope as the label.
- **Status badges:** `<span role="status">` for dynamically updating badges (Running → Completed transitions). Static completed/errored badges are plain `<span>`.
- **Invalidated rows:** hatch overlay is `aria-hidden="true"` (presentational). Row's accessible label includes `"(Invalidated)"` appended to the Job name. Example: `aria-label="Eval: Claude Opus 4.6 (Invalidated), select"` on the checkbox.
- **Open-in-new-tab icon:** `<a aria-label="Open Job [job name] in new tab" rel="noopener">`.
- **Progress bar:** `role="progressbar" aria-valuenow="67" aria-valuemin="0" aria-valuemax="100" aria-label="67% of Runs scored"`.
- **Bulk action confirmation:** rendered as `role="alertdialog"` inline; `aria-live="assertive"` to announce to screen readers.
- **Loading state:** `aria-busy="true"` on `role="tabpanel"`. Off-screen `aria-live="polite"` announces "Loading Jobs".

---

## §10 Persona notes by surface decision

| Decision | Alex (PRIMARY) | Sam (LOAD-BEARING) | Riley (TERTIARY) |
|---|---|---|---|
| Decision 1: Default sort — most recent | Correct — "find the job that worried me" defaults to recency | Load-bearing — Monday regression check, latest Job is at row 1 | Acceptable — rarely uses tab; recency is fine |
| Decision 2: Filter chips (Type / Validity / Outcome) | Type and Validity load-bearing for RL workflow (filter to Training Jobs); Outcome useful for finding Errored runs | Outcome chip load-bearing — "show me Errored Jobs" is Sam's incident-response filter | Not a primary user; filter chips are accessible but not on Riley's path |
| Decision 2: Owner filter (≥10 owners) | Not relevant at Alex's scale; doesn't hurt | Load-bearing at DoorDash-scale — Sam needs to filter to his team's Jobs on a shared Taskset | Relevant when delivering to a buying lab with multiple sub-teams |
| Decision 2: Scope toggle (My team / All teams) | Acceptable — Alex usually wants to see his own Jobs first | Load-bearing — Sam's weekly check must not be buried in external noise | Not load-bearing; Riley's Tasksets are Private |
| Decision 3: Row anatomy (name · badge · grid · progress) | Batch-grid is load-bearing — Alex reads Run-level outcome distribution before drilling; status badge confirms skip or inspect | Status badge is load-bearing — `[✓ COMPLETED]` vs `[× ERROR]` is the Monday morning answer | Acceptable — Riley reads status badge for QA count |
| Decision 4: Invalidated row hatch | Useful — visually excludes the row from leaderboard read without removing the forensic drill path | Useful — marks Jobs that should not count toward regression baselines | Relevant during buying-lab delivery when Riley invalidates QA-failed Jobs |
| Decision 5: Bulk action bar (Invalidate / Re-validate) | Moderate — may want to bulk-invalidate Jobs that ran against a broken Grader version | Moderate — may invalidate Jobs run before a breaking task change | Relevant for Riley's QA pass/fail cycle |
| Decision 6: Scope default = My team | Acceptable — Alex's Jobs are all his org's | Load-bearing — default scope is Sam's regression signal | N/A (Private Tasksets; scope toggle not visible) |
| Decision 7: Full row clickable → Job detail | Load-bearing — one-click drill to Job detail, then to Traces (Phase 5 path) | Load-bearing — Sam drills from row to Job detail on error | Acceptable |
| Decision 8: Load-more pagination, 50 default | Acceptable — Alex's Tasksets rarely exceed 50 Jobs | Acceptable — Sam's Tasksets may reach 20–50 Jobs at scale | Acceptable |

---

## §11 Open questions

1. **Re-validate permission scope.** Can any org member Re-validate an Invalidated Job, or is it owner-only? If the Taskset is Public and another org's Job was invalidated by the Taskset owner, can the running org Re-validate it? This affects whether the Re-validate button appears in the bulk bar for non-owner users.

2. **Training Jobs vs Eval Jobs in the row — metadata differences.** Do Training Jobs surface different metadata in the row (e.g., checkpoint ID, reward-curve reference) compared to Eval Jobs? Or is the row anatomy identical regardless of Job type? If Training Jobs carry a checkpoint reference, the row may need a third line or an expanded field set.

3. **Job-level Grader override metadata.** If a Job was run with a Grader override (different from the Taskset's default Grader), should that be surfaced in the row? Currently nothing in the row anatomy indicates Grader divergence. This is relevant when Alex is comparing Jobs run under different reward functions — he needs to know which Jobs used the patched Grader and which used the original.

4. **Batch-grid wrap threshold.** The batch-grid uses horizontal virtualized scroll with no overflow truncation. The wrap-to-second-line threshold (for small-to-medium Run counts) is a screen-spec phase question — depends on row height and square size at standard desktop width.

5. **Score column in the Job row.** Production does not show a score value in the row (beyond the progress bar). Should the mean reward float (e.g., `avg 0.7341`) be surfaced inline in the row? This would let Sam read the score without drilling into Job detail. Adds one more field to an already-dense row. Tradeoff: density vs. drill-reduction. Flagged for operator decision.

6. **"Running" Jobs — live update behavior.** When a Job is in `[● Running]` state, does the batch-grid and progress bar update live (streaming)? If yes, the row must handle incremental renders without layout shift. The personality doc (interaction principle 1: "Status is ambient, not requested") implies yes. Platform confirmation needed for streaming support on this surface.

7. **Job ID in the row.** Should the Job ID (e.g., `job-a3f7b`) be visible in the row with a copy button (matching the model-detail log-row REQUEST ID pattern), or is the Job ID accessible only on the Job detail page? Job ID is useful for Sam's incident-response (`"here is the exact Job I'm looking at"`) and for Alex linking teammates to a specific run. Adds density; may belong in a hover-reveal affordance rather than always-on.

8. ~~**Job lifecycle state vocabulary not codified in platform.md.**~~ **Resolved.**

9. **Optional reason field on Invalidate.** Does the Invalidate action on the Job detail page require a reason, or is it free-text optional? The audit chip displays `Reason: —` when absent. Buying-lab audit (Riley) is easier when reason is required; engineer-internal speed (Alex's overnight cleanup) prefers optional. Recommend: optional with a preset reason list (`Env error`, `Wrong config`, `Reward hack`, `Bug discovered post-hoc`, `Test run`, `Other`). Job and Run lifecycle vocabulary is now codified in `platform.md` — see Terminology → Job lifecycle states / Run lifecycle states. Banned synonyms apply. This wireframe's state strings (`Valid` / `Invalidated`, `Running` / `Completed` / `Errored`) are confirmed canonical. Filter chip labels use canonical case per that subsection.

---

## Out of scope

- **Job detail page** — anatomy of the Job detail page (Runs grid, training curve, per-Run metadata) is a separate wireframe.
- **Trace detail viewer** — the Trace viewer opened by clicking a batch-grid square is a separate wireframe.
- **Job composition modal** — the flow triggered by `▶ Run Taskset` is a separate wireframe. This file specifies only the Jobs tab list view, not how new Jobs are created.
- **Training curve on the Jobs tab** — training-curve charts live on the Job detail page and on the Performance tab. The Jobs tab is a list of Jobs, not a curve view.

---

## Drift log

- **Outcome filter chip (new — not in production):** Production filter row (Image #28) has Type chips (`All / Eval / Training`) and Validity chips (`Valid / Invalidated`) but no Outcome chip. This wireframe adds `[Completed | Running | Errored]` as a third chip group. Justified: Sam's incident-response pattern ("find the errored Job") requires a filter at any scale above a handful of Jobs. Scanning status badges in a list of 20+ rows is slower than a one-chip filter. Not a redesign of the existing chips — a new addition.

- **Scope toggle (new — not in production):** Production shows no scope toggle between "My team" and "All teams." This wireframe adds the scope toggle as a right-side filter row control defaulting to "My team's Jobs." Justified: at DoorDash-scale, a shared Public Taskset accumulates hundreds of external Jobs; Sam's regression signal requires an org-scoped default. No production pattern to diverge from — this fills an unspecced gap.

- **Owner filter progressive disclosure (new — not in production):** Not visible in production screenshots. Follows tasksets index progressive-disclosure decision (owner filter surfaces only at ≥10 distinct owners). Extension of a pattern locked in the sibling wireframe.

- **Bulk action bar replacing filter row (new — not in production):** Production shows no bulk action affordance on the Jobs tab. This wireframe adds the bulk bar with Invalidate / Re-validate. Justified: Invalidation is a batch operation in practice (Alex invalidating all Jobs run under a broken Grader version). Inline confirmation replaces a modal confirmation — same pattern as tasks index bulk actions in peer tools.

- **Batch-grid no longer collapses to `+N more`.** An earlier draft provisionally specified a `+N more` overflow indicator for large Jobs (50+ Runs). This wireframe revises that to horizontal virtualized scroll — all Run squares are directly clickable with no overflow truncation. Reason: domain-review FAIL — Phase 5 one-click drill contract (`alex-workflow.md:39`) requires every Run-square to be one click → Trace. A `+N more` truncation breaks that contract by hiding Run squares behind a navigation hop.

- **Open-in-new-tab hover affordance (new — not in production):** Production rows have no visible inline new-tab action. This wireframe adds a `↗` icon on hover. Justified: Sam and Alex both want to open multiple Jobs in parallel tabs during a forensics session. A hover-only affordance adds no noise to the default state.

- **Invalidated chip now carries who/when/why audit metadata (tooltip + row-expand strip).** Cross-referenced Job detail page as primary Invalidate trigger; Taskset Detail Jobs tab is bulk-only for the validity action.

- **Job and Run lifecycle state vocabulary now codified in `platform.md`.** The state names used throughout this wireframe (`Valid` / `Invalidated` / `Completed` / `Running` / `Errored` for Jobs; `Scored` / `No score` / `Not run` / `Errored` for Runs) are confirmed canonical per `platform.md` Terminology → Job lifecycle states / Run lifecycle states. Open question §11 item 8 resolved. Banned synonyms from that subsection apply.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md). Visual references: operator-supplied Image #28 (Jobs tab, current production hud.ai) — Jun 2026. Anchor: [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md). Peer patterns: model-detail §6 (batch-grid), model-detail §7 (filter-row + table), tasksets index §3 (filter chips, owner filter, pagination). AppShell chrome: [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md).*
