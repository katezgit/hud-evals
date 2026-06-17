"use client";

import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@repo/ui/components/table";
import type { HomeJobRow } from "@/lib/mock/home-jobs";
import {
  JobCell,
  ModelOwnerCell,
  StatusCell,
  TasksetCell,
} from "./jobs-index-cells";

interface JobsIndexRowProps {
  job: HomeJobRow;
}

export function JobsIndexRow({ job }: JobsIndexRowProps) {
  const router = useRouter();
  return (
    <TableRow onDrill={() => router.push(`/jobs/${job.id}`)}>
      <TableCell>
        <StatusCell state={job.state} />
      </TableCell>
      <TableCell>
        <JobCell job={job} />
      </TableCell>
      <TableCell>
        <TasksetCell job={job} />
      </TableCell>
      <TableCell>
        <ModelOwnerCell job={job} />
      </TableCell>
    </TableRow>
  );
}
