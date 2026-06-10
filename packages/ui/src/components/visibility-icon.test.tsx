import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { VisibilityIcon } from "./visibility-icon"
import { TooltipProvider } from "./tooltip"

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Wraps the component with TooltipProvider (required ancestor) and zeroes the
 * hover delay so tooltip tests don't need fake timers.
 */
function Wrapper({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
}

function renderWithProvider(ui: React.ReactElement) {
  return render(ui, { wrapper: Wrapper })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("VisibilityIcon", () => {
  // ── Accessible name ────────────────────────────────────────────────────────

  it("has accessible name 'Public' when visibility is public", () => {
    renderWithProvider(<VisibilityIcon visibility="public" />)
    expect(screen.getByRole("img", { name: "Public" })).toBeInTheDocument()
  })

  it("has accessible name 'Private' when visibility is private", () => {
    renderWithProvider(<VisibilityIcon visibility="private" />)
    expect(screen.getByRole("img", { name: "Private" })).toBeInTheDocument()
  })

  // ── Keyboard reachability ──────────────────────────────────────────────────

  it("receives focus via Tab", async () => {
    const user = userEvent.setup()
    renderWithProvider(<VisibilityIcon visibility="public" />)
    await user.tab()
    expect(screen.getByRole("img", { name: "Public" })).toHaveFocus()
  })

  // ── Tooltip copy ───────────────────────────────────────────────────────────

  it("shows 'Visible to anyone' tooltip on hover for public visibility", async () => {
    const user = userEvent.setup()
    renderWithProvider(<VisibilityIcon visibility="public" />)
    await user.hover(screen.getByRole("img", { name: "Public" }))
    expect(await screen.findByRole("tooltip", { name: "Visible to anyone" })).toBeInTheDocument()
  })

  it("shows 'Visible only to your organization' tooltip on hover for private visibility", async () => {
    const user = userEvent.setup()
    renderWithProvider(<VisibilityIcon visibility="private" />)
    await user.hover(screen.getByRole("img", { name: "Private" }))
    expect(
      await screen.findByRole("tooltip", { name: "Visible only to your organization" })
    ).toBeInTheDocument()
  })

  // ── className forwarding ───────────────────────────────────────────────────

  // className forwarding is the public contract — callers use it for spacing.
  it("forwards className to the trigger span", () => {
    renderWithProvider(<VisibilityIcon visibility="public" className="ml-2" />)
    expect(screen.getByRole("img", { name: "Public" })).toHaveClass("ml-2")
  })

  // ── Size variants (token-driven icon dimensions) ───────────────────────────

  // size class is the token-driven visual contract; asserting it pins the
  // mapping between prop value and the CSS utility that controls rendered px.
  it("applies size-3.5 class to the icon for sm (default)", () => {
    renderWithProvider(<VisibilityIcon visibility="public" />)
    const icon = screen.getByRole("img", { name: "Public" }).querySelector("svg")
    expect(icon).toHaveClass("size-3.5")
  })

  it("applies size-4 class to the icon for md", () => {
    renderWithProvider(<VisibilityIcon visibility="public" size="md" />)
    const icon = screen.getByRole("img", { name: "Public" }).querySelector("svg")
    expect(icon).toHaveClass("size-4")
  })
})
