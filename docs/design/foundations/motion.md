# Motion — Foundation

Owned by motion-designer. Token values live in `packages/ui/src/styles/primitive.css`; composites
are re-exposed through `@theme` in `packages/ui/src/styles/theme.css`. Engineers reference these
by token name — never hard-code a duration or easing inline.

---

## Principle

HUD motion is a substrate, not a statement. Alex opened the dashboard 40 minutes into a problem;
Sam needs the Trace before an 11 AM call. Every transition they encounter is friction they did not
ask for. The system earns trust by moving on the heel of intent: state changes resolve in under
120 ms when perception allows it, enters in under 160 ms, nothing bounces or celebrates.
"Composed" in the HUD personality means complexity composes away — the motion system follows:
spatial cues only where a direction exists, opacity where there is none, and instant swaps where
the layout change is the communication. Vercel deploy logs and Linear's command palette are the
reference feel: fast, honest, and entirely out of the way.

---

## Duration scale

| Token                | Value  | Rule — what interaction lands here |
|----------------------|--------|-------------------------------------|
| `--duration-instant` | 80 ms  | Hover background, press overlay, focus ring. Perceived as simultaneous with the pointer event. Never used for enter/exit of persistent elements. |
| `--duration-fast`    | 120 ms | Badge state swap, icon swap, exit/dismissal of any overlay (modal, popover, tooltip, drawer). Exit always uses `--duration-fast` so the stage clears before the next action reads. |
| `--duration-subtle`  | 160 ms | Enter of persistent overlays (popover, tooltip, dropdown), accordion expand, drawer enter, tab underline slide, sidebar route transition incoming panel. The ceiling for any enter that does not move significant spatial distance. **Replaces prior `--duration-subtle: 180ms`.** |
| `--duration-base`    | 220 ms | Reserved for continuous-loop periods only (`--motion-continuous` sets its own value). No UI enter or state change may use `--duration-base` as a transition duration. **Effective change: `--motion-enter` is rebound to `--duration-subtle`; `--duration-base` is removed from all transition usage.** |

### Rationale for 180 → 160 ms collapse

The prior `--duration-subtle: 180ms` was within range of a well-tuned system. The delta to 160 ms
is justified by one observation: at 180 ms a popover open registers as a two-frame micro-pause
on a 120 Hz display (180 ms ÷ 8.3 ms/frame = ~22 frames). At 160 ms the same enter completes in
~19 frames and reads as a single fluid gesture rather than a settle. For HUD's density (popovers,
accordions, and drawers are primary navigation affordances used dozens of times per session), the
cumulative perceived weight of 20 ms per event is non-trivial.

The prior `--duration-base: 220ms` was explicitly labeled "220ms ceiling for UI feedback" and
used as the enter duration for modals and row reveals. 220 ms is the right budget for a spinner
perception window but is too slow for a panel that the user deliberately triggered. Rebinding
`--motion-enter` to `--duration-subtle` (160 ms) closes this gap. `--duration-base` remains in
the token set as the numeric period for continuous loops — it is not deleted, but it is removed
from transition usage entirely.

---

## Easing

| Token                   | Curve                              | When to use |
|-------------------------|------------------------------------|-------------|
| `--ease-out-standard`   | `cubic-bezier(0.2, 0, 0, 1)`      | General state changes — hover bg, color transitions, focus ring, scrollbar fade. Decelerates to rest from a moderate initial velocity. |
| `--ease-out-emphasized` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Enter transitions that move through space — panel slides, accordion height, drawer panel, sidebar route incoming. Near-flat start then rapid deceleration into rest. Conveys settling, not floating. |
| `--ease-in-accelerated` | `cubic-bezier(0.3, 0, 1, 1)`      | Exit/dismissal. Starts slow, accelerates off-screen. Clears stage fast. |
| `--ease-linear`         | `linear`                           | Continuous loops only (shimmer, indeterminate progress sweep, running-pulse). Never used for transitions. |
| `--ease-natural`        | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Drawer and mobile bottom-sheet panels entering from a viewport edge (right, bottom). Non-zero initial velocity prevents the near-flat start of `--ease-out-emphasized` from introducing a visible windup when the element originates at the edge. **Scope: drawer-family only.** Any non-edge enter uses `--ease-out-emphasized`. |

`--ease-natural` is retained. The windup artifact at the viewport edge is real and observable;
`--ease-out-emphasized` is wrong for that entry. No other enter uses it.

---

## Composite tokens

Composites compose one duration + one easing into a shorthand. Used with `transition-[property]`
at the component layer. Values resolve at runtime because both components are `:root` custom
properties.

| Token                | Composition                                              | Use case |
|----------------------|----------------------------------------------------------|----------|
| `--motion-state-change` | `--duration-instant` + `--ease-out-standard` (80 ms) | Hover bg, focus ring, badge/icon state swap, scrollbar visibility, color-only transitions. |
| `--motion-micro`     | `--duration-fast` + `--ease-out-standard` (120 ms)       | Button press scale, row select highlight. **Changed: was `--duration-subtle` (180 ms); now `--duration-fast` (120 ms).** Micro-interactions that respond to press should not linger. |
| `--motion-enter`     | `--duration-subtle` + `--ease-out-emphasized` (160 ms)   | Modal open, popover open, tooltip appear, accordion expand, row reveal, tab content swap, drawer enter. **Changed: was `--duration-base` (220 ms); now `--duration-subtle` (160 ms).** |
| `--motion-exit`      | `--duration-fast` + `--ease-in-accelerated` (120 ms)     | Modal close, popover close, tooltip dismiss, accordion collapse. Unchanged. |
| `--motion-continuous`| `1800 ms` + `--ease-linear` + `infinite`                 | Skeleton shimmer, indeterminate progress sweep, running-pulse. Loop period; `--duration-base` value retained here because a 220 ms shimmer period is too fast — this is the only correct use of a 220+ ms duration. |

---

## Per-interaction guidance

One composite per row. Where two tokens appear, the first is the primary property, the second
is a secondary property on the same element at a different timing.

| Interaction | Composite / token | Rationale |
|---|---|---|
| **Hover — background** | `--motion-state-change` | Perceived as simultaneous with pointer; 80 ms reads as instant. |
| **Hover — border / outline** | `--motion-state-change` | Same frame as background — both on one `transition-colors`. |
| **Focus ring appear** | `--motion-state-change` | Must not lag pointer/keyboard; instant feel required. |
| **Press / active overlay** | `--motion-state-change` | Overlay responds on pointer-down; any longer reads as sluggish. |
| **Button press scale** | `--motion-micro` (120 ms) | Scale is a spatial transform; 80 ms is too abrupt. 120 ms is the floor for perceived spatial moves. |
| **Row select highlight** | `--motion-micro` (120 ms) | Background fill is a secondary confirm signal — slightly slower than hover. |
| **Badge / icon state swap** | `--motion-state-change` | State change, not spatial. |
| **Filter chip toggle** | `--motion-state-change` | Toggle is a boolean state change; background + check icon swap is color-only. |
| **Sort / direction indicator** | `--motion-state-change` | Arrow or label swap. |
| **Tab underline slide** | `--motion-micro` (120 ms) + `--ease-out-standard` | Underline is a JS-measured translate — spatial but short-distance. 120 ms with standard ease reads as responsive. |
| **Tab text color** | `--motion-state-change` | Color-only; fires simultaneously with underline slide. |
| **Popover open** | `--motion-enter` (160 ms, `--ease-out-emphasized`) | Panel enters with 4 px translate toward trigger; deceleration to rest. |
| **Popover close** | `--motion-exit` (120 ms, `--ease-in-accelerated`) | Clears stage fast; user has already moved on. |
| **Tooltip appear** | `--motion-enter` (160 ms) | Same as popover; tooltip is a smaller overlay, not a faster one. |
| **Tooltip dismiss** | `--motion-exit` (120 ms) | |
| **Dropdown / menu open** | `--motion-enter` (160 ms) via `--animate-slide-up-in` | Panel slides 8 px up and fades. |
| **Dropdown / menu close** | `--motion-exit` (120 ms) via `--animate-slide-down-out` | |
| **Accordion expand** | `--motion-enter` (160 ms, `--ease-out-emphasized`) on `grid-template-rows` + opacity | Height expands via `grid-template-rows: 0fr → 1fr`. Chevron rotates at same timing. |
| **Accordion collapse** | `--motion-exit` (120 ms, `--ease-in-accelerated`) | Collapses faster than it opens — clears stage priority. |
| **Drawer open** | `--duration-subtle` (160 ms) + `--ease-natural`, size-scaled | Size-scaled: sm 120 ms, md 160 ms, lg 160 ms. `--ease-natural` required for viewport-edge entry. **Changed: prior sm was 140 ms (hardcoded), now aligns to `--duration-fast` token.** |
| **Drawer close** | `--duration-fast` (120 ms) + `--ease-in-accelerated` | Unchanged. |
| **Drawer overlay fade** | `--duration-subtle` (160 ms) + `--ease-out-standard` on open; `--duration-fast` on close | Matches panel timing. |
| **Modal open** | `--motion-enter` (160 ms) via `--animate-slide-up-in` | Same composite as popover — dialog is a larger popover. |
| **Modal close** | `--motion-exit` (120 ms) | |
| **Sidebar route — outgoing** | `--duration-fast` (120 ms) + `--ease-in-accelerated` | Clears stage first; 50 ms before incoming starts. |
| **Sidebar route — incoming** | `--duration-subtle` (160 ms) + `--ease-out-emphasized` | Settles into place. **Changed: prior was 180 ms; now 160 ms.** |
| **Table row reveal (streaming)** | `--animate-row-reveal` → `--duration-subtle` (160 ms) + `--ease-out-standard` | Ambient, not eventful; 4 px translate. **Changed: prior used `--duration-subtle: 180ms`; now 160 ms.** |
| **Skeleton shimmer** | `--motion-continuous` (1800 ms loop) | |
| **Skeleton → content swap** | Instant (no transition) | Data arrived; instant swap reads as snappy, not jarring. |
| **Progress fill width** | `--motion-micro` (120 ms) + `--ease-out-standard` | Determinate width change is a secondary status signal. **Changed: was `--duration-subtle` (180 ms); now `--motion-micro` (120 ms).** |
| **Scrollbar visibility** | `--motion-state-change` (80 ms) | Fade in/out on scroll activity — near-instant. |
| **Scroll-linked separator appear** | `--motion-state-change` (80 ms) | IntersectionObserver threshold; opacity only. |
| **Altitude switch — Trace panel enter** | `--duration-subtle` (160 ms) + `--ease-out-emphasized` via `--animate-slide-right-in` | **Changed: was `--duration-base` (220 ms); now 160 ms.** |
| **Altitude switch — Trace panel exit** | `--duration-fast` (120 ms) + `--ease-in-accelerated` via `--animate-slide-left-out` | Unchanged. |
| **Running-pulse** | `--motion-continuous` (1600 ms loop) | Opacity oscillation on live-status dot. |

---

## Reduced motion

`prefers-reduced-motion: reduce` is handled in `packages/ui/src/styles/theme.css` by collapsing
all `--duration-*` tokens to `0ms` and setting `--motion-continuous: none`.

This single override is correct and complete after the scale refinement:

- All `transition-*` usages that reference a `--duration-*` token or a `--motion-*` composite
  resolve to 0 ms — instant state change, no translation, no opacity fade.
- Shimmer and running-pulse loops are suppressed (composite set to `none`).
- No per-component reduced-motion branch is needed as long as every component references tokens
  rather than hard-coded values.

**The only exception class:** continuous loops using `animate-[indeterminate-sweep_var(--motion-continuous)]`
inherit the `none` value cleanly because `animation: none` suppresses the keyframe. Static bar
remains visible at its last position. This is correct behavior (status is still readable).

**Hard-coded values are not covered.** Drawer `sm` currently hard-codes `transitionDuration: "140ms"`
inline (see Token deltas → Drift inventory). This bypasses the reduced-motion collapse. Must be
replaced with token references.

---

## Anti-patterns

The following are explicitly rejected for HUD surfaces:

| Anti-pattern | Why |
|---|---|
| **Bounce / spring overshoot** | No bouncing. `--ease-out-emphasized` decelerates to rest — no overshoot, no spring coefficient. Bouncing communicates playfulness; HUD communicates precision. |
| **Scale celebration (copy-confirm-pulse)** | The `copy-confirm-pulse` keyframe (scale 1 → 1.18 → 1) is flagged with a `TODO(motion-audit)` in `primitive.css:203`. **Verdict: remove.** Replace with icon/color swap at `--motion-state-change`. Scale bounce on a copy confirmation is a personality violation (Spare: no celebrations). |
| **Enter > 160 ms for deliberate triggers** | A user clicking a popover trigger, accordion header, or tab has already committed intent. Any enter longer than `--duration-subtle` (160 ms) communicates weight where there is none. `--duration-base` (220 ms) is retired from all transition use. |
| **Stagger on static content** | Stagger applies only to streaming arrivals (rows appearing asynchronously). Stagger on a fully-loaded menu or card grid implies sequenced arrival — a choreographic lie and a Spare violation. |
| **Translation on hover** | Hover state for cards and rows is background-color only at `--motion-state-change`. No `translateY`, no `scale`, no shadow escalation. Translation implies "popping out" — a physical metaphor that contradicts the flat, dense surface. |
| **Simultaneous competing enters** | When a deliberate navigation event fires during a hover animation, the hover-state animation resolves instantly (0 ms snap) and the navigation animation takes priority. Two concurrent enters read as visual noise. |
| **Fade-out skeleton before data arrives** | Skeleton disappears and real content is present in the same frame. A fading skeleton communicates "almost done" rather than "done" — an Earnest violation. |
| **`prefers-reduced-motion` bypass** | Hard-coded `transitionDuration` in inline styles bypasses the token-based reduced-motion collapse. All motion values must flow through `--duration-*` tokens. |

---

## Token deltas — punch list for design-system-architect

The following changes apply to `packages/ui/src/styles/primitive.css` and the components listed
in the Drift inventory. Implement in one pass.

### `primitive.css` token changes

| Change | From | To | Reason |
|---|---|---|---|
| `--duration-subtle` | `180ms` | `160ms` | Enter transitions at 180 ms register as a two-frame pause on 120 Hz displays; 160 ms reads as a single gesture. |
| `--motion-micro` composite | `var(--duration-subtle) var(--ease-out-standard)` | `var(--duration-fast) var(--ease-out-standard)` | Press-response micro-interactions should complete in 120 ms — `--duration-subtle` (now 160 ms) is too slow for a press confirm. |
| `--motion-enter` composite | `var(--duration-base) var(--ease-out-emphasized)` | `var(--duration-subtle) var(--ease-out-emphasized)` | 220 ms enters are too heavy for deliberate triggers; 160 ms is the correct ceiling. |
| `--animate-slide-up-in` | `var(--duration-base)` | `var(--duration-subtle)` | Shares `--motion-enter` budget — popover / dropdown enters drop from 220 ms to 160 ms. |
| `--animate-slide-right-in` | `var(--duration-base)` | `var(--duration-subtle)` | Trace altitude panel enter drops from 220 ms to 160 ms. |
| Remove `copy-confirm-pulse` keyframe | present | delete | Personality violation (scale bounce = celebration). `code-block.tsx` must use icon/color swap at `--motion-state-change` instead. |

### Comment update

Update the `--duration-base` comment in `primitive.css` to:
```
--duration-base: 220ms;  /* Loop period only — used by --motion-continuous. Not for transitions. */
```

---

## Drift inventory — component files to update

### `packages/ui/src/components/`

| File | Line(s) | Current value | Required change |
|---|---|---|---|
| `drawer.tsx` | 60 | `data-[state=open]:duration-[200ms]` (overlay enter) | Replace with `data-[state=open]:duration-subtle`. This was 200 ms hardcoded; target is `--duration-subtle` (160 ms). |
| `drawer.tsx` | 133–136 | `ENTER_DURATION_CLASSES` sm: `duration-[140ms]`, md/lg: `duration-[180ms]` | Change sm to `duration-fast` (120 ms token), md/lg to `duration-subtle` (160 ms token). Use token utilities, not arbitrary `duration-[Xms]`. |
| `drawer.tsx` | 143–145 | `DRAWER_TRANSITION_STYLES` sm: `140ms`, md/lg: `180ms` | Change sm to `120ms` (aligns to `--duration-fast`), md/lg to `160ms` (aligns to `--duration-subtle`). These are inline CSS on the vaul panel — must remain numeric strings but values must match the token scale. Add a comment citing the token name. |
| `accordion.tsx` | 214 | `data-[state=open]:duration-base` | Replace with `data-[state=open]:duration-subtle`. Accordion enter was 220 ms; target is 160 ms. |
| `filter-chip.tsx` | 22 | `duration-150` (Tailwind arbitrary) | Replace with `duration-instant` (token, 80 ms). Filter chip toggle is a color-only state change — `--duration-instant` is correct. The 150 ms value is not on the token scale and bypasses reduced-motion collapse. |
| `progress.tsx` | 31 | `duration-subtle ease-out-standard` | No change needed after `--duration-subtle` is updated to 160 ms — this usage is correct semantically. However: **verify** the fill width transition at 160 ms still reads as responsive after the token update; if it reads as lagging, change to `duration-fast` (120 ms). |
| `popover.tsx` | 18–27 | No explicit duration class | Popover inherits Radix's default or browser default. Add explicit enter/exit classes: `data-[state=open]:duration-subtle` + `data-[state=closed]:duration-fast` to ensure token coverage and reduced-motion collapse. |
| `scroll-area.tsx` | 39, 65 | `transition-(--motion-state-change)` | Correct — already on token. No change needed. |
| `tabs.tsx` | 140 | `transition: transform var(--motion-state-change), width var(--motion-state-change)` | Correct — token reference in inline style. No change needed. |
| `card.tsx` | 36 | `transition-colors duration-fast` | Correct — `--duration-fast` (120 ms) is the right token for card hover. No change. Note: this will change from 120 ms to 120 ms (no delta) — unchanged by the scale refinement. |

### `apps/portal/` — portal-level hardcoded durations

Scan `apps/portal/src/` for any `duration-[Xms]` arbitrary values and `transition-[Xms]` inline
styles that are not flowing through the token system. These bypass reduced-motion collapse.
Priority targets:

- Any `duration-[200ms]`, `duration-[180ms]`, `duration-[220ms]` — these shadow the prior
  `--duration-subtle` or `--duration-base` values without token coverage.
- Any inline `transitionDuration` string not citing a CSS variable.

No specific portal files were audited in scope of this pass — the architect should run a grep for
`duration-\[` across `apps/portal/src/` and reconcile against the updated token scale.

---

*Token values: `packages/ui/src/styles/primitive.css`. Reduced-motion override: `packages/ui/src/styles/theme.css`. Derived from: `docs/product/personality.md`, component audit of `drawer.tsx`, `accordion.tsx`, `tabs.tsx`, `card.tsx`, `filter-chip.tsx`, `progress.tsx`, `popover.tsx`, `scroll-area.tsx`.*
