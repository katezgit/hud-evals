import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbProps {
  parent: { href: string; label: string };
  current: string;
}

export function Breadcrumb({ parent, current }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-label tracking-normal normal-case text-muted-foreground"
    >
      <Link
        href={parent.href}
        className="cursor-pointer rounded-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {parent.label}
      </Link>
      <ChevronRight aria-hidden="true" className="size-3 text-meta-foreground" />
      <span aria-current="page" className="truncate text-foreground">
        {current}
      </span>
    </nav>
  );
}
