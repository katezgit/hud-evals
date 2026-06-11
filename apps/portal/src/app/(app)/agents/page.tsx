import type { Metadata } from "next";
import { presetAgents, userAgents } from "@/lib/mock/agents";
import { AgentsCatalog } from "./_components/agents-catalog";

export const metadata: Metadata = {
  title: "Agents",
};

export default function AgentsPage() {
  return (
    <AgentsCatalog presetAgents={presetAgents} userAgents={userAgents} />
  );
}
