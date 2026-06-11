import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTaskset } from "@/lib/mock/tasksets";
import TasksetDetail from "./_components/taskset-detail";

export const metadata: Metadata = {
  title: "Taskset details",
};

export default async function TasksetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const taskset = getTaskset(id);
  if (taskset === undefined) {
    notFound();
  }
  return <TasksetDetail taskset={taskset} />;
}
