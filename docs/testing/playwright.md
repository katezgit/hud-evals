# Playwright

Playwright is used for two things: E2E tests that verify user flows, and component visual regression testing.

## Part 1: E2E Testing

### How It Works

E2E tests verify that users can complete real tasks. The input is a **user flow doc** — a step-by-step description of what a user does and what should happen. The output is Playwright test files.

```
Flow doc (docs/portal/ux/.../flows/<feature>.md)
    ↓
  Test plan (apps/<app>/docs/e2e/<feature>.md)
    ↓
  Test files (apps/<app>/e2e/<feature>/*.spec.ts)
```

The `/test:e2e` command automates this: give it a flow doc path and it produces tests.

### File Structure

Per-app layout:

```
apps/<app>/
  ├── docs/e2e/             # Test plans — scenarios derived from flow docs
  │   └── <feature>.md
  └── e2e/                  # Playwright test files
      └── <feature>/
          └── <scenario>.spec.ts
```

### Running Tests

E2E tests run against a **production build** (`next start`), not the dev server — this catches build-only issues (dead code elimination, env vars, SSR hydration). CI runs **Chromium only** for speed; run all browsers locally before pushing.

```bash
# All E2E tests, all browsers
pnpm test:e2e

# Specific feature, Chromium only (faster, matches CI)
cd apps/portal
npx playwright test e2e/login-page/ --project=chromium

# Single test file
npx playwright test e2e/login-page/successful-login.spec.ts
```

Config: `apps/{web,portal}/playwright.config.ts`

### Conventions

- **Flow docs are the source of truth** — tests trace back to user flows, not component specs
- **One scenario per file** — makes failures easy to isolate and fix
- **No app code changes from tests** — if E2E tests reveal an app bug, write a bug report to `docs/qa/e2e-bugs/` named `<description>.md`

### Selector Strategy

Follow Playwright's recommended order:

1. `getByRole` — buttons, headings, links
2. `getByLabel` — form fields with labels
3. `getByPlaceholder` — form fields by placeholder text
4. `getByText` — visible text content
5. CSS selectors — last resort

### Gotchas

- **`getByLabel` ambiguity**: If a field has label "Password" and a nearby button has `aria-label="Show password"`, `getByLabel('Password')` may resolve to the button. Use `getByPlaceholder()` instead
- **Validation triggers**: Forms using react-hook-form with disabled submit buttons can't trigger validation by clicking the button. Validation errors appear on blur or form submit
- **Radix Select**: Not native `<select>`. Use `getByRole("combobox").click()` → `getByRole("option", { name }).click()`
- **Strict mode**: `getByRole("cell", { name })` may match action cells too (aria-labels contain name). Use `exact: true`
- **Mobile/desktop views**: Table has hidden mobile card view. `getByText()` may match hidden elements. Scope to `page.locator("table")` or use `getByRole("cell")`
- **Shared backend state**: Mutating tests must create own data with `Date.now()` UIDs for isolation

### Quality Checklist

Every E2E test must pass all criteria. The reviewer agent enforces this.

| Criterion               | Requirement                                                |
| ----------------------- | ---------------------------------------------------------- |
| Critical workflow only  | Covers auth, checkout, core CRUD, or permissions           |
| One story per test      | If description needs "and", split it                       |
| User-visible assertions | Assert only on what user sees (text, visibility, URL)      |
| Isolated state          | Creates own state, assumes parallel execution              |
| Own test user           | Provisions own user if login required                      |
| Observable waits        | Waits on UI state, never `waitForTimeout`                  |
| Minimal stubs           | Stubs only third-party services, documented                |
| No flaky retries        | No retry logic to mask intermittent failures               |
| Abstracted selectors    | Selectors in reusable helpers, appear in exactly one place |
| Concise logic           | Test body ~30 lines max                                    |
| No orphan skips         | No `test.skip()` without linked tracking issue             |
| Real environment        | Runs against real browser, real API, real DB               |
| Suite performance       | Full critical-path suite under 15 minutes                  |

## Part 2: Component Visual Regression Testing

Two approaches to screenshot Storybook stories with Playwright. Both use `toHaveScreenshot()` for image diffing.

### Approach A: Playwright Component Testing (CT) + Portable Stories

Renders components directly in a real browser — no running Storybook server needed.

- Import story via Storybook's [portable stories API](https://storybook.js.org/blog/portable-stories-for-playwright-ct/)
- Render it in Playwright CT
- `toHaveScreenshot()` against baseline

### Approach B: Playwright against a running Storybook server

Navigates to each story's iframe URL, takes a screenshot.

- Requires `storybook build` or `storybook dev` first
- Playwright visits story URLs and captures screenshots
- Reference: [James Ives](https://jamesiv.es/blog/frontend/testing/2024/03/11/visual-testing-storybook-with-playwright/), [Markus Oberlehner](https://markus.oberlehner.net/blog/running-visual-regression-tests-with-storybook-and-playwright-for-free)

### Known tradeoffs (both approaches)

- OS-dependent baselines — Mac and Linux CI render differently (fonts, anti-aliasing). Must run baseline generation and CI in the same environment (e.g. Docker with pinned browser)
- No review UI — test pass/fail with a diff image in test output, no side-by-side approval workflow like Chromatic

## References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Portable Stories for Playwright CT — Storybook Blog](https://storybook.js.org/blog/portable-stories-for-playwright-ct/)
- [Visual Testing Storybook with Playwright — James Ives](https://jamesiv.es/blog/frontend/testing/2024/03/11/visual-testing-storybook-with-playwright/)
- [Visual Regression Tests with Storybook and Playwright — Markus Oberlehner](https://markus.oberlehner.net/blog/running-visual-regression-tests-with-storybook-and-playwright-for-free)
- E2E test engineer agent: `.claude/agents/e2e-test-engineer.md`
