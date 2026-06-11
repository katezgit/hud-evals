import { flexRender, type Table } from "@tanstack/react-table";
import {
  tableClass,
  tableHeaderClass,
  tableBodyClass,
  tableHeadVariants,
  tableRowVariants,
  tableCellVariants,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/cn";

interface ManageTableProps<TData> {
  table: Table<TData>;
  /**
   * Pattern A — page-section table with no surrounding Card. Wraps the
   * scroller in `rounded-md border` so the table reads as a bounded section
   * against the page background. Omit when the table sits inside a Card
   * (Pattern B) — Card chrome IS the chrome; double containers are an anti-pattern.
   * Mirrors the `bordered` prop on the DS `<Table />` primitive.
   */
  bordered?: boolean;
}

/**
 * Thin presentational wrapper for manage-area TanStack tables.
 * Composes the DS Table CSS-only primitive (`@repo/ui/components/table`) so
 * every manage page inherits the canonical header / row / cell treatment.
 *
 * The outer `overflow-x-auto` scroller mirrors the DS `<Table />` forwardRef
 * primitive — at narrow viewports the table scrolls horizontally instead of
 * pushing past the content column.
 *
 * Per-cell `meta.cellClassName` / `meta.headerClassName` is merged on top of
 * the DS defaults — pass overrides only for genuinely column-specific intent
 * (e.g. `text-right`, `w-10`). Font / padding / muted-color defaults come from
 * `tableHeadVariants` / `tableCellVariants` and should not be re-stated.
 */
export default function ManageTable<TData>({ table, bordered }: ManageTableProps<TData>) {
  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto",
        bordered && "overflow-hidden rounded-md border border-border",
      )}
    >
      <table className={tableClass}>
        <thead className={tableHeaderClass}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as
                  | { headerClassName?: string }
                  | undefined;
                return (
                  <th
                    key={header.id}
                    className={cn(tableHeadVariants(), meta?.headerClassName)}
                    aria-label={header.column.columnDef.id === "actions" ? "Actions" : undefined}
                  >
                    {!header.isPlaceholder &&
                      flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className={tableBodyClass}>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={tableRowVariants()}>
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as
                  | { cellClassName?: string }
                  | undefined;
                return (
                  <td key={cell.id} className={cn(tableCellVariants(), meta?.cellClassName)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
