import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findJobDetail } from "@/lib/mock/job-detail";
import JobDetailView from "./_components/job-detail-view";

export const metadata: Metadata = {
  title: "Job details",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = findJobDetail(id);
  if (!detail) notFound();
  return <JobDetailView detail={detail} />;
}
