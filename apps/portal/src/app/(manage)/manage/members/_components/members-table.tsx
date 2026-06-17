"use client";

import type { ReactNode } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@repo/ui/components/badge";
import ManageTable from "@/app/(manage)/_components/manage-table";
import type { Member, Role } from "@/lib/mock/types";

interface MembersTableProps {
  members: ReadonlyArray<Member>;
  /**
   * Optional per-row trailing slot. When provided, the table renders an
   * "actions" column with the rendered node aligned right. Composition over
   * boolean toggles — caller decides the actions, table decides the layout.
   */
  renderRowActions?: (member: Member) => ReactNode;
}

const ROLE_LABEL: Record<Role, string> = {
  owner: "owner",
  admin: "admin",
  member: "member",
};

const columnHelper = createColumnHelper<Member>();

function buildColumns(renderRowActions?: (member: Member) => ReactNode) {
  const base = [
    columnHelper.accessor("name", {
      header: "Member",
      cell: (info) => (
        <>
          {info.getValue()}
          {info.row.original.isYou ? (
            <span className="ml-1.5 font-mono text-caption text-meta-foreground">
              · you
            </span>
          ) : null}
        </>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
      meta: { cellClassName: "font-mono text-label text-muted-foreground" },
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => <RolePill role={info.getValue()} />,
    }),
  ];

  if (!renderRowActions) return base;

  return [
    ...base,
    columnHelper.display({
      id: "actions",
      header: () => null,
      cell: (info) => renderRowActions(info.row.original),
      meta: {
        headerClassName: "w-10",
        cellClassName: "text-right",
      },
    }),
  ];
}

export default function MembersTable({ members, renderRowActions }: MembersTableProps) {
  const columns = buildColumns(renderRowActions);
  const table = useReactTable({
    data: members as Member[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <ManageTable table={table} bordered />;
}

function RolePill({ role }: { role: Role }) {
  return (
    <Badge variant={role === "owner" ? "success" : "neutral"}>
      {ROLE_LABEL[role]}
    </Badge>
  );
}
