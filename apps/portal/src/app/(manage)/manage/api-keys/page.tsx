import type { Metadata } from "next";
import { apiKeys as seedApiKeys } from "@/lib/mock";
import { ApiKeysClient } from "./_components";

export const metadata: Metadata = {
  title: "API keys",
};

export default function ApiKeysPage() {
  return <ApiKeysClient initialKeys={seedApiKeys} />;
}
