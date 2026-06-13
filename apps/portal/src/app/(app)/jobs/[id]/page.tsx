import type { Metadata } from "next";
import { JobDetailPlaceholder } from "./_components/job-detail-placeholder";

export const metadata: Metadata = {
  title: "Job details",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailPlaceholder id={id} />;
}
