# Stepper — Component Token Spec

**Component source audited:** `apps/portal/src/app/(app)/jobs/new/_components/stepper-header.tsx`
**Semantic refs:** `docs/design/components/progress/spec.md`, `docs/design/guidelines/app-shell-layout.md`

---

## Pattern Summary

Stepper is a horizontal step-indicator used at the top of multi-step wizards. It communicates position in a linear sequence via numbered circles (pending, active, completed) connected by hairline dividers. Step content — labels, descriptions, and step count — is entirely consumer-provided; the primitive owns only visual rendering and ARIA semantics. On narrow viewports the full step row collapses to a single-step summary showing "Step N of M" with the current label and description. No navigation affordance is built in — the consumer controls progression; the stepper is presentational.

---

## Anatomy

```
Desktop (md+): horizontal list
┌─────────────────────────────────────────────────────────────────────────┐
│ ●① Model              ──────────  ○② Taskset           ──────────  ○③ Review │
│    Choose the model                  Select the taskset               Confirm …  │
│    checkpoint to train.              to train against.                           │
└─────────────────────────────────────────────────────────────────────────┘

Per-step slot (magnified):

  ┌──────────────────────────────────────────────────────────────────┐
  │ [circle]  [Step Name]       [────── connector line ──────]       │  ← row A: circle + label + connector
  │            [description]                                          │  ← row B: description (indented to align left edge of label)
  └──────────────────────────────────────────────────────────────────┘

  circle:       size-8 (32px) rounded-full
  Step Name:    text-subtitle font-semibold, same row as circle
  description:  text-caption text-muted-foreground, row below — ml-10 (40px indent = circle width + gap-2)
  connector:    h-px flex-1, sits in row A between label and next circle

Mobile (<md): single-step summary
  ┌─────────────────────────────┐
  │  Step 2 of 4                │  ← text-meta text-meta-foreground
  │  Taskset                    │  ← text-subtitle font-semibold text-foreground
  │  Select the taskset…        │  ← text-body text-muted-foreground
  └─────────────────────────────┘
```

---

## State Model

### Per-step states

| State | Condition | Circle surface | Circle border | Circle icon/numeral | Label color |
|---|---|---|---|---|---|
| `pending` | step index > active index | `bg-transparent` | `border-[1.5px] border-border-strong` | numeral, `text-text-disabled font-medium` | `text-meta-foreground` |
| `active` | step index === active index | `bg-primary` | none | numeral, `text-primary-foreground font-semibold` | `text-foreground` |
| `completed` | step index < active index | `bg-panel` | `border-2 border-primary` | `<CheckIcon size-4 strokeWidth={2}>`, `text-primary` | `text-meta-foreground` |

### Per-connector states

Connector line sits between step N's label and step N+1's circle. Its state derives from the **left** step's state.

| Left step state | Connector color |
|---|---|
| `completed` | `bg-primary` |
| `active` | `bg-border-strong` |
| `pending` | `bg-border-strong` |

Only a completed left step earns a teal connector; the line reads as "path already walked."

---

## Tokens Table

### Typography

| Role | Token | Notes |
|---|---|---|
| Step name (desktop) | `text-subtitle font-semibold` | Active step: `text-foreground`. Pending/completed: `text-meta-foreground`. Same scale in both states — weight/color carry the hierarchy, not size. |
| Step description (desktop) | `text-caption text-muted-foreground` | Subordinate to step name. `text-caption` (12px) vs `text-body` (14px) creates visible scale hierarchy — description recedes behind the name. |
| Mobile counter | `text-meta text-meta-foreground` | "Step N of M" read-only line above the current label. |
| Mobile label | `text-subtitle font-semibold text-foreground` | Same scale as desktop step name. |
| Mobile description | `text-body text-muted-foreground` | Larger than desktop description because it is the only description visible — it carries more reading weight alone. |

### Color

| Role | Token | Notes |
|---|---|---|
| Active circle fill | `bg-primary` | Teal fill — same accent as action-critical primary button. |
| Active circle numeral | `text-primary-foreground` | Contrast pair for `bg-primary`. |
| Completed circle border | `border-primary` | 2px solid. Fill is `bg-panel` (light well behind the check icon). |
| Completed circle icon | `text-primary` | CheckIcon inherits color. |
| Pending circle border | `border-border-strong` | 1.5px. No fill. |
| Pending circle numeral | `text-text-disabled` | Quiet; not interactive. |
| Active step name | `text-foreground` | Maximum contrast — active step is the user's current focus. |
| Pending / completed step name | `text-meta-foreground` | Receded — not the current focus. |
| Step description | `text-muted-foreground` | Subordinate in all states. |
| Connector (completed) | `bg-primary` | Path-walked signal. |
| Connector (active→pending) | `bg-border-strong` | Quiet; path-ahead. |

### Spacing

| Role | Token | Value | Notes |
|---|---|---|---|
| Circle → step name gap | `gap-2` | 8px | Horizontal gap in the circle + label row. |
| **Title → description gap** | `mt-0.5` | 2px | **TIGHTENED.** See §Spacing Audit Decision. |
| Description indent | `ml-10` | 40px | Aligns description left edge to step name left edge (circle 32px + gap-2 8px = 40px). |
| Connector horizontal margin | `mx-3` | 12px each side | Breathing room between label end and next circle. |
| Mobile column gap | `gap-1` | 4px | Between counter, label, and description in stacked view. |

### Connector

| Property | Value | Token source |
|---|---|---|
| Thickness | 1px (`h-px`) | — |
| Width | `flex-1` (fills available space) | — |
| Completed color | `bg-primary` | `--color-primary` |
| Active / pending color | `bg-border-strong` | `--color-border-strong` |
| Style | solid — no dashes | — |

---

## §Spacing Audit Decision

**Operator-flagged issue (2026-06-13):** The description text read as floating, disconnected from its step name. The gap was too wide.

**Before:** `mt-1` = 4px, `text-body` (14px) for description.

**After:** `mt-0.5` = 2px, `text-caption` (12px) for description.

Two changes combine to fix the disconnected read:
1. **Gap tightened from `mt-1` to `mt-0.5` (4px → 2px).** At 4px with a 14px font below a 14px font (same `text-body` scale on both lines), the whitespace reads as paragraph separation. 2px visually binds the two lines into a single label block.
2. **Description scale reduced from `text-body` to `text-caption`.** Equal type scale (14px/14px) gave description the same visual weight as the step name, making both appear equal-rank. `text-caption` (12px) with `text-muted-foreground` is clearly subordinate — it reads as caption/annotation beneath the title, not a peer line.

The two fixes are codependent: tightening the gap alone with equal-weight type still reads as two parallel labels. Scale reduction alone with the old 4px gap still floats. Both together close the disconnection.

---

## Sizing

One size variant only (default). The step circle is fixed at `size-8` (32px). There is no compact or large variant at this time. If a compact variant is needed (e.g., for nested or secondary wizards), open a new spec iteration.

---

## Accessibility

### ARIA pattern

The stepper maps to the **Step Indicator / Breadcrumb** pattern from ARIA Authoring Practices — not `role="progressbar"` (which implies a scalar 0–100 value) and not `role="navigation"` (which implies a menu of links the user can jump to arbitrarily).

```
<ol role="list" aria-label="Wizard progress">
  <li aria-current="step">          ← only on the active step; removed from all others
    <!-- circle is aria-hidden="true" (decorative numeral / check icon) -->
    <!-- step name is visible text; no additional aria-label needed -->
  </li>
</ol>
```

Mobile fallback:
```
<div role="group" aria-label="Wizard progress">
  <p>Step {n} of {total}</p>       ← screen reader reads this as the position signal
  <h2>{currentLabel}</h2>
  <p>{currentDescription}</p>
</div>
```

**Key decisions:**

| Question | Decision | Rationale |
|---|---|---|
| `role="progressbar"` vs `role="list"` | `role="list"` (via `<ol>`) | Steps are discrete named stages, not a scalar 0–N%. `progressbar` would require `aria-valuenow` / `aria-valuemax` — meaningful for Progress bar, wrong abstraction for a multi-step wizard. |
| `aria-current` value | `"step"` | ARIA 1.1 defines `aria-current="step"` explicitly for the current step in a process. Preferred over `"page"` or `"true"`. |
| Circle numeral/icon | `aria-hidden="true"` | Numeral is decorative — the `<li>` label text is the accessible name. Screen reader announces "Model — step 1 of 4 current" via `aria-current` + position-in-set semantics from `<ol><li>`. |
| Keyboard navigation | None built in | Stepper is presentational; progression is controlled by wizard UI (Next/Back buttons). No `tabIndex` on step items. |
| Focus management | Consumer responsibility | When active step changes, wizard consumer should move focus to the new step's content panel (`aria-live` or programmatic `focus()`). |

---

## Decisions Summary

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Title→description gap | `mt-0.5` (2px) | 4px (`mt-1`) read as paragraph separation at equal type scale. 2px visually binds description as caption beneath title. |
| 2 | Description typography | `text-caption text-muted-foreground` | Equal-weight `text-body` gave description the same rank as step name. `text-caption` (12px) is visually subordinate by scale + color. |
| 3 | Connector state threshold | Left step only | Connector teal = left step is completed. In-progress connector (active→pending) stays muted to avoid implying the next step is already done. |
| 4 | Mobile layout | Single-step summary | Full horizontal list doesn't fit narrow viewports without truncation or horizontal scroll. Single-step summary (counter + label + description) preserves all semantic content with no overflow. |
| 5 | ARIA role | `<ol role="list">` + `aria-current="step"` | Steps are named discrete stages; `role="progressbar"` is a scalar 0–N abstraction. `<ol>` exposes position-in-set semantics natively. |
| 6 | New design tokens | Zero | All tokens (typography scales, color semantics, spacing) reuse existing DS vocabulary. No new token introduced. |

---

## Decisions Log

- **2026-06-14** — Stepper primitive spec authored. Title→description gap tightened from `mt-1` (4px, `text-body`) to `mt-0.5` (2px, `text-caption`) per operator spacing audit. Description scale reduced from `text-body` to `text-caption text-muted-foreground` to establish visual subordination. Zero new design tokens. Spec sourced from `stepper-header.tsx` local impl audit.
