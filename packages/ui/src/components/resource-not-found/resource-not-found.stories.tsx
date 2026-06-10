import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "../button"
import { ResourceNotFound, type ResourceNotFoundProps } from "./resource-not-found"

const meta = {
  title: "Components/ResourceNotFound",
  component: ResourceNotFound,
  argTypes: {
    variant: {
      control: "select",
      options: ["unavailable", "wrong-workspace"],
    },
    label: { control: "text" },
    resourceId: { control: "text" },
    headingLevel: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
    },
  },
  args: {
    variant: "unavailable",
    label: "Job",
    resourceId: "job_9f3x",
    headingLevel: "h2",
  } as ResourceNotFoundProps,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Displayed when a HUD resource (Job, Trace, Taskset, Environment) cannot be found — either because it no longer exists (`variant=\"unavailable\"`) or because it lives in a different workspace (`variant=\"wrong-workspace\"`). The component self-centers inside its content slot (`flex items-center justify-center w-full h-full p-8`); callers drop it directly into a route content area with no additional centering wrapper needed. The `action` slot is caller-owned: pass a Next.js `<Link>` (or any element) styled with `buttonVariants({ variant: \"primary\" })` for the recovery CTA. The component has no routing knowledge.",
      },
    },
  },
} satisfies Meta<ResourceNotFoundProps>

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <ResourceNotFound
      {...(args as ResourceNotFoundProps)}
      action={
        <Button variant="primary">
          Go to Jobs
        </Button>
      }
    />
  ),
}

// ── Default ───────────────────────────────────────────────────────────────────
// Canonical unavailable state: Job, with primary recovery CTA.

export const Default: Story = {
  render: () => (
    <ResourceNotFound
      label="Job"
      resourceId="job_9f3x"
      action={
        <Button variant="primary">
          Go to Jobs
        </Button>
      }
    />
  ),
}

// ── Trace ─────────────────────────────────────────────────────────────────────
// HUD vocabulary composition: Trace resource type.

export const Trace: Story = {
  render: () => (
    <ResourceNotFound
      label="Trace"
      resourceId="trc_8a2b"
      action={
        <Button variant="primary">
          Go to Traces
        </Button>
      }
    />
  ),
}

// ── Taskset ───────────────────────────────────────────────────────────────────
// HUD vocabulary composition: Taskset resource type.

export const Taskset: Story = {
  render: () => (
    <ResourceNotFound
      label="Taskset"
      resourceId="ts_3c1d"
      action={
        <Button variant="primary">
          Go to Tasksets
        </Button>
      }
    />
  ),
}

// ── Environment ───────────────────────────────────────────────────────────────
// HUD vocabulary composition: Environment resource type.

export const Environment: Story = {
  render: () => (
    <ResourceNotFound
      label="Environment"
      resourceId="env_5e7f"
      action={
        <Button variant="primary">
          Go to Environments
        </Button>
      }
    />
  ),
}

// ── WrongWorkspace ────────────────────────────────────────────────────────────
// Second variant: resource exists but belongs to a different workspace.
// Sub-copy reads "Switch to {workspaceName} to view it."

export const WrongWorkspace: Story = {
  render: () => (
    <ResourceNotFound
      variant="wrong-workspace"
      label="Trace"
      resourceId="trc_8a2b"
      workspaceName="Acme"
      action={
        <Button variant="secondary">
          Switch workspace
        </Button>
      }
    />
  ),
}

// ── H1Heading ─────────────────────────────────────────────────────────────────
// headingLevel="h1" opt-in: for unauthenticated or route-level takeover surfaces
// where no other page-level <h1> is rendered (e.g. 404 boundary with no AppShell header).

export const H1Heading: Story = {
  render: () => (
    <ResourceNotFound
      label="Job"
      resourceId="job_9f3x"
      headingLevel="h1"
      action={
        <Button variant="primary">
          Go to Jobs
        </Button>
      }
    />
  ),
}

// ── InContext ─────────────────────────────────────────────────────────────────
// Component inside a mock route content slot — no centering wrapper needed.
// The component self-centers via its outer shell (flex items-center justify-center
// w-full h-full p-8). The slot provides height; the component handles centering.

export const InContext: Story = {
  render: () => (
    <div className="min-h-[400px] bg-background">
      <ResourceNotFound
        label="Job"
        resourceId="job_9f3x"
        action={
          <Button variant="primary">
            Go to Jobs
          </Button>
        }
      />
    </div>
  ),
}
