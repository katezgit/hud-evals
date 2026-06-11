"use client";

import { useRole } from "@/lib/mock/role-context";
import { MembersAdminView } from "./members-admin-view";
import { MembersUserView } from "./members-user-view";

export function MembersView() {
  const { isAdmin } = useRole();
  return isAdmin ? <MembersAdminView /> : <MembersUserView />;
}
