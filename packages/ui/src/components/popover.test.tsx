import * as React from "react"
import { jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverLabel,
  PopoverValue,
  PopoverItem,
  PopoverSeparator,
} from "./popover"

// ── Helpers ───────────────────────────────────────────────────────────────────

function BasicPopover({
  variant,
  defaultOpen = false,
  contentProps,
}: {
  variant?: "informational" | "filter" | "action"
  defaultOpen?: boolean
  contentProps?: React.ComponentProps<typeof PopoverContent>
}) {
  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent variant={variant} {...contentProps}>
        <span data-testid="inner">content</span>
      </PopoverContent>
    </Popover>
  )
}

describe("Popover", () => {
  // ── Render / open-close ───────────────────────────────────────────────────

  it("does not render content when closed", () => {
    render(<BasicPopover />)
    expect(screen.queryByTestId("inner")).not.toBeInTheDocument()
  })

  it("renders content when defaultOpen=true", () => {
    render(<BasicPopover defaultOpen />)
    expect(screen.getByTestId("inner")).toBeInTheDocument()
  })

  it("opens content on trigger click", async () => {
    const user = userEvent.setup()
    render(<BasicPopover />)
    await user.click(screen.getByRole("button", { name: "Open" }))
    expect(screen.getByTestId("inner")).toBeInTheDocument()
  })

  it("closes on Escape key", async () => {
    const user = userEvent.setup()
    render(<BasicPopover />)
    await user.click(screen.getByRole("button", { name: "Open" }))
    expect(screen.getByTestId("inner")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByTestId("inner")).not.toBeInTheDocument()
  })

  // ── PopoverItem ────────────────────────────────────────────────────────────

  it("renders PopoverItem as a button", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent variant="action">
          <PopoverItem>Delete</PopoverItem>
        </PopoverContent>
      </Popover>
    )
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument()
  })

  it("calls onClick when PopoverItem is clicked", async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent variant="action">
          <PopoverItem onClick={handleClick as React.MouseEventHandler}>Action</PopoverItem>
        </PopoverContent>
      </Popover>
    )
    await user.click(screen.getByRole("button", { name: "Action" }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("disabled PopoverItem does not fire click", async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent variant="action">
          <PopoverItem disabled onClick={handleClick as React.MouseEventHandler}>
            Disabled
          </PopoverItem>
        </PopoverContent>
      </Popover>
    )
    await user.click(screen.getByRole("button", { name: "Disabled" }))
    expect(handleClick).not.toHaveBeenCalled()
  })

  // ── PopoverLabel / PopoverValue ────────────────────────────────────────────

  it("renders PopoverLabel text", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverLabel>Cost</PopoverLabel>
        </PopoverContent>
      </Popover>
    )
    expect(screen.getByText("Cost")).toBeInTheDocument()
  })

  it("renders PopoverValue text", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverValue>$12.50</PopoverValue>
        </PopoverContent>
      </Popover>
    )
    expect(screen.getByText("$12.50")).toBeInTheDocument()
  })

  // ── PopoverSeparator ────────────────────────────────────────────────────────

  it("renders PopoverSeparator with role=separator", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverSeparator />
        </PopoverContent>
      </Popover>
    )
    expect(screen.getByRole("separator")).toBeInTheDocument()
  })

  // ── PopoverAnchor ──────────────────────────────────────────────────────────

  it("renders PopoverAnchor without error", () => {
    expect(() =>
      render(
        <Popover>
          <PopoverAnchor data-testid="anchor" />
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>content</PopoverContent>
        </Popover>
      )
    ).not.toThrow()
  })
})
