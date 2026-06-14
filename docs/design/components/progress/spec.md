# Progress — Component Token Spec

**Palette source:** `docs/design/foundations/palette-canonical.md` (operator-approved 2026-05-29).
**Mockup reference:** v1 `.meter` block, `app-shell-variants-unified-2026-05-29.html` lines 91–95.
**Component source audited:** `packages/ui/src/components/progress.tsx`.
**Semantic refs:** `docs/design/foundations/color.md`, `sizing.md`, `radius.md`, `motion.md`.

---

## Decisions Summary

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Track color | `bg-muted` (`--color-muted`) | v1 mockup uses `var(--elev)` for the bar track background. `bg-muted` maps to the same token, so both names resolve identically — `bg-muted` is the correct semantic alias in Tailwind. The alpha-alpha `border` token would be visually too faint as a solid track fill; `bg-muted` gives a legible recessed surface. |
| 2 | Fill color | Accent gradient (`accent-hover` → `accent`) | v1 fill uses `var(--accd)` (accent-dim). The progression from dim → bright reads as a "rising instrument needle." Baseline fill = `--color-accent-hover`; complete fill = `--color-accent` (full teal). |
| 3 | Glow on fill | Yes, on dark theme only | v1 uses `box-shadow: 0 0 12px var(--glow)` on accent elements. A 4px instrument track uses a subtler glow: `0 0 6px var(--color-accent-glow)`. Light mode: no glow (light `--accent-glow` is `.10` alpha, insufficient contrast gain — omit). |
| 4 | Track height | 4px default (`sm`), 6px `md` | v1 meter bar is `height:4px`. 4px is the instrument-feel baseline. A 6px `md` size covers contexts where the bar must carry weight without a label (e.g., card-level resource meters). 8px is too bulky for an instrument-grade UI — dropped. |
| 5 | Radius | `3px` (both track and fill) | v1 mockup uses `border-radius:3px` explicitly, not `border-radius:9999px`. Pill tracks read consumer/friendly; 3px reads instrument/technical. Tailwind: `rounded-[3px]` (not `rounded-full`, not `rounded-sm` which is 2px). |
| 6 | Labels | Built-in label row, left + right slots | v1 meter has `.row` with `display:flex; justify-content:space-between` and `font-mono 10.5px color:var(--mid)` with bold values in `color:var(--hi)`. This pattern is load-bearing across instrument panels. Ship the label row as an opt-in composed slot: `label` (string, left) + `valueLabel` (string, right). |
| 7 | Indeterminate | Sweep gradient, not pulse | v1 fill is `linear-gradient(90deg, var(--accd), var(--acc))`. Indeterminate uses this same gradient on the sweeping bar to maintain visual language continuity. Keep `translateX(-100% → 350%)` sweep mechanics, swap fill to gradient. |
| 8 | Status variants | Yes: default / success / warning / error | HUD eval runs carry scored/warning/errored states throughout the pipeline. Consistency requires status fills that match badge semantics. Fill swaps only — track, radius, height unchanged. |
| 9 | Size variants | `sm` (4px) and `md` (6px) | `sm` is the primary instrument default; `md` for standalone prominent meters. |
| 10 | Neutral state fill token | `--color-muted-foreground` | WCAG 1.4.11 (3:1) failed for `--color-secondary-surface` against `--color-muted` track (1.12:1 dark / 1.11:1 light — operator-confirmed override, 2026-06-13). Switched to `--color-muted-foreground` — clears 3:1 in both themes (9.08:1 dark / 7.18:1 light). Cross-role concern (text-token used as surface fill) accepted as the right trade: pristine semantic < WCAG compliance. |

---

## Anatomy

```
Default (determinate, in-progress):
  Label: "API quota"   42 / 100        ← optional label row: left descriptor + right value (font-mono, 10.5px)
  ┌────────────────────────────────────┐  ← track (bg-muted, 4px, rounded-[3px])
  │████████████░░░░░░░░░░░░░░░░░░░░░░│  ← fill (accent gradient left→right) + remainder (muted)
  └────────────────────────────────────┘

Complete (value === max):
  ┌────────────────────────────────────┐
  │████████████████████████████████████│  ← fill (flat --color-accent, teal — payoff signal)
  └────────────────────────────────────┘

Indeterminate:
  ┌────────────────────────────────────┐
  │░░░░░████████████░░░░░░░░░░░░░░░░░│  ← animated 40%-wide gradient bar sweeping L→R
  └────────────────────────────────────┘
```

---

## Track Spec

```
background:    var(--color-muted)           // #F0F2F6 light / #161D28 dark
height:        4px (sm) | 6px (md)
border-radius: 3px
overflow:      hidden
width:         100%
```

No border on track (track is a recessed surface, not a stroked container).

---

## Fill Spec

### Determinate (in-progress)

```
background:    linear-gradient(90deg, var(--color-accent-hover), var(--color-accent))
               // dark:  #1A9183 → #2BE0C8
               // light: #055E55 → #087A6C
height:        100% (inherits track)
border-radius: 3px
width:         {value / max * 100}%
transition:    width 180ms ease-out-standard (--motion-micro)
box-shadow:    0 0 6px var(--color-accent-glow)    // dark only
               // dark:  rgba(43,224,200,.14)
               // light: none
```

### Complete (value === max)

Fill color promotes from accent-dim→accent gradient to flat `--color-accent` (full signal, no gradient needed). Glow strengthens slightly as payoff:

```
background:    var(--color-accent)           // #2BE0C8 dark / #087A6C light
box-shadow:    0 0 8px var(--color-accent-glow)   // slightly stronger payoff glow, dark only
```

Applied via `data-complete` attribute on `ProgressPrimitive.Root`.

### Indeterminate

```
background:    linear-gradient(90deg, var(--color-accent-hover), var(--color-accent))
width:         40% of track
animation:     indeterminate-sweep var(--motion-continuous)
               // 1800ms ease-linear infinite
keyframe:      translateX(-100%) → translateX(350%)
transition:    none (override determinate transition)
box-shadow:    0 0 6px var(--color-accent-glow)   // dark only, moves with bar
```

Reduced-motion: `--motion-continuous` collapses to `none`. Fallback: static 40% bar at left, no animation.

**Keyframe rationale:** `translateX` (not `scaleX`) preserves `border-radius` on the fill bar. Travel `-100% → 350%` on a 40%-wide fill gives a clean left-edge-off to right-edge-off sweep. Same 1800ms period as shimmer — ambient background-register loops.

---

## Label Slot

Pattern from v1 `.meter .row`:

```
Layout:   display:flex; justify-content:space-between; width:100%
Font:     IBM Plex Mono, 10.5px (font-mono, text-[10.5px])
Weight:   normal labels → color:var(--color-muted-foreground)  // --tx-mid
          bold values  → color:var(--color-foreground), font-weight:600  // --tx-hi
Spacing:  margin-bottom: 7px (above track)
```

### Component API

```tsx
<Progress
  value={42}
  max={100}
  label="API quota"          // left-side descriptor (optional)
  valueLabel="42 / 100"      // right-side value string (optional, consumer formats)
  size="sm"                  // "sm" | "md"
  state="default"            // "default" | "success" | "warning" | "error"
/>
```

Both `label` and `valueLabel` are optional. Either alone is valid. When both absent, no row renders.

---

## States

### Rest (determinate, in-progress)

- Track: `bg-muted`
- Fill: accent gradient, width = `{value}%`
- Glow: `0 0 6px var(--color-accent-glow)` on fill (dark only)
- ARIA: `role="progressbar"`, `aria-valuenow={value}`, `aria-valuemin="0"`, `aria-valuemax={max}`

### Indeterminate

- Track: same
- Fill: accent gradient, 40% wide, sweeping left-to-right via `--motion-continuous`
- ARIA: `aria-valuenow` omitted; `aria-label` required (no numeric value to announce)

### Value-changing (determinate, updating)

- No separate visual state; width transition (`180ms ease-out-standard`) handles the change
- No layout shift: track is fixed-height fixed-width, only fill width changes

### Complete (`value === max`)

- Fill: flat `--color-accent` (no gradient), full width
- Glow: `0 0 8px var(--color-accent-glow)` — slightly boosted payoff moment (dark only)
- `data-complete` on root activates the complete fill style

### Status Variants

Status tints fill color only. Track, size, radius, and layout are unchanged.

| Variant | Fill background | Semantic token | Dark hex | Light hex |
|---|---|---|---|---|
| `default` | accent gradient | `--color-accent-hover` → `--color-accent` | `#1A9183 → #2BE0C8` | `#055E55 → #087A6C` |
| `success` | flat | `--color-state-scored` | `#35C46B` | `#2E9E43` |
| `warning` | flat | `--color-state-warning` | `#E5A52E` | `#C47A0A` |
| `error` | flat | `--color-state-errored` | `#FF5B52` | `#D23B2C` |
| `neutral` | flat | `--color-muted-foreground` | `#B3BFCE` | `#3D5269` |

Status variants use flat fills — gradients on semantic colors read decorative, not functional. Glow suppressed on `warning` and `error`.

`neutral` has no glow. `neutral` uses flat fill. `neutral` does NOT receive the `data-complete` payoff bump — neutral is a passive instrument reading, not a payoff semantic.

**Usage guidance:** Use `neutral` when the measurement is at a passive/acceptable level and requires no action (e.g., MoE ≤ 20%). Use `default` when the system is actively progressing toward a goal. Use `warning` when the measurement has crossed a threshold that warrants attention.

### Disabled

Not applicable. Progress is a read-only display element — no interactive disabled state.

---

## Sizing

| Size | Token | Track height | Tailwind | Usage |
|---|---|---|---|---|
| `sm` | `--progress-track-h-sm` | `4px` | `h-1` | Primary: sidebar meters, eval card gauges, inline pipeline status. Default size. |
| `md` | `--progress-track-h-md` | `6px` | `h-1.5` | Standalone: page-level quota bars, modal progress indicators. |

`rounded-[3px]` applied at both sizes. Radius does not scale with height.

---

## Token Table

### Track (3)

| Token | Semantic ref | Value | Notes |
|---|---|---|---|
| `--progress-track-bg` | `--color-muted` | `#F0F2F6` light / `#161D28` dark | Recessed surface |
| `--progress-track-h-sm` | — | `4px` | Default size |
| `--progress-track-h-md` | — | `6px` | Prominent contexts |

### Fill (5)

| Token | Semantic ref | Value | Notes |
|---|---|---|---|
| `--progress-fill-bg-from` | `--color-accent-hover` | `#055E55` light / `#1A9183` dark | Gradient start |
| `--progress-fill-bg-to` | `--color-accent` | `#087A6C` light / `#2BE0C8` dark | Gradient end |
| `--progress-fill-bg-complete` | `--color-accent` | same as to | Flat fill at 100% |
| `--progress-fill-glow` | `--color-accent-glow` | `rgba(43,224,200,.14)` dark / none light | Box-shadow on fill |
| `--progress-fill-transition` | `--motion-micro` | `180ms ease-out-standard` | Width grow |

### Status fills (4)

| Token | Notes |
|---|---|
| `--color-state-scored` | `success` variant |
| `--color-state-warning` | `warning` variant |
| `--color-state-errored` | `error` variant |
| `--color-muted-foreground` | `neutral` variant — passive measurement fill; no glow, no complete bump. Cross-role (text-tier token as surface fill) — operator-accepted per a11y override 2026-06-13. |

**Radius:** `3px` hardcoded (`rounded-[3px]`). Not a semantic radius token — `--radius-sm` is 2px (too tight), `--radius-md` is 6px (too large); 3px matches the v1 mockup value exactly.

**Motion (via composite roles):** `--motion-micro` (determinate fill growth, 180ms), `--motion-continuous` (indeterminate sweep, 1800ms).

---

## Code Sync Status (as of 2026-05-30)

Code in `packages/ui/src/components/progress.tsx` matches this spec. Key implementation notes:

- Track: `bg-muted`, `rounded-[3px]`, `h-1` (sm default) / `h-1.5` (md)
- Fill: `bg-gradient-to-r from-accent-hover to-accent` + `shadow-[0_0_6px_var(--color-accent-glow)]` for default state
- Complete bump: `shadow-[0_0_8px_var(--color-accent-glow)]` when `isComplete && state === "default"`
- Status variants: `bg-state-scored` / `bg-state-warning` / `bg-state-errored` flat fills
- Indeterminate: `animate-[indeterminate-sweep_var(--motion-continuous)]` with `!transition-none`
- Label row: `font-mono text-meta`, `mb-1.5`, `text-muted-foreground` label / `font-semibold text-foreground` valueLabel

---

## Updated 2026-05-30

- Consolidated from `instrument-precision-v1.md` (merged; v1 file deleted).
- Supersedes original spec (which used `--state-running` blue fill, `rounded-full` pill tracks, 8px default height).
- Light accent hex corrected: `#0E9888` → `#087A6C`; hover `#0B7A6E` → `#055E55`.

## Updated 2026-06-13

- Added `neutral` status variant (gap from /jobs/new redesign session — engineers in `group-size-control.tsx` locally rolled a `<div>` track with `bg-muted-foreground` fill because no neutral state existed in the shared component). Token chosen: `--color-secondary-surface`.
- Token swap from `--color-secondary-surface` to `--color-muted-foreground` per a11y contrast failure + operator override. `--color-secondary-surface` scored 1.12:1 dark / 1.11:1 light against `--color-muted` track, failing WCAG 1.4.11 (3:1). `--color-muted-foreground` scores 9.08:1 dark / 7.18:1 light. Cross-role use (text-token as surface fill) accepted by operator as the right trade (contrast > pristine semantic).
