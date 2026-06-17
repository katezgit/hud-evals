import { ArrowUpRightIcon, Box } from "lucide-react";
import type { EnvTemplate } from "../../_data/templates";

export function TemplateCard({ template }: { template: EnvTemplate }) {
  return (
    <a
      href={template.repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-panel p-4 transition-colors duration-fast hover:border-border-strong hover:bg-hover-surface"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
          >
            <Box className="size-4" />
          </span>
          <span className="truncate font-mono text-body font-semibold text-foreground">
            {template.name}
          </span>
        </div>
        <ArrowUpRightIcon
          aria-hidden="true"
          className="size-3.5 shrink-0 text-meta-foreground group-hover:text-foreground"
        />
      </div>
      <p className="line-clamp-2 text-label text-muted-foreground">
        {template.description}
      </p>
    </a>
  );
}
