# Project State

**Current phase:** `discovery`
**Last transition:** {{YYYY-MM-DD}}
**Blocking items:** _none_

> **Agents:** after reading this file, load `.claude/workflows/phase-self-review.md` and follow its trigger rules before producing artifacts or proposing a phase transition. (Human readers: skip — workflow is agent-only.)
>
> **Live session registry** (who's working on what right now): see `.state/in-flight-work.md` — auto-maintained by SessionStart/SessionEnd hooks.

## Phase

One of: `discovery → (personality ‖ ux-flows) → design-tokens → wireframes → screens → components → patterns → motion → implementation → design-qa → review → ship`

`personality` and `ux-flows` run in parallel after discovery; both must be approved before `wireframes`. See `CLAUDE.md` → "Project State Machine" for entry/exit criteria and canonical paths per phase.

## Sub-status

_Filled in once a phase is in flight. Use tables to track tiered work (e.g. design-system tiers, screen specs, integration progress)._

Example for `implementation`:

| Tier                  | Build | A11y review | Storybook stories | Notes |
| --------------------- | ----- | ----------- | ----------------- | ----- |
| Tier 1 — Primitives   |       |             |                   |       |
| Tier 2 — Patterns     |       |             |                   |       |
| Tier 3 — Page Modules |       |             |                   |       |

## Phase history

- {{YYYY-MM-DD}} → `discovery` (project bootstrapped from template)

## Artifacts

- Discovery anchors: `docs/product/{platform,personas,[primary]-workflow,[primary]-user-stories}.md` — _pending_
- Personality: `docs/product/personality.md` — _pending_
- UX flows: `docs/design/flows/` — _pending_
- Design tokens: `docs/design/foundations/{color,typography,spacing,radius,elevation}.md` — _pending_
- Wireframes: `docs/design/screens/[feature].wireframe.md` — _pending_
- Screen specs: `docs/design/screens/[feature].screen.md` — _pending_
- Motion: `docs/design/foundations/motion.md` + `docs/design/components/[name]/animations.md` — _pending_
- Design-QA review: `docs/design/reviews/qa-{YYYY-MM-DD}.md` — _pending_ (phase self-reviews and domain-reviews live in `.intermediate/reviews/`)
