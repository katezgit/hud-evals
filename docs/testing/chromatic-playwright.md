# Chromatic + Playwright (E2E Visual Testing)

Chromatic captures page screenshots during Playwright E2E tests and compares them against baselines. This adds visual regression detection to your functional tests.

For why visual testing matters and how this fits into the overall strategy, see [visual-testing.md](visual-testing.md).

## How It Works

```
Run Playwright tests → Chromatic captures page archives → Upload to Chromatic cloud → Renders & compares → Review diffs in dashboard
```

Chromatic doesn't replace Playwright — it adds visual comparison on top. Your functional tests stay the same.

## Setup

### Step 1: Install the package

```bash
pnpm --filter @repo/portal add -D @chromatic-com/playwright
```

### Step 2: Update test imports

Change from Playwright's test to Chromatic's wrapper:

**Before:**

```ts
import { test, expect } from "@playwright/test";
```

**After:**

```ts
import { test, expect } from "@chromatic-com/playwright";
```

**What this import change does:**

```
Before (Playwright directly):
Test runs → Playwright controls browser → Test passes/fails → Done

After (Chromatic wrapper):
Test runs → Chromatic wrapper controls browser → Same test passes/fails
                                               ↓
                                    Also silently captures page snapshots
                                    (saved to test-results/chromatic-archives/)
```

The wrapper re-exports everything from Playwright (`test`, `expect`, `Page`, etc.) with identical behavior. Your tests work exactly the same — they don't know the difference.

The only addition: Chromatic's wrapper records the page state (HTML, CSS, assets) at the end of each test. These archives are later uploaded to Chromatic's cloud, where they render the pages and compare screenshots.

**In short:** Same tests, same behavior, but now they secretly take "photos" for visual comparison.

### Step 3: Update fixtures (if using custom fixtures)

If you have a `fixtures.ts` file that extends Playwright's test:

**Before:**

```ts
import { test as base } from "@playwright/test";
```

**After:**

```ts
import { test as base } from "@chromatic-com/playwright";
```

### Step 4: Run tests locally

```bash
# Step A: Run Playwright tests (captures archives)
pnpm --filter @repo/portal test:e2e

# Step B: Upload archives to Chromatic
npx chromatic --playwright --project-token=<token>
```

Or set `CHROMATIC_PROJECT_TOKEN` env var and omit the flag:

```bash
CHROMATIC_PROJECT_TOKEN=chpt_xxx npx chromatic --playwright
```

## CI Setup

Add Chromatic upload after E2E tests in `.github/workflows/ci-e2e.yml`:

```yaml
- name: Run E2E tests
  run: pnpm --filter @repo/portal test:e2e
  env:
    NEXT_PUBLIC_API_URL: http://localhost:3002

- name: Upload to Chromatic
  if: success() || failure() # Run even if tests fail to capture visual state
  uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    workingDir: apps/portal
    playwright: true
    exitZeroOnChanges: true
    autoAcceptChanges: main
```

Key options:

| Option              | Value  | Why                                                                  |
| ------------------- | ------ | -------------------------------------------------------------------- |
| `playwright: true`  | —      | Tells Chromatic to look for Playwright archives instead of Storybook |
| `exitZeroOnChanges` | `true` | Don't fail CI on visual changes — review in dashboard                |
| `autoAcceptChanges` | `main` | Pushes to main become the new baseline                               |

## Project Token

Use the same project token as Storybook (`packages/ui`). Both component and E2E visual tests appear in one dashboard.

If you prefer separation, create a new Chromatic project at chromatic.com and use a different token.

## What Gets Captured

Chromatic captures the page state at the **end of each test**. For more control:

```ts
import { test, takeSnapshot } from "@chromatic-com/playwright";

test("login flow", async ({ page }, testInfo) => {
  await page.goto("/login");

  // Capture at specific point
  await takeSnapshot(page, "Login page empty", testInfo);

  await page.fill('[name="email"]', "user@test.com");
  await page.fill('[name="password"]', "password");

  // Capture before submit
  await takeSnapshot(page, "Login page filled", testInfo);

  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");

  // Final state captured automatically
});
```

## Handling Dynamic Content

Same challenges as Storybook visual testing — timestamps, avatars, animations cause false positives.

**Mask dynamic elements:**

```ts
await takeSnapshot(page, "Dashboard", testInfo, {
  mask: [page.locator(".timestamp"), page.locator(".avatar")],
});
```

**Disable animations** (already configured in `playwright.config.ts`):

```ts
expect: {
  toHaveScreenshot: {
    animations: "disabled",
  },
},
```

## Review Workflow

1. PR triggers E2E tests → Playwright runs → Archives uploaded to Chromatic
2. Chromatic renders pages and compares against baselines
3. Changes detected → Review in Chromatic dashboard (same as Storybook)
4. Accept or deny → Accepting updates baseline

## Limitations vs Storybook Integration

| Feature                       | Storybook       | Playwright              |
| ----------------------------- | --------------- | ----------------------- |
| TurboSnap (only test changed) | Yes             | No — always tests all   |
| Isolated component states     | Yes             | No — full page context  |
| Speed                         | Fast            | Slower — full app + API |
| What it catches               | Component broke | Page composition broke  |

Playwright visual tests are slower and coarser — use them for key pages, not exhaustive coverage.

## Recommended Pages to Test

Focus on pages that **compose many shared components**:

- Login page (form layout, inputs, button)
- Employee list (table, pagination, filters)
- Employee form (form layout, validation states)
- Error states (404, error boundaries)

## References

- [Chromatic Playwright Docs](https://www.chromatic.com/docs/playwright/)
- [Chromatic GitHub Action](https://github.com/chromaui/action)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
