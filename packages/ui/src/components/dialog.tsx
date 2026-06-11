// shadcn-source: https://ui.shadcn.com/docs/components/dialog (cli, 2026-05-26)
"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"
import { useScrolled } from "@repo/ui/lib/use-scrolled"
import { Button } from "@repo/ui/components/button"

const DialogScrollTopContext = React.createContext<boolean>(false)
const DialogScrollBottomContext = React.createContext<boolean>(false)

// Callback ref (not MutableRefObject): Radix Portal defers mount to a 2nd render, so a stable ref object would fire useEffect once with null and never re-fire.
const DialogBodyRefContext = React.createContext<((el: HTMLDivElement | null) => void) | null>(null)

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-overlay",
        "bg-overlay-dialog",
        "supports-[backdrop-filter]:backdrop-blur-overlay-dialog",
        "data-[state=open]:animate-fade-in",
        "data-[state=closed]:animate-fade-out",
        className
      )}
      {...props}
    />
  )
}

const dialogContentVariants = cva(
  [
    "fixed top-[10vh] left-1/2 z-overlay -translate-x-1/2",
    "flex flex-col w-full",
    "max-h-[80vh]",
    "bg-popover",
    // No border: drop shadow alone defines the panel edge. Adding a 1px border on top of the shadow creates a sharp hairline next to a soft halo — perceived as a "double edge."
    "shadow-modal",
    "rounded-lg",
    // outline-none: focus managed by Radix; panel itself is not a focus target
    "outline-none",
    "data-[state=open]:animate-slide-up-in",
    "data-[state=closed]:animate-slide-down-out",
  ],
  {
    variants: {
      size: {
        sm: "w-[400px]",
        md: "w-[560px]",
        lg: "w-[720px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  /** Show or hide the × close button in the header area. Default: true. */
  showCloseButton?: boolean
}

/**
 * Top-anchored modal panel (~10vh from viewport top). Spreads through Radix Dialog.Content props.
 *
 * @example Disable overlay click-to-close (keep Escape working):
 * <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
 *   ...
 * </DialogContent>
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  size,
  ...props
}: DialogContentProps) {
  // useState (not useRef): Radix Portal defers mount to a 2nd render. Only a
  // state update re-fires useScrolled's [el] effect so the scroll listener
  // actually attaches when DialogBody appears; mutating a ref would not.
  const [bodyEl, setBodyEl] = React.useState<HTMLDivElement | null>(null)
  const { top, bottom } = useScrolled(bodyEl)

  const bodyCallbackRef = React.useCallback((el: HTMLDivElement | null) => {
    setBodyEl(el)
  }, [])

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(dialogContentVariants({ size }), className)}
        {...props}
      >
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close-button"
            className={cn(
              // top-[18px]: structural compensation — aligns button optical center with DialogTitle optical center
              // Inter cap-height ≈ 0.73em; at text-subtitle 16px → cap = 11.68px, optical center = 5.84px above cap top
              // DialogHeader pt-6 (24px) + 5.84 = 29.84px; button size-6 center = top + 12px → top = 17.84px ≈ 18px
              "absolute top-[18px] right-4",
              "size-6",
              "inline-flex items-center justify-center shrink-0",
              "bg-transparent hover:bg-hover-surface",
              "text-muted-foreground",
              "rounded-md",
              "transition-colors prop-(--motion-state-change)",
              // Focus ring — *:focus-visible in base.css (WCAG 2.4.11). outline-none removed; base layer owns it.
              "disabled:pointer-events-none",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            )}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        <DialogScrollTopContext.Provider value={top}>
          <DialogScrollBottomContext.Provider value={bottom}>
            <DialogBodyRefContext.Provider value={bodyCallbackRef}>
              {children}
            </DialogBodyRefContext.Provider>
          </DialogScrollBottomContext.Provider>
        </DialogScrollTopContext.Provider>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  const scrolled = React.useContext(DialogScrollTopContext)

  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "relative z-sticky",
        "flex flex-col gap-1",
        // px-6: symmetric horizontal inset matching body inner — visual right edges of header, body content, and footer all sit at panel_right − 24px.
        "pt-6 pb-3 px-6",
        // Always render border-b so box model is stable (no 1px layout shift on state change).
        "border-b",
        scrolled ? "border-border" : "border-transparent",
        scrolled ? "shadow-scroll-cue" : "shadow-none",
        "transition-[border-color,box-shadow] prop-(--motion-state-change)",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-[length:var(--text-subtitle)] font-semibold text-foreground leading-none", // eslint-disable-line no-restricted-syntax -- [length:var(--x)] is the permitted rank-3 font-size pattern; avoids twMerge text-color conflict
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-body",
        "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

const DIALOG_BODY_STYLE: React.CSSProperties = { scrollbarGutter: "stable both-edges" }

function DialogBody({ className, children, ...props }: React.ComponentProps<"div">) {
  const bodyCallbackRef = React.useContext(DialogBodyRefContext)

  return (
    <div
      data-slot="dialog-body"
      className="flex flex-1 flex-col min-h-0 text-foreground"
    >
      {/* scrollbar-gutter: stable both-edges reserves equal space on both sides so content never
          reflows and left/right insets stay symmetric.
          px-6: matches dialog header/footer pl-6, giving inputs symmetric horizontal inset AND
          providing left-edge clearance for the focus ring box-shadow within the overflow:auto clip box.
          tabIndex={-1}: Chromium's keyboard-focusable-scroll-containers would otherwise land focus
          here, triggering the global focus-visible ring on a passive region. */}
      <div
        ref={bodyCallbackRef}
        tabIndex={-1}
        style={DIALOG_BODY_STYLE}
        className={cn(
          "overflow-y-auto flex-1 min-h-0",
          "px-6 pt-2 pb-4",
          // Defense-in-depth: suppress any browser-variant focus ring on this node.
          "focus-visible:outline-none focus-visible:shadow-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  const scrolledBottom = React.useContext(DialogScrollBottomContext)

  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-row items-center justify-end",
        "gap-2",
        // px-6: symmetric horizontal inset matching body inner — visual right edges of header, body content, and footer all sit at panel_right − 24px.
        "pt-3 pb-4 px-6",
        // Always render border-t so box model is stable (no 1px layout shift on state change).
        "border-t",
        scrolledBottom ? "border-border" : "border-transparent",
        scrolledBottom ? "shadow-scroll-cue-inverted" : "shadow-none",
        "transition-[border-color,box-shadow] prop-(--motion-state-change)",
        className
      )}
      {...props}
    />
  )
}

function DialogCancelButton({
  children = "Cancel",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <DialogPrimitive.Close asChild>
      <Button variant="secondary" {...props}>
        {children}
      </Button>
    </DialogPrimitive.Close>
  )
}

function DialogConfirmButton({
  children = "Confirm",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="primary" {...props}>
      {children}
    </Button>
  )
}

function DialogDestructiveButton({
  children = "Delete",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="destructive" {...props}>
      {children}
    </Button>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogCancelButton,
  DialogConfirmButton,
  DialogDestructiveButton,
  dialogContentVariants,
}
