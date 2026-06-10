import type { Metadata } from "next";
import { MembersView } from "./_components";

export const metadata: Metadata = {
  title: "Members",
};

export default function MembersPage() {
  return <MembersView />;
}
