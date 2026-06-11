import { Panel } from "@/app/(manage)/_components/page-primitives";
import MembersTable from "./members-table";
import { membersUser } from "@/lib/mock";

export function MembersUserView() {
  return (
    <Panel>
      <MembersTable members={membersUser} />
      <p className="mt-4 text-caption text-meta-foreground">
        You can see the roster, but only owners and admins can invite or remove members.
      </p>
    </Panel>
  );
}
