# Library — Jobs Tab Wireframe (`/library?tab=jobs`)

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

**Scope:** Jobs tab row anatomy, column set, affordances, empty state, sort/filter. This doc supersedes §4–§6 and the Jobs-tab row sketch in §5 of [`library.wireframe.md`](./library.wireframe.md). All other sections of that doc (page header, tab bar, layout, Traces tab, a11y, responsive, variant matrix) remain canonical there.

**Visual baseline:**
- [`apps/portal/src/app/(app)/jobs/_components/jobs-index-row.tsx`](../../apps/portal/src/app/(app)/jobs/_components/jobs-index-row.tsx) + [`jobs-index-cells.tsx`](../../apps/portal/src/app/(app)/jobs/_components/jobs-index-cells.tsx) — cross-taskset Jobs page row
- [`apps/portal/src/app/(app)/tasksets/[id]/_components/jobs-tab-row.tsx`](../../apps/portal/src/app/(app)/tasksets/[id]/_components/jobs-tab-row.tsx) + [`jobs-table-cells.tsx`](../../apps/portal/src/app/(app)/tasksets/[id]/_components/jobs-table-cells.tsx) — within-taskset Jobs table row

Cross-links:
- [`docs/design/screens/library.wireframe.md`](./library.wireframe.md) — parent surface spec: layout, tab bar, page header, Traces tab, a11y, responsive
- [`docs/design/screens/taskset-detail-jobs.wireframe.md`](./taskset-detail-jobs.wireframe.md) — within-taskset Jobs table; same row rhythm
- [`docs/design/screens/jobs-new.wireframe.md`](./jobs-new.wireframe.md) — upstream surface where starring happens

---

## §1 Persona use case

**Alex (Frontier RL Researcher — primary for Jobs tab).** Alex runs training and eval jobs against real compute environments. He stars a Job when it produces an anomalous reward distribution — a checkpoint run that converged faster than expected, or one that failed in a way worth studying. He returns to Library to compare several starred runs side-by-side: which model, which taskset, what reward did it land? The shelf is forensic reference, not run control.

**Sam (Applied Agent Engineer — co-primary).** Sam's incident triage begins with a Job: the eval run that exposed the regression. He stars the Job to anchor his investigation. Returning to Library, he needs to quickly confirm which model was under test, what the reward looked like, and which taskset it ran against — before drilling into the Traces.

**Shared need across both:** The shelf renders dense, scannable rows that answer "what was this run?" without opening the detail page. The Job title, status, taskset, model, and reward together answer that question. The shelf does not offer run-control actions — the user cannot rerun, stop, or modify a Job from Library.

---

## §2 Information architecture

The Jobs tab is a saved-only list. Every row is a Job the user has explicitly starred. The filter bar narrows within that saved set; it never surfaces unsaved Jobs.

Row rendering follows the established table pattern (not cards — these are Jobs, not objects with rich spatial identity). The list container is the same `border-border bg-panel rounded-md border` bordered surface used on the Jobs index and within-taskset Jobs table.

Column header row precedes the list. Filter bar sits above the container. Both the filter bar and the column header row are not scrolled — only the row list scrolls.

---

## §3 Decision log

### Decision 1 — No lead affordance; status dot leads

**Question:** What replaces the ▷ play button at the row start?

**Choice:** Nothing replaces it as a separate element. The Status cell leads the row, exactly as on the Jobs index page (`jobs-index-row.tsx`). No play icon, no star icon, no placeholder.

**Reason:** The ▷ icon implies "start this run." Library is a shelf — the user opens (drills to) a saved reference, never starts it. Adding a star icon as the lead element would duplicate the semantic already encoded in the surface definition: every item in Library is starred by definition. A status dot is the correct lead because it communicates the terminal state of the saved run — the first piece of information Alex and Sam need to orient to a row. This matches the Jobs index pattern exactly and costs zero learning.

**Lead element anatomy (from Jobs index):**
- State dot (2×2, colored per state: green = Completed, amber = Failed, red = Errored, teal pulse = Running, muted = Queued/Invalid)
- State label (monospace caption, colored to match dot)
- Age below (monospace meta, muted) — hidden when Running

---

### Decision 2 — Column set: Status · Job · Taskset · Model/Owner · Reward · [unstar]

**Question:** Which columns from the Jobs and Tasksets-Jobs rows belong here? Include or omit Reward and Cost?

**Column set:**

| Column | From which baseline | Include? | Reason |
|---|---|---|---|
| Status | Both baselines | Yes | Terminal state of the saved run — primary orientation signal |
| Job | Both baselines | Yes | Job type chip (TRAIN / EVAL) + name + ID + subtitle — what ran |
| Taskset | Jobs index only | Yes | Grounds the run in context; forensic reference needs taskset identity |
| Model / Owner | Both baselines | Yes | Which model was under test; whose run it was |
| Reward · Runs | Tasksets-Jobs only | Yes — Reward scalar + trace grid/bar; omit Runs sparkline | See rationale below |
| Cost | Tasksets-Jobs only | No | See rationale below |
| Unstar | Library-specific | Yes, trailing | Required — curation surface must support removal |

**Reward — include, without the Runs sparkline:**
Alex stars Jobs to compare reward outcomes. Sam checks reward to confirm the regression baseline matches his expectation. Reward is load-bearing for both forensic use cases. The scalar value answers the question; the sparkline (which shows reward across multiple runs of the *same* model against the *same* taskset, as a trend within a taskset context) is only meaningful inside the taskset context where the x-axis is defined. On a cross-taskset shelf, the sparkline has no defined reference frame. Include the reward scalar and trace grid/bar (pass/fail distribution within the saved run), omit the Runs sparkline.

**Cost — omit:**
Cost on the Tasksets-Jobs table is a per-run credit consumption figure. On a forensic shelf, it is noise — Alex and Sam are not here to audit spend; they are here to understand the run's outcome. Cost belongs on the Job detail page and on the billing/credits surface. Omitting it keeps the shelf focused. If cost becomes a sort/filter criterion (e.g., "find my most expensive saved runs"), it can be added then.

---

### Decision 3 — Unstar: hover-reveal trailing button

**Question:** Where does "remove from library" live? Hover-reveal? Row-action menu?

**Choice:** Trailing, hover-reveal star button (filled star icon, always rendered, revealed on hover). Click to unstar removes the row optimistically. No row-action menu.

**Reason:** The unstar action is the only row-level mutation on Library. A three-dot menu for a single action is overhead. The star button is both the visual reminder ("this is saved") and the single mutation affordance. The pattern is established: filled = saved, click = remove. Hover-reveal (opacity 0 → 1) keeps the row visually clean at rest without hiding a required affordance — the filled star at rest communicates the saved state; it becomes an interactive affordance on hover.

**Placement:** Rightmost column, after the last data column. Rendered as a small icon button (`aria-label="Unstar [job title]"`, `aria-pressed="true"`). Not in a `ChevronRight` column — the chevron (drill indicator) is implicit in the row being clickable.

**Full row click:** navigates to Job detail. The unstar button is a separate hit target inside the row that stops propagation.

---

### Decision 4 — Filter bar: match current implementation, trim Owner → User

**Question:** Mirror Jobs page sort/filter? Or simpler, starred-at recency only?

**Choice:** Keep the current filter bar as implemented (`library-jobs.tsx`): Search · User · Status · Date · Clear filters · Sort. No additions, no removals.

**Reason:** The current implementation already reflects the minimal viable filter set for a saved shelf: status-buckets (Successful / Failed / Running), date window, owner/user, and free-text search. Sort options (Date newest / Reward highest / Tasks Completed / Name A–Z) are the four plausible sort keys for a forensic shelf. "Starred-at recency only" would discard the reward-sort option, which is the primary sort key Alex uses (he wants to see his highest-reward saved run first). The current implementation is correct; the wireframe canonizes it rather than simplifying it away.

**Sort options canonical list:**
1. Date (newest) — default
2. Reward (highest)
3. Tasks Completed (trace count descending)
4. Name (A–Z)

---

## §4 Filter bar

Layout (left to right):

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [🔍 Search saved jobs…]  [User ▾]  [Status ▾]  [Date ▾]  Clear filters     │
│                                                              [Sort: Date ▾]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Search input: flex-1, min-w-48. Placeholder: "Search saved jobs…". Matches on job title, model name, taskset name, job ID.
- User chip: single-select. Options: org members present in the saved set; current user first, labeled `[Name] (me)`. Chip label: "User" → "User: Aman" when selected.
- Status chip: multi-select. Options: `Successful` / `Failed` / `Running`. (These bucket the six job states: completed → Successful; failed + errored + invalidated → Failed; running + queued → Running.) Chip label: "Status" → "Status: Successful" → "Status: Successful, Failed" (no overflow case with three options).
- Date chip: single-select. Options: `Today` / `Last 7 days` / `Last 30 days`. Chip label: "Date" → "Date: Last 7 days".
- Clear filters: text link. Visible only when any chip or search input has a non-default value. Resets all to defaults.
- Sort dropdown: right-aligned, visually separated (ml-auto). Label prefix: sort icon + selected label. See §3 Decision 4 for option list.

**Filter-empty state** (active filters, zero results):

```
No saved jobs match the current filters.
[Clear filters]
```

Clear filters is a text link, same as in the filter bar.

---

## §5 Column header row

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Status          Job                     Taskset      Model · Owner   Reward │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Natural case (not uppercase, not tracking-wider) — matches table header convention across the portal
- Muted foreground, label weight, monospace — same as Tasksets-Jobs table header (`jobs-tab.tsx` line 302–310)
- Column widths follow the same grid proportions as the Tasksets-Jobs table; Reward occupies the cell previously shared with Cost + Runs (Cost omitted, Runs sparkline omitted, scalar + trace distribution stays)
- No chevron column header (the chevron cell is presentational-only in the row)
- Unstar column has no header label

---

## §6 Row anatomy

The Library Jobs row is a direct structural subset of the Tasksets-Jobs row, with three changes: (1) Taskset column added from the Jobs index row, (2) Cost column dropped, (3) Runs sparkline dropped from Reward cell, (4) trailing unstar button replaces trailing ChevronRight. The drill affordance shifts to the full-row click (same as Jobs index row), with ChevronRight revealed on hover per the standard row interaction pattern.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Status           Job                    Taskset      Model · Owner  Reward  │
├──────────────────────────────────────────────────────────────────────────────┤
│  ● Completed      TRAIN  gpt-4o-ft-v3    webarena     gpt-4o-ft-v3   0.7341  │
│    2h ago         "rl-run-checkpoint-42" osworld-v2   Aman           ████░░  │
│                   converged · 512 steps                               [★]   │
├──────────────────────────────────────────────────────────────────────────────┤
│  ● Failed         EVAL   gpt-4o          webarena     gpt-4o          0.3120  │
│    1d ago         "regression-baseline"  osworld-v2   cron            ██░░░░  │
│                   infra error during run                              [★]   │
├──────────────────────────────────────────────────────────────────────────────┤
│  ◉ Running        TRAIN  claude-3.7-s    webshop-v2   claude-3.7-s   —      │
│    (in progress)  "rl-run-ep-007"        webshop-v2   Aman            (live)  │
│                   step 384 / est. 512                                 [★]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Column-by-column anatomy

**Status column** — verbatim from `jobs-index-cells.tsx` `StatusCell`:
- State dot (filled circle, colored per state; radar-pulse halo for Running)
- State label (monospace caption, colored to match dot): Running / Queued / Completed / Failed / Errored / Invalid
- Age below (monospace meta, muted, tabular-nums): `[N] ago` — hidden when Running

**Job column** — verbatim from both baselines `JobCell`:
- Line 1: type chip `TRAIN` or `EVAL` (monospace meta, muted, uppercase) · job title (body weight, medium, truncated) · job ID (monospace meta, disabled/muted)
- Line 2: subtitle (monospace meta, muted) — e.g., `converged · 512 steps` / `step 384 / est. 512` / `infra error during run`. Errored state renders subtitle in error color.
- Flag badge if present (amber bg, flag icon, monospace meta)

**Taskset column** — verbatim from `jobs-index-cells.tsx` `TasksetCell`:
- Line 1: taskset name (monospace caption, foreground, truncated)
- Line 2: environment friendly name (monospace meta, muted, truncated) — e.g., `osworld-v2`, `hud-browser`, `webshop-v2`

**Model · Owner column** — verbatim from both baselines `ModelOwnerCell`:
- Line 1: model name (monospace caption, foreground, truncated)
- Line 2: owner name (monospace meta, muted) — clock icon prefix when `ownerScope === "cron"`

**Reward column** — subset of Tasksets-Jobs `RewardCell`:
- Running or Queued job: `—` (disabled, body)
- Errored job: `—` (disabled, body)
- Completed/Failed job (eval): reward scalar (monospace body, medium, tabular-nums) + fraction e.g., `18/40` (monospace meta, muted) on same line; trace distribution grid or dist-bar below (tooltip on hover shows scored/failed/errored/running/not-run legend)
- Completed/Failed job (train): reward scalar (monospace body, medium, tabular-nums); no sparkline (cross-taskset context makes the trend meaningless)
- No "N Runs" label, no Sparkline — omitted (see Decision 2)

**Unstar column** (trailing, rightmost, no header):
- Filled star icon button: `aria-label="Unstar [job title]"`, `aria-pressed="true"`
- Always rendered; opacity 0 at rest, opacity 100 on row hover — hover-reveal
- Click: removes row optimistically, no confirmation
- Does not propagate to row-click navigation
- If removing the last saved job: transitions to empty state (§7)

**Row interaction:**
- Full row click → navigate to `/jobs/[id]` (same as Jobs index)
- Hover: `bg-hover-surface`; trailing ChevronRight icon visible (opacity 0 → 1); unstar button visible
- Keyboard focus: `bg-hover-surface` + 2px primary left border (same focused-row treatment as Tasksets-Jobs row)
- No context menu, no three-dot overflow

---

## §7 Empty state

### Zero saved jobs (cold empty state)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│  No saved jobs yet.                                                           │
│                                                                               │
│  Star a job to save it here.                                                  │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Centered vertically in the content region, max-width ~md
- Line 1: "No saved jobs yet." — body weight, foreground
- Line 2: "Star a job to save it here." — body, muted
- No CTA button — the star action lives on the Jobs surface and Job detail; Library is the retrieval surface only
- `role="status" aria-live="polite"` — announces when the last job is unstarred and the state transitions from populated to empty

### Filters applied, zero matches

```
No saved jobs match the current filters.
[Clear filters]
```

- Body, muted
- "Clear filters" is a text link (same as filter bar Clear filters)
- Rendered in the content region where the row list would be, not replacing the filter bar

---

## §8 States coverage

| State | Trigger | UI |
|---|---|---|
| Populated | ≥1 saved job | Row list, sorted by active sort key, newest-first by default |
| Loading | Initial tab render | Skeleton rows at natural row height; filter bar + column headers render immediately |
| Cold empty | 0 saved jobs | Empty state copy (§7, variant 1) |
| Filter-empty | Active filters return 0 matches | Empty state copy (§7, variant 2) |
| Unstar in-flight | Click star on any row | Row disappears optimistically; if last row → transitions to cold empty state |
| Running job in saved set | Job `state === "running"` | Radar-pulse state dot; age hidden; Reward shows `—` with live step subtitle in Job cell |

---

## §9 A11y notes (Jobs tab additions)

These supplement the a11y table in `library.wireframe.md` §13:

| Element | Role / attribute |
|---|---|
| Row list container | `role="list" aria-label="[N] saved jobs"` |
| Each row | `role="listitem"` wrapping the row link |
| Row link | `<a href=/jobs/[id]>` — the full row is the drill target |
| Unstar button | `<button aria-label="Unstar [job title]" aria-pressed="true">` — stops propagation; does not trigger row navigation |
| Column header row | `role="row"` with `role="columnheader"` cells inside a `role="rowgroup"` |
| Reward trace grid/bar | `aria-label="[N] scored, [N] failed, [N] errored of [total] traces"` (tooltip also provides this text) |
| Filter-empty | `role="status" aria-live="polite"` — announces when filter produces zero results |

---

## §10 Divergence from visual baselines

| Baseline | Library Jobs row | Reason |
|---|---|---|
| Jobs index (`jobs-index-row.tsx`) — no Reward column | Adds Reward column | Reward is the primary outcome signal for a forensic shelf; it is absent from the Jobs index because the index focuses on run management, not outcome comparison |
| Jobs index — no Taskset environment sub-line | Inherits Taskset column with env sub-line from `TasksetCell` | Forensic context requires knowing which taskset the saved run belongs to |
| Tasksets-Jobs (`jobs-tab-row.tsx`) — Reward · Runs column includes Sparkline + Runs label | Reward column: scalar + trace distribution only; no Sparkline; no Runs label | Sparkline encodes trend across runs *within a taskset* — meaningful only in that context. On a cross-taskset shelf the x-axis is undefined. |
| Tasksets-Jobs — Cost column (right-aligned, monospace "N Cr") | Omitted | Spend audit is not a forensic-shelf job; cost lives on Job detail and billing surfaces |
| Tasksets-Jobs — trailing ChevronRight only (no unstar) | Trailing unstar button (hover-reveal) + ChevronRight hover-reveal | Library is the curation surface; unstar is required. ChevronRight pattern kept for visual continuity |
| Prior `library.wireframe.md` §5 — leading ▷ play icon | Removed entirely | Play icon implies run-control. Library is a shelf, not a run-control surface |
| Prior `library.wireframe.md` §5 — two-line card-like layout with avatar, batch-grid, score% | Replaced with column-grid table row | Column table aligns with the Jobs index and Tasksets-Jobs table patterns. Card-like rows violate the visual rhythm established across the portal's job surfaces |

---

## §11 Open questions

1. **Reward column header label.** The Tasksets-Jobs table uses "Reward · Runs" as the combined header. With Runs omitted here, "Reward" alone is sufficient. Confirm the simpler label is correct, or whether the fraction (`18/40`) in the cell warrants "Reward · Tasks" as the header.

2. **Trace distribution for Training jobs.** Training jobs have no trace grid/bar in the Tasksets-Jobs implementation — they show a reward scalar only. Confirm this is also the correct treatment for starred Training jobs on the Library shelf, or whether a step-count bar or checkpoint distribution is worth showing.

---

## §12 Out of scope

- Visual tokens / pixel sizes / hex colors — design-tokens phase
- Motion (hover fade-in of unstar button, row disappear animation on unstar) — motion-designer scope
- Traces tab — covered in `library.wireframe.md` §7–§9
- Page header, tab bar, bounded-scroll layout — `library.wireframe.md` §1–§3 and §8
- Bulk actions (bulk unstar, export) — future
- Keyboard shortcuts (j/k navigation, Enter to drill, c to copy URL) — implementation carries the Tasksets-Jobs keyboard pattern; no wireframe decision needed

---

*Derived from: [`docs/product/personas.md`](../../docs/product/personas.md), [`docs/product/platform.md`](../../docs/product/platform.md), [`docs/product/personality.md`](../../docs/product/personality.md). Visual baselines: `jobs-index-row.tsx`, `jobs-index-cells.tsx`, `jobs-tab-row.tsx`, `jobs-table-cells.tsx`. Supersedes §4–§6 of [`library.wireframe.md`](./library.wireframe.md) (Jobs tab row anatomy).*
