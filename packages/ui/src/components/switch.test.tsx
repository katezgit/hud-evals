import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { Switch } from "./switch"

describe("Switch", () => {
  // ── Render ────────────────────────────────────────────────────────────────

  it("starts in unchecked state by default", () => {
    render(<Switch aria-label="Enable feature" />)
    expect(screen.getByRole("switch", { name: "Enable feature" })).not.toBeChecked()
  })

  // ── Interaction ───────────────────────────────────────────────────────────

  it("toggles checked state on click", async () => {
    const user = userEvent.setup()
    render(<Switch aria-label="Enable feature" />)
    const switchEl = screen.getByRole("switch", { name: "Enable feature" })
    await user.click(switchEl)
    expect(switchEl).toBeChecked()
  })

  it("calls onCheckedChange with the new boolean value on toggle on", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<Switch aria-label="Enable feature" onCheckedChange={onChange} />)
    await user.click(screen.getByRole("switch"))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("calls onCheckedChange with false when toggled off", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<Switch aria-label="Enable feature" defaultChecked onCheckedChange={onChange} />)
    await user.click(screen.getByRole("switch"))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it("toggles with Space key when focused", async () => {
    const user = userEvent.setup()
    render(<Switch aria-label="Enable feature" />)
    const switchEl = screen.getByRole("switch")
    switchEl.focus()
    await user.keyboard(" ")
    expect(switchEl).toBeChecked()
  })

  // ── Disabled ──────────────────────────────────────────────────────────────

  it("is not interactive when disabled", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<Switch aria-label="Enable feature" disabled onCheckedChange={onChange} />)
    const switchEl = screen.getByRole("switch")
    expect(switchEl).toBeDisabled()
    await user.click(switchEl)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("renders in disabled-on state correctly", () => {
    render(<Switch aria-label="Enable feature" disabled defaultChecked />)
    const switchEl = screen.getByRole("switch")
    expect(switchEl).toBeDisabled()
    expect(switchEl).toBeChecked()
  })

  // ── Controlled ────────────────────────────────────────────────────────────

  it("respects controlled checked=true", () => {
    render(<Switch aria-label="Enable feature" checked onCheckedChange={() => {}} />)
    expect(screen.getByRole("switch")).toBeChecked()
  })

  it("respects controlled checked=false", () => {
    render(<Switch aria-label="Enable feature" checked={false} onCheckedChange={() => {}} />)
    expect(screen.getByRole("switch")).not.toBeChecked()
  })

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("accepts aria-labelledby", () => {
    render(
      <>
        <span id="switch-label">Dark mode</span>
        <Switch aria-labelledby="switch-label" />
      </>
    )
    expect(screen.getByRole("switch", { name: "Dark mode" })).toBeInTheDocument()
  })

  it("is reachable by keyboard focus", () => {
    render(<Switch aria-label="Enable feature" />)
    const switchEl = screen.getByRole("switch")
    switchEl.focus()
    expect(switchEl).toHaveFocus()
  })

  // ── data-size (used by CSS token selectors) ───────────────────────────────

  it("exposes data-size attribute", () => {
    render(<Switch size="sm" aria-label="Toggle" />)
    expect(screen.getByRole("switch")).toHaveAttribute("data-size", "sm")
  })
})
