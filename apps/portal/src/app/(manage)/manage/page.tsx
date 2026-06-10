import { redirect } from "next/navigation";

/**
 * `/manage` → `/manage/profile` — the safe landing page for all role tiers
 * (docs/design/screens/settings.wireframe.md "Fall-through rule").
 */
export default function ManagePage() {
  redirect("/manage/profile");
}
