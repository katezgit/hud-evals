import * as React from "react"
import { render, screen, act, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { CodeBlock, __setCopyFn, __resetCopyFn } from "./code-block"

// ── clipboard mock ────────────────────────────────────────────────────────────
// ESM VM isolation in jest-environment-jsdom means patching navigator.clipboard
// from the test module doesn't affect the component module's global reference.
// Instead we inject a mock via __setCopyFn, which replaces the module-level
// copy function used inside CopyButton.handleCopy.

const writeText = jest.fn<(text: string) => Promise<void>>()
writeText.mockResolvedValue(undefined)

beforeEach(() => {
  writeText.mockClear()
  writeText.mockResolvedValue(undefined)
  __setCopyFn(writeText)
})

afterEach(() => {
  __resetCopyFn()
  jest.useRealTimers()
})

// ── Render ────────────────────────────────────────────────────────────────────

describe("CodeBlock", () => {
  describe("render", () => {
    it("renders inline variant with code string", () => {
      render(<CodeBlock code="hud set HUD_API_KEY=abc" />)
      expect(screen.getByText("hud set HUD_API_KEY=abc")).toBeInTheDocument()
    })

    it("renders block variant with code string", () => {
      render(<CodeBlock variant="block" code="$ hud env create my-env" />)
      expect(screen.getByText("$ hud env create my-env")).toBeInTheDocument()
    })

    it("inline renders a <code> element with data-slot=code-block", () => {
      render(<CodeBlock code="hello" />)
      const el = screen.getByText("hello").closest("[data-slot='code-block']")
      expect(el).toBeInTheDocument()
      expect(el?.tagName).toBe("CODE")
    })

    it("block renders a <pre> element with data-slot=code-block", () => {
      render(<CodeBlock variant="block" code="$ run" />)
      const el = screen.getByText("$ run").closest("[data-slot='code-block']")
      expect(el).toBeInTheDocument()
      expect(el?.tagName).toBe("PRE")
    })

    it("sets data-variant=inline on inline element", () => {
      render(<CodeBlock code="hello" />)
      const el = document.querySelector("[data-slot='code-block']")
      expect(el).toHaveAttribute("data-variant", "inline")
    })

    it("sets data-variant=block on block element", () => {
      render(<CodeBlock variant="block" code="hello" />)
      const el = document.querySelector("[data-slot='code-block']")
      expect(el).toHaveAttribute("data-variant", "block")
    })
  })

  // ── Language label ───────────────────────────────────────────────────────────

  describe("language label", () => {
    it("renders language label when provided on block variant", () => {
      render(<CodeBlock variant="block" code="$ run" language="bash" />)
      expect(screen.getByText("bash")).toBeInTheDocument()
    })

    it("does not render language label when language is omitted on block variant", () => {
      render(<CodeBlock variant="block" code="$ run" />)
      expect(document.querySelector("[data-slot='language-label']")).not.toBeInTheDocument()
    })

    it("language prop is ignored (not rendered) on inline variant", () => {
      // language is only meaningful for block; inline has no label slot
      render(<CodeBlock variant="inline" code="hello" language="bash" />)
      expect(screen.queryByText("bash")).not.toBeInTheDocument()
    })
  })

  // ── Copy button presence ─────────────────────────────────────────────────────

  describe("copy button", () => {
    it("renders a copy button on inline variant", () => {
      render(<CodeBlock code="hello" />)
      const btn = screen.getByRole("button", { name: /copy to clipboard/i })
      expect(btn).toBeInTheDocument()
    })

    it("renders a copy button on block variant", () => {
      render(<CodeBlock variant="block" code="$ run" />)
      const btn = screen.getByRole("button", { name: /copy to clipboard/i })
      expect(btn).toBeInTheDocument()
    })

    it("copy button has data-slot=copy-button", () => {
      render(<CodeBlock code="hello" />)
      expect(document.querySelector("[data-slot='copy-button']")).toBeInTheDocument()
    })

    it("copy button initial state is idle", () => {
      render(<CodeBlock code="hello" />)
      const btn = document.querySelector("[data-slot='copy-button']")
      expect(btn).toHaveAttribute("data-state", "idle")
    })
  })

  // ── Copy interaction: success ────────────────────────────────────────────────

  describe("copy interaction — success", () => {
    it("calls clipboard.writeText with the code string", async () => {
      // default mock is mockResolvedValue(undefined) — no override needed
      const user = userEvent.setup()
      render(<CodeBlock code="hud set KEY=val" />)
      await user.click(screen.getByRole("button", { name: /copy to clipboard/i }))
      expect(writeText).toHaveBeenCalledWith("hud set KEY=val")
    })

    it("transitions copy button to success state after copy", async () => {
      const user = userEvent.setup()
      render(<CodeBlock code="hello" />)
      await user.click(screen.getByRole("button", { name: /copy to clipboard/i }))
      await waitFor(() => {
        const btn = document.querySelector("[data-slot='copy-button']")
        expect(btn).toHaveAttribute("data-state", "success")
      })
    })

    it("copy button aria-label changes to Copied! on success", async () => {
      const user = userEvent.setup()
      render(<CodeBlock code="hello" />)
      await user.click(screen.getByRole("button", { name: /copy to clipboard/i }))
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /copied!/i })).toBeInTheDocument()
      })
    })

    it("returns to idle state after 1500ms", async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<CodeBlock code="hello" />)
      await user.click(screen.getByRole("button", { name: /copy to clipboard/i }))

      // Wait for the success state to settle before advancing timers
      await waitFor(() => {
        const btn = document.querySelector("[data-slot='copy-button']")
        expect(btn).toHaveAttribute("data-state", "success")
      })

      act(() => { jest.advanceTimersByTime(1500) })

      const btn = document.querySelector("[data-slot='copy-button']")
      expect(btn).toHaveAttribute("data-state", "idle")
    })
  })

  // ── Copy interaction: error ──────────────────────────────────────────────────

  describe("copy interaction — error", () => {
    it("transitions to error state when clipboard.writeText rejects", async () => {
      writeText.mockRejectedValueOnce(new Error("denied"))
      const user = userEvent.setup()
      render(<CodeBlock code="hello" />)
      await user.click(screen.getByRole("button", { name: /copy/i }))
      await waitFor(() => {
        const btn = document.querySelector("[data-slot='copy-button']")
        expect(btn).toHaveAttribute("data-state", "error")
      })
    })

    it("copy button aria-label is 'Copy failed' on error", async () => {
      writeText.mockRejectedValueOnce(new Error("denied"))
      const user = userEvent.setup()
      render(<CodeBlock code="hello" />)
      await user.click(screen.getByRole("button", { name: /copy/i }))
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /copy failed/i })).toBeInTheDocument()
      })
    })

    it("returns to idle state after 1500ms on error", async () => {
      jest.useFakeTimers()
      writeText.mockRejectedValueOnce(new Error("denied"))
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<CodeBlock code="hello" />)
      await user.click(screen.getByRole("button", { name: /copy/i }))

      await waitFor(() => {
        const btn = document.querySelector("[data-slot='copy-button']")
        expect(btn).toHaveAttribute("data-state", "error")
      })

      act(() => { jest.advanceTimersByTime(1500) })

      const btn = document.querySelector("[data-slot='copy-button']")
      expect(btn).toHaveAttribute("data-state", "idle")
    })
  })

  // ── Ref forwarding ───────────────────────────────────────────────────────────

  describe("ref forwarding", () => {
    it("forwards ref to the <code> element in inline variant", () => {
      const ref = React.createRef<HTMLElement>()
      render(<CodeBlock ref={ref} code="hello" />)
      expect(ref.current).not.toBeNull()
      expect(ref.current?.tagName).toBe("CODE")
    })

    it("forwards ref to the <pre> element in block variant", () => {
      const ref = React.createRef<HTMLElement>()
      render(<CodeBlock ref={ref} variant="block" code="$ run" />)
      expect(ref.current).not.toBeNull()
      expect(ref.current?.tagName).toBe("PRE")
    })
  })

  // ── className merging ────────────────────────────────────────────────────────

  describe("className merging", () => {
    it("merges custom className on inline variant", () => {
      render(<CodeBlock code="hello" className="my-class" />)
      const el = document.querySelector("[data-slot='code-block']")
      expect(el).toHaveClass("my-class")
    })

    it("merges custom className on block variant", () => {
      render(<CodeBlock variant="block" code="$ run" className="my-block" />)
      const el = document.querySelector("[data-slot='code-block']")
      expect(el).toHaveClass("my-block")
    })

    it("retains token class alongside custom class on inline", () => {
      render(<CodeBlock code="hello" className="my-class" />)
      const el = document.querySelector("[data-slot='code-block']")
      expect(el).toHaveClass("my-class")
      expect(el?.className).toContain("bg-muted-surface")
    })
  })

  // ── Copy button stacking / header layout ────────────────────────────────────
  // With language: header is in-flow (no absolute div), z-10 stacking concern
  // is structurally eliminated. Without language: copy button itself is absolute z-10.

  describe("copy button stacking", () => {
    it("block-with-language: language label and copy button are siblings in an in-flow header above the pre", () => {
      render(<CodeBlock variant="block" code="$ run" language="python" />)
      // The language label should be present
      const label = document.querySelector("[data-slot='language-label']")
      expect(label).toBeInTheDocument()
      // The pre should be a sibling of the header, not the parent of the label
      const pre = document.querySelector("[data-slot='code-block']")
      expect(pre?.contains(label)).toBe(false)
      // No absolute-positioned header div — structural fix means no div.absolute exists
      const wrapper = pre?.closest("div.relative")
      const absoluteDiv = wrapper?.querySelector("div.absolute")
      expect(absoluteDiv).not.toBeInTheDocument()
    })

    it("block-no-language: copy button has absolute and z-10 classes", () => {
      render(<CodeBlock variant="block" code="$ run" />)
      const btn = document.querySelector("[data-slot='copy-button']")
      expect(btn).toHaveClass("absolute")
      expect(btn).toHaveClass("z-10")
    })
  })

  // ── Passthrough props ────────────────────────────────────────────────────────

  describe("passthrough props", () => {
    it("passes additional html attributes to inline code element", () => {
      render(<CodeBlock code="hello" data-testid="my-code" />)
      expect(screen.getByTestId("my-code")).toBeInTheDocument()
    })

    it("passes additional html attributes to block pre element", () => {
      render(<CodeBlock variant="block" code="$ run" data-testid="my-pre" />)
      expect(screen.getByTestId("my-pre")).toBeInTheDocument()
    })
  })
})
