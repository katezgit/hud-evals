import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { Button } from "./button"

describe("Button", () => {
  // ── Disabled state ────────────────────────────────────────────────────────

  it("is disabled when disabled prop is passed", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled()
  })

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    await user.click(screen.getByRole("button", { name: "Disabled" }))
    expect(handleClick).not.toHaveBeenCalled()
  })

  // ── Interaction ───────────────────────────────────────────────────────────

  it("fires onClick when clicked", async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole("button", { name: "Click me" }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("is keyboard-activatable with Enter", async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Press</Button>)
    screen.getByRole("button", { name: "Press" }).focus()
    await user.keyboard("{Enter}")
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // ── asChild ───────────────────────────────────────────────────────────────

  it("renders as a link element when asChild wraps an anchor", () => {
    render(
      <Button asChild>
        <a href="/path">Link button</a>
      </Button>
    )
    expect(screen.getByRole("link", { name: "Link button" })).toBeInTheDocument()
  })

  // ── data-variant (used by CSS token selectors) ───────────────────────────────

  it("exposes data-variant attribute", () => {
    render(<Button variant="secondary">Sec</Button>)
    const btn = screen.getByRole("button", { name: "Sec" })
    expect(btn).toHaveAttribute("data-variant", "secondary")
  })
})
