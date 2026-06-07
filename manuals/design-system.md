# A System That Builds Design System Codebases

An LLM-powered workflow that generates consistent design system code, ready for human review.

## How to Use

```
/add-component ComponentName
```

Implement an in house component on top of your design system

## How It Works

The system has two layers:

```
┌─────────────────────────────────────────┐
│  /add-component                         │  ← You run this
├─────────────────────────────────────────┤
│  design-system-architect agent          │  ← Executes the workflow
├─────────────────────────────────────────┤
│  Conventions + Workflow Definition      │  ← Rules the agent follows
└─────────────────────────────────────────┘
```

### Layer 1: The Agent

The `/add-component` skill spawns the **design-system-architect** agent (`.claude/agents/design-system-architect.md`), which autonomously:

1. Checks for duplicates in the component registry
2. Reads conventions and examines existing components for patterns
3. Considers composition (can this wrap an existing component?)
4. Creates the component folder at `packages/ui/src/components/<name>/`
5. Installs dependencies if needed
6. Implements `index.tsx` using the standard pattern
7. Writes tests (Jest + RTL, 80%+ coverage target)
8. Creates Storybook stories
9. Exports from barrel file and registers in `packages/ui/index.md`
10. Verifies tests pass

The agent stops and asks if required design tokens don't exist — it won't invent new tokens.

### Layer 2: Conventions

The agent follows rules defined in `docs/conventions/design-system.md`. These ensure every component:

**Uses the same pattern:**

```tsx
"use client";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#lib/cn";

const buttonVariants = cva("base-classes", {
  variants: { variant: {...}, size: {...} },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";
export { Button, buttonVariants };
```

**Has the same folder structure:**

```
packages/ui/src/components/button/
  index.tsx              # Component
  button.test.tsx        # Tests
  button.stories.tsx     # Storybook
```

**Follows the same principles:**

| Principle                          | What                                            | Why                                                                                             |
| ---------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Token-first**                    | Use tokens, never hardcode values               | Tokens are indirection — components know "primary" not "blue". Change once, applies everywhere. |
| **Composition over configuration** | Compound components over prop-heavy monoliths   | `<Card><CardHeader>` scales better than `<Card header={...}>`                                   |
| **Radix as foundation**            | Interactive components use Radix UI             | Keyboard nav, focus management, ARIA — solved problems                                          |
| **Tailwind + cva**                 | Styling via Tailwind + class-variance-authority | Type-safe variants, no CSS files to maintain                                                    |
| **Semantic separation**            | `variant` = identity, `size` = dimension        | Avoids `size="destructive"` confusion                                                           |

## What's in the Design System

**9 components:** generated using above refined process.

**Token categories:**

| Category   | File                    | Examples                                     |
| ---------- | ----------------------- | -------------------------------------------- |
| Colors     | `tokens/colors.css`     | `--color-surface-base`, `--color-primary`    |
| Spacing    | `tokens/spacing.css`    | `--spacing-1` (4px) to `--spacing-16` (64px) |
| Typography | `tokens/typography.css` | `--font-size-sm`, `--line-height-normal`     |
| Motion     | `tokens/motion.css`     | Animation durations and easing               |
| Elevation  | `tokens/elevation.css`  | Shadow utilities                             |

## Viewing the Design System

```bash
pnpm storybook
```

Opens at `http://localhost:6006` with all components, variants, and interactive controls.

## Using Components

Import styles once in your app's global CSS:

```css
/* app/globals.css */
@import "@repo/ui/styles.css";
```

Then use components anywhere:

```tsx
import { Button, Card, Input } from "@repo/ui";

<Card>
  <Input placeholder="Enter text" />
  <Button variant="outline">Submit</Button>
</Card>;
```

## Key Files

| Purpose             | Location                                    |
| ------------------- | ------------------------------------------- |
| Add component skill | `.claude/commands/add-component.md`         |
| Agent configuration | `.claude/agents/design-system-architect.md` |
| Conventions         | `docs/conventions/design-system.md`         |
| LLM component index | `packages/ui/index.md`                      |
| Component registry  | `packages/ui/src/index.ts`                  |
| Components          | `packages/ui/src/components/`               |
| Design tokens       | `packages/ui/src/styles/tokens/`            |
