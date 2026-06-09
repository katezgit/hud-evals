# Cross-screen consistency audit — when to run it

A holistic refinement pass across sibling screens (e.g., all detail pages, all index pages). Catches heading-style and major-layout drift after each page was designed in isolation.

**Operator-triggered. Not automatic.** Claude will not nudge you. The reminder lives here so you can decide when to run it.

The audit process itself is documented at [`.claude/workflows/cross-screen-audit.md`](../.claude/workflows/cross-screen-audit.md) — what gets checked, where output lands, how the designer is dispatched.

## When to consider running it

A category is a set of screens sharing a filename pattern, e.g.:

- **Detail pages** — `docs/design/screens/*-detail.screen.md` (model, taskset, environment, job, trace, …)
- **Index pages** — `docs/design/screens/*-index.screen.md`
- **Settings pages** — `docs/design/screens/*-settings.screen.md`

Run an audit when **any** of these hits:

1. **Sibling threshold.** 3+ screens of the same category exist at hi-fi. Drift compounds after the third.
2. **Before `components` phase.** Component primitives are about to abstract from screen specs. If drift is in the specs, drift gets baked into the components. Audit first; promote consistent patterns into shared primitives.
3. **Eye-test.** You scroll through two sibling screens side-by-side and they feel like different products. That's the signal.

Skip the audit when:

- A category has only 1–2 screens (no consistency surface yet).
- Sibling spec was edited recently and you already verified it against neighbors.
- You're confident shared component primitives already enforce the consistency (e.g., everyone uses `<DetailPageShell>`).

## How to trigger it

Tell Claude:

> "Audit the detail pages."

or

> "Run a cross-screen audit on `*-index.screen.md`."

Claude dispatches `product-designer` with the sibling list and checklist. Output lands at `docs/design/audits/{category}-{YYYY-MM-DD}.md`.

## What you'll get back

The audit doc classifies each finding as:

- **Revise spec** — drift is local, one or more `.screen.md` files get updated.
- **Component ticket** — the right fix is a shared primitive in `packages/ui/`. Filed as `agent:components` task.
- **Accept** — variation is intentional, reason noted inline.

A healthy audit produces more *component tickets* than *spec revisions*. If every finding is "revise spec X to match spec Y," that's a signal the component layer is under-built — the audit is doing work the primitives should do.

## Suggested cadence

- After every 3rd new sibling lands in a category.
- Before entering `components` phase for a category.
- Before any pre-PR consolidation that touches multiple sibling screens.

No schedule is enforced. You decide.

## Why this isn't automated

Two reasons:

1. **Sibling count alone isn't enough signal.** 3 detail pages might be perfectly consistent (good primitives), or wildly inconsistent (poor primitives). An automated nudge based on count would fire when the audit isn't useful and stay silent when it is.
2. **Operator judgment > heuristic.** You see drift faster than a filename check does. Keeping the trigger manual respects that.

The tradeoff: you have to remember. This manual is the remembering aid.
