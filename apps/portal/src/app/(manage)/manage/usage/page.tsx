import type { Metadata } from "next";
import { UsageView } from "./_components";

export const metadata: Metadata = {
  title: "Usage",
};

export default function UsagePage() {
  return <UsageView />;
}
