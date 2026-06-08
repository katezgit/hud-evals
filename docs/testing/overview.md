# Testing Manual

A holistic testing strategy for enterprise frontend applications. Read top to bottom for the full picture, then follow links into each layer for implementation details.

**New to testing terminology?** Start with the [Glossary](glossary.md) — defines every test type, clears up common misconceptions, and establishes shared vocabulary.

## The Big Picture

Enterprise apps need five test layers. Each catches a different class of bug, runs at a different stage, and is owned by a different team.

> Write tests. Not too many. Mostly integration.

```sh
Frontend team                              Backend team
────────────                               ────────────
Unit tests (component/logic)               Unit tests (logic/utils)
Integration tests                          Integration tests (API + DB)
  - Component composition (RTL, jsdom)
  - UI + mocked API (Playwright, browser)
Component visual tests (TODO)
        │                                        │
        ╰────────────┐            ┌──────────────╯
                     ▼            ▼
              Contract tests (Pact)       ← API shape agreement, both teams verify
                     │
                     ▼
              True E2E tests              ← critical paths, real backend
              Page visual tests           ← composition holds at page level
                     │
                     ▼
                  Deploy
```

### CI Pipeline

All layers map to two gates that run on every PR:

```sh
PR opened / code pushed (on main)
├── Quality Gate (parallel, fast)
│   ├── Lint + type-check
│   ├── Unit tests
│   ├── Contract tests (consumer side — if separate teams; otherwise shared types suffice)
│   └── Component visual tests (todo)
│
├── Build (gates on quality)
│
└── E2E Gate (after build)
    ├── Functional E2E tests
    └── Page visual tests

Push to main → Deploy
```

Visual test failures are **soft blocks** (require human review). Everything else is a hard block.

## Test Layers

Each layer answers a different question. Skip a layer and you get a specific class of blind spot.

| Layer           | Question it answers                                         | What it catches                                                                                                                                                                                            | What it misses                                                   | Detail                                                   |
| --------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| **Unit**        | Does this component/function behave correctly in isolation? | Logic bugs, rendering, state, interactions, accessibility                                                                                                                                                  | Nothing about integration with real APIs or other components     | [unit-testing-guidelines.md](unit-testing-guidelines.md) |
| **Integration** | Do composed components and page flows work together?        | Component composition bugs, UI flows, form submissions, error/loading states. Two sub-layers: component composition (RTL/jsdom, fast) and UI + mocked API (Playwright/browser, slower but higher fidelity) | Mock drift — mocks go stale when backend evolves                 | [integration-testing.md](integration-testing.md)         |
| **Contract**    | Do frontend mocks still match the real API?                 | API shape mismatches, breaking changes, mock drift                                                                                                                                                         | Runtime behavior — only checks shape, not logic                  | [contract-testing.md](contract-testing.md)               |
| **E2E**         | Does the full stack work for critical user flows?           | Auth failures, data integrity, CORS, serialization, race conditions                                                                                                                                        | Slow, flaky, expensive — only viable for critical paths          | [playwright.md](playwright.md)                           |
| **Visual**      | Does the UI still look correct?                             | Layout shifts, color regressions, overflow, responsive breakpoints                                                                                                                                         | Behavior — a pixel-perfect page can be completely non-functional | [visual-testing.md](visual-testing.md)                   |

### How the layers reinforce each other

```sh
Unit tests catch:         "Button onClick handler is broken"
Integration tests catch:  "LoginForm renders inputs but Submit button doesn't trigger validation"
Contract tests catch:     "Backend renamed 'userName' to 'name', frontend mocks are stale"
E2E tests catch:          "Login works against mocks but auth cookies aren't set by real backend"
Visual tests catch:       "Login form looks correct in Storybook but overflows on the actual page"
```

No single layer is sufficient. The value is in the combination.

## Frontend-Backend Convergence

Frontend and backend teams develop independently. They converge at two points:

1. **Contract tests** — first convergence. Verifies API shape agreement. Catches mock drift in CI before integration.
2. **True E2E tests** — final convergence. Real browser + real backend + real database. Critical paths only.

Without contract tests, the first time frontend and backend code meet is at E2E or production — problems are discovered late and are expensive to debug.

**Pragmatic note:** Contract testing (Pact) is most valuable when separate teams own frontend and backend with different release cycles. For small teams or startups where the same people own both sides, shared TypeScript types or OpenAPI-generated types serve as the "contract" — type-check catches shape mismatches at build time, and E2E tests catch the rest. Add formal contract testing when team separation makes implicit coordination unreliable.

See [contract-testing.md](contract-testing.md) for when you need contract testing, consumer-driven contracts, and how they run in CI.

## Automation & Tooling

### Test generation pipeline

E2E tests are generated from UX wireframes using Playwright's AI-powered test agents:

```sh
Wireframe (docs/ux/*.md)
    ↓
  Planner    →  specs/<feature>.md       (human-readable test plan)
    ↓
  Generator  →  e2e/<feature>/*.spec.ts  (executable tests)
    ↓
  Healer     →  fixes failing tests automatically
```

See [playwright.md](playwright.md) for setup, prerequisites, and conventions.

### Tool stack

| Layer              | Tool                                          | Why this tool                                                                                                               |
| ------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Unit               | Jest + React Testing Library                  | Industry standard, behavior-oriented queries, fast                                                                          |
| Integration        | Playwright + `page.route()`                   | Real browser, network interception, same tool as E2E                                                                        |
| Contract           | [Pact](https://pact.io/) or schema validation | Consumer-driven contracts (Pact) if you own the backend; schema validation (OpenAPI / generated types) for third-party APIs |
| E2E                | Playwright + Test Agents                      | AI-powered generation, self-healing, cross-browser                                                                          |
| Visual (component) | Chromatic                                     | Normalized rendering, perceptual diff, review UI                                                                            |
| Visual (page)      | Playwright `toHaveScreenshot()`               | Free, already in stack, covers page-level composition                                                                       |

## Coverage Targets

- **Shared packages (ui, libs):** 80%+ unit test coverage
- **App pages:** Integration tests for every user-facing flow
- **Critical paths (auth, data mutations):** True E2E against real backend
- **Design system components:** Visual baseline for every Storybook story
- **Key pages:** Page-level visual screenshots for composition validation
