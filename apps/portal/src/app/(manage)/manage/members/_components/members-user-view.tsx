import MembersTable from "./members-table";
import { membersUser } from "@/lib/mock";

export function MembersUserView() {
  return (
    <>
      <MembersTable members={membersUser} />
      <p className="mt-4 text-caption text-meta-foreground">
        You can see the roster, but only owners and admins can invite or remove members.
      </p>
    </>
  );
}
