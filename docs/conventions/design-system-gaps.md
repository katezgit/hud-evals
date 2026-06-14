---
description: Known design system gaps surfaced by the jobs/new redesign session — components/variants the app currently builds locally and the conditions under which a packages/ui PR should land them
applies_to: future packages/ui PRs that close one or more of these gaps
status: Active
---

# Design system gaps — tracking sheet

A design system is the contract between the app and its primitives. Whenever app code reimplements something that a primitive in `packages/ui/` should provide, we accumulate inconsistency debt. This document tracks gaps surfaced during the `/jobs/new` redesign session (Jun 2026) so the next `packages/ui` PR can close them with full context.

The pattern: app code cooks locally → file an entry here → DS engineer schedules → entry moves to **Closed** when the primitive ships and the app code is migrated.

---

## Open

### 1. `Combobox` — two-line option support

**Where it's cooked locally.** `apps/portal/src/app/(app)/jobs/new/_components/step-taskset.tsx` composes a Popover + Command stack directly because the shared `Combobox` from `@repo/ui/components/combobox` renders single-line option labels only.

**What the app needs.** Each option row in the taskset picker shows a primary line (taskset name) and a secondary metadata line (`{N} tasks · visibility · by {owner}`). The shared `Combobox` collapses option rendering into a single `<CommandItem>` slot with no convention for stacking.

**Proposed DS shape.** `Combobox` accepts a `renderOption` prop (or `Combobox.Option` subcomponent) that takes the option object and returns ReactNode. The default render stays single-line; consumers opt into two-line by passing a custom renderer. Same group-heading semantics, same separator support — only the option body becomes flexible.

**Migration.** Replace the local Popover + Command composition in `step-taskset.tsx` with the shared `<Combobox renderOption={...}>`. Move the existing grouping (My Tasksets / Public Tasksets) and separator to the standard `Combobox.Group` + `Combobox.Separator` slots.

**Primitive PR.** #47 (merged 2026-06-14) — added `renderOption?: (option) => ReactNode` + exported `ComboboxTwoLineOption` helper.

---

### 2. `Progress` — neutral fill state

**Where it's cooked locally.** `apps/portal/src/app/(app)/tasksets/[id]/_components/run-taskset/group-size-control.tsx` renders the Margin of error bar with a manual `<div>` track + fill using inline `style={{ width: '${pct}%' }}` and a conditional `bg-state-warning` / `bg-muted-foreground` className.

**What the app needs.** The `Progress` primitive currently expresses one engaged color (the primary teal). The MoE bar needs a threshold-based color: amber when MoE > 20%, neutral when ≤ 20%. The bar length encodes magnitude (always); the fill color encodes a separate threshold state.

**Proposed DS shape.** `Progress` accepts a `state` prop with values like `"engaged" | "warning" | "neutral"`. Each state maps to a fill color token. The track and structure are unchanged. App code passes `state={moePct > 20 ? "warning" : "neutral"}` and stops reasoning about fill classes.

**Migration.** Replace the manual `<div>` track in `group-size-control.tsx` with `<Progress value={moePct} state={...} />`. Same external behavior, no inline `style.width` in app code.

**Primitive PR.** #48 (merged 2026-06-14) — added `state="neutral"` variant using the pinned token `--color-progress-fill-neutral` (#B3BFCE in both themes per operator override; light-theme contrast ~1.6:1 documented as variance).

---

## Conventions when adding a new entry

1. **Where it's cooked locally** — file path + brief description of the local implementation.
2. **What the app needs** — the missing capability, framed as a contract.
3. **Proposed DS shape** — concrete API or behavior. Doesn't need to be final; gives the DS engineer a starting point.
4. **Migration** — what changes in the app once the primitive lands.

If the same gap reappears in another redesign session, add the new call site to the existing entry rather than opening a new one. The point is to track the gap, not the symptoms.

---

## Closed

### 3. `RewardBar` — kept inline (2026-06-14)

**Resolution.** Not extracted. Local `RewardBar` in `apps/portal/src/app/(app)/jobs/new/_components/step-tasks.tsx` stays as-is.

**Why.** Failed the DS primitive test — the `value >= threshold ? bg-state-scored : bg-state-warning` mapping IS reward-evaluation business logic, not generic UI capability. A truly generic primitive would be `<Bar value={...} fillClassName={...} />` where the consumer passes color, at which point it's two spans with classes — no value-add over inline JSX. PR #49 was opened to extract a `ScoreBar` primitive (spec + code + stories + tests + a11y review all completed) and then closed without merging once the rule was articulated.

**Rule applied.** "Design system primitives carry no business logic; thresholds, domain color mappings, and business defaults belong at the call site." Captured in personal cross-project guidelines at `~/.claude/CLAUDE.md` § Design System Discipline.

**When to revisit.** If a second caller appears (e.g. model picker USAGE column, trace grid per-trace reward) AND both callers want the same threshold + palette, extract only the generic geometry (`Bar` primitive) — never the threshold logic.

---

## Provenance

`/jobs/new` redesign session — Jun 12-13, 2026. Gaps surfaced in engineer returns and noted in the session conversation; consolidated here for follow-up.
