"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { CodeBlock } from "@repo/ui/components/code-block";

export interface DirectUseSectionProps {
  mcp: string;
  python: string;
}

export function DirectUseSection({ mcp, python }: DirectUseSectionProps) {
  return (
    <section
      id="use-directly-section"
      aria-labelledby="use-directly-heading"
      className="flex flex-col gap-3 scroll-mt-40"
    >
      <header className="flex flex-col gap-1">
        <h2
          id="use-directly-heading"
          className="text-subtitle font-semibold text-foreground"
        >
          Use Environment Directly
        </h2>
        <p className="text-label text-muted-foreground">
          Connect to this environment from your eval harness without a Scenario.
        </p>
      </header>

      <Tabs defaultValue="mcp" className="gap-3">
        <TabsList variant="underline">
          <TabsTrigger value="mcp">MCP</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
        </TabsList>

        <TabsContent value="mcp">
          <CodeBlock variant="block" language="json" code={mcp} />
        </TabsContent>
        <TabsContent value="python">
          <CodeBlock variant="block" language="python" code={python} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
