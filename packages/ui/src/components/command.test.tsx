import * as React from "react"
import { jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command"

// cmdk calls scrollIntoView on selected items — jsdom does not implement it.
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => {}
})

function TestCommand({
  onSelectAlpha,
  onSelectBeta,
  includeDisabled = false,
}: {
  onSelectAlpha?: (v: string) => void
  onSelectBeta?: (v: string) => void
  includeDisabled?: boolean
}) {
  return (
    <Command label="Test command menu">
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Options">
          <CommandItem value="alpha" onSelect={onSelectAlpha ?? (() => {})}>
            Alpha
          </CommandItem>
          <CommandItem value="beta" onSelect={onSelectBeta ?? (() => {})}>
            Beta
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          {includeDisabled && (
            <CommandItem value="gamma" disabled>
              Gamma
            </CommandItem>
          )}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="More">
          <CommandItem value="delta">Delta</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

describe("Command", () => {
  // ── Render ────────────────────────────────────────────────────────────────

  it("renders the search input", () => {
    render(<TestCommand />)
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument()
  })

  it("renders all items by default", () => {
    render(<TestCommand />)
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Beta")).toBeInTheDocument()
    expect(screen.getByText("Delta")).toBeInTheDocument()
  })

  // ── Search filter ─────────────────────────────────────────────────────────

  it("filters items when typing in the search input", async () => {
    const user = userEvent.setup()
    render(<TestCommand />)
    await user.type(screen.getByPlaceholderText("Search…"), "alpha")
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    // Beta should be hidden — cmdk marks filtered-out items with aria-hidden or hidden
    const betaEl = screen.queryByText("Beta")
    if (betaEl) {
      const itemEl = betaEl.closest("[data-slot=command-item]")
      const isHidden =
        itemEl?.getAttribute("aria-hidden") === "true" ||
        itemEl?.getAttribute("hidden") !== null ||
        itemEl?.getAttribute("class")?.includes("hidden")
      expect(isHidden).toBe(true)
    }
  })

  it("shows CommandEmpty when no results match", async () => {
    const user = userEvent.setup()
    render(<TestCommand />)
    await user.type(screen.getByPlaceholderText("Search…"), "zzzzz")
    expect(screen.getByText("No results found.")).toBeInTheDocument()
  })

  // ── Item click ────────────────────────────────────────────────────────────

  it("calls onSelect when an item is clicked", async () => {
    const onSelectAlpha = jest.fn()
    const user = userEvent.setup()
    render(<TestCommand onSelectAlpha={onSelectAlpha} />)
    await user.click(screen.getByText("Alpha"))
    expect(onSelectAlpha).toHaveBeenCalledWith("alpha")
  })

  // ── Keyboard navigation ───────────────────────────────────────────────────

  it("highlights an item after ArrowDown key", async () => {
    const user = userEvent.setup()
    render(<TestCommand />)
    await user.click(screen.getByPlaceholderText("Search…"))
    await user.keyboard("{ArrowDown}")
    const items = document.querySelectorAll("[data-slot=command-item]")
    const selectedItems = Array.from(items).filter(
      (el) => el.getAttribute("data-selected") === "true"
    )
    expect(selectedItems.length).toBeGreaterThan(0)
  })

  it("selects item with Enter key after navigating down", async () => {
    const onSelectAlpha = jest.fn()
    const onSelectBeta = jest.fn()
    const user = userEvent.setup()
    render(<TestCommand onSelectAlpha={onSelectAlpha} onSelectBeta={onSelectBeta} />)
    await user.click(screen.getByPlaceholderText("Search…"))
    await user.keyboard("{ArrowDown}")
    await user.keyboard("{Enter}")
    expect(onSelectAlpha.mock.calls.length + onSelectBeta.mock.calls.length).toBeGreaterThan(0)
  })

  // ── Disabled items ────────────────────────────────────────────────────────

  it("disabled item has data-disabled=true", () => {
    render(<TestCommand includeDisabled />)
    const gammaItem = screen.getByText("Gamma").closest("[data-slot=command-item]")
    expect(gammaItem).toHaveAttribute("data-disabled", "true")
  })

  // ── Shortcut ──────────────────────────────────────────────────────────────

  it("renders keyboard shortcut text", () => {
    render(<TestCommand />)
    expect(screen.getByText("⌘B")).toBeInTheDocument()
  })

  // ── className merging ─────────────────────────────────────────────────────

  it("merges custom className onto Command root", () => {
    render(
      <Command className="custom-root">
        <CommandList>
          <CommandEmpty>empty</CommandEmpty>
        </CommandList>
      </Command>
    )
    const root = document.querySelector("[data-slot=command]")
    expect(root).toHaveClass("custom-root")
  })
})
