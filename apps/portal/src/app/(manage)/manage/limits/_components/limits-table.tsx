"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ManageTable from "@/app/(manage)/_components/manage-table";
import type { LimitRow } from "@/lib/mock/types";

const columnHelper = createColumnHelper<LimitRow>();

const columns = [
  columnHelper.accessor("name", {
    header: "Limit",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("current", {
    header: "Current",
    cell: (info) => info.getValue(),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-label text-muted-foreground tabular-nums",
    },
  }),
  columnHelper.accessor("max", {
    header: "Max",
    cell: (info) => info.getValue(),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-label text-muted-foreground tabular-nums",
    },
  }),
];

interface LimitsTableProps {
  rows: ReadonlyArray<LimitRow>;
}

export function LimitsTable({ rows }: LimitsTableProps) {
  const table = useReactTable({
    data: rows as LimitRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ManageTable table={table} bordered />;
}
