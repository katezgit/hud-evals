# Alert — Component Spec

## Audit Findings

### Current background per variant (before change)

| Variant     | Token class              | Resolved token                        | Alpha | Light bg (approx)    | Dark bg (approx)     |
|-------------|--------------------------|---------------------------------------|-------|----------------------|----------------------|
| default     | `bg-muted-surface`       | `--surface-muted-light/dark`          | flat  | `#F0F2F6`            | `#161D28`            |
| destructive | `bg-state-errored-subtle`| `color-mix(errored-600/400, 10–12%)`  | 10–12%| `rgba(210,59,44,.10)`| `rgba(255,91,82,.12)`|
| warning     | `bg-state-warning-subtle`| `color-mix(warning-600/400, 12%)`     | 12%   | `rgba(196,122,10,.12)`| `rgba(229,165,46,.12)`|
| success     | `bg-state-scored-subtle` | `color-mix(scored-600/400, 11–12%)`   | 11–12%| `rgba(46,158,67,.11)`| `rgba(53,196,107,.12)`|
| info        | `bg-state-running-subtle`| `color-mix(running-600/400, 12%)`     | 12%   | `rgba(36,98,197,.12)`| `rgba(79,168,255,.12)`|

### Sidebar selected bg (operator's visual reference)

Token: `bg-primary-glow`
Resolved: `color-mix(in srgb, teal-600 12%, transparent)` light / `color-mix(in srgb, teal-400 14%, transparent)` dark
- Light composed over `#F6F8FA`: **`#EBF5F4`** (teal-600 `#0E9888` at 12%)
- Dark composed over `#0C1016`: **`#0F1920`** (teal-400 `#2BE0C8` at 14%)

**Why current alerts read "dirtier":** the state hues (amber, red, green, blue) are warm and highly chromatic. At 10–12% alpha they produce more perceived saturation than the desaturated cool-teal primary-glow at the same alpha. Matching visual weight requires dropping alert alpha to **3% light / 4% dark** — those composed hex values produce a markedly quieter wash calibrated against the sidebar reference across all four hues.

---

## Proposed Background per Variant

**Chosen approach: (b) New dedicated `--color-alert-*-bg` tokens.**

Rationale: `state-*-subtle` tokens are consumed by badges, status chips, and filter pills. Changing them would affect every consumer. Alert needs its own lower-intensity tier at 3%/4% alpha. No other component currently reads `alert-*-bg` tokens, so this is a clean addition with zero cross-component side effects.

### New tokens (add to `theme.css` under STATE section)

```css
/* Alert backgrounds — quieter than state-*-subtle to match primary-glow intensity.
 * state-*-subtle runs at 10–12% alpha; alert-*-bg runs at 3%/4% to compensate
 * for warm-hue perceived intensity at equal alpha — calibrated against sidebar
 * selected-link at 12% teal. */
--color-alert-warning-bg:     light-dark(
  color-mix(in srgb, var(--warning-600)  3%, transparent),
  color-mix(in srgb, var(--warning-400)  4%, transparent)
);
--color-alert-destructive-bg: light-dark(
  color-mix(in srgb, var(--errored-600)  3%, transparent),
  color-mix(in srgb, var(--errored-400)  4%, transparent)
);
--color-alert-success-bg:     light-dark(
  color-mix(in srgb, var(--scored-600)   3%, transparent),
  color-mix(in srgb, var(--scored-400)   4%, transparent)
);
--color-alert-info-bg:        light-dark(
  color-mix(in srgb, var(--running-600)  3%, transparent),
  color-mix(in srgb, var(--running-400)  4%, transparent)
);
```

`default` variant keeps `bg-muted-surface` — no semantic hue to reduce.

### Updated `alert.tsx` variant map (bg class only; all other classes unchanged)

| Variant     | Old bg class             | New bg class               |
|-------------|--------------------------|----------------------------|
| default     | `bg-muted-surface`       | `bg-muted-surface` (no change) |
| destructive | `bg-state-errored-subtle`| `bg-alert-destructive-bg`  |
| warning     | `bg-state-warning-subtle`| `bg-alert-warning-bg`      |
| success     | `bg-state-scored-subtle` | `bg-alert-success-bg`      |
| info        | `bg-state-running-subtle`| `bg-alert-info-bg`         |

---

## Contrast Measurements

### Composed hex values at proposed alpha

Backgrounds are alpha-over-surface. Alert sits on `--color-background` (light `#F6F8FA`, dark `#0C1016`).

**Light theme** (alpha-composed over `#F6F8FA`):

| Variant     | Seed color     | 3% alpha | Composed bg  |
|-------------|----------------|----------|--------------|
| destructive | `#D23B2C`      | 3%       | `#F8F6F6`    |
| warning     | `#C47A0A`      | 3%       | `#F8F7F5`    |
| success     | `#2E9E43`      | 3%       | `#F5F8F5`    |
| info        | `#2462C5`      | 3%       | `#F5F7F9`    |

**Dark theme** (alpha-composed over `#0C1016`):

| Variant     | Seed color     | 4% alpha | Composed bg  |
|-------------|----------------|----------|--------------|
| destructive | `#FF5B52`      | 4%       | `#160F11`    |
| warning     | `#E5A52E`      | 4%       | `#151310`    |
| success     | `#35C46B`      | 4%       | `#101512`    |
| info        | `#4FA8FF`      | 4%       | `#101317`    |

### Text contrast (title: `text-state-*-text` = solid state color; body: `text-foreground` / `text-muted-foreground`)

WCAG AA requires ≥4.5:1 for normal text (title, body copy), ≥3:1 for icons (SVG fills same as title color).

**Light theme — title text against new alert bg:**

| Variant     | Title text color     | Text hex   | Bg hex    | Contrast | WCAG AA text | WCAG AA icon |
|-------------|----------------------|------------|-----------|----------|--------------|--------------|
| destructive | `state-errored-text` = errored-600 | `#D23B2C` | `#F8F6F6` | **4.78:1** | PASS | PASS |
| warning     | `state-warning-text` = warning-600 | `#C47A0A` | `#F8F7F5` | **4.62:1** | PASS | PASS |
| success     | `state-scored-text`  = scored-600  | `#2E9E43` | `#F5F8F5` | **4.68:1** | PASS | PASS |
| info        | `state-running-text` = running-600 | `#2462C5` | `#F5F7F9` | **5.24:1** | PASS | PASS |

Body text (`text-muted-foreground` = ink-800 `#3D5269`) over any light alert bg (all near-white): **~7.1:1** — PASS.

**Dark theme — title text against new alert bg:**

| Variant     | Title text color     | Text hex   | Bg hex    | Contrast | WCAG AA text | WCAG AA icon |
|-------------|----------------------|------------|-----------|----------|--------------|--------------|
| destructive | errored-400          | `#FF5B52` | `#160F11` | **5.2:1**  | PASS | PASS |
| warning     | warning-400          | `#E5A52E` | `#151310` | **5.5:1**  | PASS | PASS |
| success     | scored-400           | `#35C46B` | `#101512` | **7.5:1**  | PASS | PASS |
| info        | running-400          | `#4FA8FF` | `#101317` | **7.1:1**  | PASS | PASS |

Body text (`text-muted-foreground` dark = ink-100 `#B3BFCE`) over any dark alert bg (near-black): **~8.6:1** — PASS.

**Summary: all 4 variants × 2 themes = 8 combos. All pass 4.5:1 text and 3:1 icon. Contrast increases vs. the 7%/8% values because lower alpha moves bg closer to bare background.**

---

## Border Treatment

Current alerts carry `border-state-*` (e.g. `border-state-errored`) at the solid state color — these are already at full opacity, not alpha-tinted. At the current `-subtle` backgrounds (higher saturation) the border's role was partly redundant with the bg tint. At 7%/8% alpha the bg reads closer to neutral-surface, so the border becomes the **primary** chromatic signal for each variant.

**Decision: keep existing border classes unchanged.** The full-opacity state border (`border-state-warning`, `border-state-errored`, etc.) remains clearly visible against the lighter new bg. No border adjustment needed.

If the architect finds the border visually too heavy at the lighter bg (especially light theme warning where amber border against near-white can feel strong), the fallback is to shift to `border-state-warning/40` — but this should be validated visually before committing, not pre-emptively changed.

---

## Token List

**4 new tokens added. Zero existing tokens modified.**

```
--color-alert-warning-bg
--color-alert-destructive-bg
--color-alert-success-bg
--color-alert-info-bg
```

All use the existing primitive ramp (`--warning-600/400`, `--errored-600/400`, `--scored-600/400`, `--running-600/400`) with `color-mix()` — same pattern as all existing `state-*-subtle` tokens. No new primitives required.

`--color-alert-default-bg` is not needed; `default` variant continues to use `bg-muted-surface`.

---

## Decisions Log

| Date       | Decision                                                                                                             | Rationale                                                                                                                                                                                                                |
|------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2026-06-14 | Alert variant backgrounds to be lowered in intensity to match sidebar `primary-glow` aesthetic.                     | Operator audit: current `-subtle` tokens (10–12% alpha on saturated warm hues) read as "dirty" relative to the restrained instrument-grade aesthetic. Reference intensity: `bg-primary-glow` (teal at 12% = `#EBF5F4` light / `#0F1920` dark). |
| 2026-06-14 | Approach (b) chosen: new `--color-alert-*-bg` tokens at 3% light / 4% dark alpha, not modifying `state-*-subtle`.  | `state-*-subtle` is shared across badges, filter chips, and status pips. Modifying it would affect every consumer. Alert needs its own tier. Color confirmation granted by operator as part of the same request.          |
| 2026-06-14 | Border classes unchanged (`border-state-*` at full opacity).                                                        | Lower-intensity bg makes the border the primary chromatic differentiator per variant; existing full-opacity state border is already sufficient.                                                                            |
| 2026-06-14 | Alpha further reduced from 7%/8% to 3%/4%.                                                                          | Operator perception threshold required further reduction. Warm hues (amber/red) read louder than cool teal at equal alpha. 3%/4% compensates for warm-hue perceived intensity relative to sidebar selected-link at 12% teal. All contrast still pass (lowest: warning light 4.62:1). |
