# Visual Testing

## Why Visual Testing Matters

Unit and E2E tests verify **behavior** — clicks, state transitions, API calls. They cannot catch:

- Layout shifts, overflow, clipping
- Color/spacing regressions from token or Tailwind changes
- Cross-browser rendering differences
- CSS cascade/specificity issues
- Responsive breakpoints breaking

A component can pass every assertion and still **look broken**. Visual testing fills that gap. Shopify, Airbnb, and Netflix all run visual regression in CI/CD as standard practice.

### When it's NOT worth it

- Small apps with minimal UI surface
- Teams without bandwidth to review visual diffs — false positives pile up and get ignored
- When you can't standardize CI rendering environments — the results are unreliable

## Two Layers: Component vs Page

Industry uses a **pyramid approach** — more component-level, fewer page-level.

| Factor              | Component (Storybook)        | Page (screenshots)                        |
| ------------------- | ---------------------------- | ----------------------------------------- |
| **What it catches** | Component itself looks wrong | Composition breaks from upstream changes  |
| **Speed**           | Fast — static renders        | Slow — needs app build + API              |
| **Signal**          | "Button hover state changed" | "Page looks different" (which component?) |
| **Coverage**        | Every variant/state          | Only states the flow hits                 |
| **Debugging**       | Isolated — one component     | Must dig through page                     |
| **False positives** | Low — no dynamic content     | High — API data, animations, timing       |

### Why both layers

Component-level alone is not enough. A `Button` can look perfect in Storybook but break `EmployeePage` layout when its size changes:

`Button` size grows → `FormActions` row wraps → `EmployeeForm` height changes → page scroll appears.

Component tests see a correct button. Only a page screenshot catches the downstream break.

## Layer 1: Component Visual Testing (Storybook)

**Primary gate.** Every Storybook story becomes a visual baseline.

A design token change updates all affected component screenshots at once — reviewers see the full blast radius across the design system before merge.

For Playwright-based implementation approaches (CT + Portable Stories vs Storybook server), see [playwright.md — Part 2](playwright.md#part-2-component-visual-regression-testing).

## Layer 2: Page-Level Screenshots

**Secondary gate.** Target pages that **compose many shared components**, not every page.

For implementation with Chromatic + Playwright, see [chromatic-playwright.md](chromatic-playwright.md).

- Login page (form layout, button, input sizing)
- Employee list (table, pagination, filters)
- Employee form (form layout, validation states)

## Keep Visual Tests Separate from Functional E2E

Visual tests and functional tests have different failure modes:

- Functional test failure = **behavior broke** — clear, actionable, auto-blocks merge
- Visual test failure = **something looks different** — needs human review, soft-blocks merge

Mixing them makes both signals noisy. Keep them as separate test suites.

## The Real Challenge: False Positives

The #1 industry complaint. Visual regression tests are prone to flakiness (unstable):

- **OS-dependent rendering.** Mac screenshots won't match Linux CI. Font rendering, anti-aliasing, sub-pixel positioning all differ. SaaS tools (Percy, Chromatic) solve this by running captures in a consistent cloud environment, but that's one of several reasons teams pay for them (review UI, AI diffing, collaboration workflows)
- **Dynamic content.** Timestamps, avatars, live data, relative dates ("3 minutes ago") change between runs
- **Animations/transitions.** Screenshot captured mid-animation = guaranteed false positive
- **Browser version drift.** Chrome updates change rendering subtly

**Mitigations:**

- Run in Docker with pinned browser versions in CI
- Disable animations before capture
- Mock time-dependent content
- Mask dynamic regions (avatars, timestamps)
- Tune diff thresholds — not every 1px shift is a bug

## Where in CI/CD

```
PR opened / code pushed
├── Quality gate (parallel, fast)
│   ├── Lint + type-check
│   ├── Unit tests
│   └── Component visual tests ← Layer 1 (screenshots of stories)
│
├── Build
│
└── E2E gate (after build)
    ├── Functional E2E tests
    └── Page visual tests ← Layer 2 (key page screenshots)
```

Visual failures are **soft blocks** requiring human review. Industry practice (Netflix, Shopify): designers, developers, and QA all review flagged diffs via SaaS tools that provide side-by-side diff UIs.

## Tool Landscape (2025-2026)

| Tool                                | Type       | Best for                                                                                                                        | Weakness                                                                                           |
| ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Chromatic**                       | SaaS       | Component-level via Storybook. Best integration, unlimited parallelization, perceptual diff. Also supports Playwright snapshots | Primarily Storybook-focused, costs scale with snapshots                                            |
| **Percy** (BrowserStack)            | SaaS       | Page-level + cross-browser. AI-based diff reduces false positives, OCR filters text shifts                                      | More expensive                                                                                     |
| **Playwright `toHaveScreenshot()`** | OSS        | Free, already in stack                                                                                                          | OS-dependent baselines, pixel-diff is noisy, no review UI, baseline management gets messy at scale |
| **Argos**                           | SaaS + OSS | Both layers, Storybook + Playwright plugins                                                                                     | Smaller ecosystem                                                                                  |
| **Lost Pixel**                      | OSS        | Both layers, self-hosted option                                                                                                 | Less mature                                                                                        |

### What production teams actually use

**Component-level:** Chromatic is the industry standard for Storybook-based visual testing. Most teams (Shopify, Airbnb) use it or Percy.

**Page-level:** Enterprise teams typically use Percy, Argos, or Chromatic (which now supports Playwright snapshots). Pure Playwright `toHaveScreenshot()` is less common in production because:

- OS-dependent baselines (Mac screenshots won't match Linux CI)
- Pixel-diff causes false positives (no AI/perceptual diffing)
- No review UI — just "test failed" with no side-by-side comparison
- Baseline management gets messy as page count grows

### Pragmatic options for this project

| Option                        | Setup                                                                            | Trade-off                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Chromatic for both layers** | Chromatic supports Playwright snapshots. Same review UI, same perceptual diffing | Costs scale with snapshots                                                                                       |
| **Argos for page-level**      | Open-source friendly, modern alternative gaining traction                        | Another vendor to manage                                                                                         |
| **Playwright built-in**       | Free, shows understanding of concepts                                            | Requires stabilization effort (Docker, mocking, masking). Fine for demos, but production teams typically upgrade |

**For this portfolio demo:** Playwright built-in is acceptable — demonstrates the concept. Document the trade-offs.

**For production apps:** Budget for Percy/Argos or use Chromatic for both layers.

## Summary

Three questions, three separate test suites:

- **Component visual tests** → does the design system look right?
- **Page visual tests** → does the composition hold when components change?
- **Functional E2E** → does the app work?

## References

- [How Netflix, Shopify & Top Tech Teams Use Visual Regression Testing](https://dev.to/maria_bueno/how-netflix-shopify-top-tech-teams-use-visual-regression-testing-to-scale-qa-3e30)
- [Flaky Visual Regression Tests, and What To Do About Them](https://www.shakacode.com/blog/flaky-visual-regression-tests-and-what-to-do-about-them/)
- [Fixing flaky Playwright visual regression tests](https://www.houseful.blog/posts/2023/fix-flaky-playwright-visual-regression-tests/)
- [It's Time to Disrupt Visual Regression Testing](https://www.tonyward.dev/articles/visual-regression-testing-disruption)
- [Running Visual Regression Tests with Storybook and Playwright for Free](https://markus.oberlehner.net/blog/running-visual-regression-tests-with-storybook-and-playwright-for-free)
- [Visual Testing Tools Comparison 2025](https://vizzly.dev/visual-testing-tools-comparison/)
- [Percy vs Chromatic comparison](https://www.chromatic.com/compare/percy)
- [Argos CI](https://argos-ci.com)
- [Design Token-Based UI Architecture — Martin Fowler](https://martinfowler.com/articles/design-token-based-ui-architecture.html)
- [How to Reduce False Positives in Visual Testing — BrowserStack](https://www.browserstack.com/guide/how-to-reduce-false-positives-in-visual-testing)
- [Chromatic vs Playwright Comparison](https://www.chromatic.com/compare/playwright)
- [Portable Stories for Playwright CT — Storybook Blog](https://storybook.js.org/blog/portable-stories-for-playwright-ct/)
