import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionStepIcon,
} from "./accordion"

// ── Helpers ───────────────────────────────────────────────────────────────────

function SimpleAccordion({ defaultValue }: { defaultValue?: string }) {
  return (
    <Accordion type="single" collapsible defaultValue={defaultValue}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section One</AccordionTrigger>
        <AccordionContent>Content One</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section Two</AccordionTrigger>
        <AccordionContent>Content Two</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

// ── Open / close interaction ──────────────────────────────────────────────────

describe("Accordion", () => {
  it("expands content when trigger is clicked", async () => {
    const user = userEvent.setup()
    render(<SimpleAccordion />)
    const trigger = screen.getByRole("button", { name: "Section One" })
    await user.click(trigger)
    expect(screen.getByText("Content One")).toBeVisible()
  })

  it("collapses content when trigger is clicked again (collapsible)", async () => {
    const user = userEvent.setup()
    render(<SimpleAccordion defaultValue="item-1" />)
    const trigger = screen.getByRole("button", { name: "Section One" })
    await user.click(trigger)
    expect(trigger).toHaveAttribute("data-state", "closed")
  })

  it("shows content for default-open item", () => {
    render(<SimpleAccordion defaultValue="item-1" />)
    expect(screen.getByText("Content One")).toBeInTheDocument()
  })

  it("allows multiple items open simultaneously with type='multiple'", async () => {
    const user = userEvent.setup()
    render(
      <Accordion type="multiple">
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>B</AccordionTrigger>
          <AccordionContent>Content B</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    await user.click(screen.getByRole("button", { name: "A" }))
    await user.click(screen.getByRole("button", { name: "B" }))
    expect(screen.getByText("Content A")).toBeVisible()
    expect(screen.getByText("Content B")).toBeVisible()
  })

  // ── Keyboard navigation ───────────────────────────────────────────────────

  it("opens item when Enter is pressed on focused trigger", async () => {
    const user = userEvent.setup()
    render(<SimpleAccordion />)
    const trigger = screen.getByRole("button", { name: "Section One" })
    trigger.focus()
    await user.keyboard("{Enter}")
    expect(screen.getByText("Content One")).toBeVisible()
  })

  it("opens item when Space is pressed on focused trigger", async () => {
    const user = userEvent.setup()
    render(<SimpleAccordion />)
    const trigger = screen.getByRole("button", { name: "Section One" })
    trigger.focus()
    await user.keyboard(" ")
    expect(screen.getByText("Content One")).toBeVisible()
  })

  // ── Trigger slots ─────────────────────────────────────────────────────────

  it("renders subtitle when passed to AccordionTrigger", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="x">
          <AccordionTrigger subtitle="Step subtitle text">Title</AccordionTrigger>
          <AccordionContent>C</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    expect(screen.getByText("Step subtitle text")).toBeInTheDocument()
  })

  it("renders badge slot when passed to AccordionTrigger", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="x">
          <AccordionTrigger badge={<span>Complete</span>}>Title</AccordionTrigger>
          <AccordionContent>C</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    expect(screen.getByText("Complete")).toBeInTheDocument()
  })

  // ── Stepper variant — stepState ───────────────────────────────────────────

  it("disables AccordionItem when stepState='locked'", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="x" stepState="locked">
          <AccordionTrigger>Locked Step</AccordionTrigger>
          <AccordionContent>C</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    expect(screen.getByRole("button", { name: "Locked Step" })).toHaveAttribute("data-disabled")
  })

  it("does not expand a locked step when clicked", async () => {
    const user = userEvent.setup()
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="x" stepState="locked">
          <AccordionTrigger>Locked Step</AccordionTrigger>
          <AccordionContent>Locked content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    await user.click(screen.getByRole("button", { name: "Locked Step" }))
    // Locked trigger remains closed — data-state stays "closed"
    expect(screen.getByRole("button", { name: "Locked Step" })).toHaveAttribute("data-state", "closed")
  })

  it("exposes data-step-state on AccordionItem", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="x" stepState="active">
          <AccordionTrigger>Active Step</AccordionTrigger>
          <AccordionContent>C</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    const item = screen.getByRole("button", { name: "Active Step" }).closest("[data-slot='accordion-item']")
    expect(item).toHaveAttribute("data-step-state", "active")
  })

  // ── AccordionStepIcon ─────────────────────────────────────────────────────

  it("renders custom icon for non-completed stepState", () => {
    render(
      <AccordionStepIcon stepState="active" icon={<span>2</span>} />
    )
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("renders a checkmark (svg) for completed stepState", () => {
    const { container } = render(<AccordionStepIcon stepState="completed" />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })
})
