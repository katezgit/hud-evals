import { Badge } from "@repo/ui/components/badge";

/**
 * Detail-page badge naming the organization that publishes the environment.
 * Label comes from the env's `organization` field (e.g. "HUD"). Index cards
 * now surface the org inline with the env name (top-row "org / name"); this
 * badge survives for use on the detail page header.
 */
export function OrganizationBadge({ name }: { name: string }) {
  return (
    <Badge variant="neutral" size="sm">
      {name}
    </Badge>
  );
}
