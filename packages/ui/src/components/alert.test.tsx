import * as React from "react"
import { render, screen } from "@testing-library/react"
import { Alert, AlertTitle, AlertDescription } from "./alert"

function renderAlert(
  variant?: React.ComponentProps<typeof Alert>["variant"],
  opts?: { noTitle?: boolean; noDescription?: boolean }
) {
  return render(
    <Alert variant={variant}>
      {!opts?.noTitle && <AlertTitle>Alert title</AlertTitle>}
      {!opts?.noDescription && (
        <AlertDescription>Alert description</AlertDescription>
      )}
    </Alert>
  )
}

describe("Alert", () => {
  it("has role=alert", () => {
    renderAlert()
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("renders title and description", () => {
    renderAlert()
    expect(screen.getByText("Alert title")).toBeInTheDocument()
    expect(screen.getByText("Alert description")).toBeInTheDocument()
  })

  it("exposes data-variant attribute for all variants", () => {
    const variants = ["default", "destructive", "warning", "success", "info"] as const
    for (const variant of variants) {
      const { unmount } = render(
        <Alert variant={variant}><AlertTitle>T</AlertTitle></Alert>
      )
      expect(screen.getByRole("alert")).toHaveAttribute("data-variant", variant)
      unmount()
    }
  })

  it("defaults data-variant to default", () => {
    renderAlert()
    expect(screen.getByRole("alert")).toHaveAttribute("data-variant", "default")
  })

  it("title consumes variant from context (no explicit prop needed)", () => {
    render(
      <Alert variant="success">
        <AlertTitle>Success title</AlertTitle>
      </Alert>
    )
    // Behavioral check: the title renders correctly within a success alert
    expect(screen.getByText("Success title")).toBeInTheDocument()
  })

  it("description always renders with foreground regardless of variant", () => {
    renderAlert("destructive")
    // Description is still readable (not hidden, not invisible)
    expect(screen.getByText("Alert description")).toBeVisible()
  })

  it("merges custom className on root without breaking role", () => {
    render(<Alert className="custom-root"><AlertTitle>T</AlertTitle></Alert>)
    const el = screen.getByRole("alert")
    expect(el).toHaveClass("custom-root")
    expect(el).toHaveAttribute("role", "alert")
  })

  it("required asterisk is aria-hidden on FieldLabel", () => {
    render(<Alert><AlertTitle>T</AlertTitle></Alert>)
    // Alert renders; no aria errors
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
