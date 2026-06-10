import type { Meta, StoryObj } from "@storybook/react"
import { CodeBlock } from "./code-block"

const meta: Meta<typeof CodeBlock> = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  argTypes: {
    variant: {
      control: "select",
      options: ["inline", "block"],
    },
    code: { control: "text" },
    language: { control: "text" },
  },
  args: {
    variant: "inline",
    code: "hud set HUD_API_KEY=abc123",
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {}

// ── Variants ──────────────────────────────────────────────────────────────────
// inline vs. block (no language, with language, long-line overflow).

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">inline</p>
        <CodeBlock variant="inline" code="hud set HUD_API_KEY=abc123" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">block (no language)</p>
        <CodeBlock
          variant="block"
          code={`$ hud env create my-env\nCreating environment... done\nEnvironment ID: env_8xkP3`}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">block (with language label)</p>
        <CodeBlock
          variant="block"
          language="bash"
          code={`$ hud env create my-env\nCreating environment... done`}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">block (long line — overflow-x scroll)</p>
        <CodeBlock
          variant="block"
          language="bash"
          code="$ hud eval run --env my-env --agent ./agent.py --episodes 1000 --reward sparse --checkpoint ./checkpoints/step-500 --log-level debug --output-dir ./results/run-20260526"
        />
      </div>
    </div>
  ),
}

// ── Copy button z-index (regression) ─────────────────────────────────────────
// Exercises block variant with a tall multi-line snippet so the <pre> scrolls.
// The copy button must remain clickable above the <pre> (z-10 on the header div).

export const BlockScrollRegression: Story = {
  render: () => (
    <div className="flex flex-col gap-2 p-6" style={{ maxWidth: 640 }}>
      <p className="text-label text-muted-foreground">
        block — tall snippet (scroll inside pre, copy button stays clickable)
      </p>
      <CodeBlock
        variant="block"
        language="python"
        code={[
          "import hud",
          "",
          "client = hud.Client(api_key='YOUR_API_KEY')",
          "",
          "env = client.envs.create(",
          "    name='my-eval-env',",
          "    image='python:3.11-slim',",
          "    timeout=300,",
          ")",
          "",
          "agent = hud.Agent(",
          "    model='claude-opus-4-7',",
          "    system_prompt='You are a helpful assistant.',",
          ")",
          "",
          "results = client.eval.run(",
          "    env=env,",
          "    agent=agent,",
          "    episodes=50,",
          "    reward='sparse',",
          "    checkpoint='./checkpoints/step-500',",
          "    log_level='debug',",
          "    output_dir='./results/run-001',",
          ")",
          "",
          "print(f'Score: {results.mean_reward:.3f}')",
          "print(f'Episodes: {results.n_episodes}')",
        ].join("\n")}
      />
    </div>
  ),
}
