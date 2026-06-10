import { redirect } from "next/navigation";

/**
 * Legacy URL alias — credits live in the in-shell pill + the admin Billing
 * page now. Redirect preserves old links.
 */
export default function CreditsPage() {
  redirect("/manage/billing");
}
