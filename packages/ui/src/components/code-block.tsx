// shadcn-source: from-scratch-approved:KateZ-2026-05-26 (n/a, 2026-05-26)
// No shadcn primitive and no Radix primitive exist for CodeBlock.
// From-scratch approved by task precondition: "NO shadcn baseline exists for code-block — you build from scratch."
// Spec: docs/design/components/code-block/spec.md (2026-05-26).
import * as React from "react"
import { Copy, Check, X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/cn"

// ── Copy function — module-level for test-time injection ─────────────────────
// ESM VM isolation in jest means test-side `navigator.clipboard` patches don't
// reach this module's `navigator` global. Export `__setCopyFn` so tests can
// inject a spy without touching navigator directly.
let _copyFn: (text: string) => Promise<void> = (text) =>
  navigator.clipboard.writeText(text)

/** @internal — tests only. Resets to the default after each test. */
export function __setCopyFn(fn: (text: string) => Promise<void>) {
  _copyFn = fn
}
/** @internal — tests only. Restores the navigator.clipboard default. */
export function __resetCopyFn() {
  _copyFn = (text) => navigator.clipboard.writeText(text)
}

// ── cva variants ─────────────────────────────────────────────────────────────

const codeBlockVariants = cva(
  // Base: shared layout + typography
  [
    "relative",
    "font-mono text-code",
    "leading-[--text-code--line-height]",  // --text-code--line-height: 1.25rem (20px)
    "rounded-md",
    "overflow-x-auto",
    "whitespace-pre",
  ],
  {
    variants: {
      variant: {
        // Inline: single-line, elevated muted background
        inline: [
          "bg-muted text-foreground",
          "border border-border",
          "px-3 py-2",
          "pr-9",          // right padding reserves space for the copy icon
          "inline-flex items-center",
        ],
        // Block: multi-line, panel surface (NOT bg-foreground — that's a text color in IP-v1)
        // Note: no pt-8 reserve — when language is present, the header bar is in-flow above;
        // when language is absent, the wrapper div is unstyled (no border/bg) and the pre
        // keeps its own border/bg + uses pt-8 for copy button clearance (see JSX below).
        block: [
          "bg-code-bg text-code-fg",
          "border border-code-border",
          "px-4 py-3",
          "block",
          "w-full",
          "max-h-96 overflow-y-auto",
        ],
      },
    },
    defaultVariants: {
      variant: "inline",
    },
  }
)

// ── Copy button state ─────────────────────────────────────────────────────────

type CopyState = "idle" | "success" | "error"

// ── Sub-component: CopyButton ─────────────────────────────────────────────────

interface CopyButtonProps {
  value: string
  /** "light" for inline surface; "dark" for block surface */
  surface: "light" | "dark"
  /** Optional className for positioning overrides; callers supply absolute placement */
  className?: string
}

function CopyButton({ value, surface, className }: CopyButtonProps) {
  const [state, setState] = React.useState<CopyState>("idle")
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = React.useCallback(async () => {
    if (state !== "idle") return
    try {
      await _copyFn(value)
      setState("success")
    } catch {
      setState("error")
    }

    timerRef.current = setTimeout(() => {
      setState("idle")
      timerRef.current = null
    }, 1500)
  }, [value, state])

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  const isLight = surface === "light"

  const buttonBase = cn(
    "inline-flex items-center justify-center",
    "size-6 rounded-md",
    "border border-transparent",
    "transition-colors",
    // Focus ring — *:focus-visible in base.css (WCAG 2.4.11). outline-none removed; base layer owns it.
    "disabled:pointer-events-none",
    isLight
      ? "text-muted-foreground hover:text-foreground hover:bg-hover"
      : "text-foreground hover:bg-white/10",
    className,
  )

  const iconBase = cn(
    "size-4",
    "transition-opacity",
    // motion-state-change: var(--duration-fast) var(--ease-out-standard) = 120ms
  )

  const isActive = state !== "idle"

  return (
    <button
      type="button"
      aria-label={
        state === "idle" ? "Copy to clipboard" :
        state === "success" ? "Copied!" :
        "Copy failed"
      }
      data-slot="copy-button"
      data-state={state}
      className={buttonBase}
      onClick={handleCopy}
    >
      {/* Idle: Copy icon */}
      <Copy
        aria-hidden="true"
        className={cn(
          iconBase,
          "transition-opacity",
          isActive ? "opacity-0" : "opacity-100",
        )}
        style={{
          transitionDuration: "var(--duration-fast)",
          transitionTimingFunction: "var(--ease-out-standard)",
        }}
      />

      {/* Success: Check icon */}
      <Check
        aria-hidden="true"
        className={cn(
          iconBase,
          "absolute",
          "text-state-scored",
          state === "success" ? "opacity-100" : "opacity-0",
          state === "success" ? "animate-copy-confirm" : "",
        )}
        style={{
          transitionDuration: "var(--duration-fast)",
          transitionTimingFunction: "var(--ease-out-standard)",
          ...(state === "success" ? {
            animation: `copy-confirm-pulse var(--duration-subtle) var(--ease-out-standard) 1`,
          } : {}),
        }}
      />

      {/* Error: X icon */}
      <X
        aria-hidden="true"
        className={cn(
          iconBase,
          "absolute",
          "text-state-errored",
          state === "error" ? "opacity-100" : "opacity-0",
        )}
        style={{
          transitionDuration: "var(--duration-fast)",
          transitionTimingFunction: "var(--ease-out-standard)",
          ...(state === "error" ? {
            animation: `copy-confirm-pulse var(--duration-subtle) var(--ease-out-standard) 1`,
          } : {}),
        }}
      />
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export interface CodeBlockProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children">,
    VariantProps<typeof codeBlockVariants> {
  /** The code string to display and copy */
  code: string
  /** Optional language label shown above block variant (ignored for inline) */
  language?: string
}

const CodeBlock = React.forwardRef<HTMLElement, CodeBlockProps>(
  ({ className, variant = "inline", code, language, ...props }, ref) => {
    const isBlock = variant === "block"

    return (
      <>
        {isBlock ? (
          language ? (
            // Block + language: in-flow header bar above <pre>
            // Wrapper owns border/bg/radius; pre has no border/radius of its own.
            <div className="relative w-full bg-code-bg border border-code-border rounded-md overflow-hidden">
              {/* In-flow header row — no absolute positioning */}
              <div className="flex h-9 items-center justify-between px-3 border-b border-code-border">
                <span
                  data-slot="language-label"
                  className="text-label font-medium text-code-muted"
                >
                  {language}
                </span>
                {/* CopyButton in flex flow — no positioning className */}
                <CopyButton value={code} surface="dark" />
              </div>

              <pre
                ref={ref as React.ForwardedRef<HTMLPreElement>}
                data-slot="code-block"
                data-variant={variant}
                className={cn(
                  // Base classes without border/radius (wrapper owns them) and without pt-8
                  "relative font-mono text-code",
                  "leading-[--text-code--line-height]",
                  "overflow-x-auto whitespace-pre",
                  "bg-code-bg text-code-fg",
                  "px-4 py-3",
                  "block w-full",
                  "max-h-96 overflow-y-auto",
                  className,
                )}
                {...props}
              >
                <code>{code}</code>
              </pre>
            </div>
          ) : (
            // Block + no language: wrapper is unstyled, pre owns border/bg/radius + pt-8 for copy clearance
            <div className="relative w-full">
              {/* CopyButton absolute-positioned top-right, z-10 above the pre */}
              <CopyButton value={code} surface="dark" className="absolute top-2 right-2 z-10" />

              <pre
                ref={ref as React.ForwardedRef<HTMLPreElement>}
                data-slot="code-block"
                data-variant={variant}
                className={cn(codeBlockVariants({ variant }), "pt-8", className)}
                {...props}
              >
                <code>{code}</code>
              </pre>
            </div>
          )
        ) : (
          // Inline: <code> element, single-line
          <code
            ref={ref as React.ForwardedRef<HTMLElement>}
            data-slot="code-block"
            data-variant={variant}
            className={cn(codeBlockVariants({ variant }), className)}
            {...props}
          >
            {code}
            <CopyButton value={code} surface="light" className="absolute top-2 right-2" />
          </code>
        )}
      </>
    )
  }
)
CodeBlock.displayName = "CodeBlock"

export { CodeBlock, codeBlockVariants }
