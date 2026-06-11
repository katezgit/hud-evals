"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import { cn } from "@repo/ui/lib/cn";
import type { Model } from "@/lib/mock/model-registry";

interface ModelRowProps {
  model: Model;
  selected: boolean;
  onToggle: (id: string) => void;
}

export default function ModelRow({ model, selected, onToggle }: ModelRowProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 py-1 pr-2.5 pl-7",
        "hover:bg-hover-surface",
        selected && "bg-primary-soft hover:bg-primary-soft",
      )}
    >
      <Checkbox
        size="sm"
        checked={selected}
        onCheckedChange={() => onToggle(model.id)}
        aria-label={`Select ${model.id}`}
      />
      <span
        className={cn(
          "flex-1 truncate font-mono text-label",
          selected ? "font-medium text-foreground" : "text-foreground",
        )}
      >
        {model.id}
      </span>
      <span className="whitespace-nowrap font-mono text-meta text-meta-foreground">
        {model.ctx} ctx
      </span>
    </label>
  );
}
