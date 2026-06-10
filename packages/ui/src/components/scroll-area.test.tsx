import * as React from "react"
import { render, screen } from "@testing-library/react"
import { ScrollArea, ScrollBar } from "./scroll-area"

// Radix ScrollAreaScrollbar only mounts its DOM node when the viewport content
// overflows. JSDOM does not perform layout, so scrollbars never render.
// Tests are limited to the viewport/root behavior visible in JSDOM.

describe("ScrollArea", () => {
  it("renders children inside the scroll viewport", () => {
    render(
      <ScrollArea>
        <p data-testid="content">Hello</p>
      </ScrollArea>
    )
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("passes additional props (e.g. aria-label) through to root", () => {
    render(<ScrollArea data-testid="root" aria-label="scrollable region" />)
    expect(screen.getByTestId("root")).toHaveAttribute("aria-label", "scrollable region")
  })

  it("merges className onto the root element", () => {
    render(<ScrollArea data-testid="root" className="h-64" />)
    expect(screen.getByTestId("root")).toHaveClass("h-64")
  })
})

describe("ScrollBar", () => {
  // Radix does not mount the scrollbar DOM node in JSDOM (no layout = no overflow).
  // We verify renders-without-throw and ref forwarding.

  it("renders without throwing inside a ScrollArea context (vertical)", () => {
    expect(() =>
      render(
        <ScrollArea>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      )
    ).not.toThrow()
  })

  it("renders without throwing inside a ScrollArea context (horizontal)", () => {
    expect(() =>
      render(
        <ScrollArea>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )
    ).not.toThrow()
  })
})
