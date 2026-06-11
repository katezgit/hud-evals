import type { Metadata } from "next";
import { tasksets } from "@/lib/mock/tasksets";
import TasksetsIndex from "./_components/tasksets-index";

export const metadata: Metadata = {
  title: "Tasksets",
};

export default function TasksetsPage() {
  return <TasksetsIndex tasksets={tasksets} />;
}
