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
    <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 xl:px-20 py-6">
      <h1>/agents/[id]</h1>
    </div>
  );
}
