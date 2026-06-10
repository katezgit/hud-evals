import { redirect } from "next/navigation";

/**
 * Legacy URL alias — `/manage/team` predates the Members rename (PR #15 → wireframe IA).
 * Redirect keeps inbound links from the old shell working.
 */
export default function TeamPage() {
  redirect("/manage/members");
}
