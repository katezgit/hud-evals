import { cn } from "@repo/ui/lib/cn";
import type { Tool, ToolParam } from "../_data/types";

export function ToolsSection({ tools }: { tools: ReadonlyArray<Tool> }) {
  if (tools.length === 0) return null;
  return (
    <section
      id="tools-section"
      aria-labelledby="tools-heading"
      className="flex flex-col gap-3 scroll-mt-40"
    >
      <header className="flex flex-col gap-1">
        <h2
          id="tools-heading"
          className="text-subtitle font-semibold text-foreground"
        >
          Tools
        </h2>
        <p className="text-muted-foreground">
          These are the tools the agent will have access to when running
          scenarios.
        </p>
      </header>

      <ul className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <li key={tool.name} className="flex">
            <ToolCard tool={tool} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <article className="flex w-full flex-col gap-2 rounded-lg border border-border bg-panel p-3">
      <header className="flex flex-col gap-1">
        <h3 className="font-mono text-label font-medium text-foreground">
          {tool.name}
        </h3>
        <p className="text-label text-muted-foreground">{tool.description}</p>
      </header>
      {tool.params.length > 0 && (
        <ul className="flex flex-col gap-2 border-t border-border pt-2">
          {tool.params.map((p) => (
            <ToolParamRow key={p.name} param={p} />
          ))}
        </ul>
      )}
    </article>
  );
}

function ToolParamRow({ param }: { param: ToolParam }) {
  return (
    <li className="flex flex-col gap-0.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-mono text-meta font-semibold text-foreground">
          {param.name}
        </span>
        <span className="font-mono text-meta text-meta-foreground">
          {param.type}
        </span>
        {param.required ? (
          <span className="font-mono text-meta text-state-errored">
            required
          </span>
        ) : null}
        {param.default !== undefined && !param.required ? (
          <span className={cn("font-mono text-meta text-meta-foreground")}>
            default: {param.default}
          </span>
        ) : null}
      </div>
      {param.description ? (
        <p className="text-meta text-muted-foreground">{param.description}</p>
      ) : null}
      {param.values && param.values.length > 0 ? (
        <p className="font-mono text-meta text-meta-foreground">
          values: {param.values.join(", ")}
        </p>
      ) : null}
    </li>
  );
}
