import type { Metadata } from "next";
import { OrganizationView } from "./_components";

export const metadata: Metadata = {
  title: "Organization",
};

export default function OrganizationPage() {
  return <OrganizationView />;
}
