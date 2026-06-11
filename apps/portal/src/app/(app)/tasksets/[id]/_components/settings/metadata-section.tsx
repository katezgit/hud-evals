import { CopyButton } from "@repo/ui/components/copy-button";

interface MetadataSectionProps {
  tasksetId: string;
  createdAt?: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;
}

const EM_DASH = "—";

export default function MetadataSection({
  tasksetId,
  createdAt,
  createdBy,
  modifiedAt,
  modifiedBy,
}: MetadataSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-body font-semibold text-foreground">Metadata</h3>

      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-body">
        <dt className="text-muted-foreground">Taskset ID</dt>
        <dd className="flex items-center gap-2">
          <span className="font-mono text-foreground">{tasksetId}</span>
          <CopyButton
            value={tasksetId}
            ariaLabel={`Copy Taskset ID ${tasksetId}`}
            tooltipLabel="Copy ID"
          />
        </dd>

        <dt className="text-muted-foreground">Created</dt>
        <dd className="text-foreground">{createdAt ?? EM_DASH}</dd>

        <dt className="text-muted-foreground">Created by</dt>
        <dd className="text-foreground">{createdBy ?? EM_DASH}</dd>

        <dt className="text-muted-foreground">Last modified</dt>
        <dd className="text-foreground">
          {modifiedAt ? (
            <>
              {modifiedAt}
              {modifiedBy && (
                <span className="text-muted-foreground"> by {modifiedBy}</span>
              )}
            </>
          ) : (
            EM_DASH
          )}
        </dd>
      </dl>
    </section>
  );
}
