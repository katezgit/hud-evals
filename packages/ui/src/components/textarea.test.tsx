import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { Textarea } from "./textarea"

describe("Textarea", () => {
  // ── Disabled state ────────────────────────────────────────────────────────

  it("is disabled when disabled prop is passed", () => {
    render(<Textarea aria-label="test" disabled />)
    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  // ── aria-invalid ──────────────────────────────────────────────────────────

  it("exposes aria-invalid attribute when passed", () => {
    render(<Textarea aria-label="test" aria-invalid />)
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
  })

  // ── Interaction ───────────────────────────────────────────────────────────

  it("accepts typed input", async () => {
    const user = userEvent.setup()
    render(<Textarea aria-label="test" />)
    await user.type(screen.getByRole("textbox"), "hello")
    expect(screen.getByRole("textbox")).toHaveValue("hello")
  })

  it("fires onChange when value changes", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Textarea aria-label="test" onChange={handleChange} />)
    await user.type(screen.getByRole("textbox"), "x")
    expect(handleChange).toHaveBeenCalled()
  })
})
