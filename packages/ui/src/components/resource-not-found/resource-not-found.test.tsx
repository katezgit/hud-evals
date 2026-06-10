import * as React from "react"
import { render, screen } from "@testing-library/react"
import { ResourceNotFound } from "./resource-not-found"

describe("ResourceNotFound", () => {
  // ── Default (unavailable) variant ─────────────────────────────────────────

  it("renders the composed heading, resource ID, and action slot for unavailable variant", () => {
    render(
      <ResourceNotFound
        label="Job"
        resourceId="job_9f3x"
        action={<a href="/jobs">Go to Jobs</a>}
      />
    )
    expect(screen.getByRole("heading", { name: /This Job isn't available\./ })).toBeInTheDocument()
    expect(screen.getByText("job_9f3x")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Go to Jobs" })).toBeInTheDocument()
  })

  // ── wrong-workspace variant ────────────────────────────────────────────────

  it("renders the different heading and workspace sub-copy for wrong-workspace variant", () => {
    render(
      <ResourceNotFound
        label="Trace"
        resourceId="trace_abc"
        variant="wrong-workspace"
        workspaceName="Acme Corp"
        action={<button>Switch</button>}
      />
    )
    expect(
      screen.getByRole("heading", { name: "This Trace is in a different workspace." })
    ).toBeInTheDocument()
    expect(screen.getByText("Switch to Acme Corp to view it.")).toBeInTheDocument()
  })

  // ── HUD vocabulary discipline ──────────────────────────────────────────────

  it("composes the heading with the exact label passed — Taskset", () => {
    render(
      <ResourceNotFound
        label="Taskset"
        resourceId="ts_001"
        action={null}
      />
    )
    expect(
      screen.getByRole("heading", { name: "This Taskset isn't available." })
    ).toBeInTheDocument()
  })

  // ── Heading level ──────────────────────────────────────────────────────────

  it("defaults heading to h2", () => {
    render(
      <ResourceNotFound label="Job" resourceId="job_1" action={null} />
    )
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument()
  })

  it("renders heading as h1 when headingLevel='h1'", () => {
    render(
      <ResourceNotFound label="Job" resourceId="job_1" action={null} headingLevel="h1" />
    )
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
  })

  // ── Root role ──────────────────────────────────────────────────────────────

  it("root element has no landmark role", () => {
    const { container } = render(
      <ResourceNotFound label="Job" resourceId="job_1" action={null} />
    )
    const root = container.firstChild as Element
    expect(root.getAttribute("role")).toBeNull()
    // Confirm none of the removed landmark roles are present
    expect(screen.queryByRole("main")).not.toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  // ── action={null} ──────────────────────────────────────────────────────────

  it("renders no action wrapper when action is null", () => {
    const { container } = render(
      <ResourceNotFound label="Job" resourceId="job_1" action={null} />
    )
    // The action slot wrapper only renders when action != null;
    // querying for any button or link confirms nothing leaked through.
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    // The inner column (container.firstChild.firstChild) should have no div
    // children — the action wrapper div only renders when action != null.
    const innerColumn = (container.firstChild as HTMLElement).firstChild as HTMLElement
    const actionDivs = innerColumn.querySelectorAll("div")
    expect(actionDivs).toHaveLength(0)
  })

  // ── ref forwarding ─────────────────────────────────────────────────────────

  it("forwards ref to the root div", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <ResourceNotFound ref={ref} label="Job" resourceId="job_1" action={null} />
    )
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe("DIV")
  })

  // ── className merging ──────────────────────────────────────────────────────

  it("merges custom className onto the root element", () => {
    const { container } = render(
      <ResourceNotFound
        label="Job"
        resourceId="job_1"
        action={null}
        className="custom-not-found"
      />
    )
    expect((container.firstChild as Element)).toHaveClass("custom-not-found")
  })
})
