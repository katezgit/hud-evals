# Table — Composition Patterns

Patterns built on top of the Table primitive (`spec.md`). One section per pattern, appended over time.

**Layout patterns** — see [docs/conventions/table.md](../../../conventions/table.md) for Pattern A (page-section, bordered) vs Pattern B (Card-contained).

---

## Expandable rows

### When to use

Use expandable rows when a table row contains a primary summary (e.g., Run ID, status, reward) and a secondary detail payload (e.g., full trace, tool-call arguments, environment metadata) that most users do not need on first scan. The detail must be contextually bound to the row — not a navigation destination. If the detail requires its own URL or is the primary reason the user arrived, use a side drawer or detail page instead.

### Canonical pattern

Row renders a `ChevronRight` icon (16 px, `text-muted-foreground`) in a fixed 32 px left column. Click or `Enter`/`Space` on the row (not just the icon) toggles the expansion. Icon rotates 90 ° on expand (motion-designer owns duration/easing). The expanded region renders as a full-width `<tr>` with a single `<td colspan={n}>` containing the detail content. Detail content background: `bg-muted/40`. Row border between summary and detail: `border-border`. Collapsed rows show only the divider between sibling rows — no explicit expansion affordance other than the icon.

Only one row expanded at a time unless the product spec explicitly requires multi-expand. Default: single-expand (simpler undo, no "collapse all" needed).

### Rationale

Expandable rows keep the fleet view scannable (50+ Runs in a weekend — `personality.md`) while putting full trace data one click away. The icon is a signal, not the hit target; making the entire row clickable reduces targeting precision required and aligns with keyboard-first discipline.

### Anti-patterns

- Expanding rows that open a modal: breaks the one-click-to-trace contract; the detail leaves the spatial context of the row.
- Using accordion component instead of `<tr>/<td>`: breaks `<table>` semantics and breaks screen reader row-count announcements.
- Multi-expand by default: forces users to manually collapse noise before reading the expanded detail they care about.
- Rendering the expansion icon as a `<button>` inside a clickable row without `stopPropagation`: double-fires the toggle.

### Reference implementation

`apps/portal/src/app/(app)/models/[id]/_components/results-tab.tsx` (score breakdown expansion).

