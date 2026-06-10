// shadcn-source: radix-wrap:Label (n/a, 2026-05-26)
import * as React from "react"

import { CircleAlert } from "lucide-react"
import { cn } from "@repo/ui/lib/cn"
import { Label } from "./label"

// ─── FieldLabel ──────────────────────────────────────────────────────────────

interface FieldLabelProps extends React.ComponentProps<typeof Label> {
  /** Marks field as required — renders an asterisk after the label text. */
  required?: boolean
}

function FieldLabel({ children, required, className, ...props }: FieldLabelProps) {
  return (
    <Label className={cn("gap-0.5", className)} {...props}>
      {children}
      {required && (
        <span aria-hidden="true" className="text-state-errored ml-0.5">
          *
        </span>
      )}
    </Label>
  )
}

// ─── FieldHelper ─────────────────────────────────────────────────────────────

function FieldHelper({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-helper"
      className={cn(
        // text-caption = 12px, font-normal = 400, --muted-foreground
        "text-caption font-normal font-sans text-muted-foreground mt-1.5",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

// ─── FieldError ──────────────────────────────────────────────────────────────

function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      role="alert"
      data-slot="field-error"
      className={cn(
        // text-caption = 12px, font-medium = 500, --state-errored-text
        "text-caption font-medium font-sans text-state-errored-text mt-1.5 flex items-center gap-1",
        className
      )}
      {...props}
    >
      {/* Error icon — 12px per spec (--icon-size-sm) */}
      <CircleAlert aria-hidden="true" className="h-3 w-3 shrink-0 text-state-errored" />
      {children}
    </p>
  )
}

// ─── FormField ───────────────────────────────────────────────────────────────

interface FormFieldProps {
  /** Associates label + error with the control. Must match the control's id. */
  id: string
  /** Label text. Omit to skip label rendering. */
  label?: React.ReactNode
  /** Helper text shown below the control. Hidden when `error` is set. */
  helper?: React.ReactNode
  /** Error message. When present, replaces helper and sets aria-invalid on the control. */
  error?: React.ReactNode
  /** Marks field as required. Renders an asterisk after the label. */
  required?: boolean
  /** The form control (Input, Textarea, Select, etc.) */
  children: React.ReactNode
  className?: string
}

/**
 * FormField composes Label + control + helper/error into the canonical
 * label → control → helper|error anatomy with gap-1.5 spacing per spec.
 *
 * Error replaces helper in the same slot (error is corrective; helper advisory).
 * aria-describedby is wired automatically.
 */
function FormField({
  id,
  label,
  helper,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  const helperId = helper ? `${id}-helper` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = errorId ?? helperId

  return (
    <div data-slot="form-field" className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <FieldLabel htmlFor={id} required={required}>
          {label}
        </FieldLabel>
      )}

      {/* Clone child to inject aria-describedby and aria-invalid */}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            id,
            "aria-describedby": describedBy,
            "aria-invalid": error ? (true as boolean) : undefined,
            "aria-required": required ? true : undefined,
          } as React.HTMLAttributes<HTMLElement>)
        : children}

      {/* Error takes precedence — replaces helper in same slot */}
      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : helper ? (
        <FieldHelper id={helperId}>{helper}</FieldHelper>
      ) : null}
    </div>
  )
}

export type { FormFieldProps, FieldLabelProps }
export { FormField, FieldLabel, FieldHelper, FieldError }
