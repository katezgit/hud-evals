import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { Input } from "./input"

describe("Input", () => {
  // ── Disabled state ────────────────────────────────────────────────────────

  it("is disabled when disabled prop is passed", () => {
    render(<Input aria-label="test" disabled />)
    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  it("does not accept input when disabled", async () => {
    const user = userEvent.setup()
    render(<Input aria-label="test" disabled defaultValue="" />)
    await user.type(screen.getByRole("textbox"), "blocked")
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  // ── aria-invalid ──────────────────────────────────────────────────────────

  it("exposes aria-invalid attribute when passed", () => {
    render(<Input aria-label="test" aria-invalid />)
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
  })

  // ── Interaction ───────────────────────────────────────────────────────────

  it("accepts typed input", async () => {
    const user = userEvent.setup()
    render(<Input aria-label="test" />)
    await user.type(screen.getByRole("textbox"), "hello")
    expect(screen.getByRole("textbox")).toHaveValue("hello")
  })

  it("fires onChange when value changes", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Input aria-label="test" onChange={handleChange} />)
    await user.type(screen.getByRole("textbox"), "x")
    expect(handleChange).toHaveBeenCalled()
  })

  // ── type prop ─────────────────────────────────────────────────────────────

  it("passes type prop through", () => {
    render(<Input type="email" aria-label="email" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email")
  })
})
