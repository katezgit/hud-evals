# A System That Generates E2E Tests

An LLM-powered workflow that generates Playwright E2E tests from user flow documentation, ready for human review.

## How to Use

```
/test:e2e docs/portal/ux/flows/login-page.md
```

Generates E2E tests for the specified user flow. Requires quality artifacts from the product designer.

First time setup for an app:

```
/test:e2e-init <app>
```

## How It Works

The system has three layers:

```
┌─────────────────────────────────────────┐
│  /test:e2e                              │  ← You run this
├─────────────────────────────────────────┤
│  4 specialized agents (orchestrated)    │  ← Execute the workflow
├─────────────────────────────────────────┤
│  UX docs + Quality checklist            │  ← Rules the agents follow
└─────────────────────────────────────────┘
```

### Layer 1: The Orchestrator

The `/test:e2e` skill orchestrates four specialized agents in sequence:

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

**Agents:**

| Agent     | Role                                          | Output                                  |
| --------- | --------------------------------------------- | --------------------------------------- |
| Planner   | Analyzes flow doc, creates test specification | `apps/<app>/docs/e2e-spec/<feature>.md` |
| Generator | Writes Playwright test files from spec        | `apps/<app>/e2e/<feature>/*.spec.ts`    |
| Healer    | Runs tests, fixes failures                    | Passing tests or codebase bug report    |
| Reviewer  | Evaluates tests against quality checklist     | `PASS` or list of violations            |

### Layer 2: UX Documentation

Tests are derived from user flow docs that define expected behavior:

```
docs/portal/ux/
  flows/           # User journeys (what users do)
  specs/           # UI specifications (how it looks)
  wireframes/      # Visual layouts
```

See [docs/portal/ux/flows/](../docs/portal/ux/flows/) for examples.

### Layer 3: Quality Checklist

The Reviewer agent enforces a strict quality checklist — 13 criteria covering scope, isolation, assertions, and performance. Every test must pass all criteria.

See [Quality Checklist](../docs/testing/playwright.md#quality-checklist) for the full list.

## Initial Setup

Before generating tests for an app, initialize the agents:

```
/test:e2e-init <app>
```

This does two things:

1. Runs `npx playwright init-agents` which creates:
   - `playwright-test-planner.md`
   - `playwright-test-generator.md`
   - `playwright-test-healer.md`

2. Creates the reviewer agent with the quality checklist:
   - `playwright-test-reviewer.md`

All four files are placed at `apps/<app>/.claude/agents/`.

### Customizing Agent Prompts

The generated agents are **generic templates**. You must customize their system prompts to scope them to E2E testing only. Without this, agents may:

- Write unit tests instead of E2E tests
- Generate tests for non-critical flows
- Ignore project-specific patterns

**Required customizations:**

| Agent     | What to add                                                |
| --------- | ---------------------------------------------------------- |
| Planner   | Restrict to user flows from `docs/<app>/ux/flows/`         |
| Generator | Point to existing page objects, fixtures, test patterns    |
| Healer    | Reference project's Playwright config and test conventions |
| Reviewer  | Include the quality checklist (see Layer 3 above)          |

**Example additions to Planner prompt:**

```markdown
## Scope

- ONLY create specs for user flows in `docs/<app>/ux/flows/`
- Focus on critical paths: auth, core CRUD, checkout, permissions
- Ignore flows that can be validated via unit or integration tests
- Reference specs and wireframes in `docs/<app>/ux/` for UI details
```

**Example additions to Generator prompt:**

```markdown
## Project Patterns

- Use page objects from `apps/<app>/e2e/pages/`
- Use fixtures from `apps/<app>/e2e/fixtures/`
- Follow existing test structure in `apps/<app>/e2e/`
- Import helpers from `apps/<app>/e2e/helpers/`
```

## Running Tests

```bash
pnpm test:e2e                   # Run all E2E tests
pnpm test:e2e --ui              # Interactive UI mode
pnpm test:e2e --headed          # See browser
```

## Key Files

| Purpose         | Location                                           |
| --------------- | -------------------------------------------------- |
| Skills          | `.claude/commands/test:e2e.md`, `test:e2e-init.md` |
| Agents          | `apps/<app>/.claude/agents/playwright-test-*.md`   |
| UX flow docs    | `docs/<app>/ux/flows/`                             |
| Generated specs | `apps/<app>/docs/e2e-spec/`                        |
| Test files      | `apps/<app>/e2e/`                                  |
