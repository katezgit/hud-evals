import type { ReactNode } from "react";
import ManagePageHeader from "@/app/(manage)/_components/manage-page-header";
import { ManagePageActionProvider } from "@/app/(manage)/_components/manage-page-action";

export default function ManageSegmentLayout({ children }: { children: ReactNode }) {
  return (
    <ManagePageActionProvider>
      <ManagePageHeader />
      {children}
    </ManagePageActionProvider>
  );
}
