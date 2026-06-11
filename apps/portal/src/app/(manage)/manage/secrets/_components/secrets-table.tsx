"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IconButton } from "@repo/ui/components/icon-button";
import ManageTable from "@/app/(manage)/_components/manage-table";
import type { Secret } from "@/lib/mock/types";

const columnHelper = createColumnHelper<Secret>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    meta: { cellClassName: "font-mono text-label" },
  }),
  columnHelper.display({
    id: "value",
    header: "Value",
    cell: (info) => <SecretValueCell value={info.row.original.value} />,
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

interface SecretValueCellProps {
  value: string;
}

function SecretValueCell({ value }: SecretValueCellProps) {
  const [revealed, setRevealed] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    toast.info("Secret copied");
  };

  return (
    <div className="flex items-center gap-2">
      <code className="inline-flex items-center rounded-sm border border-border bg-muted px-2 py-1 font-mono text-caption text-muted-foreground">
        {revealed ? value : "••••••••"}
      </code>
      <div className="flex items-center gap-1">
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={revealed ? "Hide secret value" : "Reveal secret value"}
          onClick={() => setRevealed((prev) => !prev)}
        >
          {revealed ? (
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Copy secret value"
          onClick={handleCopy}
        >
          <Copy aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  );
}
