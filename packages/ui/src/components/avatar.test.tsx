import * as React from "react"
import { render, screen } from "@testing-library/react"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"

describe("Avatar", () => {
  it("renders fallback text when image is absent", () => {
    render(
      <Avatar>
        <AvatarFallback>KZ</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText("KZ")).toBeInTheDocument()
  })

  // ── Variants: size (data-size is used by CSS token selectors) ────────────

  it.each([
    ["xs", "xs"],
    ["sm", "sm"],
    ["md", "md"],
    ["lg", "lg"],
  ] as const)("size=%s exposes data-size=%s", (size, expected) => {
    const { container } = render(
      <Avatar size={size}>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    )
    expect(container.firstChild).toHaveAttribute("data-size", expected)
  })

  it("defaults to md size", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    )
    expect(container.firstChild).toHaveAttribute("data-size", "md")
  })

  // ── Variants: shape (data-shape is used by CSS token selectors) ──────────

  it("exposes data-shape for circle", () => {
    const { container } = render(
      <Avatar shape="circle">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    )
    expect(container.firstChild).toHaveAttribute("data-shape", "circle")
  })

  it("exposes data-shape for square", () => {
    const { container } = render(
      <Avatar shape="square">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    )
    expect(container.firstChild).toHaveAttribute("data-shape", "square")
  })

  // ── AvatarFallback — inverted surface ─────────────────────────────────────

  it("renders fallback with no inline style (uses token classes)", () => {
    render(
      <Avatar>
        <AvatarFallback>HQ</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText("HQ").style.backgroundColor).toBe("")
  })

  // ── AvatarImage ───────────────────────────────────────────────────────────
  // Radix AvatarImage uses an <img> that Radix mounts asynchronously based on
  // load state; in JSDOM it renders but may not be visible. We only verify
  // it accepts props without throwing — fallback is always shown in JSDOM.

  it("falls back to initials when image cannot load (JSDOM)", () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/photo.jpg" alt="User photo" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText("AB")).toBeInTheDocument()
  })

  // ── className merging ─────────────────────────────────────────────────────

  it("Avatar merges custom className", () => {
    const { container } = render(
      <Avatar className="my-custom-class">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    )
    expect(container.firstChild).toHaveClass("my-custom-class")
  })
})
