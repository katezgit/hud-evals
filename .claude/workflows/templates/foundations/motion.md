# Motion Tokens

These tokens extend `packages/ui/src/styles/motion.css`. Engineers implement them
in `apps/thruscan/` as a CSS layer and as Framer Motion variant config — both are specified below.

## Duration Tokens

### Conceptual scale

| Token | Value | Personality trace | When to use |
|---|---|---|---|
| `--duration-instant` | 75ms | Swift | Micro-feedback: focus rings, checkbox ticks, toggle switches |
| `--duration-fast` | 150ms | Swift + Precise | Icon state changes, badge color transitions, hover states |
| `--duration-base` | 250ms | Precise + Confident | Standard enter/exit: dropdowns, tooltips, small overlays |
| `--duration-moderate` | 350ms | Confident | Panel slides, modal open |
| `--duration-slow` | 500ms | Alive | Skeleton-to-content reveal (once-per-session only) |
| `--duration-deliberate` | 800ms | Alive | Wallet connection ceremony only — the one once-per-session event that earns a longer duration |

Base design system defines `instant` (75ms), `fast` (150ms), `base` (250ms), `moderate` (350ms),
`slow` (500ms), `slower` (750ms). ThruScan renames `slower` → `deliberate` and shifts to 800ms.
`--duration-deliberate` must not be used on any recurring event. Only wallet connection.

### ThruScan-specific additive tokens

```css
/* apps/thruscan/styles/motion.css */
@theme inline {
  --duration-deliberate: 800ms;  /* wallet connection ceremony ONLY */

  /* Live data specific */
  --duration-flash-onset: 80ms;    /* flash-value: time from transparent to peak color */
  --duration-flash-fade: 320ms;    /* flash-value: time from peak color back to transparent */
  --duration-flash: 400ms;         /* flash-value total (onset + fade) */
  --duration-block-pulse: 200ms;   /* block-arrival acknowledgment pulse on the live dot */
  --duration-counter-digit: 120ms; /* per-digit in a number roll */
  --duration-badge-gap: 50ms;      /* gap between badge exit and badge enter in status transitions */

  /* Stagger for list items */
  --stagger-feed: 40ms;            /* between each incoming tx/block row */
}
```

**Stagger caps (derived):**
- Feed stagger cap: `floor(200ms / 40ms) = 5 rows`. Rows 6+ appear instantly.
  200ms is the product maximum for a stagger chain to feel cohesive rather than slow.
- Load-more stagger cap: `floor(320ms / 40ms) = 8 rows`. Rows 9+ appear instantly.
  320ms allows slightly longer chain for an intentional "load more" action vs. live stream.

**Counter exit duration:** Exit duration = entrance duration × 0.667 = `120ms × 0.667 ≈ 80ms`.
One source of truth: change `--duration-counter-digit` and the exit ratio updates automatically.

## Easing Tokens

### Three canonical easings

ThruScan uses exactly three easing curves. This is a strict constraint — do not add more.

| Token | Curve | Use domain |
|---|---|---|
| `--ease-shell` | `cubic-bezier(0.2, 0, 0, 1)` | UI chrome: hover, focus, panels, modals, overlays, badge swaps |
| `--ease-data` | `cubic-bezier(0.16, 1, 0.3, 1)` | Data arrivals: feed rows entering, slides, async content resolving |
| `--ease-flash` | `cubic-bezier(0.4, 0, 0.6, 1)` | Value change highlights only — symmetric bell for flash onset/fade |

**Why three and not more:** `ease-shell` and `ease-data` cover all UI motion. `ease-flash` is
functionally distinct — its symmetric curve produces the characteristic fast-arrive/slow-leave
quality that makes value changes readable. Any additional curves would be imperceptibly different
from one of these three and would add cognitive load with no perceptual return.

**Base system curves (`--ease-in`, `--ease-in-out`, `--ease-spring`, `--ease-bounce`)** remain
available from `@repo/ui` for generic use but are not used directly in ThruScan motion specs.
`--ease-spring` and `--ease-bounce` must never appear on data surfaces (see anti-personality: Playful).

### CSS token definitions

```css
@theme inline {
  /* UI chrome — panels, modals, overlays, hover, focus, badge transitions */
  --ease-shell: cubic-bezier(0.2, 0, 0, 1);

  /* Data arrivals — feed rows, slides, async content */
  --ease-data: cubic-bezier(0.16, 1, 0.3, 1);

  /* Value change highlights — flash onset and fade */
  --ease-flash: cubic-bezier(0.4, 0, 0.6, 1);
}
```

**Why no spring/bounce on data?** Springs communicate physicality and playfulness (anti-pattern:
Playful). On numeric data, an overshoot makes the value appear to pass through the correct number
before settling — this reads as inaccurate to a financial or technical user.

## Composite Transition Tokens

These combine duration + easing into named transitions for common UI patterns.

### CSS composite tokens

```css
@theme inline {
  /* ---- UI chrome (all use ease-shell) ---- */
  --transition-hover:     all var(--duration-fast) var(--ease-shell);
  --transition-focus:     all var(--duration-instant) var(--ease-shell);
  --transition-overlay:   all var(--duration-base) var(--ease-shell);
  --transition-panel:     all var(--duration-moderate) var(--ease-shell);
  --transition-modal:     all var(--duration-moderate) var(--ease-shell);

  /* ---- Data surfaces ---- */
  --transition-data-enter:   opacity var(--duration-base) var(--ease-data),
                             transform var(--duration-base) var(--ease-data);
  --transition-status:       all var(--duration-fast) var(--ease-shell);
  --transition-flash:        background-color var(--duration-flash) var(--ease-flash);

  /* ---- Blockchain-specific ---- */
  --transition-block-arrive: all var(--duration-base) var(--ease-data);
  --transition-finalized:    all var(--duration-deliberate) var(--ease-shell);
}
```

### Framer Motion transition presets

Import from the shared constants file. All UI chrome uses `ease-shell [0.2, 0, 0, 1]`.
All data arrivals use `ease-data [0.16, 1, 0.3, 1]`.

```ts
// apps/thruscan/lib/motion.ts

export const transitions = {
  // UI chrome — ease-shell
  hover:   { duration: 0.15,  ease: [0.2, 0, 0, 1] },
  focus:   { duration: 0.075, ease: [0.2, 0, 0, 1] },
  overlay: { duration: 0.25,  ease: [0.2, 0, 0, 1] },
  panel:   { duration: 0.35,  ease: [0.2, 0, 0, 1] },
  modal:   { duration: 0.35,  ease: [0.2, 0, 0, 1] },
  status:  { duration: 0.15,  ease: [0.2, 0, 0, 1] },

  // Data arrivals — ease-data
  dataEnter:   { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  blockArrive: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },

  // Value flashes — ease-flash
  flash: { duration: 0.4, ease: [0.4, 0, 0.6, 1] },

  // Wallet connection only — ease-shell at deliberate duration
  finalized: { duration: 0.8, ease: [0.2, 0, 0, 1] },

  // Counter digits — ease-data (data arrival quality)
  counterDigit: { duration: 0.12, ease: [0.16, 1, 0.3, 1] },
} as const;

export const stagger = {
  feed: 0.04,  // 40ms — feed stagger cap: 5 rows (floor(200ms / 40ms))
  list: 0.04,  // 40ms — load-more stagger cap: 8 rows (floor(320ms / 40ms))
} as const;
```

## Usage Constraints

### What MUST use tokens

- All Framer Motion `transition` props
- All CSS `transition` and `animation-duration` values
- All `animation-timing-function` values

### What MUST NOT hard-code

- No inline `transition: 0.3s ease` — always use a named token
- No Framer Motion `duration: 0.3` without referencing the token constant

### Hierarchy rule

All properties on one component share a single duration. Exception: opacity animating alongside
a transform may use `duration × 0.8` to create a lead-follow effect where opacity settles first.
Example: if transform is 250ms, opacity may be 200ms. Specify this explicitly in the component spec
when used — do not apply by default.

### Recurring event cap

No animation on a recurring event (block arrivals, tx updates, feed rows, value flashes) may
exceed 400ms total duration. This cap enforces the Swift personality adjective.
`--duration-slow` (500ms) and `--duration-deliberate` (800ms) are prohibited on recurring events.

## Component Interaction Tokens

```css
/* Skeleton shimmer */
--skeleton-duration:        1500ms;
--skeleton-timing:          ease-in-out;

/* Copy confirmation */
--copy-confirm-duration:    1500ms;   /* how long confirmed state shows before reverting */
--copy-confirm-transition:  200ms;    /* fade in/out */
```

Skeleton shimmer gradient direction: left to right. Use `--color-skeleton-base` → `--color-skeleton-shimmer` → `--color-skeleton-base`. See [color.md](./color.md) for skeleton color tokens.
