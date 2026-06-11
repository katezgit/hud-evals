---
description: Two co-existing table patterns — when to use the JSX primitive vs CSS-string exports, Pattern A vs B layout, and token gotchas
applies_to: staff-frontend-engineer, design-system-architect
status: Active
---

# Table Conventions

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

## What not to do

- **No `[var(--x)]` arbitrary syntax.** Use generated utilities (`bg-card`, `border-border`) per [`tailwind-v4.md`](./tailwind-v4.md).
- **No per-`<th>` background overrides.** Let `<thead>` / `<TableHeader>` carry the tint. Stray per-cell `bg-elevated` / `bg-muted` / `bg-background` classes produce visual artifacts at cell boundaries.
- **No `<Card><Table bordered>`.** Double chrome. Pick Pattern A or Pattern B.
- **No hardcoded hex or spacing values.** Every value comes from a token utility.
