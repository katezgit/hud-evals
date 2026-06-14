# Phase Self-Review Workflow

> **Audience: orchestrator.** Load this doc when a phase is about to exit (all planned outputs exist) or before dispatching the first agent of the next phase.

## The contract

Every design phase exits through a self-review gate combining two passes:

1. **Phase-owner pass** — orchestrator extracts the phase-specific checks below, inlines them in a brief dispatched to the phase owner (designer/engineer), receives PASS/FAIL + drift log + open questions. The phase owner's producer context lights up the semantic checks.
2. **Adversarial pass** — orchestrator spawns a fresh sub-agent with no producer context for the worst-enemy review.

The orchestrator aggregates both into the verdict file at `.intermediate/reviews/{phase}-self-review-{YYYY-MM-DD}.md`. The aggregated file is the artifact the human reviews — not the raw outputs. No phase transition is proposed without it.

## Reference templates

Reference content for every phase lives in `.claude/workflows/templates/`. **Templates are agent-only, frozen, never copied verbatim.** Load them to see the *shape* of good artifacts; generate fresh content for your project's domain.

See `.claude/workflows/templates/README.md` for the index of which templates each phase loads.

## Marker hygiene (MANDATORY at every phase exit)

The template seeds new projects with two kinds of markers that must NOT survive into shipped artifacts:

| Marker | Meaning | Action |
| ------ | ------- | ------ |
| `{{PLACEHOLDER}}` | Atomic value the agent must replace (project name, paths, IDs, dates, ports) | Replace with the real value |
| `<!-- TODO(agent): … -->` | Section the agent must generate following the embedded instruction | Generate content, remove the comment |

**Before writing the self-review file, the orchestrator runs this grep against the files this phase produced or modified:**

```bash
grep -rEn '\{\{[A-Z_]+\}\}|TODO\(agent\)' <files-touched-this-phase>
```

**Any hit = `needs-more-work` verdict.** Mechanical and non-negotiable — cheapest possible way to catch unfilled scaffolding before it ships.

> **Note:** the grep MUST NOT scan `.claude/workflows/templates/` — those files are reference and may legitimately contain marker-like text. Scope the grep to project files only (`docs/`, `apps/`, `packages/*/src/`, etc.).

## Trigger

1. **Exit check** — phase owner has returned and all planned outputs for the current phase exist → run the gate for *this* phase before posting the human-approval ping.
2. **Entry check** — about to dispatch the first agent of the next phase → verify the previous phase's verdict file exists with `ready-for-human-review` AND human approval recorded in `state.md` → Phase history.

If either gate fails, do not proceed. Escalate via `agent:{topic}` task.

### Detecting "all planned outputs exist"

Three signals, in order of reliability:

1. **Task list** (multi-output phases — wireframes, screens, components). Per CLAUDE.md task discipline, the orchestrator creates a task per planned artifact when entering the phase. All those tasks marked `completed` → all artifacts exist.
2. **Exit-artifact path check** (single-output phases — `personality.md`, `motion.md`, `flows/[feature].md`). File at the canonical path exists → phase complete.
3. **Operator signal** — explicit ("done with wireframes, move to screens") or implicit ("last artifact looks good, what's next") — overrides both above.

If signal 1 is ambiguous (e.g., wireframes might need one more sibling), ask the operator before running the gate. Do not infer scope silently.

## Self-review file

Path: `.intermediate/reviews/{phase}-self-review-{YYYY-MM-DD}.md`

> Self-reviews are process artifacts — they document that the gate ran. Future agents read the actual deliverables (tokens, specs, screens), not the review. Keeping reviews in `.intermediate/` is consistent with [CLAUDE.md → "Intermediate vs canonical artifacts"](../../CLAUDE.md).

> **Directory creation.** `.intermediate/reviews/` is gitignored and may not exist on disk yet (especially on a fresh project). Before writing, run `mkdir -p .intermediate/reviews/`. The orchestrator owns this — do not assume an upstream step created it.

Required sections:

```markdown
# {Phase} self-review — {YYYY-MM-DD}

## Scope
- list of files/artifacts produced this phase

## Consistency checks
- run the phase-specific checks below; mark each PASS / FAIL / N/A

## Drift log
- anything that deviates from upstream decisions, with rationale

## Adversarial pass
- summary of failures surfaced by the worst-enemy reviewer (see "Adversarial pass" section below)
- each item: what fails, why it fails, severity (blocker / nit)
- list separately from any praise — agreement and praise are independent sycophancy modes

## Open questions for human
- decisions you couldn't make alone

## Verdict
`ready-for-human-review` | `needs-more-work`
(if needs-more-work, list what's blocking)
```

After writing the file, post a one-line human-approval ping referencing the verdict and the verdict file path. The self-review itself is a process artifact in `.intermediate/` and is not published via Oak — Oak publication is reserved for canonical artifacts in `docs/` (the phase outputs the human reviews alongside the verdict).

## Phase-specific checks

### `personality`

- [ ] Adjectives, anti-personality, and statement do not contradict each other
- [ ] Moodboard references are reachable and annotated with what to take from each

### `design-system`

- [ ] Every token has a usage rationale
- [ ] No token overlaps or near-duplicates (e.g. two greys 2% apart)
- [ ] Color pairs meet the a11y floor the personality demands
- [ ] Token names match `docs/conventions/` naming rules

### `wireframes` ← **gates entry into `screens`**

- [ ] `_parity-grid.md` has a row for every screen, no empty cells
- [ ] Every sibling pair matches on all 5 axes (header / container / tabs / expand / footnote) OR has a drift-log entry with rationale
- [ ] No wireframe references a token that doesn't exist in `design-system`
- [ ] A non-designer can read the parity grid and tell which screens are siblings

### `screens`

- [ ] Every screen spec inherits its structure from an approved wireframe
- [ ] No new structural decision was invented at spec time (any new structure → send back to `wireframes`)
- [ ] Peer Parity Check section is present and matches the wireframe parity grid
- [ ] Component anatomy/states reference only tokens defined in `design-system`

### `motion`

- [ ] Motion tokens are a closed set (durations, easings, springs)
- [ ] Every stateful component from `screens` has an `animations.md`
- [ ] No new layout or non-motion token decisions introduced

### `implementation`

- [ ] Components match the screen spec 1:1 (deviations logged)
- [ ] Every component has Storybook story + a11y pass before "done"
- [ ] No hardcoded values that should be tokens

## Adversarial pass (MANDATORY before verdict)

The phase-specific checks above catch *known* failure modes. The adversarial pass catches *unknown* drift and the natural sycophancy of an agent reviewing its own work.

**Procedure:**

1. **Spawn a fresh sub-agent** via the Task tool. It MUST have no shared context with the producer — no memory, no producer's reasoning, no prior approval signals. The research is clear: personalization and shared context amplify sycophancy; user rebuttal collapses honest critique.
2. **Persona**: "You are the worst enemy of this artifact. Your job is to find every reason it fails, every drift from upstream decisions, every place it cuts a corner. You do not soften, hedge, or balance criticism with praise. If it is good, say nothing — only failures are in scope."
3. **Inputs**: only the artifacts produced this phase + the upstream artifacts they must inherit from. Do NOT include the producer's self-assessment or any "this is the plan" framing.
4. **Required output structure** (decomposition matters — agreement and praise are encoded on different latent directions, attack both):
   - **Structural failures** — does it violate upstream decisions or invent new ones?
   - **Internal contradictions** — does it contradict itself?
   - **Missing states/edges** — what scenarios are unhandled?
   - **Hidden hedging** — language that softens a real problem (e.g., "could potentially", "in some cases")
   - **Verdict from the enemy**: ship-blocker / fix-before-ship / nit
5. **Copy the enemy's findings into the "Adversarial pass" section** of the self-review file verbatim. Do not edit, soften, or rebut them in the self-review — open questions go in "Open questions for human."
6. **Any blocker = `needs-more-work` verdict.** Non-negotiable.

## Why this workflow exists

Catching inconsistency at wireframes is 10–100× cheaper than catching it at specs, which is 10–100× cheaper than catching it at code. The self-review is the mechanism that makes each phase catch its own drift before the next phase inherits it.

The human's attention is reserved for **decisions**, not for fixing drift the agent should have caught itself. A `needs-more-work` verdict with an honest list is far more valuable than a false `ready-for-human-review`.
