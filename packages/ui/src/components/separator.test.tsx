import * as React from "react"
import { render, screen } from "@testing-library/react"
import { Separator } from "./separator"

describe("Separator", () => {
  it("is decorative by default: role=none", () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByTestId("sep")).toHaveAttribute("role", "none")
  })

  it("is semantic when decorative=false: role=separator", () => {
    render(<Separator decorative={false} />)
    expect(screen.getByRole("separator")).toBeInTheDocument()
  })

  it("sets aria-orientation=vertical for semantic vertical separator", () => {
    render(<Separator decorative={false} orientation="vertical" />)
    const sep = screen.getByRole("separator")
    expect(sep).toHaveAttribute("aria-orientation", "vertical")
  })

  it("merges custom className", () => {
    render(<Separator data-testid="sep" className="my-custom" />)
    expect(screen.getByTestId("sep")).toHaveClass("my-custom")
  })
})
