import { redirect } from "next/navigation";

/**
 * Legacy URL alias — the new IA splits "settings" into Profile (Personal) and
 * Organization (Organization). Default to Profile, the safe landing page.
 */
export default function SettingsPage() {
  redirect("/manage/profile");
}
