# Tasksets Index — Screen Wireframe (`/tasksets`)

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

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

The page must also scale from Alex with 3 Tasksets to DoorDash (Sam enterprise) with 120+ Tasksets without two different layouts. Grouping, owner filtering, and pagination are progressive disclosure — they surface only when the data justifies them, preserving Alex's simple flat-list experience.

---

## Taskset volume by persona

| Persona | Realistic My Team count | How they use the index |
|---|---|---|
| **Alex** (Frontier RL Researcher — PRIMARY) | 0–15 | Scans Public tab to find hard benchmarks; lands on My Team for his personal Tasksets he runs against repeatedly. Flat list. Sort by starred or most tasks. |
| **Sam SMB** (Applied Agent Engineer, small team) | 5–25 | Navigates directly to My Team, finds the regression Taskset by name. Flat list. Sort by starred or newest. |
| **Sam enterprise (DoorDash-scale)** | 50–150+ | Multiple agent surfaces (menu, support, dasher, marketplace ops, recommendations) × per-surface { baseline + weekly regression + edge-case bank + per-model-migration comparison Tasksets }. Flat list breaks — needs grouping by Environment and owner filtering to navigate. DoorDash is the named enterprise customer that anchors the upper end of this range. |
| **Riley** (RL Environment Vendor — TERTIARY) | 10–50 | Per client × 2–5 Taskset versions × 3–5 active clients. Navigates by client/project name. Grouping by owner is useful here too. |

**Progressive disclosure principle**: Group by and Owner filter have sensible "off / Anyone" defaults. At Alex-scale (3 Tasksets) these controls are invisible in effect. At DoorDash-scale they become the primary navigation pattern.

---

## 1. Shared layout note

The `MAIN` region is the content area to the right of AppShell's persistent sidebar. This wireframe does not redraw the sidebar, credits widget, or user chip — those are fully specified in `app-shell.wireframe.md`.

```
┌─────────────────────┬─────────────────────────────────────────────────────────┐
│  SIDEBAR (AppShell) │  MAIN                                                   │
│  [see app-shell     │                                                          │
│   wireframe.md]     │  [TASKSETS INDEX CONTENT — this file]                   │
│                     │                                                          │
└─────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Page header anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER                                                                     │
│                                                                                  │
│  ┌──────────────────────────────────────────────────┐  ┌───────────────────────┐ │
│  │  Tasksets  [?]                                   │  │  + New Taskset        │ │
│  │  (h1 / page title)  (docs icon, ghost weight)    │  │  (primary button)     │ │
│  └──────────────────────────────────────────────────┘  └───────────────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- "Tasksets" is the h1 / page title. No subtitle or description — the page is self-evident to Alex who is already in the product.
- `[?]` represents the per-primitive docs icon immediately to the right of the title. Ghost visual weight — it must not compete with the title for attention. Icon glyph is placeholder; final glyph is a design-tokens-phase decision.
- **Docs icon behavior**: click or `Enter` opens `docs.hud.ai/concepts/tasksets` in a new tab. The URL pattern is a contract with the docs site: every first-class primitive page has a corresponding `/concepts/<primitive>` path. **Open question:** this URL contract has not been confirmed with the docs site owner — flag for implementation verification before linking.
- **Tooltip**: `"Tasksets documentation"` on hover and on focus. Disambiguates the icon for keyboard and screen-reader users.
- **ARIA**: rendered as `<a aria-label="Tasksets documentation, opens in new tab" rel="noopener">`. Matches the sidebar `Documentation ↗` external-link convention.
- `+ New Taskset` is top-right, primary button. It links to the Taskset create flow (out of scope for this wireframe). The `+` prefix is standard HUD convention for create actions observed across screenshots.
- No breadcrumb — `/tasksets` is a first-class nav destination, not a nested route.

**Scroll behavior — sticky page header:**
- The page header (title + docs icon + `+ New Taskset`) stays pinned to the top of the content area as the Taskset list scrolls. Rationale: at DoorDash-scale (100+ Tasksets), the user scrolls far; keeping the create CTA and the page-title docs icon reachable at all times avoids a frustrating scroll-back-to-top. Matches the scroll behavior of peer tools (Linear, W&B).
- A subtle visual separator (bottom border or shadow) at the lower edge of the sticky region separates the pinned header from the scrolling content so the user perceives the boundary clearly. Exact treatment (border vs. shadow, width, opacity) is a screen-spec / token decision — do not spec here.

**Docs paths — three moments, not redundancy:**

| Path | User state | Job |
|---|---|---|
| Page-title docs icon `[?]` | Already on the Tasksets page | "I'm here; I want the concept doc for *this* primitive — 1 click." |
| Sidebar `Documentation ↗` link | Anywhere in the app | Browse intent; general docs landing. |
| Empty-state `Read the docs ↗` link (§11a) | First arrival, zero data | "I have no Tasksets — what even is this?" |

Each path serves a distinct moment. Preserving all three is not redundancy.

---

## 3. Tab + filter row anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TAB + FILTER ROW                                                                │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐       │
│  │  TAB BAR  (left-aligned, inline with search)                          │       │
│  │                                                                       │       │
│  │  [Public  42]  [My Team  3]                                           │       │
│  │  ← tab underline variant; active tab underlined; count chip muted     │       │
│  └───────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Filter row  (below tabs, full width, horizontally arranged)                     │
│                                                                                  │
│  ┌──────────────────────────────────────────────────┐                           │
│  │  [🔍]  Search Tasksets…                          │                           │
│  │  (search input, expands to fill available space)  │                           │
│  └──────────────────────────────────────────────────┘                           │
│                                                                                  │
│  [⊞ Grid]  [☰ List ✓]     ←  view toggle, right of search                       │
│  Segmented control, 2 items  (List = default, persists in localStorage)          │
│                                                                                  │
│  [↕ Starred first ▾]   ← sort button, rightmost                                 │
│  Outline button, opens sort menu (see §7)                                        │
│                                                                                  │
│  [Group by None ▾]   ← group control, right of sort                             │
│  Outline button, opens group menu (see §8)                                       │
│                                                                                  │
│  MY TEAM TAB ONLY — shown when org has 10+ distinct owners:                      │
│  [Owner: Anyone ▾]   ← owner filter chip, leftmost of right-side controls       │
│  Multi-select dropdown. Hidden when <10 distinct owners in the tab.              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

**Scroll behavior — sticky tab bar:**
- The tab bar (`[Public 42] [My Team 3]`) stays pinned just below the sticky page header as the list scrolls. The filter row (search, view toggle, sort, group by, owner filter) is NOT sticky — it scrolls away with the content. Rationale: pinning the full filter row would consume too much vertical space on shorter viewports; users can scroll back up to change filters. The primary need during a long scroll is to know which tab (list) you are in and to have the create CTA reachable — both served by the sticky header + tab bar combination.
- Tab counts remain visible while the user scrolls, so the "Public 42 / My Team 3" signal is always present regardless of scroll depth.
- The same subtle separator applied at the bottom of the page header extends to encompass the tab bar — the sticky region as a whole (header + tabs) reads as a single pinned block separated from the scrolling content below.

**Annotations:**

- **Tab counts**: `Public 42 · My Team 3` in the tab label area. Count is live (reflects filtered org Tasksets count, not a static cache). Format: space-separated integer after the tab label, rendered smaller and muted to not compete with the label. Observed on `02b-tasksets-public.png` and `02a-tasksets-my.png`.

- **Tab default logic**: `My Team` is the default active tab when the user has ≥1 team Tasksets; `Public` is the default when they have zero. This prevents a blank My Team tab being the first thing a new user sees.

- **Search scope**: filters within the active tab only. Placeholder text adapts: "Search public Tasksets…" on Public tab, "Search team Tasksets…" on My Team tab. Observed `02a-tasksets-my.png`: search placeholder "Search my tasksets..." and `02b-tasksets-public.png`: "Search public tasksets...".

- **"My tasksets" toggle**: `02a-tasksets-my.png` shows a `My tasksets` chip/pill active on the My Team tab. This appears to be a sub-filter showing only the current user's Tasksets within the team org. Annotated as an open question — see §14.

- **View toggle**: two segments `Grid | List`. List is the default — Alex's density preference and the state machine spec. Toggle state persists to localStorage. On mobile, toggle is hidden; List layout is forced.

- **Sort button**: shows current sort label inline. Clicking opens the sort menu (§7). Label updates on selection. Screenshot `02a-tasksets-my.png` confirms "Starred first" as the visible default sort label.

- **Group by control**: defaults to `None`. Options: `None` / `Environment` / `Owner`. When set to anything other than `None`, the list or grid renders with collapsible group headers instead of a flat list. See §8 for group view behavior. Off by default — Alex's small-team flat list is unchanged.

- **Owner filter**: appears in My Team tab only when the org has 10 or more distinct owners. Hidden otherwise. Multi-select: selecting one or more owners narrows the list to Tasksets owned by those people. Default: "Anyone" (no filter applied). This threshold hides the control for Alex's lab-scale team (typically 1–5 people) and surfaces it for DoorDash-scale orgs.

---

## 4. Grid card anatomy (view = Grid)

Grid layout: 3-column at desktop, 2-column at tablet, 1-column at mobile. Each card is equal height within a row.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  GRID CARD  — one card                                                           │
│  clickable region (entire card)  → navigates to /tasksets/[slug]                 │
│                                                                                  │
│  ── CARD HEADER ──────────────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  [ENV ICON]  OSWorld-Verified                          ☆  3               │ │
│  │  (small icon)  (task name, prominent)                  (star, count)       │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ── LEADERBOARD PREVIEW ──────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  col headers                                                               │ │
│  │              Avg   Best@3  Best@5                                          │ │
│  │              (right-aligned, muted)                                        │ │
│  │                                                                            │ │
│  │  ┌──┐  Claude Sonnet 4.5    54%    —      —                               │ │
│  │  │ 1│  (model name)         (score columns)                                │ │
│  │  └──┘  [env-name tag]                                                      │ │
│  │        (muted, small)                                                      │ │
│  │                                                                            │ │
│  │  ┌──┐  Claude Sonnet 4      42%    53%    —                               │ │
│  │  │ 2│                                                                      │ │
│  │  └──┘  [env-name tag]                                                      │ │
│  │                                                                            │ │
│  │  ┌──┐  Claude Sonnet 3.7    33%    44%    —                               │ │
│  │  │ 3│                                                                      │ │
│  │  └──┘  [env-name tag]                                                      │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ── CARD FOOTER — tab-conditional ────────────────────────────────────────────  │
│                                                                                  │
│  Public-tab mode:                                                                │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  [task icon]  367 tasks   [model icon]  5 models                           │ │
│  │  (muted, small)                                                            │ │
│  │                                                                            │ │
│  │  HUD                                                                       │ │
│  │  (org name, quiet text, no pill — owner is the credibility cue)            │ │
│  │  ★ 18  (star + count, prominent — community credibility signal)            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  My Team tab mode:                                                               │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  [task icon]  240 tasks   [model icon]  6 models                           │ │
│  │  (muted, small)                                                            │ │
│  │                                                                            │ │
│  │  DoorDash  (owner, higher prominence — navigation key at team scale)       │ │
│  │  [🔒 Private]  (visibility pill — carries info: team mix of pub/priv)      │ │
│  │  ★  (bookmark icon + small count, demoted — personal bookmark semantic)    │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Card anatomy — field-by-field:**

| Field | Source (screenshot) | Notes |
|---|---|---|
| Environment icon | `02b-tasksets-public.png` — small square icon left of Taskset name | Represents the primary Environment type. Icon is decorative; label is the primary affordance. |
| Taskset name | All screenshots | Prominent, single-line. |
| Star icon + count | All screenshots — `☆ 3` visible on OSWorld-Verified, `☆ 2` on WikiGames 2 | Interactive: clicking the star toggles starred state for the current user. Filled star = starred; outline = not starred. Semantics differ by tab — see §4.1. |
| Leaderboard rows | `02b-tasksets-public.png` — 3 rows per card, rank badges, model name, env-name tag below model, `Avg / Best@3 / Best@5` columns | Top 3 ranked models by `Avg` score. Rank badges: 1st, 2nd, 3rd (rank indicator only — no color named here; token-phase decision). Scores are exact percentage values. `—` when the metric has not been run. Grid card keeps full top-3. |
| Footer: task count | `02b-tasksets-public.png` — "367 tasks" with task/clipboard icon | Exact integer. |
| Footer: model count | `02b-tasksets-public.png` — "5 models" with model icon | Total models that have run against this Taskset. |
| Footer: owner | `02b-tasksets-public.png` — org initials badge + org name | Public tab: quiet text, no pill — credibility cue. My Team tab: higher prominence — navigation key at DoorDash-scale. Not the individual user name in either case. |
| Visibility badge | `02b-tasksets-public.png` — lock icon for private, HUD badge for public | **Public tab**: no pill — every card on this surface is public by definition; the pill is redundant noise. **My Team tab**: pill is present and carries information — the team view contains both Public and Private Tasksets. `🔒 Private` guards against "I thought this was internal." |

**Leaderboard column headers**: each card is self-contained with its own `Avg / Best@3 / Best@5` headers.

**Score signal**: scores are visually differentiated by magnitude. High scores, middle scores, and low scores each read differently. Exact hue assignments are design-token phase. The wireframe notes the pattern exists without specifying color.

**"No leaderboard yet" state** (card has Tasks but zero Jobs run):
```
│  ── LEADERBOARD PREVIEW ──────────────────────────────────────────────│
│                                                                        │
│  No models run yet.                                                    │
│  (single line, muted, vertically centered in the leaderboard area)     │
│                                                                        │
```

### 4.1 Tab-conditional footer rationale

The card footer renders differently depending on the active tab because the widgets earn screen weight differently on each surface.

**Public tab — Alex's discovery loop ("is this hard enough? is it trustworthy?"):**
- `★ 18` star count = community credibility signal. Keep prominent. High counts signal community validation; Alex uses this to distinguish well-run benchmarks from obscure one-offs.
- `Public` pill = redundant. Every card on this surface is public by definition. Removing it reduces color noise without losing information.
- Owner org name = credibility cue. Keep as quiet text. "HUD", "Princeton NLP", "Adept Research" all signal legitimacy without competing with the leaderboard data.

**My Team tab — Sam/Riley's find-mine loop ("which is mine? whose squad?"):**
- `★` becomes a personal bookmark with small counts (typically 0–5 org members). Demote to icon-only or icon + small count. At this scale, a high star count is not a signal.
- `Public` / `Private` pill now carries information — the My Team view contains both Public and Private Tasksets. Keep the pill. `🔒 Private` is a guard against accidental disclosure: "I thought this was internal."
- Owner is a navigation key at DoorDash-scale. Higher prominence than on Public. "Show me the menu-agent squad's Tasksets" maps to owner name.

Future designers: do not restore the `Public` pill on Public-tab cards. Its absence is intentional, not an omission. If a new surface contains a mix of visibility states, re-evaluate per that surface's user question.

---

## 5. List row anatomy (view = List)

List layout: a single-column vertical stack of rows. Denser than grid — Alex's default. Each row is a full-width clickable region navigating to `/tasksets/[slug]`.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  LIST ROW  — one row                                                             │
│  clickable region → /tasksets/[slug]                                              │
│                                                                                  │
│  ┌──────────────┐  ┌────────────────────────┐  ┌────────────────────────────┐   │
│  │ IDENTITY     │  │ LEADERBOARD (inline)   │  │ META                       │   │
│  │              │  │                        │  │                            │   │
│  │ [env icon]   │  │ #1 Claude Sonnet 4.6   │  │ [task icon]  367           │   │
│  │ Name         │  │    61%                 │  │ [model icon]  5            │   │
│  │ ☆  3         │  │ (hover → #2 #3 appear) │  │ [owner]  HUD              │   │
│  │              │  │                        │  │ (tab-conditional — see §5a)│   │
│  └──────────────┘  └────────────────────────┘  └────────────────────────────┘   │
│                                                                                  │
│  proportions:  [identity ~30%]  [leaderboard ~45%]  [meta ~25%]                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**List row — field-by-field:**

| Field | Collapsed from grid? | Notes |
|---|---|---|
| Identity block | Same as grid header | Env icon + Taskset name + star toggle + star count. Slightly smaller type than grid title for density. |
| Leaderboard inline | Grid shows 3 rows; list shows leader only (default) | Rank chip + model name + `Avg` score. Single line. No "Avg" label per cell — the column header already reads "Top models (Avg)". `Best@3` and `Best@5` collapsed — detail data. Row hover or row expand reveals #2 and #3. |
| Meta block | Same as grid footer, tab-conditional | Task count + model count + owner + visibility badge (tab rules from §4.1 apply). Condensed to a single line with icon separators. |

**Leader-only leaderboard in list view**: the HUD question is "enough at-a-glance to choose without clicking." For Alex's discovery loop on Public Tasksets, the first-place score is the primary signal ("how hard is this Taskset?"). A single `Claude Sonnet 4.6 — 61%` line reads instantly without eye movement. The second and third places are available on hover or row expand — recoverable without a page navigation, but not cluttering the default scan state. This reduces the leaderboard column from two lines of mixed color (rank chip + name + score + "Avg" label × 2 rows) to one accent line.

**Tab-conditional meta block in list view**: the same tab rules from §4.1 apply to the list row meta block.
- Public tab: owner as quiet text, no visibility pill, star count prominent.
- My Team tab: owner at higher prominence, visibility pill present, star demoted.

**No-leaderboard-yet state in list row:**
```
│  [env icon]  Taskset Name  ☆  |  No models run yet.  (muted)  |  N tasks  N models  owner  badge  │
```

---

## 6. Column header row (List view only)

The list view renders a sticky column header row above the rows so the user knows what the columns are when scrolling.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  COLUMN HEADERS  (sticky at top of list, below filter row)                       │
│                                                                                  │
│  Taskset                     Top models (Avg)         Tasks  Models  Owner       │
│  (muted, small)              (muted, small)           (right-aligned numerics)   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

The grid view has no column header row — each card is self-contained with its own internal headers.

---

## 7. Sort menu

Triggered by the `[↕ Starred first ▾]` button in the filter row. Opens as a dropdown below the trigger.

```
┌─────────────────────────┐
│  SORT MENU              │
│                         │
│  ✓  Starred first        │  ← active = checkmark
│     Newest first         │
│     Oldest first         │
│     Last activity        │  ← NEW: sorts by most-recent Job run
│     Name (A–Z)           │
│     Name (Z–A)           │
│     Most tasks           │
│                         │
└─────────────────────────┘
```

**Annotations:**
- Single-select. Selected option persists in URL query param (`?sort=starred-first`), so sharing the URL preserves sort context.
- The button label updates to reflect the active selection: `[↕ Name (A–Z) ▾]`.
- Keyboard: `Enter` / `Space` selects an item and closes; `Escape` closes without selecting; arrow keys navigate items.
- `role="menu"`, each item is `role="menuitem"`. Checkmark on active item is communicated via `aria-checked="true"` or `aria-label`.

**"Last activity" sort**: sorts by the most-recent Job run on the Taskset. At DoorDash-scale, "what did we touch this week" is more useful than alphabetical. See open question §15 item 7 for which signal to use (last Job run vs. last Taskset edit).

**Alex's primary sort is "Starred first"** — he accumulates starred Public Tasksets that he runs against regularly. "Most tasks" is his secondary sort when discovering hard new Tasksets (larger Tasksets = more comprehensive eval = harder to saturate).

**Star sort at enterprise scale**: starring 100 Tasksets is not realistic. "Starred first" still works for the user's top 5–10 Tasksets. At DoorDash-scale, grouping + owner filter become the primary navigation pattern; star sort remains useful for frequently-visited anchor Tasksets.

---

## 8. Group by menu and group view

Triggered by `[Group by None ▾]`. Opens as a dropdown below the trigger.

```
┌─────────────────────────┐
│  GROUP BY               │
│                         │
│  ✓  None                 │  ← default
│     Environment          │
│     Owner                │
│                         │
└─────────────────────────┘
```

**Group view behavior** (when Group by ≠ None):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  GROUP HEADER — collapsible                                                      │
│                                                                                  │
│  ▼  menu-agent-env  (12)       ← env name + Taskset count in group              │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  [LIST ROWS or GRID CARDS for Tasksets in this group, sorted by active sort]     │
│                                                                                  │
│  ▼  support-agent-env  (8)                                                       │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  [LIST ROWS or GRID CARDS ...]                                                   │
│                                                                                  │
│  ▶  dasher-env  (5)            ← collapsed group                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Collapsible group headers. Toggle icon: `▼` expanded, `▶` collapsed. Collapsed state persists in session (not URL).
- Group count shows the number of Tasksets in that group (respects active search + owner filter).
- Sort applies within each group independently.
- Search filters Tasksets across all groups; groups with zero matching Tasksets collapse automatically.
- Group by `None` restores the flat list.
- Group by `Owner` groups by the Taskset owner (user display name). Useful for Riley (per-client grouping) and DoorDash-scale Sam (per-squad grouping).
- Group by `Environment` groups by the primary Environment the Taskset's Tasks reference. This is the most common grouping at DoorDash-scale — "show me everything against the menu-agent environment."

---

## 9. Pagination / load-more behavior

The My Team tab and the Public tab both paginate. The list does not load all records at once.

**Default page size**: 50 Tasksets. This covers Alex (0–15), Sam SMB (5–25), and Riley (10–50) without a load-more in most cases. DoorDash-scale My Team (50–150+) will see a load-more.

**Load-more affordance**: explicit "Load more" button below the last row/card, not infinite scroll. Rationale: infinite scroll interacts poorly with keyboard navigation and with the user returning to a known position after opening a detail page.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [last row / card]                                                               │
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  Showing 50 of 127  ·  [Load more]                                               │
│  (muted count label)   (outline button)                                          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Behavior rules:**
- "Showing N of M" count reflects the active search + filter + group state. When a search is active: "Showing 20 of 34 matching results · Load more".
- After loading more, the count updates: "Showing 100 of 127 · Load more". When all records are shown: "Showing 127 of 127" (no Load more button).
- Loading more appends rows/cards below the existing list. No full-page reload. An inline loading indicator (skeleton rows) appears below the last row while the next page loads.
- Sort and search are preserved across load-more calls. Changing sort or search resets to page 1.
- In group view: each group loads independently. A "Load more" appears below a group that has more items than the per-group display limit (same 50-item threshold per group).
- Public tab paginator works the same way. Public tab may have hundreds of Tasksets.

---

## 10. Error state (network / fetch failure)

Shown when the Tasksets list fails to load due to a network error, server error, or timeout.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  ERROR STATE  (list / grid content area, below filter row)                       │
│                                                                                  │
│  [tabs, search, sort, group controls remain accessible — see note below]         │
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  [alert icon]                                                                    │
│                                                                                  │
│  Couldn't load Tasksets — try again.                                             │
│  (prominent, centered)                                                           │
│                                                                                  │
│  [Retry]                                                                         │
│  (primary button)                                                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Error state replaces only the list/grid content area. The page header (`Tasksets` h1, `+ New Taskset`), the tab bar, the search input, the sort button, and the group by control all remain rendered and interactive. The user can switch tabs, change search, or change sort as a recovery action (these all trigger a fresh fetch).
- "Retry" triggers the same fetch that failed. Clicking it shows a skeleton loading state, then either populates the list or shows the error again.
- The error is not an inline toast — it replaces the content region because the entire data load failed, not a single row action.
- This error state is distinct from the empty state (§11). If the fetch succeeds but returns zero results, the empty state shows. If the fetch itself fails, this error state shows.
- Error copy is flat and actionable: "Couldn't load Tasksets — try again." No stack traces. No HTTP status codes. Personality: exact, not chatty.

---

## 11. Empty states

### 11a. My Team tab — zero Tasksets

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE  (My Team tab, zero team Tasksets)                                  │
│  centered in the content area below the filter row                               │
│                                                                                  │
│  [Taskset icon]                                                                  │
│                                                                                  │
│  Create your first Taskset                                                       │
│  (prominent)                                                                     │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────┐                     │
│  │  hud taskset new                                        │  [⎘]               │
│  │  (monospace, copyable CLI command)                      │                    │
│  └────────────────────────────────────────────────────────┘                     │
│                                                                                  │
│  [+ New Taskset]                                                                 │
│  (primary button)                                                                │
│                                                                                  │
│  Read the docs ↗                                                                 │
│  (tertiary text link, opens in new tab)                                          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Heading is directive ("Create your first Taskset"), not declarative ("No Tasksets yet."). Capitalization follows platform vocabulary: `Taskset` is a proper product noun, not lowercased. The directive shape gives the user an action orientation on arrival.
- CLI command `hud taskset new` is TBD — exact command not confirmed in platform docs. Mark as TBD in implementation; the pattern (CLI command in empty state) follows the established personality principle: "Empty states show the CLI command." See §15 open questions.
- The `+ New Taskset` button duplicates the page header CTA — this is intentional; the empty state gives the user a direct path without scrolling back up.
- "Read the docs ↗" is a tertiary text link, not a button. Target URL TBD — likely `docs.hud.ai/concepts/tasksets` or similar; flag for implementation. Opens in a new tab. Positioned below both primary actions so the SDK-first reader's flow (CLI snippet → button) is uninterrupted. Inclusion rationale: onboarding-adjacent users (Sam introducing a junior, Riley's contracted assistant) benefit from a docs path — the fix is demotion, not removal.
- No illustration, no marketing copy, no explanatory body copy. All three personas know what a Taskset is. Personality: Spare + Earnest.

### 11b. Search — no matches

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE  (search query has no matches in the active tab)                    │
│  centered in the content area                                                    │
│                                                                                  │
│  No Tasksets match "osworld-v2"                                                  │
│  (prominent, query echoed verbatim in quotes)                                    │
│                                                                                  │
│  [Clear search]                                                                  │
│  (outline button)                                                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Query is echoed verbatim in the message (quoted). This matches the state machine spec and the personality principle "Exact."
- "Clear search" button clears the search input and resets to the unfiltered list within the current tab. Does NOT switch tabs.
- No CLI command — this is not a create-something empty state; it's a search-refinement state.
- `Public` tab is never empty (HUD seeds it with community Tasksets). The "No Tasksets match" state applies on Public only when a search query produces zero results.

---

## 12. Responsive behavior

### Desktop — full layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  [Tasksets] [?]                                          [+ New Taskset]        │
│  (page title + docs icon)                                                       │
│                                                                                 │
│  [Public 42]  [My Team 3]                                                       │
│  [Search Tasksets…]  [Grid | List ✓]  [↕ Sort ▾]  [Group by None ▾]           │
│  (My Team + DoorDash-scale also shows: [Owner: Anyone ▾])                       │
│                                                                                 │
│  LIST VIEW (default):                                                           │
│  ┌─────────────────────┬─────────────────────────┬───────────────────────────┐ │
│  │  OSWorld-Verified ☆ │  #1 Sonnet 4.6  54%      │  367  5  HUD             │ │
│  │  WikiGames 2 ☆      │  #1 Sonnet 4.6  25%      │   35  4  HUD             │ │
│  │  SheeBench-50 ☆     │  #1 Opus 4.6    40%      │   50  6  HUD             │ │
│  │  …                  │  …                        │  …                       │ │
│  └─────────────────────┴─────────────────────────┴───────────────────────────┘ │
│                                                                                 │
│  Showing 50 of 127  ·  [Load more]                                              │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet — adaptations

- Sidebar collapses to icon rail (see app-shell.wireframe.md §5).
- Grid view: 2 columns (from 3 at desktop).
- List view: unchanged — list is naturally responsive.
- **Leaderboard preview in grid cards collapses to top-2 rows** (from top-3). At tablet card width, three leaderboard rows with three score columns become too cramped to read. Top-2 preserves primary scan signal.
- **Leaderboard in list rows**: leader-only (same as desktop). The desktop and tablet breakpoints share the same single-line leader spec; no differentiation needed.
- **Docs icon `[?]`**: visible inline with the title. Same ghost weight as desktop.
- **Sort button**: label truncates to icon only `[↕]` with a tooltip "Sort". Active sort communicated via `aria-label` on the button.
- **Group by button**: label truncates to icon only with a tooltip "Group by".
- **Owner filter**: collapses to icon + count badge (e.g., `Owner: 2`) to save horizontal space when one or more owners are selected; shows `Owner` label only when no filter is active.
- **Error state (§10)**: fills the content area below the filter row, same as desktop but narrower. Tabs, search, sort, group by, and docs icon all remain accessible above the error block.
- **Group headers (§8)**: horizontal bars spanning the content area; collapse/expand chevron at the start; count chip at the end. Same as desktop.
- **Pagination**: `Showing N of M · Load more` inline at the bottom of the list, centered or left-aligned (engineer's call).

### Mobile

- Sidebar hides; top bar appears with hamburger (see app-shell.wireframe.md §5).
- **View toggle hidden — cards forced on mobile.** Grid cards stack vertically one per row, which fits a single-column phone viewport naturally; list rows assume horizontal columns (identity | leaderboard | metrics) that collapse below ~640px width and lose the identity column entirely.
- **Card layout on mobile**: single column (`grid-cols-1`). Card identity prefix `[icon] {ownerName} / {name}` truncates the name when long but keeps the prefix visible. Leaderboard preview in card stays top-2 (was top-3 at tablet; mobile drops one more row only if vertical density requires it — confirm by viewing the engineer's mobile screenshot when committed).
- **Docs icon `[?]`**: visible inline with the title. Icon glyph is small; the tap target extends beyond the visible glyph to meet touch-target adequacy (no px spec — this is a design-tokens-phase decision; call it out for implementation).
- `+ New Taskset` button collapses to `+` icon-only button with `aria-label="New Taskset"` in the page header to preserve horizontal space.
- **Filter row on mobile**: the desktop filter row (search + view toggle + sort + group by + owner filter) is too wide for mobile. Pattern:
  - Search input takes its own full-width row below the tabs.
  - View toggle is hidden (cards forced).
  - Sort, Group by, and Owner filter collapse into a single `[⚙ Filters ▾]` overflow trigger. When any non-default filter is active, a small badge on the trigger shows the count of active non-default controls.
  - Tapping `[⚙ Filters]` opens a **mobile bottom sheet** (see diagram below).
- **Error state (§10) on mobile**: error block fills the content area. Copy may wrap to multiple lines. Retry button stacks below the message if horizontal space is tight. Tabs, search, the `[⚙ Filters]` trigger, and the page-title docs icon all remain accessible above the error block.
- **Group headers (§8) on mobile**: chevron, label, and count render on a single line when the label fits. If the label is too long, the count wraps below the label; chevron stays inline with the label's first line. Collapsed state persists in session. When a group is collapsed, the chevron alone is the tap target (tap target extends beyond the glyph).
- **Pagination**: `Showing N of M · Load more` row at the bottom of the list. Load more button stretches to full width for tap-target ease. After loading, keyboard focus moves to the first newly-loaded row so screen-reader users hear new content — see also §13 (a11y).
- **Star toggle (§15)**: no hover state on touch devices. Tap toggles star directly. Tap target extends beyond the visible icon glyph.
- **Tab counts**: tab label + count chip stay on a single line at normal mobile widths. If the viewport is extremely narrow, the count chip may wrap below the tab label — do not truncate the integer.
- **Empty-state and search-no-match (§11a, §11b)**: center column adapts naturally. CTAs stack vertically if the row width is too narrow for them side-by-side. `Read the docs ↗` tertiary link stays below the primary actions on all sizes.

```
┌─────────────────────────────────────────────┐
│  [Tasksets] [?]                         [+]  │  ← docs icon + icon-only CTA
│                                              │
│  [Public 42]  [My Team 3]                    │
│  ──────────────────────────────────────────  │
│  [Search Tasksets…          ]                │  ← full-width search, own row
│  [⚙ Filters ▾]  (badge if active)           │  ← sort + group + owner overflow
│                                              │
│  ┌──────────────────────────────────────────┐ │
│  │ [icon] acme / OSWorld-Verified  ☆        │ │  ← card layout (§4), single column
│  │ #1 Sonnet 4.6  54%              367  5   │ │  ← top-2 leaderboard preview
│  │ #2 GPT-4o      48%                        │ │
│  └──────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │ [icon] acme / WikiGames 2  ☆             │ │
│  │ #1 Sonnet 4.6  25%               35  4   │ │
│  └──────────────────────────────────────────┘ │
│                                              │
│  [          Load more           ]            │  ← full-width button
│  Showing 50 of 127                           │
└─────────────────────────────────────────────┘
```

**Mobile sticky behavior:** Sticky behavior is the same as desktop and tablet — page header and tab bar pinned to top, filter row scrolls. The `[⚙ Filters]` bottom sheet is accessed by tapping the filter trigger in the filter row; because the filter row scrolls away, the user taps it before scrolling or scrolls back to the top. This does not conflict with the bottom sheet pattern — the bottom sheet is still the mechanism for accessing filter controls on mobile; sticky behavior only affects which parts of the page header remain visible during scroll.

#### Mobile bottom sheet — `[⚙ Filters]`

Opens when the user taps `[⚙ Filters]`. Slides up from the bottom of the viewport.

```
┌─────────────────────────────────────────────┐
│  ────  (drag handle, decorative)             │
│                                              │
│  Sort                                        │
│  ● Starred first  ○ Newest first  ○ …       │
│                                              │
│  Group by                                   │
│  ● None  ○ Environment  ○ Owner             │
│                                              │
│  Owner  (My Team + 10+ owners only)          │
│  [multi-select list]                         │
│                                              │
│  [           Done           ]                │  ← applies + closes
│                                              │
└─────────────────────────────────────────────┘
```

**Bottom sheet behavior:**
- Current selections are pre-populated when the sheet opens.
- `Done` applies the selections and closes the sheet.
- Tapping the background outside the sheet dismisses without applying changes (reverts to previous state).
- `Escape` key dismisses without applying changes.
- The sheet preserves current selections on open — closing without tapping `Done` keeps the prior state.
- Active filter count badge on `[⚙ Filters]` reflects the number of non-default selections (e.g., badge shows `2` if sort is non-default and one owner is selected).

---

## 13. Keyboard and accessibility

**Page landmark structure:**
- `<main id="main-content">` wraps the entire Tasksets index MAIN region.
- Page header: `<h1>Tasksets</h1>`.
- Tab bar: `role="tablist"`, each tab is `role="tab"`, `aria-selected="true/false"`, `aria-controls="[tabpanel-id]"`. The card/list grid is the `role="tabpanel"`.
- Each Taskset card or list row is a `<a>` linking to `/tasksets/[slug]` — not a `<div>` with an `onClick`. The star button inside is a `<button>` that stops event propagation to prevent navigation on star click.

**Tab navigation:**
- `Tab` cycles through: "Public" tab, "My Team" tab, search input, view toggle (two buttons), sort button, group by button, owner filter (when visible), then into the Taskset cards/rows.
- Arrow keys (`←` / `→`) navigate between tabs within the tab bar (standard `role="tablist"` behavior).

**Card/row focus:**
- Each Taskset card (grid) or row (list) is individually focusable as the `<a>` wrapper.
- `Enter` navigates to the Taskset detail page.
- The star button within the card receives focus separately via `Tab` when the card is focused (or `Shift+Tab` from the next card).

**Sort menu / Group by menu:**
- See §7 for keyboard behavior. `aria-haspopup="menu"` on the sort and group buttons. `aria-expanded` reflects open state.

**Owner filter:**
- Multi-select dropdown. `role="listbox"` with `aria-multiselectable="true"`. Each option is `role="option"` with `aria-selected`.

**Search input:**
- `aria-label="Search Tasksets"`. As the user types, the list region announces live results count: `aria-live="polite"` region reads `"12 Tasksets found"` after debounce.

**Group headers:**
- Each group header is a `<button>` with `aria-expanded="true/false"` controlling the group's content region. `aria-label="menu-agent-env, 12 Tasksets, expanded"`.

**Docs icon (page-title `[?]`):**
- Rendered as `<a aria-label="Tasksets documentation, opens in new tab" rel="noopener">`. Focus is in the natural tab order between the page title region and `+ New Taskset`.

**Load more button:**
- `aria-label="Load more Tasksets"`. After loading, focus moves to the first newly-loaded row so screen-reader users hear new content without having to manually navigate down. This applies on all viewport sizes including mobile (referenced from §12 mobile pagination note).

**Loading state (initial fetch or tab switch):**
- Skeleton rows/cards replace content during data fetch. Skeletons use `aria-busy="true"` on the tabpanel. Screen readers announce "Loading" via an off-screen `aria-live` region.

**Reduced motion:**
- Card hover transitions, star fill, sort menu open/close, group expand/collapse — all defer to the user's reduced-motion preference. The state change (starred, hovered, menu open, group collapsed) is perceivable instantaneously when the preference is set. Motion timing is the motion-designer's layer.

---

## 14. Loading state (skeleton)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SKELETON — list view  (same layout as populated list)                           │
│                                                                                  │
│  Column mapping:  [identity ~30%]         [leaderboard ~45%]   [meta ~25%]      │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  [░░░░░░░░░░░░░░░]  [░░░░░░░░░░░░░░░░░░░░░░░░░░]  [░░░] [░░░] [░░░░░]  │   │
│  │  [░░░░░░░░░]        (1 bar — leader-only row)       ↑ 3 short meta bars  │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │  [░░░░░░░░░░░░░]    [░░░░░░░░░░░░░░░░░░░░░░░]      [░░░] [░░░] [░░░░]   │   │
│  │  [░░░░░░░░]         (1 bar)                                               │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │  [░░░░░░░░░░░░░░░░] [░░░░░░░░░░░░░░░░░░░░░░░░]     [░░░] [░░░] [░░░░░░] │   │
│  │  [░░░░░░░░░░]       (1 bar)                                               │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  8 rows of skeleton                                                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Skeleton shape rules (synced with populated layout):**

- **Identity column**: 2 bars (name bar + star/count bar) — same as before.
- **Leaderboard column**: **1 bar** (was 2). After the leader-only change to list rows, the skeleton must drop to a single bar to match the populated row height. Two bars would cause a visible layout shift when data loads.
- **Meta column**: **3 short bars** (was 1 wide bar). The populated meta block has three segments (tasks count · models count · owner text). Three bars arranged horizontally hint at the column structure and prevent a jarring segment-pop on load. Bars are short and right-aligned to mirror the populated meta layout.

**Open question — skeleton fill contrast (token-phase note):** The skeleton bar fill color is currently `--border-mid` (`#333340`). On lower-quality displays or in bright ambient light, this value may merge visually with the row-separator hairline (`--border` = `#2a2a30`), making skeleton rows hard to distinguish from dividers. The delta between these two values should be confirmed at the token phase. The wireframe does not prescribe the exact value — this is a token-phase decision. Flag for the token designer.

Skeleton shape mirrors the list row proportions. Grid view shows skeleton cards at the appropriate grid layout. No spinner — skeleton prevents layout shift and communicates content shape.

---

## 15. Star toggle interaction

The star icon appears in the card header (grid) and in the identity block (list). It is an inline interactive control — it does not navigate, just toggles state.

**State machine:**
1. **Not starred, idle**: outline star `☆` + count. Muted.
2. **Not starred, hovered**: outline star fills partially (filled star silhouette, reduced opacity). Indicates clickability.
3. **Not starred, activated (click/Enter)**: immediate optimistic toggle to starred state. Star fills. Count increments by 1 (optimistic). POST to server; on failure, revert + show inline error toast: `"Could not star Taskset — try again."`.
4. **Starred, idle**: filled star `★` + count. Highlighted.
5. **Starred, hovered**: filled star lightens slightly. Indicates unstar is available.
6. **Starred, activated**: toggles to not-starred. Count decrements. Same optimistic + revert pattern.

**Star semantics:**
- Stars are **personal** (per-user), not org-level. Two users in the same org can star different Tasksets independently.
- On Public Tasksets: the count is community-wide (total unique users who starred). Clicking increments/decrements the community count.
- On My Team Tasksets: count is the org members who starred it — small number (typically 0–5). Confirm behavior with platform — see §16.

**Accessibility:**
- Star button: `role="button"` or `<button>`, `aria-label="Star OSWorld-Verified"` / `"Unstar OSWorld-Verified"`. Label reflects current action (not current state) to follow action-labeling convention.
- `aria-pressed="true/false"` on the button to communicate toggle state.

---

## Component summary

| Component | Usage in this screen | Notes |
|---|---|---|
| `PageHeader` | Page title + docs icon + `+ New Taskset` CTA | `h1` with inline docs icon (ghost weight `<a>`) and primary button. Same pattern as other index pages. |
| `DocsIcon` | Adjacent to page title in `PageHeader` | Ghost-weight `<a>`, `aria-label="Tasksets documentation, opens in new tab"`, `rel="noopener"`. Tooltip on hover/focus. Deep-links to `/concepts/<primitive>`. |
| `TabBar` | Public / My Team tabs with count chips | `role="tablist"`, controlled tab panel. Count chips on each tab label. |
| `SearchInput` | Filters within active tab | Debounced (300ms). `aria-live` region for result count. Placeholder adapts per tab. Full-width own row on mobile. |
| `ViewToggle` | Grid / List segmented control | 2-segment control. Persists to localStorage. Hidden on mobile. |
| `SortMenu` | Sort dropdown | `role="menu"`, single-select, URL-persisted. Icon-only `[↕]` on tablet + mobile. |
| `GroupByMenu` | Group by dropdown | `role="menu"`, single-select. Options: None / Environment / Owner. Icon-only on tablet + mobile. |
| `OwnerFilter` | Multi-select owner filter chip | Visible in My Team tab when org has 10+ distinct owners. Collapses to icon + count badge on tablet. Moves into mobile bottom sheet on mobile. |
| `MobileFiltersSheet` | Mobile overflow trigger + bottom sheet | `[⚙ Filters ▾]` trigger; bottom sheet contains Sort, Group by, Owner filter. Active badge count. `Done` / background-tap / `Escape` close. |
| `TasksetCard` | Grid view item | Full card with leaderboard rows. Clickable `<a>`. Star button is nested `<button>`. |
| `TasksetRow` | List view item | Compact row, inline leader-only leaderboard (default); hover/expand reveals #2/#3. Tab-conditional meta block. Clickable `<a>`. |
| `GroupHeader` | Collapsible group header in group view | `<button>` with `aria-expanded`. Shows group name + count. Single-line on mobile when label fits; wraps count only if label overflows. |
| `StarButton` | On card + row | Toggle button. Optimistic update. `aria-pressed`. Tap target extends beyond glyph on touch. Semantics differ by tab: community count on Public, personal bookmark on My Team. |
| `LeaderboardPreview` | Inside card + row | Top-3 (grid) or leader-only with hover/expand for #2/#3 (list, all breakpoints). Rank indicator badges. Score columns. No per-cell "Avg" label in list view — column header carries it. |
| `RankBadge` | Inside leaderboard rows | 1/2/3 rank indicator. |
| `VisibilityBadge` | Card footer, list row meta — tab-conditional | **Public tab**: omitted (redundant — every card on this surface is public). **My Team tab**: present. `Public` = highlighted pill; `🔒 Private` = lock icon + text, muted. |
| `EmptyState` | My Team zero, search no-match | Icon + message + action. CLI command in My Team zero state. CTAs stack vertically on mobile. |
| `ErrorState` | Fetch failure | Icon + "Couldn't load Tasksets — try again." + Retry button. Retry stacks below message on mobile if horizontal space is tight. |
| `LoadMore` | Below last row/card when more exist | "Showing N of M · Load more" count + outline button. Full-width button on mobile. Focus moves to first new row after load. |
| `SkeletonRow` / `SkeletonCard` | Loading state | Animated. Shape mirrors populated layout. |

---

## 16. Persona notes by surface decision

| Decision | Alex (PRIMARY) | Sam SMB | Sam DoorDash-scale | Riley (TERTIARY) |
|---|---|---|---|---|
| Default tab logic (My Team if ≥1 Tasksets) | Gets `My Team` once he has team Tasksets; otherwise Public is correct default. | Gets `My Team` immediately — regression Taskset is there. | Gets `My Team` — 120+ Tasksets. | Gets `My Team` — delivery Tasksets are there. |
| List view default | Preferred density — scans more Tasksets per scroll. | Equal — scan-by-name works in list. | Equal — name scan still works, but grouping layer needed. | Equal. |
| Leaderboard preview in default List view (leader-only) | Primary: single `#1 Model — 61%` line answers "how hard is this Taskset?" with zero eye movement. Hover reveals #2/#3 if he wants confirmation. | Secondary: not needed for find-by-name, but the single line is not harmful. | Not primary — finding the right Taskset is the job, not reading scores. | Not relevant for index scan. |
| Starred first sort | Stars the Tasksets he runs against regularly; keeps them at top. | Stars primary 2–3 regression Tasksets. | Useful for top 5–10 anchor Tasksets; grouping + filter are the main navigation at scale. | Stars delivery Tasksets per client. |
| Group by | Rarely used — flat list at 3–15 Tasksets. | Rarely used. | Primary navigation mechanism at 50–150 Tasksets. Group by Environment first. | Group by Owner (per-client) useful at 10–50. |
| Owner filter | Hidden (<10 owners). | Hidden (small team). | Shown (10+ distinct owners). Squad filter: "show me the menu-agent squad's Tasksets." | Shown if 10+ named clients as owners. |
| Load more | Never triggered — under 50. | Rarely triggered. | Triggered on initial My Team load at 127+ Tasksets. | Rarely triggered. |
| "Most tasks" sort option | Finds comprehensive benchmarks; large Tasksets tend to be harder to saturate. | Not his primary path. | Not primary. | Not relevant. |

---

## 17. Open questions (do not block, flag for follow-up)

1. **CLI command for empty state**: The exact CLI command for creating a Taskset is not confirmed from the platform docs. `hud taskset new` is a plausible form consistent with `hud eval`, `hud rl run`, `hud deploy` patterns — but must be verified against `docs.hud.ai/reference/cli` before implementation. Label as TBD in the spec.

2. **Tags on Tasksets**: No screenshots show tag filtering or tag chips on cards. Taskset tags (as a filterable property beyond name search) are not confirmed as a current platform primitive. This wireframe omits tag filtering. If tags are introduced: a `Tags` filter multi-select belongs in the filter row between search and view toggle, and tag chips appear in the card footer.

3. **"My tasksets" sub-filter**: `02a-tasksets-my.png` shows a `My tasksets` chip active in the filter row on the My Team tab. This appears to be a sub-filter showing only Tasksets owned by the current user (as opposed to all Tasksets in the org). The wireframe acknowledges this from the screenshot but does not fully spec the behavior — two open questions: (a) is this a toggle or a filter chip? (b) is "My tasksets" the default state of the My Team tab, or is "all team Tasksets" the default with "My tasksets" as an optional filter? Needs product clarification.

4. **Star count semantics on My Team Tasksets**: The design decision (§4.1) treats `★` on My Team as a personal bookmark with small org-member counts (typically 0–5), demoted in visual weight. The open sub-question is whether the displayed count reflects (a) only the current org's members who starred it, or (b) a global count if the Taskset was forked from a Public one, or (c) no count at all. The wireframe demotes the star regardless of which count is shown — the count display rule itself needs platform verification before implementation.

5. **Leaderboard column header placement in list view**: Confirm whether the sticky column header row in list view should show `Best@3 / Best@5` (they are collapsed in list view — redundant if so) or only `Avg`.

6. **Owner filter threshold**: The threshold of 10 distinct owners before showing the Owner filter is a design assumption. Validate the number — it may be too high (an org with 8 owners still benefits from filtering) or the threshold logic may need to be different (e.g., based on Taskset count rather than owner count).

7. **"Last activity" sort signal**: "Last activity" sort should sort by the most-recent Job run associated with a Taskset, or by the most-recent edit to the Taskset itself? At DoorDash-scale, "last Job run" is more useful ("what did we actually evaluate recently") than "last edit" ("what did someone touch in the UI recently"). Flagging for product clarification.

8. **Group by persistence**: Should the Group by selection persist to the URL (like sort) or only to the session? URL persistence means sharing a URL lands the recipient in the same group view — useful for Sam sharing a filtered view with a teammate. Session persistence is simpler to implement. Recommendation leans toward URL persistence, but flagging for product decision.

9. **Per-group load-more threshold**: When in group view, what is the per-group display limit before a "Load more" within the group appears? 50 per group may be too large — a group with 50 Tasksets defeats the purpose of grouping. Suggest 20 per group as an alternative starting point.

---

## Out of scope

- **Taskset create flow** — Operator is still discovering this. Not in this wireframe; `+ New Taskset` is a link target only.
- **Taskset detail page** — `/tasksets/[slug]`. The detail page shows the full Leaderboard, Task list, Job history, and Grader config. This wireframe ends at card click.
- **QA status badges on index cards** — Riley's QA status is a detail-page concern. No screenshots show it on the index. If added in future, it belongs in the card footer as a badge, gated behind product decision.
- **Fork / import from Public to My Team** — the affordance likely lives on the Taskset detail page, not the index card. Not designed here.
- **Taskset sharing / visibility toggle** — My Team Taskset visibility control (Private → Public publish) lives on the detail page.
- **Bulk selection + bulk actions** — (e.g., "delete 3 Tasksets", "run Job on selected Tasksets") — not in scope for index view at this phase.
- **Tags / filter by Environment type** — see open question §17 item 2.

---

## Drift log

- **List view as default (over grid)**: the production screenshots (`02a-tasksets-my.png`, `02c-tasksets-myteam.png`) show grid view as the apparent production default for My Team. This wireframe specs List as default per the Operator's stated state machine ("Default view = List — Alex's bias"). This is an intentional divergence from the current production state, not an inconsistency.

- **Per-primitive docs icon**: this wireframe preserves the production per-page docs icon. The icon sits immediately right of the page title at ghost visual weight and deep-links to `docs.hud.ai/concepts/tasksets`. The URL pattern is specced as a contract with the docs site (every first-class primitive maps to `/concepts/<primitive>`); the contract must be confirmed before implementation. Full spec in §2.

- **Leaderboard collapsed in list view to leader-only**: grid shows top-3 as confirmed in screenshots. List view showing only the leader (#1 model + Avg score, single line) is a new design decision — not observed in screenshots directly. Rationale: operator feedback identified that the former two-rank stack produced visual stress (redundant "Avg" label per cell, two rows of mixed color treatments per ~200px). Leader-only with hover/expand for #2/#3 preserves the density signal without the color noise. Supersedes the earlier "top-2 in list view" entry.

- **Group by and Owner filter are new controls not in screenshots**: these are new capabilities designed to handle DoorDash-scale volume. No visual reference exists in the production screenshots. Designed from first principles against the persona scale table.

- **Tab-conditional card footer and list row meta**: the former spec used one universal footer (owner + visibility pill + star count) regardless of which tab was active. This revision makes the footer conditional on the active tab. Public-tab cards drop the `Public` pill (redundant when every card on that surface is public) and treat `★` count as a prominent community signal. My Team tab cards restore the visibility pill (now information-bearing — the team view mixes Public and Private) and demote `★` to a personal bookmark. This is a new design decision derived from operator feedback; no production screenshot shows the differentiated treatment.

- **Pagination / load-more not shown in screenshots**: screenshots appear to show a fully-loaded list. The pagination design is derived from scale requirements, not from observed production behavior. Load-more (not infinite scroll) is a design judgment call — flagged for Operator review.

- **Cards forced on mobile (June 2026 revision)**: §12 originally specced list-view as the forced mobile layout. Implementation surfaced the empirical failure mode — list rows' horizontal column grid collapses the identity column to zero width at ~390px viewport, losing the taskset name. Card layout (env-card vertical stack) naturally fits single-column mobile viewports. Spec corrected; engineer applying in parallel.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md). Visual references: operator-supplied screenshots `02a-tasksets-my.png`, `02b-tasksets-public.png`, `02c-tasksets-myteam.png` (Jun 2026), plus operator-supplied images #5, #6, #7 showing list view, card detail with leaderboard, and sort menu. Operator feedback on list-view leaderboard cramping and tab-conditional footer (Jun 2026) informed the leader-only leaderboard spec (§5) and tab-conditional footer spec (§4, §4.1) introduced in this revision. Sibling wireframes: [`app-shell.wireframe.md`](./app-shell.wireframe.md), [`manage.wireframe.md`](./manage.wireframe.md).*
