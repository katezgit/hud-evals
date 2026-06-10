import type { Meta, StoryObj } from "@storybook/react"

import { Avatar, AvatarImage, AvatarFallback } from "./avatar"

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Avatar diameter: xs=20px, sm=28px, md=32px (default), lg=40px",
    },
    shape: {
      control: "select",
      options: ["circle", "square"],
      description: "circle = user avatars; square = org/team avatars",
    },
  },
  args: {
    size: "md",
    shape: "circle",
  },
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: {
    size: "md",
    shape: "circle",
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://i.pravatar.cc/150?img=3" alt="Aman Patel" />
      <AvatarFallback>AP</AvatarFallback>
    </Avatar>
  ),
}

// ── Variants ──────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Size scale */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-muted-foreground)",
            marginBottom: 12,
          }}
        >
          Size scale — xs=20 sm=28 md=32 lg=40
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar size="xs" shape="circle">
            <AvatarFallback>XS</AvatarFallback>
          </Avatar>
          <Avatar size="sm" shape="circle">
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <Avatar size="md" shape="circle">
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <Avatar size="lg" shape="circle">
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Shape */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-muted-foreground)",
            marginBottom: 12,
          }}
        >
          Shape — md size
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar size="md" shape="circle">
            <AvatarFallback>CI</AvatarFallback>
          </Avatar>
          <Avatar size="md" shape="square">
            <AvatarFallback>SQ</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Fallback — inverted surface (mono semibold) */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-muted-foreground)",
            marginBottom: 12,
          }}
        >
          Fallback — inverted (bg-foreground / text-panel), all sizes
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="xs"><AvatarFallback>KZ</AvatarFallback></Avatar>
          <Avatar size="sm"><AvatarFallback>KZ</AvatarFallback></Avatar>
          <Avatar size="md"><AvatarFallback>KZ</AvatarFallback></Avatar>
          <Avatar size="lg"><AvatarFallback>KZ</AvatarFallback></Avatar>
        </div>
      </div>

      {/* Image load vs fallback */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-muted-foreground)",
            marginBottom: 12,
          }}
        >
          Image load vs. fallback (broken src)
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar size="md" shape="circle">
            <AvatarImage src="https://i.pravatar.cc/150?img=3" alt="With image" />
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
          <Avatar size="md" shape="circle">
            <AvatarImage src="/does-not-exist.jpg" alt="Broken image" />
            <AvatarFallback>BK</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  ),
}
