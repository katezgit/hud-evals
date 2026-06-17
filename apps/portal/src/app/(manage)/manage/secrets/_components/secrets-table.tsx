'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ManageTable from "@/app/(manage)/_components/manage-table";
import type { Secret } from "@/lib/mock/types";

const columnHelper = createColumnHelper<Secret>();

// Write-only secrets: post-save, the value is never re-readable from the UI.
// To rotate, the user overwrites via Edit; to remove, Delete. This matches
// GitHub Actions / Vercel encrypted env / API-key dashboards (Stripe, OpenAI,
// Anthropic) — the issuer (W&B, HF) is the source of truth, not HUD.
const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono text-label" },
  }),
  columnHelper.display({
    id: "value",
    header: "Value",
    cell: () => (
      <code className="inline-flex items-center rounded-sm border border-border bg-muted-surface px-2 py-1 font-mono text-caption text-muted-foreground">
        ••••••••
      </code>
    ),
  }),
  columnHelper.accessor("scope", {
    header: "Scope",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "text-muted-foreground" },
  }),
];

interface SecretsTableProps {
  rows: ReadonlyArray<Secret>;
}

export function SecretsTable({ rows }: SecretsTableProps) {
  const table = useReactTable({
    data: rows as Secret[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ManageTable table={table} bordered />;
}
