import { Lock } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { OrganizationFields } from "./organization-fields";

export function OrganizationUserView() {
  return (
    <>
      <Card className="mb-4 flex flex-row items-start gap-3 px-4 py-3">
        <Lock aria-hidden="true" className="mt-1 size-4 shrink-0 text-meta-foreground" />
        <p className="text-body text-muted-foreground">
          Read-only — these settings are managed by your org owner.
        </p>
      </Card>

      <Panel title="Details">
        <OrganizationFields />
      </Panel>
    </>
  );
}
