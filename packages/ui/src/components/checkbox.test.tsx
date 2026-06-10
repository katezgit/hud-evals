import * as React from "react"
import { jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Checkbox } from "./checkbox"

describe("Checkbox", () => {
  // ── Render ──────────────────────────────────────────────────────────────────

  it("is unchecked by default", () => {
    render(<Checkbox aria-label="Accept terms" />)
    expect(screen.getByRole("checkbox", { name: "Accept terms" })).not.toBeChecked()
  })

  // ── Interaction ─────────────────────────────────────────────────────────────

  it("toggles to checked when clicked", async () => {
    const user = userEvent.setup()
    render(<Checkbox aria-label="Toggle" />)
    const checkbox = screen.getByRole("checkbox", { name: "Toggle" })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it("toggles back to unchecked when clicked again", async () => {
    const user = userEvent.setup()
    render(<Checkbox defaultChecked aria-label="Toggle back" />)
    const checkbox = screen.getByRole("checkbox", { name: "Toggle back" })
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it("fires onCheckedChange with new value when clicked", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Checkbox aria-label="Change handler" onCheckedChange={handleChange} />)
    await user.click(screen.getByRole("checkbox"))
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  // ── Disabled ─────────────────────────────────────────────────────────────────

  it("is not interactive when disabled", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Checkbox disabled aria-label="Disabled" onCheckedChange={handleChange} />)
    const checkbox = screen.getByRole("checkbox", { name: "Disabled" })
    expect(checkbox).toBeDisabled()
    await user.click(checkbox)
    expect(handleChange).not.toHaveBeenCalled()
  })

  // ── Controlled state ─────────────────────────────────────────────────────────

  it("reflects checked state when controlled", () => {
    render(<Checkbox checked aria-label="Controlled" onCheckedChange={() => {}} />)
    expect(screen.getByRole("checkbox", { name: "Controlled" })).toBeChecked()
  })

  it("reflects indeterminate state via data-state attribute", () => {
    render(
      <Checkbox checked="indeterminate" aria-label="Indeterminate" onCheckedChange={() => {}} />
    )
    expect(screen.getByRole("checkbox", { name: "Indeterminate" })).toHaveAttribute(
      "data-state",
      "indeterminate"
    )
  })

  // ── Error state (aria-invalid) ────────────────────────────────────────────────

  it("exposes aria-invalid when set", () => {
    render(<Checkbox aria-invalid aria-label="Error state" />)
    expect(screen.getByRole("checkbox", { name: "Error state" })).toHaveAttribute(
      "aria-invalid",
      "true"
    )
  })

  // ── data-size (used by CSS token selectors) ───────────────────────────────────

  it("exposes data-size attribute", () => {
    render(<Checkbox size="sm" aria-label="Small" />)
    expect(screen.getByRole("checkbox", { name: "Small" })).toHaveAttribute("data-size", "sm")
  })
})
