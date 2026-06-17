"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GlobeIcon, LockIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@repo/ui/components/button";
import { FieldError, FieldLabel, FormField } from "@repo/ui/components/form-field";
import { IconButton } from "@repo/ui/components/icon-button";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/cn";
import type { Model } from "../_data/types";

const generalSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(80, "Display name must be 80 characters or fewer"),
  tags: z.array(z.string().min(1).max(40)).max(20, "Maximum 20 tags"),
});

type GeneralValues = z.infer<typeof generalSchema>;

export function GeneralSection({
  model,
  disabled,
}: {
  model: Model;
  disabled: boolean;
}) {
  // `disabled=true` on this surface means the model is permanently non-editable
  // (e.g. a gateway model). Render a read-only view — values are still meaningful
  // information the user needs to perceive, so fields stay in tab order and
  // screen readers announce label + value normally. `disabled` (HTML) would
  // strip both, which is wrong for permanent display.
  if (disabled) {
    return <ReadOnlyGeneralSection model={model} />;
  }
  return <EditableGeneralSection model={model} />;
}

function GeneralShell({ children }: { children: React.ReactNode }) {
  return (
    <section aria-labelledby="general-heading" className="max-w-3xl">
      {children}
    </section>
  );
}

function GeneralHeading() {
  return (
    <h2
      id="general-heading"
      className="text-subtitle font-medium text-foreground"
    >
      General
    </h2>
  );
}

function VisibilityRow({ isPrivate }: { isPrivate: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor="model-visibility">Visibility</FieldLabel>
      <div
        id="model-visibility"
        className="inline-flex items-center gap-1.5 text-body text-foreground"
      >
        {isPrivate ? (
          <LockIcon aria-hidden="true" className="size-3.5 text-meta-foreground" />
        ) : (
          <GlobeIcon aria-hidden="true" className="size-3.5 text-meta-foreground" />
        )}
        <span>{isPrivate ? "Private" : "Public"}</span>
      </div>
    </div>
  );
}

function ReadOnlyGeneralSection({ model }: { model: Model }) {
  return (
    <GeneralShell>
      <div className="rounded-surface border border-border bg-panel px-5 py-4">
        <GeneralHeading />
        <div className="mt-4">
          <FormField id="model-display-name" label="Display name">
            <Input
              type="text"
              readOnly
              value={model.displayName}
              autoComplete="off"
              spellCheck={false}
              className="bg-muted-surface"
            />
          </FormField>
        </div>

        <div className="mt-4">
          <ReadOnlyTagsField id="model-tags" value={model.tags} />
        </div>

        <div className="mt-4">
          <VisibilityRow isPrivate={model.isPrivate} />
        </div>
      </div>
    </GeneralShell>
  );
}

function EditableGeneralSection({ model }: { model: Model }) {
  const form = useForm<GeneralValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      displayName: model.displayName,
      tags: [...model.tags],
    },
    mode: "onChange",
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, isValid, errors },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    // Mock persistence: 300ms thinking, then snap dirty baseline to the new
    // values so the Save button disables until the user touches the form again.
    await new Promise((resolve) => setTimeout(resolve, 300));
    reset(values);
  });

  return (
    <GeneralShell>
      <form
        onSubmit={onSubmit}
        noValidate
        className="rounded-surface border border-border bg-panel px-5 py-4"
      >
        <GeneralHeading />
        <div className="mt-4">
          <FormField
            id="model-display-name"
            label="Display name"
            error={errors.displayName?.message}
          >
            <Input
              type="text"
              autoComplete="off"
              spellCheck={false}
              {...register("displayName")}
            />
          </FormField>
        </div>

        <div className="mt-4">
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <EditableTagsField
                id="model-tags"
                value={field.value}
                onChange={field.onChange}
                error={errors.tags?.message}
              />
            )}
          />
        </div>

        <div className="mt-4">
          <VisibilityRow isPrivate={model.isPrivate} />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!isDirty || isSubmitting}
            onClick={() => reset()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty || !isValid || isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </GeneralShell>
  );
}

function ReadOnlyTagsField({
  id,
  value,
}: {
  id: string;
  value: ReadonlyArray<string>;
}) {
  return (
    <div data-slot="form-field" className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>Tags</FieldLabel>
      <div
        id={id}
        role="group"
        tabIndex={0}
        aria-label={
          value.length === 0
            ? "Tags (read-only): none"
            : `Tags (read-only): ${value.join(", ")}`
        }
        className={cn(
          "flex w-full flex-wrap items-center gap-1.5",
          "h-auto min-h-8 px-2.5 py-1 rounded-lg border border-border bg-muted-surface",
          "transition-[color,box-shadow,outline]",
        )}
      >
        {value.length === 0 ? (
          <span className="text-body text-meta-foreground">—</span>
        ) : (
          value.map((tag) => (
            <span
              key={tag}
              className={cn(
                "inline-flex items-center",
                "rounded-badge border border-border bg-background px-2 py-0.5",
                "text-label font-mono text-foreground",
              )}
            >
              {tag}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function EditableTagsField({
  id,
  value,
  onChange,
  error,
}: {
  id: string;
  value: ReadonlyArray<string>;
  onChange: (next: ReadonlyArray<string>) => void;
  error?: string;
}) {
  const [draft, setDraft] = useState("");
  const errorId = error ? `${id}-error` : undefined;

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    if (value.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  };

  const remove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  // Custom layout: label's htmlFor must point to the inner <input>, not the
  // shell <div>. FormField's cloneElement would inject the id on the shell
  // (creating a duplicate id with the inner input and breaking label click),
  // so we render FieldLabel/FieldError directly here.
  return (
    <div data-slot="form-field" className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>Tags</FieldLabel>
      <div
        className={cn(
          "flex w-full flex-wrap items-center gap-1.5",
          "h-auto min-h-8 px-2.5 py-1 rounded-lg border border-border bg-background",
          "transition-[color,box-shadow,outline]",
          // Keyboard-only focus ring on the shell, matching the canonical Input
          // shell pattern (ring-2 ring-ring ring-offset-2 = white-inner + teal-outer).
          // `:has(:focus-visible)` (not focus-within) so the × IconButton inside
          // doesn't paint the ring when mouse-clicked to remove a tag.
          "has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1",
              "rounded-badge border border-border bg-muted-surface px-2 py-0.5",
              "text-label font-mono text-foreground",
            )}
          >
            {tag}
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove tag ${tag}`}
              onClick={() => remove(tag)}
              className="size-4 text-meta-foreground"
            >
              <XIcon aria-hidden="true" />
            </IconButton>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={draft}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          placeholder={value.length === 0 ? "Add tag…" : ""}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
              return;
            }
            if (e.key === "Backspace" && draft.length === 0 && value.length > 0) {
              e.preventDefault();
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={commit}
          className={cn(
            "min-w-0 flex-1 border-none bg-transparent text-body text-foreground outline-none",
            "placeholder:text-meta-foreground",
            // Suppress the global *:focus-visible ring (outline + shadow-focus glow)
            // on the inner input — the outer shell div already paints the focus ring
            // via focus-within, matching the Input primitive's shell pattern.
            "focus-visible:outline-none focus-visible:shadow-none",
          )}
        />
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
