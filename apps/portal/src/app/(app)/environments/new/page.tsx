import type { Metadata } from "next";
import { NewEnvironmentShell } from "./_components/new-environment-shell";

export const metadata: Metadata = {
  title: "New Environment",
};

export default function NewEnvironmentPage() {
  return <NewEnvironmentShell />;
}
