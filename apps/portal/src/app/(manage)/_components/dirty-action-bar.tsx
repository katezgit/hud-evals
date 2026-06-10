"use client";

import { Button } from "@repo/ui/components/button";

interface DirtyActionBarProps {
  isDirty: boolean;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  saving?: boolean;
  disableSave?: boolean;
}

export default function DirtyActionBar({
  isDirty,
  onCancel,
  onSave,
  saveLabel = "Save",
  saving = false,
  disableSave = false,
}: DirtyActionBarProps) {
  return (
    <div
      role="region"
      aria-label={isDirty ? "Unsaved changes" : "Form actions"}
      className="mt-6 flex w-full items-center justify-end gap-2 border-t border-border pt-4"
    >
      {isDirty ? (
        <Button variant="secondary" size="md" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      ) : null}
      <Button
        variant="primary"
        size="md"
        onClick={onSave}
        disabled={saving || disableSave}
      >
        {saving ? "Saving…" : saveLabel}
      </Button>
    </div>
  );
}
