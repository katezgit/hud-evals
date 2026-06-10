import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import AdminGate from "@/app/(manage)/_components/admin-gate";
import { ManagePageAction } from "@/app/(manage)/_components/manage-page-action";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { secrets } from "@/lib/mock";
import { SecretsTable } from "./_components";

export const metadata: Metadata = {
  title: "Secrets",
};

export default function SecretsPage() {
  return (
    <AdminGate>
      <ManagePageAction>
        <Button variant="primary" size="sm">
          <PlusIcon aria-hidden="true" className="size-3.5" />
          Add Secret
        </Button>
      </ManagePageAction>
      <Panel>
        <SecretsTable rows={secrets} />
      </Panel>
    </AdminGate>
  );
}
