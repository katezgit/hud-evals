import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import { StarCount } from "./star-count"

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Controlled harness that wires pressed state reactively, mirroring real usage
 * where the parent owns the boolean.
 */
function Harness({
  initialPressed = false,
  onPressedChange = () => {},
  ...rest
}: {
  initialPressed?: boolean
  onPressedChange?: (next: boolean) => void
} & Omit<React.ComponentProps<typeof StarCount>, "pressed" | "onPressedChange">) {
  const [pressed, setPressed] = React.useState(initialPressed)
  return (
    <StarCount
      pressed={pressed}
      onPressedChange={(next) => {
        onPressedChange(next)
        setPressed(next)
      }}
      {...rest}
    />
  )
}

describe("StarCount", () => {
  it("renders the count as visible text", () => {
    render(
      <StarCount count={42} pressed={false} onPressedChange={() => {}} label="hud-browser" />
    )
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("uses 'Star {label}' as aria-label when unpressed", () => {
    render(
      <StarCount count={5} pressed={false} onPressedChange={() => {}} label="hud-browser" />
    )
    expect(screen.getByRole("button", { name: "Star hud-browser" })).toBeInTheDocument()
  })

  it("uses 'Unstar {label}' as aria-label when pressed", () => {
    render(
      <StarCount count={5} pressed={true} onPressedChange={() => {}} label="hud-browser" />
    )
    expect(screen.getByRole("button", { name: "Unstar hud-browser" })).toBeInTheDocument()
  })

  it("fires onPressedChange(true) when clicking while unpressed", async () => {
    const user = userEvent.setup()
    const handle = jest.fn()
    render(
      <StarCount count={3} pressed={false} onPressedChange={handle} label="agent-bench" />
    )
    await user.click(screen.getByRole("button", { name: "Star agent-bench" }))
    expect(handle).toHaveBeenCalledTimes(1)
    expect(handle).toHaveBeenCalledWith(true)
  })

  it("fires onPressedChange(false) when clicking while pressed", async () => {
    const user = userEvent.setup()
    const handle = jest.fn()
    render(
      <StarCount count={3} pressed={true} onPressedChange={handle} label="agent-bench" />
    )
    await user.click(screen.getByRole("button", { name: "Unstar agent-bench" }))
    expect(handle).toHaveBeenCalledTimes(1)
    expect(handle).toHaveBeenCalledWith(false)
  })

  it("fires onPressedChange with toggled value on Enter", async () => {
    const user = userEvent.setup()
    const handle = jest.fn()
    render(
      <Harness count={2} label="eval-run" onPressedChange={handle} />
    )
    screen.getByRole("button", { name: "Star eval-run" }).focus()
    await user.keyboard("{Enter}")
    expect(handle).toHaveBeenCalledTimes(1)
    expect(handle).toHaveBeenCalledWith(true)
  })

  it("does not propagate click to ancestor by default", async () => {
    const user = userEvent.setup()
    const parentClick = jest.fn()
    render(
      <div onClick={parentClick}>
        <StarCount
          count={1}
          pressed={false}
          onPressedChange={() => {}}
          label="parent-test"
        />
      </div>
    )
    await user.click(screen.getByRole("button", { name: "Star parent-test" }))
    expect(parentClick).not.toHaveBeenCalled()
  })

  it("propagates click to ancestor when stopPropagation=false", async () => {
    const user = userEvent.setup()
    const parentClick = jest.fn()
    render(
      <div onClick={parentClick}>
        <StarCount
          count={1}
          pressed={false}
          onPressedChange={() => {}}
          label="parent-test"
          stopPropagation={false}
        />
      </div>
    )
    await user.click(screen.getByRole("button", { name: "Star parent-test" }))
    expect(parentClick).toHaveBeenCalledTimes(1)
  })
})
