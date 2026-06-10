"use client";

import { useMemo } from "react";
import { HOME_RECENT_JOBS } from "@/lib/mock/home-jobs";

interface ActiveJobs {
  hasActive: boolean;
  count: number;
}

export function useActiveJobs(): ActiveJobs {
  return useMemo(() => {
    const count = HOME_RECENT_JOBS.reduce(
      (acc, job) => (job.state === "running" ? acc + 1 : acc),
      0,
    );
    return { hasActive: count > 0, count };
  }, []);
}
