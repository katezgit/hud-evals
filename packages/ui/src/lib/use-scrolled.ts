import * as React from "react"

/**
 * Takes `HTMLElement | null` directly (not `RefObject`) so the `[el]` effect dep
 * re-fires on Radix/vaul's deferred portal mount (null → element on second render).
 *
 * Returns `{ top, bottom }`. The returned object reference is stable when both
 * bools are unchanged — the dirty-check inside setState preserves Object.is
 * equivalence across scroll events that do not change either value, preventing
 * spurious re-renders of context consumers.
 *
 * `bottom` uses `scrollTop + clientHeight < scrollHeight - 1`: the `-1` cushions
 * sub-pixel rounding at the boundary so the cue reliably extinguishes at the bottom
 * edge on fractional-DPI displays.
 *
 * Re-checks on scroll, ResizeObserver (scrollHeight changes without a scroll event),
 * and mount.
 */
function useScrolled(el: HTMLElement | null): { top: boolean; bottom: boolean } {
  const [state, setState] = React.useState<{ top: boolean; bottom: boolean }>({ top: false, bottom: false })

  React.useEffect(() => {
    if (!el) return

    const checkScrolled = () => {
      const top = el.scrollTop > 0
      const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1
      setState(prev => (prev.top === top && prev.bottom === bottom ? prev : { top, bottom }))
    }

    checkScrolled()
    el.addEventListener("scroll", checkScrolled, { passive: true })

    const ro = new ResizeObserver(() => checkScrolled())
    ro.observe(el)

    return () => {
      el.removeEventListener("scroll", checkScrolled)
      ro.disconnect()
    }
  }, [el])

  return state
}

export { useScrolled }
