import { CopyButton } from "@repo/ui/components/copy-button";
import { Input } from "@repo/ui/components/input";
import { Field, FieldRow } from "@/app/(manage)/_components/page-primitives";
import { currentOrg, orgAddress } from "@/lib/mock";

/**
 * Read-only Organization details — used by the user-tier view.
 * Admin view inlines its own controlled fields to own dirty-state locally.
 */
export function OrganizationFields() {
  return (
    <>
      <FieldRow>
        <Field label="Organization name">
          <Input defaultValue={currentOrg.name} disabled />
        </Field>
        <Field label="Members">
          <Input defaultValue={String(currentOrg.members)} disabled />
        </Field>
      </FieldRow>

      <FieldRow cols={1} className="mt-4">
        <Field label="Primary business address">
          <Input defaultValue={orgAddress.line1} disabled />
        </Field>
      </FieldRow>

      <FieldRow cols={1} className="mt-4">
        <Field label="Address line 2">
          <Input defaultValue={orgAddress.line2} disabled />
        </Field>
      </FieldRow>

      <FieldRow cols={2} className="mt-4">
        <Field label="Country">
          <Input defaultValue={orgAddress.country} disabled />
        </Field>
        <Field label="State / province">
          <Input defaultValue={orgAddress.state} disabled />
        </Field>
      </FieldRow>

      <FieldRow cols={2} className="mt-4">
        <Field label="City">
          <Input defaultValue={orgAddress.city} disabled />
        </Field>
        <Field label="Postal code">
          <Input defaultValue={orgAddress.postalCode} disabled />
        </Field>
      </FieldRow>

      <div className="mt-4 flex items-center gap-2 font-mono text-caption text-meta-foreground">
        <span>Organization ID: {currentOrg.id}</span>
        <CopyButton value={currentOrg.id} ariaLabel="Copy organization ID" />
      </div>
    </>
  );
}
