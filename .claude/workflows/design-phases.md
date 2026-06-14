# Design Phase State Machine

Phases gate which agents run and what artifacts are valid. **Current phase lives in [`.state/state.md`](../../.state/state.md)** — read before starting work.

| Phase            | Owner                                             | Entry                          | Exit artifact                                                                       | Path                                                                                                                              |
| ---------------- | ------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `discovery`      | product-designer                                  | Product brief exists           | Product anchors: platform + personas + primary workflow + user stories. Raw research notes stay in `.intermediate/discovery/{topic}/`. | `docs/product/{platform,personas,[primary]-workflow,[primary]-user-stories}.md`                                                   |
| `personality`    | product-designer                                  | Discovery approved             | Personality doc (adjectives, anti, statement, moodboard) — parallel with `ux-flows` | `docs/product/personality.md`                                                                                                     |
| `ux-flows`       | product-designer → `product-domain-reviewer` gate     | Discovery approved             | Task flows + user journeys — parallel with `personality`. **Exit requires `product-domain-reviewer` PASS.** | `docs/design/flows/[feature].md`                                                                                                  |
| `design-tokens`  | product-designer                                  | Personality approved           | Tokens derived from personality — shadcn semantic names (background/foreground/primary/secondary/muted/accent/destructive/border/input/ring + chart/sidebar), OKLCH colors, light + dark pairs | `docs/design/foundations/{color,typography,spacing,radius,elevation}.md`                                                          |
| `wireframes`     | product-designer → `product-domain-reviewer` gate     | Tokens + ux-flows approved     | Low-fi wireframes + parity grid (human-approved BEFORE screens). **Exit requires `product-domain-reviewer` PASS.** | `docs/design/screens/[feature].wireframe.md`                                                                                      |
| `screens`        | product-designer                                  | Wireframes approved            | Specs covering ALL states (default, empty, loading, error, success, disabled)       | `docs/design/screens/[feature].screen.md`                                                                                         |
| `components`     | product-designer                                  | Pattern appears in 2–3 screens | Per-component anatomy + states                                                      | `docs/design/components/[name]/spec.md`                                                                                           |
| `patterns`       | product-designer                                  | Cross-component need surfaces  | Reusable interaction choreography                                                   | `docs/design/patterns/[name].md`                                                                                                  |
| `motion`         | motion-designer                                   | Screens approved               | Motion tokens + principles + per-component animations                               | `docs/design/foundations/motion.md`, `docs/design/guidelines/motion-principles.md`, `docs/design/components/[name]/animations.md` |
| `implementation` | design-system-architect → staff-frontend-engineer | Motion approved                | Shipped components + integrated app screens                                         | `packages/ui/`, `apps/`                                                                                                           |
| `design-qa`      | product-designer + motion-designer                | Implementation complete        | Pixel diff vs spec (screenshots per visual-qa workflow), motion timing, polish pass | `docs/design/reviews/qa-{YYYY-MM-DD}.md`                                                                                          |
| `review`         | accessibility-expert + reviewer                   | Design-QA approved             | a11y + code pass                                                                    | —                                                                                                                                 |
| `ship`           | release-manager                                   | Review pass                    | Merged + tagged release                                                             | —                                                                                                                                 |

**File naming in `docs/design/screens/`:** `[feature].wireframe.md` (low-fi, wireframes phase) / `[feature].screen.md` (hi-fi, all states, screens phase).

## Phase gate rules

- Never skip a phase. Missing upstream artifact? Escalate via `agent:{topic}` task — do not improvise.
- **Intermediate work-in-progress lives in `.intermediate/`, not `docs/`.** During any phase — especially `discovery` — drafts, exploration files, persona-data sessions, vocabulary brainstorms, and any data-input dialogue with the Operator land in `.intermediate/{phase}/{topic}/` (gitignored). Only the **Exit artifact** column path crosses into `docs/`, and only after Operator approval. The Exit artifact column is the *promotion target* — never the workspace. See [CLAUDE.md → Hard rules → "Intermediate vs canonical artifacts"](../../CLAUDE.md).
- **On reaching any Exit artifact, STOP.** Run the [Designer Artifact Rule](#designer-artifact-rule), post a summary, wait for explicit human approval. Do not spawn the next phase, do not edit `.state/state.md`. Only the user advances phases.
- Every phase exits via a self-review at `.intermediate/reviews/{phase}-self-review-{YYYY-MM-DD}.md` — **orchestrator-owned**: the main thread detects "all planned outputs exist", loads [`phase-self-review.md`](phase-self-review.md), and runs the gate (consistency checks + adversarial pass + verdict). Phase-owning agents (designer, engineer) do not load the workflow doc — they produce artifacts and return. Reviews are process artifacts (audit trail of the gate run), not canonical record.
- **`ux-flows` and `wireframes` additionally require a domain-review gate.** After the designer's self-review and before the human-approval ping, the orchestrator dispatches [`product-domain-reviewer`](../agents/product-domain-reviewer.md) against the artifact. The reviewer enforces persona scope (primary vs. secondary), workflow-phase fidelity, product vocabulary, and primitive coherence — all sourced from `docs/product/`. **Reviewer FAIL → designer revises and re-submits; never bypass.** Reviewer output is filed at `.intermediate/reviews/{phase}-domain-review-{YYYY-MM-DD}.md`. PASS verdict (or PASS-with-warnings the designer has addressed) is required before the Designer Artifact Rule runs.

## Designer Artifact Rule

Every turn that produces a design artifact (any artifact owned by `product-designer` or `motion-designer`) MUST run in the same turn:

1. `oak_save_note` — title + summary + file path. Every referenced file is a clickable markdown link, scheme chosen by file type:
   - **HTML previews (`.intermediate/design/{topic}/[name].html`)** — exploration artifacts, gitignored. Link scheme depends on whether a serving symlink has been configured under `apps/web/public/` pointing at `.intermediate/design/`:
     - **If a `/preview/` symlink exists** → use `/preview/{topic}/[filename].html` (relative URL via Oak web app origin).
     - **If no symlink yet** → use `vscode://file/ABSOLUTE_PATH` so the Operator can open it locally; surface in the artifact summary that the Oak-web symlink for `.intermediate/` is not yet wired.
     - **Do NOT use `file:///…`** in any case — modern browsers block navigation from http(s) origins to `file://` URLs.
   - **Source files (`.md`, `.tsx`, `.ts`, `.css`, configs) → `vscode://file/ABSOLUTE_PATH`** — opens in VS Code / Cursor. Use absolute paths.
   - Applies to the primary artifact AND every supporting file referenced inline. Plain paths or relative `[text](path.md)` links are rejected.
   - Examples:
     - With symlink: `[.intermediate/design/wireframes/home/v1.html](/preview/wireframes/home/v1.html)`
     - Without symlink: `[.intermediate/design/wireframes/home/v1.html](vscode://file{{REPO_ROOT}}/.intermediate/design/wireframes/home/v1.html)`
     - Source spec: `[docs/design/screens/day-complete.screen.md](vscode://file{{REPO_ROOT}}/docs/design/screens/day-complete.screen.md)`
2. `oak_link_note_to_project(noteId, "01KQRR9GEXY2DFFPBR5F49EY6T")`
3. `oak_create_task` — title `[kate]:review {artifact name}`, projectId set. `contextNotes` MUST include the same scheme-correct links so the task is one-click openable.
4. `oak_link_note_to_task(noteId, taskId)`

After each oak call, inspect the returned object. If a field you passed comes back `null`, missing, or different — fix it before moving on. "Captured" ≠ "captured with the fields I intended." No artifact is "done" until all four steps complete.
