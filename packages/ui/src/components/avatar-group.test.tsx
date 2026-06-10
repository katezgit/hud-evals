import * as React from "react"
import { render, screen } from "@testing-library/react"
import { AvatarGroup, type AvatarGroupItem } from "./avatar-group"

const makeItems = (count: number): AvatarGroupItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `user-${i}`,
    initials: `U${i}`,
  }))

const makeImageItems = (count: number): AvatarGroupItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `user-${i}`,
    src: `https://example.com/avatar-${i}.png`,
    alt: `User ${i}`,
    initials: `U${i}`,
  }))

describe("AvatarGroup", () => {
  // ── Render ────────────────────────────────────────────────────────────────

  it("renders initials for each avatar", () => {
    render(<AvatarGroup items={makeItems(2)} />)
    expect(screen.getByText("U0")).toBeInTheDocument()
    expect(screen.getByText("U1")).toBeInTheDocument()
  })

  it("renders all avatars when items <= maxVisible", () => {
    const { container } = render(<AvatarGroup items={makeItems(3)} />)
    expect(container.querySelectorAll("[data-slot='avatar']")).toHaveLength(3)
  })

  // ── maxVisible / overflow ─────────────────────────────────────────────────

  it("renders no overflow when items <= maxVisible", () => {
    render(<AvatarGroup items={makeItems(3)} />)
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument()
  })

  it("renders overflow slot when items > maxVisible", () => {
    render(<AvatarGroup items={makeItems(5)} />)
    expect(screen.getByText("+2")).toBeInTheDocument()
  })

  it("overflow slot shows correct count", () => {
    render(<AvatarGroup items={makeItems(10)} maxVisible={3} />)
    expect(screen.getByText("+7")).toBeInTheDocument()
  })

  it("overflow slot has accessible label with count", () => {
    render(<AvatarGroup items={makeItems(5)} />)
    expect(screen.getByLabelText("2 more")).toBeInTheDocument()
  })

  it("renders exactly maxVisible avatars when items exceed it", () => {
    const { container } = render(<AvatarGroup items={makeItems(7)} maxVisible={4} />)
    expect(container.querySelectorAll("[data-slot='avatar']")).toHaveLength(4)
  })

  it("does not render overflow when items equal maxVisible exactly", () => {
    render(<AvatarGroup items={makeItems(3)} maxVisible={3} />)
    expect(screen.queryByLabelText(/more/)).not.toBeInTheDocument()
  })

  // ── Image avatars ─────────────────────────────────────────────────────────
  // Radix AvatarImage never fires onLoad in JSDOM, so the fallback is always shown.

  it("shows fallback initials when image cannot load (JSDOM)", () => {
    render(<AvatarGroup items={makeImageItems(1)} />)
    expect(screen.getByText("U0")).toBeInTheDocument()
  })

  // ── data-size (used by CSS token selectors) ───────────────────────────────

  it("exposes data-size on root", () => {
    const { container } = render(<AvatarGroup items={[]} size="xs" />)
    expect(container.firstChild).toHaveAttribute("data-size", "xs")
  })

  it("passes size to avatars", () => {
    const { container } = render(<AvatarGroup items={makeItems(1)} size="xs" />)
    const avatar = container.querySelector("[data-slot='avatar']")
    expect(avatar).toHaveAttribute("data-size", "xs")
  })

  // ── className merging ─────────────────────────────────────────────────────

  it("merges custom className onto the root element", () => {
    const { container } = render(
      <AvatarGroup items={[]} className="my-custom-class" />
    )
    expect(container.firstChild).toHaveClass("my-custom-class")
  })
})
