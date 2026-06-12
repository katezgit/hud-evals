import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent details",
};

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return (
    <div className="page-shell block">
      <h1>/agents/[id]</h1>
    </div>
  );
}
