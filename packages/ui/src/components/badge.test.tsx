import * as React from "react"
import { render, screen } from "@testing-library/react"
import { Badge } from "./badge"

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Running</Badge>)
    expect(screen.getByText("Running")).toBeInTheDocument()
  })

  it("renders all variants without error", () => {
    const variants = ["success", "running", "info", "beta", "warning", "destructive", "neutral"] as const
    for (const variant of variants) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>)
      expect(screen.getByText(variant)).toBeInTheDocument()
      unmount()
    }
  })

  it("defaults to neutral variant", () => {
    render(<Badge>Tag</Badge>)
    expect(screen.getByText("Tag")).toHaveAttribute("data-variant", "neutral")
  })

  it("exposes data-variant attribute", () => {
    render(<Badge variant="success">Done</Badge>)
    expect(screen.getByText("Done")).toHaveAttribute("data-variant", "success")
  })

  // ── Status dot ────────────────────────────────────────────────────────────

  it("does not render dot by default", () => {
    const { container } = render(<Badge variant="success">Done</Badge>)
    expect(container.querySelector("[aria-hidden='true']")).not.toBeInTheDocument()
  })

  it("renders dot when showDot=true for success variant", () => {
    const { container } = render(<Badge variant="success" showDot>Done</Badge>)
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument()
  })

  it("renders dot when showDot=true for running variant", () => {
    const { container } = render(<Badge variant="running" showDot>Live</Badge>)
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument()
  })

  it("does not render dot for info variant even when showDot=true", () => {
    const { container } = render(<Badge variant="info" showDot>Beta</Badge>)
    expect(container.querySelector("[aria-hidden='true']")).not.toBeInTheDocument()
  })

  it("does not render dot for neutral variant even when showDot=true", () => {
    const { container } = render(<Badge variant="neutral" showDot>Tag</Badge>)
    expect(container.querySelector("[aria-hidden='true']")).not.toBeInTheDocument()
  })

  // ── Icon slot ─────────────────────────────────────────────────────────────

  it("renders a leading icon as a child alongside the label", () => {
    render(
      <Badge variant="warning">
        <svg data-testid="icon" aria-hidden="true" />
        Limit
      </Badge>
    )
    expect(screen.getByTestId("icon")).toBeInTheDocument()
    expect(screen.getByText("Limit")).toBeInTheDocument()
  })

  // ── className merging ─────────────────────────────────────────────────────

  it("merges custom className", () => {
    render(<Badge className="custom-class">Label</Badge>)
    expect(screen.getByText("Label")).toHaveClass("custom-class")
  })
})
