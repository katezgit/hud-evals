Create Playwright E2E tests from a user flow doc.

Flow doc: $ARGUMENTS

## Infer App

Extract app name from flow doc path:

- `apps/<app>/...` or `docs/<app>/...` → app is `<app>`
- If unclear, ask user which app

## Verify App Agents Exist

Check for all four files at `apps/<app>/.claude/agents/`:

- `playwright-test-planner.md`
- `playwright-test-generator.md`
- `playwright-test-healer.md`
- `playwright-test-reviewer.md`

If any are missing → stop and tell user to run `/test:e2e-init <app>` first.

## Workflow

```
┌──────────────────────────────────┐
│            PLANNER               │
│  (self-reviews until satisfied)  │
│    Max 3 internal iterations     │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│            GENERATOR             │
│      (creates .spec.ts files)    │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│        HEALER + REVIEWER         │◄──┐
│     (run tests, fix, review)     │   │
└────────────────┬─────────────────┘   │
                 │                     │
                 ▼                     │
        ┌────────────────┐             │
        │  Tests pass +  │             │
        │ Code approved? │             │
        └───────┬────────┘             │
                │                      │
        No ─────┼───── Yes             │
        │       │       │              │
        ▼       │       ▼              │
   ┌─────────┐  │  ┌──────────┐        │
   │Fix/retry│  │  │   DONE   │        │
   └────┬────┘  │  └──────────┘        │
        └───────┴──────────────────────┘

Exit conditions:
✓ Tests pass + Reviewer approves
✗ Healer determines failure is a codebase bug
```

### Phase 1: Planner

- Agent: `apps/<app>/.claude/agents/playwright-test-planner`
- Input: flow doc path
- Output: `apps/<app>/docs/e2e-spec/<feature>.md`
- Orchestrator spawns Planner **once**. Planner handles its own review/revise cycle internally before returning.
- Max 3 internal iterations. If still not satisfied, return best effort spec.

### Phase 2: Generator

- Agent: `apps/<app>/.claude/agents/playwright-test-generator`
- Input: finalized spec from planner
- Output: `apps/<app>/e2e/<feature>/*.spec.ts`

### Phase 3: Healer + Reviewer

Orchestrator spawns Healer → Reviewer in sequence. If Reviewer returns violations, loop back: spawn Healer again with violations, then Reviewer. Repeat until exit condition.

**Healer**

- Agent: `apps/<app>/.claude/agents/playwright-test-healer`
- Run tests, fix failures
- Output: passing tests OR determination that failure is a **codebase bug**

**Reviewer**

- Agent: `apps/<app>/.claude/agents/playwright-test-reviewer`
- Input: test files + spec
- Output: `PASS` or list of violations

If Reviewer returns violations → Healer fixes and re-runs. Loop continues.

### Exit Conditions

- **Success**: Tests pass + Reviewer returns `PASS`
- **Codebase bug**: Healer determines failure is in app code, not test. Mark test as `test.fixme()` with explanation and exit.

Max iterations for Phase 3: 3. If still failing, stop and report all issues.

## Rules

- **YOU orchestrate** — spawn each agent via Task tool
- Planner and Generator: spawn once each. Planner loops internally.
- Healer + Reviewer: you manage the loop, spawn repeatedly until done
- Do NOT read files yourself — agents handle their own exploration
- Pass context between agents (spec path, violation reports)
- If any step fails unexpectedly, stop and report

## How to Spawn Each Agent

Use Task tool with `subagent_type: "general-purpose"` and prompt:

```
Read your instructions at apps/<app>/.claude/agents/playwright-test-<role>.md and follow them.
Input: <relevant paths and context>
```

For Healer on subsequent loops in Phase 3, include:

```
Previous reviewer violations to address:
<paste violation report>
```
