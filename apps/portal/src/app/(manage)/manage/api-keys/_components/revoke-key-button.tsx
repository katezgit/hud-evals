"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";

interface RevokeKeyButtonProps {
  name: string;
  onRevoke: () => void;
}

export function RevokeKeyButton({ name, onRevoke }: RevokeKeyButtonProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onRevoke();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton
          variant="destructive-ghost"
          size="sm"
          aria-label={`Revoke ${name}`}
        >
          <Trash2 aria-hidden="true" className="size-3.5" />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent
        variant="filter"
        className="w-64"
        side="left"
        align="center"
        sideOffset={8}
      >
        <p className="text-body font-semibold text-foreground">
          {`Revoke "${name}"?`}
        </p>
        <p className="mt-1 text-label font-normal text-muted-foreground">
          Any service using this key will start receiving 401 errors immediately.
          This cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" autoFocus onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm}>
            Revoke key
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
