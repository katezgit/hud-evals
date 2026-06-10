import type { Meta, StoryObj } from "@storybook/react"
import { AvatarGroup } from "./avatar-group"
import type { AvatarGroupItem } from "./avatar-group"

// ── Fixtures ──────────────────────────────────────────────────────────────────

const IMAGE_SRC = "https://api.dicebear.com/7.x/thumbs/svg?seed="

function img(seed: string): string {
  return `${IMAGE_SRC}${seed}`
}

const FIVE_ITEMS: AvatarGroupItem[] = [
  { id: "u1", src: img("alice"), alt: "Alice", initials: "AL" },
  { id: "u2", src: img("bob"),   alt: "Bob",   initials: "BO" },
  { id: "u3", src: img("carol"), alt: "Carol", initials: "CA" },
  { id: "u4", src: img("dave"),  alt: "Dave",  initials: "DA" },
  { id: "u5", src: img("eve"),   alt: "Eve",   initials: "EV" },
]

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof AvatarGroup> = {
  title: "Components/AvatarGroup",
  component: AvatarGroup,
  parameters: { layout: "padded" },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    maxVisible: {
      control: { type: "number", min: 1, max: 10 },
    },
  },
  args: {
    items: FIVE_ITEMS,
    size: "sm",
    maxVisible: 3,
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {}

// ── Variants ──────────────────────────────────────────────────────────────────

export const Variants: Story = {
  name: "Variants — sizes",
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-label text-muted-foreground">xs — 20px, -ml-1</span>
        <AvatarGroup items={FIVE_ITEMS} size="xs" maxVisible={3} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-label text-muted-foreground">sm (default) — 28px, -ml-2</span>
        <AvatarGroup items={FIVE_ITEMS} size="sm" maxVisible={3} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-label text-muted-foreground">md — 32px, -ml-2</span>
        <AvatarGroup items={FIVE_ITEMS} size="md" maxVisible={3} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-label text-muted-foreground">lg — 40px, -ml-3</span>
        <AvatarGroup items={FIVE_ITEMS} size="lg" maxVisible={3} />
      </div>
    </div>
  ),
}

// ── Z-order ───────────────────────────────────────────────────────────────────

export const ZOrder: Story = {
  name: "Z-order — first on top",
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-label text-muted-foreground">
          First avatar (Alice) should visually sit on top of the stack
        </span>
        <AvatarGroup items={FIVE_ITEMS} size="md" maxVisible={4} />
      </div>
    </div>
  ),
}

// ── Overflow ──────────────────────────────────────────────────────────────────

export const Overflow: Story = {
  name: "Overflow chip — mono font",
  render: () => (
    <div className="flex flex-col gap-6">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="text-label text-muted-foreground">{size} — overflow chip</span>
          <AvatarGroup items={FIVE_ITEMS} size={size} maxVisible={2} />
        </div>
      ))}
    </div>
  ),
}
