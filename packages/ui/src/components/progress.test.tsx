import * as React from "react"
import { render, screen } from "@testing-library/react"
import { Progress } from "./progress"

describe("Progress", () => {
  // ── Accessibility ─────────────────────────────────────────────────────────

  it("exposes aria-valuenow for determinate values", () => {
    render(<Progress data-testid="track" value={60} max={100} />)
    expect(screen.getByTestId("track")).toHaveAttribute("aria-valuenow", "60")
  })

  it("omits aria-valuenow when value is undefined (indeterminate)", () => {
    render(<Progress data-testid="track" />)
    expect(screen.getByTestId("track")).not.toHaveAttribute("aria-valuenow")
  })

  // ── Label ─────────────────────────────────────────────────────────────────

  it("renders label text when label prop is provided", () => {
    render(<Progress value={30} label="3 of 10 complete" />)
    expect(screen.getByText("3 of 10 complete")).toBeInTheDocument()
  })

  it("does not render label when label is omitted", () => {
    render(<Progress value={30} />)
    expect(screen.queryByText(/of/)).not.toBeInTheDocument()
  })

  // ── Fill state data attributes (used by CSS token selectors) ─────────────

  it("indicator has data-state=running at partial value", () => {
    render(<Progress value={50} />)
    const indicator = document.querySelector("[data-slot='progress-indicator']")
    expect(indicator).toHaveAttribute("data-state", "running")
  })

  it("indicator has data-state=complete at value === max", () => {
    render(<Progress value={100} max={100} />)
    const indicator = document.querySelector("[data-slot='progress-indicator']")
    expect(indicator).toHaveAttribute("data-state", "complete")
  })

  it("indicator has data-state=indeterminate when value is undefined", () => {
    render(<Progress />)
    const indicator = document.querySelector("[data-slot='progress-indicator']")
    expect(indicator).toHaveAttribute("data-state", "indeterminate")
  })

  // ── Fill width ────────────────────────────────────────────────────────────

  it("sets width style proportionally for determinate value", () => {
    render(<Progress value={50} max={100} />)
    const indicator = document.querySelector("[data-slot='progress-indicator']") as HTMLElement
    expect(indicator.style.width).toBe("50%")
  })

  it("sets width style to 100% at max value", () => {
    render(<Progress value={100} max={100} />)
    const indicator = document.querySelector("[data-slot='progress-indicator']") as HTMLElement
    expect(indicator.style.width).toBe("100%")
  })

  it("clamps fill width to 0% for value=0", () => {
    render(<Progress value={0} />)
    const indicator = document.querySelector("[data-slot='progress-indicator']") as HTMLElement
    expect(indicator.style.width).toBe("0%")
  })

  it("does not set inline width for indeterminate (animated via CSS)", () => {
    render(<Progress />)
    const indicator = document.querySelector("[data-slot='progress-indicator']") as HTMLElement
    expect(indicator.style.width).toBe("")
  })

  // ── className merging ─────────────────────────────────────────────────────

  it("merges custom className onto the track", () => {
    render(<Progress data-testid="track" value={40} className="my-custom-class" />)
    expect(screen.getByTestId("track")).toHaveClass("my-custom-class")
  })

  // ── neutral state ─────────────────────────────────────────────────────────

  it("neutral state applies bg-progress-fill-neutral fill class to the indicator", () => {
    render(<Progress state="neutral" value={50} aria-label="neutral progress" />)
    const indicator = document.querySelector("[data-slot='progress-indicator']")
    expect(indicator).toHaveClass("bg-progress-fill-neutral")
  })

  it("neutral state at value===max does not receive the complete glow class", () => {
    render(<Progress state="neutral" value={100} max={100} aria-label="neutral complete" />)
    const indicator = document.querySelector("[data-slot='progress-indicator']")
    expect(indicator).not.toHaveClass("shadow-[0_0_8px_var(--color-primary-glow)]") // eslint-disable-line no-restricted-syntax -- asserts on the same bespoke glow class disabled in progress.tsx
  })

  it("default state at value===max receives the complete glow class", () => {
    render(<Progress state="default" value={100} max={100} aria-label="default complete" />)
    const indicator = document.querySelector("[data-slot='progress-indicator']")
    expect(indicator).toHaveClass("shadow-[0_0_8px_var(--color-primary-glow)]") // eslint-disable-line no-restricted-syntax -- asserts on the same bespoke glow class disabled in progress.tsx
  })

  it("neutral state exposes correct ARIA semantics", () => {
    render(<Progress state="neutral" value={42} aria-label="MoE" />)
    const bar = screen.getByRole("progressbar", { name: "MoE" })
    expect(bar).toHaveAttribute("aria-valuenow", "42")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
  })
})
