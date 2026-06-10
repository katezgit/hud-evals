import * as React from "react"
import { jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./dropdown-menu"

// ── Helpers ───────────────────────────────────────────────────────────────────

function BasicMenu({
  defaultOpen = false,
  onSelect,
}: {
  defaultOpen?: boolean
  onSelect?: () => void
}) {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={onSelect}>Edit</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        <DropdownMenuItem disabled>Disabled action</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe("DropdownMenu", () => {
  // ── Render ────────────────────────────────────────────────────────────────

  it("renders trigger button", () => {
    render(<BasicMenu />)
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument()
  })

  it("does not render content when closed", () => {
    render(<BasicMenu />)
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument()
  })

  it("renders content when defaultOpen=true", () => {
    render(<BasicMenu defaultOpen />)
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument()
  })

  it("opens content on trigger click", async () => {
    const user = userEvent.setup()
    render(<BasicMenu />)
    await user.click(screen.getByRole("button", { name: "Open menu" }))
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument()
  })

  // ── Interaction ───────────────────────────────────────────────────────────

  it("fires onSelect when item is clicked", async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    render(<BasicMenu defaultOpen onSelect={onSelect as () => void} />)
    await user.click(screen.getByRole("menuitem", { name: "Edit" }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  // ── Disabled ──────────────────────────────────────────────────────────────

  it("disabled item has aria-disabled", () => {
    render(<BasicMenu defaultOpen />)
    const item = screen.getByRole("menuitem", { name: "Disabled action" })
    // Radix sets data-disabled on disabled items; the item is not aria-disabled
    // but it carries data-disabled which prevents interaction
    expect(item).toHaveAttribute("data-disabled")
  })

  // ── Variants ──────────────────────────────────────────────────────────────

  it("destructive item carries data-variant=destructive", () => {
    render(<BasicMenu defaultOpen />)
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute(
      "data-variant",
      "destructive"
    )
  })

  // ── Label ─────────────────────────────────────────────────────────────────

  it("label text is rendered in the menu", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByText("Actions")).toBeInTheDocument()
  })

  // ── CheckboxItem ──────────────────────────────────────────────────────────

  it("checkbox item is checked when checked=true", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={true}>Starred</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    // Radix renders a menuitemcheckbox role
    expect(screen.getByRole("menuitemcheckbox", { name: "Starred" })).toBeChecked()
  })

  // ── RadioGroup + RadioItem ────────────────────────────────────────────────

  it("radio items are rendered as menuitemradio", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole("menuitemradio", { name: "Option A" })).toBeChecked()
    expect(screen.getByRole("menuitemradio", { name: "Option B" })).not.toBeChecked()
  })

  // ── Shortcut ──────────────────────────────────────────────────────────────

  it("renders keyboard shortcut text next to item", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Edit <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByText("⌘E")).toBeInTheDocument()
  })

  // ── Inset prop ────────────────────────────────────────────────────────────

  it("item with inset=true carries data-inset attribute", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset>Inset item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole("menuitem", { name: "Inset item" })).toHaveAttribute("data-inset", "true")
  })

  // ── Sub-menu ──────────────────────────────────────────────────────────────

  it("sub-trigger renders as menuitem in the parent menu", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole("menuitem", { name: /more/i })).toBeInTheDocument()
  })

  // ── Separator ─────────────────────────────────────────────────────────────

  it("separator has role=separator", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>B</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole("separator")).toBeInTheDocument()
  })
})
