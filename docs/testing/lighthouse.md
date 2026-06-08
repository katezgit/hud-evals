# Lighthouse CI

Lighthouse is Google's open-source tool that audits web pages for performance, accessibility, SEO, and best practices. It runs against real page loads — not component snapshots or unit tests.

**Why it matters for production apps:** Users abandon slow pages. Search engines penalize poor SEO. Accessibility failures exclude users and create legal risk. Lighthouse catches these issues before they ship, with automated thresholds that block regressions in CI.

- [Lighthouse overview](https://developer.chrome.com/docs/lighthouse/overview)
- [Lighthouse CI getting started](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)

## What It Catches

| Category       | What it measures                           | Why it matters                        |
| -------------- | ------------------------------------------ | ------------------------------------- |
| Performance    | LCP, FID, CLS, load speed, rendering       | Slow pages lose users and conversions |
| Accessibility  | Contrast, ARIA, labels, focus management   | Inclusivity + legal compliance        |
| SEO            | Meta tags, crawlability, mobile-friendly   | Discoverability in search engines     |
| Best Practices | HTTPS, secure JS, image optimization       | Security + modern standards           |
| PWA            | Service workers, manifest, offline support | App-like experience on mobile         |

Unit tests and component tests don't catch these, Lighthouse audits the composed, running application.

## Where It Fits in This Monorepo

**Component level:** Tests individual UI pieces in isolation during development. Fast feedback, catches issues early — but can't see how pieces interact on a real page.

**Page level:** Tests the full running application. Slower, runs in CI — but catches performance bottlenecks, broken layouts, and accessibility gaps that only appear when components combine with real data.

Both layers are necessary. Component tests are fast but blind to integration. Page tests are thorough but slow. Lighthouse operates at the page level.

When Lighthouse finds an issue (e.g., "Button needs better focus states"), that's a signal to fix it upstream in the design system — preventing recurrence across all apps.

## Setup

### Install

```bash
pnpm add -D @lhci/cli -w
```

### Configuration

Create `lighthouserc.cjs` in the app directory (e.g., `apps/portal/lighthouserc.cjs`). App-level config allows different apps to have different thresholds:

```js
// When REUSE_SERVER=true, server is started externally (parallel CI mode)
const serverConfig =
  process.env.REUSE_SERVER === "true"
    ? {}
    : {
        startServerCommand: "pnpm start --port 3001",
        startServerReadyPattern: "Ready",
      };

module.exports = {
  ci: {
    collect: {
      ...serverConfig,
      puppeteerScript: "./lighthouse-auth.cjs", // For authenticated pages
      url: ["http://localhost:3001/employees"],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
```

For apps with authentication, create a `lighthouse-auth.cjs` puppeteer script to log in before audits.

### CI Integration

Lighthouse runs in the same job as E2E tests, sharing infrastructure (postgres, API, portal server):

```yaml
# Portal server started externally, shared with E2E
- name: Run E2E and Lighthouse
  run: |
    pnpm --filter @repo/portal test:e2e &
    pnpm --filter @repo/portal lighthouse &
    wait
  env:
    REUSE_SERVER: "true" # Don't start server, use existing
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

The `REUSE_SERVER=true` env var tells both Playwright and Lighthouse to use the externally-started portal server instead of starting their own.

## Thresholds

Lighthouse scores range from 0-100. CI fails if any score drops below these minimums:

| Category       | Minimum | Why this number                                   |
| -------------- | ------- | ------------------------------------------------- |
| Performance    | 90      | Catches regressions without demanding perfection  |
| Accessibility  | 95      | Higher bar — accessibility failures exclude users |
| Best Practices | 90      | Security and modern web standards                 |
| SEO            | 90      | Pages must be discoverable by search engines      |

Only lower thresholds with documented justification (e.g., "third-party widget reduces SEO score, out of our control").

## Local Testing

```bash
# From repo root
pnpm --filter @repo/portal lighthouse

# Or from app directory
cd apps/portal
pnpm lighthouse
```

## Reports

With `temporary-public-storage`, reports upload to a public URL (expires after 7 days). For persistent storage, configure Lighthouse Server or use `filesystem` target.

## GitHub PR Status Checks

To get Lighthouse results as clickable links directly in PR status checks:

### 1. Install the Lighthouse CI GitHub App

1. Go to https://github.com/apps/lighthouse-ci
2. Click **Install**
3. Select your repository
4. **Copy the token** from the confirmation page (shown only once)

### 2. Add the token to GitHub Secrets

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `LHCI_GITHUB_APP_TOKEN`
4. Value: paste the token from step 1
5. Click **Add secret**

Once configured, each PR will show a "Lighthouse CI" status check with a "Details" link to the full report.

## Common Issues

**Flaky scores:** Use `numberOfRuns: 3` (or 5) to median results.

**CI environment differences:** Lighthouse in CI may score differently than local. CI runners have consistent resources; local varies.

**Build-time vs runtime a11y:** Some a11y issues only appear with real data. Lighthouse catches these; component tests may not.

## Tracking Improvements

When Lighthouse identifies issues, document them in a plan file for later fixes. See [lighthouse-improvements.md](lighthouse-improvements.md) for an example tracking:

- Current scores and metrics baseline
- Issues with root cause analysis
- Fix options with expected impact
- Priority order
