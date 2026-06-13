import type { Metadata } from "next";
import { HOME_RECENT_JOBS } from "@/lib/mock/home-jobs";
import JobsIndex from "./_components/jobs-index";

export const metadata: Metadata = {
  title: "Jobs",
};

export default function JobsPage() {
  return <JobsIndex rows={HOME_RECENT_JOBS} />;
}
