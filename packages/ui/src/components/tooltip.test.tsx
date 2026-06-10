import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

function renderTooltip(
  contentProps?: Partial<React.ComponentProps<typeof TooltipContent>>,
  triggerProps?: Partial<React.ComponentProps<typeof TooltipTrigger>>
) {
  return render(
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger {...triggerProps}>Trigger</TooltipTrigger>
        <TooltipContent data-testid="tooltip-content" {...contentProps}>
          Tooltip label
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

describe("Tooltip", () => {
  it("renders trigger and content when open", () => {
    renderTooltip()
    expect(screen.getByText("Trigger")).toBeInTheDocument()
    // Radix renders a hidden role="tooltip" span with the same text;
    // verify at least one element with the text is in the document.
    expect(screen.getAllByText("Tooltip label").length).toBeGreaterThanOrEqual(1)
  })

  it("has role=tooltip on the content", () => {
    renderTooltip()
    expect(screen.getByRole("tooltip")).toBeInTheDocument()
  })

  it("shows tooltip content on hover", async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Helpful info</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    await user.hover(screen.getByText("Hover me"))
    expect(await screen.findByRole("tooltip")).toBeInTheDocument()
  })

  it("merges custom className with base classes", () => {
    renderTooltip({ className: "custom-class" })
    expect(screen.getByTestId("tooltip-content")).toHaveClass("custom-class")
  })

  it("accepts variant prop without error", () => {
    expect(() => renderTooltip({ variant: "truncation" })).not.toThrow()
  })

  it("accepts sideOffset prop without error", () => {
    expect(() => renderTooltip({ sideOffset: 8 })).not.toThrow()
  })

  it("renders with custom delayDuration in provider", () => {
    expect(() =>
      render(
        <TooltipProvider delayDuration={200}>
          <Tooltip defaultOpen>
            <TooltipTrigger>T</TooltipTrigger>
            <TooltipContent>Label</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    ).not.toThrow()
  })
})
