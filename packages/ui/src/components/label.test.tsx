import * as React from "react"
import { render, screen } from "@testing-library/react"
import { Label } from "./label"

describe("Label", () => {
  it("renders label text", () => {
    render(<Label>Organization name</Label>)
    expect(screen.getByText("Organization name")).toBeInTheDocument()
  })

  it("associates with a form control via htmlFor", () => {
    render(
      <>
        <Label htmlFor="org-name">Organization name</Label>
        <input id="org-name" type="text" />
      </>
    )
    // getByLabelText finds the input by the label text, confirming association
    expect(screen.getByLabelText("Organization name")).toBeInTheDocument()
  })

  it("merges custom className", () => {
    render(<Label className="custom-class">Test</Label>)
    expect(screen.getByText("Test")).toHaveClass("custom-class")
  })
})
