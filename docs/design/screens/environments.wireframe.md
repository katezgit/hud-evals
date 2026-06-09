# Environments Index — Screen Wireframe (`/environments`)

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome (sidebar, credits widget, user chip). This wireframe covers the `MAIN` region only.
- [`docs/design/screens/tasksets.wireframe.md`](./tasksets.wireframe.md) — structural sister page; chassis is shared.

Visual references: operator-supplied screenshots `03a-environments-public.png`, `03b-environments-private.png` (Jun 2026).

---

## HUD-side question answered

The page must serve three browse loops without friction-switching between them:

1. **Alex's discovery loop** — scan Explore tab for Environments to run RL experiments against or fork as a starting point. Primary scan signals are star count, tri-metric density (scenarios / tools / env vars), and owner credibility.
2. **Sam's find-mine loop** — navigate to My Team tab, find an Environment by name or owner. Knows what he is looking for; search is the fast path.
3. **Riley's author-monitor loop** — My Team tab is his vendor dashboard. His published Environments are his product. He reads community star counts on his public envs (adoption signal), manages a mix of published and WIP private envs, and monitors run activity.

**Explore is a curated public shelf (~20–50 envs), not a sea.** The 2,500+ figure cited on the hud.ai landing page is total environments created across all orgs platform-wide — not the Explore count. Explore is maintained by HUD and selected contributors; its stable size means a flat list works at default, type filter is a secondary refinement (not a primary navigation instrument), and pagination is not needed. Search must be instant.

**My Team is where scale earns progressive disclosure.** Riley (10–50 envs across client contracts) and DoorDash-scale Sam (50–150 envs) hit the threshold where group-by, owner filter, and pagination earn their keep. These controls live on My Team, default ON at scale, OFF at small org size.

The page must also handle the persona weight shift: Riley is CO-PRIMARY here, not tertiary. My Team tab design decisions weigh Riley's vendor-dashboard needs equally with Sam's find-mine needs.

---

## Environment volume by persona

| Surface | Persona | Realistic scope | How they use the index |
|---|---|---|---|
| **Explore** | All personas | ~20–50 globally curated envs (HUD-maintained shelf) | Same set for everyone. Alex scans for forks; Sam browses by name; Riley checks community reference envs. |
| **My Team** | **Alex** | 0–5 private Envs | Occasional; small team. Search by name. |
| **My Team** | **Sam** (SMB) | 5–25 Environments | Goes straight to My Team. Search by name. |
| **My Team** | **Sam** (DoorDash-scale) | 50–150 Environments | Multiple agent surfaces × env types. Group by type + owner filter for navigation. Progressive disclosure earns its keep. |
| **My Team** | **Riley** (RL Env Vendor — CO-PRIMARY here) | 10–50 Environments across client contracts | My Team is his work dashboard: star counts on his public envs = community adoption. Mix of published, private WIP, and client-scoped envs. Group-by Owner is useful for per-client organization. |

**Scale rationale.** The 2,500+ stat on hud.ai refers to total environments created across all orgs platform-wide — not what lives on the Explore tab. Explore is a curated shelf of ~20–50 envs maintained by HUD; a flat list renders comfortably. My Team is where org-scale variance (5 to 150) drives progressive disclosure: group-by defaults ON at DoorDash-scale, OFF at small orgs; owner filter appears at 10+ distinct owners; pagination triggers at high counts. This is the inversion of the initial design assumption — Explore does not need gallery-scale controls.

---

## 1. Shared layout note

The `MAIN` region is the content area to the right of AppShell's persistent sidebar. This wireframe does not redraw the sidebar, credits widget, or user chip — those are fully specified in `app-shell.wireframe.md`.

```
┌─────────────────────┬─────────────────────────────────────────────────────────┐
│  SIDEBAR (AppShell) │  MAIN                                                   │
│  [see app-shell     │                                                         │
│   wireframe.md]     │  [ENVIRONMENTS INDEX CONTENT — this file]               │
│                     │                                                         │
└─────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Page header anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER  (sticky — see §2 scroll behavior)                                  │
│                                                                                  │
│  ┌────────────────────────────────────────────┐  ┌───────────────────────────┐   │
│  │  Environments  [?]                         │  │  + New Environment        │   │
│  │  (h1 / page title)  (docs icon)            │  │  (primary button)         │   │
│  └────────────────────────────────────────────┘  └───────────────────────────┘   │
│                                                                                  │
│  ┌───────────────────────────────────────┐                                        │
│  │  301 runs in last 24h · 0 active now  │                                        │
│  │  (activity bar — always visible)      │                                        │
│  └───────────────────────────────────────┘                                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- "Environments" is the h1 / page title. Platform-canonical noun — never "Sandboxes", "Envs" (UI label).
- `[?]` docs icon immediately right of title — same ghost-weight `<a>` pattern as Tasksets page. `aria-label="Environments documentation, opens in new tab"`. Deep-links to `docs.hud.ai/concepts/environments`.
- `+ New Environment` is top-right, primary button. The `+` prefix is standard HUD convention. Links to the Environment create flow (out of scope for this wireframe).

**Activity bar:**
- Sits below the h1 row, left-aligned in the header region.
- Live-updating counters: `301 runs in last 24h · 0 active now`.
  - "runs in last 24h" = total Run executions across all Environments on the Explore tab in the last 24 hours. Global signal, not per-user or per-org. Communicates platform activity.
  - "active now" = count of currently running Environment sessions (live). Relevant for Riley who is monitoring concurrent delivery runs and for Alex who wants to know if a popular env is saturated.
- **Zero state**: when both counts are zero: `No activity in the last 24h`. Single phrase, same visual weight, no special treatment. "0 active now" alone (with non-zero 24h count) is still displayed numerically: `12 runs in last 24h · 0 active now`.
- **Placement rationale**: activity bar is below the title row, not inline with the `+ New Environment` button. At desktop widths, placing it beside the title row would compete with the page-level CTA. Below-title preserves scannability: title → live pulse → main content.
- **Tab scope**: activity bar data is always global (not scoped to active tab). The same numbers show on both Explore and My Team. This is intentional — it communicates platform-wide environment health, not user-scoped activity.
- **Responsive**: on mobile, activity bar wraps to a single line below the title. Count is not truncated.

**Scroll behavior — sticky page header:**
- The full page header (title + docs icon + `+ New Environment` + activity bar) stays pinned to the top of the content area as the list scrolls.
- Rationale: keeping the create CTA and the live activity bar reachable avoids a scroll-back-to-top, especially on My Team at vendor/enterprise scale where lists are long. The activity bar is ambient — if it scrolled away, the user would lose the "active now" signal they may be watching.
- Subtle visual separator (bottom border or shadow) at the lower edge of the sticky region separates pinned header from scrolling content.

**Credit-exhausted banner:**
- When the org has zero credits, a billing warning banner appears **above the page header** (or between the sticky header and the tab row — see open question §15 item 8). Copy: `"Your team has no credits remaining. Purchase credits or contact your team owner."`
- The `+ New Environment` button remains rendered but is disabled (greyed + `aria-disabled="true"`) when credits are exhausted. Tooltip on hover/focus: `"Add credits to create Environments."` (Not hidden — visibility is the convention per app-shell.wireframe.md's role-gating principle: visible, not hidden.)
- This banner is a reference-level callout; the billing flow itself is out of scope.

---

## 3. Tab + filter row anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TAB + FILTER ROW                                                                │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐     │
│  │  TAB BAR  (sticky, below page header)                                   │     │
│  │                                                                         │     │
│  │  [Explore  42]  [My Team  3]                                            │     │
│  │  ← tab underline variant; active tab underlined; count chip muted       │     │
│  └─────────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Filter row  (below tabs, full width, horizontally arranged, scrolls with content)│
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐               │
│  │  [🔍]  Search Environments…                                  │               │
│  │  (search input, expands to fill available space)              │               │
│  └──────────────────────────────────────────────────────────────┘               │
│                                                                                  │
│  [All types ▾]   ← type filter — secondary refinement; available on Explore     │
│  Multi-select dropdown, opens type-filter menu (see §3a)                        │
│  EXPLORE TAB ONLY (available on demand); MY TEAM TAB: shown when 2+ types in org│
│                                                                                  │
│  [⊞ Grid]  [☰ List ✓]     ← view toggle, right of type filter                  │
│  Segmented control, 2 items  (List = default, persists in localStorage)          │
│                                                                                  │
│  [↕ Starred first ▾]   ← sort button                                            │
│  Outline button, opens sort menu (see §7)                                        │
│                                                                                  │
│  [Group by None ▾]   ← group control                                            │
│  Outline button, opens group menu (see §8)                                       │
│  DEFAULT = "None" on Explore (curated shelf — flat list works); "Type" or        │
│  "Owner" on My Team at DoorDash-scale (50+ envs — scale justifies ON)           │
│                                                                                  │
│  MY TEAM TAB ONLY — shown when org has 10+ distinct owners:                      │
│  [Owner: Anyone ▾]   ← owner filter, leftmost of right-side controls            │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

**Tab naming — "Explore" not "Public":**
- Production screenshots show `Explore` as the tab label, distinct from Tasksets' `Public`. Preserve "Explore" — it communicates discovery intent (Alex scanning for envs to fork) rather than a visibility state.
- Tab counts: `Explore 42 · My Team 3` in the tab label area. Count is live. Format: integer after the tab label, rendered smaller and muted.

**Tab default logic:** `My Team` is the default active tab when the user has ≥1 team Environments; `Explore` is the default when they have zero. Same logic as Tasksets. Riley always has team Environments — he always lands on My Team, his vendor dashboard.

**Search scope:** filters within the active tab only. Placeholder adapts: "Search public Environments…" on Explore tab, "Search team Environments…" on My Team tab.

**Type filter — secondary refinement:**
- Label: `All types ▾` when no filter is active. Updates to `Browser · Code/SWE ▾` (truncated if multiple) when active.
- Multi-select. Selecting a type narrows the list to Environments of that type.
- Type taxonomy (from platform primitives and common environment categories): `Browser`, `Code / SWE`, `OS / Desktop`, `Domain-specific`, `Custom`. Open question §15 item 1 — confirm the canonical type list against `docs.hud.ai`.
- **Explore tab**: present in the filter row but at the same visual weight as Sort and Group-by — not bolder, not always-active-looking. At ~20–50 curated envs, the type filter is a useful refinement but not a mandatory navigation instrument; users can scan the flat list without it.
- **My Team tab**: shown only when the org has Environments of 2 or more types. For a team that only uses `Browser` Environments, the filter adds no value — omit.
- **Position**: type filter sits after the search input, before the view toggle. Same position as before, but visual weight matches other secondary controls.

**Scroll behavior — sticky tab bar:**
- The tab bar (`[Explore 42] [My Team 3]`) stays pinned just below the sticky page header as the list scrolls.
- The filter row (search, type filter, view toggle, sort, group by, owner filter) scrolls away with the content. Same rationale as Tasksets: pinning the full filter row consumes too much vertical space. The tab-level sticky is sufficient to keep context.

**View toggle:** `Grid | List`. List is default — density preference consistent with Tasksets. Toggle persists to localStorage.

**Sort button:** shows current sort label inline. See §7 for sort options. Default: "Starred first".

**Group by control:** defaults to `None` on Explore (curated ~20–50 shelf — flat list is the right starting point). On My Team, default is `None` for small orgs (Alex, SMB Sam); defaults to `Type` or `Owner` for DoorDash-scale (50+ envs) where grouping earns its keep. The Group-by button renders as active/tinted only when a non-None grouping is applied.

**Owner filter:** same threshold logic as Tasksets — appears in My Team tab when org has 10+ distinct owners.

### 3a. Type filter menu

```
┌──────────────────────────────────┐
│  TYPE FILTER                     │
│                                  │
│  [□] All types  (clear all)      │
│  ─────────────────────────────   │
│  [✓] Browser                     │  ← checked = active filter
│  [□] Code / SWE                  │
│  [□] OS / Desktop                │
│  [□] Domain-specific             │
│  [□] Custom                      │
│                                  │
└──────────────────────────────────┘
```

- Multi-select. Checking multiple types shows Environments matching any of the selected types (OR logic).
- "All types" at the top acts as a clear-all toggle — checking it when any types are selected clears the selection and restores the unfiltered view.
- Active filter count shown on the filter button: `Browser · 1 type ▾` or `2 types ▾`.
- Keyboard: `Space` toggles a focused item; `Escape` closes without applying changes (but changes are applied immediately on check — see open question §15 item 2).

---

## 4. Grid card anatomy (view = Grid)

Grid layout: 3-column at desktop, 2-column at tablet, 1-column at mobile. Each card is equal height within a row.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  GRID CARD  — one card                                                           │
│  clickable region (entire card)  → navigates to /environments/[slug]             │
│                                                                                  │
│  ── CARD HEADER ──────────────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  [ENV TYPE ICON]  trace-explorer                    ☆  3                  │ │
│  │  (type icon, small)  (env name, prominent)          (star + count)         │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ── DESCRIPTION ──────────────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  This is a hud implementation of                                           │ │
│  │  https://www.browserbase.com/                                               │ │
│  │  ↑ URL linkified: distinct style, opens new tab, click ≠ card nav          │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ── NO DESCRIPTION STATE ─────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  No description                                                             │ │
│  │  (italic, muted — not empty, not an error state)                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ── CARD FOOTER ───────────────────────────────────────────────────────────── │  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  [📋] 6 scenarios  [🔧] 13 tools  [{ }] 4 env vars                        │ │
│  │  (tri-metric strip — icon + count + label per segment, · separator)        │ │
│  │                                                                             │ │
│  │  HUD                              ●  ●                                     │ │
│  │  (owner name, quiet text)         (status dots — see §4.1)                 │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Card anatomy — field-by-field:**

| Field | Source | Notes |
|---|---|---|
| Environment type icon | `03a-environments-public.png` — small icon left of env name | Represents the environment type (Browser, Code/SWE, etc.). Decorative; label is the primary affordance. |
| Environment name | Both screenshots | Prominent, single-line. Truncates with ellipsis if too long. |
| Star icon + count | Both screenshots — `☆ 3` visible, `☆ 0` on some cards | Interactive toggle. Semantics differ by tab — see §4.1. |
| Description | `03a-environments-public.png` — text body with embedded URL | 2–3 lines max, truncated with ellipsis. URL is linkified (see §4.2). "No description" fallback (see §4.3). |
| Tri-metric strip | `03a-environments-public.png` — "6 scenarios · 13 tools · 4 env vars" | Icon + count + label per segment. Three segments, fixed-width per card. See §4.4. |
| Owner name | Both screenshots — org name (HUD, kv) | Tab-conditional display treatment — see §4.5. |
| Status dots | `03b-environments-private.png` — `kv · ● ●` on trading-rl-env | 1–2 dots. Semantic TBD — see §4.6 and open question §15 item 3. |

### 4.1 Tab-conditional card treatment

**Explore tab — Alex/Sam discovery loop ("is this Environment usable and trustworthy?"):**
- `★ 3` star count = community popularity. KEEP prominent. High counts signal community validation.
- `Public` pill = REDUNDANT — every card on Explore is public by definition. REMOVE. Reduces visual noise without losing information.
- Owner org name = credibility cue. KEEP as quiet text. "HUD", "kv", "Anthropic Research" signal legitimacy.
- Status dots: shown (carry info about the env's operational status).

**My Team tab — Riley's vendor dashboard + Sam's find-mine:**
- Star count semantics split by env visibility:
  - **Public env** (Riley's published deliverable): star count = community-wide adoption signal. Riley wants to see how many people in the community have starred his env. Keep it PROMINENT — it is his commercial signal.
  - **Private env** (WIP or client-scoped): star count = team member bookmark count (typically 0–5). DEMOTE to icon + small count (same visual as My Team Tasksets).
- `Public` / `Private` pill: KEEP on My Team — the team view mixes both states, and the pill is information-bearing.
- Owner: full prominence on My Team (navigation key at Riley-vendor-scale and at DoorDash-scale).
- Status dots: KEEP on My Team (operational monitoring).

### 4.2 URL-in-description pattern

URLs in description text (e.g., `https://www.browserbase.com/`) receive a distinct visual treatment:

- **Linkified**: rendered as a clickable hyperlink within the description text block.
- **Visually distinct from body text**: different color (link color vs body color — token-phase decision). Underline on hover.
- **External-link behavior**: opens in a new tab (`target="_blank" rel="noopener"`).
- **Click propagation**: clicking the URL link does NOT trigger card-click navigation. The URL link's click handler calls `event.stopPropagation()`. This is the explicit callout from the operator — the URL is a sub-action on the card, not a card navigation trigger.
- **Keyboard**: the URL link is reachable by `Tab` separately from the card's `<a>` wrapper. Screen readers announce it as a link separate from the card link.
- **Hover affordance**: standard browser cursor change to pointer on the URL. No additional affordance needed beyond link color + cursor.
- **Long URLs**: truncate with ellipsis if the URL exceeds the card width, with the full URL in a `title` attribute tooltip.

### 4.3 No-description state

When an Environment has no description set:
- Show `No description` in the description slot.
- Italic style, muted color weight (token-phase decision).
- Not an error state — this is an expected content state. No icon, no CTA.
- The card maintains its structural height; the description slot is not collapsed even when showing the placeholder.

### 4.4 Tri-metric strip

Three-segment metric strip in the card footer:

```
[📋] 6 scenarios  ·  [🔧] 13 tools  ·  [{ }] 4 env vars
```

- **Segments**: scenarios count · tools count · env vars count.
- **Icon glyph per segment** (placeholder glyphs — final glyph is design-tokens phase):
  - Scenarios: clipboard / checklist icon (signals "tasks / checks")
  - Tools: wrench / tool icon (signals "callable functions")
  - Env vars: code-brackets / `{ }` icon (signals "configuration / code")
- **Separator**: centered dot `·` between segments. Visual only — not an interactive element.
- **Label text**: `scenarios`, `tools`, `env vars` (lowercase, abbreviated form). Full label, not a tooltip. Alex reads raw counts + labels inline.
- **Zero values**: `0 scenarios`, `0 tools`, `0 env vars` — always rendered. Zero is information (an env with 0 tools is not runnable without external tooling). Zero values render in muted weight to visually distinguish from non-zero counts.
- **Wrapping behavior at narrow widths**: on tablet and mobile grid cards, the strip may not fit on one line. Wrap behavior: segments wrap to a second line as a unit (`scenarios` + count + separator stay together; the second line starts at the next segment). Do not truncate a segment mid-label.
- **List row adaptation**: in list view, the tri-metric strip compresses to three icon + count pairs without labels (tooltips carry the label for a11y). See §5.

### 4.5 Owner name display

- Explore tab: quiet text, same muted weight as Tasksets. No org badge / avatar — just the text name. Example: `HUD`, `kv`.
- My Team tab: higher prominence, same as Tasksets My Team treatment — navigation key at vendor and enterprise scale.

### 4.6 Owner + status dots

**Observed pattern** (from `03b-environments-private.png` — `kv · ● ●` on trading-rl-env):

```
kv  ●  ●
```

- Owner name followed by 1 or 2 filled dots.
- Some cards show one dot; `trading-rl-env` shows two dots.

**Inferred dot semantics** (derived from screenshot observation; flagged as OPEN QUESTION §15 item 3):

- **First dot (always present when env is Private)**: visibility state. Filled dot = Private. Consistent with the `Private` pill on My Team tab — the dot is the compact indicator.
- **Second dot (present only on some cards)**: health or activity state. Candidates: (a) currently active / running sessions, (b) passing health check, (c) some form of deployment / live status. The fact that only some Private envs show the second dot suggests it is conditional on a runtime state, not a static attribute.

**Dot rendering:**
- Each dot is a small filled circle.
- Dot colors are token-phase decisions. The wireframe specifies semantics only: dot 1 = visibility, dot 2 = health/activity (TBD).
- The two-dot layout must accommodate both 1-dot and 2-dot cases without layout shift: render the owner name + dot slot as a fixed right-aligned block, empty dot position is reserved space.

**Tab-conditional dot treatment:**
- Explore tab: status dots shown. Even if "Public" pill is removed, the dot(s) carry operational health information that is relevant to Alex deciding whether to fork or use the env.
- My Team tab: status dots shown. Operational health is primary information for Riley monitoring his deployed envs.

---

## 5. List row anatomy (view = List)

List layout: single-column vertical stack. Denser than grid — the default view. Each row is a full-width clickable region navigating to `/environments/[slug]`.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  LIST ROW  — one row                                                             │
│  clickable region → /environments/[slug]                                         │
│                                                                                  │
│  ┌──────────────┐  ┌──────────────────────────────┐  ┌────────────────────────┐  │
│  │ IDENTITY     │  │ DESCRIPTION (truncated)       │  │ META                   │  │
│  │              │  │                               │  │                        │  │
│  │ [type icon]  │  │  This is a hud impl of        │  │ [📋] 6  [🔧] 13  [{] 4 │  │
│  │ Name         │  │  https://brow…  (linkified)   │  │ (tri-metric compressed)│  │
│  │ ☆  3         │  │                               │  │ HUD  ●  ●              │  │
│  │              │  │  No description (italic,muted)│  │ (owner + dots)         │  │
│  └──────────────┘  └──────────────────────────────┘  └────────────────────────┘  │
│                                                                                  │
│  proportions:  [identity ~25%]  [description ~45%]  [meta ~30%]                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**List row — field-by-field:**

| Field | Notes |
|---|---|
| Identity block | Type icon + Environment name + star toggle + star count. Same as grid header. Slightly smaller type for density. |
| Description (truncated) | Single-line truncated description with ellipsis. URL is linkified and clickable — same propagation-stop rule as grid card. "No description" fallback in italic muted. |
| Meta block | Tri-metric compressed (icon + count, no labels — tooltips carry labels) + owner name + status dots. Tab-conditional treatment (§4.5, §4.6). |

**Tab-conditional meta in list view:** same rules as §4.1 and §4.5 apply.

**No URL in description slot for list row truncation:** if the description is only a URL and it gets truncated, the truncated ellipsis still renders as a linkified fragment (e.g., `https://www.browser…`). The full URL is in the tooltip on hover. Click on the truncated link opens the full URL in a new tab — does NOT trigger card navigation.

---

## 6. Column header row (List view only)

The list view renders a sticky column header row above the rows so the user knows what the columns are when scrolling.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  COLUMN HEADERS  (sticky at top of list, below filter row)                       │
│                                                                                  │
│  Environment              Description             Scenarios  Tools  Env vars     │
│  (muted, small)           (muted, small)          (right-aligned, muted)         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Column headers for the list view. Grid view has no column header row — each card is self-contained.

---

## 7. Sort menu

Triggered by the `[↕ Starred first ▾]` button in the filter row.

```
┌─────────────────────────┐
│  SORT MENU              │
│                         │
│  ✓  Starred first        │  ← active = checkmark
│     Newest first         │
│     Oldest first         │
│     Last activity        │  ← sorts by most-recent Run on the Environment
│     Name (A–Z)           │
│     Name (Z–A)           │
│     Most scenarios       │  ← Alex: comprehensive envs have more scenarios
│     Most tools           │
│                         │
└─────────────────────────┘
```

**Annotations:**
- Single-select. Selected option persists in URL query param (`?sort=starred-first`).
- Button label updates to reflect active selection.
- "Most scenarios" and "Most tools" are new options vs Tasksets — they replace "Most tasks" as the quality-density signal for Environments.
- "Last activity" sorts by most-recent Run execution against the Environment (same principle as Tasksets "Last activity" — see open question §15 item 4).
- Keyboard: `Enter` / `Space` selects and closes; `Escape` closes without selecting; arrow keys navigate items.

---

## 8. Group by menu and group view

Triggered by `[Group by None ▾]` (default label when no grouping is active). Default state per tab:

- **Explore**: `None` — curated shelf of ~20–50 envs renders well as a flat list.
- **My Team (small org)**: `None` — flat list is sufficient at Alex / SMB-Sam scale.
- **My Team (DoorDash-scale, 50+ envs)**: `Type` or `Owner` — default ON; grouping is the right starting state at vendor/enterprise scale.

```
┌─────────────────────────┐
│  GROUP BY               │
│                         │
│  ✓  None                 │  ← default on Explore and small My Team
│     Type                │  ← default on DoorDash-scale My Team
│     Owner               │
│                         │
└─────────────────────────┘
```

**Group view behavior** (when Group by ≠ None):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  GROUP HEADER — collapsible                                                      │
│                                                                                  │
│  ▼  Browser  (12)        ← type name + Environment count in group               │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  [LIST ROWS or GRID CARDS for Environments in this group]                        │
│                                                                                  │
│  ▼  Code / SWE  (8)                                                              │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  [LIST ROWS or GRID CARDS ...]                                                   │
│                                                                                  │
│  ▶  OS / Desktop  (3)     ← collapsed group                                     │
│                                                                                  │
│  ▶  Domain-specific  (47)                                                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Collapsible group headers. Toggle icon: `▼` expanded, `▶` collapsed. Collapsed state persists in session (not URL).
- Group count shows the number of Environments in that group (respects active type filter + search + owner filter).
- When type filter is active on Explore and Group by = Type: the type filter applies across all groups — if only "Browser" is selected, the "Browser" group shows all its matches, other groups collapse to zero items (automatically hidden).
- Group by `Owner` groups by org name. Useful for Riley (per-client env grouping) and DoorDash-scale Sam.
- **Interaction between type filter and group by type**: when both are set, the type filter narrows first, then grouping applies within the remaining results. If a type is excluded by the filter, its group header is not rendered.

---

## 9. Star toggle — zero-state treatment

The star icon appears in the card header (grid) and in the identity block (list). It is an inline interactive control — it does not navigate, just toggles state.

**Star zero-state (explicitly called out by operator):**

```
☆  0
```

- Outline star (not filled) + count `0`.
- Muted visual weight — clearly not a CTA, not an error state. It is a status display.
- Distinct from non-zero count `☆ 3` (same outline + muted, but the count number carries more visual weight when non-zero — muted at `0`, normal weight at `> 0`).
- Absent is not a valid state — stars always render. An env always has a star count (possibly zero).

**Full state machine:**
1. **Not starred, idle, zero count**: outline star `☆` + count `0`. Muted.
2. **Not starred, idle, non-zero count**: outline star `☆` + count (muted star, readable count).
3. **Not starred, hovered**: outline star fills partially (reduced opacity silhouette).
4. **Not starred, activated**: optimistic toggle to starred. Star fills. Count increments by 1.
5. **Starred, idle**: filled star `★` + count. Highlighted.
6. **Starred, hovered**: filled star lightens slightly.
7. **Starred, activated**: toggles to not-starred. Count decrements. Optimistic + revert on failure.

**Star semantics by tab:**
- Explore tab: community-wide star count. Clicking increments/decrements the community count.
- My Team tab (public env): community-wide star count — Riley's adoption signal. Same prominence as Explore.
- My Team tab (private env): team-member bookmark count. Demoted visual weight. Typically 0–5.

**Accessibility:** `<button aria-label="Star trace-explorer" aria-pressed="false">`. Label reflects current action; `aria-pressed` reflects state.

---

## 10. Pagination / load-more behavior

Pagination behavior differs by tab.

### Explore tab — no pagination needed

Explore is a curated shelf of ~20–50 envs. The full set renders on first load. No "Showing N of M · Load more" affordance is shown. If the Explore set ever grows significantly, revisit — but at current curated scale it is unnecessary and adds visual noise.

### My Team tab — pagination applies at scale

My Team paginates when org env count exceeds a reasonable page size. Default page size: 50. Triggers for: Riley's larger orgs (50+ envs), DoorDash-scale Sam (50–150 envs).

**Load-more affordance**: explicit "Load more" button below the last row/card, not infinite scroll. Same rationale as Tasksets.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [last row / card]                                                               │
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  Showing 50 of 127  ·  [Load more]                                               │
│  (muted count label)    (outline button)                                         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Behavior rules:** same as Tasksets §9. Count reflects active type filter + search + group state. Appends below. No full-page reload. Per-group load-more in group view when Group by is active.

---

## 11. Error state (network / fetch failure)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  ERROR STATE  (list / grid content area, below filter row)                       │
│                                                                                  │
│  [tabs, search, type filter, sort, group controls remain accessible]             │
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  [alert icon]                                                                    │
│                                                                                  │
│  Couldn't load Environments — try again.                                         │
│  (prominent, centered)                                                           │
│                                                                                  │
│  [Retry]                                                                         │
│  (primary button)                                                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Replaces only the list/grid content area. Page header, activity bar, tab bar, search, type filter, sort, and group by all remain rendered and interactive as recovery actions. Error copy: direct, no apology. "Couldn't load Environments — try again."

---

## 12. Empty states

### 12a. My Team tab — zero Environments

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE  (My Team tab, zero team Environments)                              │
│  centered in the content area below the filter row                               │
│                                                                                  │
│  [Environment icon]                                                              │
│                                                                                  │
│  Create your first Environment                                                   │
│  (prominent)                                                                     │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────┐                     │
│  │  hud env new                                            │  [⎘]               │
│  │  (monospace, copyable CLI command)                      │                    │
│  └────────────────────────────────────────────────────────┘                     │
│                                                                                  │
│  [+ New Environment]                                                             │
│  (primary button)                                                                │
│                                                                                  │
│  Read the docs ↗                                                                 │
│  (tertiary text link, opens in new tab)                                          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Heading: directive ("Create your first Environment"), not declarative. `Environment` is the proper product noun.
- CLI command `hud env new` is TBD — exact command not confirmed in platform docs. Mark as TBD in implementation. Pattern follows personality principle: empty states show the CLI command.
- `+ New Environment` duplicates the page header CTA — intentional.
- "Read the docs ↗" — tertiary text link, opens in new tab. Same pattern as Tasksets empty state.
- No illustration, no marketing copy. Spare + Earnest.

### 12b. Explore tab — no type-filter matches

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE  (type filter active, zero matches in Explore)                      │
│  centered in the content area                                                    │
│                                                                                  │
│  No Environments match the selected types.                                       │
│  (prominent, centered)                                                           │
│                                                                                  │
│  [Clear type filter]                                                             │
│  (outline button)                                                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 12c. Search — no matches

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE  (search query has no matches in the active tab)                    │
│  centered in the content area                                                    │
│                                                                                  │
│  No Environments match "trading-rl-env"                                          │
│  (prominent, query echoed verbatim in quotes)                                    │
│                                                                                  │
│  [Clear search]                                                                  │
│  (outline button)                                                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Query echoed verbatim. "Clear search" clears input, resets to unfiltered list within current tab. Does NOT clear the active type filter.

---

## 13. Responsive behavior

### Desktop — full layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  [Environments] [?]                               [+ New Environment]           │
│  301 runs in last 24h · 0 active now                                            │
│                                                                                 │
│  [Explore 42]  [My Team 3]                                                      │
│  [Search…]  [All types ▾]  [Grid | List ✓]  [↕ Sort ▾]  [Group by None ▾]     │
│  (My Team + DoorDash-scale also shows: [Owner: Anyone ▾])                       │
│                                                                                 │
│  FLAT LIST (Explore default — no group-by):                                     │
│  ┌────────────────────────┬──────────────────────────────┬──────────────────┐  │
│  │ trace-explorer ☆ 3     │  This is a hud impl of        │ [📋]6 [🔧]13 [{]4│  │
│  │                        │  https://browserbase.com/     │ HUD  ●  ●       │  │
│  │ browserbase ☆ 1        │  No description               │ [📋]0 [🔧]3 [{]1│  │
│  └────────────────────────┴──────────────────────────────┴──────────────────┘  │
│  (no pagination — full curated set rendered)                                    │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet — adaptations

- Sidebar collapses to icon rail (see app-shell.wireframe.md §5).
- Grid view: 2 columns (from 3 at desktop).
- List view: unchanged.
- **Description column in list rows**: truncates earlier (fewer characters) at tablet card width. No wrapping.
- **Activity bar**: wraps to second line if needed; never truncates the numbers.
- **Sort button**: label truncates to icon only `[↕]` with tooltip.
- **Group by button**: label truncates to icon only with tooltip.
- **Type filter**: shows `Types ▾` when the full "All types ▾" label doesn't fit; active state shows count badge: `Types: 2 ▾`.
- **Owner filter**: collapses to icon + count badge.
- **Error state**: fills content area, same as desktop but narrower.

### Mobile

- Sidebar hides; top bar appears (see app-shell.wireframe.md §5).
- View toggle hidden — list view is forced.
- `+ New Environment` collapses to `+` icon-only button with `aria-label="New Environment"` in the page header.
- **Activity bar on mobile**: single full-width row below the title. Both numbers are always shown — no truncation.
- **Filter row on mobile**:
  - Search input takes own full-width row below the tabs.
  - View toggle hidden (list forced).
  - Type filter, Sort, Group by, and Owner filter collapse into a single `[⚙ Filters ▾]` overflow trigger. Badge on trigger shows count of active non-default controls.
  - Tapping `[⚙ Filters ▾]` opens a mobile bottom sheet.
- **List row on mobile**: description column is hidden (recoverable from detail page). Identity + meta visible.
- Footer meta in list rows collapses to tri-metric icons only (no text labels). Owner name hidden on Explore. Owner name visible on My Team. Status dots visible on both.

```
┌─────────────────────────────────────────────┐
│  [Environments] [?]                     [+]  │  ← docs icon + icon-only CTA
│  301 runs in last 24h · 0 active now         │
│                                              │
│  [Explore 42]  [My Team 3]                   │
│  ──────────────────────────────────────────  │
│  [Search Environments…          ]            │  ← full-width search
│  [⚙ Filters ▾]  (badge if active)           │  ← type + sort + group + owner
│                                              │
│  trace-explorer ☆ 3                          │  ← flat list (no group headers
│  [📋]6 [🔧]13 [{]4  ●  ●                    │    on Explore by default)
│  ────────────────────────────────────────    │
│  browserbase ☆ 1                             │
│  [📋]0 [🔧]3 [{]1                           │
│  ────────────────────────────────────────    │
│  (no load-more on Explore — full set shown)  │
└─────────────────────────────────────────────┘
```

#### Mobile bottom sheet — `[⚙ Filters]`

```
┌─────────────────────────────────────────────┐
│  ────  (drag handle)                         │
│                                              │
│  Type                                        │
│  [□] All  [□] Browser  [□] Code/SWE         │
│  [□] OS/Desktop  [□] Domain  [□] Custom      │
│                                              │
│  Sort                                        │
│  ● Starred first  ○ Newest  ○ Last activity  │
│  ○ Most scenarios  ○ Most tools  ○ Name A–Z  │
│                                              │
│  Group by                                   │
│  ● None  ○ Type  ○ Owner                    │  ← Explore default = None
│                                              │
│  Owner  (My Team + 10+ owners only)          │
│  [multi-select list]                         │
│                                              │
│  [           Done           ]                │
│                                              │
└─────────────────────────────────────────────┘
```

Bottom sheet behavior: same as Tasksets §12 mobile bottom sheet.

**Mobile sticky behavior:** Page header + activity bar + tab bar pinned to top. Filter row scrolls. Bottom sheet accessed from filter row trigger.

---

## 14. Keyboard and accessibility

**Page landmark structure:**
- `<main id="main-content">` wraps the entire Environments index MAIN region.
- Page header: `<h1>Environments</h1>`.
- Activity bar: adjacent to h1. Live count region: `aria-live="polite"` for the "active now" counter (updates as run sessions start/end). The "runs in last 24h" count does not need `aria-live` (not real-time enough to announce every update).
- Tab bar: `role="tablist"`, each tab is `role="tab"`, `aria-selected="true/false"`, `aria-controls="[tabpanel-id]"`. Card/list grid is `role="tabpanel"`.
- Each Environment card or list row is a `<a>` linking to `/environments/[slug]`. Star button and URL links inside are `<button>` and `<a>` respectively, each calling `event.stopPropagation()` to prevent card-click navigation.

**Type filter menu:**
- `aria-haspopup="listbox"` on the type filter trigger. `aria-expanded` reflects open state.
- Menu: `role="listbox"` with `aria-multiselectable="true"`. Each option: `role="option"`, `aria-selected`.
- "All types" option: `aria-label="All types, clear filter"`.

**Tab navigation:**
- `Tab` cycles through: "Explore" tab, "My Team" tab, search input, type filter, view toggle, sort button, group by button, owner filter (when visible), then into cards/rows.
- Arrow keys (`←` / `→`) navigate between tabs within the tab bar.

**Card/row focus:**
- Each card (grid) or row (list) is individually focusable as the `<a>` wrapper.
- `Enter` navigates to the Environment detail page.
- URL link within description: separately focusable via `Tab`. `Enter` opens in new tab.
- Star button: separately focusable via `Tab` when card is focused.

**Search input:**
- `aria-label="Search Environments"`. `aria-live="polite"` region announces result count after debounce: `"12 Environments found"`.

**Activity bar:**
- `aria-live="polite"` on the "X active now" counter for live-update announcements. Not announced on every tick — debounced to reasonable intervals (engineering decision).

**Group headers:**
- `<button>` with `aria-expanded="true/false"` controlling the group's content region. `aria-label="Browser, 12 Environments, expanded"`.

**Docs icon:**
- `<a aria-label="Environments documentation, opens in new tab" rel="noopener">`.

**Load more button:**
- `aria-label="Load more Environments"`. After loading, focus moves to the first newly-loaded row.

**Loading state:**
- Skeleton rows/cards replace content during data fetch. `aria-busy="true"` on the tabpanel. Off-screen `aria-live` region announces "Loading".

**Reduced motion:**
- Card hover, star fill, menu open/close, group expand/collapse all defer to `prefers-reduced-motion`. Motion timing is motion-designer's layer.

---

## 15. Loading state (skeleton)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SKELETON — list view  (same layout as populated list)                           │
│                                                                                  │
│  Column mapping:  [identity ~25%]  [description ~45%]  [meta ~30%]              │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  [░░░░░░░░░░░░]  [░░░░░░░░░░░░░░░░░░░░░░░░░░]  [░░░] [░░░] [░░░] [░░░]  │   │
│  │  [░░░░░░░░░░]                                                             │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │  [░░░░░░░░░░░]   [░░░░░░░░░░░░░░░░░░░░░░░]      [░░░] [░░░] [░░░] [░░░] │   │
│  │  [░░░░░░░░]                                                               │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │  [░░░░░░░░░░░░░] [░░░░░░░░░░░░░░░░░░░░░░░░░]    [░░░] [░░░] [░░░] [░░░] │   │
│  │  [░░░░░░░░░░░]                                                             │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  8 rows of skeleton                                                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Skeleton shape rules:**
- **Identity column**: 2 bars (name bar + star/count bar). Same as Tasksets.
- **Description column**: 1 bar (single-line truncated description in list view). No URL preview in skeleton.
- **Meta column**: 4 short bars (tri-metric has 3 segments + owner/dots row = 4 total hints). Arranged in two rows to mirror the populated meta block.
- **Activity bar skeleton**: 1 bar replacing the "301 runs in last 24h · 0 active now" line. Shown during initial page load before the live data arrives.
- **Group header skeleton**: when group-by is enabled, skeleton group headers (`▼ ░░░░░░░░░ (░░)`) appear above each row cluster. 3–4 skeleton groups visible.

No spinner — skeleton prevents layout shift and communicates content shape.

---

## Component summary

| Component | Usage in this screen | Notes |
|---|---|---|
| `PageHeader` | Page title + docs icon + `+ New Environment` CTA | `h1` with inline docs icon (ghost weight `<a>`) and primary button. Sticky. |
| `ActivityBar` | Live `301 runs in last 24h · 0 active now` | NEW — not in Tasksets. Adjacent to page header, always visible. `aria-live` on "active now" counter. Zero state: "No activity in the last 24h". |
| `DocsIcon` | Adjacent to page title | Same pattern as Tasksets. |
| `TabBar` | Explore / My Team tabs with count chips | `role="tablist"`. Sticky below page header. |
| `SearchInput` | Filters within active tab | Debounced. `aria-live` result count. Placeholder adapts per tab. Full-width own row on mobile. |
| `TypeFilterMenu` | Secondary refinement on Explore; conditional on My Team | Multi-select. Same visual weight as Sort/Group-by on Explore — not hero-level. `role="listbox"` with `aria-multiselectable`. |
| `ViewToggle` | Grid / List segmented control | Hidden on mobile. Persists to localStorage. |
| `SortMenu` | Sort dropdown | Options include "Most scenarios", "Most tools" — different from Tasksets. |
| `GroupByMenu` | Group by dropdown | Options: None / Type / Owner. Default = None on Explore and small My Team; Type or Owner on DoorDash-scale My Team (50+ envs). |
| `OwnerFilter` | Multi-select owner filter chip | My Team tab, 10+ distinct owners threshold. |
| `MobileFiltersSheet` | Mobile overflow trigger + bottom sheet | Includes Type filter as first section (new vs Tasksets). |
| `CreditsBanner` | Billing warning above or within page header | Reference-level pattern; billing flow out of scope. |
| `EnvironmentCard` | Grid view item | Header (name + star), description (URL linkified), tri-metric strip, owner + status dots. Tab-conditional. |
| `EnvironmentRow` | List view item | Compressed description + tri-metric (icon-only) + meta. Tab-conditional. |
| `DescriptionText` | Inside card and row | Renders plain text and linkified URLs inline. URL click: `stopPropagation`. "No description" fallback: italic, muted. |
| `UrlLink` | Inside DescriptionText | External link. `target="_blank" rel="noopener"`. Stops card-click propagation. Separate tab stop. |
| `TriMetricStrip` | Card footer + list row meta | Icon + count + label per segment (card) or icon + count only (list row). Zero values in muted weight. Wraps gracefully. |
| `StatusDots` | Card footer, owner row | 1–2 dots. Dot 1 = visibility state. Dot 2 = health/activity (TBD — see open question §15 item 3). |
| `GroupHeader` | Collapsible group header in group view | `<button>` with `aria-expanded`. Shows type/owner name + count. |
| `StarButton` | Card header + list row identity | Zero-state: outline star + `0`, muted. Non-zero: outline + readable count. Starred: filled. Tab-conditional semantics. |
| `EmptyState` | My Team zero, type-filter no-match, search no-match | Three variants with different messages and CTAs. |
| `ErrorState` | Fetch failure | "Couldn't load Environments — try again." + Retry. |
| `LoadMore` | Below last row/card when more exist (My Team only) | "Showing N of M · Load more." Full-width on mobile. Not rendered on Explore (full curated set shown). |
| `SkeletonRow` / `SkeletonCard` | Loading state | 4-bar meta column; group header skeletons when group-by is on. Activity bar skeleton on initial load. |

---

## 16. Persona notes by surface decision

| Decision | Alex (CO-PRIMARY) | Sam | Sam (DoorDash-scale) | Riley (CO-PRIMARY) |
|---|---|---|---|---|
| Default tab (Explore vs My Team) | Explore if 0 team envs; My Team if he has any. Alex often has his own envs once past Phase 1. | My Team immediately — his team's envs are there. | My Team — 50–150 envs. | Always My Team — his entire work product is there. |
| Type filter on Explore (secondary refinement) | Useful but not mandatory — at ~50 curated envs he can scan the flat list; uses type filter when narrowing to "Browser" or "Code/SWE" specifically. | Not primary path for Sam. | Not primary path for Sam. | Uses Explore to find competitor/reference envs; type filter helps narrow by category. |
| Group by default on Explore (None) | Flat list works at ~50 envs — he can scan by starred/newest. If he wants grouping he applies it manually. | Not his primary path. | Not primary. | Same — flat Explore list is fine for reference browsing. |
| Group by default on My Team (ON at scale) | My Team is small (0–5 envs) — flat list, group-by stays OFF. | Small team — flat. | 50–150 envs — Group by Type or Owner defaults ON; essential for navigation. | 10–50 envs — Group by Owner useful for per-client organization. Group-by defaults ON when org is large enough. |
| Activity bar | "0 active now" = env not saturated; "24 active now" = popular but possibly queued. Informs when to run. | Glances at it; not load-bearing for his use case. | Not primary. | Monitors his own envs' activity elsewhere; the global signal is ambient. |
| Star count on Riley's public envs (My Team, prominent) | Not relevant to Alex on My Team. | Not relevant. | Not relevant. | Community star count = commercial adoption signal. Making it prominent is load-bearing for his vendor loop. |
| URL linkified in description | Clicks through to reference implementations; evaluates env provenance. | Useful for understanding env source. | Not primary. | Links to client repos or deliverable specs. He adds them intentionally — they should be clickable. |
| Tri-metric density (scenarios / tools / env vars) | Primary quality signal on Explore — high scenario count + high tool count = comprehensive, hard env worth running RL against. | Quick check — confirms env matches his task. | Glances at it. | Uses it to verify his env's completeness before publishing. |
| No-description state ("No description", italic muted) | Expects it — incomplete community envs exist. Not alarming. | Acceptable. | Acceptable. | Should not appear on his published envs — it signals an incomplete deliverable. (Riley's authoring flow is out of scope here.) |
| Status dots (operational health) | Important — wants to know if env is live/healthy before running a Job. | Useful but not critical. | Useful. | Critical — his env being down means delivery delay. |

---

## 17. Open questions (do not block, flag for follow-up)

1. **Type taxonomy canonical list**: The type taxonomy shown in §3a (Browser, Code/SWE, OS/Desktop, Domain-specific, Custom) is inferred from common Environment types observed in the screenshots and platform docs. The exact canonical type list and its labels need verification against `docs.hud.ai` or the platform team. If new types are added or existing labels differ, the type filter menu and group-by labels update accordingly.

2. **Type filter apply behavior**: Does the type filter apply immediately as the user checks/unchecks options (live filter), or does it apply on close/Done? At ~50 curated Explore envs this is a client-side filter with no backend fetch, so live filtering is fine. On My Team at large scale a 200ms debounce is recommended. Confirm with engineering before implementation.

3. **Status dot semantics**: From screenshot observation, `kv · ● ●` on `trading-rl-env` shows two dots while other cards show one. The inferred semantics are: dot 1 = visibility (Public/Private), dot 2 = health or active-session status. This is not confirmed from the product docs. **Flag for product clarification before implementation.** Specific questions: (a) What does each dot mean? (b) Are the dots always the same color, or do they change color based on state? (c) Is the second dot only present when there is active activity, or when the env is "deployed"? (d) Should the dots also appear on Explore tab cards or only on My Team?

4. **"Last activity" sort signal**: Same as Tasksets open question — should "Last activity" sort by most-recent Run execution against the Environment, or by most-recent edit to the Environment definition itself? "Most-recent Run" is more useful for Alex ("what did I run against recently") and Riley ("which env is being actively used"). Recommend Run-based; flag for product confirmation.

5. **CLI command for empty state**: The exact CLI command for creating an Environment is not confirmed. `hud env new` follows the pattern inferred from platform docs (`hud eval`, `hud rl run`, `hud deploy`). Must be verified against `docs.hud.ai/reference/cli` before implementation. Label as TBD.

6. **Activity bar data scope**: "301 runs in last 24h" — is this global across all public Environments on the platform, or scoped to the current user's org's environments, or to the Explore tab's result set? A global number communicates platform health (more useful as a trust signal). An org-scoped number is more operationally relevant. If global, clarify the label: `"301 runs across all Environments in the last 24h"`. If org-scoped, clarify: `"301 runs across your Environments in the last 24h"`. Current label is ambiguous.

7. **Star count on My Team public envs**: For Riley's published env showing its community-wide star count on My Team — is the displayed number (a) the global community count including stars from all users, or (b) only stars from outside Riley's org? Recommendation: global count (same number shown on Explore), because it is Riley's commercial adoption signal. Flag for product confirmation.

8. **Credit-exhausted banner placement**: The billing warning banner (`"Your team has no credits remaining."`) — is this a shell-level global banner (managed by AppShell, appears above all page content) or a per-page local banner (rendered inside the MAIN region, above the page header)? A shell-level banner is better for consistency across all surfaces. A per-page banner avoids modifying AppShell scope. Flag for architecture decision before implementation.

9. **"My environments" sub-filter on My Team tab**: Tasksets' `03a` screenshot shows a `My tasksets` sub-filter chip on the My Team tab. The Environments screenshots do not clearly confirm or deny the same pattern. Question: does My Team have a "My environments" sub-filter that narrows to the current user's personally-owned environments (as opposed to all org-owned environments)? Riley would use this — he owns his work product personally before publishing. Flag for product clarification.

10. **Explore tab curated shelf size and growth trajectory**: Explore is a curated shelf currently expected at ~20–50 envs. Confirm: (a) who controls curation (HUD team only, or selected contributors?), (b) expected growth rate and maximum stable size, (c) whether there is a moderation pipeline for community submissions to Explore. If Explore grows significantly beyond ~50, the no-pagination and flat-default assumptions should be revisited.

11. **Per-group load-more threshold in My Team group view**: At DoorDash-scale My Team (50–150 envs), the per-group item limit before showing a "Load more" within a group needs specification. Recommend 20–30 per group before showing load-more, with a "Show all in {type} ({count})" button to communicate scope.

---

## Out of scope

- **Environment create / edit flow** — `+ New Environment` is a link target only. The Environment authoring flow (Tool definitions, Scenario authoring, `@env.tool()` / `@env.scenario()` decorators) is a separate surface.
- **Environment detail page** — `/environments/[slug]`. Shows Tools, Scenarios, env vars, Job history, and a fork/deploy action. This wireframe ends at card click.
- **Marketplace / fork flow** — the affordance to fork a public Environment into My Team likely lives on the detail page or a modal trigger on the card. Not on the index card.
- **QA Agent output surfaces** — Riley's per-task QA pass/fail view is a detail-page and delivery-flow concern.
- **Environment visibility toggle** — Private → Public publish control lives on the detail page.
- **Bulk selection and bulk actions** — (delete, archive, publish batch) — not in scope for index view.
- **Billing flow** — credit purchase and billing management live in `/manage/billing`. The credit-exhausted banner is referenced here but not designed.
- **Harbor Benchmarks import** — importing external benchmarks as Environments is a separate flow.

---

## Drift log

- **Tab label "Explore" vs "Public"**: Tasksets uses "Public"; Environments uses "Explore" (per production screenshots `03a-environments-public.png`). The divergence is preserved intentionally — "Explore" communicates discovery intent (a curated shelf to browse) rather than a visibility state. Do not align to "Public".

- **Type filter as secondary refinement on Explore (vs hero-level)**: Tasksets has no primary type filter at all; Environments provides the type filter on Explore as a secondary refinement at the same visual weight as Sort and Group-by. It is not a hero control. At ~20–50 curated envs, users can scan the flat list without narrowing by type; the filter is useful on demand. This is a corrected position from the initial draft, which mistakenly treated Explore as a 2,500-item gallery.

- **Group by default = None on Explore (vs initially drafted as Type ON)**: Explore is a curated shelf of ~20–50 envs; a flat list is the right starting point. Group-by defaults ON only on My Team at DoorDash-scale (50+ envs) where grouping earns its keep. The initial draft had this inverted — see Drift log entry below.

- **Activity bar is new to Environments, not present on Tasksets**: The live `301 runs in last 24h · 0 active now` element has no equivalent on the Tasksets page. Tasksets are not environments — they are task collections that reference environments. Run activity naturally surfaces on the Environment index (which env is getting used right now) but not on the Tasksets index. The divergence is structural, not aesthetic.

- **Tri-metric strip replaces leaderboard preview**: Tasksets cards show a leaderboard preview (model rankings, scores). Environments cards show scenarios / tools / env vars counts. Environments are not scored directly; the tri-metric is the quality and completeness signal. This is a fundamental data-shape divergence — both are justified by what the card represents.

- **Riley as CO-PRIMARY (not TERTIARY)**: The persona weight shift is explicitly called out in the operator brief. The Environments index is where Riley does his primary work. My Team tab design decisions weigh his vendor-dashboard needs equally with Alex's discovery needs. This diverges from Tasksets where Alex is unambiguously primary.

- **Status dots preserved from production screenshots**: The `● ●` dots in the card footer are present in `03b-environments-private.png` and specced here with inferred semantics. This is not a new design — it is preserving and documenting an existing production element whose semantics are not fully documented. The dot semantic is flagged as an open question.

- **`+ New Environment` disabled on credit exhaustion (vs hidden)**: Following the app-shell convention that gated items are visible but disabled, not hidden. Consistent with ManageShell role-gating pattern.

- **Scale reframe — Explore vs My Team progressive disclosure inverted from initial draft**: Original wireframe treated Explore as 2,500-scale gallery requiring group-by-Type default and pagination. Corrected: the 2,500+ platform stat is total envs across all orgs system-wide. Explore is a curated public shelf (~20–50). My Team is where scale-driven progressive disclosure (group-by, owner filter, pagination) earns its keep. Type filter on Explore moves from hero to secondary refinement; Explore pagination removed entirely; default Group-by inverted (Explore = None, My Team at scale = Type or Owner ON).

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md). Visual references: operator-supplied screenshots `03a-environments-public.png`, `03b-environments-private.png` (Jun 2026). Structural anchor: [`docs/design/screens/tasksets.wireframe.md`](./tasksets.wireframe.md). AppShell chrome: [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md).*
