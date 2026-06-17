"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@repo/ui/components/card";
import { CopyButton } from "@repo/ui/components/copy-button";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import DirtyActionBar from "@/app/(manage)/_components/dirty-action-bar";
import { Field, FieldRow, Panel } from "@/app/(manage)/_components/page-primitives";
import { currentOrg, orgAddress } from "@/lib/mock";

const orgSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(120),
  line1: z.string().min(1, "Address is required").max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  country: z.string().min(1, "Country is required").max(80),
  state: z.string().min(1, "State or province is required").max(80),
  city: z.string().min(1, "City is required").max(80),
  postalCode: z.string().min(1, "Postal code is required").max(20),
});

type OrgValues = z.infer<typeof orgSchema>;

const DEFAULT_VALUES: OrgValues = {
  name: currentOrg.name,
  line1: orgAddress.line1,
  line2: orgAddress.line2,
  country: orgAddress.country,
  state: orgAddress.state,
  city: orgAddress.city,
  postalCode: orgAddress.postalCode,
};

export function OrganizationAdminView() {
  const form = useForm<OrgValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, isValid, errors },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    reset(values);
  });

  return (
    <>
      <Panel title="Details">
        <form onSubmit={onSubmit} noValidate>
          <FieldRow>
            <Field label="Organization name" error={errors.name?.message}>
              <Input
                aria-invalid={errors.name ? true : undefined}
                {...register("name")}
              />
            </Field>
            <Field label="Members">
              <Input defaultValue={String(currentOrg.members)} disabled />
            </Field>
          </FieldRow>

          <FieldRow cols={1} className="mt-4">
            <Field label="Primary business address" error={errors.line1?.message}>
              <Input
                aria-invalid={errors.line1 ? true : undefined}
                {...register("line1")}
              />
            </Field>
          </FieldRow>

          <FieldRow cols={1} className="mt-4">
            <Field label="Address line 2" error={errors.line2?.message}>
              <Input
                aria-invalid={errors.line2 ? true : undefined}
                {...register("line2")}
              />
            </Field>
          </FieldRow>

          <FieldRow cols={2} className="mt-4">
            <Field label="Country" error={errors.country?.message}>
              <Input
                aria-invalid={errors.country ? true : undefined}
                {...register("country")}
              />
            </Field>
            <Field label="State / province" error={errors.state?.message}>
              <Input
                aria-invalid={errors.state ? true : undefined}
                {...register("state")}
              />
            </Field>
          </FieldRow>

          <FieldRow cols={2} className="mt-4">
            <Field label="City" error={errors.city?.message}>
              <Input
                aria-invalid={errors.city ? true : undefined}
                {...register("city")}
              />
            </Field>
            <Field label="Postal code" error={errors.postalCode?.message}>
              <Input
                aria-invalid={errors.postalCode ? true : undefined}
                {...register("postalCode")}
              />
            </Field>
          </FieldRow>

          <div className="mt-4 flex items-center gap-2 font-mono text-caption text-meta-foreground">
            <span>Organization ID: {currentOrg.id}</span>
            <CopyButton value={currentOrg.id} ariaLabel="Copy organization ID" />
          </div>

          <DirtyActionBar
            isDirty={isDirty}
            onCancel={() => reset()}
            onSave={onSubmit}
            saving={isSubmitting}
            disableSave={!isValid}
          />
        </form>
      </Panel>

      <Card className="mb-4 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-body font-semibold text-foreground">
              Allow new API keys in default workspace
            </h3>
            <p className="mt-1 text-caption text-muted-foreground">
              Lets members mint keys in the default workspace. Disabling won&rsquo;t affect existing keys.
            </p>
          </div>
          <Switch defaultChecked aria-label="Allow new API keys in default workspace" />
        </div>
      </Card>
    </>
  );
}
