"use client";

import { useRouter } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  tableBodyClass,
  tableCellVariants,
  tableClass,
  tableHeaderClass,
  tableHeadVariants,
  tableRowVariants,
} from "@repo/ui/components/table";
import type {
  Checkpoint,
  Model,
  OwnershipClass,
  Viewer,
} from "../_data/types";

const FORK_FLAG_ENABLED =
  process.env.NEXT_PUBLIC_FEATURE_CHECKPOINT_FORK === "1";

interface CheckpointsTabProps {
  model: Model;
  viewer: Viewer;
  ownershipClass: OwnershipClass;
  checkpoints: ReadonlyArray<Checkpoint>;
}

export function CheckpointsTab({
  model,
  viewer,
  ownershipClass,
  checkpoints,
}: CheckpointsTabProps) {
  // Ownership class is read but not branched on at this iteration — Fork
  // availability is governed by the feature flag, not ownership. Kept on the
  // props contract so later "Fork disabled for org-member" gating lands
  // without re-threading the prop graph.
  void viewer;
  void ownershipClass;

  return (
    <div className="py-4">
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <CheckpointsTable
          rows={checkpoints}
          activeCheckpointId={model.activeCheckpointId}
          modelId={model.id}
        />
      </div>
    </div>
  );
}

const columnHelper = createColumnHelper<Checkpoint>();

function CheckpointsTable({
  rows,
  activeCheckpointId,
  modelId,
}: {
  rows: ReadonlyArray<Checkpoint>;
  activeCheckpointId: string | null;
  modelId: string;
}) {
  const columns: ColumnDef<Checkpoint, unknown>[] = [
    columnHelper.accessor("id", {
      id: "checkpoint",
      header: () => <span>Checkpoint</span>,
      cell: (info) => (
        <span className="font-mono text-foreground">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("step", {
      id: "step",
      header: () => <span>Step</span>,
      cell: (info) => (
        <span className="font-mono tabular-nums text-foreground">
          step {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("evalScore", {
      id: "eval",
      header: () => <span>Eval</span>,
      cell: (info) => <EvalCell score={info.getValue()} />,
    }),
    columnHelper.accessor("createdAt", {
      id: "created",
      header: () => <span>Created</span>,
      cell: (info) => <CreatedCell iso={info.getValue()} />,
    }),
    columnHelper.display({
      id: "active",
      header: () => <span className="sr-only">Active checkpoint marker</span>,
      cell: (info) =>
        info.row.original.id === activeCheckpointId && (
          <Badge variant="success" size="sm">Active</Badge>
        ),
    }),
    ...(FORK_FLAG_ENABLED
      ? [
          columnHelper.display({
            id: "fork",
            header: () => <span className="sr-only">Fork action</span>,
            cell: (info) =>
              info.row.original.id !== activeCheckpointId && (
                <TrainCell
                  checkpoint={info.row.original}
                  modelId={modelId}
                />
              ),
          }),
        ]
      : []),
  ];

  const table = useReactTable({
    data: rows as Checkpoint[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className={tableClass}>
      <thead className={tableHeaderClass}>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id} className={tableHeadVariants()}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className={tableBodyClass}>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className={tableRowVariants()}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className={tableCellVariants()}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EvalCell({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span aria-label="No eval yet" className="text-meta-foreground">
        —
      </span>
    );
  }
  return (
    <span className="font-mono tabular-nums text-foreground">
      {score.toFixed(1)}%
    </span>
  );
}

function CreatedCell({ iso }: { iso: string }) {
  // `Date.now()` reads differ between SSR snapshot and client hydration; the
  // visible text is allowed to drift by a render. `title` keeps the absolute
  // ISO for hover inspection.
  return (
    <span title={iso} suppressHydrationWarning className="text-muted-foreground">
      {formatRelative(iso)}
    </span>
  );
}

function TrainCell({
  checkpoint,
  modelId,
}: {
  checkpoint: Checkpoint;
  modelId: string;
}) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() =>
        router.push(
          `/jobs/new?type=training&modelId=${modelId}&forkFrom=${checkpoint.id}`,
        )
      }
      aria-label={`Fork and train from checkpoint ${checkpoint.id}`}
    >
      Train
    </Button>
  );
}

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatRelative(iso: string): string {
  const target = Date.parse(iso);
  if (Number.isNaN(target)) return iso;
  const diffSeconds = Math.round((target - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return RTF.format(diffSeconds, "second");
  if (abs < 60 * 60) return RTF.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 60 * 60 * 24)
    return RTF.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 60 * 60 * 24 * 30)
    return RTF.format(Math.round(diffSeconds / 86400), "day");
  if (abs < 60 * 60 * 24 * 365)
    return RTF.format(Math.round(diffSeconds / (86400 * 30)), "month");
  return RTF.format(Math.round(diffSeconds / (86400 * 365)), "year");
}
