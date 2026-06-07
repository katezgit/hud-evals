# ThruScan Animation Specs

Each animation is fully specified: initial state, animate state, exit state, transition,
classification (functional or decorative), and reduced-motion fallback.
All specs target Framer Motion implementation.

## Classification Tags

Every animation carries one of two tags:

- **functional** — communicates state change that the user needs to perceive. Survives
  reduced-motion as an opacity transition. Never fully suppressed.
- **decorative** — visual polish only, no state communication. Suppressed entirely in
  reduced-motion (no opacity fallback, just instant change).

## Naming Convention

`[action]-[element]-[variant?]`

Examples: `fade-in`, `slide-up-panel`, `scale-badge-confirm`, `skeleton-shimmer`

---

## 1. Fade

### `fade-in` — standard content appearance

**Classification:** functional

**Use for:** Page sections loading in, empty state → data, async content resolving.

```
initial:  { opacity: 0 }
animate:  { opacity: 1 }
exit:     { opacity: 0 }
transition: dataEnter  (250ms, ease-data)
```

**Reduced-motion:** opacity 0→1 over 100ms, ease-shell. No change to structure.

**Do not use for:** Inline data cell updates (use flash instead). Row-level updates in a
live feed (use slide-up-row instead, which includes opacity).

### `fade-in-fast` — immediate micro-content

**Classification:** functional

**Use for:** Tooltips, hover labels, small helper text.

```
initial:  { opacity: 0 }
animate:  { opacity: 1 }
exit:     { opacity: 0 }
transition: overlay  (250ms, ease-shell)
```

**Reduced-motion:** opacity 0→1 over 75ms, ease-shell.

---

## 2. Slide

### `slide-up-row` — new list item arrival (primary pattern for live feeds)

**Classification:** functional

**Use for:** New transaction row entering the feed. New block row entering the block list.

```
initial:  { opacity: 0, y: 12 }
animate:  { opacity: 1, y: 0 }
exit:     { opacity: 0, y: -8 }
transition: dataEnter  (250ms, ease-data)
```

**Rationale:** 12px upward travel signals the row came from below (newer data flows up),
not so much that it distracts. Exit is slightly less distance (-8px) because exits should
be faster and less prominent than entrances.

**Stagger:** When multiple rows arrive simultaneously, stagger each by `--stagger-feed`
(40ms). Cap = `floor(200ms / 40ms) = 5 rows`. Rows 6+ appear instantly.

**Reduced-motion:** opacity 0→1 over 100ms, ease-shell. No Y translation.

### `slide-in-panel` — right-side detail panel

**Classification:** functional

**Use for:** Block detail panel, transaction detail panel sliding in from the right edge.

```
initial:  { opacity: 0, x: 32 }
animate:  { opacity: 1, x: 0 }
exit:     { opacity: 0, x: 32 }
transition: panel  (350ms, ease-shell)
```

**Rationale:** `ease-shell` because this is UI chrome (a panel is part of the shell, not
a data arrival). 32px communicates directionality without a theatrical sweep. Opacity
ensures the panel does not appear as a ghost over the list during travel.

**Reduced-motion:** opacity 0→1 over 100ms, ease-shell. No X translation.

### `slide-up-modal` — modal / dialog

**Classification:** functional

**Use for:** Search command palette, confirmation dialogs.

```
initial:  { opacity: 0, y: 16, scale: 0.98 }
animate:  { opacity: 1, y: 0, scale: 1 }
exit:     { opacity: 0, y: 8, scale: 0.99 }
transition: modal  (350ms, ease-shell)
```

**Backdrop:** Fade in at `250ms, ease-shell`. Fade out at `200ms, ease-shell`.

**Reduced-motion:** opacity 0→1 over 150ms, ease-shell. No Y translation, no scale.

---

## 3. Scale

### `scale-badge-status` — transaction status badge state change

**Classification:** functional

**Use for:** The badge that shows Pending / Confirmed / Finalized transitions.

```
State change sequence:
  1. Current badge exits: { opacity: 0, scale: 0.85 }
     duration: 150ms, ease-shell
  2. Gap: --duration-badge-gap  (50ms)
  3. New badge enters:    { opacity: 1, scale: 1 }
     duration: 200ms, ease-shell
```

The gap (`--duration-badge-gap: 50ms`) gives the eye a moment to register the old state
is gone before the new state arrives. The total sequence is ~400ms, within the recurring
event cap.

Exit must complete before entrance begins. This makes the new state land cleanly rather
than overlapping with the old one.

**Reduced-motion:** opacity cross-fade over 150ms, ease-shell. No scale.

### `scale-icon-action` — interactive icon feedback (hover/press)

**Classification:** decorative

**Use for:** Copy address button, external link icon, expand chevron.

```
hover:   { scale: 1.08 }  — 150ms, ease-shell
press:   { scale: 0.94 }  — 75ms,  ease-shell
release: { scale: 1 }     — 150ms, ease-shell
```

**Do not apply** to icons inside table rows or dense data grids. Only standalone action
icons that have clear tap/click affordance.

**Reduced-motion:** No scale change. Color change only (handled via CSS `:hover` state).
Press may keep a very subtle `scale: 0.97` at 75ms if product decides tap feedback matters
on mobile — spec this explicitly if enabled.

---

## 4. Skeleton Loading

### Classification: decorative (shimmer) / functional (skeleton shapes)

The shimmer animation is decorative — it communicates "loading" but the skeleton shape
communicates that already. Shimmer is suppressed in reduced-motion.
The skeleton shapes themselves and the content reveal are functional.

### Design intent

Skeleton shapes must match the pixel dimensions of the content they replace.
The shimmer moves left-to-right at a constant pace — the shimmer is the only moving
element; the skeleton shapes themselves do not pulse in opacity.

### Shimmer spec

**Implementation: `background-position` animation — not `translateX`.**

Using `translateX` on each skeleton element promotes every element to its own GPU
compositor layer. With 50+ skeleton rows, this creates compositor memory pressure with
no visual benefit. `background-position` animation achieves the same shimmer effect
while remaining on the default layer.

```css
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface-raised) 40%,
    var(--color-surface-overlay) 60%,
    var(--color-surface-raised) 100%
  );
  background-size: 200% 100%;
  background-position: 100% 0;
  animation: skeleton-sweep 1600ms linear infinite;
}

@keyframes skeleton-sweep {
  0%   { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
```

**Color values (dark theme):**
- base: `#1c1917` (`--color-surface-raised`)
- highlight: `#292524` (`--color-surface-overlay`)
- ratio: base 40% / highlight 20% / base 40%

**Why same phase across all skeletons?** Staggered shimmer across multiple rows creates
visual noise in a data-dense layout. Synchronized shimmer reads as a single loading state.

### `will-change` lifecycle for skeleton

Add `will-change: transform` only when the shimmer animation begins, not permanently.
Reset to `will-change: auto` after `animationend` or when the skeleton is removed from
the DOM. Leaving `will-change` permanently active wastes compositor memory.

### Content reveal

When real data arrives to replace the skeleton:

```
Skeleton exit: { opacity: 0 }  — 150ms, ease-shell
Content enter: { opacity: 1 }  — 250ms, ease-data  (50ms delay after skeleton exit)
```

Do not use transform on skeleton → content transitions. The layout must not shift.
The skeleton shape must exactly match the content dimensions.

### Per-element skeleton widths

| Content type | Skeleton width |
|---|---|
| Block hash | 100% of cell |
| Transaction hash | 100% of cell |
| Address (truncated) | 80% of cell |
| Numeric value (balance) | 60% of cell |
| Timestamp | 50% of cell |
| Badge / status | Fixed 72px × 22px |

---

## 5. Pulse (Live Data Indicator)

### `pulse-live-dot` — indicator that a feed is receiving live data

**Classification:** decorative (ambient pulse is decorative; dot color is functional)

**Use for:** The "live" indicator dot next to "Latest Blocks" and "Latest Transactions"
headings. Should pulse while the gRPC stream is connected and receiving.

**Two separate animations — do not confuse them:**

**Ambient pulse (continuous, 2000ms cycle) — decorative:**
```
Pulse sequence (CSS animation, not Framer Motion):
  0%:    { opacity: 1,   scale: 1 }
  50%:   { opacity: 0.4, scale: 0.85 }
  100%:  { opacity: 1,   scale: 1 }

Duration:   2000ms
Easing:     ease-in-out
Iteration:  infinite
```

**Block-arrival acknowledgment pulse (one-shot, 200ms) — functional:**
```
Fires once per block arrival, on top of the ambient pulse.
  0%:    { opacity: 1,   scale: 1 }
  50%:   { opacity: 1,   scale: 1.3 }
  100%:  { opacity: 1,   scale: 1 }

Duration:   200ms
Easing:     ease-out
Iteration:  1
```

The acknowledgment pulse is fast (200ms) because it is a tight acknowledgment signal,
not a ceremony. It must complete well within the 400ms recurring event cap.

**Stop pulsing** when the stream disconnects. Show a static grey dot instead.
**Restart pulse** when reconnected — resume without animating the transition back.

**Color:** `--color-status-success` (green) when connected. `--color-text-tertiary`
(grey) when disconnected.

**Reduced-motion:** Ambient pulse suppressed — static green dot at full opacity.
Acknowledgment pulse suppressed — dot stays static.

### `flash-value` — highlight on numeric value change

**Classification:** functional

**Use for:** Block height counter ticking up, balance updating, transaction count
incrementing. Any number that changes due to live data.

**Direction encoding:** flash-value encodes the direction of change via color.

```
Value increase:
  0%:   { background-color: transparent }
  20%:  { background-color: color-mix(in oklch, --color-status-success 15%, transparent) }
  100%: { background-color: transparent }

Value decrease:
  0%:   { background-color: transparent }
  20%:  { background-color: color-mix(in oklch, --color-status-error 15%, transparent) }
  100%: { background-color: transparent }

Directionally neutral (block height, tx count — no up/down meaning):
  0%:   { background-color: transparent }
  20%:  { background-color: color-mix(in oklch, --color-status-info 15%, transparent) }
  100%: { background-color: transparent }
```

**Asymmetric timing:** onset 80ms (`--duration-flash-onset`), fade 320ms
(`--duration-flash-fade`). Total: 400ms (`--duration-flash`). The `ease-flash` curve
(`cubic-bezier(0.4, 0, 0.6, 1)`) drives this — fast to peak, slow back to transparent.
This is ThruScan's signature motion quality: data arrives urgently, then settles.

**Settle gate:** Do not trigger a new flash if the previous flash has not completed.
Gate condition: `if (Date.now() - lastFlash < FLASH_DURATION) { updateValue(); return; }`
Update the value immediately but skip the animation. This prevents permanent flashing
on rapid updates (e.g. balance updating 10x per second during block production).

```
FLASH_DURATION = 400  // matches --duration-flash in ms
```

**Forced-colors fallback:** In `@media (forced-colors: active)`, replace the background
flash with a 2px outline:

```css
@media (forced-colors: active) {
  .flash-value-active {
    outline: 2px solid ButtonText;
    outline-offset: 1px;
    background-color: transparent !important;
  }
}
```

The outline communicates "this changed" without relying on background fills, which
forced-colors mode overrides.

**Reduced-motion:** Keep. Background-color flash at 150ms. No transform. This is
functional state feedback — it must survive reduced-motion.

---

## 6. Number / Counter Animation

### `counter-roll` — block height, transaction count, fee value

**Classification:** functional

**Use for:** The primary block height display in the header or stats bar. Any single
numeric value that increments with each new block.

**Mechanism:** Vertical digit roll. Each digit column scrolls to its new value.
Only digits that change roll — unchanged digits hold still.

```
Per-digit transition:
  direction:  upward scroll (new value comes from below)
  distance:   1em (one character height)
  duration:   --duration-counter-digit  (120ms)
  easing:     ease-data  (cubic-bezier(0.16, 1, 0.3, 1))
  stagger:    right-to-left (ones digit animates first, then tens, then hundreds)
              stagger delay: 20ms per digit position
```

**Why right-to-left stagger?** The ones digit (rightmost) changes most frequently and
animates first. Carries propagate leftward — the tens digit only changes when the ones
digit rolls from 9 to 0, and the hundreds digit only when the tens carry. The stagger
direction mirrors how numbers actually increment, so the cascade reads as numerically
correct rather than arbitrary.

**When to use counter-roll vs flash-value:**

| Situation | Use |
|---|---|
| Header block height — prominent, single value, always visible | counter-roll |
| Block height inside a table row | flash-value |
| Balance in account view | flash-value |
| Transaction count in stats bar | flash-value |
| Fee or gas value | flash-value (never roll — fees change non-incrementally) |

**Rationale:** Counter-roll is visually prominent. Reserve it for one or two most
important persistent counters on the page. Overusing it on every number creates an
anxious, flickering UI (anti-personality: anxious).

### Framer Motion implementation

Counter-roll uses `AnimatePresence` + `motion.span` per digit.
The digit container has `overflow: hidden` to clip the travel.

```
Digit enter:
  initial: { y: "100%", opacity: 0 }
  animate: { y: "0%",   opacity: 1 }
  transition: counterDigit  (120ms, ease-data)

Digit exit:
  exit: { y: "-100%", opacity: 0 }
  transition: { duration: exit_duration, ease: [0.4, 0, 1, 1] }
  where exit_duration = 120ms × 0.667 = 80ms
```

Exit duration = entrance duration × 0.667. This ratio is the single source of truth —
if `--duration-counter-digit` changes, the exit duration updates automatically.
Exit must clear before the entering digit lands.

**Reduced-motion:** Instant number swap. No scroll. Use `AnimatePresence` with
`duration: 0` on both enter and exit transitions.

---

## 7. Common UI Patterns

These stubs define minimum viable motion for patterns not specific to blockchain data.
Engineers must not use arbitrary values — use the tokens below.

### Route transitions

```
Cross-dissolve fade:
  exit:    { opacity: 0 }  — 200ms, ease-shell
  enter:   { opacity: 1 }  — 200ms, ease-shell
  mode: "wait" (new page waits for old page to exit)
```

No slide or scale on route transitions. The content context changes entirely — a
directional slide implies spatial navigation that ThruScan's flat URL structure does not
support.

**Classification:** decorative

**Reduced-motion:** Instant (duration: 0).

### Tab switching

```
Content area:
  exit:  { opacity: 0 }  — 150ms, ease-shell
  enter: { opacity: 1 }  — 150ms, ease-shell
```

No tab indicator slide (the underline/border that moves between tab labels).
Tab indicator changes instantly — the content fade is sufficient signal.

**Classification:** decorative

**Reduced-motion:** Instant (duration: 0).

### Dropdowns and popovers

```
origin: transform-origin at trigger point (top-left for left-anchored, etc.)
enter: { opacity: 0, scale: 0.97 } → { opacity: 1, scale: 1 }  — 200ms, ease-shell
exit:  { opacity: 1, scale: 1 }   → { opacity: 0, scale: 0.97 } — 150ms, ease-shell
```

Scale origin set via CSS `transform-origin` to match the trigger anchor point.

**Classification:** decorative

**Reduced-motion:** opacity fade only, 100ms. No scale.

### Toast notifications

```
Enter: slide-in from top-right
  initial: { opacity: 0, x: 16, y: -8 }
  animate: { opacity: 1, x: 0,  y: 0  }
  transition: 250ms, ease-data

Auto-dismiss fade (after display duration):
  exit: { opacity: 0 }  — 200ms, ease-shell
```

Toasts appear at top-right. Stack vertically with 8px gap.
Display duration: 4000ms for informational, 6000ms for errors.

**Classification:** functional (for status toasts) / decorative (for confirmation toasts)

**Reduced-motion:** opacity fade only, 150ms. No translation.

### Error states

```
Error message:
  enter: { opacity: 0 } → { opacity: 1 }  — 200ms, ease-shell
```

No slide, no scale. Errors appear with minimal drama — the content of the error message
is the signal, not the animation. The animation would add perceived severity.

**Classification:** functional

**Reduced-motion:** opacity 0→1 over 100ms. Unchanged.

### Focus ring

```
Appearance: instant (0ms transition-delay, 0ms duration)
  — focus ring must never have a delay; delayed focus rings fail WCAG 2.4.7
Blur (fade out): { opacity: 0 }  — 75ms, ease-shell
```

Focus ring uses CSS `:focus-visible`. No Framer Motion required.

**Classification:** functional

**Reduced-motion:** Identical — focus ring is already opacity-only with no transform.
