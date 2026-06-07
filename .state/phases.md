# Phase Registry

Single source of truth for what each phase requires. `.state/state.md` declares which phases the project is currently in; agents read THIS file to look up the rules that apply.

Two orthogonal axes:

- **Design phases** — gate design work. Long sequence of one-shot phases that produce design artifacts.
- **Lifecycle phases** — gate code work. Where the project sits on the greenfield→production continuum.

A project always has both a current design phase AND a current lifecycle phase.

---

## Lifecycle phases

| Phase        | Description                                | Branching                                              | Self-review gates                                                                            | Merge gate                                  | Post-merge                                  |
| ------------ | ------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| `greenfield` | Pre-launch, no live users                  | Feature worktree for multi-agent chains; solo agents may commit to `main` directly | Build + type check + lint (no new warnings)                                                  | Agent may auto-merge after gates pass       | Reload dev server if there's runtime impact |
| `production` | Live user; every regression is felt        | Always feature branch + PR                             | Build + type check + lint + tests + browser verification + marker rot + scope clean          | Kate-only — agents NEVER merge to `main`    | After Kate merges: `git pull --ff-only` + reload dev server |

### PR body template (lifecycle phase `production` only)

```markdown
## Summary
<1–3 bullets: what changed and why>

## Self-review
- [x] Build: pass
- [x] Type check: pass
- [x] Lint: no new warnings
- [x] Tests: pass / N/A (reason)
- [x] Browser verification: <verdict, or "N/A — frontend infrastructure only" / "could not verify in browser">
- [x] No marker rot
- [x] Scope clean

## Test plan
- [ ] <step Kate runs to verify>
```

In `greenfield`, PRs are optional. In `production`, PRs are mandatory.

### Lifecycle phase history

Recorded in `.state/state.md` → Phase history.

---

## Design phases

Phases gate which agents run and what artifacts are valid. Each phase exits via a self-review at `.intermediate/reviews/{phase}-self-review-{YYYY-MM-DD}.md` — see [`.claude/workflows/phase-self-review.md`](../.claude/workflows/phase-self-review.md). Reviews are process artifacts (audit trail of the gate run), not canonical record — they stay in `.intermediate/`.

| Phase            | Owner                                             | Entry                          | Exit artifact                                                                       | Path                                                                                                                              |
| ---------------- | ------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `discovery`      | product-designer                                  | Product brief exists           | Product anchors: platform + personas + primary workflow + user stories. Raw research notes stay in `.intermediate/discovery/{topic}/`. | `docs/product/{platform,personas,[primary]-workflow,[primary]-user-stories}.md`                                                   |
| `personality`    | product-designer                                  | Discovery approved             | Personality doc (adjectives, anti, statement, moodboard) — parallel with `ux-flows` | `docs/product/personality.md`                                                                                                     |
| `ux-flows`       | product-designer                                  | Discovery approved             | Task flows + user journeys — parallel with `personality`                            | `docs/design/flows/[feature].md`                                                                                                  |
| `design-tokens`  | product-designer                                  | Personality approved           | Tokens derived from personality (shadcn + Tailwind v4 architecture)                 | `docs/design/foundations/{color,typography,spacing,radius,elevation}.md`                                                          |
| `wireframes`     | product-designer                                  | Tokens + ux-flows approved     | Low-fi wireframes + parity grid (human-approved BEFORE screens)                     | `docs/design/screens/[feature].wireframe.md`                                                                                      |
| `screens`        | product-designer                                  | Wireframes approved            | Specs covering ALL states (default, empty, loading, error, success, disabled)       | `docs/design/screens/[feature].screen.md`                                                                                         |
| `components`     | product-designer                                  | Pattern appears in 2–3 screens | Per-component anatomy + states                                                      | `docs/design/components/[name]/spec.md`                                                                                           |
| `patterns`       | product-designer                                  | Cross-component need surfaces  | Reusable interaction choreography                                                   | `docs/design/patterns/[name].md`                                                                                                  |
| `motion`         | motion-designer                                   | Screens approved               | Motion tokens + principles + per-component animations                               | `docs/design/foundations/motion.md`, `docs/design/guidelines/motion-principles.md`, `docs/design/components/[name]/animations.md` |
| `implementation` | design-system-architect → staff-frontend-engineer | Motion approved                | Shipped components + integrated app screens                                         | `packages/ui/`, `apps/`                                                                                                           |
| `design-qa`      | product-designer + motion-designer                | Implementation complete        | Pixel diff vs spec (screenshots per visual-qa workflow), motion timing, polish pass | `docs/design/reviews/qa-{YYYY-MM-DD}.md`                                                                                          |
| `review`         | accessibility-expert + reviewer                   | Design-QA approved             | a11y + code pass                                                                    | —                                                                                                                                 |
| `ship`           | release-manager                                   | Review pass                    | Merged + tagged release                                                             | —                                                                                                                                 |

**Design phase rules:**

- Never skip a phase. Missing upstream artifact? Escalate via `agent:{topic}` task — do not improvise.
- On reaching any exit artifact, STOP. Run the Artifact Rule (see CLAUDE.md), post a summary, wait for human approval. Do not spawn the next phase, do not edit `.state/state.md`. Only the user advances phases.
