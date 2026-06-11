import type { Metadata } from "next";
import { CreditCard, Pencil } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import { Progress } from "@repo/ui/components/progress";
import AdminGate from "@/app/(manage)/_components/admin-gate";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { BillingHistoryPanel } from "./_components";
import { creditState } from "@/lib/mock";

const NUMBER = new Intl.NumberFormat("en-US");

export const metadata: Metadata = {
  title: "Billing",
};

export default function BillingPage() {
  return (
    <AdminGate>
      <Panel
        title="Plan"
        action={
          <Button variant="secondary" size="sm">
            Manage plan
          </Button>
        }
      >
        <div className="flex items-baseline gap-3">
          <span className="text-display font-semibold text-foreground">Team</span>
          <span className="text-body text-muted-foreground">$0 base · pay per credit</span>
        </div>

        <div className="mt-6">
          <div className="mb-1.5 flex items-baseline justify-between font-mono text-label text-muted-foreground">
            <span>credits remaining</span>
            <span className="font-medium text-foreground tabular-nums">
              {NUMBER.format(creditState.balance)} / {NUMBER.format(creditState.total)}
            </span>
          </div>
          <Progress
            value={Math.round((creditState.balance / creditState.total) * 100)}
            aria-label="Credits remaining"
          />
        </div>

        <div className="mt-6 flex items-center justify-between font-mono text-label">
          <span className="uppercase tracking-widest text-muted-foreground">payment method</span>
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <CreditCard aria-hidden="true" className="size-3.5 shrink-0" />
            <span>Visa ····4242</span>
            <IconButton variant="ghost" size="sm" aria-label="Edit payment method">
              <Pencil aria-hidden="true" />
            </IconButton>
          </span>
        </div>
      </Panel>
      <BillingHistoryPanel />
    </AdminGate>
  );
}
