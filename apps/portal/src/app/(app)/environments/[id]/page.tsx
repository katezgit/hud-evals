import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnvDetailShell } from "./_components/env-detail-shell";
import { getEnvironmentById, listEnvironments } from "./_data/environments";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const env = getEnvironmentById(id);
  return {
    title: env ? `${env.name} — Environments` : "Environment not found",
  };
}

export async function generateStaticParams() {
  return listEnvironments().map((env) => ({ id: env.id }));
}

export default async function EnvironmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const env = getEnvironmentById(id);
  if (!env) notFound();
  return <EnvDetailShell env={env} />;
}
