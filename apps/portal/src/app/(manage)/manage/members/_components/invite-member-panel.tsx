"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";

type Role = "Member" | "Admin" | "Owner";

const ROLES: ReadonlyArray<Role> = ["Member", "Admin", "Owner"];

const DEFAULT_ROLE: Role = "Member";

interface InviteMemberPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function parseEmails(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

/**
 * Invite-members modal. Form state lives here; parent owns open/close.
 * Resets on close — Radix keeps the panel mounted across open/close transitions,
 * so reopening would otherwise show stale draft values.
 */
export function InviteMemberPanel({ open, onOpenChange }: InviteMemberPanelProps) {
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);
  const emailsRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      setEmails("");
      setRole(DEFAULT_ROLE);
    }
  }, [open]);

  const canSend = parseEmails(emails).length > 0;

  const handleSend = () => {
    const parsed = parseEmails(emails);
    if (parsed.length === 0) return;
    console.log("mock invite:", parsed, role);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          emailsRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Enter or paste one or more email addresses, separated by spaces or commas.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <Textarea
              ref={emailsRef}
              value={emails}
              onChange={(event) => setEmails(event.target.value)}
              placeholder="example@email.com, example2@email.com"
              rows={3}
              className="font-mono"
              aria-label="Invite emails"
            />
            <div className="flex items-center gap-2">
              <span className="text-label text-foreground">Role</span>
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger size="sm" aria-label="Invite role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSend} disabled={!canSend}>
            Send invitations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
