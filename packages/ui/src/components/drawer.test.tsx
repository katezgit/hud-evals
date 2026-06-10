import * as React from "react"
import { render, screen } from "@testing-library/react"

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerCloseButton,
} from "./drawer"

// Primary controlled wrapper: direction="right", no snap points.
function DrawerOpen({
  contentProps,
}: {
  contentProps?: Partial<React.ComponentProps<typeof DrawerContent>>
}) {
  const [open, setOpen] = React.useState(true)
  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent data-testid="drawer-content" {...contentProps}>
        <DrawerHeader data-testid="drawer-header">
          <DrawerTitle data-testid="drawer-title">Drawer title</DrawerTitle>
          <DrawerCloseButton data-testid="drawer-close-btn" />
        </DrawerHeader>
        <DrawerBody data-testid="drawer-body">
          <p>Body content</p>
        </DrawerBody>
        <DrawerFooter data-testid="drawer-footer">
          <button>Cancel</button>
          <button>Confirm</button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function renderDrawer(
  contentProps?: Partial<React.ComponentProps<typeof DrawerContent>>
) {
  return render(<DrawerOpen contentProps={contentProps} />)
}

function DrawerWrap({
  children,
  direction = "right",
}: {
  children: React.ReactNode
  direction?: "right" | "left" | "top" | "bottom"
}) {
  const [open, setOpen] = React.useState(true)
  return (
    <Drawer open={open} onOpenChange={setOpen} direction={direction}>
      {children}
    </Drawer>
  )
}

describe("Drawer", () => {
  describe("render", () => {
    it("renders drawer content when open", () => {
      renderDrawer()
      expect(screen.getByText("Body content")).toBeInTheDocument()
    })

    it("renders title text", () => {
      renderDrawer()
      expect(screen.getByText("Drawer title")).toBeInTheDocument()
    })

    it("renders footer action buttons", () => {
      renderDrawer()
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument()
    })
  })

  // ── Size variants (exposed via data-size for CSS selectors) ───────────────

  describe("size variants", () => {
    it("exposes data-size=sm", () => {
      renderDrawer({ size: "sm" })
      expect(screen.getByTestId("drawer-content")).toHaveAttribute("data-size", "sm")
    })

    it("exposes data-size=md by default", () => {
      renderDrawer()
      expect(screen.getByTestId("drawer-content")).toHaveAttribute("data-size", "md")
    })

    it("exposes data-size=lg", () => {
      renderDrawer({ size: "lg" })
      expect(screen.getByTestId("drawer-content")).toHaveAttribute("data-size", "lg")
    })
  })

  // ── Close button ──────────────────────────────────────────────────────────

  describe("DrawerCloseButton", () => {
    it("has an accessible name for screen readers", () => {
      renderDrawer()
      // The sr-only "Close" span provides the accessible name
      expect(screen.getByText("Close")).toBeInTheDocument()
    })

    it("renders as a button", () => {
      renderDrawer()
      expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument()
    })
  })

  // ── Direction variants ────────────────────────────────────────────────────

  describe("direction variants", () => {
    it("renders without error with direction='left'", () => {
      expect(() =>
        render(
          <DrawerWrap direction="left">
            <DrawerContent>children</DrawerContent>
          </DrawerWrap>
        )
      ).not.toThrow()
    })

    it("renders without error with direction='top'", () => {
      expect(() =>
        render(
          <DrawerWrap direction="top">
            <DrawerContent size="sm">children</DrawerContent>
          </DrawerWrap>
        )
      ).not.toThrow()
    })

    it("renders without error with direction='bottom'", () => {
      expect(() =>
        render(
          <DrawerWrap direction="bottom">
            <DrawerContent size="lg">children</DrawerContent>
          </DrawerWrap>
        )
      ).not.toThrow()
    })
  })

  // ── DrawerDescription ─────────────────────────────────────────────────────

  describe("DrawerDescription", () => {
    it("renders description text", () => {
      render(
        <DrawerWrap>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Title</DrawerTitle>
              <DrawerDescription>Helper text</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </DrawerWrap>
      )
      expect(screen.getByText("Helper text")).toBeInTheDocument()
    })
  })

  // ── Header two-state scroll cue ───────────────────────────────────────────
  //
  // DrawerHeader swaps border-color + box-shadow based on body scrollTop:
  //   scrollTop === 0 → border-transparent + shadow-none (no cue)
  //   scrollTop  >  0 → border-border     + shadow-2     (cue)
  //
  // No `data-*` attribute exposes this state, so className is the only
  // observable contract. The scrolled state is covered visually in Chromatic
  // via drawer.stories.tsx.

  describe("header two-state scroll cue", () => {
    it("renders border-b unconditionally for box stability", () => {
      renderDrawer()
      // border-b is permanent so the box model never shifts when state swaps.
      expect(screen.getByTestId("drawer-header")).toHaveClass("border-b")
    })

    it("at rest (no overflow): renders border-transparent and shadow-none", () => {
      renderDrawer()
      // jsdom: bodyEl scrollTop===0 → no cue.
      const header = screen.getByTestId("drawer-header")
      expect(header).toHaveClass("border-transparent")
      expect(header).toHaveClass("shadow-none")
    })
  })

  // ── className merging ─────────────────────────────────────────────────────

  describe("className merging", () => {
    it("merges custom className into DrawerContent", () => {
      renderDrawer({ className: "custom-panel" })
      expect(screen.getByTestId("drawer-content")).toHaveClass("custom-panel")
    })

    it("merges custom className into DrawerBody", () => {
      render(
        <DrawerWrap>
          <DrawerContent>
            <DrawerBody data-testid="body" className="extra-class">content</DrawerBody>
          </DrawerContent>
        </DrawerWrap>
      )
      expect(screen.getByTestId("body")).toHaveClass("extra-class")
    })

    it("merges custom className into DrawerFooter", () => {
      render(
        <DrawerWrap>
          <DrawerContent>
            <DrawerFooter data-testid="footer" className="extra-footer">footer</DrawerFooter>
          </DrawerContent>
        </DrawerWrap>
      )
      expect(screen.getByTestId("footer")).toHaveClass("extra-footer")
    })
  })
})
