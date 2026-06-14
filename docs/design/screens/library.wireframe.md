# Library — Screen Wireframe (`/library`)

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome and MAIN-region contract. This wireframe covers the MAIN region only. Library is a top-level WORKSPACE nav item (BookOpen icon, no count badge).
- [`docs/design/screens/jobs-new.wireframe.md`](./jobs-new.wireframe.md) — Job surface. Starring happens at Job detail (for Jobs) and at a Job's Traces list (for Traces). Library is the retrieval surface; the save action lives upstream.

**Supersedes:** prior `library.wireframe.md` which described a saved-traces-only surface with no tabs and no filter bar. The surface now has two category tabs (Jobs + Traces) with production-style filter bars per tab.

---

## HUD-side question answered

### Who uses Library, when, and why?

**Sam (Applied Agent Engineer — PRIMARY DESIGN DRIVER).** Sam is the actual paying customer today. Two concrete customer shapes:

- **DoorDash applied agent team** — multiple engineers shipping production agents (RAG + prompt + eval). An ops lead flags a disputed output during an incident. Sam opens Library at 9 AM because the 11 AM call needs the exact trace behind the disputed turn. He starred the trace when he first spotted the anomaly. Time-to-find = measure of success.

- **3-person financial vertical agent team** — small team, everyone reads traces. A regression in weekly eval reveals a new failure cluster. Sam filtered by the failing Job, identified the traces, starred them, and now returns to Library to scan them as a batch before writing the fix.

Sam also stars Jobs themselves — a Job that produced an interesting failure cluster, or the baseline eval Job he compares every model against. Both categories belong in a shared "curated shelf."

**Alex (Frontier RL Researcher — aspirational future market).** Alex stars traces that showed policy gaming and returns to compare them across checkpoint iterations. He may also star a Job run that produced an anomalous reward distribution. The two-category structure accommodates his workflow without designing specifically for it.

**Riley (RL Environment Vendor) — out of scope.** Riley's primary workflow does not include trace/job browsing as a saved-shelf job. Not designed for here.

---

## Decision log

### Decision 1: Two-category structure — Jobs tab + Traces tab

**HUD-side question:** Should Library hold only saved traces (prior design), or should it also hold saved jobs?

**Choice:** Two tabs: **Jobs** (default) and **Traces**.

**Reason:** Sam stars both. A Job that produced a meaningful failure cluster is worth returning to; it anchors a set of traces. Hiding starred Jobs from Library forces Sam to find them via the Jobs list, which is the firehose — the opposite of a curated shelf. Two categories is the minimum set that covers Sam's actual bookmark behavior. Adding more categories (Agents, Tasksets, Models) would require confirmed evidence of similar save-and-retrieve workflows, which does not yet exist.

Jobs is the default tab because the primary save action Sam performs during an incident is starring the Job first (to preserve the context), then drilling into traces from it.

---

### Decision 2: Saved-only scope — Library is a curated shelf, not a browser

**HUD-side question:** Is Library a browser over all org items with filters, or a shelf showing only items the user explicitly saved?

**Choice:** Saved-only shelf. Every item rendered on Library is `starred === true`. The filter bars within each tab filter *within the saved set*, not across all org items.

**Reason:** The browser-with-filter framing makes "starred" feel like one filter among many, when it is the surface's definition. Sam's bookmarked incident traces and Alex's starred anomalies are the full population — they want to browse their shelf, not search the firehose. The unstarred firehose is accessed from Job detail (Traces list) and the Jobs surface. Library is the read-only retrieval end of the star action; the write end lives upstream.

Implication: the star toggle on Library items **removes** the item from Library (optimistic unstar = remove). Re-saving happens upstream.

---

### Decision 3: Filter bars filter within the saved set, not across all org items

**HUD-side question:** Do the filter bars on each tab scope down the saved set, or do they add items from the unsaved firehose?

**Choice:** Filter within the saved set only. A Status filter on the Jobs tab narrows the list of *saved* jobs by status. It does not surface unsaved jobs that happen to match.

**Reason:** Consistent with Decision 2. If filters could pull in unsaved items, Library would become a browser, defeating the mental model. The user's shelf may be large enough (tens of items) to warrant filtering within it, but filtering never expands the set beyond what was explicitly saved.

---

### Decision 4: Multi-select chip label shows selected values, not just a count badge

**HUD-side question:** When the user selects multiple values in a filter chip dropdown, should the chip label show `Status (2)` or `Status: Scored, Failed`?

**Choice:** Show selected value names. `Status: Scored, Failed`. Overflow when >3 selected: `Status: Scored, Failed +2`.

**Reason:** A count badge forces the user to re-open the chip to see what they selected. Named values let the user scan the filter bar and immediately understand the active constraint without interaction. HUD's density ethos (peer: Linear) favors explicit state over implicit summary. The `+N` overflow is a concession to line length — more than 3 values is rare in practice.

---

### Decision 5: Environment chip shows friendly names, not ECR URIs

**HUD-side question:** In the Traces tab's Environment filter chip, should environments be identified by their ECR image URI or their friendly name?

**Choice:** Friendly name. `hud-browser`, `osworld-v2`, not `123456789.dkr.ecr.us-east-1.amazonaws.com/hud-browser:latest`.

**Reason:** Carry-forward from the prior wireframe. ECR URIs are machine identifiers; users refer to environments by their human-readable name. The filter is for disambiguation during retrieval — friendly names accomplish this. ECR URIs belong in the environment detail view, not a filter chip label.

---

### Decision 6: Drop Collections, drop Gateway/Logs, drop standalone OBSERVE group

**HUD-side question:** Should Library include named collections, a Gateway logs category, and sub-tabs beyond Jobs + Traces?

**Choice:** No collections. No Gateway logs tab. No OBSERVE nav group.

Collections: no customer evidence for team-shared trace sets. 3-person teams use Slack URLs. DoorDash workflow is unproven. Shipping an unvalidated feature creates navigation complexity for zero proven gain.

Gateway logs: covered inline on Model detail pages, not a standalone Library category. The audit workflow for gateway logs is anchored to a specific model, not a cross-model browsing task.

OBSERVE nav group: with Dashboard and Progress removed from the sidebar this session, there is no OBSERVE group. Library is a flat WORKSPACE item.

---

### Decision 7: "Hide analysis" checkbox appears in Traces filter bar — UI-only, no wireframe scope

**HUD-side question:** Should the "Hide analysis" checkbox in the Traces filter bar be documented as a wireframe decision?

**Choice:** Document that it exists in the implementation per operator directive ("don't be creative — production has it"), but its functionality is UI-only and is not a wireframe-level structural decision.

**Reason:** The checkbox was present in the production implementation. The operator confirmed it should stay. The wireframe records its position (trailing in the filter bar, after the Date chip, before the Sort dropdown) but does not spec its behavior — that is implementation detail.

---

### Decision 8: Bounded inner scroll — header + tabs + filter bar pinned, content scrolls

**HUD-side question:** How does the Library page handle content overflow? Does the page scroll, or does the content region scroll inside a fixed-height container?

**Choice:** Bounded inner scroll. The page header (h1 + subtitle), the category tab bar, and the per-tab filter bar are all pinned in the viewport. The Jobs list or Traces grid scrolls internally. The MAIN region is a flex column with `min-h-0` + `flex-1` on the scroll container. No `max-h-[calc(...)]` brittle height arithmetic.

**Reason:** Pinning the filter bar keeps filter controls accessible while scrolling a long list — critical for Sam scanning 20+ saved traces. The `min-h-0` flex chain is the correct CSS primitive for a bounded inner scroll inside a flex parent (the AppShell MAIN region is already `flex-1`). The `calc` alternative breaks when the header height changes; the flex chain does not.

Reference: `app-shell.wireframe.md` MAIN-region contract — MAIN is `flex-1` and takes the remaining viewport height. Library's inner layout is responsible for filling that height without overflowing.

---

## §1 Shared layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AppShell sidebar (left, persistent at lg+)                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  MAIN CONTENT AREA  (bg: app-bg)  [flex column, fills viewport height]  ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────────┐   ││
│  │  │  PAGE HEADER  (h1 "Library" + subtitle "Saved jobs and traces")  │   ││
│  │  │  [pinned — does not scroll]                                      │   ││
│  │  └──────────────────────────────────────────────────────────────────┘   ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────────┐   ││
│  │  │  CATEGORY TAB BAR  [ Jobs (default) | Traces ]                   │   ││
│  │  │  [pinned — does not scroll]                                      │   ││
│  │  └──────────────────────────────────────────────────────────────────┘   ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────────┐   ││
│  │  │  FILTER BAR  (per-tab — see §3 and §4)                           │   ││
│  │  │  [pinned — does not scroll]                                      │   ││
│  │  └──────────────────────────────────────────────────────────────────┘   ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────────┐   ││
│  │  │  CONTENT REGION  (Jobs list or Traces grid)                       │   ││
│  │  │  [flex-1, min-h-0, overflow-y-auto — inner scroll]               │   ││
│  │  └──────────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

The page itself does not scroll. The content region scrolls internally. The full flex chain: AppShell MAIN is `flex-1` → Library page is `flex flex-col h-full` → content region is `flex-1 min-h-0 overflow-y-auto`.

---

## §2 Page header

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Library                                  [h1, display font]                │
│  Saved jobs and traces                    [muted descriptor line]           │
└─────────────────────────────────────────────────────────────────────────────┘
```

- h1: "Library" — matches the nav item label verbatim (BookOpen icon in sidebar)
- Descriptor: "Saved jobs and traces" — names the scope and both categories so users understand this is the curated shelf, not the Jobs or Traces firehose
- No count tile, no telemetry strip
- No breadcrumb (top-level surface)
- No primary CTA — starring happens upstream

---

## §3 Category tab bar

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [ Jobs ]  [ Traces ]                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Two tabs: **Jobs** and **Traces**
- Jobs is the default active tab
- Tab state persists in the URL: `?tab=jobs` (default) or `?tab=traces`
- Switching tabs replaces the filter bar and content region; the page header stays constant
- No tab-level count badges (the content below communicates count implicitly via the list)

---

## §4 Jobs tab — filter bar

Left to right:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [🔍 Search…]  [User ▾]  [Status ▾]  [Date ▾]  Clear filters      [Sort ▾] │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Search input** — free-text search across Job title within the saved set.

**User chip** — single-select dropdown. Options: list of org users + `(me)` as first option. Chip label shows selected name or "User" when unset. Selecting `(me)` filters to jobs the signed-in user owns.

**Status chip** — multi-select dropdown with checkboxes. Options: `Successful` / `Failed` / `Running`. Chip label: "Status" when nothing selected; `Status: Successful` when one selected; `Status: Successful, Failed` when two selected; `Status: Successful, Failed +1` when three selected (overflow at >3 — not possible with three options, but the pattern is consistent with Traces tab). Chip is visually active (filled/tinted) when any value is selected.

**Date chip** — single-select dropdown. Options: `Today` / `Last 7 days` / `Last 30 days`. Chip label: "Date" when unset; `Date: Today` when selected.

**Clear filters** — text link, right of the Date chip. Visible only when any chip has a non-default value. One click resets all chips to unset and clears the search input.

**Sort dropdown** (right-aligned, visually separated) — options: `Date (newest)` / `Reward (highest)` / `Tasks Completed` / `Steps` / `Name (A–Z)` / `Clear`. Default: `Date (newest)`.

---

## §5 Jobs tab — row anatomy

Jobs render as rows, not cards.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [▶]  Job title                            [avatar] 2 hours ago   87%  [★] │
│       [model chip]  [env badge]  [batch-grid micro]          ✓ COMPLETED    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Leading:** play-icon prefix (decorative, indicates this is a Job row).

**Line 1:**
- Job title (left-aligned, primary text weight)
- Owner avatar (small, right of title group) + relative date
- Score percentage (right-aligned, monospace)
- Star toggle (trailing, always visible — filled star in Library; click to unstar removes row optimistically)

**Line 2:**
- Model chip (e.g., `gpt-4o`)
- Environment friendly-name badge (e.g., `hud-browser`)
- Batch-grid micro-component (visual representation of task completion grid)
- Status badge trailing (e.g., `✓ COMPLETED`) — right-aligned on line 2

**Row is clickable** — full row navigates to the Job detail view. Star toggle is a separate hit target.

**Unstar behavior:** clicking the star on a saved Job row removes it from the Library list optimistically. No confirmation, no undo on this surface.

---

## §6 Jobs tab — empty state

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  No saved jobs yet.                                                          │
│                                                                              │
│  Star a job to save it here.                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

One sentence states the cause; one sentence states the action. No CTA button — the star action happens on the Jobs surface, not here.

---

## §7 Traces tab — filter bar

Left to right:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [🔍 Search…]  [Status ▾]  [Job ▾]  [Environment ▾]  [Date ▾]  □ Hide analysis  [Sort ▾]  [⊞/≡] │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Search input** — free-text search across trace task slugs / IDs within the saved set.

**Status chip** — multi-select with checkboxes. Options: `Scored` / `Failed` / `Errored` / `Running` / `Not run`. Label pattern same as Jobs tab: "Status" → `Status: Scored` → `Status: Scored, Failed` → `Status: Scored, Failed +N` for overflow.

**Job chip** — searchable, multi-select with checkboxes. Each item shows truncated job title + 4-char hex ID (e.g., `regression-v2 · 7f3a`). Chip label: "Job" when nothing selected; `Job: regression-v2` when one selected; `Job: regression-v2, baseline +1` for overflow. The chip is searchable (filter-as-you-type inside the dropdown) because job lists can be long.

**Environment chip** — searchable, multi-select. Shows **friendly environment names** (`hud-browser`, `osworld-v2`) — not ECR image URIs. Same label pattern as Status chip. Searchable inside the dropdown.

**Date chip** — single-select. Options: `Today` / `Last 7 days` / `Last 30 days`. Same pattern as Jobs tab.

**Hide analysis checkbox** — inline checkbox in the filter bar, after Date chip. Present per operator directive (production has it). Functionality is UI-only (implementation detail — not specced at wireframe level). Label: "Hide analysis".

**Clear filters** — text link, visible when any chip or checkbox has a non-default value.

**Sort dropdown** (right-aligned) — options: `Date (newest)` / `Reward (highest)` / `Views` / `Steps` / `Task Name` / `Clear`. Default: `Date (newest)`.

**Grid/list view toggle** — icon button pair (grid icon `⊞` / list icon `≡`), rightmost in the filter bar. Toggles between card grid and table view (see §8).

---

## §8 Traces tab — content views

### Grid view (default)

Existing trace card anatomy:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [STATUS BANNER]  Passed                                      [★ star btn]  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  trace-id: 7f3a2c · webarena:menu:order-recovery             2 hours ago    │
│  Job: regression-v2 · gpt-4o · hud-browser                                 │
│  reward: 0.7341  ·  14 steps  ·  $0.0043                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Status banner (full-width, top): semantic bg per terminal state. States: `Running` / `Passed` / `Failed` / `Partial`
- Meta row 1: short trace ID (6-char, monospace) · task slug · relative timestamp right-aligned
- Meta row 2: Job name · model name · environment friendly name
- Meta row 3: `reward: [exact float]` · `[N] steps` · `$[exact cost]` (HUD personality: Exact — no rounding, no tildes)
- Star button: always visible (filled star in Library). Clicking unstars and removes card optimistically.
- Card is clickable (navigates to trace detail). Star is a separate hit target.
- Overflow menu (···): `Unstar` · `Copy trace ID` · `Open in new tab`. No "Add to collection" — dropped (collections are out of scope).

Responsive columns: 1 col at sm, 2 cols at lg, 3 cols at xl+.

### List view (table)

Columns: **Task** / **Score** / **Status** / **Turns** / **Time** / **Prompt**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Task                    Score   Status   Turns   Time    Prompt      [★]   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  webarena:menu:order…    0.7341  Passed   14      2h ago  [copy]      ★     │
│  osworld:v2:file-mgr…    0.5000  Failed   22      1d ago  [copy]      ★     │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Task column: truncated task slug (tooltip on hover shows full slug)
- Score: exact float, monospace
- Status: status badge
- Turns: integer step count
- Time: relative timestamp
- Prompt: copy-button for the prompt text (icon button)
- Trailing star toggle (same unstar behavior as grid view)
- Row click navigates to trace detail

---

## §9 Traces tab — empty state

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  No saved traces yet.                                                        │
│                                                                              │
│  Star a trace to save it here.                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

Same pattern as Jobs empty state. No CTA button.

---

## §10 Variant matrix

| Dimension | Variants |
|---|---|
| Active tab | Jobs (default) / Traces |
| Jobs content | ≥1 saved job / empty |
| Traces content | ≥1 saved trace / empty |
| Traces view toggle | Grid view / List view |
| Filter chip — 0 selections | Chip label shows category name (e.g., "Status"), no active style |
| Filter chip — 1 selection | Chip label shows value (e.g., "Status: Scored"), chip visually active |
| Filter chip — 2+ selections (≤3) | Chip label shows all values (e.g., "Status: Scored, Failed") |
| Filter chip — >3 selections | Chip label shows first 3 + overflow (e.g., "Status: Scored, Failed +2") |
| Clear filters link | Hidden when all chips at default / visible when any chip is non-default |
| Loading state (initial) | Skeleton rows (Jobs) or skeleton cards (Traces) |
| Unstar in-flight | Row/card disappears optimistically, no confirmation |

---

## §11 States coverage

### Jobs tab

| State | Trigger | UI behavior |
|---|---|---|
| Loading | Initial page load | Skeleton rows at natural row height; header + tab bar + filter bar render immediately |
| Populated | Saved jobs exist | Row list, newest-first by default |
| Empty | No saved jobs | Empty state copy (§6) |
| Filter-applied | Any chip non-default | List narrows to matching saved jobs; Clear filters link appears |
| Filter-empty (no matches) | Active filters return 0 results from the saved set | "No jobs match your filters." + Clear filters link |
| Unstar | User clicks star on a row | Row disappears optimistically; if last row, shows empty state (§6) |

### Traces tab

| State | Trigger | UI behavior |
|---|---|---|
| Loading | Tab switch or initial load | Skeleton cards (grid) or skeleton rows (list); filter bar renders immediately |
| Populated — grid | Saved traces exist, grid view active | Card grid, responsive columns |
| Populated — list | Saved traces exist, list view active | Table rows |
| Empty | No saved traces | Empty state copy (§9) |
| Filter-applied | Any chip non-default | Grid/list narrows to matching saved traces |
| Filter-empty | Active filters return 0 results | "No traces match your filters." + Clear filters link |
| Unstar — grid | Click star on card | Card disappears optimistically |
| Unstar — list | Click star in trailing column | Row disappears optimistically |
| Running trace | Status = Running | Status banner shows Running; reward shows `—`; steps shows current count with in-progress indicator |

---

## §12 Responsive

### xl+ (wide desktop)

Jobs: row list at full page width. Filter bar single-row.
Traces: 3-column card grid (grid view) or full-width table (list view). Filter bar single-row.

### lg (desktop)

Jobs: same as xl+, narrower rows.
Traces: 2-column card grid or full-width table. Filter bar single-row (may compress chip labels).

### md / sm (tablet / mobile)

Jobs: 1-column row list. Filter bar chips may wrap or collapse to a single "Filters" button that opens a filter drawer.
Traces: 1-column card stack (grid view) or full-width table with horizontal scroll (list view). Filter bar same treatment as Jobs.

No sticky filter bar at sm — pinning the filter bar at mobile requires care to not consume too much of the viewport. Engineering call on whether to pin or scroll-to-reveal at sm.

---

## §13 A11y

| Element | Role / Attribute | Notes |
|---|---|---|
| Category tabs | `role="tablist"` + `role="tab"` per tab + `role="tabpanel"` on content region | `aria-selected="true"` on active tab; `aria-controls` links tab to panel |
| Star button (Job row) | `<button aria-pressed="true" aria-label="Unstar job [title]">` | All items in Library are starred by definition; label names the action (unstar = remove) |
| Star button (Trace card) | `<button aria-pressed="true" aria-label="Unstar trace [ID]">` | Same pattern |
| Multi-select filter chip | `<button aria-haspopup="listbox" aria-expanded>` opens a listbox with `role="listbox" aria-multiselectable="true"` containing `role="option" aria-selected` items | The chip label reflects selected state in text — screen readers read the label without needing to open the dropdown |
| Single-select filter chip | `<button aria-haspopup="listbox" aria-expanded>` opens `role="listbox"` with `role="option"` items (no `aria-multiselectable`) | |
| Sort dropdown | `<button aria-haspopup="listbox" aria-expanded>` + `role="listbox"` | Same pattern as single-select chip |
| Hide analysis checkbox | `<input type="checkbox">` with visible label | Native checkbox; no custom ARIA needed |
| Grid/list toggle | Two `<button aria-pressed>` or `role="radiogroup"` with two `role="radio"` | Group `aria-label="View mode"` |
| Trace card (clickable) | `<a href=/library/traces/[id]>` wrapping the non-interactive card area | Star and overflow are `<button>` children, prevent the card link from swallowing those clicks |
| Job row (clickable) | `<a href=/library/jobs/[id]>` or navigate on row click | Star is a `<button>` child |
| Status banner text | `aria-label="Status: Passed"` | Banner color is decorative; text carries the semantic state |
| Content live region | `<div role="status" aria-live="polite">` | Announces count change when unstar removes an item |
| Empty state | `<div role="status" aria-live="polite">` | Announces transition from populated to empty |
| Card overflow menu | `<button aria-haspopup="menu">` + `role="menu"` popover | Focus trap inside; Escape closes |

---

## §14 Open questions for operator

1. **Filter bar line length at xl+:** Multi-select chip labels that show `Status: Scored, Failed, Errored, Running` can make the filter bar overflow to a second row on narrower desktops. Should the chip max-width clip the label with ellipsis and show the count as `Status: Scored +3`, or is wrapping the filter bar to two rows acceptable? Currently the `+N` overflow at >3 selections handles the worst case, but 3 short values can still run long. Engineering call — flag early if the single-row constraint is hard.

---

## §15 Out of scope

- Trace detail view — separate screen spec
- Job detail view — separate screen spec
- Bulk actions (bulk unstar, bulk export) — future
- Gateway logs — covered inline on Model detail pages
- Team-shared collections — dropped (Decision 6); revisit only with confirmed customer evidence
- Cost/reward analytics charts — analytics live on Dashboard (if it returns)
- Motion / animation — motion-designer scope
- Trace playback / step-by-step viewer — part of Trace detail view

---

## §16 Drift log

Departures from the prior `library.wireframe.md` and from original production state:

| Prior state | This design | Reason |
|---|---|---|
| Prior wireframe: saved traces only, no tabs | Two category tabs: Jobs + Traces | Sam stars both; a curated shelf that only shows one category is incomplete |
| Prior wireframe: no filter bar ("saved set is small enough to scan") | Production-style filter bars per tab | The saved set may grow to tens of items; filters within the saved set reduce scan time without changing the saved-only mental model |
| Prior wireframe: Decision 8 removed all filter affordances | Filter bars are back, scoped to the saved set | The prior decision overcorrected — scan-only works for a handful of items, not for power users with 20+ saved items |
| Original production: 4 tabs (Traces / Jobs / Logs / Collections) | 2 tabs: Jobs + Traces | Gateway/Logs moved to Model detail inline; Collections dropped (no customer evidence) |
| Original production: Gateway/Logs as a Library tab | Removed | Gateway log audit is anchored to a model; inline on Model detail is the correct surface |
| Original production: Collections tab | Removed | No customer evidence; 3-person teams use Slack URLs |
| Original production: emoji folder icons | Removed | Personality: plain, no decoration. Icon style belongs to design-tokens phase |
| Original production: ECR URIs in Environment chip | Friendly env names (`hud-browser`, `osworld-v2`) | Users refer to environments by human-readable name; ECR URIs are machine identifiers |
| Original production: "Hide analysis" checkbox present | Retained in Traces filter bar, UI-only | Operator directive: production has it; don't remove without explicit call |
| Prior wireframe: page scrolls (no bounded inner scroll) | Header + tabs + filter bar pinned; content region inner-scrolls | Filter bar must be reachable while scanning a long list |
| Prior wireframe: subtitle "Traces you've saved" | Subtitle "Saved jobs and traces" | Reflects both categories |
| App shell: Dashboard + Progress in ungrouped tail | Both removed this session | Operator removed both surfaces; sidebar WORKSPACE items only |

---

## §17 Persona × Decision matrix

| Decision | Sam (DoorDash / finvert — PRIMARY) | Alex (frontier RL — aspirational) |
|---|---|---|
| 1 — Two tabs (Jobs + Traces) | Sam stars both Jobs and Traces during incident triage. One shelf for both saves a context switch. | Alex primarily stars Traces, but may star a Job run with anomalous reward. Two tabs do not hurt him. |
| 2 — Saved-only scope | Sam's shelf is curated. He does not want unsaved items polluting the retrieval surface. | Alex's starred anomalies are the entire population. Saved-only is the correct mental model for his shelf. |
| 3 — Filters within saved set | With 20+ saved traces, Sam needs to narrow by Job or Status to find the incident trace. Filters within the saved set solve this without breaking the shelf mental model. | Alex might filter saved traces by Status (only the policy-gaming ones) or by Date (last checkpoint run). Same benefit. |
| 4 — Chip label shows values | Sam reads the filter bar to confirm his active constraints before scanning. Named values (`Status: Scored, Failed`) communicate the active filter without requiring him to re-open the chip. | Same — Alex sets a filter and then wants to confirm it without extra clicks. |
| 5 — Friendly env names | Sam refers to environments as `hud-browser` in conversation with teammates. ECR URIs would not match his vocabulary. | Alex uses `osworld-v2` in his research notes. Same. |
| 6 — No collections / no Gateway | Sam does not have a team-shared-collection use case today (Slack URLs suffice). Gateway logs belong on Model detail, which is where Sam is when investigating model behavior. | Alex works solo or in small labs; collections add overhead without benefit. |
| 7 — Hide analysis checkbox kept | No opinion — Sam does not use analysis mode. | No strong opinion; checkbox is ignorable if unused. |
| 8 — Bounded inner scroll | Sam scans a long Traces list while referencing the filter bar repeatedly. Pinning the filter bar is a direct time-saver for this job. | Alex's iteration loop (scan, open, close, scan) benefits from stable filter bar position across interactions. |

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md). Customer evidence: DoorDash applied agent team, 3-person financial vertical agent team (operator-supplied context, Jun 2026). Sibling wireframes: [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md), [`docs/design/screens/jobs-new.wireframe.md`](./jobs-new.wireframe.md).*
