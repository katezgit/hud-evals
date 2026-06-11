"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { cn } from "@repo/ui/lib/cn";
import type { EnvType } from "../[id]/_data/types";
import type { GroupKey, SortKey } from "./environments-index-types";

interface MobileFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  typeOptions: ReadonlyArray<{ value: EnvType; label: string }>;
  sortOptions: ReadonlyArray<{ value: SortKey; label: string }>;
  groupOptions: ReadonlyArray<{ value: GroupKey; label: string }>;
  typeFilter: ReadonlyArray<EnvType>;
  sortKey: SortKey;
  groupKey: GroupKey;
  onApply: (next: {
    typeFilter: ReadonlyArray<EnvType>;
    sortKey: SortKey;
    groupKey: GroupKey;
  }) => void;
}

/**
 * Mobile-only bottom sheet that consolidates the desktop type/sort/group-by
 * controls into a single trigger. Spec: environments.wireframe.md §13 mobile
 * bottom sheet.
 *
 * Selections are drafted locally and applied on `Done`. Scrim / Escape /
 * back-swipe close paths discard the draft — matches Tasksets §12 behaviour.
 * View toggle is intentionally absent: list view is forced at mobile and is
 * not a user-adjustable preference there.
 */
export function MobileFiltersSheet({
  open,
  onOpenChange,
  typeOptions,
  sortOptions,
  groupOptions,
  typeFilter,
  sortKey,
  groupKey,
  onApply,
}: MobileFiltersSheetProps) {
  const [draftTypes, setDraftTypes] = useState<ReadonlyArray<EnvType>>(
    typeFilter,
  );
  const [draftSort, setDraftSort] = useState<SortKey>(sortKey);
  const [draftGroup, setDraftGroup] = useState<GroupKey>(groupKey);

  // Re-seed the draft from props each time the sheet opens so a discarded
  // session does not leak across opens. Closing the sheet implicitly discards.
  useEffect(() => {
    if (open) {
      setDraftTypes(typeFilter);
      setDraftSort(sortKey);
      setDraftGroup(groupKey);
    }
  }, [open, typeFilter, sortKey, groupKey]);

  const toggleType = (value: EnvType) => {
    setDraftTypes((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  };

  const clearTypes = () => setDraftTypes([]);

  const handleApply = () => {
    onApply({
      typeFilter: draftTypes,
      sortKey: draftSort,
      groupKey: draftGroup,
    });
    onOpenChange(false);
  };

  return (
    <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="lg" className="rounded-t-lg">
        <DrawerHeader>
          <div>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>
              Refine the list. Tap Done to apply.
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <DrawerBody>
          <Section
            title="Type"
            trailing={
              draftTypes.length > 0 ? (
                <button
                  type="button"
                  className="font-mono text-meta text-muted-foreground hover:text-foreground"
                  onClick={clearTypes}
                >
                  Clear
                </button>
              ) : null
            }
          >
            <ul className="flex flex-col">
              {typeOptions.map((opt) => {
                const checked = draftTypes.includes(opt.value);
                return (
                  <li key={opt.value}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-hover-surface">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleType(opt.value)}
                        aria-label={opt.label}
                      />
                      <span className="text-body text-foreground">
                        {opt.label}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title="Sort">
            <RadioList
              name="mobile-filters-sort"
              value={draftSort}
              options={sortOptions}
              onChange={setDraftSort}
            />
          </Section>

          <Section title="Group by">
            <RadioList
              name="mobile-filters-group"
              value={draftGroup}
              options={groupOptions}
              onChange={setDraftGroup}
            />
          </Section>
        </DrawerBody>
        <DrawerFooter>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleApply}
          >
            Done
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function Section({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4">
      <div className="mb-1 flex items-baseline justify-between px-2">
        <h3 className="font-mono text-meta uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        {trailing}
      </div>
      {children}
    </section>
  );
}

interface RadioListProps<T extends string> {
  name: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (next: T) => void;
}

function RadioList<T extends string>({
  name,
  value,
  options,
  onChange,
}: RadioListProps<T>) {
  return (
    <ul role="radiogroup" aria-label={name} className="flex flex-col">
      {options.map((opt) => {
        const checked = opt.value === value;
        return (
          <li key={opt.value}>
            <label
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2",
                "hover:bg-hover-surface",
              )}
            >
              <span className="flex items-center gap-3">
                {/* Native input handles a11y + keyboard; we hide the default
                    glyph and render a check for selected state to match the
                    sheet's visual rhythm. */}
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={checked}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                <span className="text-body text-foreground">{opt.label}</span>
              </span>
              {checked && (
                <Check
                  aria-hidden="true"
                  className="size-4 text-primary"
                />
              )}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
