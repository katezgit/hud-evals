import * as React from "react"

/** Options for {@link usePageScrolled}. */
export interface UsePageScrolledOptions {
  /**
   * Scroll distance (px) past which the hook returns `true`.
   * Matches the dialog/drawer scroll-cue convention.
   * @defaultValue 8
   */
  threshold?: number
  /**
   * Ref to an element whose nearest scrollable ancestor is monitored.
   * When omitted the hook listens on `window`.
   */
  ref?: React.RefObject<HTMLElement | null>
}

/**
 * Returns `true` when the scrollable ancestor of `ref.current` (or the window
 * when no ref is provided) has scrolled past `threshold` pixels.
 *
 * Updates are coalesced via `requestAnimationFrame` — one state change per
 * animation frame regardless of how many scroll events fire.
 *
 * SSR-safe: returns `false` during server-side rendering; all DOM access is
 * confined to `useEffect`.
 *
 * @param options - Optional threshold and element ref.
 * @returns `true` when the scroll position exceeds `threshold`.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null)
 * const scrolled = usePageScrolled({ ref: containerRef, threshold: 8 })
 * // scrolled === true  →  render elevated chrome
 * ```
 */
function usePageScrolled(options?: UsePageScrolledOptions): boolean {
  const threshold = options?.threshold ?? 8
  const ref = options?.ref

  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const target = resolveScrollTarget(ref?.current ?? null)

    const read = () => {
      const position =
        target === window
          ? (document.scrollingElement?.scrollTop ?? 0)
          : (target as HTMLElement).scrollTop
      setScrolled(position > threshold)
    }

    // Seed state immediately so a pre-scrolled page renders elevated without a flash.
    read()

    let rafId: number | null = null

    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        read()
      })
    }

    target.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      target.removeEventListener("scroll", onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  // ref.current identity changes are intentionally excluded — callers are
  // expected to pass a stable ref object. Re-running on ref object identity
  // would be a no-op since the object reference itself doesn't change after
  // the initial render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, ref])

  return scrolled
}

/**
 * Walks up the DOM from `el` to find the nearest scrollable ancestor.
 * Falls back to `window` when none is found.
 */
function resolveScrollTarget(el: HTMLElement | null): HTMLElement | Window {
  let node: HTMLElement | null = el

  while (node !== null) {
    const style = getComputedStyle(node)
    const overflow = style.overflowY
    if (overflow === "auto" || overflow === "scroll" || overflow === "overlay") {
      return node
    }
    node = node.parentElement
  }

  return window
}

export { usePageScrolled }
