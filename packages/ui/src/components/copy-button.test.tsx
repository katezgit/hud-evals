import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { CopyButton } from "./copy-button"
import { TooltipProvider } from "./tooltip"

// userEvent.setup() installs its own non-jest navigator.clipboard stub, which
// shadows the test-setup.ts polyfill. We re-install ours *after* userEvent
// finishes its setup so the hook calls our jest.fn() and assertions can inspect it.
let writeText: jest.Mock<(text: string) => Promise<void>>

function setupUser(options?: Parameters<typeof userEvent.setup>[0]) {
  const user = userEvent.setup(options)
  writeText = jest.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
  Object.defineProperty(window.navigator, "clipboard", {
    writable: true,
    configurable: true,
    value: { writeText },
  })
  return user
}

afterEach(() => {
  jest.useRealTimers()
})

function renderCopyButton(props: React.ComponentProps<typeof CopyButton>) {
  return render(
    <TooltipProvider delayDuration={0}>
      <CopyButton {...props} />
    </TooltipProvider>,
  )
}

describe("CopyButton", () => {
  describe("idle state", () => {
    it("renders Copy icon (aria-hidden)", () => {
      setupUser()
      renderCopyButton({ value: "abc123" })
      const btn = screen.getByRole("button", { name: "Copy abc123" })
      const svg = btn.querySelector("svg")
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute("aria-hidden", "true")
    })

    it("default aria-label is 'Copy <value>'", () => {
      setupUser()
      renderCopyButton({ value: "abc123" })
      expect(screen.getByRole("button", { name: "Copy abc123" })).toBeInTheDocument()
    })

    it("live region is empty in idle state", () => {
      setupUser()
      renderCopyButton({ value: "abc123" })
      const region = screen.getByRole("status")
      expect(region).toBeEmptyDOMElement()
    })
  })

  describe("after click", () => {
    it("calls clipboard with value", async () => {
      const user = setupUser()
      renderCopyButton({ value: "abc123" })
      await user.click(screen.getByRole("button", { name: "Copy abc123" }))
      expect(writeText).toHaveBeenCalledWith("abc123")
    })

    it("transitions aria-label to 'Copied <value>'", async () => {
      const user = setupUser()
      renderCopyButton({ value: "abc123" })
      await user.click(screen.getByRole("button", { name: "Copy abc123" }))
      expect(screen.getByRole("button", { name: "Copied abc123" })).toBeInTheDocument()
    })

    it("live region shows 'Copied' when in copied state", async () => {
      const user = setupUser()
      renderCopyButton({ value: "abc123" })
      await user.click(screen.getByRole("button", { name: "Copy abc123" }))
      expect(screen.getByRole("status")).toHaveTextContent("Copied")
    })

    it("applies text-state-scored-text class when copied", async () => {
      const user = setupUser()
      renderCopyButton({ value: "abc123" })
      await user.click(screen.getByRole("button", { name: "Copy abc123" }))
      const btn = screen.getByRole("button", { name: "Copied abc123" })
      expect(btn).toHaveClass("text-state-scored-text")
    })
  })

  describe("revert after 1500ms", () => {
    it("returns to idle aria-label and empty live region after 1500ms", async () => {
      // Real timers throughout. Fake timers from the start would block React 18's
      // scheduler in jsdom (which uses setTimeout/setImmediate); the click never
      // propagates to state. waitFor polls the DOM until the real revert fires.
      const user = setupUser()
      renderCopyButton({ value: "abc123" })
      await user.click(screen.getByRole("button", { name: "Copy abc123" }))
      expect(screen.getByRole("button", { name: "Copied abc123" })).toBeInTheDocument()
      expect(screen.getByRole("status")).toHaveTextContent("Copied")
      await waitFor(
        () => expect(screen.getByRole("button", { name: "Copy abc123" })).toBeInTheDocument(),
        { timeout: 2500 },
      )
      expect(screen.getByRole("status")).toBeEmptyDOMElement()
    }, 5000)
  })

  describe("ariaLabel override", () => {
    it("uses caller-provided ariaLabel verbatim in idle state", () => {
      setupUser()
      renderCopyButton({ value: "abc123", ariaLabel: "Copy model ID" })
      expect(screen.getByRole("button", { name: "Copy model ID" })).toBeInTheDocument()
    })

    it("uses caller-provided ariaLabel verbatim in copied state (does not auto-prefix 'Copied')", async () => {
      const user = setupUser()
      renderCopyButton({ value: "abc123", ariaLabel: "Copy model ID" })
      await user.click(screen.getByRole("button", { name: "Copy model ID" }))
      expect(screen.getByRole("button", { name: "Copy model ID" })).toBeInTheDocument()
    })
  })

  describe("tooltip overrides", () => {
    it("uses tooltipLabel in idle state (visible on hover)", async () => {
      const user = setupUser()
      renderCopyButton({ value: "abc123", tooltipLabel: "Copy run ID" })
      await user.hover(screen.getByRole("button", { name: "Copy abc123" }))
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Copy run ID")
    })

    it("uses tooltipCopiedLabel in copied state (visible on hover)", async () => {
      const user = setupUser()
      renderCopyButton({
        value: "abc123",
        tooltipCopiedLabel: "Run ID copied",
      })
      await user.click(screen.getByRole("button", { name: "Copy abc123" }))
      // Radix Tooltip suppresses re-open on the same trigger until pointerLeave
      // fires (after click). Move pointer away then back to re-open in copied state.
      const btn = screen.getByRole("button", { name: "Copied abc123" })
      await user.unhover(btn)
      await user.hover(btn)
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Run ID copied")
    })
  })

  describe("className prop", () => {
    it("merges className onto IconButton, additive with copied-state token", async () => {
      const user = setupUser()
      renderCopyButton({ value: "abc123", className: "custom-cls" })
      const btn = screen.getByRole("button", { name: "Copy abc123" })
      expect(btn).toHaveClass("custom-cls")
      await user.click(btn)
      const copiedBtn = screen.getByRole("button", { name: "Copied abc123" })
      expect(copiedBtn).toHaveClass("custom-cls")
      expect(copiedBtn).toHaveClass("text-state-scored-text")
    })
  })

  describe("disabled prop", () => {
    it("renders aria-disabled='true'", () => {
      setupUser()
      renderCopyButton({ value: "abc123", disabled: true })
      const btn = screen.getByRole("button")
      expect(btn).toHaveAttribute("aria-disabled", "true")
    })

    it("does NOT render native disabled attribute", () => {
      setupUser()
      renderCopyButton({ value: "abc123", disabled: true })
      const btn = screen.getByRole("button")
      expect(btn).not.toBeDisabled()
    })

    it("does not call clipboard on click when disabled", async () => {
      const user = setupUser()
      renderCopyButton({ value: "abc123", disabled: true })
      await user.click(screen.getByRole("button"))
      expect(writeText).not.toHaveBeenCalled()
    })

    it("copied state does not activate when disabled", async () => {
      const user = setupUser()
      renderCopyButton({ value: "abc123", disabled: true })
      await user.click(screen.getByRole("button"))
      expect(screen.getByRole("status")).toBeEmptyDOMElement()
    })

    it("tooltip opens on hover when disabled (aria-disabled does not block Radix pointer events)", async () => {
      const user = setupUser()
      renderCopyButton({
        value: "abc123",
        disabled: true,
        ariaLabel: "Copy (unavailable)",
      })
      await user.hover(screen.getByRole("button"))
      expect(await screen.findByRole("tooltip")).toBeInTheDocument()
    })
  })

  describe("icon accessibility", () => {
    it("idle icon is aria-hidden", () => {
      setupUser()
      renderCopyButton({ value: "abc123" })
      const btn = screen.getByRole("button", { name: "Copy abc123" })
      const svg = btn.querySelector("svg")
      expect(svg).toHaveAttribute("aria-hidden", "true")
    })

    it("copied icon is aria-hidden", async () => {
      const user = setupUser()
      renderCopyButton({ value: "abc123" })
      await user.click(screen.getByRole("button", { name: "Copy abc123" }))
      const btn = screen.getByRole("button", { name: "Copied abc123" })
      const svg = btn.querySelector("svg")
      expect(svg).toHaveAttribute("aria-hidden", "true")
    })
  })

  describe("live region", () => {
    it("has role='status' and aria-live='polite'", () => {
      setupUser()
      renderCopyButton({ value: "abc123" })
      const region = screen.getByRole("status")
      expect(region).toHaveAttribute("aria-live", "polite")
    })
  })
})
