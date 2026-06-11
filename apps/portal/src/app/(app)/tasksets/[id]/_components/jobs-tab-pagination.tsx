"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

interface PaginationRowProps {
  page: number;
  pageSize: PageSize;
  total: number;
  onPageChange: (next: number) => void;
  onPageSizeChange: (next: PageSize) => void;
}

export function PaginationRow({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationRowProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3.5 px-1">
      <div className="text-meta-foreground font-mono text-meta tracking-normal tabular-nums">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of{" "}
        {total.toLocaleString()} jobs
      </div>
      <div className="flex items-center gap-2.5">
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v) as PageSize)}
        >
          <SelectTrigger
            size="sm"
            aria-label="Rows per page"
            className="w-auto min-w-0 shrink-0 font-mono"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </IconButton>
        <span className="text-muted-foreground font-mono text-caption tabular-nums">
          Page {page} of {pageCount}
        </span>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </IconButton>
      </div>
    </div>
  );
}
