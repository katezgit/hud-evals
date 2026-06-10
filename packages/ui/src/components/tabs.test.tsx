import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"

// ── Helpers ───────────────────────────────────────────────────────────────────

function SimpleTabs({ defaultValue = "tab-a" }: { defaultValue?: string }) {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTrigger value="tab-a">Tab A</TabsTrigger>
        <TabsTrigger value="tab-b">Tab B</TabsTrigger>
        <TabsTrigger value="tab-c">Tab C</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-a">Content A</TabsContent>
      <TabsContent value="tab-b">Content B</TabsContent>
      <TabsContent value="tab-c">Content C</TabsContent>
    </Tabs>
  )
}

describe("Tabs", () => {
  // ── Render ────────────────────────────────────────────────────────────────

  it("renders all tab triggers as tabs", () => {
    render(<SimpleTabs />)
    expect(screen.getByRole("tab", { name: "Tab A" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Tab B" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Tab C" })).toBeInTheDocument()
  })

  it("shows the default active tab's content", () => {
    render(<SimpleTabs defaultValue="tab-a" />)
    expect(screen.getByText("Content A")).toBeVisible()
  })

  it("hides non-active tab panels", () => {
    render(<SimpleTabs defaultValue="tab-a" />)
    // Content B is in the DOM but not visible (Radix hides inactive panels)
    expect(screen.getByRole("tab", { name: "Tab B" })).toHaveAttribute("data-state", "inactive")
  })

  // ── Interaction ───────────────────────────────────────────────────────────

  it("shows new content panel after tab switch", async () => {
    const user = userEvent.setup()
    render(<SimpleTabs defaultValue="tab-a" />)
    await user.click(screen.getByRole("tab", { name: "Tab B" }))
    expect(screen.getByText("Content B")).toBeVisible()
  })

  it("marks clicked tab as active", async () => {
    const user = userEvent.setup()
    render(<SimpleTabs defaultValue="tab-a" />)
    await user.click(screen.getByRole("tab", { name: "Tab B" }))
    expect(screen.getByRole("tab", { name: "Tab B" })).toHaveAttribute("data-state", "active")
    expect(screen.getByRole("tab", { name: "Tab A" })).toHaveAttribute("data-state", "inactive")
  })

  // ── Keyboard navigation ───────────────────────────────────────────────────

  it("navigates between triggers with arrow keys", async () => {
    const user = userEvent.setup()
    render(<SimpleTabs defaultValue="tab-a" />)
    await user.click(screen.getByRole("tab", { name: "Tab A" }))
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Tab B" })).toHaveFocus()
  })

  // ── Disabled ─────────────────────────────────────────────────────────────

  it("does not switch to a disabled tab on click", async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab-a">
        <TabsList>
          <TabsTrigger value="tab-a">Active</TabsTrigger>
          <TabsTrigger value="tab-b" disabled>Future Step</TabsTrigger>
        </TabsList>
        <TabsContent value="tab-a">Content A</TabsContent>
        <TabsContent value="tab-b">Content B</TabsContent>
      </Tabs>
    )
    await user.click(screen.getByRole("tab", { name: "Future Step" }))
    expect(screen.getByRole("tab", { name: "Active" })).toHaveAttribute("data-state", "active")
  })

  it("disabled tab is not interactive", () => {
    render(
      <Tabs defaultValue="tab-a">
        <TabsList>
          <TabsTrigger value="tab-a">Active</TabsTrigger>
          <TabsTrigger value="tab-b" disabled>Future Step</TabsTrigger>
        </TabsList>
        <TabsContent value="tab-a">Content A</TabsContent>
        <TabsContent value="tab-b">Content B</TabsContent>
      </Tabs>
    )
    expect(screen.getByRole("tab", { name: "Future Step" })).toBeDisabled()
  })

  // ── Controlled value ──────────────────────────────────────────────────────

  it("respects controlled value prop", () => {
    const { rerender } = render(
      <Tabs value="tab-a" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="tab-a">A</TabsTrigger>
          <TabsTrigger value="tab-b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="tab-a">Content A</TabsContent>
        <TabsContent value="tab-b">Content B</TabsContent>
      </Tabs>
    )
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("data-state", "active")

    rerender(
      <Tabs value="tab-b" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="tab-a">A</TabsTrigger>
          <TabsTrigger value="tab-b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="tab-a">Content A</TabsContent>
        <TabsContent value="tab-b">Content B</TabsContent>
      </Tabs>
    )
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("data-state", "active")
  })
})
