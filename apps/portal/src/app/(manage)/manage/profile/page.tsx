import type { Metadata } from "next";
import { ProfileForm } from "./_components";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return <ProfileForm />;
}
