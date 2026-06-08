# CI/CD Pipeline

## Workflow Diagram

```sh
PR opened/sync                          Push to main
     │                                       │
     └──────────────┬────────────────────────┘
                    ▼
══════════════════════════════════════════════════════════════════
                              ci.yml
══════════════════════════════════════════════════════════════════

┌───────────┐  ┌───────────┐  ┌───────────┐
│  changes  │  │  quality  │  │   test    │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │              │              │
      ▼              └──────┬───────┘
┌───────────┐               │
│ chromatic │               │
│ (if ui)   │               │
└───────────┘               │
                   both must pass
                            ▼
                     ┌───────────┐
                     │   build   │
                     └─────┬─────┘
                           │
                           ▼
                    ┌──────────────┐
                    │build-api-img │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │    E2E & Lighthouse    │
              │  ┌────────┐ ┌────────┐ │
              │  │  e2e   │ │  lhci  │ │  <- parallel
              │  └────────┘ └────────┘ │   (shared infra)
              └────────────┬───────────┘
                           │
                   JOB MUST PASS
                           │
            ┌──────────────┴──────────────┐
            │                             │
       ❌ FAIL                       ✅ PASS
            │                             │
       deploy skips          ┌────────────┴────────────┐
                        if: PR                    if: main
                             │                         │
══════════════════════════════════════════════════════════════════
                             ▼                         ▼
               deploy-preview.yml          deploy-production.yml
               ┌────────┬────────┐         ┌────────┬────────┐
               │ web    │ portal │         │ web    │ portal │
               │preview │preview │         │ prod   │ prod   │
               └────────┴────────┘         └────────┴────────┘
```

## E2E & Lighthouse Integration Architecture

The combined job runs Playwright and Lighthouse tests in parallel against shared infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions Runner (ubuntu-latest)                      │
│  Network: host                                              │
│                                                             │
│  ┌─────────────┐   localhost:3002   ┌─────────────────────┐│
│  │   Portal    │ ─────────────────► │   API Container     ││
│  │   :3001     │                    │   --network host    ││
│  │             │                    │   PORT=3002         ││
│  └──────┬──────┘                    └──────────┬──────────┘│
│         │                                      │           │
│    ┌────┴────┐                                 ▼           │
│    │         │                      ┌─────────────────────┐│
│  ┌─────┐ ┌─────────┐                │   Postgres          ││
│  │ E2E │ │Lighthse │  <- parallel   │   :5432 (service)   ││
│  └─────┘ └─────────┘                └─────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Flow:**

1. Postgres starts as GitHub Actions service
2. Prisma migrations + seed data applied
3. API container pulled from GHCR + Playwright install (parallel)
4. API starts on host network, waits for health check
5. Portal server starts (shared by both test suites)
6. E2E and Lighthouse run in parallel with `REUSE_SERVER=true`
7. Both must pass for job to succeed

## API Docker Image

The API uses pre-built artifacts (not multi-stage build):

```
build job                    build-api-image job
─────────                    ───────────────────
turbo run build              download api-build artifact
prisma generate                     │
     │                              ▼
     ▼                       Dockerfile (just COPY)
apps/api/dist ──────────►           │
apps/api/prisma                     ▼
apps/api/package.json        push to GHCR
apps/api/node_modules/.prisma
```

**Why pre-built:** Turborepo caching. Building in Docker would lose cache benefits.

**Image location:** `ghcr.io/<owner>/<repo>/api:<sha>`

## Gate Summary

| Condition                | E2E  | Deploy Preview  | Deploy Production |
| ------------------------ | ---- | --------------- | ----------------- |
| CI - Build fails         | skip | skip            | skip              |
| CI - Build passes + PR   | run  | run (after E2E) | skip              |
| CI - Build passes + main | run  | skip            | run (after E2E)   |
| E2E fails                | fail | skip            | skip              |

## Workflow Files

| File                    | Trigger          | Purpose                                                          |
| ----------------------- | ---------------- | ---------------------------------------------------------------- |
| `ci.yml`                | push to main, PR | Lint, types, test, chromatic, build, API image, E2E + Lighthouse |
| `deploy-preview.yml`    | after CI (PR)    | Deploy preview to Vercel                                         |
| `deploy-production.yml` | after CI (main)  | Deploy production to Vercel                                      |

**Archived:** `_archived/storybook.yml` — Chromatic hosts published Storybook, GitHub Pages redundant.

## Chromatic (Visual Review)

Runs conditionally in `ci.yml` when `packages/ui/**` changes:

- Uses `dorny/paths-filter` to detect ui package changes
- Builds Storybook and uploads to Chromatic
- Auto-accepts changes on main branch
- Exits zero on changes (non-blocking for PRs)

## Lighthouse CI (Quality Audits)

Runs in parallel with E2E tests (same job, shared infrastructure):

- Performance, accessibility, SEO, best practices
- Fails if scores drop below thresholds (perf 90, a11y 95)
- Reports uploaded to temporary public storage (7-day retention)
- Config: `apps/portal/lighthouserc.cjs` (app-level, not repo root)
- Uses `REUSE_SERVER=true` to share portal server with E2E
- PR status checks with report links require `LHCI_GITHUB_APP_TOKEN` secret

See [testing/lighthouse.md](testing/lighthouse.md) for setup details including GitHub App configuration.

## Branch Protection

To prevent merging PRs until CI passes, configure GitHub branch protection:

1. **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `main`
3. Enable **Require status checks to pass before merging**
4. Select required jobs: `Lint & Type Check`, `Unit Tests`, `Build`, `E2E & Lighthouse`
5. Enable **Require branches to be up to date before merging**

Note: Status checks only appear in the dropdown after the workflow has run at least once.

## Shared Composite Action

All workflows use `.github/actions/setup/action.yml`:

- pnpm install (v9)
- Node.js setup (v22)
- Turbo cache

## Required Permissions

For GHCR push, the workflow needs:

```yaml
permissions:
  contents: read
  packages: write
```

`GITHUB_TOKEN` is used automatically — no secrets setup needed.
