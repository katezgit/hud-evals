import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTraceById } from "@/lib/mock/trace-detail";
import { TraceDetailView } from "./_components/trace-detail-view";

export const metadata: Metadata = {
  title: "Trace details",
};

export default async function TraceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trace = getTraceById(id);
  if (!trace) notFound();
  return <TraceDetailView trace={trace} />;
}
