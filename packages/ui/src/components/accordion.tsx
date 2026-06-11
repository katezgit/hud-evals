// shadcn-source: https://ui.shadcn.com/docs/components/accordion (cli, 2026-05-26)
import * as React from "react"
import { ChevronDownIcon, CircleCheckIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

export type StepState = "default" | "active" | "completed" | "locked"


const stepIconVariants = cva(
  "flex size-8 shrink-0 items-center justify-center rounded-full",
  {
    variants: {
      stepState: {
        default:   "border border-border bg-muted-surface",
        active:    "bg-foreground",
        completed: "bg-state-scored-subtle",
        locked:    "border border-border bg-muted-surface",
      },
    },
    defaultVariants: {
      stepState: "default",
    },
  }
)

const stepIconGlyphVariants = cva("size-4", {
  variants: {
    stepState: {
      default:   "text-muted-foreground",
      active:    "text-background",
      completed: "text-state-scored",
      locked:    "text-text-disabled",
    },
  },
  defaultVariants: {
    stepState: "default",
  },
})

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}


interface AccordionItemProps
  extends React.ComponentProps<typeof AccordionPrimitive.Item> {
  /**
   * Stepper step state. When provided, sets `data-step-state` on the item and
   * drives step-icon styling. Omit for the Default (standalone) variant.
   * `locked` also sets the Radix `disabled` prop automatically.
   */
  stepState?: StepState
}

function AccordionItem({
  className,
  stepState,
  disabled,
  ...props
}: AccordionItemProps) {
  const isLocked = stepState === "locked"
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      data-step-state={stepState}
      disabled={isLocked || disabled}
      className={cn("border-b border-border last:border-b-0", className)}
      {...props}
    />
  )
}


interface AccordionTriggerProps
  extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {
  /**
   * Step icon node (Stepper variant). Pass a `lucide-react` icon component
   * element — the trigger wraps it in the 32×32 circular container sized per
   * spec. Use `AccordionStepIcon` for correct styling.
   */
  icon?: React.ReactNode
  /** Secondary line under the title (Stepper variant). */
  subtitle?: string
  /** Optional badge slot (e.g. Badge with "Complete"). Rendered after subtitle, before chevron. */
  badge?: React.ReactNode
}

function AccordionTrigger({
  className,
  children,
  icon,
  subtitle,
  badge,
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          // Layout: compact per Instrument Precision v1 spec (py-3 px-1)
          "group flex w-full flex-1 items-center justify-between gap-3 py-3 px-1",
          // Typography
          "text-body font-sans font-medium text-foreground",
          // Hover: text-only color shift (no bg fill)
          "hover:text-foreground/70",
          "transition-colors duration-instant ease-out-standard",
          "data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground",
          // Focus ring — *:focus-visible in base.css (WCAG 2.2 SC 2.4.11). outline-none removed; base layer owns it.
          className
        )}
        {...props}
      >
        {/* Step-icon slot — present only when icon prop is passed (Stepper variant) */}
        {icon}

        <span className="flex flex-1 flex-col items-start gap-0.5">
          <span className="leading-snug">
            {children}
          </span>
          {subtitle && (
            <span
              className={cn(
                "text-caption font-normal",
                "text-muted-foreground",
                "group-data-[disabled]:text-text-disabled"
              )}
            >
              {subtitle}
            </span>
          )}
        </span>

        {badge}

        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0",
            "text-muted-foreground",
            "group-data-[disabled]:text-text-disabled",
            "transition-transform duration-subtle ease-out-standard",
            "group-data-[state=open]:rotate-180",
          )}
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}


interface AccordionStepIconProps {
  /** Forwarded from the parent AccordionItem's stepState. */
  stepState?: StepState
  /**
   * Icon node to render inside the circular container. Ignored when
   * `stepState="completed"` — the circle-check icon is rendered instead.
   */
  icon?: React.ReactNode
}

function AccordionStepIcon({ stepState = "default", icon }: AccordionStepIconProps) {
  return (
    <span
      data-slot="accordion-step-icon"
      className={stepIconVariants({ stepState })}
      aria-hidden="true"
    >
      {stepState === "completed" ? (
        <CircleCheckIcon className={stepIconGlyphVariants({ stepState })} />
      ) : (
        <span className={stepIconGlyphVariants({ stepState })}>
          {icon}
        </span>
      )}
    </span>
  )
}


interface AccordionContentProps
  extends React.ComponentProps<typeof AccordionPrimitive.Content> {
  /**
   * Set to `true` when inside a Stepper accordion item. Adds the 60px
   * left-inset (step-icon 32px + gap 12px + padding-x 16px) to align body
   * text under the title start.
   */
  stepper?: boolean
}

function AccordionContent({
  className,
  children,
  stepper,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      // grid-template-rows: 0fr→1fr animation approach (GPU-friendly, no JS measurement).
      // Enter: duration-base (220ms) ease-out-emphasized (--motion-enter)
      // Exit:  duration-fast (120ms) ease-in-accelerated (--motion-exit)
      // data-[state=closed] applies exit timing; data-[state=open] applies enter timing.
      // Opacity crossfade is also on this element (it carries data-state from Radix).
      className={cn(
        "overflow-hidden",
        // Height animation via grid-template-rows
        "grid transition-[grid-template-rows,opacity]",
        "data-[state=open]:duration-base data-[state=open]:ease-out-emphasized data-[state=open]:opacity-100",
        "data-[state=closed]:duration-fast data-[state=closed]:ease-in-accelerated data-[state=closed]:opacity-0",
        "data-[state=open]:grid-rows-[1fr] data-[state=closed]:grid-rows-[0fr]",
      )}
      {...props}
    >
      {/* Inner wrapper: min-h-0 allows grid row to collapse to 0 */}
      <div
        className={cn(
          "min-h-0",
          // padding: Instrument Precision v1 — pb-3 px-1
          "px-1 pb-3",
          // Stepper left inset: 44px = icon(32) + gap(12) — offset relative to px-1
          stepper && "pl-[44px]",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionStepIcon,
  AccordionContent,
}
export type { AccordionItemProps, AccordionTriggerProps, AccordionContentProps, AccordionStepIconProps }
