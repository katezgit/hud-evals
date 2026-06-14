"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { FormField } from "@repo/ui/components/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEND_DELAY_MS = 300;

type Role = "member" | "admin";

export function InviteForm() {
  const router = useRouter();
  const [emails, setEmails] = useState<string[]>([]);
  const [buf, setBuf] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function commitBuffer(): boolean {
    const value = buf.trim().replace(/,$/, "").trim();
    if (!value) {
      setBuf("");
      return true;
    }
    if (!EMAIL_PATTERN.test(value)) return false;
    if (emails.includes(value)) {
      setBuf("");
      return true;
    }
    setEmails([...emails, value]);
    setBuf("");
    return true;
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitBuffer();
      return;
    }
    if (e.key === "Backspace" && buf === "" && emails.length > 0) {
      setEmails(emails.slice(0, -1));
    }
  }

  function handleRemoveEmail(target: string) {
    setEmails(emails.filter((e) => e !== target));
  }

  function handleSend() {
    // Commit any pending buffer; abort if it's invalid (non-empty, non-email).
    const ok = commitBuffer();
    if (!ok) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, SEND_DELAY_MS);
  }

  function handleContinue() {
    // Wizard step done; Get Started landing is still onboarding → flag stays null.
    router.push("/");
  }

  function handleSkip() {
    router.push("/");
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted-surface px-3 py-2 text-body text-foreground">
          <CheckCircle2
            aria-hidden="true"
            className="size-4 shrink-0 text-state-scored"
          />
          <span>Invitations sent</span>
        </div>
        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    );
  }

  const sendDisabled = submitting || (emails.length === 0 && buf.trim() === "");

  return (
    <div className="flex flex-col gap-6">
      <FormField
        id="invite-emails"
        label="Email addresses"
        helper="Separate emails with commas or Enter."
      >
        <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 focus-within:shadow-focus-ring focus-within:bg-form-field-surface">
          {emails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 rounded bg-muted-surface px-2 py-0.5 text-meta text-foreground"
            >
              {email}
              <button
                type="button"
                onClick={() => handleRemoveEmail(email)}
                aria-label={`Remove ${email}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </span>
          ))}
          {/* focus ring delegated to parent via focus-within:shadow-focus-ring */}
          <input
            id="invite-emails"
            name="emails"
            type="text"
            autoComplete="off"
            placeholder={
              emails.length === 0 ? "teammate@company.com" : undefined
            }
            value={buf}
            onChange={(e) => setBuf(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => commitBuffer()}
            className="min-w-[140px] flex-1 border-none bg-transparent text-body text-foreground outline-none placeholder:text-meta-foreground focus-visible:shadow-none"
          />
        </div>
      </FormField>

      <FormField id="invite-role" label="Role">
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger id="invite-role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <div className="flex flex-col items-center gap-3">
        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={sendDisabled}
          aria-busy={submitting}
          onClick={handleSend}
        >
          {submitting ? "Sending…" : "Send invitations"}
        </Button>
        <button
          type="button"
          onClick={handleSkip}
          className="text-body text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
