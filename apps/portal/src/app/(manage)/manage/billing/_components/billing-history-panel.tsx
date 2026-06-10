"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@repo/ui/components/badge";
import ManageTable from "@/app/(manage)/_components/manage-table";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { billingHistory } from "@/lib/mock";
import type { BillingHistoryEntry, BillingHistoryStatus } from "@/lib/mock/types";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "short" });
const NUMBER = new Intl.NumberFormat("en-US");
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const STATUS_LABEL: Record<BillingHistoryStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
};

// Badge variants borrow the design-system state palette:
//   completed → success (teal/green soft pill, used elsewhere for "good" states)
//   pending   → warning
//   failed    → destructive
// No new tokens introduced; if a dedicated "billing-completed" token lands later,
// swap variants here without touching callers.
const STATUS_VARIANT: Record<BillingHistoryStatus, "success" | "warning" | "destructive"> = {
  completed: "success",
  pending: "warning",
  failed: "destructive",
};

function formatCredits(credits: number | null): string {
  if (credits === null) return "—";
  const prefix = credits > 0 ? "+" : "";
  return `${prefix}${NUMBER.format(credits)}`;
}

const columnHelper = createColumnHelper<BillingHistoryEntry>();

const columns = [
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => DATE_FMT.format(new Date(info.getValue())),
    meta: { cellClassName: "font-mono text-label text-muted-foreground" },
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge variant={STATUS_VARIANT[info.getValue()]} showDot>
        {STATUS_LABEL[info.getValue()]}
      </Badge>
    ),
  }),
  columnHelper.accessor("credits", {
    header: "Credits",
    cell: (info) => formatCredits(info.getValue()),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-label tabular-nums",
    },
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => USD.format(info.getValue()),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-label tabular-nums",
    },
  }),
];

export function BillingHistoryPanel() {
  const table = useReactTable({
    data: billingHistory as BillingHistoryEntry[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Panel>
      <header className="mb-4">
        <h2 className="text-subtitle font-semibold text-foreground">Billing history</h2>
        <p className="mt-1 text-body text-muted-foreground">
          Your recent credit purchases and transactions
        </p>
      </header>
      <ManageTable table={table} />
    </Panel>
  );
}
