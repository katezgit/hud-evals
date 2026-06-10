import type { Metadata } from "next";
import { EnvironmentsIndex } from "./_components/environments-index";
import {
  getEnvActivity,
  listEnvironments,
} from "./[id]/_data/environments";

export const metadata: Metadata = {
  title: "Environments",
};

export default function EnvironmentsPage() {
  const environments = listEnvironments();
  const activity = getEnvActivity();

  return <EnvironmentsIndex environments={environments} activity={activity} />;
}
