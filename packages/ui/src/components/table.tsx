// shadcn-source: https://ui.shadcn.com/docs/components/table (cli, 2026-05-26)
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@repo/ui/lib/cn"

// ── Density context ───────────────────────────────────────────────────────────

type TableDensity = "default" | "compact"

const DensityContext = React.createContext<TableDensity>("default")

// ── CSS-only exports (legacy — backward-compat, consumed by TanStack Table) ──

export const tableClass = "w-full caption-bottom border-collapse bg-background"
export const tableHeaderClass = "bg-background"
export const tableHeaderStickyClass = "bg-elevated"
export const tableBodyClass = "[&_tr:last-child]:border-b-0"
export const tableFooterClass = "border-t border-border bg-muted font-medium [&>tr]:last:border-b-0"
export const tableCaptionClass = "mt-4 text-caption text-muted-foreground"
export const tableEmptyCellClass = "py-8 text-center text-body text-muted-foreground"

export const tableHeadVariants = cva(
  [
    "sticky top-0 z-table-header",
    "bg-background",
    "text-left align-middle whitespace-nowrap",
    "text-label font-medium tracking-[0.01em] uppercase",
    "text-muted-foreground",
    "border-b border-border",
  ].join(" "),
  {
    variants: {
      density: { default: "min-h-9 py-2.5 px-3", compact: "min-h-8 py-2 px-3" },
      numeric: { true: "text-right", false: "" },
    },
    defaultVariants: { density: "default", numeric: false },
  }
)

export const tableRowVariants = cva(
  [
    "border-b border-border",
    "transition-[background-color]",
    "duration-fast ease-out-standard",
    "data-[state=selected]:border-l-2 data-[state=selected]:border-l-primary",
    "hover:bg-hover",
  ].join(" "),
  { variants: { density: { default: "min-h-10", compact: "min-h-9" } }, defaultVariants: { density: "default" } }
)

export const tableCellVariants = cva(
  "align-middle text-body font-normal text-foreground whitespace-nowrap",
  {
    variants: {
      density: { default: "py-2 px-4", compact: "py-1.5 px-3" },
      variant: {
        default: "",
        mono: "font-mono text-code [font-feature-settings:'tnum'_1,'lnum'_1]",
        truncated: "overflow-hidden text-ellipsis max-w-0",
        "row-action": "text-right w-12",
      },
    },
    defaultVariants: { density: "default", variant: "default" },
  }
)

export type { VariantProps }

// ── React component API ───────────────────────────────────────────────────────

export interface TableProps extends React.ComponentPropsWithoutRef<"div"> {
  density?: TableDensity
  totalCount: number
  pageOffset: number
}

const Table = React.forwardRef<HTMLDivElement, TableProps>(
  ({ className, density = "default", totalCount, pageOffset, children, ...props }, ref) => (
    <DensityContext.Provider value={density}>
      <div
        ref={ref}
        data-slot="table-root"
        data-density={density}
        data-total-count={totalCount}
        data-page-offset={pageOffset}
        className={cn("relative w-full overflow-x-auto", className)}
        {...props}
      >
        <table className="w-full border-collapse bg-background">
          {children}
        </table>
      </div>
    </DensityContext.Provider>
  )
)
Table.displayName = "Table"

export interface TableHeaderProps extends React.ComponentPropsWithoutRef<"thead"> {
  sortKey?: string
  sortDirection?: "asc" | "desc" | null
  onSortChange?: (key: string, direction: "asc" | "desc" | null) => void
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn("bg-elevated", className)}
      {...props}
    />
  )
)
TableHeader.displayName = "TableHeader"

export interface TableHeaderCellProps extends React.ComponentPropsWithoutRef<"th"> {
  sortable?: boolean
  label: string
  sticky?: "left" | "right" | "none"
  numeric?: boolean
}

const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ className, sortable, label, sticky = "none", numeric, children, ...props }, ref) => {
    const density = React.useContext(DensityContext)
    const isLeft = sticky === "left"
    const isRight = sticky === "right"
    return (
      <th
        ref={ref}
        data-slot="table-header-cell"
        scope="col"
        className={cn(
          tableHeadVariants({ density, numeric: !!numeric }),
          "bg-elevated",
          isLeft && "left-0 z-table-corner",
          isRight && "right-0 z-table-corner",
          !isLeft && !isRight && "z-table-header",
          className
        )}
        {...props}
      >
        {sortable ? (
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 rounded-sm",
              "hover:text-foreground",
              numeric && "flex-row-reverse",
            )}
          >
            {label}
          </button>
        ) : (
          label
        )}
        {children}
      </th>
    )
  }
)
TableHeaderCell.displayName = "TableHeaderCell"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<"tbody">>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-b-0", className)}
      {...props}
    />
  )
)
TableBody.displayName = "TableBody"

export type TableRowOutcome = "scored" | "failed" | "errored" | "not-run" | "running"

export interface TableRowProps extends React.ComponentPropsWithoutRef<"tr"> {
  selected?: boolean
  pinned?: boolean
  outcome?: TableRowOutcome
  onDrill?: () => void
}

const outcomeRowClass: Record<TableRowOutcome, string> = {
  scored:  "",
  failed:  "",
  errored: "bg-state-errored-subtle",
  "not-run": "",
  running: "",
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, pinned, outcome, onDrill, onClick, children, ...props }, ref) => {
    const density = React.useContext(DensityContext)
    return (
      <tr
        ref={ref}
        data-slot="table-row"
        data-density={density}
        data-state={selected ? "selected" : undefined}
        data-pinned={pinned ? "true" : undefined}
        className={cn(
          "border-b border-border",
          "transition-[background-color] duration-fast ease-out-standard",
          density === "default" ? "min-h-10" : "min-h-9",
          "hover:bg-hover",
          selected && "border-l-2 border-l-primary bg-selected",
          pinned && "border-l-[3px] border-l-primary",
          outcome && outcomeRowClass[outcome],
          onDrill && "cursor-pointer",
          className
        )}
        onClick={(e) => {
          onClick?.(e)
          if (!e.defaultPrevented) onDrill?.()
        }}
        {...props}
      >
        {children}
      </tr>
    )
  }
)
TableRow.displayName = "TableRow"

export interface TableCellProps extends React.ComponentPropsWithoutRef<"td"> {
  sticky?: boolean
  variant?: "default" | "id" | "numeric" | "status"
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, sticky, variant = "default", ...props }, ref) => (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        "align-middle whitespace-nowrap text-body text-foreground",
        variant === "id" && "px-4 font-mono font-semibold text-code z-table-col",
        variant !== "id" && "px-4",
        variant === "numeric" && "text-right font-mono text-code [font-feature-settings:'tnum'_1,'lnum'_1]",
        variant === "status" && "",
        sticky && "sticky left-0 bg-background",
        className
      )}
      {...props}
    />
  )
)
TableCell.displayName = "TableCell"

export interface TableSelectionBarProps extends React.ComponentPropsWithoutRef<"tr"> {
  count: number
  actions?: React.ReactNode
  onClear: () => void
}

const TableSelectionBar = React.forwardRef<HTMLTableRowElement, TableSelectionBarProps>(
  ({ className, count, actions, onClear, ...props }, ref) => {
    const density = React.useContext(DensityContext)
    return (
      <tr
        ref={ref}
        data-slot="table-selection-bar"
        className={cn(
          "border-b border-border bg-muted",
          density === "default" ? "min-h-10" : "min-h-9",
          className
        )}
        {...props}
      >
        <td colSpan={999} className="px-4">
          <div className="flex items-center gap-3">
            <span className="text-body font-medium text-foreground tabular-nums">
              {count} selected
            </span>
            {actions}
            <button
              type="button"
              className="text-body text-muted-foreground hover:text-foreground ml-auto"
              onClick={onClear}
            >
              Clear
            </button>
          </div>
        </td>
      </tr>
    )
  }
)
TableSelectionBar.displayName = "TableSelectionBar"

export interface TableEmptyRowProps extends React.ComponentPropsWithoutRef<"tr"> {
  cliCommand: string
  docHref?: string
  colSpan?: number
}

const TableEmptyRow = React.forwardRef<HTMLTableRowElement, TableEmptyRowProps>(
  ({ className, cliCommand, docHref, colSpan = 999, ...props }, ref) => (
    <tr ref={ref} data-slot="table-empty-row" className={cn("border-b-0", className)} {...props}>
      <td colSpan={colSpan} className="py-8 px-4">
        <div className="flex items-center gap-3">
          <code className="text-code text-muted-foreground font-mono">{cliCommand}</code>
          {docHref && (
            <a
              href={docHref}
              className="text-body text-primary underline underline-offset-4 hover:text-primary-hover shrink-0"
            >
              Docs
            </a>
          )}
        </div>
      </td>
    </tr>
  )
)
TableEmptyRow.displayName = "TableEmptyRow"

export interface TableErrorBandProps extends React.ComponentPropsWithoutRef<"tr"> {
  cause: string
  onRetry?: () => void
  colSpan?: number
}

const TableErrorBand = React.forwardRef<HTMLTableRowElement, TableErrorBandProps>(
  ({ className, cause, onRetry, colSpan = 999, ...props }, ref) => (
    <tr ref={ref} data-slot="table-error-band" className={cn("bg-state-errored-subtle border-b border-border", className)} {...props}>
      <td colSpan={colSpan} className="px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-body text-state-errored-text flex-1">{cause}</span>
          {onRetry && (
            <button
              type="button"
              className="text-body text-muted-foreground hover:text-foreground shrink-0"
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
      </td>
    </tr>
  )
)
TableErrorBand.displayName = "TableErrorBand"

export interface TableSkeletonRowProps {
  colCount: number
  density?: TableDensity
  className?: string
}

function TableSkeletonRow({ colCount, density: densityProp, className }: TableSkeletonRowProps) {
  const densityCtx = React.useContext(DensityContext)
  const density = densityProp ?? densityCtx
  return (
    <tr
      data-slot="table-skeleton-row"
      aria-hidden="true"
      className={cn(
        "border-b border-border",
        density === "default" ? "min-h-9" : "min-h-8",
        className
      )}
    >
      {Array.from({ length: colCount }, (_, i) => (
        <td key={i} className="px-3 py-2">
          <div className="h-3 rounded-sm bg-muted animate-[shimmer_1800ms_linear_infinite] bg-[size:200%_100%] bg-gradient-to-r from-muted via-elevated to-muted" /> {/* eslint-disable-line no-restricted-syntax -- bg-[size:...] is background-size shorthand; no token equivalent */}
        </td>
      ))}
    </tr>
  )
}

export {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableSelectionBar,
  TableEmptyRow,
  TableErrorBand,
  TableSkeletonRow,
}
