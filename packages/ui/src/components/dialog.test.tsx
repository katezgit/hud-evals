import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogCancelButton,
  DialogConfirmButton,
  DialogDestructiveButton,
} from "./dialog"

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function OpenDialog({
  showCloseButton = true,
  size,
  children,
}: {
  showCloseButton?: boolean
  size?: "sm" | "md" | "lg"
  children?: React.ReactNode
}) {
  return (
    <Dialog open>
      <DialogContent showCloseButton={showCloseButton} size={size}>
        <DialogHeader>
          <DialogTitle>Test title</DialogTitle>
          <DialogDescription>Test description</DialogDescription>
        </DialogHeader>
        <DialogBody>Body content</DialogBody>
        <DialogFooter>{children}</DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Render ───────────────────────────────────────────────────────────────── */

describe("Dialog — render", () => {
  it("renders title, description, and body when open", () => {
    render(<OpenDialog />)
    expect(screen.getByText("Test title")).toBeInTheDocument()
    expect(screen.getByText("Test description")).toBeInTheDocument()
    expect(screen.getByText("Body content")).toBeInTheDocument()
  })

  it("does not render content when closed", () => {
    render(
      <Dialog open={false}>
        <DialogContent>
          <DialogTitle>Hidden</DialogTitle>
          <DialogDescription>Hidden desc</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument()
  })

  it("panel has role=dialog", () => {
    render(<OpenDialog />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

/* ─── Accessibility ────────────────────────────────────────────────────────── */

describe("Dialog — accessibility", () => {
  it("panel is labelled by the title", () => {
    render(<OpenDialog />)
    const dialog = screen.getByRole("dialog")
    const labelledBy = dialog.getAttribute("aria-labelledby")
    expect(labelledBy).toBeTruthy()
    const titleEl = document.getElementById(labelledBy!)
    expect(titleEl?.textContent).toBe("Test title")
  })

  it("panel is described by the description", () => {
    render(<OpenDialog />)
    const dialog = screen.getByRole("dialog")
    const describedBy = dialog.getAttribute("aria-describedby")
    expect(describedBy).toBeTruthy()
    const descEl = document.getElementById(describedBy!)
    expect(descEl?.textContent).toBe("Test description")
  })
})

/* ─── Close button ─────────────────────────────────────────────────────────── */

describe("Dialog — close button", () => {
  it("renders the × close button by default", () => {
    render(<OpenDialog />)
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument()
  })

  it("hides the × close button when showCloseButton={false}", () => {
    render(<OpenDialog showCloseButton={false} />)
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument()
  })
})

/* ─── Trigger interaction ──────────────────────────────────────────────────── */

describe("Dialog — trigger", () => {
  it("opens dialog when trigger is clicked", async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button>Open</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Opened</DialogTitle>
          <DialogDescription>Now visible</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Opened")).toBeInTheDocument()
  })
})

/* ─── Size variants ────────────────────────────────────────────────────────── */

describe("Dialog — size variants", () => {
  it("renders sm size without error", () => {
    render(<OpenDialog size="sm" />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("renders lg size without error", () => {
    render(<OpenDialog size="lg" />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

/* ─── Footer button helpers ────────────────────────────────────────────────── */

describe("Dialog — footer button helpers", () => {
  it("renders DialogCancelButton with default label", () => {
    render(<OpenDialog><DialogCancelButton /></OpenDialog>)
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })

  it("renders DialogConfirmButton with default label", () => {
    render(<OpenDialog><DialogConfirmButton /></OpenDialog>)
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument()
  })

  it("renders DialogDestructiveButton with default label", () => {
    render(<OpenDialog><DialogDestructiveButton /></OpenDialog>)
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument()
  })

  it("renders DialogCancelButton with custom label", () => {
    render(<OpenDialog><DialogCancelButton>Go back</DialogCancelButton></OpenDialog>)
    expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument()
  })

  it("calls onClick on confirm button", async () => {
    const user = userEvent.setup()
    const handler = jest.fn()
    render(
      <OpenDialog>
        <DialogConfirmButton onClick={handler as React.MouseEventHandler<HTMLButtonElement>}>
          Save
        </DialogConfirmButton>
      </OpenDialog>
    )
    await user.click(screen.getByRole("button", { name: /save/i }))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("does not call onClick on disabled confirm button", async () => {
    const user = userEvent.setup()
    const handler = jest.fn()
    render(
      <OpenDialog>
        <DialogConfirmButton
          disabled
          onClick={handler as React.MouseEventHandler<HTMLButtonElement>}
        >
          Save
        </DialogConfirmButton>
      </OpenDialog>
    )
    await user.click(screen.getByRole("button", { name: /save/i }))
    expect(handler).not.toHaveBeenCalled()
  })
})

/* ─── Header two-state scroll cue ────────────────────────────────────────────
 *
 * The header swaps border-color + box-shadow based on body scrollTop:
 *   scrollTop === 0 → border-transparent + shadow-none (no cue)
 *   scrollTop  >  0 → border-border     + shadow-2     (cue)
 *
 * There is no `data-*` attribute on the header exposing this state, so
 * className is the only observable contract. The scrolled state is covered
 * visually in Chromatic via the dialog.stories.tsx "WithOverflow" story.
 * ────────────────────────────────────────────────────────────────────────── */

function getHeader(): HTMLElement {
  return document.querySelector('[data-slot="dialog-header"]') as HTMLElement
}

describe("Dialog — header two-state scroll cue", () => {
  it("renders border-b unconditionally for box stability", () => {
    // border-b is permanent so the box model never shifts when state swaps;
    // this is the no-layout-shift contract and is only observable on className.
    render(<OpenDialog />)
    expect(getHeader()).toHaveClass("border-b")
  })

  it("at rest (no overflow): renders border-transparent and shadow-none", () => {
    // jsdom: bodyEl scrollTop===0 → no cue.
    render(<OpenDialog />)
    const header = getHeader()
    expect(header).toHaveClass("border-transparent")
    expect(header).toHaveClass("shadow-none")
  })
})
