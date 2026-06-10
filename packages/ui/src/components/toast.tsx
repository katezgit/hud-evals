"use client"

// shadcn-source: https://ui.shadcn.com/docs/components/sonner (cli, 2026-05-26)
import {
  CircleCheckIcon,
  InfoIcon,
  LoaderIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      closeButton
      // Why: swipe-to-dismiss is misleading — close-X is the intended path.
      swipeDirections={[]}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <LoaderIcon className="size-4 animate-spin text-muted-foreground" />,
      }}
      toastOptions={{
        // With richColors, [data-description] inherits the variant text color.
        // Override to muted-foreground to match Alert's description tone hierarchy.
        // Sonner's richColors rule wins at [0,4,0]; ! is required to beat it.
        classNames: {
          // Restructure toast root to a 2-col grid so the action button can stack
          // below the content column (instead of competing with the close-X on the
          // right edge). Close-X stays absolutely positioned and out of grid flow.
          // !shadow-popover overrides Sonner's hardcoded rgba(0,0,0,.1) box-shadow
          // with the HUD floating-element shadow tier (shadow-2 alias).
          toast: "!grid !grid-cols-[auto_1fr] !gap-x-1.5 !gap-y-2 !items-start !shadow-popover",
          // With bg-panel, title stays neutral regardless of variant.
          // Sonner's richColors rule sets color on the toast root (inherits to title);
          // ! is required to beat [data-rich-colors][data-type] specificity.
          title: "!text-foreground",
          description: "!text-muted-foreground",
          // Top-align icon with title's first line. Sonner's [data-icon] default is
          // align-self:auto inside a flex-row with align-items:center, which centers
          // the icon against the full title+description block. `!self-start` beats
          // sonner's [0,1,1] specificity; `!mt-0.5` (2 px) offsets to cap-height.
          icon: "!self-start !mt-0.5",
          // Override sonner's default 2px gap between title and description to 4px
          // (matches Alert's gap-y-1 micro-stack). ! required — sonner's [data-content]
          // rule wins at higher specificity without it.
          content: "!gap-1",
          // Action button: row 2 col 2 (below content), right-aligned per enterprise
          // convention (Atlassian, Carbon, MUI, Linear, Vercel). Close-X stays top-right
          // corner chrome; action stays right-edge row-2 — vertical separation keeps
          // them in distinct visual zones (corner vs. row CTA).
          actionButton: "!col-start-2 !row-start-2 !justify-self-end",
          closeButton: [
            "!cursor-pointer",
            "!top-4 !right-2 !left-auto !bottom-auto !transform-none",
            "!bg-transparent !border-0 !rounded-none",
            "!text-foreground",
          ].join(" "),
        },
      }}
      style={
        {
          // Constrain sonner's default z-index:999999999 to the HUD tier system.
          // --z-toast is a @theme token (value: 60) — always above modals (50).
          zIndex: "var(--z-toast)",
          // default / neutral — reference --color-panel directly rather than
          // --color-popover because @theme aliases resolve once at :root and do
          // not cascade with [data-theme="dark"] overrides at runtime.
          "--normal-bg":      "var(--color-panel)",
          "--normal-text":    "var(--color-foreground)",
          "--normal-border":  "var(--color-border)",
          // Matches Alert's rounded-lg (--radius-lg = 8px). --radius is not a defined token.
          "--border-radius":  "var(--radius-surface)",

          // success → state-scored token family
          // Opaque panel bg — subtle (rgba tint) bleeds through when toasts stack.
          // Status communicates via colored border + colored icon; bg stays solid.
          // --*-text drives currentColor on [data-icon]; title/description override
          // via classNames (title: !text-foreground, description: !text-muted-foreground).
          "--success-bg":     "var(--color-panel)",
          "--success-border": "var(--color-state-scored)",
          "--success-text":   "var(--color-state-scored)",

          // error → state-errored token family
          "--error-bg":       "var(--color-panel)",
          "--error-border":   "var(--color-state-errored)",
          "--error-text":     "var(--color-state-errored)",

          // warning → state-warning token family
          "--warning-bg":     "var(--color-panel)",
          "--warning-border": "var(--color-state-warning)",
          "--warning-text":   "var(--color-state-warning)",

          // info → state-running token family (no dedicated info set)
          "--info-bg":        "var(--color-panel)",
          "--info-border":    "var(--color-state-running)",
          "--info-text":      "var(--color-state-running)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
