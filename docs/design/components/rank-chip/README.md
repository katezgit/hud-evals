# Rank Chip — Visual Treatment Spec

Surfaces: `overview-tab.tsx` (full leaderboard table) · `leaderboard-preview.tsx` (index card)

---

## Problem diagnosis

Two distinct issues compound on the same row:

**Issue 1 — Rank 3 green collides with metric green.** `state-scored-subtle / state-scored-text` (green) currently serves both rank-3 chips and metric cells at ≥60% score. On a high-performing row the visual reads: `[3 in green] Aman's fine-tune [61% green] [68% green] [72% green]`. Two different semantics — ordinal position and score magnitude — sharing one hue. The chip loses its identity; the metric tone loses its contrast target.

**Issue 2 — Podium differentiation is weak.** Rank 1 gets amber; ranks 2 and 3 get progressively quieter neutrals. The tier drop from 1→2 is larger than 2→3, but neither 2 nor 3 reads as genuinely ranked below 1 — they just read as "other rows without a special color."

---

## Recommendation: amber-only podium, running-blue for rank 3, neutral for rank 2

### Rank assignment

| Rank | Chip classes | Rationale |
|------|-------------|-----------|
| 1 | `bg-state-warning-subtle text-state-warning-text` | Amber is warm and attentive — the single distinctly non-neutral token; unambiguous top signal. No change. |
| 2 | `bg-muted-surface text-muted-foreground` | Stepped down from `secondary-surface`. Rank 2 is real but not the leader; quieter neutral reads correctly as "close but not first." |
| 3 | `bg-state-running-subtle text-state-running-text` | Blue-tinted chip. Completely separates from green metric tone. Still within the existing token set — no new tokens required. |
| 4+ | `bg-muted-surface text-muted-foreground` | Unchanged. |

### Why running-blue for rank 3

The existing token palette has four state hues: amber (warning), green (scored), blue (running), red (errored). Red is destructive — not appropriate for a podium position. Green is the metric hue — the collision source. Blue (`state-running-subtle / state-running-text`, ~221°) is the remaining hue with enough perceptual separation from both amber and green. Its current semantic is "in-progress / computing" — not inherently tied to that meaning, and on a leaderboard chip the semantic load is "ordinal position 3," which carries no state meaning anyway. The hue assignment is borrowed for positional identity, not for state communication.

Hue distance from problem tokens:
- `running-blue` (~221°) → `scored-green` (~148°): 73° separation — clear.
- `running-blue` (~221°) → `warning-amber` (~32°): effectively opposite on the wheel — unambiguous.

No new token is introduced. No new primitive is added.

### Why rank 2 drops to `muted-surface`

Current rank 2 uses `secondary-surface / secondary-foreground` — the stronger neutral, which also appears on selected rows and secondary buttons. Reassigning rank 2 to `muted-surface / muted-foreground` (the quieter neutral) makes the podium ladder legible:

```
1 → warm amber  (distinctive)
2 → quiet neutral (present but subdued)
3 → cool blue   (distinct from both 1 and the metric green)
4+ → quiet neutral (same as 2 — both are "not top-3")
```

Ranks 2 and 4+ sharing `muted-surface` is intentional: the leaderboard's job is to distinguish the leader and mark the top-3 range. Ranks 2 and 3 get hue-distinct treatment only because they're in the top-3 window. Once the user sorts or filters, exact position is legible from the ordinal number itself.

### Semantic hygiene

`color = state` is a hard personality principle. The chips do not override this — they apply color to a *positional* role (rank ordinal), not a process state. The chip is a position indicator, not a status badge. Using `state-*` tokens for positional color is a pragmatic reuse of the existing hue vocabulary; no new semantic category is being invented.

The metric `tone()` function remains untouched. Green on metric cells still means score ≥60%. After this change, no chip on any row shares that hue.

---

## Token spec — no new tokens

All tokens are already in `packages/ui/src/styles/theme.css`.

| Role | Token (fill) | Token (text) | Hue |
|------|-------------|-------------|-----|
| Rank 1 | `bg-state-warning-subtle` | `text-state-warning-text` | Amber ~32° |
| Rank 2 | `bg-muted-surface` | `text-muted-foreground` | Neutral |
| Rank 3 | `bg-state-running-subtle` | `text-state-running-text` | Blue ~221° |
| Rank 4+ | `bg-muted-surface` | `text-muted-foreground` | Neutral |

---

## Copy-paste implementation

### `overview-tab.tsx` — replace `rankPillClass`

```tsx
function rankPillClass(rank: number): string {
  if (rank === 1) return "bg-state-warning-subtle text-state-warning-text";
  if (rank === 2) return "bg-muted-surface text-muted-foreground";
  if (rank === 3) return "bg-state-running-subtle text-state-running-text";
  return "bg-muted-surface text-muted-foreground";
}
```

### `leaderboard-preview.tsx` — replace `RANK_TINT`

```tsx
const RANK_TINT: Record<number, string> = {
  1: "bg-state-warning-subtle text-state-warning-text",
  2: "bg-muted-surface text-muted-foreground",
  3: "bg-state-running-subtle text-state-running-text",
};
```

The fallback `?? "bg-muted-surface text-muted-foreground"` already on the `LeaderboardPreview` call site is correct and unchanged.

---

## Rejected candidates

**Bracket notation `[#1] [#2] [#3]` (Option A from brief).** Typed brackets are developer-readable but introduce monospace ASCII chrome into what is already a number inside a chip. The chip geometry already communicates "this is an ordinal badge"; adding `[` and `]` around the digit is redundant punctuation. The chip shape IS the bracket.

**Emoji medals `🥇🥈🥉` (Option B from brief).** Out. HUD personality bans emoji in product copy.

**New bronze token.** A `metal-bronze` or `accent-warm-3` token would solve the hue collision cleanly, but it introduces a color requiring operator approval and adds to the palette surface area. The `running-blue` reuse solves the problem with zero new tokens, making it strictly preferable at this stage.

**De-tone: no chip fill, weight-only differentiation.** A bold ordinal with no chip fill would resolve the green collision by eliminating color from rank entirely. This is a valid fallback if the blue chip reads oddly in dark mode, but it sacrifices the positional salience the chip provides on the glance-altitude (index card preview). Keep the chip; fix the hue.

**Solid fills or gradient treatment.** Inconsistent with the 10–12% alpha tint intensity the rest of the system uses for state chips. Would escalate visual weight beyond what rank-position deserves.

---

## Surfaces scope

This spec governs both:
- `apps/portal/src/app/(app)/tasksets/[id]/_components/overview-tab.tsx` — `rankPillClass()` function
- `apps/portal/src/app/(app)/tasksets/_components/leaderboard-preview.tsx` — `RANK_TINT` map

No other surface currently renders rank chips.
