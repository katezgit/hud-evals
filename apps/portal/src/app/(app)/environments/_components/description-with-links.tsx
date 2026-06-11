"use client";

import * as React from "react";
import { cn } from "@repo/ui/lib/cn";

const URL_PATTERN = /(https?:\/\/[^\s)]+)/g;
const CODE_MARKER = /\{code:([^}]+)\}/g;

/**
 * Renders an Environment description with inline URLs turned into external
 * links. Click on a link stops propagation so the surrounding card link does
 * NOT trigger navigation — see wireframe §4.2. `{code:KEY}` markers (used by
 * the detail-page renderer) are unwrapped to their key for the index card,
 * which has no inline-code styling.
 *
 * The component is colocated to the index because it's tightly coupled to the
 * card layout and `{code:…}` marker convention; promoting it would create a
 * shared primitive with effectively one caller.
 */
export function DescriptionWithLinks({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (text.trim().length === 0) {
    return (
      <p className={cn("text-label italic text-muted-foreground", className)}>
        No description
      </p>
    );
  }

  const stripped = text.replace(CODE_MARKER, "$1");
  const parts = stripped.split(URL_PATTERN);

  return (
    <p className={cn("text-label text-muted-foreground line-clamp-3", className)}>
      {parts.map((part, i) => {
        if (URL_PATTERN.test(part)) {
          URL_PATTERN.lastIndex = 0;
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              title={part}
              onClick={(e) => e.stopPropagation()}
              className="break-all text-primary underline-offset-2 hover:underline"
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </p>
  );
}
