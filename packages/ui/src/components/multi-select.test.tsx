import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MultiSelect } from "./multi-select"

// cmdk calls scrollIntoView on selected items — jsdom does not implement it.
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => {}
})

const OPTIONS = [
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
  { value: "delta", label: "Delta" },
  { value: "epsilon", label: "Epsilon", disabled: true },
]

function ControlledMultiSelect({
  initialValue = [],
  maxChips,
  disabled,
  size,
}: {
  initialValue?: string[]
  maxChips?: number
  disabled?: boolean
  size?: "sm" | "md"
}) {
  const [value, setValue] = React.useState<string[]>(initialValue)
  return (
    <MultiSelect
      options={OPTIONS}
      value={value}
      onValueChange={setValue}
      placeholder="Filter by tag…"
      searchPlaceholder="Search tags…"
      emptyText="No tag found."
      maxChips={maxChips}
      disabled={disabled}
      size={size}
    />
  )
}

function getListItem(label: string): HTMLElement {
  return screen
    .getAllByText(label)
    .map((el) => el.closest("[data-slot=multi-select-item]"))
    .find(Boolean) as HTMLElement
}

describe("MultiSelect", () => {
  // ── Render ─────────────────────────────────────────────────────────────────

  it("renders the trigger with role=combobox", () => {
    render(<ControlledMultiSelect />)
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("shows placeholder when value is empty", () => {
    render(<ControlledMultiSelect />)
    expect(screen.getByText("Filter by tag…")).toBeInTheDocument()
  })

  it("shows selected values in the trigger", () => {
    render(<ControlledMultiSelect initialValue={["alpha", "beta"]} />)
    expect(screen.getByText("Alpha, Beta")).toBeInTheDocument()
  })

  it("trigger is disabled when disabled prop is true", () => {
    render(<ControlledMultiSelect disabled />)
    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  // ── Opens popover ──────────────────────────────────────────────────────────

  it("opens dropdown and shows search input on click", async () => {
    const user = userEvent.setup()
    render(<ControlledMultiSelect />)
    await user.click(screen.getByRole("combobox"))
    expect(screen.getByPlaceholderText("Search tags…")).toBeInTheDocument()
  })

  it("shows all options including disabled when opened", async () => {
    const user = userEvent.setup()
    render(<ControlledMultiSelect />)
    await user.click(screen.getByRole("combobox"))
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Epsilon")).toBeInTheDocument()
  })

  // ── Toggling items ─────────────────────────────────────────────────────────

  it("clicking an item adds it to the selection", async () => {
    const user = userEvent.setup()
    render(<ControlledMultiSelect />)
    await user.click(screen.getByRole("combobox"))
    await user.click(getListItem("Alpha"))
    // Popover stays open; first combobox is the trigger button, second is cmdk search input
    const trigger = screen.getAllByRole("combobox")[0]
    expect(trigger).toHaveTextContent("Alpha")
  })

  it("clicking a selected item removes it", async () => {
    const user = userEvent.setup()
    render(<ControlledMultiSelect initialValue={["alpha"]} />)
    await user.click(screen.getByRole("combobox"))
    await user.click(getListItem("Alpha"))
    // Value removed — placeholder should be visible again
    expect(screen.getByText("Filter by tag…")).toBeInTheDocument()
  })

  it("popover stays open after item click (multi-mode)", async () => {
    const user = userEvent.setup()
    render(<ControlledMultiSelect />)
    await user.click(screen.getByRole("combobox"))
    await user.click(getListItem("Alpha"))
    expect(screen.getByPlaceholderText("Search tags…")).toBeInTheDocument()
  })

  it("disabled option has data-disabled=true", async () => {
    const user = userEvent.setup()
    render(<ControlledMultiSelect />)
    await user.click(screen.getByRole("combobox"))
    const epsilonItem = screen
      .getByText("Epsilon")
      .closest("[data-slot=multi-select-item]") as HTMLElement
    expect(epsilonItem).toHaveAttribute("data-disabled", "true")
  })

  // ── Select-all ─────────────────────────────────────────────────────────────

  it("select-all selects all visible non-disabled options", async () => {
    const user = userEvent.setup()
    render(<ControlledMultiSelect />)
    await user.click(screen.getByRole("combobox"))
    const selectAllItem = document.querySelector("[data-slot=multi-select-all]") as HTMLElement
    await user.click(selectAllItem)
    // 4 selectable options; default maxChips=2 so "Alpha, Beta" + "+2"
    expect(screen.getByText("Alpha, Beta")).toBeInTheDocument()
    expect(screen.getByText("+2")).toBeInTheDocument()
  })

  it("select-all label becomes Clear once all visible are selected", async () => {
    const user = userEvent.setup()
    render(<ControlledMultiSelect />)
    await user.click(screen.getByRole("combobox"))
    await user.click(document.querySelector("[data-slot=multi-select-all]") as HTMLElement)
    expect(screen.getByText("Clear")).toBeInTheDocument()
  })

  it("Clear removes all selected options", async () => {
    const user = userEvent.setup()
    render(
      <ControlledMultiSelect initialValue={["alpha", "beta", "gamma", "delta"]} />
    )
    await user.click(screen.getByRole("combobox"))
    expect(screen.getByText("Clear")).toBeInTheDocument()
    await user.click(document.querySelector("[data-slot=multi-select-all]") as HTMLElement)
    // All cleared — placeholder should be visible
    expect(screen.getByText("Filter by tag…")).toBeInTheDocument()
  })

  // ── Search + select-all ────────────────────────────────────────────────────

  it("select-all with active search only affects filtered options", async () => {
    const user = userEvent.setup()
    render(<ControlledMultiSelect />)
    await user.click(screen.getByRole("combobox"))
    await user.type(screen.getByPlaceholderText("Search tags…"), "alpha")
    await user.click(document.querySelector("[data-slot=multi-select-all]") as HTMLElement)
    // Trigger should show only Alpha (the single filtered+selected value)
    const trigger = screen.getAllByRole("combobox")[0]
    expect(trigger).toHaveTextContent("Alpha")
  })

  // ── Chip overflow ──────────────────────────────────────────────────────────

  it("shows +N overflow when selected count exceeds maxChips", () => {
    render(
      <ControlledMultiSelect initialValue={["alpha", "beta", "gamma"]} maxChips={2} />
    )
    expect(screen.getByText("Alpha, Beta")).toBeInTheDocument()
    expect(screen.getByText("+1")).toBeInTheDocument()
  })

  it("no overflow label when selected count equals maxChips", () => {
    render(
      <ControlledMultiSelect initialValue={["alpha", "beta"]} maxChips={2} />
    )
    expect(screen.getByText("Alpha, Beta")).toBeInTheDocument()
    expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument()
  })

  // ── Empty state ────────────────────────────────────────────────────────────

  it("shows empty text when search has no matches", async () => {
    const user = userEvent.setup()
    render(<ControlledMultiSelect />)
    await user.click(screen.getByRole("combobox"))
    await user.type(screen.getByPlaceholderText("Search tags…"), "zzzzz")
    expect(screen.getByText("No tag found.")).toBeInTheDocument()
  })

  // ── data-size ─────────────────────────────────────────────────────────────

  it("exposes data-size attribute when size=sm", () => {
    render(<ControlledMultiSelect size="sm" />)
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "sm")
  })
})
