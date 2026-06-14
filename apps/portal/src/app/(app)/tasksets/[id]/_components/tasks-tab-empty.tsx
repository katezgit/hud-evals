"use client";

import Link from "next/link";
import { ChevronRight, ListChecks } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { cn } from "@repo/ui/lib/cn";

// Documented HUD Task JSON shape (trimmed). Kept short so the disclosure
// stays glanceable — full schema lives in the HUD platform docs.
const TASK_JSON_SCHEMA = `{
  "prompt": "<instruction shown to the agent>",
  "metadata": { "scenario": "<scenario-key>" },
  "mcp_config": { "name": "<env-name>", "args": {} },
  "setup_tool": { "name": "<setup>", "args": {} },
  "evaluate_tool": { "name": "<grader>", "args": {} }
}`;

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
      <span
        aria-hidden="true"
        className="inline-flex size-12 items-center justify-center rounded-full bg-muted-surface text-muted-foreground"
      >
        <ListChecks className="size-6" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-body font-medium text-foreground">No tasks yet</h3>
        <p className="max-w-md text-caption text-muted-foreground">
          Add tasks from a public scenario, upload your own, or push them
          programmatically.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="primary">
          <Link href="/environments">Browse Scenarios</Link>
        </Button>
        {/* Upload is dispatched from the kebab menu in the page header in a
            future step; here it surfaces as a placeholder no-op so the empty
            state still presents the canonical two-CTA shape. */}
        <Button type="button" variant="secondary" disabled>
          Upload Tasks
        </Button>
      </div>
      <SchemaDisclosure />
    </div>
  );
}

function SchemaDisclosure() {
  return (
    <Collapsible className="w-full max-w-lg">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "group inline-flex items-center gap-1 rounded-sm",
            "text-label font-medium text-muted-foreground transition-colors",
            "hover:text-foreground",
          )}
        >
          <ChevronRight
            aria-hidden="true"
            className="size-3 transition-transform group-data-[state=open]:rotate-90"
          />
          View task schema
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-2 text-left">
          <CodeBlock variant="block" language="json" code={TASK_JSON_SCHEMA} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
