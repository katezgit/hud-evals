import * as React from "react"
import { render, screen } from "@testing-library/react"
import { jest } from "@jest/globals"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card"

describe("Card", () => {
  it("renders children", () => {
    render(<Card>content</Card>)
    expect(screen.getByText("content")).toBeInTheDocument()
  })

  it("exposes data-variant attribute for all variants", () => {
    const variants = ["default", "elevated", "interactive", "selected"] as const
    for (const variant of variants) {
      const { unmount } = render(
        <Card data-testid="card" variant={variant}>{variant}</Card>
      )
      expect(screen.getByTestId("card")).toHaveAttribute("data-variant", variant)
      unmount()
    }
  })

  it("defaults data-variant to default", () => {
    render(<Card data-testid="card">content</Card>)
    expect(screen.getByTestId("card")).toHaveAttribute("data-variant", "default")
  })

  it("fires onClick through passthrough", () => {
    const onClick = jest.fn()
    render(<Card data-testid="card" onClick={onClick}>content</Card>)
    screen.getByTestId("card").click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("merges custom className", () => {
    render(<Card data-testid="card" className="custom-class">content</Card>)
    expect(screen.getByTestId("card")).toHaveClass("custom-class")
  })

  // ── Sub-components ────────────────────────────────────────────────────────

  it("CardTitle renders its text", () => {
    render(<CardTitle>Evaluation Suite</CardTitle>)
    expect(screen.getByText("Evaluation Suite")).toBeInTheDocument()
  })

  it("CardDescription renders its text", () => {
    render(<CardDescription>Meta text</CardDescription>)
    expect(screen.getByText("Meta text")).toBeInTheDocument()
  })

  it("CardAction renders children", () => {
    render(<CardAction><button>Go</button></CardAction>)
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument()
  })

  it("CardContent renders children", () => {
    render(<CardContent>Run stats</CardContent>)
    expect(screen.getByText("Run stats")).toBeInTheDocument()
  })

  it("CardFooter renders children", () => {
    render(<CardFooter><button>Save</button></CardFooter>)
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })

  // ── Composition ──────────────────────────────────────────────────────────

  it("renders full anatomy without error", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Eval Run #42</CardTitle>
          <CardDescription>SWE-bench — 128 tasks</CardDescription>
          <CardAction><button>View</button></CardAction>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter><button>Start</button></CardFooter>
      </Card>
    )
    expect(screen.getByText("Eval Run #42")).toBeInTheDocument()
    expect(screen.getByText("SWE-bench — 128 tasks")).toBeInTheDocument()
    expect(screen.getByText("Body content")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument()
  })
})
