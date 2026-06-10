import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { SegmentedControl } from "./segmented-control"

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Controlled-state harness — Radix `ToggleGroup` requires a reactive `value`
 * for selection-flow tests. Mirrors the example in `docs/conventions/design-system.md`.
 */
function Harness({
  initialValue = "a",
  onValueChange = () => {},
  ...rest
}: {
  initialValue?: string
  onValueChange?: (v: string) => void
} & Omit<
  React.ComponentProps<typeof SegmentedControl>,
  "value" | "onValueChange" | "children"
>) {
  const [v, setV] = React.useState(initialValue)
  return (
    <SegmentedControl
      aria-label="test"
      value={v}
      onValueChange={(next) => {
        onValueChange(next)
        setV(next)
      }}
      {...rest}
    >
      <SegmentedControl.Item value="a">A</SegmentedControl.Item>
      <SegmentedControl.Item value="b">B</SegmentedControl.Item>
      <SegmentedControl.Item value="c">C</SegmentedControl.Item>
    </SegmentedControl>
  )
}

describe("SegmentedControl", () => {
  // ── Render ────────────────────────────────────────────────────────────────

  it("renders one radio per item", () => {
    render(<Harness />)
    expect(screen.getAllByRole("radio")).toHaveLength(3)
  })

  // ── Selection (controlled) ────────────────────────────────────────────────

  it("invokes onValueChange with the clicked value when an inactive item is clicked", async () => {
    const user = userEvent.setup()
    const handle = jest.fn()
    render(<Harness initialValue="a" onValueChange={handle} />)
    await user.click(screen.getByRole("radio", { name: "B" }))
    expect(handle).toHaveBeenCalledTimes(1)
    expect(handle).toHaveBeenCalledWith("b")
  })

  // ── Deselect guard (spec-critical) ────────────────────────────────────────

  it("does not invoke onValueChange when the active item is clicked", async () => {
    const user = userEvent.setup()
    const handle = jest.fn()
    render(<Harness initialValue="a" onValueChange={handle} />)
    await user.click(screen.getByRole("radio", { name: "A" }))
    // Deselect guard: Radix fires onValueChange("") on active-segment click;
    // wrapper discards. Spy must never be called — neither with "" nor with "a".
    expect(handle).not.toHaveBeenCalled()
  })

  // ── Keyboard ──────────────────────────────────────────────────────────────

  it("moves focus between items with arrow keys (Radix native)", async () => {
    const user = userEvent.setup()
    render(<Harness initialValue="a" />)
    // Tab into the group — Radix roving focus lands on the active item.
    await user.tab()
    expect(screen.getByRole("radio", { name: "A" })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: "B" })).toHaveFocus()
  })

  it("activates the focused inactive item with Space", async () => {
    const user = userEvent.setup()
    const handle = jest.fn()
    render(<Harness initialValue="a" onValueChange={handle} />)
    await user.tab() // focus active "A"
    await user.keyboard("{ArrowRight}") // move to "B"
    await user.keyboard(" ")
    expect(handle).toHaveBeenCalledWith("b")
  })

  it("activates the focused inactive item with Enter", async () => {
    const user = userEvent.setup()
    const handle = jest.fn()
    render(<Harness initialValue="a" onValueChange={handle} />)
    await user.tab() // focus active "A"
    await user.keyboard("{ArrowRight}{ArrowRight}") // move to "C"
    await user.keyboard("{Enter}")
    expect(handle).toHaveBeenCalledWith("c")
  })

  // ── disabled on root ──────────────────────────────────────────────────────

  it("does not invoke onValueChange when the entire control is disabled", async () => {
    const user = userEvent.setup()
    const handle = jest.fn()
    render(<Harness initialValue="a" onValueChange={handle} disabled />)
    await user.click(screen.getByRole("radio", { name: "B" }))
    expect(handle).not.toHaveBeenCalled()
  })

  // ── disabled on a non-active item ─────────────────────────────────────────

  it("marks a disabled non-active item with data-disabled", () => {
    render(
      <SegmentedControl aria-label="test" value="a" onValueChange={() => {}}>
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
        <SegmentedControl.Item value="b" disabled>
          B
        </SegmentedControl.Item>
      </SegmentedControl>
    )
    expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute(
      "data-disabled"
    )
  })

  it("does not invoke onValueChange when a disabled non-active item is clicked", async () => {
    const user = userEvent.setup()
    const handle = jest.fn()
    function DisabledItemHarness() {
      const [v, setV] = React.useState("a")
      return (
        <SegmentedControl
          aria-label="test"
          value={v}
          onValueChange={(next) => {
            handle(next)
            setV(next)
          }}
        >
          <SegmentedControl.Item value="a">A</SegmentedControl.Item>
          <SegmentedControl.Item value="b" disabled>
            B
          </SegmentedControl.Item>
        </SegmentedControl>
      )
    }
    render(<DisabledItemHarness />)
    await user.click(screen.getByRole("radio", { name: "B" }))
    expect(handle).not.toHaveBeenCalled()
  })

  // ── Active-item disabled override (spec-critical) ─────────────────────────

  it("ignores the disabled prop on the active item (no data-disabled)", () => {
    render(
      <SegmentedControl aria-label="test" value="a" onValueChange={() => {}}>
        <SegmentedControl.Item value="a" disabled>
          A
        </SegmentedControl.Item>
        <SegmentedControl.Item value="b">B</SegmentedControl.Item>
      </SegmentedControl>
    )
    // Active item: effectiveDisabled = false → no data-disabled.
    expect(screen.getByRole("radio", { name: "A" })).not.toHaveAttribute(
      "data-disabled"
    )
  })

  // ── Sliding indicator ─────────────────────────────────────────────────────

  it("renders a sliding thumb indicator element inside the root", () => {
    render(<Harness initialValue="a" />)
    // Indicator is rendered once a data-state=on child is found (useLayoutEffect).
    // jsdom has no layout engine so offsetLeft/Width are 0, but the element is present
    // and its style attribute contains a translateX transform (ready=true after measure).
    const indicator = document.querySelector("[data-slot='segmented-control-indicator']")
    expect(indicator).toBeInTheDocument()
    expect(indicator?.getAttribute("style")).toContain("translateX")
  })

  // ── Dev-mode aria warning (spec-critical) ─────────────────────────────────

  it("warns in dev mode when neither aria-label nor aria-labelledby is provided", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
    render(
      <SegmentedControl value="a" onValueChange={() => {}}>
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
        <SegmentedControl.Item value="b">B</SegmentedControl.Item>
      </SegmentedControl>
    )
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain("[SegmentedControl]")
    warn.mockRestore()
  })

  it("does not warn when aria-label is provided", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
    render(
      <SegmentedControl
        aria-label="Theme"
        value="a"
        onValueChange={() => {}}
      >
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
        <SegmentedControl.Item value="b">B</SegmentedControl.Item>
      </SegmentedControl>
    )
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
