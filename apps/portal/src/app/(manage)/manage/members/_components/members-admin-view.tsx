"use client";

import { PlusIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import { ManagePageAction } from "@/app/(manage)/_components/manage-page-action";
import { Panel } from "@/app/(manage)/_components/page-primitives";
import { InviteMemberPanel } from "./invite-member-panel";
import MembersTable from "./members-table";
import { membersAdmin } from "@/lib/mock";

export function MembersAdminView() {
  const [inviting, setInviting] = useState(false);

  return (
    <>
      <ManagePageAction>
        <Button variant="primary" size="sm" onClick={() => setInviting(true)}>
          <PlusIcon aria-hidden="true" className="size-3.5" />
          Invite Member
        </Button>
      </ManagePageAction>
      <InviteMemberPanel open={inviting} onOpenChange={setInviting} />
      <Panel>
        <MembersTable
          members={membersAdmin}
          renderRowActions={(member) => (
            <IconButton
              variant="destructive-ghost"
              size="sm"
              aria-label={`Remove ${member.name}`}
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
            </IconButton>
          )}
        />
      </Panel>
    </>
  );
}
