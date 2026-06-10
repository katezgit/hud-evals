import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select"

// Radix Select calls scrollIntoView on the selected item — jsdom does not
// implement it. Stub it globally for this suite.
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => {}
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function TestSelect({
  defaultValue,
  disabled,
  "aria-invalid": ariaInvalid,
  size,
}: {
  defaultValue?: string
  disabled?: boolean
  "aria-invalid"?: boolean | "true" | "false"
  size?: "sm" | "md"
}) {
  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger
        disabled={disabled}
        aria-invalid={ariaInvalid}
        size={size}
        aria-label="Test select"
      >
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Options</SelectLabel>
          <SelectItem value="alpha">Alpha</SelectItem>
          <SelectItem value="beta">Beta</SelectItem>
          <SelectItem value="gamma" disabled>
            Gamma
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="delta">Delta</SelectItem>
      </SelectContent>
    </Select>
  )
}

// ── Render ───────────────────────────────────────────────────────────────────

describe("Select", () => {
  it("renders the trigger", () => {
    render(<TestSelect />)
    expect(screen.getByRole("combobox", { name: "Test select" })).toBeInTheDocument()
  })

  it("shows selected value when defaultValue is set", () => {
    render(<TestSelect defaultValue="alpha" />)
    expect(screen.getByRole("combobox", { name: "Test select" })).toHaveTextContent("Alpha")
  })

  // ── data-size (used by CSS token selectors) ───────────────────────────────

  it("exposes data-size attribute", () => {
    render(<TestSelect size="sm" />)
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "sm")
  })

  // ── Disabled state ────────────────────────────────────────────────────────

  it("trigger is not interactive when disabled", () => {
    render(<TestSelect disabled />)
    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  // ── Error state ───────────────────────────────────────────────────────────

  it("exposes aria-invalid when set", () => {
    render(<TestSelect aria-invalid="true" />)
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true")
  })

  // ── Open-state: items visible ─────────────────────────────────────────────

  it("opens and shows items when clicked", async () => {
    const user = userEvent.setup()
    render(<TestSelect />)
    await user.click(screen.getByRole("combobox"))
    const listbox = await screen.findByRole("listbox")
    expect(within(listbox).getByRole("option", { name: "Alpha" })).toBeInTheDocument()
    expect(within(listbox).getByRole("option", { name: "Beta" })).toBeInTheDocument()
  })

  it("disabled option is not selectable", async () => {
    const user = userEvent.setup()
    render(<TestSelect />)
    await user.click(screen.getByRole("combobox"))
    await screen.findByRole("listbox")
    const gammaOption = screen.getByRole("option", { name: "Gamma" })
    expect(gammaOption).toHaveAttribute("aria-disabled", "true")
  })

  it("selecting an item updates the displayed value", async () => {
    const user = userEvent.setup()
    render(<TestSelect />)
    await user.click(screen.getByRole("combobox"))
    await screen.findByRole("listbox")
    await user.click(screen.getByRole("option", { name: "Beta" }))
    expect(screen.getByRole("combobox")).toHaveTextContent("Beta")
  })
})
