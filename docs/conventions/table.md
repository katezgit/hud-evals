---
description: Two co-existing table patterns — when to use the JSX primitive vs CSS-string exports, Pattern A vs B layout, and token gotchas
applies_to: staff-frontend-engineer, design-system-architect
status: Active
---

# Table Conventions

**Design spec:** [`docs/design/components/table/spec.md`](../design/components/table/spec.md) — tokens, anatomy, row states, density math, ASCII diagrams.

**Composition patterns:** [`docs/design/components/table/patterns.md`](../design/components/table/patterns.md) — non-layout patterns (expandable rows, etc.).

This codebase has two consumption modes for tables. They share the same underlying tokens and render identically; the split is a API boundary, not a visual one.

## The split

### Mode 1 — JSX primitive

```tsx
import {
  Table, TableHeader, TableHeaderCell,
  TableBody, TableRow, TableCell,
} from "@repo/ui/components/table";

<Table bordered>
  <TableHeader>
    <TableHeaderCell label="Name" />
    <TableHeaderCell label="Status" numeric />
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>prod-1</TableCell>
      <TableCell numeric>42</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Use when:** columns are known at compile time and headers are simple strings. Supports `bordered` prop, `density` variants, sticky cells, and sortable/numeric label semantics via typed props.

**Examples in this repo:** `members-table`, `limits-table`, `secrets-table`, `api-keys-client` table, `manage-table` base.

---

### Mode 2 — CSS-string exports

```tsx
import {
  tableClass, tableHeaderClass, tableHeaderStickyClass,
  tableFooterClass, tableRowVariants, tableHeadVariants, tableCellVariants,
} from "@repo/ui/components/table";

<table className={tableClass()}>
  <thead className={tableHeaderClass()}>
    <tr>
      <th className={tableHeadVariants({ numeric: false })}>
        {flexRender(header.column.columnDef.header, header.getContext())}
      </th>
    </tr>
  </thead>
  <tbody>
    {rows.map(row => (
      <tr key={row.id} className={tableRowVariants()}>
        {row.getVisibleCells().map(cell => (
          <td key={cell.id} className={tableCellVariants()}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
```

**Use when:** columns are TanStack-driven (`columnDef` + `flexRender`), or when header content is arbitrary — sortable widgets, icons, tooltips, ReactNode.

**Examples in this repo:** `instances-tab`, `builds-tab`, `logs-tab`, `traces-tab`, `checkpoints-tab`, `results-tab`, `overview-tab`, `tasks-tab`, performance tables, `job-tool-usage`, `job-run-table`.

---

### Why two exist

`<TableHeaderCell label: string>` doesn't compose with TanStack's `flexRender` (which returns `ReactNode`). Extending the JSX primitive's API to accept `ReactNode` in `label` was considered and deferred — the complexity isn't worth it when the CSS-string path already works and renders identically. If that tradeoff is revisited, the CSS-string mode can be retired.

---

## Pattern A vs Pattern B

Both modes support two layout contexts.

### Pattern A — table IS the page section

The table is the primary content surface; there is no wrapping Card.

**JSX primitive:**

```tsx
<Table bordered>…</Table>
```

The `bordered` prop applies `rounded-md border border-border bg-card` to the table container.

**CSS-string consumers** must add the wrapper explicitly:

```tsx
<div className="overflow-x-auto rounded-md border border-border bg-card">
  <table className={tableClass()}>…</table>
</div>
```

**Examples:** Members, Limits, Secrets, API keys.

---

### Pattern B — table inside a Card

The table sits inside a `<Card>` that already provides chrome (background, border, radius).

**JSX primitive:**

```tsx
<Card>
  <CardHeader>…</CardHeader>
  <Table>…</Table>  {/* no `bordered` */}
</Card>
```

**CSS-string consumers:** no extra wrapper needed; the Card supplies chrome.

**Examples:** Billing history, Usage resource breakdown.

**Edge-to-edge:** the table must fill the Card edge-to-edge so the `bg-muted` thead reads as a section divider butting up against the Card's inner border. Pass `className="p-0"` to the `<CardContent>` that wraps the table (or render the table as a direct sibling of the heading with no padding wrapper) and add `overflow-hidden` to the `<Card>`. The Card's rounded corners + `overflow-hidden` clip the first row's top corners and the last row's bottom corners cleanly — without this, the table reads as a sharp-cornered inner rectangle floating inside the Card.

---

### Anti-pattern: double chrome

```tsx
// ✗ — Card + bordered gives two nested borders and two background layers
<Card>
  <Table bordered>…</Table>
</Card>
```

Pattern A uses `bordered`. Pattern B does not. Never combine both.

---

## Token gotcha — `bg-muted` vs `bg-card`

`--color-elevated` and `--color-muted` currently resolve to the same hex value (`#F0F2F6` light, `#161D28` dark). This means a `bg-muted` thead does **not** contrast against a `bg-elevated` table body — they are the same color.

Use `bg-card` (`#FFFFFF` / `#11161F`) as the table body container background. The Pattern A bordered wrapper uses `bg-card` for exactly this reason. CSS-string consumers wrapping their tables must do the same.

If you need a tinted thead, apply it to the `<thead>` or `<TableHeader>` element — not to individual `<th>` cells. Stray per-cell tints fight the variant defaults.

---

## First and last column edge padding

The first and last `<th>` / `<td>` in every row carry extra horizontal padding so cell content never sits flush against the table's left/right edge. Apply `pl-4` on the first column and `pr-4` on the last column (16px each), in addition to the standard intra-cell `px-3` (12px).

This applies to all tables in `apps/portal` regardless of variant — Pattern A bordered tables, Pattern B inside-Card tables, and CSS-string TanStack tables alike.

**Why this rule exists:** right-aligned numeric last columns (e.g. Total, Cost) are the canonical failure case. Without `pr-4`, the number sits 12px from the cell edge — which at any slight container under-sizing or at a mid-breakpoint column-compression causes the value to clip or visually merge with the table's right border. The operator observed `$0.17` / `$0.16` / `$0.14` clipped in the Per-trace breakdown Total column. `pr-4` gives a safe 16px buffer that survives column compression at `md` breakpoint widths.

**CSS-string consumers** — add edge classes on the column definition's header/cell render function rather than in a catch-all `th:first-child` rule, so the intent is explicit per table:

```tsx
// First column header
<th className={cn(tableHeadVariants(), "pl-4")}>…</th>

// Last column header
<th className={cn(tableHeadVariants({ numeric: true }), "pr-4")}>…</th>

// First column cell
<td className={cn(tableCellVariants(), "pl-4")}>…</td>

// Last column cell
<td className={cn(tableCellVariants({ numeric: true }), "pr-4")}>…</td>
```

**JSX primitive consumers** — pass `className="pl-4"` / `className="pr-4"` directly to `<TableHeaderCell>` / `<TableCell>` on the edge columns.

---

## Last-row border discipline

When the table is wrapped in `border border-border` (any bordered-table variant), the final `<tr>` of `<tbody>` must drop its row-level `border-b`. Otherwise the outer container's bottom border and the final row's `border-b` render as a 2-px doubled line. Use `last:border-b-0` on every `tbody tr`, or `[&>tr:last-child]:border-b-0` on the `<tbody>` itself, depending on the surrounding pattern. This applies to grouped/tree tables too — the last *visible* row at the bottom of the table is the one that drops its border, regardless of whether it's a parent or child row.

---

## What not to do

- **No `[var(--x)]` arbitrary syntax.** Use generated utilities (`bg-card`, `border-border`) per [`tailwind-v4.md`](./tailwind-v4.md).
- **No per-`<th>` background overrides.** Let `<thead>` / `<TableHeader>` carry the tint. Stray per-cell `bg-elevated` / `bg-muted` / `bg-background` classes produce visual artifacts at cell boundaries.
- **No `<Card><Table bordered>`.** Double chrome. Pick Pattern A or Pattern B.
- **No hardcoded hex or spacing values.** Every value comes from a token utility.
