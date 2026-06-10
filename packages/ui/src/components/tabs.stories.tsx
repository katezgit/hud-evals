import type { Meta, StoryObj } from "@storybook/react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: () => (
    <div style={{ width: 520 }}>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trajectories">Trajectories</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-body text-muted-foreground">Overview panel.</p>
        </TabsContent>
        <TabsContent value="trajectories">
          <p className="text-body text-muted-foreground">Trajectories panel.</p>
        </TabsContent>
        <TabsContent value="logs">
          <p className="text-body text-muted-foreground">Logs panel.</p>
        </TabsContent>
        <TabsContent value="settings">
          <p className="text-body text-muted-foreground">Settings panel.</p>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

// ── Underline ─────────────────────────────────────────────────────────────────
// Underline variant — stepper / nav pattern. Full-width baseline rule, no pill container.

export const Underline: Story = {
  render: () => (
    <div style={{ width: 520 }}>
      <Tabs defaultValue="overview">
        <TabsList variant="underline">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trajectories">Trajectories</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-body text-muted-foreground">Overview panel.</p>
        </TabsContent>
        <TabsContent value="trajectories">
          <p className="text-body text-muted-foreground">Trajectories panel.</p>
        </TabsContent>
        <TabsContent value="logs">
          <p className="text-body text-muted-foreground">Logs panel.</p>
        </TabsContent>
        <TabsContent value="settings">
          <p className="text-body text-muted-foreground">Settings panel.</p>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

// ── UnderlineDisabled ─────────────────────────────────────────────────────────
// Stepper pattern — future steps locked.

export const UnderlineDisabled: Story = {
  render: () => (
    <div style={{ width: 520 }}>
      <Tabs defaultValue="model">
        <TabsList variant="underline">
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="taskset">Taskset</TabsTrigger>
          <TabsTrigger value="tasks" disabled>Tasks</TabsTrigger>
          <TabsTrigger value="config" disabled>Configuration</TabsTrigger>
        </TabsList>
        <TabsContent value="model">
          <p className="text-body text-muted-foreground">Select model — subsequent steps unlock after.</p>
        </TabsContent>
        <TabsContent value="taskset">
          <p className="text-body text-muted-foreground">Configure task set.</p>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

// ── Disabled ──────────────────────────────────────────────────────────────────
// Wizard/sequence pattern — subsequent steps locked until prior steps complete.

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 520 }}>
      <Tabs defaultValue="model">
        <TabsList>
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="taskset">Taskset</TabsTrigger>
          <TabsTrigger value="tasks" disabled>Tasks</TabsTrigger>
          <TabsTrigger value="config" disabled>Configuration</TabsTrigger>
        </TabsList>
        <TabsContent value="model">
          <p className="text-body text-muted-foreground">Select model — subsequent steps unlock after.</p>
        </TabsContent>
        <TabsContent value="taskset">
          <p className="text-body text-muted-foreground">Configure task set.</p>
        </TabsContent>
      </Tabs>
    </div>
  ),
}
