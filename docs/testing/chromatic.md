# Chromatic (Storybook)

Chromatic captures screenshots of every Storybook story and compares them against baselines. When something changes, reviewers see a side-by-side diff and approve or reject.

For why visual testing matters and how Chromatic fits into the testing strategy, see [visual-testing.md](visual-testing.md).

For Chromatic with Playwright (E2E page-level visual testing), see [chromatic-playwright.md](chromatic-playwright.md).

## How It Works

**1. Capture baseline (first run)**

Chromatic builds your Storybook → renders each story in a cloud browser → takes screenshot → stores as baseline.

**2. Compare (subsequent runs)**

PR opened → Chromatic builds Storybook again → renders same stories → compares new screenshots against baseline.

**3. Detect differences**

Chromatic uses **perceptual diffing** — not raw pixel comparison. It ignores anti-aliasing and sub-pixel rendering differences that aren't real changes, reducing false positives.

**4. Human review**

Change detected ≠ bug. Chromatic asks "does this look different?" — humans decide if the change is intentional or a regression. That's why visual testing is a "soft gate" requiring review, not auto-pass/fail.

**5. Update baseline**

- Accept change → new screenshot becomes baseline
- Deny change → old baseline preserved, PR blocked

**Why cloud-based matters:**

Local screenshots vary by OS (fonts, anti-aliasing). Chromatic renders in a consistent cloud environment, so Mac dev machines produce the same result as Linux CI — no false positives from rendering differences.

## Setup

Chromatic is installed in `packages/ui`. The project is linked to the Chromatic cloud at:

- **App ID:** `698f8bb1c019388f4cbe6ec7`
- **Dashboard:** https://www.chromatic.com/builds?appId=698f8bb1c019388f4cbe6ec7

## Project Token

The project token authenticates your Storybook uploads to Chromatic's cloud. Without it, Chromatic doesn't know which project dashboard to send screenshots to.

You can pass it two ways — both are equivalent:

```bash
# Explicit flag
npx chromatic --project-token=chpt_xxx

# Environment variable (CLI auto-reads it)
CHROMATIC_PROJECT_TOKEN=chpt_xxx npx chromatic
```

**Why env var is preferred:**

1. **Safety** — token stays in `.env` (gitignored), not in scripts or command history
2. **Convention** — standard pattern for secrets in Node projects
3. **CI parity** — same env var name works locally and in GitHub Actions

The Chromatic CLI looks for `CHROMATIC_PROJECT_TOKEN` by default, so you don't need `--project-token` when the env var is set.

## Running Locally

Set the token in `packages/ui/.env` (see `.env.example`):

```
CHROMATIC_PROJECT_TOKEN=chpt_...
```

Then run from repo root:

```bash
# Publish and run visual tests
pnpm chromatic

# Skip unchanged stories (faster)
pnpm chromatic --only-changed
```

The command builds Storybook, uploads it to Chromatic's cloud, and runs visual comparisons. Results appear in the Chromatic dashboard.

## CI Setup

Workflow: `.github/workflows/chromatic.yml`

**Triggers:**

- Push to `main` — auto-accepts changes as new baseline
- PRs — requires review before merge

**Path filter:** Only runs when `packages/ui/**` changes — saves snapshots on unrelated PRs.

**Key options:**

| Option              | Value                       | Why                                                   |
| ------------------- | --------------------------- | ----------------------------------------------------- |
| `onlyChanged`       | `true`                      | Only test stories affected by the PR                  |
| `autoAcceptChanges` | `main`                      | Pushes to main become the new baseline                |
| `exitZeroOnChanges` | `true`                      | Don't fail CI on visual changes — review in dashboard |
| `externals`         | `packages/ui/src/styles/**` | Global CSS changes trigger full rebuild               |

**Secret required:** `CHROMATIC_PROJECT_TOKEN` in GitHub repository secrets.

## Review Workflow

1. **PR triggers Chromatic build** — screenshots captured for all stories
2. **Changes detected** — Chromatic flags stories with visual differences
3. **Review in dashboard** — side-by-side diff view shows exactly what changed
4. **Accept or deny** — accepting updates the baseline; denying blocks merge

Chromatic integrates with GitHub: visual changes show as a pending status check until reviewed.

## Configuration

Create `packages/ui/chromatic.config.json` for project-level settings:

```json
{
  "buildScriptName": "build-storybook",
  "onlyChanged": true,
  "externals": ["public/**"]
}
```

Common options:

| Option          | Description                                          |
| --------------- | ---------------------------------------------------- |
| `onlyChanged`   | Only test stories affected by code changes           |
| `skip`          | Skip build entirely (useful for docs-only PRs)       |
| `externals`     | Globs for files that should trigger full rebuild     |
| `delay`         | Wait ms before screenshot (for animations to settle) |
| `diffThreshold` | Percentage of pixels that can differ (default: 0)    |

Per-story configuration via Storybook parameters:

```tsx
export const Loading: Story = {
  parameters: {
    chromatic: {
      delay: 300, // Wait for animation
      diffThreshold: 0.2, // Allow minor differences
      disableSnapshot: true, // Skip this story entirely
    },
  },
};
```

## Gotchas

- **Animations** — Chromatic waits for animations to finish, but complex animations may need `delay`. Alternatively, disable animations in Storybook's preview config for Chromatic builds
- **Dynamic content** — Stories with `Date.now()` or random data will always diff. Use Storybook's decorators to mock deterministic values
- **Fonts** — Custom fonts must load before screenshot. Use `@storybook/addon-fonts` or preload in preview config
- **Viewport** — Default is 1200×900. Configure per-story with `chromatic: { viewports: [320, 768, 1200] }` for responsive testing

## Cost

Chromatic bills per snapshot. To minimize:

- Use `--only-changed` to skip unchanged stories
- Use `chromatic: { disableSnapshot: true }` for stories that don't need visual testing (documentation, playground stories)
- Run on PR events only, not every commit

## References

- [Chromatic Docs](https://www.chromatic.com/docs/)
- [Chromatic GitHub Action](https://github.com/chromaui/action)
- [Storybook + Chromatic](https://www.chromatic.com/docs/storybook/)
