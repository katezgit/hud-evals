import type { Metadata } from "next";
import AdminGate from "@/app/(manage)/_components/admin-gate";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { limits } from "@/lib/mock";
import { LimitsTable } from "./_components";

export const metadata: Metadata = {
  title: "Limits",
};

export default function LimitsPage() {
  return (
    <AdminGate>
      <Panel>
        <LimitsTable rows={limits} />
      </Panel>
    </AdminGate>
  );
}
