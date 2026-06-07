---
phase: wireframes
artifact: parity-grid
status: frozen-example
source: untolabs/thruscan blockchain browser, 2025-Q4
---

# Parity Grid — Example

A parity grid tracks **every screen × every state** so nothing gets forgotten between wireframe and screen-spec phases. One row per screen, one column per state. Each cell links to the wireframe section that covers it (or marks it as N/A with a reason).

## Why it exists

Wireframes drift. A designer sketches the happy path, ships it, and the empty/loading/error states show up as afterthoughts during implementation — usually inconsistent with each other. The parity grid forces every state to be considered *before* the screen spec phase begins.

## Format

| Screen | Default | Empty | Loading | Error | Success | Disabled | Notes |
|---|---|---|---|---|---|---|---|
| `dashboard` | [§1](dashboard.wireframe.md#default) | [§2](dashboard.wireframe.md#empty) | [§3](dashboard.wireframe.md#loading) | [§4](dashboard.wireframe.md#error) | N/A — no success state, dashboard is read-only | N/A | — |
| `tx-detail` | [§1](tx-detail.wireframe.md#default) | N/A — always has data when reached | [§2](tx-detail.wireframe.md#loading) | [§3](tx-detail.wireframe.md#error-not-found) | N/A | N/A | error split into 404 vs network |
| `search` | [§1](search.wireframe.md#default) | [§2](search.wireframe.md#empty-no-query) | [§3](search.wireframe.md#loading) | [§4](search.wireframe.md#error) | [§5](search.wireframe.md#results) | N/A | empty has two variants: no query vs no results |
| `settings` | [§1](settings.wireframe.md#default) | N/A | N/A — instant | [§2](settings.wireframe.md#error-save-failed) | [§3](settings.wireframe.md#success-saved) | [§4](settings.wireframe.md#disabled-readonly) | disabled when read-only mode |

## Drift log

Track every change to the grid after the first review. Drift = scope creep that needs to be acknowledged, not silently absorbed.

| Date | Screen | State | Change | Reason | Approved by |
|---|---|---|---|---|---|
| 2025-10-14 | `search` | empty | split into `no-query` and `no-results` | usability test showed users confused them | @kate |
| 2025-10-18 | `tx-detail` | error | split into `404` and `network` | error copy needed to differ — 404 is permanent, network is retryable | @kate |
| 2025-10-22 | `dashboard` | success | removed (was N/A) | no write actions on dashboard, success state never reachable | @kate |

## Rules

1. **Every cell must be filled.** Either a link to the wireframe section, or `N/A — <reason>`. Blank cells are bugs.
2. **N/A needs a reason.** "N/A" alone is not acceptable. Future readers need to know *why* this state doesn't apply.
3. **Drift is logged, not hidden.** If a cell changes after initial sign-off, append a row to the drift log. Don't edit the original cell silently.
4. **The grid gates the screens phase.** Screen specs cannot begin until every row is approved.
5. **One grid per feature, not per project.** Large projects have multiple grids — one per feature area — to keep them readable.

## Common state columns

The columns above are the default set. Add columns for any state your product genuinely has:

- **Default** — happy path, has data, user is authorized
- **Empty** — no data yet (often split: never-had-data vs filtered-to-zero)
- **Loading** — fetching or processing
- **Error** — fetch failed, validation failed, network down (often split by error class)
- **Success** — write completed (toast, redirect, inline confirmation)
- **Disabled** — feature flagged off, read-only mode, insufficient permissions
- **Skeleton** — first paint before data (separate from Loading if your design uses skeletons)
- **Offline** — no network at all (only if your product handles offline)

Don't add columns you don't need. A read-only browser doesn't need Success or Disabled. A dashboard doesn't need Empty if there's always seed data.
