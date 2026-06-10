// shadcn-source: https://ui.shadcn.com/docs/components/drawer (cli, 2026-05-26)
"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cva, type VariantProps } from "class-variance-authority"
import * as FocusScopePrimitive from "@radix-ui/react-focus-scope"

import { cn } from "@repo/ui/lib/cn"
import { useScrolled } from "@repo/ui/lib/use-scrolled"

const DrawerScrollTopContext = React.createContext<boolean>(false)
const DrawerScrollBottomContext = React.createContext<boolean>(false)

const DrawerBodyRefContext = React.createContext<((el: HTMLDivElement | null) => void) | null>(null)

function Drawer({
  direction = "right",
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      direction={direction}
      {...props}
    />
  )
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-overlay bg-overlay-drawer backdrop-blur-overlay-drawer",
        // Enter — 200ms natural ease (work surface, non-zero initial velocity)
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=open]:duration-[200ms] data-[state=open]:ease-natural",
        // Exit — 120ms accelerated (same as --motion-drawer-exit)
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        "data-[state=closed]:duration-fast data-[state=closed]:ease-in-accelerated",
        className
      )}
      {...props}
    />
  )
}

const drawerContentVariants = cva(
  [
    // Structural base
    "fixed z-overlay flex flex-col",
    // Panel surface
    "bg-popover",
    "shadow-drawer",
    // vaul controls panel transform via inline transition; our duration/easing overrides land via inline style on DrawerPrimitive.Content (longhands beat vaul's shorthand)
    "data-[state=open]:animate-in data-[state=open]:fade-in-0",
    "data-[state=open]:ease-natural",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
    "data-[state=closed]:duration-fast data-[state=closed]:ease-in-accelerated",
  ],
  {
    variants: {
      // Size variants are empty strings because the lookup maps (SIDE_WIDTH_CLASSES /
      // EDGE_HEIGHT_CLASSES / ENTER_DURATION_CLASSES) apply the actual classes outside
      // CVA. Template literals like `data-[...]:${variable}` are invisible to Tailwind's
      // scanner.
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

type DrawerSize = "sm" | "md" | "lg"

interface DrawerContentProps
  extends React.ComponentProps<typeof DrawerPrimitive.Content>,
    VariantProps<typeof drawerContentVariants> {
  /**
   * Ref to the element that should receive focus when the drawer opens.
   * When omitted, FocusScope focuses the first focusable child automatically.
   */
  initialFocus?: React.RefObject<HTMLElement | null>
}

// Static size-class maps — all strings must be complete literals so Tailwind's
// scanner includes them in the generated CSS. Template literals like
// `data-[...]:${variable}` are invisible to the scanner and produce no styles.
const SIDE_WIDTH_CLASSES: Record<DrawerSize, string> = {
  sm: "data-[vaul-drawer-direction=right]:w-80 data-[vaul-drawer-direction=left]:w-80",
  md: "data-[vaul-drawer-direction=right]:w-120 data-[vaul-drawer-direction=left]:w-120",
  lg: "data-[vaul-drawer-direction=right]:w-180 data-[vaul-drawer-direction=left]:w-180",
}

const EDGE_HEIGHT_CLASSES: Record<DrawerSize, string> = {
  sm: "data-[vaul-drawer-direction=top]:max-h-[40vh] data-[vaul-drawer-direction=bottom]:max-h-[40vh]",
  md: "data-[vaul-drawer-direction=top]:max-h-[56vh] data-[vaul-drawer-direction=bottom]:max-h-[56vh]",
  lg: "data-[vaul-drawer-direction=top]:max-h-[72vh] data-[vaul-drawer-direction=bottom]:max-h-[72vh]",
}

// Enter duration scales with panel travel distance — a 320px sm panel at the same
// duration as a 720px lg panel reads as slow because the panel finishes its translation
// well before the duration expires. Smallest size stays at/above the 140ms perception
// floor for spatial motion; largest stays at the 220ms ceiling.
const ENTER_DURATION_CLASSES: Record<DrawerSize, string> = {
  sm: "data-[state=open]:duration-[140ms]",
  md: "data-[state=open]:duration-[180ms]",
  lg: "data-[state=open]:duration-[180ms]",
}

const DRAWER_BODY_STYLE: React.CSSProperties = { scrollbarGutter: "stable both-edges" }

// Individual longhands beat vaul's shorthand — prevents vaul from overriding our duration/timing-function with its defaults.
const DRAWER_TRANSITION_STYLES: Record<DrawerSize, React.CSSProperties> = {
  sm: { transitionProperty: "transform", transitionDuration: "140ms", transitionTimingFunction: "var(--ease-natural)" },
  md: { transitionProperty: "transform", transitionDuration: "180ms", transitionTimingFunction: "var(--ease-natural)" },
  lg: { transitionProperty: "transform", transitionDuration: "180ms", transitionTimingFunction: "var(--ease-natural)" },
}

// Marks all direct children of <body> as inert + aria-hidden while the drawer
// is open, skipping the vaul portal container that holds the drawer itself.
function applyBodyInert(portalEl: Element | null): () => void {
  const siblings = Array.from(document.body.children)
  const affected: Array<{ el: Element; prevInert: string | null; prevHidden: string | null }> = []

  for (const el of siblings) {
    // Skip the portal container that holds the drawer
    if (portalEl && el.contains(portalEl)) continue
    // Preserve prior inert / aria-hidden so peer overlays (dialog, popover) keep their own state when we clean up — we capture prevInert/prevHidden here and restore them on close.
    const prevInert = el.getAttribute("inert")
    const prevHidden = el.getAttribute("aria-hidden")
    el.setAttribute("inert", "")
    el.setAttribute("aria-hidden", "true")
    affected.push({ el, prevInert, prevHidden })
  }

  return () => {
    for (const { el, prevInert, prevHidden } of affected) {
      if (prevInert === null) {
        el.removeAttribute("inert")
      } else {
        el.setAttribute("inert", prevInert)
      }
      if (prevHidden === null) {
        el.removeAttribute("aria-hidden")
      } else {
        el.setAttribute("aria-hidden", prevHidden)
      }
    }
  }
}

function DrawerContent({
  className,
  children,
  size = "md",
  initialFocus,
  ...props
}: DrawerContentProps) {
  const resolvedSize: DrawerSize = (size ?? "md") as DrawerSize
  // useState (not useRef): vaul Portal defers mount to a 2nd render. Only a
  // state update re-fires useScrolled's [el] effect so the scroll listener
  // actually attaches when DrawerBody appears; mutating a ref would not.
  const [bodyEl, setBodyEl] = React.useState<HTMLDivElement | null>(null)
  const { top, bottom } = useScrolled(bodyEl)
  const bodyCallbackRef = React.useCallback((el: HTMLDivElement | null) => {
    setBodyEl(el)
  }, [])

  // Same deferred-mount reason — useState lets the [contentEl] effect below re-fire on mount.
  const [contentEl, setContentEl] = React.useState<HTMLDivElement | null>(null)
  const contentCallbackRef = React.useCallback((el: HTMLDivElement | null) => {
    setContentEl(el)
  }, [])

  React.useEffect(() => {
    if (!contentEl) return

    let cleanup: (() => void) | null = null

    const syncInert = () => {
      const isOpen = contentEl.getAttribute("data-state") === "open"
      if (isOpen && cleanup === null) {
        let portalRoot: Element | null = contentEl
        while (portalRoot && portalRoot.parentElement !== document.body) {
          portalRoot = portalRoot.parentElement
        }
        cleanup = applyBodyInert(portalRoot)
      } else if (!isOpen && cleanup !== null) {
        cleanup()
        cleanup = null
      }
    }

    const observer = new MutationObserver(syncInert)
    observer.observe(contentEl, { attributes: true, attributeFilter: ["data-state"] })
    syncInert()

    return () => {
      observer.disconnect()
      cleanup?.()
      cleanup = null
    }
  }, [contentEl])

  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={contentCallbackRef}
        data-slot="drawer-content"
        data-size={resolvedSize}
        // disable drag moving effect
        data-vaul-no-drag
        // aria-modal tells screen readers this is a modal dialog — background
        // content is inert for keyboard and AT purposes.
        aria-modal="true"
        style={props.style ? { ...DRAWER_TRANSITION_STYLES[resolvedSize], ...props.style } : DRAWER_TRANSITION_STYLES[resolvedSize]}
        className={cn(
          drawerContentVariants({ size: resolvedSize }),
          // Size classes — static strings so Tailwind's scanner picks them up
          SIDE_WIDTH_CLASSES[resolvedSize],
          EDGE_HEIGHT_CLASSES[resolvedSize],
          ENTER_DURATION_CLASSES[resolvedSize],
          // Right drawer: shadow-(--shadow-drawer-edge) is an inset box-shadow instead of
          // border-l so the 1px separator does not consume box space, keeping px-6 visually
          // symmetric on both panel edges.
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0",
          "data-[vaul-drawer-direction=right]:shadow-drawer-edge",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0",
          "data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:border-border",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0",
          "data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=top]:border-border",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0",
          "data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=bottom]:border-border",
          // Zero radius unconditionally — drawer is an edge-anchored sheet
          "rounded-none",
          className
        )}
        {...props}
      >
        {/* onMountAutoFocus honours the optional initialFocus ref — without this
            override FocusScope would ignore it and focus the first focusable child. */}
        {/* asChild + explicit <div> with flex-col: FocusScope renders a default <div> with display:block, breaking the drawer's flex chain and causing DrawerBody to not scroll. */}
        <FocusScopePrimitive.FocusScope
          asChild
          trapped
          loop
          onMountAutoFocus={(event) => {
            if (initialFocus?.current) {
              event.preventDefault()
              initialFocus.current.focus()
            }
          }}
        >
          <div className="flex flex-1 flex-col min-h-0">
            <DrawerScrollTopContext.Provider value={top}>
              <DrawerScrollBottomContext.Provider value={bottom}>
                <DrawerBodyRefContext.Provider value={bodyCallbackRef}>
                  {children}
                </DrawerBodyRefContext.Provider>
              </DrawerScrollBottomContext.Provider>
            </DrawerScrollTopContext.Provider>
          </div>
        </FocusScopePrimitive.FocusScope>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  const scrolled = React.useContext(DrawerScrollTopContext)

  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "relative z-sticky",
        "flex items-start justify-between pt-6 pb-3 px-6",
        // Always render border-b for stable box model (no 1px layout shift on state change).
        "border-b",
        scrolled ? "border-border" : "border-transparent",
        scrolled ? "shadow-scroll-cue" : "shadow-none",
        // Crossfade border-color and box-shadow at --motion-state-change (120ms ease-out).
        "transition-[border-color,box-shadow] prop-(--motion-state-change)",
        "shrink-0",
        className
      )}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "text-[length:var(--text-subtitle)] font-semibold text-foreground leading-none", // eslint-disable-line no-restricted-syntax -- [length:var(--x)] is the permitted rank-3 font-size pattern; avoids twMerge text-color conflict
        className
      )}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn(
        "text-[length:var(--text-caption)] text-muted-foreground mt-1", // eslint-disable-line no-restricted-syntax -- [length:var(--x)] is the permitted rank-3 font-size pattern; avoids twMerge text-color conflict
        className
      )}
      {...props}
    />
  )
}

const DrawerCloseButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof DrawerPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Close
    ref={ref}
    data-slot="drawer-close-button"
    className={cn(
      "ml-auto inline-flex shrink-0 items-center justify-center",
      "size-7 rounded-md",
      "text-muted-foreground",
      "transition-colors prop-(--motion-state-change)",
      "hover:bg-hover",
      "disabled:pointer-events-none",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  >
    <XIcon />
    <span className="sr-only">Close</span>
  </DrawerPrimitive.Close>
))
DrawerCloseButton.displayName = "DrawerCloseButton"

function DrawerBody({ className, children, ...props }: React.ComponentProps<"div">) {
  const bodyCallbackRef = React.useContext(DrawerBodyRefContext)

  return (
    <div
      data-slot="drawer-body"
      className={cn(
        "flex flex-1 flex-col min-h-0",
        "text-[length:var(--text-body)] text-foreground", // eslint-disable-line no-restricted-syntax -- [length:var(--x)] is the permitted rank-3 font-size pattern; avoids twMerge text-color conflict
      )}
    >
      {/* tabIndex={-1} + focus-visible:outline-none suppress Chromium's
          keyboard-focusable-scroll-container focus ring on a passive region.
          scrollbarGutter: stable both-edges reserves gutter symmetrically so
          content never reflows when the scrollbar appears. */}
      <div
        ref={bodyCallbackRef}
        tabIndex={-1}
        style={DRAWER_BODY_STYLE}
        className={cn(
          "overflow-y-auto flex-1 min-h-0",
          "px-6 pt-2 pb-4",
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

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  const scrolledBottom = React.useContext(DrawerScrollBottomContext)

  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        // pt-2 vs dialog's pt-3 — drawer is a work surface, not an interruption overlay.
        "flex items-center justify-end gap-2 pt-2 pb-4 px-6",
        "shrink-0",
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

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  drawerContentVariants,
}
