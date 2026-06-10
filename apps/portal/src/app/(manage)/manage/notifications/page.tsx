import type { Metadata } from "next";
import { NotificationsForm } from "./_components";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  return <NotificationsForm />;
}
