import * as React from "react"
import { render } from "@testing-library/react"
import { ScoreBar } from "./score-bar"

describe("ScoreBar", () => {
  it("outer track is aria-hidden", () => {
    const { container } = render(<ScoreBar value={50} />)
    const track = container.firstChild as HTMLElement
    expect(track).toHaveAttribute("aria-hidden", "true")
  })

  it("is not exposed as a progressbar role", () => {
    const { queryByRole } = render(<ScoreBar value={50} />)
    expect(queryByRole("progressbar")).toBeNull()
  })

  it("high score (above default threshold) uses bg-state-scored fill", () => {
    const { container } = render(<ScoreBar value={70} />)
    const fill = container.firstChild!.firstChild as HTMLElement
    expect(fill).toHaveClass("bg-state-scored")
  })

  it("low score (below default threshold) uses bg-state-warning fill", () => {
    const { container } = render(<ScoreBar value={30} />)
    const fill = container.firstChild!.firstChild as HTMLElement
    expect(fill).toHaveClass("bg-state-warning")
  })

  it("value equal to default threshold (50) uses bg-state-scored fill", () => {
    const { container } = render(<ScoreBar value={50} />)
    const fill = container.firstChild!.firstChild as HTMLElement
    expect(fill).toHaveClass("bg-state-scored")
  })

  it("custom threshold: value below threshold uses bg-state-warning fill", () => {
    const { container } = render(<ScoreBar value={60} threshold={75} />)
    const fill = container.firstChild!.firstChild as HTMLElement
    expect(fill).toHaveClass("bg-state-warning")
  })

  it("value below 0 is clamped to 0% width", () => {
    const { container } = render(<ScoreBar value={-5} />)
    const fill = container.firstChild!.firstChild as HTMLElement
    expect(fill).toHaveStyle({ width: "0%" })
  })

  it("value above 100 is clamped to 100% width", () => {
    const { container } = render(<ScoreBar value={150} />)
    const fill = container.firstChild!.firstChild as HTMLElement
    expect(fill).toHaveStyle({ width: "100%" })
  })

  it("fill width matches value percentage", () => {
    const { container } = render(<ScoreBar value={42} />)
    const fill = container.firstChild!.firstChild as HTMLElement
    expect(fill).toHaveStyle({ width: "42%" })
  })

  it("className is applied to the outer track", () => {
    const { container } = render(<ScoreBar value={50} className="custom" />)
    const track = container.firstChild as HTMLElement
    expect(track).toHaveClass("custom")
  })
})
