# Product docs — folder guideline

This folder holds the **product brief and its derived design anchors**. Every design phase (personality → ux-flows → design-tokens → wireframes → screens → components → motion) and every domain review reads here for grounding. Engineering agents do not read here — they consume the artifacts (tokens, specs, screens) that personality + personas + workflow produce upstream.

The bare one-paragraph brief at [`product.md`](./product.md) seeds this folder; the files here expand it into the anchors design needs.

---

## What lives here

| File | Role | Filled by | Type |
| --- | --- | --- | --- |
| [`platform.md`](platform.md) | Platform overview — what the product is, surfaces, primitives, domain vocabulary | Operator + product-designer at project start | Template |
| [`personas.md`](personas.md) | Primary + secondary personas; persona anti-patterns (the misreads to guard against) | Operator + product-designer at project start | Template |
| [`alex-workflow.md`](alex-workflow.md) | Primary persona's phased journey through the product, with design implications per phase | product-designer, from operator interviews | Template |
| [`alex-user-stories.md`](alex-user-stories.md) | Concrete user stories for the primary persona, organized by workflow phase | product-designer | Template |
| [`personality.md`](personality.md) | Product personality — adjectives, anti, statement, primary surface, sacrificial choices, voice, interactions, moodboard | product-designer, **derived** from the four files above | Template |

> The two `alex-*` files use the placeholder primary-persona name `Alex` (secondary is `Sam`). When this folder is reused for a new project, rename the files and find/replace `Alex` and `Sam` throughout `docs/product/`, `CLAUDE.md`, `.claude/agents/product-designer.md`, `.claude/agents/product-domain-reviewer.md`, and `.claude/workflows/audit-patterns.md`. The shape — one workflow doc + one user-stories doc per primary persona — is the convention; the name itself does not matter.

---

## Derivation order — fill top-down

Each step feeds the next. Skipping or reversing the order produces design decisions ungrounded in product reality.

1. **`platform.md`** — what the product is, the technical domain, the primitive vocabulary that every label and error message will use. Starts from `../product.md`, expands the surfaces and primitives.
2. **`personas.md`** — who we're designing for. Primary first, secondary as sanity gate (designs that optimize for secondary at primary's expense are wrong). Include anti-patterns: the persona misreads caught in past reviews.
3. **`alex-workflow.md`** — how the primary moves through the product, phase by phase. Each phase has explicit design implications (what the dashboard must do, what it must not do).
4. **`alex-user-stories.md`** — concrete jobs the primary executes per phase. The screens phase derives wireframes from these stories.
5. **`personality.md`** — derive from (1) + (2) + (3) + (4). Fill the template top-down.

---

## What data fills each file

### `platform.md`
- What the product is in 2–3 paragraphs (concrete, not aspirational).
- Surfaces (CLI, web app, SDK, etc.) and the primitives each surfaces — your domain's nouns.
- **Terminology section** — canonical word for each concept + the banned synonyms. Every UI label, error, spec, and code identifier must use the canonical term verbatim. Enforced by `product-domain-reviewer`, `frontend-reviewer`, and `storybook-documenter`.
- User types (rough sketch, expanded in `personas.md`).

> **What does NOT live here.** Top-level nav / IA structure is *not* a discovery output — it emerges from `wireframes`/`screens` once the jobs are clear. Pre-committing nav labels in `platform.md` would force IA decisions before the workflow that justifies them.

### `personas.md`
- Primary persona: **What** (role, context, technical surface they live in), **When** (cadence, triggers, daypart), **Why** (the metric they're judged on), **In scope** / **Out of scope** (which surfaces serve them, which don't).
- Secondary persona: same structure. Treated as sanity gate, not target.
- Anti-patterns: misreads of each persona that have been caught in review, with the design implication for each.

### `alex-workflow.md`
- 3–7 phases the primary moves through, in order.
- Each phase: what they're doing, what tool/surface they use, what success looks like, what failure looks like.
- Design implications per phase: the rule each phase imposes on the dashboard.

### `alex-user-stories.md`
- One story per concrete job the primary executes inside the workflow phases.
- Format: "As {persona}, when {trigger}, I want to {action} so that {outcome}." Plus: which phase, which surface, what data the screen must show.
- These are the input to wireframes + screen specs.

### `personality.md`
- Fill the template's slots from the inputs above. See the template's in-file hints.

---

## How agents use this folder

- **Always** anchor design / product / pattern calls here (per `CLAUDE.md`). External prior art (Linear, Vercel, MUI, etc.) is input to the option space; this folder is the constraint that evaluates it.
- **Designers and reviewers** read on-demand when producing or auditing artifacts. The `personality.md` TL;DR is the default Read target; full doc only when deriving motion tokens or running a tone audit.
- **Engineering agents do not read here.** They consume design tokens, component specs, and screen specs. If an engineer needs personality-flavored guidance, that's a sign the artifact spec is incomplete — file a designer task, don't bypass.
- **Folder discovery convention:** read this `index.md` before any file in the folder.

---

## Template reuse model

Every file in this folder is a template — structural skeleton with `{{...}}` placeholders. When this folder is reused for a new project, each stays as the skeleton; the new project re-derives every slot top-down per the derivation order above.

- **Rename:** the two `alex-*` files get renamed to match the primary persona's actual name (see note above the derivation order). Other filenames stay.
- **Find/replace:** swap `Alex` and `Sam` across `docs/product/`, `CLAUDE.md`, and the three agent / workflow files listed in the rename note.
- **Do not delete sections.** If a section doesn't apply to the new product, leave the heading and mark `N/A — {{reason}}`. The structure is the discipline; empty slots surface gaps.
