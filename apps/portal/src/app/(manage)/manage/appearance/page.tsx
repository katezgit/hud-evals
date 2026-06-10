import type { Metadata } from "next";
import { AppearanceForm } from "./_components";

export const metadata: Metadata = {
  title: "Appearance",
};

export default function AppearancePage() {
  return <AppearanceForm />;
}
