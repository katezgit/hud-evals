import * as React from "react"
import { render, screen } from "@testing-library/react"
import { Skeleton } from "./skeleton"

describe("Skeleton", () => {
  it("is aria-hidden by default (decorative loading placeholder)", () => {
    render(<Skeleton data-testid="skel" />)
    expect(screen.getByTestId("skel")).toHaveAttribute("aria-hidden", "true")
  })

  it("applies custom className", () => {
    render(<Skeleton data-testid="skel" className="h-4 w-3/4" />)
    const el = screen.getByTestId("skel")
    expect(el).toHaveClass("h-4")
    expect(el).toHaveClass("w-3/4")
  })

  it("renders bg-border and animate-pulse classes (Instrument Precision v1)", () => {
    render(<Skeleton data-testid="skel" />)
    const el = screen.getByTestId("skel")
    expect(el).toHaveClass("bg-border")
    expect(el).toHaveClass("animate-pulse")
  })

  it("carries no inline backgroundImage style", () => {
    render(<Skeleton data-testid="skel" />)
    const el = screen.getByTestId("skel")
    expect(el.style.backgroundImage).toBe("")
  })

  it("passes through additional props", () => {
    render(<Skeleton data-testid="skel" role="presentation" />)
    expect(screen.getByTestId("skel")).toHaveAttribute("role", "presentation")
  })
})
