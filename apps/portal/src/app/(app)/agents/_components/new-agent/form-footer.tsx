"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface FormFooterProps {
  onBack: () => void;
  onCancel: () => void;
  canSubmit: boolean;
  submitting: boolean;
}

export function FormFooter({
  onBack,
  onCancel,
  canSubmit,
  submitting,
}: FormFooterProps) {
  return (
    <div className="mt-6 flex items-center justify-between pt-4">
      <Button type="button" variant="ghost" size="md" onClick={onBack}>
        <ArrowLeft aria-hidden="true" />
        Back
      </Button>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
        >
          <Plus aria-hidden="true" />
          {submitting ? "Creating…" : "Create"}
        </Button>
      </div>
    </div>
  );
}
