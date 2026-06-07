# Workflow Templates

Reference content for agents bootstrapping a new project. Frozen examples from a previous project (untolabs/thruscan blockchain browser) showing the **shape** of good artifacts at each phase.

## Rule

- **Read freely.** Agents load these files before generating new content for the corresponding phase.
- **Never copy verbatim.** Templates show structure, format, rationale discipline — not the answers. Generate fresh content for the new project's domain.
- **Never modify.** These files are frozen reference. If a template needs improvement, update it in the master template repo, not in a project copy.

## When each phase loads which template

| Phase            | Templates to load | What to learn from them |
| ---------------- | ----------------- | ----------------------- |
| `product-context`| _none yet_        | (add JTBD/research example template later) |
| `personality`    | _none yet_        | (add personality doc example later) |
| `wireframes`     | `wireframes/parity-grid-example.md` | parity grid format, drift log discipline |
| `design-system`  | `foundations/*.md` | token doc shape. Components come from shadcn (MCP or CLI) — see `.claude/agents/design-system-architect.md` |
| `screens`        | `patterns/*.md` | pattern doc shape, interaction documentation |
| (any phase)      | `self-review/_example-self-review.md` | self-review file format |

## Folder map

```
templates/
├── README.md                       ← this file
├── foundations/                    ← color, typography, spacing, radius, elevation,
│                                     motion, component-tokens — token doc examples
├── patterns/                       ← animation-library, blockchain-patterns —
│                                     interaction/visual pattern examples
├── wireframes/
│   └── parity-grid-example.md      ← (planned) filled parity grid example
└── self-review/
    └── _example-self-review.md     ← (planned) good self-review file example
```

## Why templates live here, not in `docs/`

`docs/` is the project tree — content there is **the project's own**, ships with the product, and is read by humans. Templates are agent-only reference scaffolding. Mixing them risks reference content leaking into the project. Hence the `.claude/workflows/templates/` location: agent-only, never shipped.

## Adding new templates

When you find a phase that produces a recurring artifact shape, freeze a good example here. Rules:

1. The example must come from a real, completed project — not invented
2. Strip any genuinely sensitive/proprietary content (keep names, brands, decisions — that's the value)
3. Add an entry to the "When each phase loads" table above
4. Reference the template from the relevant phase block in `.claude/workflows/phase-self-review.md`
