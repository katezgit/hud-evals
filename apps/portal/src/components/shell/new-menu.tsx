"use client";

import Link from "next/link";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useCreditsBalance } from "@/components/shell/use-credits-balance";

interface MenuItem {
  label: string;
  /** Credit-gated items disable + show a tooltip when balance is 0. */
  creditGated?: boolean;
}

const ITEMS: ReadonlyArray<MenuItem> = [
  { label: "Environment" },
  { label: "Taskset" },
  { label: "Eval Job", creditGated: true },
  { label: "Training Job", creditGated: true },
];

export function NewMenu() {
  const credits = useCreditsBalance();
  const outOfCredits = credits.balance === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="primary" size="sm">
          <PlusIcon className="size-3.5" />
          New
          <ChevronDownIcon className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        {ITEMS.map((item) => {
          if (item.creditGated && outOfCredits) {
            return <CreditGatedItem key={item.label} label={item.label} />;
          }
          return <DropdownMenuItem key={item.label}>{item.label}</DropdownMenuItem>;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Disabled job item with a tooltip explaining why and a direct "Add Credits"
 * link. Radix DropdownMenu.Item with `disabled` still receives pointer events
 * (it just suppresses select), so the Tooltip wrapping it still fires on hover
 * and on keyboard focus.
 */
function CreditGatedItem({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuItem disabled onSelect={(e) => e.preventDefault()}>
          {label}
        </DropdownMenuItem>
      </TooltipTrigger>
      <TooltipContent side="right">
        <span>No credits remaining.</span>{" "}
        <Link
          href="/manage/billing"
          className="font-medium underline underline-offset-2"
        >
          Add Credits →
        </Link>
      </TooltipContent>
    </Tooltip>
  );
}
