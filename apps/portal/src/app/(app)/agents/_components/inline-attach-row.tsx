"use client";

import { useCallback, useMemo, useState } from "react";

import { Combobox, type ComboboxOption } from "@repo/ui/components/combobox";
import type { Taskset } from "@/lib/mock/tasksets";

interface InlineAttachRowProps {
  availableTasksets: ReadonlyArray<Taskset>;
  onSelectStage: (tasksetId: string) => void;
}

export function InlineAttachRow({
  availableTasksets,
  onSelectStage,
}: InlineAttachRowProps) {
  const noneAvailable = availableTasksets.length === 0;
  const options: ComboboxOption[] = useMemo(
    () => availableTasksets.map((t) => ({ value: t.id, label: t.name })),
    [availableTasksets],
  );

  // Ephemeral picker: each pick stages a row and remounts the Combobox so its
  // internal query resets to the placeholder. Value stays null at this level —
  // the parent owns the staged set, not the picker.
  const [resetKey, setResetKey] = useState(0);
  const handleValueChange = useCallback(
    (next: string | null) => {
      if (next == null) return;
      onSelectStage(next);
      setResetKey((k) => k + 1);
    },
    [onSelectStage],
  );

  return (
    <div className="rounded-md border border-dashed border-border bg-transparent px-2 py-2">
      <Combobox
        key={resetKey}
        value={null}
        onValueChange={handleValueChange}
        options={options}
        placeholder={noneAvailable ? "All tasksets attached" : "Attach this agent to another taskset…"}
        emptyText="No tasksets match"
        disabled={noneAvailable}
        size="sm"
      />
    </div>
  );
}
