import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import { Stepper } from "./stepper"

// Helper: grab each <li> from the desktop <ol role="list">.
// The mobile <div role="group"> shares the aria-label but has role="group",
// so getByRole("list") unambiguously targets the <ol>.
function getStepItems() {
  const list = screen.getByRole("list")
  return within(list).getAllByRole("listitem")
}

const THREE_STEPS = [
  { label: "Alpha" },
  { label: "Beta" },
  { label: "Gamma" },
]

describe("Stepper", () => {
  // ── Rendering ───────────────────────────────────────────────────────────────

  it("renders all step labels", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [alpha, beta, gamma] = getStepItems()
    expect(within(alpha!).getByText("Alpha")).toBeInTheDocument()
    expect(within(beta!).getByText("Beta")).toBeInTheDocument()
    expect(within(gamma!).getByText("Gamma")).toBeInTheDocument()
  })

  // ── Active step (aria-current) ──────────────────────────────────────────────

  it("marks the current step's listitem with aria-current=step", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [, beta] = getStepItems()
    expect(beta).toHaveAttribute("aria-current", "step")
  })

  it("does not mark non-current steps with aria-current", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [alpha, , gamma] = getStepItems()
    expect(alpha).not.toHaveAttribute("aria-current")
    expect(gamma).not.toHaveAttribute("aria-current")
  })

  // ── Completed vs pending discriminator ─────────────────────────────────────
  // Completed steps render a <Check> SVG icon (no numeral).
  // Pending and active steps render a numeral (no SVG inside the circle).

  it("renders a check icon (no step numeral) for steps before currentStep", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [alpha] = getStepItems()
    // Step 1 (idx 0) is completed: circle has SVG, not the numeral "1"
    expect(alpha!.querySelector("svg")).not.toBeNull()
    expect(within(alpha!).queryByText("1")).toBeNull()
  })

  it("renders a numeral for the active step", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [, beta] = getStepItems()
    // Step 2 (idx 1) is active: numeral "2" present
    expect(within(beta!).getByText("2")).toBeInTheDocument()
  })

  it("renders a numeral for steps after currentStep (pending)", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={2} />)
    const [, , gamma] = getStepItems()
    // Step 3 (idx 2) is pending: numeral "3" present, no check SVG
    expect(within(gamma!).getByText("3")).toBeInTheDocument()
    expect(gamma!.querySelector("svg")).toBeNull()
  })

  // ── Boundary: first step active ────────────────────────────────────────────

  it("marks first step active and all others pending when currentStep=1", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={1} />)
    const [alpha, beta, gamma] = getStepItems()
    expect(alpha).toHaveAttribute("aria-current", "step")
    expect(beta).not.toHaveAttribute("aria-current")
    expect(gamma).not.toHaveAttribute("aria-current")
    // No completed steps → no SVG icons
    expect(alpha!.querySelector("svg")).toBeNull()
    expect(beta!.querySelector("svg")).toBeNull()
    expect(gamma!.querySelector("svg")).toBeNull()
  })

  // ── Boundary: last step active ─────────────────────────────────────────────

  it("marks last step active and all prior steps completed when currentStep=steps.length", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={3} />)
    const [alpha, beta, gamma] = getStepItems()
    expect(gamma).toHaveAttribute("aria-current", "step")
    // Steps 1 and 2 are completed → check icons
    expect(alpha!.querySelector("svg")).not.toBeNull()
    expect(beta!.querySelector("svg")).not.toBeNull()
    // Last step is active → numeral, no check icon
    expect(gamma!.querySelector("svg")).toBeNull()
    expect(within(gamma!).getByText("3")).toBeInTheDocument()
  })

  // ── Description ────────────────────────────────────────────────────────────

  it("renders the description when provided", () => {
    render(
      <Stepper
        steps={[{ label: "Alpha", description: "Alpha desc" }, { label: "Beta" }]}
        currentStep={1}
      />,
    )
    // Scope to the desktop list to avoid the mobile summary section
    const list = screen.getByRole("list")
    expect(within(list).getByText("Alpha desc")).toBeInTheDocument()
  })

  it("does not render a description element when description is omitted", () => {
    render(
      <Stepper
        steps={[{ label: "Alpha", description: "Alpha desc" }, { label: "Beta" }]}
        currentStep={1}
      />,
    )
    const [, beta] = getStepItems()
    // Beta step has no description
    expect(within(beta!).queryByText(/desc/i)).toBeNull()
  })

  // ── className passthrough ──────────────────────────────────────────────────

  it("merges custom className onto the root element", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={1} className="custom-stepper" />)
    // Root is the wrapping <div>; locate it as the closest ancestor of the list
    const list = screen.getByRole("list")
    expect(list.closest("div.custom-stepper")).not.toBeNull()
  })

  // ── Edge: currentStep < 1 (out of lower bound) ────────────────────────────
  // Source: activeIndex = 0 - 1 = -1. isActive never true; isCompleted (idx < -1)
  // never true → all steps are pending, none active.

  it("renders all steps as pending with no active step when currentStep=0", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={0} />)
    const items = getStepItems()
    items.forEach((item) => {
      expect(item).not.toHaveAttribute("aria-current")
      expect(item.querySelector("svg")).toBeNull()
    })
  })

  // ── Edge: currentStep > steps.length (out of upper bound) ─────────────────
  // Source: activeIndex = steps.length (e.g. 3 for a 3-step array).
  // isActive (idx === 3) never true; isCompleted (idx < 3) true for all → all completed.

  it("renders all steps as completed with no active step when currentStep exceeds steps.length", () => {
    render(<Stepper steps={THREE_STEPS} currentStep={4} />)
    const items = getStepItems()
    items.forEach((item) => {
      expect(item).not.toHaveAttribute("aria-current")
      expect(item.querySelector("svg")).not.toBeNull()
    })
  })
})
