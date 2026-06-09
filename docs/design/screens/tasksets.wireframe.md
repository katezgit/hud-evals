# Tasksets Index — Screen Wireframe (`/tasksets`)

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome (sidebar, credits widget, user chip). This wireframe covers the `MAIN` region only.
- [`docs/design/screens/manage.wireframe.md`](./manage.wireframe.md) — Settings shell

Visual references: operator-supplied screenshots `02a-tasksets-my.png`, `02b-tasksets-public.png`, `02c-tasksets-myteam.png` (Jun 2026).

---

## HUD-side question answered

The page must serve two browse loops without friction-switching between them:
1. **Alex's discovery loop** — scan Public Tasksets looking for hard benchmarks ("what are others getting low scores on?"). Leaderboard preview is his primary signal; he is filtering by difficulty, not by name.
2. **Sam/Riley's find-mine loop** — navigate to My Team tab, land on the regression Taskset by name or star. They know what they're looking for.

These loops are structurally different: discovery wants density + leaderboard data visible at a glance (grid default would expose 6–8 Tasksets with leaderboard); find-mine wants scan speed by name (list view is faster). The solution: default to List view (denser, Alex's bias as documented in the task prompt state machine), but make grid the natural second option. Both views show leaderboard data — the difference is how many rows of the leaderboard are exposed per card.

---

## 1. Shared layout note

The `MAIN` region is the content area to the right of AppShell's persistent sidebar. This wireframe does not redraw the sidebar, credits widget, or user chip — those are fully specified in `app-shell.wireframe.md`.

```
┌─────────────────────┬─────────────────────────────────────────────────────────┐
│  SIDEBAR (AppShell) │  MAIN  flex-1  bg-page                                  │
│  [see app-shell     │                                                          │
│   wireframe.md]     │  [TASKSETS INDEX CONTENT — this file]                   │
│                     │                                                          │
└─────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Page header anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER  px-6 pt-6 pb-4                                                     │
│                                                                                  │
│  ┌─────────────────────────────────────────────┐  ┌───────────────────────────┐ │
│  │  Tasksets                                   │  │  + New Taskset            │ │
│  │  text-display  font-medium                  │  │  Button  primary  sm      │ │
│  └─────────────────────────────────────────────┘  └───────────────────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- "Tasksets" is the h1 / page title. No subtitle or description — the page is self-evident to Alex who is already in the product.
- `+ New Taskset` is top-right, primary button. It links to the Taskset create flow (out of scope for this wireframe). The `+` prefix is standard HUD convention for create actions observed across screenshots.
- No breadcrumb — `/tasksets` is a first-class nav destination, not a nested route.

---

## 3. Tab + filter row anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TAB + FILTER ROW  px-6 pb-3  border-b                                           │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐       │
│  │  TAB BAR  (left-aligned, inline with search)                          │       │
│  │                                                                       │       │
│  │  [Public  42]  [My Team  3]                                           │       │
│  │  ← tab underline variant; active tab = underline + default-fg         │       │
│  │     inactive tab = muted-fg; count chip = muted-fg text-meta          │       │
│  └───────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Filter row  (below tabs, full width, flex items-center gap-3)                   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────┐                           │
│  │  [🔍]  Search Tasksets…                          │                           │
│  │  Input  search  bg-muted  text-body  flex-1       │                           │
│  └──────────────────────────────────────────────────┘                           │
│                                                                                  │
│  [⊞ Grid]  [☰ List ✓]     ←  view toggle, right of search                       │
│  Segmented control, 2 items  (List = default, persists in localStorage)          │
│                                                                                  │
│  [↕ Starred first ▾]   ← sort button, rightmost                                 │
│  Button  variant="outline"  sm  opens sort menu (see §7)                         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Tab counts**: `Public 42 · My Team 3` in the tab label area. Count is live (reflects filtered org Tasksets count, not a static cache). Format: space-separated integer after the tab label, rendered in `text-meta muted-fg` to not compete with the label. Observed on `02b-tasksets-public.png` and `02a-tasksets-my.png`.

- **Tab default logic**: `My Team` is the default active tab when the user has ≥1 team Tasksets; `Public` is the default when they have zero. This prevents a blank My Team tab being the first thing a new user sees.

- **Search scope**: filters within the active tab only. Placeholder text adapts: "Search public Tasksets…" on Public tab, "Search team Tasksets…" on My Team tab. Observed `02a-tasksets-my.png`: search placeholder "Search my tasksets..." and `02b-tasksets-public.png`: "Search public tasksets...".

- **"My tasksets" toggle**: `02a-tasksets-my.png` shows a `My tasksets` chip/pill active on the My Team tab. This appears to be a sub-filter showing only the current user's Tasksets within the team org. Annotated as an open question — see §11.

- **View toggle**: two segments `Grid | List`. List is the default — Alex's density preference and the state machine spec. Toggle state persists to localStorage. At `sm` breakpoint, toggle is hidden; List layout is forced.

- **Sort button**: shows current sort label inline. Clicking opens the sort menu (§7). Label updates on selection. Screenshot `02a-tasksets-my.png` confirms "Starred first" as the visible default sort label.

---

## 4. Grid card anatomy (view = Grid)

Grid layout: `grid-cols-3` at `lg+`, `grid-cols-2` at `md`, `grid-cols-1` at `sm`. Each card is equal height within a row via CSS grid stretching.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  GRID CARD  — one card  border  rounded  bg-card                                 │
│  clickable region (entire card)  → navigates to /tasksets/[slug]                 │
│                                                                                  │
│  ── CARD HEADER ──────────────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  [ENV ICON]  OSWorld-Verified                          ☆  3               │ │
│  │  icon sm     text-title  font-medium  flex-1           star  count         │ │
│  │              muted-fg when hovered                     muted-fg text-meta  │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│  px-4 pt-4 pb-2                                                                  │
│                                                                                  │
│  ── LEADERBOARD PREVIEW ──────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  col headers (only on first card, or sticky above the block — TBD)         │ │
│  │              Avg   Best@3  Best@5                                          │ │
│  │              text-meta  muted-fg  right-aligned                            │ │
│  │                                                                            │ │
│  │  ┌──┐  Claude Sonnet 4.5    54%    —      —                               │ │
│  │  │ 1│  text-body            accent  muted  muted                           │ │
│  │  └──┘  [env-name tag]                                                      │ │
│  │        text-meta  muted-fg                                                 │ │
│  │                                                                            │ │
│  │  ┌──┐  Claude Sonnet 4      42%    53%    —                               │ │
│  │  │ 2│                       muted  muted  muted                            │ │
│  │  └──┘  [env-name tag]                                                      │ │
│  │                                                                            │ │
│  │  ┌──┐  Claude Sonnet 3.7    33%    44%    —                               │ │
│  │  │ 3│                       muted  muted  muted                            │ │
│  │  └──┘  [env-name tag]                                                      │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│  px-4                                                                            │
│                                                                                  │
│  ── CARD FOOTER ──────────────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  [task icon]  367 tasks   [model icon]  5 models                           │ │
│  │  text-meta  muted-fg                                                       │ │
│  │                                                                            │ │
│  │  [owner]  HUD              [Public badge]                                  │ │
│  │  text-meta  muted-fg       bg-accent-subtle  text-accent  rounded text-xs  │ │
│  │  ← org name, not user name                                                 │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│  px-4 pb-4 pt-2  border-t                                                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Card anatomy — field-by-field:**

| Field | Source (screenshot) | Notes |
|---|---|---|
| Environment icon | `02b-tasksets-public.png` — small square icon left of Taskset name | Represents the primary Environment type. Icon is decorative; label is the primary affordance. |
| Taskset name | All screenshots | `text-title font-medium`. No truncation at `lg+`; single line with `truncate` at `sm`. |
| Star icon + count | All screenshots — `☆ 3` visible on OSWorld-Verified, `☆ 2` on WikiGames 2 | Interactive: clicking the star toggles starred state for the current user. Filled star = starred; outline = not starred. Count reflects total community stars on Public Tasksets. My Team Tasksets show personal star toggle only (count TBD — see §11). |
| Leaderboard rows | `02b-tasksets-public.png` — 3 rows per card, medal rank badges, model name, env-name tag below model, `Avg / Best@3 / Best@5` columns | Top 3 ranked models by `Avg` score. Medal badges: 1st = gold, 2nd = silver, 3rd = bronze (token-assigned colors). Scores are exact percentage values. `—` when the metric has not been run (e.g., no Best@3 data available yet). |
| Footer: task count | `02b-tasksets-public.png` — "367 tasks" with task/clipboard icon | Exact integer. |
| Footer: model count | `02b-tasksets-public.png` — "5 models" with model icon | Total models that have run against this Taskset. |
| Footer: owner | `02b-tasksets-public.png` — org initials badge + org name | For Public Tasksets, owner is the publishing org (e.g., "HUD", "Princeton NLP", "Adept Research"). Not the individual user. Org initials badge is same pattern as user chip avatar. |
| Visibility badge | `02b-tasksets-public.png` — lock icon for private, HUD green badge for public | Public = `bg-accent-subtle text-accent` pill. Private = lock icon + "Private" text, `muted-fg`. Observed: a HUD "lock" icon + colored badge pattern. |

**Leaderboard column headers**: screenshots show `Avg  Best@3  Best@5` as column headers within each card. Headers appear once per card (not once for the full page grid) — each card is self-contained.

**Score color coding**: scores are colored by magnitude. From screenshots: high scores (`100%`) render in a distinct accent (green-ish); middle scores (`42%–67%`) render in muted-fg; very low scores may render in muted. Exact hue assignments are design-token phase. The wireframe notes the pattern exists without specifying color.

**"No leaderboard yet" state** (card has Tasks but zero Jobs run):
```
│  ── LEADERBOARD PREVIEW ──────────────────────────────────────────────│
│                                                                        │
│  No models run yet.                                                    │
│  text-meta  muted-fg  ← single line, vertically centered in           │
│  the space where leaderboard rows would appear                         │
│                                                                        │
```

---

## 5. List row anatomy (view = List)

List layout: a single-column vertical stack of rows. Denser than grid — Alex's default. Each row is a full-width clickable region navigating to `/tasksets/[slug]`.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  LIST ROW  — one row  border-b  bg-card (or bg-page, no card bg)                 │
│  hover: bg-accent-subtle/10  cursor-pointer                                      │
│  clickable region → /tasksets/[slug]                                              │
│                                                                                  │
│  px-4 py-3  flex items-center gap-4                                              │
│                                                                                  │
│  ┌──────────┐  ┌──────────────────────┐  ┌─────────────────────────────────┐    │
│  │IDENTITY  │  │LEADERBOARD (inline)  │  │META                             │    │
│  │          │  │                      │  │                                 │    │
│  │[env icon]│  │#1 Claude Sonnet 4.5  │  │[task icon]  367  [model icon]  5│    │
│  │Name      │  │   54% Avg            │  │text-meta  muted-fg              │    │
│  │text-title│  │#2 Claude Sonnet 4    │  │                                 │    │
│  │☆  3      │  │   42% Avg            │  │[owner badge]  HUD               │    │
│  │          │  │text-meta  muted-fg   │  │[visibility badge]               │    │
│  └──────────┘  └──────────────────────┘  └─────────────────────────────────┘    │
│                                                                                  │
│  flex proportions:  [identity ~30%]  [leaderboard ~45%]  [meta ~25%]            │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**List row — field-by-field:**

| Field | Collapsed from grid? | Notes |
|---|---|---|
| Identity block | Same as grid header | Env icon + Taskset name + star toggle + star count. Name uses `text-label font-medium` (slightly smaller than grid's `text-title` for density). |
| Leaderboard inline | Grid shows 3 rows; list shows top 2 | Rank number + model name + `Avg` score only in list view. `Best@3` and `Best@5` are collapsed — they are detail data; Avg is the primary scan signal. |
| Meta block | Same as grid footer | Task count + model count + owner + visibility badge. Condensed to a single line with icon separators. |

**Why top-2 leaderboard in list view**: the HUD question is "enough at-a-glance to choose without clicking." For Alex's discovery loop on Public Tasksets, the first-place score is the primary signal ("how hard is this Taskset?"). The second place confirms the pattern. Third adds little at this density. List view trades leaderboard depth for scan throughput — 20 Tasksets in one scroll.

**No-leaderboard-yet state in list row:**
```
│  [env icon]  Taskset Name  ☆  |  No models run yet.  muted-fg  text-meta  |  N tasks  N models  owner  badge  │
```

---

## 6. Column header row (List view only)

The list view renders a sticky column header row above the rows so the user knows what the columns are when scrolling.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  COLUMN HEADERS  bg-page  border-b  sticky top-0  z-10                           │
│  px-4 py-2  flex items-center gap-4                                              │
│                                                                                  │
│  Taskset                     Top models (Avg)         Tasks  Models  Owner       │
│  text-meta  muted-fg         text-meta  muted-fg      ← right-aligned numerics  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

The grid view has no column header row — each card is self-contained with its own internal headers.

---

## 7. Sort menu

Triggered by the `[↕ Starred first ▾]` button in the filter row. Opens as a dropdown below the trigger.

```
┌─────────────────────────────┐
│  SORT MENU  min-w-[180px]   │
│  border  rounded  bg-popover│
│  shadow-md                  │
│                             │
│  ┌─────────────────────────┐│
│  │  ✓  Starred first        ││  ← active = checkmark + accent label
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │     Newest first         ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │     Oldest first         ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │     Name (A–Z)           ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │     Name (Z–A)           ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │     Most tasks           ││
│  └─────────────────────────┘│
│                             │
└─────────────────────────────┘
```

**Annotations:**
- Single-select. Selected option persists in URL query param (`?sort=starred-first`), so sharing the URL preserves sort context.
- The button label updates to reflect the active selection: `[↕ Name (A–Z) ▾]`.
- Keyboard: `Enter` / `Space` selects an item and closes; `Escape` closes without selecting; arrow keys navigate items.
- `role="menu"`, each item is `role="menuitem"`. Checkmark on active item is `aria-checked="true"` or communicated via `aria-label`.

**Alex's primary sort is "Starred first"** — he accumulates starred Public Tasksets that he runs against regularly. "Most tasks" is his secondary sort when discovering hard new Tasksets (larger Tasksets = more comprehensive eval = harder to saturate).

---

## 8. Star toggle interaction

The star icon appears in the card header (grid) and in the identity block (list). It is an inline interactive control — it does not navigate, just toggles state.

**State machine:**
1. **Not starred, idle**: outline star `☆` + count. `muted-fg`.
2. **Not starred, hovered**: outline star fills partially (filled star silhouette with reduced opacity). Cursor indicates clickability.
3. **Not starred, activated (click/Enter)**: immediate optimistic toggle to starred state. Star fills. Count increments by 1 (optimistic). POST to server; on failure, revert + show inline error toast: `"Could not star Taskset — try again."`.
4. **Starred, idle**: filled star `★` + count. Accent color.
5. **Starred, hovered**: filled star lightens slightly. Indicates unstar is available.
6. **Starred, activated**: toggles to not-starred. Count decrements. Same optimistic + revert pattern.

**Star semantics:**
- Stars are **personal** (per-user), not org-level. Two users in the same org can star different Tasksets independently.
- On Public Tasksets: the count is community-wide (total unique users who starred). Clicking increments/decrements the community count.
- On My Team Tasksets: count is the org members who starred it — small number (typically 0–5). Confirm behavior with platform — see §11.

**Accessibility:**
- Star button: `role="button"` or `<button>`, `aria-label="Star OSWorld-Verified"` / `"Unstar OSWorld-Verified"`. Label reflects current action (not current state) to follow action-labeling convention.
- `aria-pressed="true/false"` on the button to communicate toggle state.

---

## 9. Empty states

### 9a. My Team tab — zero Tasksets

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE  (My Team tab, zero team Tasksets)                                  │
│  centered in the content area below the filter row                               │
│  py-16  flex flex-col items-center gap-4                                         │
│                                                                                  │
│  [Taskset icon  size-8  muted-fg]                                                │
│                                                                                  │
│  No Tasksets yet.                                                                │
│  text-title  font-medium                                                         │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────┐                     │
│  │  hud taskset new                                        │  [⎘]               │
│  │  monospace  bg-code  text-sm                            │                    │
│  └────────────────────────────────────────────────────────┘                     │
│                                                                                  │
│  [+ New Taskset]                                                                 │
│  Button  primary  sm                                                             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- CLI command `hud taskset new` is TBD — exact command not confirmed in platform docs. Mark as TBD in implementation; the pattern (CLI command in empty state) follows the established personality principle: "Empty states show the CLI command." See §11 open questions.
- The `+ New Taskset` button duplicates the page header CTA — this is intentional; the empty state gives the user a direct path without scrolling back up.
- No illustration, no marketing copy. Personality: Spare + Earnest.

### 9b. Search — no matches

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE  (search query has no matches in the active tab)                    │
│  centered in the content area                                                    │
│  py-12  flex flex-col items-center gap-3                                         │
│                                                                                  │
│  No Tasksets match "osworld-v2"                                                  │
│  text-title  font-medium                                                         │
│                                                                                  │
│  [Clear search]                                                                  │
│  Button  variant="outline"  sm                                                   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Query is echoed verbatim in the message (quoted). This matches the state machine spec and the personality principle "Exact."
- "Clear search" button clears the search input and resets to the unfiltered list within the current tab. Does NOT switch tabs.
- No CLI command — this is not a create-something empty state; it's a search-refinement state.
- `Public` tab is never empty (HUD seeds it with community Tasksets). The "No Tasksets match" state applies on Public only when a search query produces zero results.

---

## 10. Responsive behavior

### `lg+` — full layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  [Tasksets]                                              [+ New Taskset]        │
│                                                                                 │
│  [Public 42]  [My Team 3]                                                       │
│  [Search Tasksets…]                              [Grid | List ✓]  [↕ Sort ▾]   │
│                                                                                 │
│  LIST VIEW (default):                                                           │
│  ┌─────────────────────┬─────────────────────────┬───────────────────────────┐ │
│  │  OSWorld-Verified ☆ │  #1 Sonnet 4.5  54% Avg  │  367  5  HUD  Public     │ │
│  │  WikiGames 2 ☆      │  #1 Sonnet 4.6  25% Avg  │   35  4  HUD  Public     │ │
│  │  SheeBench-50 ☆     │  #1 Opus 4.6    40% Avg  │   50  6  HUD  Public     │ │
│  │  …                  │  …                        │  …                       │ │
│  └─────────────────────┴─────────────────────────┴───────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────┘
```

### `md` — tablet adaptations

- Sidebar collapses to icon rail (see app-shell.wireframe.md §5).
- Grid view: `grid-cols-2` (from `grid-cols-3`).
- List view: unchanged — list is naturally responsive.
- **Leaderboard preview in grid cards collapses to top-2 rows** (from top-3). At `md` card width, three leaderboard rows with three score columns become too cramped to read. Top-2 preserves primary scan signal.
- Sort button label truncates to icon-only `[↕]` with a tooltip "Sort". Active sort is communicated via `aria-label` on the button.

### `sm` — mobile

- Sidebar hides; top bar appears with hamburger (see app-shell.wireframe.md §5).
- View toggle hidden — list view is forced at `sm` (grid cards are too narrow to show leaderboard meaningfully at single-column width).
- **Leaderboard preview in list rows collapses to #1 only** — rank number + model name + Avg score. Rationale: at mobile width, the full leaderboard column cannot share horizontal space with the identity and meta blocks. Showing #1 preserves the "is this hard?" signal.
- Sort button remains; label truncates to `[↕]`.
- `+ New Taskset` button collapses to `+` icon-only button with `aria-label="New Taskset"` in the page header to preserve horizontal space.
- Search input expands to full width (takes up its own row below the tabs).
- Footer meta in list rows collapses: task count and model count remain; owner + visibility badge hidden (recoverable from detail page).

```
┌─────────────────────────────────────────────┐
│  [Tasksets]                             [+]  │  ← sm: icon-only CTA
│                                              │
│  [Public 42]  [My Team 3]                    │
│  ──────────────────────────────────────────  │
│  [Search Tasksets…]          [↕ Sort ▾]      │  ← view toggle hidden
│                                              │
│  OSWorld-Verified  ☆  3                      │
│  #1 Sonnet 4.5  54%        367  5            │  ← top-1 leaderboard, no owner
│  ────────────────────────────────────────    │
│  WikiGames 2  ☆  2                           │
│  #1 Sonnet 4.6  25%         35  4            │
│  ────────────────────────────────────────    │
└─────────────────────────────────────────────┘
```

---

## 11. Keyboard and accessibility

**Page landmark structure:**
- `<main id="main-content">` wraps the entire Tasksets index MAIN region.
- Page header: `<h1>Tasksets</h1>`.
- Tab bar: `role="tablist"`, each tab is `role="tab"`, `aria-selected="true/false"`, `aria-controls="[tabpanel-id]"`. The card/list grid is the `role="tabpanel"`.
- Each Taskset card or list row is a `<a>` linking to `/tasksets/[slug]` — not a `<div>` with an `onClick`. The star button inside is a `<button>` that stops event propagation to prevent navigation on star click.

**Tab navigation:**
- `Tab` cycles through: "Public" tab, "My Team" tab, search input, view toggle (two buttons), sort button, then into the Taskset cards/rows.
- Arrow keys (`←` / `→`) navigate between tabs within the tab bar (standard `role="tablist"` behavior).

**Card/row focus:**
- Each Taskset card (grid) or row (list) is individually focusable as the `<a>` wrapper.
- `Enter` navigates to the Taskset detail page.
- The star button within the card receives focus separately via `Tab` when the card is focused (or `Shift+Tab` from the next card).

**Sort menu:**
- See §7 for keyboard behavior. `aria-haspopup="menu"` on the sort button. `aria-expanded` reflects open state.

**Search input:**
- `aria-label="Search Tasksets"`. As the user types, the list region announces live results count: `aria-live="polite"` region reads `"12 Tasksets found"` after debounce.

**Loading state (initial fetch or tab switch):**
- Skeleton rows/cards replace content during data fetch. Skeletons use `aria-busy="true"` on the tabpanel. Screen readers announce "Loading" via an off-screen `aria-live` region.

**Reduced motion:**
- Card hover transitions, star fill animations, sort menu open/close — all defer to `prefers-reduced-motion: reduce`. Motion timing is motion-designer's layer; the a11y requirement is that the state change (starred, hovered, menu open) is perceivable instantaneously when preference is set.

---

## 12. Loading state (skeleton)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SKELETON — list view  (same layout as populated list)                           │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  [░░░░░░░░░░░░░░░]  [░░░░░░░░░░░░░░░░░░░░░░░░░░]  [░░░  ░░░  ░░░░░░]   │   │
│  │  animate-pulse  bg-muted  rounded                                        │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │  [░░░░░░░░░░░░░]   [░░░░░░░░░░░░░░░░░░░░░░░░░]   [░░░  ░░░  ░░░░░]    │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │  [░░░░░░░░░░░░░░░░] [░░░░░░░░░░░░░░░░░░░░░░░░]   [░░░  ░░░  ░░░░░░░]  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  8 rows  animate-pulse  bg-muted                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Skeleton shape mirrors the list row proportions. Grid view shows skeleton cards at the appropriate grid layout. No spinner — skeleton prevents layout shift and communicates content shape.

---

## Component summary

| Component | Usage in this screen | Notes |
|---|---|---|
| `PageHeader` | Page title + `+ New Taskset` CTA | `h1` with `Button` primary sm. Same pattern as other index pages. |
| `TabBar` | Public / My Team tabs with count chips | `role="tablist"`, controlled tab panel. Count chips on each tab label. |
| `SearchInput` | Filters within active tab | Debounced (300ms). `aria-live` region for result count. Placeholder adapts per tab. |
| `ViewToggle` | Grid / List segmented control | 2-segment control. Persists to localStorage. Hidden at `sm`. |
| `SortMenu` | Sort dropdown | `role="menu"`, single-select, URL-persisted. Triggered by outline button. |
| `TasksetCard` | Grid view item | Full card with leaderboard rows. Clickable `<a>`. Star button is nested `<button>`. |
| `TasksetRow` | List view item | Compact row, inline top-2 leaderboard. Clickable `<a>`. |
| `StarButton` | On card + row | Toggle button. Optimistic update. `aria-pressed`. |
| `LeaderboardPreview` | Inside card + row | Top-3 (grid) or top-2 (list) ranked model rows. Medal rank badges. Score columns. |
| `MedalBadge` | Inside leaderboard rows | 1/2/3 rank indicator. Color by rank (token-assigned). |
| `VisibilityBadge` | Card footer, list row meta | Public = accent pill. Private = lock icon + text. |
| `EmptyState` | My Team zero, search no-match | Icon + message + action. CLI command in My Team zero state. |
| `SkeletonRow` / `SkeletonCard` | Loading state | `animate-pulse bg-muted`. Shape mirrors populated layout. |

---

## 13. Persona notes by surface decision

| Decision | Alex (PRIMARY) | Sam (SECONDARY) | Riley (TERTIARY) |
|---|---|---|---|
| Default tab logic (My Team if ≥1 Tasksets) | Gets `My Team` once he has team Tasksets; otherwise Public is correct default. | Gets `My Team` immediately — that's where his regression Taskset lives. | Gets `My Team` — that's where his delivery Tasksets are. |
| List view default | Preferred density — scans more Tasksets per scroll. | Equal — scan-by-name works in list. | Equal — batch names are visible. |
| Leaderboard preview in default List view | Primary: confirms Avg score at a glance to judge difficulty. | Secondary: not needed for find-by-name, but not harmful. | Not relevant for index scan. |
| Starred first sort | Stars the Tasksets he runs against regularly; "Starred first" keeps them at top. | Stars his primary 2–3 regression Tasksets; same benefit. | Stars delivery Tasksets per client; same benefit. |
| "Most tasks" sort option | Finds comprehensive benchmarks; large Tasksets tend to be harder to saturate. | Not his primary path. | Not relevant. |
| No QA-status badges on the index card | N/A (Alex doesn't need QA status). | N/A (Sam doesn't need it here). | QA status is Taskset-detail concern, not index concern. Correct omission — no screenshots show it either. |

---

## 14. Open questions (do not block, flag for follow-up)

1. **CLI command for empty state**: The exact CLI command for creating a Taskset is not confirmed from the platform docs. `hud taskset new` is a plausible form consistent with `hud eval`, `hud rl run`, `hud deploy` patterns — but must be verified against `docs.hud.ai/reference/cli` before implementation. Label as TBD in the spec.

2. **Tags on Tasksets**: No screenshots show tag filtering or tag chips on cards. Taskset tags (as a filterable property beyond name search) are not confirmed as a current platform primitive. This wireframe omits tag filtering. If tags are introduced: a `Tags` filter multi-select belongs in the filter row between search and view toggle, and tag chips appear in the card footer.

3. **"My tasksets" sub-filter**: `02a-tasksets-my.png` shows a `My tasksets` chip active in the filter row on the My Team tab. This appears to be a sub-filter showing only Tasksets owned by the current user (as opposed to all Tasksets in the org). The wireframe acknowledges this from the screenshot but does not fully spec the behavior — two open questions: (a) is this a toggle or a filter chip? (b) is "My tasksets" the default state of the My Team tab, or is "all team Tasksets" the default with "My tasksets" as an optional filter? Needs product clarification.

4. **Star count semantics on My Team Tasksets**: On Public Tasksets the star count is community-wide. On My Team Tasksets, it is unclear whether the count reflects: (a) only the current org's members who starred it, (b) a global count if the Taskset was forked from a Public one, or (c) no count at all (just a personal bookmark with no count displayed). Verify with platform.

5. **Leaderboard column header placement in grid view**: Screenshots show `Avg  Best@3  Best@5` headers at the top of each card's leaderboard section. This is correct — each card is self-contained. However, in list view at `lg+`, a sticky column header row above the list makes the `Avg` column scannable across rows. Confirm whether the list view column header should also show `Best@3 / Best@5` (they are collapsed in list view — redundant if so) or should it show only `Avg`.

---

## Out of scope

- **Taskset create flow** — Operator is still discovering this. Not in this wireframe; `+ New Taskset` is a link target only.
- **Taskset detail page** — `/tasksets/[slug]`. The detail page shows the full Leaderboard, Task list, Job history, and Grader config. This wireframe ends at card click.
- **QA status badges on index cards** — Riley's QA status is a detail-page concern. No screenshots show it on the index. If added in future, it belongs in the card footer as a badge, gated behind product decision.
- **Fork / import from Public to My Team** — the affordance likely lives on the Taskset detail page, not the index card. Not designed here.
- **Taskset sharing / visibility toggle** — My Team Taskset visibility control (Private → Public publish) lives on the detail page.
- **Bulk selection + bulk actions** — (e.g., "delete 3 Tasksets", "run Job on selected Tasksets") — not in scope for index view at this phase.
- **Sort by "Top score" or "Most recent Job"** — not in the state machine sort options. If needed, add to the sort menu in a future iteration.
- **Tags / filter by Environment type** — see open question §14 item 2.

---

## Drift log

- **List view as default (over grid)**: the production screenshots (`02a-tasksets-my.png`, `02c-tasksets-myteam.png`) show grid view as the apparent production default for My Team. This wireframe spec's List as default per the Operator's stated state machine ("Default view = List — Alex's bias"). This is an intentional divergence from the current production state, not an inconsistency.

- **Leaderboard collapsed in list view to top-2**: grid shows top-3 as confirmed in screenshots. List view showing top-2 is a new design decision — not observed in screenshots directly, derived from density tradeoff reasoning. Flagged here for Operator review.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md). Visual references: operator-supplied screenshots `02a-tasksets-my.png`, `02b-tasksets-public.png`, `02c-tasksets-myteam.png` (Jun 2026), plus operator-supplied images #5, #6, #7 showing list view, card detail with leaderboard, and sort menu. Sibling wireframes: [`app-shell.wireframe.md`](./app-shell.wireframe.md), [`manage.wireframe.md`](./manage.wireframe.md).*
