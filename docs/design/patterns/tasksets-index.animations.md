# Tasksets Index — Page Motion Choreography

Owned by motion-designer. Governs every motion event on the `/tasksets` page as a composed system.
Component-level animation specs (hover state, skeleton shimmer, star toggle, dropdown open/close)
are deferred to each component's own `animations.md` sibling — referenced here by name but not
re-specced. This file owns: sequencing, timing decisions specific to the page context,
choreography when multiple motions fire near-simultaneously, and page-scoped reduced-motion
fallbacks.

All token references are by name only. Values live in `docs/design/foundations/motion.md`.

---

## Scope

This spec covers the `MAIN` content region of `/tasksets` as described in
`docs/design/screens/tasksets.wireframe.md`. It does not cover AppShell chrome (sidebar, credits
widget, user chip) — those are specced in the app-shell animations layer.

---

## Motion inventory

The table below identifies every animated touchpoint on the page, the decision, the composite
tokens that govern it, and the reduced-motion fallback. For touchpoints where timing is
context-dependent (e.g., leaderboard expand), the detailed spec follows in the sections below.

| Touchpoint | Animated? | Token(s) | Reduced-motion fallback |
|---|---|---|---|
| **Skeleton → loaded content** (§1) | Yes — instant replace, shimmer loop active during load | `--animate-shimmer` while loading; instant swap on arrival | Static skeleton fill (no shimmer); instant swap unchanged |
| **Leaderboard cell hover-expand** (§2, highest leverage) | Yes | Expand height: `--duration-subtle` + `--ease-out-emphasized`; content fade-in: `--motion-state-change`; close: `--motion-exit` duration + `--ease-in-accelerated` | Instant height snap; no fade — content appears/disappears at 0ms |
| **Star toggle — fill** (§3) | Yes — icon color transition | `--motion-state-change` | Instant fill/unfill |
| **Star toggle — count change** (§3) | Yes — opacity cycle on counter | `--motion-state-change` | Instant number swap |
| **Star toggle — error revert** (§3) | No — snaps to prior state | None — instant snap (error states do not animate per Honest principle) | Same — already instant |
| **Sort menu open** (§4) | Yes — panel slides up + fades | `--animate-slide-up-in` | Instant appear |
| **Sort menu close** (§4) | Yes — panel fades out fast | `--animate-slide-down-out` | Instant disappear |
| **Group by menu open/close** (§4) | Same as Sort menu | Same tokens | Same fallback |
| **Owner filter open/close** (§4) | Same as Sort menu | Same tokens | Same fallback |
| **Mobile bottom sheet open** (§4) | Yes — slides up from viewport bottom | `--duration-base` + `--ease-natural` (viewport-edge entry — same constraint as drawer panels) | Instant appear |
| **Mobile bottom sheet close** (§4) | Yes — slides down out | `--duration-fast` + `--ease-in-accelerated` | Instant disappear |
| **Group header expand** (§5) | Yes — height transition + chevron rotation | `--duration-subtle` + `--ease-out-emphasized` | Instant height snap; chevron snaps to final angle |
| **Group header collapse** (§5) | Yes — height transition + chevron rotation | `--duration-fast` + `--ease-in-accelerated` | Instant |
| **Tab switch** (§6) | Yes — cross-fade content region | `--motion-enter` on incoming; `--motion-exit` on outgoing; 30ms stagger | Instant hard swap — no cross-fade |
| **Load-more append** (§7) | Yes — new rows fade-reveal | `--animate-row-reveal` per new row, staggered 20ms apart (max 5 visible rows staggered; remainder appear instantly) | Instant append with no row animation |
| **View toggle (Grid ↔ List)** (§8) | No — hard swap | None — instant replace of layout | Same — already instant |
| **Search debounce visual** (§9) | Yes — list dims during debounce wait | List region opacity transition to `0.5` at `--motion-state-change`; restores on result arrival | No dim — list stays at full opacity throughout |
| **Card/row hover state** (§10) | Yes — background color transition | `--motion-state-change` | Instant color change |
| **Sticky header separator appear** | Yes — opacity transition as scroll crosses threshold | `--motion-state-change` | Instant at threshold |

---

## §1 — Skeleton to loaded content

The skeleton layout mirrors the populated list structure exactly (per wireframe §14): 2 identity
bars, 1 leaderboard bar, 3 short meta bars per row. The shimmer loop plays via `--animate-shimmer`
while the fetch is in flight.

**Swap rule:** when the data response arrives, skeleton rows are replaced with real rows
immediately — no fade-out of skeleton, no fade-in of real content. The skeleton disappears and the
real content is present in the same frame. Rationale: the Honest principle states that shimmer
disappears the moment data arrives. A fading shimmer communicates "almost done" rather than "done."

The transition that matters here is the one the user will perceive: the skeleton disappearing.
Because the populated row is structurally identical to the skeleton row (same column widths, same
line count), the layout does not shift — so an instant swap reads as snappy and exact, not jarring.

**Grid skeleton:** Same instant-swap rule. Skeleton cards are replaced simultaneously (not
staggered per-card) because they loaded as a batch, not as a stream. Stagger applies to streaming
arrivals; batch loads are atomic.

**Reduced-motion:** skeleton bars show as static fills (no shimmer movement). Swap remains instant.

---

## §2 — Leaderboard cell hover-expand (highest-leverage motion on the page)

The list-row leaderboard cell shows only the #1 model and score by default. Hovering the cell
expands it to reveal #2 and #3 with their scores. This is the highest-leverage motion on the page:
Alex's primary scan pattern depends on leader-only density being the default, but hover-expand
must be fast enough that it feels like a reveal rather than a load. If this motion is sluggish,
the leader-only decision becomes a regression — it would feel like the data is hidden rather than
deferred.

### Hover-open sequence

1. **Hover delay:** 120ms cursor-dwell before expansion begins. This prevents accidental expansions
   while scanning horizontally across rows. The delay is implemented as a timer that resets on
   cursor exit before the delay expires — no visible UI change during the 120ms window.

2. **Height expansion:** the leaderboard cell height grows from its single-line resting height to
   the three-line expanded height. Duration: `--duration-subtle`. Easing:
   `--ease-out-emphasized`. The expansion decelerates to its endpoint — it does not bounce or
   overshoot (no spring; Deterministic).

3. **#2 and #3 content fade-in:** the two additional rows fade in starting 30ms after the height
   expansion begins (not after it completes — overlapping is intentional and prevents the content
   appearing to "pop in" after a visible pause). Duration and easing: `--motion-state-change`.

4. **Row height ripple:** the containing list row expands its height to accommodate. This is a
   dependent motion (Orchestrated: one primary, subordinate secondaries). The row height change
   uses `--duration-subtle` + `--ease-out-emphasized`, identical to the cell expansion so they
   read as one gesture, not two competing moves.

### Hover-close sequence

Cursor exits the leaderboard cell (or exits the row):

1. **#2 and #3 fade-out:** immediately on cursor exit (no dwell timer on close). Duration and
   easing: `--motion-exit` composite.

2. **Height collapse:** begins simultaneously with fade-out. Duration: `--duration-fast`. Easing:
   `--ease-in-accelerated`. The collapse is faster than the open — it clears the stage quickly.

3. **Row height collapses** simultaneously with cell height, same tokens.

### Interaction with the row being a clickable `<a>`

The entire row is a link to `/tasksets/[slug]`. The leaderboard cell hover-expand must not trigger
navigation. Implementation guidance (capability flag, not library): the cell's hover-expand region
is a distinct sub-element within the `<a>` — pointer events on the expand trigger do not propagate
to the anchor's click handler. The expansion is hover-only (triggered on `mouseenter` / `mouseleave`
or equivalent pointer events); keyboard users access #2/#3 via a separate expand control (see
accessibility notes below).

### Keyboard access

Hover-expand is a pointer-only affordance. For keyboard and screen-reader users, a separate
expand toggle (e.g., a small disclosure button within the leaderboard cell) is needed. That button's
open/close animation follows the same timing as the hover sequence — triggered by `click`/`Enter`
rather than pointer events. This is a component-level implementation concern flagged here because it
affects timing: the disclosure button must use the same `--duration-subtle` + `--ease-out-emphasized`
open and `--duration-fast` + `--ease-in-accelerated` close as the hover path.

### Reduced-motion

Under `prefers-reduced-motion: reduce`:
- Height snap is instant (0ms).
- #2 and #3 appear instantly at full opacity with no transition.
- The disclosure state (expanded vs. collapsed) is still communicated by the content being present
  and by `aria-expanded` — no motion required for accessibility.

---

## §3 — Star toggle

The star button is an optimistic toggle: the visual state updates immediately on click, then the
server call resolves (success: no further change; failure: revert).

### Fill transition

The icon swap from outline to filled (or filled to outline) uses `--motion-state-change`. This is
a color/fill state change — not a scale, not a transform. Per the Sparing principle: hover is color
change only. Scale or bounce on a star fill would be a personality violation.

### Count change

The numeric count adjacent to the star increments (or decrements) by 1 on activation. The number
change uses a brief opacity cycle at `--motion-state-change`: the current count fades to `0`
opacity, the new count fades in. This prevents the number appearing to teleport while keeping the
transition fast enough that it reads as immediate. Total perceived duration: one `--motion-state-change`
cycle (two in sequence, but each is short enough to read as one event).

The opacity cycle on the count is a secondary dependent motion — the primary motion is the icon
fill. Per Orchestrated: the icon is the primary signal; the count is the dependent.

### Error revert

If the server call fails, the state reverts to pre-click. The revert is an instant snap — no
transition. An error state does not animate (Honest principle: "error transitions: none"). The
error toast `"Could not star Taskset — try again."` appears via the toast system's own enter
animation.

### Reduced-motion

Icon fill/unfill: instant. Count change: instant number swap (no opacity cycle). Revert: already
instant.

---

## §4 — Sort menu, Group by menu, Owner filter, Mobile bottom sheet

### Desktop dropdown menus (Sort, Group by, Owner filter)

These three menus are structurally identical dropdown panels. They use existing named animation
composites directly:

- **Open:** `--animate-slide-up-in` — panel translates up 8px and fades in simultaneously.
- **Close:** `--animate-slide-down-out` — panel fades out and translates down, clears stage fast.

No stagger on menu items. Items are not streamed — they are rendered as a batch. Stagger on static
content is a personality violation (Sparing: "no stagger on static content").

**Reduced-motion:** instant appear/disappear.

### Mobile bottom sheet

The bottom sheet slides up from the viewport bottom edge — same constraint as drawer panels:
`--ease-natural` is required (nonzero initial velocity from the viewport edge). Duration: `--duration-base`.

Close: `--duration-fast` + `--ease-in-accelerated`.

**Reduced-motion:** instant appear/disappear (no translate).

---

## §5 — Group header expand / collapse

The group header is a disclosure control: clicking it expands or collapses the group's Taskset
rows.

### Expand

1. **Chevron rotation:** `▶` rotates to `▼`. Duration: `--duration-subtle`. Easing:
   `--ease-out-emphasized`. Rotation is a transform on the chevron icon only — no layout effect.

2. **Content height expansion:** the group body height transitions from 0 to its natural height.
   Duration: `--duration-subtle`. Easing: `--ease-out-emphasized`. Same timing as chevron — they
   read as one gesture.

The height transition requires JS-driven animation capability (clip-height or max-height on content
of indeterminate natural height). Flag for engineer: CSS height transitions from `0` to `auto`
require a JS measurement step or `grid-template-rows` trick — either approach is valid; the
timing values here are the spec.

### Collapse

1. **Chevron rotation** back to `▶`: `--duration-fast` + `--ease-in-accelerated`.
2. **Content height collapses** to 0: same tokens. Fast collapse clears the stage without dwelling.

### Reduced-motion

Instant height snap and instant chevron angle change. Group is still functionally expanded or
collapsed — only the animation is removed.

---

## §6 — Tab switch (Public ↔ My Team)

Tab switching replaces the full content region (list or grid of Tasksets). This is the largest
content swap on the page — potentially replacing 50+ rows with a different set. The wrong motion
here would make the page feel heavy.

### Decision: overlapping cross-fade, not slide

The two tabs are not spatially ordered (not left-right alternatives with a positional metaphor).
They are labelled categories. A slide transition would imply that "My Team" lives to the right of
"Public" — which is not a meaningful spatial relationship. Cross-fade is correct: the content
dissolves and the new content appears.

### Sequence

1. **Outgoing content** fades to opacity 0 at `--motion-exit` composite (`--duration-fast` +
   `--ease-in-accelerated`). Fast — clears the stage.

2. **Skeleton** appears instantly (no enter animation — it replaces the outgoing content in the
   same operation, synchronised with the fade-out). Skeleton shimmer begins immediately.

3. **Incoming content** replaces skeleton via the instant-swap rule (§1) when data arrives.

4. **Tab underline indicator** slides to the active tab using `--duration-subtle` +
   `--ease-out-emphasized`. This is a horizontal translation of the underline element — the one
   spatial motion on this interaction, and it is justified: the underline physically tracks from
   one tab to the other.

**30ms stagger on the fade-out start relative to the tab indicator motion:** the indicator begins
moving first, then the outgoing content fades. This makes the tab-switch read as one primary
gesture (indicator moving) with the content swap as a dependent event. Per Orchestrated: one
primary motion, dependent secondaries.

### Reduced-motion

Instant hard swap: outgoing content disappears, incoming skeleton appears, all at 0ms. Tab underline
moves to new position without transition. When data arrives, skeleton swaps instantly (same as
standard load).

---

## §7 — Load-more append

Clicking "Load more" appends the next page of rows (or cards) below the existing list. Per the
wireframe, skeleton rows appear below the last existing row while the network request is in flight,
then real rows replace them via the instant-swap rule.

### Stagger on new row arrival

When the new rows replace skeleton rows, each new row uses `--animate-row-reveal`. A 20ms stagger
is applied between rows — the first row reveals at 0ms, the second at 20ms, etc. Stagger applies
only to the first 5 visible new rows; any rows beyond 5 reveal instantly. Rationale: rows arrived
as a batch, not as a stream — but a brief sequential reveal reads as ordered data arriving rather
than a jarring grid flash. 5-row stagger cap keeps the effect ambient and brief; a 50-row stagger
would be 1000ms of visible animation on a single user action, which violates Sparing.

### Focus

After new rows appear, keyboard focus moves to the first newly-loaded row (per wireframe §13 and
§12 mobile). This is a functional behavior, not a motion behavior — no animation accompanies the
focus move itself.

### Reduced-motion

New rows appear instantly (no stagger, no row-reveal animation). Skeleton swap still instant.
Focus move to first new row is unchanged.

---

## §8 — View toggle (Grid ↔ List)

**Decision: instant hard swap. No transition.**

Grid and List are structurally different layouts (cards vs. rows, different column structures,
different leaderboard depth). An animated morph between them would require tracking each element's
position across the two layouts and animating position changes — a FLIP-class animation that is
expensive to implement and risks introducing a choreographic lie: the cards do not physically
"collapse" into rows, and animating them as if they do creates false spatial metaphor.

The instant swap is also the correct Honest posture: the user made a binary layout choice, and the
layout changed. There is no ambiguous in-between state to communicate.

When the user toggles, the content area blinks to the new layout in the same frame. No fade,
no slide, no stagger. The toggle button's active state updates via `--motion-state-change` (color
swap on the segmented control segment).

**Reduced-motion:** same — already instant.

---

## §9 — Search debounce visual

The search input debounces at 300ms. During the debounce window and while the filtered results are
fetching, the list region dims to indicate a pending state.

### Dim behavior

On the first character typed, the list region's opacity transitions to `0.5` at `--motion-state-change`.
It stays at `0.5` for the duration of the debounce wait and fetch. When results arrive (whether
populated or empty-state), the opacity restores to `1.0` at `--motion-state-change`.

The dim communicates: "this list reflects a query that has not resolved yet." Without it, users
may act on stale results during the 300ms window.

The dim is a single-property opacity transition — no layout change, no blur, no skeleton
replacement during debounce (skeleton would require unmounting and remounting the list, creating
layout churn on every keystroke). Opacity dim is lightweight and reversible.

**No skeleton during debounce:** skeleton appears only on the initial page load and on tab switch
— not on each search keystroke. Search results update the existing list in place; the dim is the
only visual signal during the wait.

### Reduced-motion

No dim. The list stays at full opacity throughout. Search still debounces and results still update;
the pending state is communicated via the search input's aria-live region ("12 Tasksets found")
rather than a visual dim.

---

## §10 — Card and row hover

Per the Sparing principle and motion foundations: hover is a color change only. No scale, no
translateY, no shadow growth.

Card hover: background color transitions at `--motion-state-change`.
Row hover: background color transitions at `--motion-state-change`.

The leaderboard cell hover-expand (§2) is an additional affordance layered on top of the row hover
color change — both fire when the cursor enters the row. The row background color transitions
immediately (at `--motion-state-change`); the leaderboard cell expand begins after its 120ms dwell
timer (§2). These two motions co-exist without conflict: different properties, different start
times, neither competes for the same visual frame.

### Reduced-motion

Color change is instant (duration collapse to 0ms). No separate reduced-motion branch needed for
this touchpoint.

---

## §11 — Sticky header separator

The page header and tab bar are sticky. A separator (bottom border or shadow — exact treatment is
a token-phase decision) appears at the lower edge of the sticky region when the user has scrolled
past the point where the filter row is no longer visible.

The separator's opacity transitions at `--motion-state-change` as the scroll threshold is crossed
in either direction. This is a scroll-linked opacity transition, not a scroll-driven animation
timeline — the opacity value changes based on a scroll threshold event (detected via
`IntersectionObserver`), not a continuous scroll position mapping.

**Capability flag:** `IntersectionObserver` is required. No library needed — it is a standard web
platform API.

**Reduced-motion:** the separator appears at full opacity instantly when the threshold is crossed.
No transition.

---

## Choreography rules — simultaneous motion composition

When multiple animated touchpoints fire near-simultaneously, the following rules govern composition.

### Tab switch while a row is hover-expanded

If the user clicks a tab while hovering over a list row (leaderboard cell expanded):

1. The hover-close sequence (§2) fires instantly — the leaderboard cell collapses without its
   normal close animation (duration 0ms, immediate). The tab switch is the primary event; the
   hover state is a secondary that should not linger into the transition.
2. The tab-switch cross-fade (§6) proceeds normally.

**Rule:** when a deliberate navigation event (tab click) fires during a hover-state animation, the
hover-state animation is immediately resolved (snapped to closed) and the navigation animation
takes primary focus.

### Sort/Group menu open while list is dimmed (search debounce active)

The list dim and the dropdown open can co-exist without conflict: the dim is on the list region's
opacity; the dropdown panel is an overlay element outside the list's stacking context. The dropdown
opens normally at `--animate-slide-up-in`. The dim remains until results arrive. No adjustment
needed.

### Load-more initiated while a row is hover-expanded

The hover-expanded row is existing content — it remains expanded during the load. New rows appear
below via `--animate-row-reveal` stagger. The expanded row's state is not affected. No conflict.

### Group collapse while searching (search results updating)

Group collapse uses `--duration-fast` + `--ease-in-accelerated`. If a search response arrives
mid-collapse, the group content is replaced (rows filtered) after the collapse completes. The
collapse takes at most `--duration-fast` — the wait is negligible. If the search resolves before
the collapse completes, hold the list update until the collapse animation finishes, then apply the
new filtered set. This prevents a layout conflict where collapsing and simultaneously replacing
content produces a torn height state.

### Star toggle during hover (row hover active)

Both fire on the star button click. Star fill uses `--motion-state-change`. Row hover background
is already at hover-color. No conflict — they operate on different elements and different
properties.

### View toggle while skeleton is visible

If the user switches Grid ↔ List while the skeleton is still showing (data not yet arrived):
swap the skeleton layout immediately (list skeleton → grid skeleton or vice versa). The skeleton
uses `--animate-shimmer`; that loop continues uninterrupted. No cross-fade on the skeleton-to-
skeleton swap.

---

## Open questions

The following items depend on foundation tokens that do not yet exist, or on component-level
animation specs that should later be authored as `components/[name]/animations.md` files.

### Missing foundation tokens

1. **No `--duration-hover-delay` token.** The 120ms hover-dwell delay before leaderboard expand
   (§2) is specified here as a literal value because no interaction-delay token exists in
   `foundations/motion.md`. If hover delay becomes a pattern across other components (tooltips,
   popover triggers), a `--duration-hover-dwell` token should be added to foundations.
   Until then, 120ms is the page-scoped spec for this single touchpoint.

2. **No composite token for list-region pending state.** The search debounce dim (§9) uses
   `--motion-state-change` on an opacity property of a layout region — not a component state
   change. This is within range of the existing `--motion-state-change` token semantically.
   No new token is needed unless the dim pattern recurs across other list pages (Jobs index,
   Runs table) — at that point, a `--motion-list-pending` semantic composite should be added.

### Components that should later author their own `animations.md`

The following components appear on the tasksets index and have motion behavior referenced here by
semantic description. This spec treats them as black boxes. When those components are specced at
the component layer, each should author a sibling `animations.md` covering their own state
transitions. Any timing values specified here for page-level choreography should be reconciled with
component-level values at that time.

- `docs/design/components/star-count/animations.md` — star fill, count opacity cycle, error revert
- `docs/design/components/dropdown-menu/animations.md` — open/close (Sort, Group by)
- `docs/design/components/select/animations.md` — Owner filter open/close
- `docs/design/components/tabs/animations.md` — tab underline indicator translation
- `docs/design/components/skeleton/animations.md` — shimmer loop, static reduced-motion fallback
- `docs/design/components/drawer/animations.md` — mobile bottom sheet enter/exit (the bottom
  sheet is structurally a drawer variant from the bottom edge)
- `docs/design/components/accordion/animations.md` or `docs/design/components/scroll-area/animations.md` — group header height expand/collapse. The existing accordion component may be the correct primitive; confirm at component layer.

### Product questions that affect motion spec

- **Search debounce on Mobile:** the mobile filter row does not have an inline search in the same
  row as the filter controls. Confirm whether the full-width mobile search row triggers the same
  dim-on-debounce behavior or whether the narrower tap surface changes the interaction model.

---

*Derived from: `docs/design/screens/tasksets.wireframe.md`, `docs/design/foundations/motion.md`,
`docs/design/guidelines/motion-principles.md`, `docs/product/personality.md`,
`docs/product/personas.md`.*
