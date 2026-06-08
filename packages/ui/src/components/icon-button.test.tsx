import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { IconButton } from "./icon-button"

// ── Type-level: aria-label is required ────────────────────────────────────────
// @ts-expect-error — aria-label is required; omitting it should be a type error
const _missingAriaLabel = <IconButton><span /></IconButton> // eslint-disable-line @typescript-eslint/no-unused-vars -- type-level test; assigned to verify TS error, not used at runtime

describe("IconButton", () => {
  // ── Accessible name ───────────────────────────────────────────────────────

  it("is queryable by its aria-label", () => {
    render(<IconButton aria-label="Add item"><span /></IconButton>)
    expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument()
  })

  // ── data-variant / data-size (used by CSS token selectors) ────────────────

  it("exposes data-variant for each variant", () => {
    const variants = ["primary", "secondary", "ghost", "destructive", "destructive-ghost"] as const
    for (const variant of variants) {
      const { unmount } = render(
        <IconButton aria-label={variant} variant={variant}><span /></IconButton>
      )
      expect(screen.getByRole("button", { name: variant })).toHaveAttribute("data-variant", variant)
      unmount()
    }
  })

  it("exposes data-size attribute", () => {
    render(<IconButton aria-label="btn" size="sm"><span /></IconButton>)
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm")
  })

  // ── Disabled state ────────────────────────────────────────────────────────

  it("is disabled when disabled prop is passed", () => {
    render(<IconButton aria-label="btn" disabled><span /></IconButton>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(
      <IconButton aria-label="btn" disabled onClick={handleClick}>
        <span />
      </IconButton>
    )
    await user.click(screen.getByRole("button"))
    expect(handleClick).not.toHaveBeenCalled()
  })

  // ── Interaction ───────────────────────────────────────────────────────────

  it("fires onClick when clicked", async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(
      <IconButton aria-label="btn" onClick={handleClick}>
        <span />
      </IconButton>
    )
    await user.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // ── asChild ───────────────────────────────────────────────────────────────

  it("renders as anchor when asChild wraps an anchor", () => {
    render(
      <IconButton asChild aria-label="Go home">
        <a href="/home"><span /></a>
      </IconButton>
    )
    expect(screen.getByRole("link", { name: "Go home" })).toBeInTheDocument()
  })

  // ── className merging ─────────────────────────────────────────────────────

  it("merges custom className", () => {
    render(<IconButton aria-label="btn" className="custom-cls"><span /></IconButton>)
    expect(screen.getByRole("button")).toHaveClass("custom-cls")
  })
})
