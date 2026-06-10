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
})
