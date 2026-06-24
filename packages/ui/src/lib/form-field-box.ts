import { cva, type VariantProps } from "class-variance-authority"

// Shared visual chrome for form-field triggers: Input, Select, MultiSelect.
// Owns box (bg, border, radius, sizing), disabled, transition, aria-invalid.
// Does NOT own value/placeholder text color — primitives apply those at their value/placeholder slots
// because the data-attribute hook differs per primitive (data-[placeholder] for Select, etc.).
export const formFieldBoxVariants = cva(
  [
    "bg-transparent border border-form-field-border",
    "transition-[color,background-color,border-color,box-shadow,outline]",
    "duration-fast ease-out-standard",
    "disabled:cursor-not-allowed disabled:bg-muted-surface disabled:border-form-field-border disabled:text-muted-foreground",
    "aria-invalid:border-state-errored",
  ],
  {
    variants: {
      size: {
        md: "h-8 px-2.5 rounded-lg text-body",
        sm: "h-7 px-2 rounded-md text-label",
      },
    },
    defaultVariants: { size: "md" },
  }
)

export type FormFieldBoxVariants = VariantProps<typeof formFieldBoxVariants>
