"use client";

import { useRole } from "@/lib/mock/role-context";
import { OrganizationAdminView } from "./organization-admin-view";
import { OrganizationUserView } from "./organization-user-view";

export function OrganizationView() {
  const { isAdmin } = useRole();
  return isAdmin ? <OrganizationAdminView /> : <OrganizationUserView />;
}
