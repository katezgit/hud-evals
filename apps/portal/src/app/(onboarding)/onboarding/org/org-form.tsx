"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";

const SLUG_PATTERN = /^[a-z0-9-]{2,}$/;

function deriveSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface OrgFormProps {
  defaultName: string;
}

export function OrgForm({ defaultName }: OrgFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(deriveSlug(defaultName));
  // Once the user edits slug directly, decouple it from name.
  const slugDirtyRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoName, setLogoName] = useState<string | null>(null);

  const nameValid = name.trim().length > 0;
  const slugValid = SLUG_PATTERN.test(slug);
  const canSubmit = nameValid && slugValid;

  function handleNameChange(value: string) {
    setName(value);
    if (!slugDirtyRef.current) {
      setSlug(deriveSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    slugDirtyRef.current = true;
    setSlug(value);
  }

  function handleLogoPick() {
    fileInputRef.current?.click();
  }

  function handleLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setLogoName(file ? file.name : null);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    // Flag stays null — wizard not complete yet.
    router.push("/onboarding/invite");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-label font-medium text-foreground">
          Logo (optional)
        </span>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleLogoPick}
          >
            {logoName ?? "Upload logo"}
          </Button>
          <span className="text-meta text-muted-foreground">
            Optional — add later in Settings
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleLogoSelected}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      <FormField id="org-name" label="Organization name" required>
        <Input
          name="name"
          type="text"
          autoComplete="organization"
          placeholder="Acme Robotics"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </FormField>

      <FormField
        id="org-slug"
        label="URL slug"
        required
        helper="Letters, numbers, and hyphens. Min 2 characters."
      >
        <Input
          name="slug"
          type="text"
          autoComplete="off"
          required
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          leading={
            <span className="font-mono text-meta text-muted-foreground">
              hud.ai/
            </span>
          }
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={!canSubmit}
      >
        Create organization
      </Button>
    </form>
  );
}
