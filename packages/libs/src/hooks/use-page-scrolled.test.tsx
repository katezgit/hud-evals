import * as React from "react"
import { renderHook, act } from "@testing-library/react"
import { jest } from "@jest/globals"
import { usePageScrolled } from "./use-page-scrolled"

// ── Environment setup ─────────────────────────────────────────────────────────
//
// jsdom returns null for document.scrollingElement because it doesn't
// implement the full CSSOM View spec. Patch it to return documentElement
// (matching browser behavior) so the hook's window-scroll path is testable.

let originalScrollingElementDescriptor: PropertyDescriptor | undefined

beforeAll(() => {
  originalScrollingElementDescriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "scrollingElement",
  )
  Object.defineProperty(document, "scrollingElement", {
    configurable: true,
    get: () => document.documentElement,
  })
})

afterAll(() => {
  if (originalScrollingElementDescriptor) {
    Object.defineProperty(document, "scrollingElement", originalScrollingElementDescriptor)
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Sets document.scrollingElement.scrollTop (window scroll target in tests). */
function setWindowScrollTop(px: number) {
  Object.defineProperty(document.documentElement, "scrollTop", {
    configurable: true,
    writable: true,
    value: px,
  })
}

/** Advances fake timers by one frame so any pending RAF callback fires. */
async function flushRaf() {
  await act(async () => {
    jest.advanceTimersByTime(16)
  })
}

// ─────────────────────────────────────────────────────────────────────────────

describe("usePageScrolled", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setWindowScrollTop(0)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // ── Initial state ──────────────────────────────────────────────────────────

  it("returns false on initial mount when window scrollTop is 0", () => {
    const { result } = renderHook(() => usePageScrolled())
    expect(result.current).toBe(false)
  })

  it("returns true on initial mount when window is pre-scrolled past default threshold", () => {
    setWindowScrollTop(9) // default threshold = 8; 9 > 8
    const { result } = renderHook(() => usePageScrolled())
    // useEffect seeds state immediately (read() called before listener is attached)
    expect(result.current).toBe(true)
  })

  // ── Threshold boundary ─────────────────────────────────────────────────────

  it("returns false when scrollTop equals threshold (strict > not >=)", () => {
    setWindowScrollTop(8) // exactly at default threshold, not past it
    const { result } = renderHook(() => usePageScrolled())
    expect(result.current).toBe(false)
  })

  it("returns true when scrollTop is one past threshold", () => {
    setWindowScrollTop(9) // threshold + 1
    const { result } = renderHook(() => usePageScrolled())
    expect(result.current).toBe(true)
  })

  // ── Custom threshold ───────────────────────────────────────────────────────

  it("returns false with custom threshold when scrollTop is below it", () => {
    setWindowScrollTop(50)
    const { result } = renderHook(() => usePageScrolled({ threshold: 100 }))
    expect(result.current).toBe(false)
  })

  it("returns true with custom threshold when scrollTop exceeds it", () => {
    setWindowScrollTop(101) // 101 > 100
    const { result } = renderHook(() => usePageScrolled({ threshold: 100 }))
    expect(result.current).toBe(true)
  })

  // ── Scroll events via window ───────────────────────────────────────────────

  it("transitions false → true after a scroll event drives scrollTop past threshold", async () => {
    const { result } = renderHook(() => usePageScrolled())
    expect(result.current).toBe(false)

    setWindowScrollTop(20)
    // fireEvent is correct here: the hook listens for the raw "scroll" DOM event,
    // not a user-gesture interaction that userEvent models.
    act(() => { window.dispatchEvent(new Event("scroll")) })
    await flushRaf()

    expect(result.current).toBe(true)
  })

  it("transitions true → false after a scroll event drives scrollTop back below threshold", async () => {
    setWindowScrollTop(50)
    const { result } = renderHook(() => usePageScrolled())
    expect(result.current).toBe(true)

    setWindowScrollTop(0)
    act(() => { window.dispatchEvent(new Event("scroll")) })
    await flushRaf()

    expect(result.current).toBe(false)
  })

  // ── RAF coalescing ─────────────────────────────────────────────────────────

  it("coalesces 5 synchronous scroll events into one React render per RAF tick", async () => {
    let renderCount = 0
    const { result } = renderHook(() => {
      renderCount++
      return usePageScrolled()
    })
    const countAfterMount = renderCount

    setWindowScrollTop(20)
    // 5 events fire before time advances — only 1 RAF is ever scheduled
    act(() => {
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("scroll"))
    })
    await flushRaf()

    // Exactly one re-render: the RAF fired once, called read() once, setState once
    expect(renderCount - countAfterMount).toBe(1)
    expect(result.current).toBe(true)
  })

  // ── Window fallback (no ref) ───────────────────────────────────────────────

  it("attaches the scroll listener to window when no ref is provided", () => {
    const addSpy = jest.spyOn(window, "addEventListener")
    renderHook(() => usePageScrolled())
    expect(addSpy).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true })
    addSpy.mockRestore()
  })

  // ── Ref-based scroll target ───────────────────────────────────────────────

  it("attaches the listener to the scrollable ancestor of the ref element, not window", () => {
    const container = document.createElement("div")
    // getComputedStyle in jsdom reads inline styles
    container.style.overflowY = "auto"
    const inner = document.createElement("div")
    container.appendChild(inner)
    document.body.appendChild(container)

    const addSpy = jest.spyOn(container, "addEventListener")
    const ref = { current: inner } as React.RefObject<HTMLElement>

    renderHook(() => usePageScrolled({ ref }))

    expect(addSpy).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true })

    document.body.removeChild(container)
    addSpy.mockRestore()
  })

  it("reads scrollTop from the scrollable ancestor when the ref is inside it", () => {
    const container = document.createElement("div")
    container.style.overflowY = "auto"
    const inner = document.createElement("div")
    container.appendChild(inner)
    document.body.appendChild(container)

    // Pre-scroll the ancestor past default threshold
    Object.defineProperty(container, "scrollTop", {
      configurable: true,
      writable: true,
      value: 20,
    })

    const ref = { current: inner } as React.RefObject<HTMLElement>
    const { result } = renderHook(() => usePageScrolled({ ref }))

    expect(result.current).toBe(true)

    document.body.removeChild(container)
  })

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  it("removes the scroll listener from window on unmount", () => {
    const removeSpy = jest.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => usePageScrolled())
    unmount()
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function))
    removeSpy.mockRestore()
  })

  it("does not update state after unmount when a scroll event fires", async () => {
    const { result, unmount } = renderHook(() => usePageScrolled())
    expect(result.current).toBe(false)

    unmount()

    // Any scroll after unmount must not change the captured result
    setWindowScrollTop(50)
    act(() => { window.dispatchEvent(new Event("scroll")) })
    await flushRaf()

    expect(result.current).toBe(false)
  })

  // SSR safety note: the hook initialises with useState(false) — no DOM access
  // at render time. All window/document reads are inside useEffect, which never
  // runs during SSR. This invariant is structural (no top-level window access in
  // the source) and does not require a separate test in a jsdom environment.
})
