import { cn } from "@repo/ui/lib/cn";

export default function ToolChip({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <code
      className={cn(
        "inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 font-mono text-meta text-foreground",
        className,
      )}
    >
      {name}
    </code>
  );
}

export function ToolSequence({
  tools,
  loop,
}: {
  tools: ReadonlyArray<string>;
  loop?: boolean;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {tools.map((t, i) => (
        <span key={`${t}-${i}`} className="inline-flex items-center gap-1">
          <ToolChip name={t} />
          {i < tools.length - 1 && (
            <span aria-hidden="true" className="text-meta-foreground">
              →
            </span>
          )}
        </span>
      ))}
      {loop && (
        <span className="ml-1 text-meta text-muted-foreground">loop</span>
      )}
    </span>
  );
}
