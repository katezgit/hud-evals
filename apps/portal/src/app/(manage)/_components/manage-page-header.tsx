"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { findManageRoute } from "@/app/(manage)/_lib/manage-routes";
import { useManagePageAction } from "@/app/(manage)/_components/manage-page-action";

export default function ManagePageHeader() {
  const pathname = usePathname();
  const route = findManageRoute(pathname);
  const { action } = useManagePageAction();

  useEffect(() => {
    if (route) document.title = `${route.title} · HUD`;
  }, [route]);

  if (!route) return null;
  return (
    <header className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-display font-semibold text-foreground">{route.title}</h1>
        <p className="mt-1 text-muted-foreground">{route.lead}</p>
      </div>
      {action}
    </header>
  );
}
