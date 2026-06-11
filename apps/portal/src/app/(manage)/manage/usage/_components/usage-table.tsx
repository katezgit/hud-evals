"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ManageTable from "@/app/(manage)/_components/manage-table";
import type { UsageRow } from "@/lib/mock/types";

const NUMBER = new Intl.NumberFormat("en-US");

const columnHelper = createColumnHelper<UsageRow>();

const columns = [
  columnHelper.accessor("resource", {
    header: "Resource",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("used", {
    header: "Used",
    cell: (info) => info.getValue(),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-label text-muted-foreground tabular-nums",
    },
  }),
  columnHelper.accessor("credits", {
    header: "Credits",
    cell: (info) => NUMBER.format(info.getValue()),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-label text-muted-foreground tabular-nums",
    },
  }),
];

interface UsageTableProps {
  rows: ReadonlyArray<UsageRow>;
}

export function UsageTable({ rows }: UsageTableProps) {
  const table = useReactTable({
    data: rows as UsageRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ManageTable table={table} />;
}
