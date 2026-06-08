# The System

Snapshot of how the state machine, agents, and gates compose as of 2026-06-08.

## The whole thing in one sentence

Phases gate what can be built → agents are method calls with declared inputs → artifacts run the Artifact Rule and wait for human approval → code is gated by adversarial review → shared conventions live in canonical docs that every agent reads on demand. Each layer refuses to improvise past its boundary.

---

## View 1 — Phase pipeline

```
discovery  ─── product-designer
       │           writes: platform, personas,
       │                   primary-workflow, user-stories
       │
     ┌─┴───────────┐
     ▼             ▼
personality   ux-flows        ◄── parallel
     │             │
     ▼             │
design-tokens      │           ◄── entry: personality approved
     │             │              refined by wireframes feedback
     └──────┬──────┘
            ▼
       wireframes               ◄── entry: tokens + ux-flows approved
            │                      refines design-tokens; human-approved
            ▼
       screens
            │
            ├──► components   ◄── trigger: pattern in 2–3 screens
            ├──► patterns     ◄── trigger: cross-component need
            ▼
       motion  ─── motion-designer
            ▼
       implementation ─┬── design-system-architect  (packages/ui/)
                       └── staff-frontend-engineer  (apps/)
            ▼
       design-qa  ─── product-designer + motion-designer
            ▼
       review  ─── accessibility-expert + reviewer
            ▼
       ship  ─── release-manager
```

Every arrow crosses a **human approval gate** (the `agent:review` task produced by the Artifact Rule). Phases never advance automatically. Current phase lives in `.state/state.md`.

---

## View 2 — Typical call graph (build a feature needing a new component)

```
HUMAN "build search"
   ▼
staff-frontend-engineer
   (INPUTS: TASK, SCREEN_SPEC_PATH, SCOPE_APP)
   ▼ DS gate fails (no @repo/ui SearchInput)
design-system-architect
   ▼ spec gate fails (no docs/design/components/search-input/spec.md)
product-designer
   (TASK_TYPE=component-spec, verifies 2–3 screens)
   writes spec + HTML mockup + Artifact Rule (4 Oak steps)
   ▼
HUMAN approves agent:review task
   ▼
design-system-architect
   implements (no test file) → self-review gates (build/types/a11y/tokens)
   ▼
frontend-reviewer
   PASS / FAIL verdict; loop until PASS
   ▼
accessibility-expert
   CRITICAL / MAJOR / MINOR; loop architect until converged
   ▼
unit-test-engineer  (writes <name>.test.tsx against finalized API)
   ▼
storybook-documenter  (writes <name>.stories.tsx)
   ▼
staff-frontend-engineer
   resumes → build / types / test / pre-flight grep
   ▼
frontend-reviewer
   PASS / FAIL verdict on the app integration; loop until PASS
   ▼
unit-test-engineer  (writes tests for the app feature against finalized API)
   ▼
done
```

**Tests run after review converges, by design.** Reviewer-driven fixes (prop renames, accessible-name changes, DOM reshapes) invalidate any test written earlier — so tests are last. The path-owning engineer (`design-system-architect`, `library-engineer`, `staff-frontend-engineer`) never writes `*.test.{ts,tsx}` files; `unit-test-engineer` owns the whole test surface. Doctrine in [`docs/testing/unit-testing-guidelines.md`](docs/testing/unit-testing-guidelines.md).

---

## View 3 — The five gates holding it together

| Gate                  | Triggered when…                                         | Enforces                                                                  | Canonical                                                           |
| --------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Artifact Rule**     | designer/motion-designer produces any design artifact   | `oak_save_note` + link project + `agent:review` task + link note to task | `CLAUDE.md` + each designer agent                                   |
| **Phase gate**        | designer attempts artifact whose upstream isn't done    | stop + escalate via `agent:{topic}` task                                  | product-designer Hard Rules table + `.state/state.md`                 |
| **Spec gate**         | engineer has no screen spec, architect has no component spec, or either receives `.wireframe.md` | stop + escalate                    | engineer Workflow §1, architect Workflow §2                         |
| **Token policy**      | any agent hits missing/wrong/unclear token              | stop → designer decides → if new: foundations + Artifact Rule + approval → architect implements → caller resumes | `docs/conventions/token-policy.md`                                  |
| **Adversarial review**| engineer reports "done"                                 | `frontend-reviewer` PASS/FAIL loop until PASS                             | `.claude/agents/frontend-reviewer.md`                               |

**Known asymmetry:** `packages/ui/` has no adversarial reviewer — architect self-reviews via explicit gates. Documented; not yet closed.

---

## Agent roster (as of 2026-04-17 rewrite)

All four core agents now share the same shape: `INPUTS → OUTPUT → Scope → Hard Rules → Workflow → Delegation → References`.

| Agent                       | Owns                                                      | Lines |
| --------------------------- | --------------------------------------------------------- | ----- |
| `product-designer`          | All design-phase artifacts (personality → patterns)       | 174   |
| `motion-designer`           | Motion tokens, transitions, microinteractions             | 86    |
| `design-system-architect`   | Shared primitives in `packages/ui/` + token write         | 115   |
| `library-engineer`          | Shared utilities in `packages/libs/`                      | 128   |
| `storybook-documenter`      | Storybook stories for design system components            | 35    |
| `unit-test-engineer`        | Unit tests anywhere (`**/*.test.{ts,tsx}`)                | —     |
| `staff-frontend-engineer`   | App-level code in `apps/`                                 | 112   |
| `frontend-reviewer`         | Adversarial PASS/FAIL review of `apps/` + `packages/ui/`  | 139   |
| `accessibility-expert`      | WCAG, keyboard, screen reader review                      | 122   |
| `reviewer`                  | Pre-merge code/design review                              | 61    |
| `release-manager`           | Commits + conventional commit messages                    | 185   |

---

## Shared substrate (canonical docs)

```
docs/conventions/
├── token-policy.md      ── engineer + architect + designer
├── tailwind-v4.md       ── engineer + architect
├── design-system.md     ── architect (Component Conventions + a11y checklist)
├── app-conventions.*    ── engineer (naming, folders, queries, loading/errors)
└── frontend-solutions.md── engineer (approved libs)

docs/design/
├── foundations/*.md     ── designer writes; architect reads to implement tokens
├── screens/*.screen.md  ── designer writes; engineer reads to implement UI
├── components/[name]/
│   ├── spec.md          ── designer writes; architect reads to implement component
│   └── animations.md    ── motion-designer writes; architect reads
├── patterns/*.md        ── designer writes
└── guidelines/*.md      ── designer + motion-designer write; all read
```

Change a rule once in a canonical doc → every agent picks it up on next spawn. That's the point.

---

## Design principles behind the rewrite (Garry Tan's "harness + skills")

1. **Thin harness, fat skills** — keep orchestration lightweight; put judgment and procedure in per-agent skill files.
2. **Skills as method calls** — every agent declares `INPUTS` + `OUTPUT` so callers pass parameters explicitly rather than dumping natural language.
3. **Resolver pattern** — per-task references table; load docs on demand, don't prefetch.
4. **Latent vs deterministic** — LLM for judgment (spec compliance, compose vs extract, token semantics); shell commands for precision (build, types, tests, grep).
5. **Single source of truth** — when a rule is enforced by one agent, others reference that doc rather than restating. Canonical policies live in `docs/conventions/`.
6. **"Ask twice = fail"** — recurring tasks end by writing a skill, not just doing the work. (Not yet codified in CLAUDE.md — open gap.)

## Open gaps (deferred)

- `packages/ui/` has no adversarial reviewer. Architect self-reviews.
- `.claude/workflows/*.md` files still read as prose — haven't been parameterized as method calls.
- No learning loop: `frontend-reviewer` findings never get written back into the upstream docs (tailwind-v4.md, app-conventions.*, design-system.md).
- "Ask twice = fail" meta-rule not yet in `CLAUDE.md`.
- `product-designer`, `motion-designer`, `accessibility-expert` haven't had the same audit pass as the core four.
