"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Tags <html data-route-direction="to-manage|to-app|none"> based on the
// pathname transition. The sidebar route-transition CSS in globals.css keys
// off this attribute to pick slide direction (workspace exits left when
// entering manage; settings exits right when returning to app).
//
// Lives in the root layout so it observes navigations between any (app)/**
// route and any (manage)/** route without coupling to specific Link sites.
// "none" disables the sidebar slide for any other navigation (e.g. within
// (app), within (manage), to /login) — those route changes don't swap shells.
export function RouteDirectionTagger() {
  const pathname = usePathname();
  const previousRef = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousRef.current;
    const root = document.documentElement;

    if (previous === null) {
      // First paint — no prior route to transition from. Spec §H: hard refresh
      // into /manage renders sidebar at rest, no animation.
      root.dataset.routeDirection = "none";
      previousRef.current = pathname;
      return;
    }

    const wasManage = previous.startsWith("/manage");
    const isManage = pathname.startsWith("/manage");

    if (!wasManage && isManage) {
      root.dataset.routeDirection = "to-manage";
    } else if (wasManage && !isManage) {
      root.dataset.routeDirection = "to-app";
    } else {
      root.dataset.routeDirection = "none";
    }

    previousRef.current = pathname;
  }, [pathname]);

  return null;
}
