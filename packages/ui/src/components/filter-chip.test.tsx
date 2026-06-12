import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { FilterChip } from "./filter-chip"

describe("FilterChip", () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it("is queryable by role button with label as accessible name", () => {
    render(
      <FilterChip label="GPU" selected={false} onSelectedChange={jest.fn()} />,
    )
    expect(screen.getByRole("button", { name: /^GPU/ })).toBeInTheDocument()
  })

  it("includes count in accessible name when count is provided", () => {
    render(
      <FilterChip
        label="GPU"
        selected={false}
        onSelectedChange={jest.fn()}
        count={12}
      />,
    )
    expect(screen.getByRole("button", { name: /GPU.*12/ })).toBeInTheDocument()
  })

  it("does not include numeric text in accessible name when count is omitted", () => {
    render(
      <FilterChip label="GPU" selected={false} onSelectedChange={jest.fn()} />,
    )
    // Name is just the label — no stray digits
    const btn = screen.getByRole("button")
    expect(btn.textContent?.replace(/\s/g, "")).toBe("GPU")
  })

  // ── State semantics ───────────────────────────────────────────────────────

  it("has aria-pressed=false when selected is false", () => {
    render(
      <FilterChip label="GPU" selected={false} onSelectedChange={jest.fn()} />,
    )
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false")
  })

  it("has aria-pressed=true when selected is true", () => {
    render(
      <FilterChip label="GPU" selected={true} onSelectedChange={jest.fn()} />,
    )
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true")
  })

  it("does not use role=checkbox", () => {
    render(
      <FilterChip label="GPU" selected={false} onSelectedChange={jest.fn()} />,
    )
    expect(screen.queryByRole("checkbox")).toBeNull()
  })

  // ── Toggle behavior ───────────────────────────────────────────────────────

  it("fires onSelectedChange with inverted value on mouse click (selected=false)", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(
      <FilterChip label="GPU" selected={false} onSelectedChange={handleChange} />,
    )
    await user.click(screen.getByRole("button"))
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it("fires onSelectedChange with inverted value on mouse click (selected=true)", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(
      <FilterChip label="GPU" selected={true} onSelectedChange={handleChange} />,
    )
    await user.click(screen.getByRole("button"))
    expect(handleChange).toHaveBeenCalledWith(false)
  })

  it("fires onSelectedChange when Space is pressed", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(
      <FilterChip label="GPU" selected={false} onSelectedChange={handleChange} />,
    )
    screen.getByRole("button").focus()
    await user.keyboard(" ")
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it("fires onSelectedChange when Enter is pressed", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(
      <FilterChip label="GPU" selected={false} onSelectedChange={handleChange} />,
    )
    screen.getByRole("button").focus()
    await user.keyboard("{Enter}")
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  // ── Disabled ──────────────────────────────────────────────────────────────

  it("has the native disabled attribute when disabled", () => {
    render(
      <FilterChip
        label="GPU"
        selected={false}
        onSelectedChange={jest.fn()}
        disabled
      />,
    )
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("does not fire onSelectedChange on click when disabled", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(
      <FilterChip
        label="GPU"
        selected={false}
        onSelectedChange={handleChange}
        disabled
      />,
    )
    await user.click(screen.getByRole("button"))
    expect(handleChange).not.toHaveBeenCalled()
  })

  it("does not fire onSelectedChange on Space or Enter when disabled", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(
      <FilterChip
        label="GPU"
        selected={false}
        onSelectedChange={handleChange}
        disabled
      />,
    )
    screen.getByRole("button").focus()
    await user.keyboard(" {Enter}")
    expect(handleChange).not.toHaveBeenCalled()
  })

  // ── className passthrough ─────────────────────────────────────────────────

  it("merges custom className onto the button element", () => {
    render(
      <FilterChip
        label="GPU"
        selected={false}
        onSelectedChange={jest.fn()}
        className="custom-chip"
      />,
    )
    expect(screen.getByRole("button")).toHaveClass("custom-chip")
  })
})
