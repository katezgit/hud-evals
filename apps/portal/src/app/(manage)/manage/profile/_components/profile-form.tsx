"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@repo/ui/components/input";
import DirtyActionBar from "@/app/(manage)/_components/dirty-action-bar";
import { Field, FieldRow, Panel } from "@/app/(manage)/_components/page-primitives";
import { currentUser } from "@/lib/mock";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(80, "Name must be 80 characters or fewer"),
  email: z.email("Enter a valid email"),
});

type ProfileValues = z.infer<typeof profileSchema>;

const DEFAULT_VALUES: ProfileValues = {
  name: currentUser.name,
  email: currentUser.email,
};

export function ProfileForm() {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors, isValid },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    reset(values);
  });

  return (
    <Panel title="Account">
      <form onSubmit={onSubmit} noValidate>
        <FieldRow cols={1}>
          <Field label="Name" error={errors.name?.message}>
            <Input
              aria-invalid={errors.name ? true : undefined}
              {...register("name")}
            />
          </Field>
        </FieldRow>

        <FieldRow cols={1} className="mt-4">
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              aria-invalid={errors.email ? true : undefined}
              {...register("email")}
            />
          </Field>
        </FieldRow>

        <DirtyActionBar
          isDirty={isDirty}
          onCancel={() => reset()}
          onSave={onSubmit}
          saving={isSubmitting}
          disableSave={!isValid}
          className="border-t-0 pt-0"
        />
      </form>
    </Panel>
  );
}
