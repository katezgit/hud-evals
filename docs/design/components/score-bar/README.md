# ScoreBar — Component Spec

**Semantic refs:** `docs/design/foundations/color.md`, `docs/design/foundations/sizing.md`, `docs/design/foundations/radius.md`.
**Implementation origin:** `apps/portal/src/app/(app)/jobs/new/_components/step-tasks.tsx` (`RewardBar` local component, PR #45).

---

## Decisions Summary

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | New primitive vs `Progress` variant | **New primitive** | Three independent concerns differ from `Progress`: semantics (finished score vs in-flight measurement), dimensions (fixed `w-16` vs `w-full`), and fill palette (score-tier colors vs accent gradient). Adding `size="xs"` + `width="fixed"` + `state={…mapped}` to Progress simultaneously would make it a different primitive under the same name. Screen-reader concern: `role="progressbar"` + `aria-valuenow` on a static completed value implies something is in progress. |
| 2 | Name: `ScoreBar` vs `RewardBar` | **`ScoreBar`** | `ScoreBar` covers all scalar score readouts (accuracy, win rate, calibration, reward). `RewardBar` is RL-specific; model picker (USAGE column) and trace grid (per-trace score) are non-RL contexts that may want the same primitive. General name, no loss of precision at the RL call site. |
| 3 | Track color | `bg-secondary-surface` | Matches the engineer's implementation. Distinct from `Progress`'s `bg-muted` — a slightly lighter recessed surface in dense row contexts, where full `bg-muted` creates a heavier band. |
| 4 | Fill: low-score color | `bg-state-warning` | Amber/warning communicates "below threshold." Matches existing state vocabulary. |
| 5 | Fill: high-score color | `bg-state-scored` | Green/scored communicates "met threshold." Consistent with badge and Progress status semantics. |
| 6 | Threshold | `pct >= 50` → high, `pct < 50` → low | Ratifies the engineer's implementation. 50% is the natural midpoint; a model that answered fewer than half the tasks correctly is underperforming. Adjustable per team/taskset in the future, but the component always takes a boolean or computed value — the threshold is the consumer's concern, not the primitive's. |
| 7 | Neutral / "no data" state | **Not specified** | A score bar without a score has no meaning. "No data" is an empty-state concern at the list level — render nothing or a dash, never a neutral bar. |
| 8 | Radius | `rounded-sm` (2px) | Progress uses `3px` (`rounded-[3px]`) to read "instrument." ScoreBar's smaller fixed-width footprint reads crisper at `2px` (Tailwind `rounded-sm`). Not 3px exact — different primitive, different context, but same instrument-grade vocabulary. |
| 9 | Numeric label slot | External (consumer composes) | The bar does not own the number. Adjacent `<span>` with `{pct}%` is the readable value. Screen readers announce the number; the bar is `aria-hidden`. |
| 10 | Motion | None | Static read-out of a finished score. No transitions, no indeterminate state, no animation. |

---

## Pattern Summary

`ScoreBar` is a fixed-width horizontal track + fill for displaying a **completed scalar score** (0–100) in dense list rows. It always shows a finished measurement — there is no in-flight or indeterminate state. The fill color encodes score tier (amber below threshold, green at or above) for immediate at-a-glance legibility without reading the number. The adjacent numeric label, composed externally by the consumer, is the screen-reader-accessible value; the bar itself is presentational. Primary use: per-row inline in task pickers (reward score), model comparison tables (accuracy/usage), and trace grids (per-trace reward).

---

## Anatomy

```
Per-row usage (task picker):

  ┌──────────────────┐  ◄── track: fixed 64px × 8px, bg-secondary-surface, rounded-sm
  │████████░░░░░░░░░░│  ◄── fill: bg-state-scored OR bg-state-warning, height 100%, rounded-sm
  └──────────────────┘
                  47%   ◄── adjacent numeric label (consumer-owned <span>), NOT inside this primitive

  [track + fill] [label]
  └──ScoreBar──┘ └─consumer <span>─┘
```

The `ScoreBar` boundary stops at the closing track. The consumer places the numeric label in the same flex row.

---

## Dimensions

| Property | Value | Tailwind | Notes |
|---|---|---|---|
| Width | 64px (fixed) | `w-16` | Never stretches. Inline in row context. |
| Height | 8px | `h-2` | Heavier than `Progress sm` (4px) — needs to read as a distinct scored band, not a thin meter. |
| Track radius | 2px | `rounded-sm` | Crisper than Progress's 3px; suits the narrower fixed footprint. |
| Fill radius | 2px | `rounded-sm` | Matches track. |
| `overflow` | `hidden` | `overflow-hidden` | Clips fill at track bounds. |

---

## Track Spec

```
background:    var(--color-secondary-surface)
height:        8px   (h-2)
width:         64px  (w-16) — fixed, never fluid
border-radius: 2px   (rounded-sm)
overflow:      hidden
display:       block
```

No border on track.

---

## Fill Spec

```
height:        100% (inherits track)
border-radius: 2px  (rounded-sm)
width:         clamp(0%, {pct}%, 100%)   // consumer computes; primitive clamps defensively
transition:    none — static snapshot
```

Fill color is determined by score tier (consumer passes the resolved class or a boolean, engineer's call):

| Tier | Condition | Fill token | Semantic ref |
|---|---|---|---|
| High | `pct >= 50` | `bg-state-scored` | `--color-state-scored` |
| Low | `pct < 50` | `bg-state-warning` | `--color-state-warning` |

No gradient. No glow. Flat fill reads as a "recorded value," not a live instrument.

---

## States

### High (score ≥ 50)

- Track: `bg-secondary-surface`
- Fill: `bg-state-scored` (green), width = `{pct}%`

### Low (score < 50)

- Track: `bg-secondary-surface`
- Fill: `bg-state-warning` (amber), width = `{pct}%`

### "No Data" / Loading

Not a `ScoreBar` state. The consumer renders `—` or nothing. The primitive is not rendered when a score is absent.

---

## Token Table

**Zero new tokens introduced.** All tokens are existing semantic refs.

### Track (1)

| Token (semantic) | Tailwind class | Value | Notes |
|---|---|---|---|
| `--color-secondary-surface` | `bg-secondary-surface` | Context-dependent | Recessed row surface, lighter than `bg-muted` in dense list |

### Fill (2)

| Token (semantic) | Tailwind class | Tier | Notes |
|---|---|---|---|
| `--color-state-scored` | `bg-state-scored` | High (≥ 50%) | Green — score met threshold |
| `--color-state-warning` | `bg-state-warning` | Low (< 50%) | Amber — score below threshold |

### Dimensions (hardcoded, not tokenized)

| Property | Value | Rationale |
|---|---|---|
| Width | `w-16` (64px) | Fixed-footprint primitive; no size variants |
| Height | `h-2` (8px) | Distinct visual weight from Progress tracks |
| Radius | `rounded-sm` (2px) | Tailwind built-in; no custom token needed |

---

## Accessibility

The bar is **decorative reinforcement** of the adjacent numeric label. The number is the meaningful value; the bar adds tier context visually only.

```
aria-hidden="true"   on the outer <span> (track)
role:                none (implicit via aria-hidden)
```

**MUST compose with a visible numeric label sibling.** This is a hard contract, not a recommendation. A consumer who renders `<ScoreBar value={47} />` alone produces a UI element invisible to screen reader users (aria-hidden) and conveys score tier via color alone (WCAG 1.4.1). Always render an adjacent numeric `<span>` with the percentage.

The consumer's adjacent numeric label — `<span className="font-mono text-caption tabular-nums text-muted-foreground">{pct}%</span>` — is the accessible text node. No `aria-label` on the bar. No `role="meter"` or `role="progressbar"` — both imply measurement-in-progress or a live range, which is semantically wrong here.

### WCAG 1.4.11 — known variance

**Known WCAG 1.4.11 variance (light theme).** Measured fill/track contrast in light theme is 2.77:1 (`bg-state-scored` / `bg-secondary-surface`) and 2.75:1 (`bg-state-warning` / `bg-secondary-surface`) — below the 3:1 minimum for non-text UI components. Accepted by operator 2026-06-13 because (a) the primitive is `aria-hidden`, so SR users get the score via the mandatory adjacent numeric label, (b) the bar is decorative reinforcement of a value that is already on-screen as text, (c) physical size (8px × 64px) makes the contrast less load-bearing than a header-scale meter, (d) global token rebalancing would cascade to `--color-state-{scored,warning}-text` usage elsewhere with regression risk. Dark theme passes (6.65:1 / 7.00:1). Re-evaluate when the design-tokens lifecycle next opens for calibration.

---

## Composition Pattern

The primitive is the track + fill only. The consumer composes the numeric label alongside:

```tsx
// Consumer responsibility:
<span className="ml-auto flex shrink-0 items-center gap-2">
  <ScoreBar pct={pct} />
  <span className="font-mono text-caption tabular-nums text-muted-foreground">
    {pct}%
  </span>
</span>
```

**Prop shape (visual contract only — no JSX API defined here):**

| Prop | Type | Notes |
|---|---|---|
| `pct` | `number` (0–100) | Scalar score. Component clamps to `[0, 100]` defensively. |

No `valueLabel` slot. No `label` slot. No `size` prop (one size only). No `state` prop (tier derived from `pct` internally against the 50% threshold).

---

## Where It's Used

| Surface | Column / context | Status |
|---|---|---|
| `/jobs/new` → task picker | Per-row reward score (right-aligned inline) | Current — originated in PR #45 |
| Model picker (model comparison table) | USAGE or accuracy column | Candidate — same fixed-width inline pattern |
| Trace grid | Per-trace reward column | Candidate — same semantics, same fixed footprint |

---

## Differences from `Progress` — One-Line Reference

> **`Progress`** = in-flight measurement, `w-full`, accent gradient, indeterminate state, announces "47% progress" to screen readers.
> **`ScoreBar`** = finished score readout, `w-16` fixed, state-tier flat fill, no indeterminate, `aria-hidden` (number label speaks for it).

---

## Decisions Log

| Date | Entry |
|---|---|
| 2026-06-13 | WCAG 1.4.11 light-theme variance accepted by operator override; spec §Accessibility mandates the numeric-label sibling as a hard contract. |
| 2026-06-13 | Primitive created (gap from /jobs/new redesign session, PR #45). Resolved as **new primitive** over `Progress size="xs"` because semantics, dimensions, and fill palette are three independent concerns that differ: `Progress` is in-flight + `w-full` + accent gradient; this bar is a finished score + `w-16` fixed + state-tier flat fill. Naming settled on `ScoreBar` (not `RewardBar`) for generality across RL and non-RL score columns. Zero new tokens introduced. |
