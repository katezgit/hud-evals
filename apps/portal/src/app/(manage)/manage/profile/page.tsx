import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-display">Profile</h1>
      <p className="text-muted-foreground">TODO: implement profile settings.</p>
    </div>
  );
}
