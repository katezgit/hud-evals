import type { Metadata } from "next";
import AdminGate from "@/app/(manage)/_components/admin-gate";
import { limits } from "@/lib/mock";
import { LimitsTable } from "./_components";

export const metadata: Metadata = {
  title: "Limits",
};

export default function LimitsPage() {
  return (
    <AdminGate>
      <LimitsTable rows={limits} />
    </AdminGate>
  );
}
