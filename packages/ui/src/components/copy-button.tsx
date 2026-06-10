// shadcn-source: radix-wrap:Tooltip+IconButton (n/a, 2026-06-01)
"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@repo/ui/lib/cn"
import { useCopyToClipboard } from "@repo/ui/lib/use-copy-to-clipboard"
import { IconButton } from "./icon-button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

interface CopyButtonProps {
  /** String written to the clipboard on click. */
  value: string
  /**
   * Accessible label for the button. Defaults to `"Copy <value>"` in idle state
   * and `"Copied <value>"` in copied state (default behavior; static when caller
   * provides this prop — caller-provided override is used verbatim in both states).
   */
  ariaLabel?: string
  /** Tooltip text in idle state. Defaults to `"Copy"`. */
  tooltipLabel?: string
  /** Tooltip text in copied state. Defaults to `"Copied!"`. */
  tooltipCopiedLabel?: string
  /**
   * Disables the button. No clipboard call occurs; state does not change.
   * Implemented via `aria-disabled` (not native `disabled`) so the Radix
   * Tooltip can still receive pointer/focus events and show a tooltip explaining
   * why the button is unavailable.
   */
  disabled?: boolean
  className?: string
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      value,
      ariaLabel,
      tooltipLabel = "Copy",
      tooltipCopiedLabel = "Copied!",
      disabled = false,
      className,
    },
    ref,
  ) => {
    const { copied, copy } = useCopyToClipboard(value)

    const label = ariaLabel ?? (copied ? `Copied ${value}` : `Copy ${value}`)

    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton
              ref={ref}
              type="button"
              variant="ghost"
              size="sm"
              aria-label={label}
              aria-disabled={disabled || undefined}
              onClick={disabled ? undefined : copy}
              className={cn(
                disabled && "opacity-mid",
                copied ? "text-state-scored-text" : undefined,
                className,
              )}
            >
              {copied ? (
                <CheckIcon aria-hidden="true" />
              ) : (
                <CopyIcon aria-hidden="true" />
              )}
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>
            {copied ? tooltipCopiedLabel : tooltipLabel}
          </TooltipContent>
        </Tooltip>
        {/* aria-live region: announces copied state to screen readers.
            SRs don't re-announce a name change on a still-focused button,
            so this polite region is the primary SR announcement mechanism.
            The aria-label flip is supplementary (covers re-focus after blur). */}
        <span className="sr-only" role="status" aria-live="polite">
          {copied ? "Copied" : ""}
        </span>
      </>
    )
  },
)
CopyButton.displayName = "CopyButton"

export { CopyButton }
export type { CopyButtonProps }
