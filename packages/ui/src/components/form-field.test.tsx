import * as React from "react"
import { render, screen } from "@testing-library/react"
import { FormField, FieldLabel, FieldHelper, FieldError } from "./form-field"
import { Input } from "./input"
import { Textarea } from "./textarea"

function BasicField(props: Partial<React.ComponentProps<typeof FormField>>) {
  return (
    <FormField id="test-field" label="Organization name" {...props}>
      <Input />
    </FormField>
  )
}

describe("FormField", () => {
  // ── Label association ─────────────────────────────────────────────────────

  it("renders the label text", () => {
    render(<BasicField />)
    expect(screen.getByText("Organization name")).toBeInTheDocument()
  })

  it("associates label with control via id", () => {
    render(<BasicField />)
    // getByLabelText proves the label-to-input association works
    expect(screen.getByLabelText("Organization name")).toBeInTheDocument()
  })

  // ── Helper text ───────────────────────────────────────────────────────────

  it("renders helper text when provided", () => {
    render(<BasicField helper="Use a unique name" />)
    expect(screen.getByText("Use a unique name")).toBeInTheDocument()
  })

  it("wires aria-describedby to helper id", () => {
    render(<BasicField helper="Some hint" />)
    const input = screen.getByRole("textbox")
    expect(input).toHaveAttribute("aria-describedby", "test-field-helper")
  })

  // ── Error state ───────────────────────────────────────────────────────────

  it("renders error message when provided", () => {
    render(<BasicField error="This field is required" />)
    expect(screen.getByText("This field is required")).toBeInTheDocument()
  })

  it("sets aria-invalid on the control when error is provided", () => {
    render(<BasicField error="Required" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
  })

  it("error message has role=alert", () => {
    render(<BasicField error="Required" />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("wires aria-describedby to error id when error is present", () => {
    render(<BasicField error="Required" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "test-field-error")
  })

  // ── Error replaces helper ─────────────────────────────────────────────────

  it("error replaces helper when both are provided", () => {
    render(<BasicField helper="Use a unique name" error="This field is required" />)
    expect(screen.queryByText("Use a unique name")).not.toBeInTheDocument()
    expect(screen.getByText("This field is required")).toBeInTheDocument()
  })

  it("error describedby takes precedence over helper describedby", () => {
    render(<BasicField helper="hint" error="Required" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "test-field-error")
  })

  // ── Required indicator ────────────────────────────────────────────────────

  it("renders asterisk when required is true", () => {
    render(<BasicField required />)
    const label = screen.getByText("Organization name").closest("label")
    expect(label?.textContent).toContain("*")
  })

  it("does not render asterisk when required is false", () => {
    render(<BasicField />)
    const label = screen.getByText("Organization name").closest("label")
    expect(label?.textContent).not.toContain("*")
  })

  // ── Textarea as child ─────────────────────────────────────────────────────

  it("works with Textarea as the form control", () => {
    render(
      <FormField id="desc" label="Description" error="Too short">
        <Textarea />
      </FormField>
    )
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  // ── className merging ─────────────────────────────────────────────────────

  it("merges custom className on the container", () => {
    render(<BasicField className="my-custom-class" />)
    const container = screen.getByRole("textbox").closest("[data-slot='form-field']")
    expect(container).toHaveClass("my-custom-class")
  })
})

describe("FieldLabel", () => {
  it("renders label text", () => {
    render(<FieldLabel>Environment name</FieldLabel>)
    expect(screen.getByText("Environment name")).toBeInTheDocument()
  })

  it("renders required asterisk when required is true", () => {
    render(<FieldLabel required>Name</FieldLabel>)
    const el = screen.getByText("Name").closest("label")
    expect(el?.textContent).toContain("*")
  })

  it("asterisk is aria-hidden", () => {
    render(<FieldLabel required>Name</FieldLabel>)
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true")
  })
})

describe("FieldHelper", () => {
  it("renders helper text", () => {
    render(<FieldHelper>Must be unique</FieldHelper>)
    expect(screen.getByText("Must be unique")).toBeInTheDocument()
  })
})

describe("FieldError", () => {
  it("renders error text", () => {
    render(<FieldError>Required field</FieldError>)
    expect(screen.getByText("Required field")).toBeInTheDocument()
  })

  it("has role=alert", () => {
    render(<FieldError>Required</FieldError>)
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("renders an aria-hidden error icon", () => {
    render(<FieldError>err</FieldError>)
    const svg = screen.getByRole("alert").querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute("aria-hidden", "true")
  })
})
