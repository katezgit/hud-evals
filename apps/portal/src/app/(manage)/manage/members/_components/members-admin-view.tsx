"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { ManagePageAction } from "@/app/(manage)/_components/manage-page-action";
import { InviteMemberPanel } from "./invite-member-panel";
import MembersTable from "./members-table";
import { RemoveMemberButton } from "./remove-member-button";
import { membersAdmin } from "@/lib/mock";
import type { Member } from "@/lib/mock/types";

export function MembersAdminView() {
  const [inviting, setInviting] = useState(false);
  const [members, setMembers] = useState<ReadonlyArray<Member>>(membersAdmin);

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <>
      <ManagePageAction>
        <Button variant="primary" size="sm" onClick={() => setInviting(true)}>
          <PlusIcon aria-hidden="true" className="size-3.5" />
          Invite Member
        </Button>
      </ManagePageAction>
      <InviteMemberPanel open={inviting} onOpenChange={setInviting} />
      <MembersTable
        members={members}
        renderRowActions={(member) => (
          <RemoveMemberButton
            name={member.name}
            onRemove={() => handleRemove(member.id)}
          />
        )}
      />
    </>
  );
}
