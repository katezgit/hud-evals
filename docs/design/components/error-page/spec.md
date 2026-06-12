# Error Page — Component Spec v2

**Semantic refs:** `docs/design/foundations/color.md`, `typography.md`, `spacing.md`, `radius.md`, `elevation.md`.

**Phase carve-out:** `components` spec authored during `wireframes` phase — foundational engineering need. No domain-review gate required for this carve-out; operator-approved scope.

---

## 0. Research — Peer Production Systems

### 0.1 Survey

**Sentry — Issue Detail / Issue Not Found**
- URL pattern: `sentry.io/organizations/{org}/issues/{id}/`
- Present: Two-region layout — main content area (stack trace, breadcrumbs, HTTP context) + right sidebar with labeled metadata rows: "First seen," "Last seen," occurrence sparkline, linked GitHub/Jira issues, participants. Event-level navigation (oldest / latest / specific). Issue ID visible in the URL and copyable from sidebar.
- Absent: illustrations, apology copy, empty centered state. Error surfaces stay inside the shell with persistent navigation.
- Production signal: The sidebar metadata block — labeled key/value rows that read like structured machine output, not prose. First seen / last seen + occurrence count gives immediate temporal triage context.

**Datadog Error Tracking Explorer — Issue Panel**
- URL: `app.datadoghq.com/apm/error-tracking`
- Present: Two-zone panel inside the APM shell. Upper zone: lifecycle metadata — first seen, last seen, total count, count-over-time sparkline, fingerprint-computed issue grouping. Lower zone: error samples with stack traces. Issues carry state labels (NEW / FOR REVIEW / RESOLVED / IGNORED / EXCLUDED). Fingerprint surface lets engineers understand *why* errors grouped together.
- Absent: centered illustrated empty states. Data is dense and structured even for "no results" queries.
- Production signal: The upper panel zone — lifecycle metadata rendered as labeled rows before any stack trace. Fingerprint visible. This is triage-first, not display-first.

**Vercel Dashboard — Deployment Not Found / Fetch Failed**
- Docs: `vercel.com/docs/errors/INTERNAL_DEPLOYMENT_FETCH_FAILED`, `vercel.com/docs/errors/deployment_not_found`
- Present: Machine-readable error code prominently titled (`INTERNAL_DEPLOYMENT_FETCH_FAILED`), HTTP status code as a labeled field, plain-language cause sentence, structured numbered troubleshoot steps linking to specific docs. Each step is actionable and specific (check logs, check history, check permissions) — not generic.
- Absent: illustrations, vague "something went wrong," catch-all retry buttons.
- Production signal: The machine-readable error code displayed as a primary identifier alongside the HTTP status. Engineers can grep logs for `INTERNAL_DEPLOYMENT_FETCH_FAILED` immediately. Code + cause = searchable artifact.

**Weights & Biases — Run Not Found**
- Observed via: `drdroid.io/stack-diagnosis/weights---biases--wandb--wandb--error-run-not-found`
- Present: Entity context lifted into the error — "The specified run ID does not exist or has been deleted." The run ID is the context. Three-step triage pathway: verify ID in project dashboard → check deletion/retention → sync. Escalation path to community forum.
- Absent: generic "error" without entity context.
- Production signal: **Context lifting** — the entity (run ID) is named in the error message, not generic. Users know *what* is missing, not just *that* something is missing.

**GitHub — Admin / Processing Errors**
- Observed via: github.com/orgs/community discussions, github.com/adminerror
- Present: "Something went wrong. Please refresh the page to try again. If the problem persists, check the GitHub status page or contact support." Key pattern: **status page link** is present in the error copy. The refresh action and status check are paired as a unit.
- Absent: error codes in consumer-facing message, stack traces.
- Production signal: Status page link — signals "we know about outages and have a place to verify them." Absence of this is a prototype tell.

**Linear — Error States**
- Observed via: linearstatus.com incidents, Linear SDK error docs, Linear changelog
- Present: Changelog records fixing "edge case where the app could show a loading indicator instead of error screens in case of an exception." This is telling — Linear explicitly invested in ensuring error states have distinct, correct visual identity vs. loading states. SDK error docs expose structured error types with codes.
- Absent: loading state masquerading as error state (fixed).
- Production signal: Structural distinction between loading and error states — each has a defined, intentional visual that cannot be confused with the other.

### 0.2 Synthesis — Production-Grade Signal Set

From the survey, production error surfaces share these structural properties absent from the current HUD `error.tsx`:

| Signal | Present in peers | Current HUD impl |
|---|---|---|
| **Labeled metadata rows** (status code, error type, timestamp, digest) | Sentry, Datadog, Vercel | Raw message string only |
| **Incident reference** (copyable error ID / digest) | Sentry (URL ID), Datadog (fingerprint), Vercel (error code) | `error.digest` hidden |
| **Context lifting** (entity from URL or error) | W&B (run ID), Vercel (deployment code) | None |
| **Structured diagnostic** (labeled lines, not raw string) | All peers | Raw truncated `error.message` |
| **Status escalation link** | GitHub, Vercel | None |
| **Copy-to-clipboard** (error details for ticket) | Datadog, Vercel (AI prompt template) | None |
| **Layout: panel/card, not centered illustration** | All peers | Centered single-column |

The current impl's centered icon+headline+badge+buttons is the layout pattern of a consumer 404 page, not an enterprise observability error. The structural tell is that peers render errors inside a card/panel with labeled rows — the same visual grammar as a data table or form. Error data is structured data.

### 0.3 HUD-Anchored Subset

Not every peer signal applies to a route-segment error boundary. HUD's `error.tsx` runs client-side inside the app shell; it cannot query external status APIs, cannot look up entity names from the database (it is a render failure), and cannot display a full stack trace (security). The applicable subset:

- **Labeled metadata rows** — status code, error type, timestamp. These are available from the `error` object and from `Date.now()` at render time.
- **Incident reference (digest)** — `error.digest` exists. Current spec hides it. A copyable digest surfaces the correlation ID that Aman can paste into Sentry/Datadog or a support ticket.
- **Structured diagnostic** — labeled fields, not a raw prose string.
- **Copy error details** — one button that copies a structured JSON payload (timestamp, digest, message, category) for ticket filing.
- **Status escalation** — a link to `status.hud.ai` (or equivalent). Operators running HUD-managed infrastructure need this.
- **Layout: Card-based panel** — not centered single-column. A 560px card centered in the content area, with a header row, a structured metadata section, and a footer actions row. This is the grammar of a Sentry issue row or a Datadog panel.

**What we deliberately leave out:** sparklines (no historical data available at render time), entity name lookup (unavailable during render failure), full stack trace (security), Jira/GitHub integration (out of scope for error boundary).

---

## 1. Scope Boundary

This spec covers one surface only: the Next.js App Router `error.tsx` route-segment error boundary. It activates when a route segment throws during render or during a Server Component data fetch — a runtime failure that prevents the route from rendering at all.

**Explicitly out of scope:**

| Surface | Location | Why excluded |
|---|---|---|
| `not-found.tsx` (404) | Route segment | Wrong URL, not a runtime failure. Different persona moment: navigation mistake vs. infrastructure failure. |
| Inline form / field errors | `form-field.tsx` | Field-level validation. Always co-located with the triggering control. |
| Toast errors | `toast.tsx` / `sonner.tsx` | Transient, non-blocking, auto-dismissing. Route continues to render. |
| Global `error.tsx` at root | `app/error.tsx` | Same visual; this spec applies to both root and nested. |
| `app/global-error.tsx` (root-layout crash) | `app/global-error.tsx` | Same Card+metadata layout, **plus** a Contact-us mailto link adjacent to the status link. Root layout has crashed → no app shell → status.hud.ai alone is insufficient escalation. Segment `error.tsx` still bans contact-support per §2.7. |

**What triggers this surface:** A server component threw (unhandled exception), a `fetch()` in a Server Component rejected with no `try/catch`, or a client-side render error propagated past a React Error Boundary. The route segment is dead. The user cannot interact with the route until it is reset or they navigate away.

---

## 2. Composition

### 2.1 Layout

The error page renders inside the app shell. The header and sidebar persist. This surface occupies the main content area.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [App Header — persists]                                                 │
├───────────────┬──────────────────────────────────────────────────────────┤
│               │                                                          │
│  [Sidebar     │   [space]                                                │
│   persists]   │                                                          │
│               │   ┌─────────────────────────────────────────────────┐   │
│               │   │ ── Card header ────────────────────────────────  │   │
│               │   │  [destructive badge: ERROR]   [timestamp]        │   │
│               │   │  Route failed to load                            │   │
│               │   ├──────────────────────────────────────────────── ─┤   │
│               │   │ ── Metadata rows ──────────────────────────────  │   │
│               │   │  status      │  500 Internal Server Error        │   │
│               │   │  type        │  Error                            │   │
│               │   │  message     │  connection refused 127.0.0.1... │   │
│               │   │  incident    │  [digest-abc123]  [Copy]          │   │
│               │   ├─────────────────────────────────────────────────┤   │
│               │   │ ── Footer actions ──────────────────────────────  │   │
│               │   │  [Copy error details]  [Try again]  [Go to Jobs]│   │
│               │   └─────────────────────────────────────────────────┘   │
│               │                                                          │
│               │   [status.hud.ai link — below card]                      │
│               │                                                          │
└───────────────┴──────────────────────────────────────────────────────────┘
```

The card is **vertically centered** in the main content area, **horizontally centered** within it. Fixed width of `560px` — wider than the previous 480px to accommodate a two-column metadata grid comfortably.

Layout classes on the outer container: `flex items-center justify-center w-full min-h-full py-12`.
Layout classes on the inner stack: `flex flex-col items-center gap-3 w-full max-w-[560px] px-6`.

### 2.2 Card Structure

The primary element is a `Card` (variant `default`) with three sections:

```
Card
├── CardHeader
│   ├── left: destructive Badge ("ERROR") + headline h2
│   └── right: timestamp (absolute, formatted)
├── CardContent  [metadata grid]
│   ├── row: "status"   →  [status code + label]
│   ├── row: "type"     →  error.name
│   ├── row: "message"  →  error.message (truncated, CodeBlock inline)
│   └── row: "incident" →  error.digest (CodeBlock inline + copy button)
└── CardFooter
    ├── left: "Copy error details" ghost button
    └── right: "Try again" primary + "Go to Jobs" ghost
```

### 2.3 Card Header

Two horizontal regions: left (badge + headline) and right (timestamp).

**Left:**
- `Badge variant="destructive" showDot={false}` — label: `ERROR` / `NETWORK ERROR` / `ACCESS DENIED`
- `h2` below badge: headline copy (see §2.5 for per-category copy)

**Right (top-right of header):**
- Timestamp: `new Date().toISOString()` captured at render via `useState` initialization. Display: relative label ("just now") with `title` attribute containing the absolute ISO string for hover tooltip.
- `text-caption text-muted-foreground font-mono`
- Example: `12:04:31 UTC`

**Header layout:** `flex items-start justify-between gap-4`

**Headline spec:**
- `text-title font-semibold text-foreground tracking-(--text-title--letter-spacing)`
- 18px / 600 weight
- Generic: `Route failed to load`
- Network: `Server unreachable`
- Permission: `Access denied`

### 2.4 Metadata Grid

The `CardContent` contains a definition-list–style grid: two columns, label left (fixed 96px), value right.

```
grid grid-cols-[96px_1fr] gap-x-4 gap-y-2
```

Each row:
```
<span class="text-label font-medium text-muted-foreground">{label}</span>
<span class="text-body text-foreground">{value}</span>
```

**Row: status**
- Label: `status`
- Value: HTTP status code if available, else derived label.
  - Generic: `500  Internal Server Error`
  - Network: `503  Service Unavailable`
  - Permission: `403  Forbidden`
- Style: `font-mono text-code text-foreground`

**Row: type**
- Label: `type`
- Value: `error.name` (e.g., `TypeError`, `ReferenceError`, `Error`)
- Style: `font-mono text-code text-foreground`
- Omit row if `error.name` is empty or `"Error"` (too generic to add signal for generic category; keep for network/permission where name carries meaning)

**Row: message**
- Label: `message`
- Value: `error.message` — rendered as `CodeBlock variant="inline"`, max-width: fill, truncated at 160 characters with `…` suffix. `line-clamp-2`.
- If `error.message` is empty or undefined: omit row entirely.
- In production, Next.js redacts server component messages; the digest is the correlation tool in that case.

**Row: incident**
- Label: `incident`
- Value: `error.digest` — rendered as `CodeBlock variant="inline"`. The `CodeBlock` includes its own copy button.
- If `error.digest` is undefined (development mode, some client-side errors): render `—` in `text-muted-foreground` (em dash, not "none" / "n/a").
- This row is always present — its presence signals "production-grade" regardless of whether a digest exists.

### 2.5 Category Copy Table

| Category | Badge label | Badge variant | Headline | Status row |
|---|---|---|---|---|
| Generic runtime error | `ERROR` | `destructive` | `Route failed to load` | `500  Internal Server Error` |
| Network / fetch failure | `NETWORK ERROR` | `destructive` | `Server unreachable` | `503  Service Unavailable` |
| Permission denied (403) | `ACCESS DENIED` | `destructive` | `Access denied` | `403  Forbidden` |

**Copy rules:**
- Present-tense statement of fact. Not past tense, not hedged.
- No "Oops", "Uh oh", "We're sorry", "Something went wrong", "It looks like".
- HUD vocabulary: "Route" not "page". "Server" not "our servers".
- `Server unreachable` replaces previous `Failed to reach server` — shorter, terminal-register, matches `ping: connect: Network is unreachable`.

### 2.6 Footer Actions

`CardFooter` — three buttons, two alignment zones:

**Left zone (ghost, secondary):**
- `Copy error details` — `Button variant="ghost" size="default"`
- On click: copies a JSON payload to clipboard:
  ```json
  {
    "timestamp": "<ISO>",
    "digest": "<error.digest or null>",
    "category": "<generic|network|permission>",
    "message": "<error.message>",
    "type": "<error.name>"
  }
  ```
- After copy: label changes to `Copied` for 1500ms (same pattern as `CodeBlock` CopyButton), then resets.

**Right zone (primary + ghost):**
- `Try again` — `Button variant="primary"` — calls `reset()`
- `Go to Jobs` — `Button variant="ghost"` — `<Link href="/jobs">`

Footer layout: `flex items-center justify-between gap-4`

The right-zone button row uses `flex gap-2` — spacing-2, inline sibling gap for action-row Button + Button per spacing.md.

### 2.7 Status Link (below card)

Below the card, a single line:

```
text-caption text-muted-foreground
```

```
Status: <a href="https://status.hud.ai" target="_blank" rel="noopener noreferrer"
   class="text-caption text-muted-foreground underline underline-offset-2 hover:text-foreground">
  status.hud.ai
</a>
```

Rationale: GitHub's error states include a status page link. For a B2B infrastructure product managing RL training jobs, users need to know if an error is a platform outage vs. their own data. This link is the cheapest escalation path. It does not belong inside the card — it is ambient information, not an action.

**global-error variant only:** the status link line gains a Contact-us mailto on the same line (e.g. `Platform status: status.hud.ai · Contact support`), at the same `text-caption text-muted-foreground` weight. This carve-out applies exclusively to `app/global-error.tsx` — when the root layout has crashed there is no app shell, making status alone an insufficient escalation path. Segment `error.tsx` retains the status link only and does not add contact-support copy.

---

## 3. Variant Decision

Three categories, same card structure, copy-only differentiation.

**How to categorize** (in `error.tsx`):
```ts
function categorize(error: Error & { digest?: string }): ErrorCategory {
  const msg = error.message ?? ""
  const status = (error as { status?: number }).status

  if (status === 403 || msg.startsWith("Forbidden:") || /\b403\b/.test(msg))
    return "permission"
  if (/fetch|network|ECONN|ETIMEDOUT|unreachable/i.test(msg))
    return "network"
  return "generic"
}
```

The categorization logic lives in `error.tsx` (app layer). The card component receives a `category` prop — detection heuristics stay in the app, rendering in the component.

---

## 4. Divergence from `not-found.tsx` (404)

| Surface | Signal | Layout | Badge | Metadata grid |
|---|---|---|---|---|
| `error.tsx` (runtime failure) | Route is dead — process terminated | Card with metadata grid | `destructive` | Full (status, type, message, incident) |
| `not-found.tsx` (404) | Thing is missing — wrong address | Centered minimal | `neutral` (404) | None — see not-found spec |

Do not unify these. The card+metadata layout is specific to `error.tsx` because there is structured diagnostic data to render. `not-found.tsx` has no structured metadata — it is a navigation mistake with a known cause.

---

## 5. Token References

All tokens confirmed present in `packages/ui/src/styles/`.

### Card container

| Role | Token | Utility | Resolved value |
|---|---|---|---|
| Card surface | `--color-card` | `bg-card` | `#fcfcfd` |
| Card border | `--color-border` | `border-border` | `#d9d9e0` |
| Card radius | `--radius-surface` | `rounded-surface` | 8px |

### Card header

| Role | Token | Utility | Resolved value |
|---|---|---|---|
| Badge (destructive) | `--color-state-errored-subtle` | destructive badge variant | `Badge` component |
| Headline text | `--color-foreground` | `text-foreground` | `#1c2024` |
| Headline size | `--text-title` | `text-title` | 18px |
| Headline weight | `--font-weight-semibold` | `font-semibold` | 600 |
| Headline tracking | `--text-title--letter-spacing` | `tracking-(--text-title--letter-spacing)` | −0.015em |
| Timestamp text | `--color-muted-foreground` | `text-muted-foreground` | `#60646c` |
| Timestamp size | `--text-caption` | `text-caption` | 12px |

### Metadata grid

| Role | Token | Utility | Resolved value |
|---|---|---|---|
| Label text | `--color-muted-foreground` | `text-muted-foreground` | `#60646c` |
| Label size | `--text-label` | `text-label` | 12px |
| Label weight | `--font-weight-medium` | `font-medium` | 500 |
| Value text | `--color-foreground` | `text-foreground` | `#1c2024` |
| Value mono font | `--font-mono` | `font-mono` | JetBrains Mono |
| Value size | `--text-code` | `text-code` | 12px |
| CodeBlock inline | `--color-muted` border `--color-border` | `CodeBlock variant="inline"` | component |

### Actions

| Role | Token | Notes |
|---|---|---|
| Primary button | `--color-primary` / `--color-primary-foreground` | `Button variant="primary"` |
| Ghost button | `--color-foreground` on transparent | `Button variant="ghost"` |
| Footer divider | `--color-border` | `CardFooter` border-t |

**No new tokens introduced.**

---

## 6. Engineering Handoff Note

### Primitive imports

```tsx
import { Card, CardHeader, CardContent, CardFooter,
         CardTitle, CardDescription,
         Badge, Button, CodeBlock } from "@repo/ui"
import Link from "next/link"
```

`lucide-react` is NOT used in v2. The destructive `Badge` carries the visual signal; no icon is needed. The `Badge` component with `variant="destructive"` renders the correct semantic color using existing tokens.

### Component structure (abbreviated)

```tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardHeader, CardContent, CardFooter,
         Badge, Button, CodeBlock } from "@repo/ui"

type ErrorCategory = "generic" | "network" | "permission"

// categorize() — see §3
// copyFor() — returns { badge, headline, status } per category

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [timestamp] = useState(() => new Date())
  const [copied, setCopied] = useState(false)

  useEffect(() => { console.error(error) }, [error])

  const category = categorize(error)
  const { badge, headline, status } = copyFor(category)

  const copyDetails = useCallback(async () => {
    const payload = JSON.stringify({
      timestamp: timestamp.toISOString(),
      digest: error.digest ?? null,
      category,
      message: error.message ?? null,
      type: error.name ?? null,
    }, null, 2)
    await navigator.clipboard.writeText(payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [timestamp, error, category])

  return (
    <div className="flex min-h-full w-full items-center justify-center py-12">
      <div className="flex w-full max-w-[560px] flex-col items-center gap-3 px-6">

        <Card className="w-full">
          <CardHeader>
            {/* Header: left = badge + headline, right = timestamp */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Badge variant="destructive">{badge}</Badge>
                <h2 className="text-title font-semibold text-foreground
                               tracking-(--text-title--letter-spacing)">
                  {headline}
                </h2>
              </div>
              <time
                dateTime={timestamp.toISOString()}
                className="shrink-0 font-mono text-caption text-muted-foreground"
              >
                {timestamp.toLocaleTimeString("en-US", {
                  hour: "2-digit", minute: "2-digit", second: "2-digit",
                  timeZoneName: "short",
                })}
              </time>
            </div>
          </CardHeader>

          <CardContent>
            {/* Metadata grid */}
            <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-2">
              {/* status */}
              <dt className="text-label font-medium text-muted-foreground">status</dt>
              <dd className="font-mono text-code text-foreground">{status}</dd>

              {/* type — only show if meaningful */}
              {error.name && error.name !== "Error" ? (
                <>
                  <dt className="text-label font-medium text-muted-foreground">type</dt>
                  <dd className="font-mono text-code text-foreground">{error.name}</dd>
                </>
              ) : null}

              {/* message */}
              {error.message ? (
                <>
                  <dt className="text-label font-medium text-muted-foreground">message</dt>
                  <dd className="min-w-0">
                    <CodeBlock
                      variant="inline"
                      code={error.message.length > 160
                        ? `${error.message.slice(0, 160)}…`
                        : error.message}
                      className="max-w-full text-wrap"
                    />
                  </dd>
                </>
              ) : null}

              {/* incident (always present) */}
              <dt className="text-label font-medium text-muted-foreground">incident</dt>
              <dd className="min-w-0">
                {error.digest ? (
                  <CodeBlock variant="inline" code={error.digest} />
                ) : (
                  <span className="font-mono text-code text-muted-foreground">—</span>
                )}
              </dd>
            </dl>
          </CardContent>

          <CardFooter className="justify-between">
            {/* Left: copy details */}
            <Button variant="ghost" size="default" onClick={copyDetails}>
              {copied ? "Copied" : "Copy error details"}
            </Button>

            {/* Right: primary actions */}
            <div className="flex gap-2">
              <Button variant="primary" onClick={reset}>Try again</Button>
              <Button variant="ghost" asChild>
                <Link href="/jobs">Go to Jobs</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Status link — below card */}
        <p className="text-caption text-muted-foreground">
          Platform status:{" "}
          <a
            href="https://status.hud.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            status.hud.ai
          </a>
        </p>
      </div>
    </div>
  )
}
```

### Accessibility

- `<dl>` / `<dt>` / `<dd>` for the metadata grid — semantically a definition list, correct for labeled key/value pairs.
- `<time dateTime={...}>` for the timestamp — machine-readable ISO date in attribute, human-readable display.
- `<h2>` for the headline — the route segment is nested inside the app shell which has its own `h1`-level landmark; `h2` is the correct heading level for content-area errors.
- No decorative icons — badge text carries the semantic signal.

### `error.tsx` MUST be a Client Component

Next.js requires `error.tsx` to be a Client Component. Add `"use client"` as the first line. This is the documented exception to the project's Server Component default.

### `digest` field

`error.digest` is now displayed in the incident row and copied via "Copy error details." In production, it correlates the client error to the server log. In development, it may be undefined — the em dash communicates "no incident ID available" without suggesting the system is broken.

### `reset()` behavior

`reset()` re-renders the route segment from scratch. It does not reload the browser. If the error is permanent, it will fail again — this is expected. The user decides when to retry.

---

## 7. Anti-Patterns

**Layout anti-patterns:**
- Centered icon + headline + badge + buttons (the pattern this spec replaces) — reads as consumer 404, not enterprise error. No structured diagnostic data, no metadata rows, no incident reference.
- Full-page takeover with illustration — wrong for a nested route segment error where the shell persists.
- Using `XCircle` or any icon as the primary signal — the `Badge variant="destructive"` carries semantic color. Icons add visual noise without adding information at this density level.

**Content anti-patterns:**
- Hiding `error.digest` entirely — it is the correlation ID. An engineer filing a Sentry/Datadog ticket without the digest is filing a ticket with no searchable key.
- Rendering raw `error.message` as a prose paragraph — truncated raw string in a monospace `CodeBlock` reads as machine output (correct register). Prose paragraph reads as UI copy (wrong register).
- Omitting the incident row when digest is undefined — the row's presence signals the system's intent. The em dash communicates "no ID yet" without confusing the absence of data with the absence of the concept.
- Status codes as badge text (`exit 1`, `ECONNRESET`, `403`) — these were the badges in v1. They belong in the status row now, where they are labeled. Un-labeled codes require parsing; labeled rows read instantly.

**Copy anti-patterns:**
- "We're sorry for the inconvenience" — HUD reports facts.
- "Oops! Something went wrong." — Consumer register. Wrong persona.
- "It looks like there may be an issue…" — Passive hedge. Exact cause only.
- "Don't worry, we're on it!" — Not true; HUD does not promise monitoring response.
- Encouraging copy of any kind — Aman writes reward functions for a living.

**Interaction anti-patterns:**
- Auto-retry loop — never call `reset()` in a `useEffect`.
- `window.location.reload()` — destroys React state and is a last resort the user can exercise themselves.
- Retry counter / back-off UI — user decides, not the UI.
- Disabling retry after N failures — condescending.

---

## 8. Wireframe

```
┌──────────────────────────────────────────────────────────┐
│  App Header                                              │
├─────────────┬────────────────────────────────────────────┤
│             │                                            │
│  Sidebar    │   ┌──────────────────────────────────┐    │
│             │   │ [ERROR badge]         12:04:31 UTC│    │
│             │   │ Route failed to load              │    │
│             │   ├──────────────────────────────────┤    │
│             │   │ status  │ 500  Internal Server... │    │
│             │   │ type    │ TypeError               │    │
│             │   │ message │ [connection refused…]   │    │
│             │   │ incident│ [d3f1a9bc…]  [copy]    │    │
│             │   ├──────────────────────────────────┤    │
│             │   │ [Copy error details]  [Try again] │    │
│             │   │                       [Go to Jobs]│    │
│             │   └──────────────────────────────────┘    │
│             │   Platform status: status.hud.ai           │
│             │                                            │
└─────────────┴────────────────────────────────────────────┘
```

---

## 9. Component Token Summary

| Token | Role | Change vs v1 |
|---|---|---|
| `bg-card`, `border-border`, `rounded-surface` | Card container | **new** — v1 had no card |
| `Badge variant="destructive"` | Error category signal | **new** — replaces XCircle icon |
| `text-title`, `font-semibold`, `text-foreground` | Headline | unchanged |
| `tracking-(--text-title--letter-spacing)` | Headline letter-spacing | unchanged |
| `text-label`, `font-medium`, `text-muted-foreground` | Metadata row labels | **new** |
| `font-mono`, `text-code`, `text-foreground` | Metadata row values | **new** (was prose paragraph) |
| `CodeBlock variant="inline"` | message + incident values | **new** |
| `Button variant="primary"` | Try again | unchanged |
| `Button variant="ghost"` | Go to Jobs + Copy error details | unchanged (Copy error details new) |
| `text-caption`, `text-muted-foreground` | Timestamp + status link | **new** |

**Removed:** `XCircle` lucide icon, `text-destructive` color, centered single-column layout, raw `exit 1` / `ECONNRESET` / `403` badge text.

---

## 10. Self-Roast

1. **Did I survey enough peers?** Six sources: Sentry, Datadog, Vercel, W&B, GitHub, Linear. Each contributed a distinct structural insight (respectively: metadata sidebar, two-zone panel, machine error code, context lifting, status page link, loading/error distinction). Not cherry-picked — each forced a different design decision.

2. **What does v2 have that XCircle+badge didn't? STRUCTURAL not cosmetic.**
   - `Card` container: elevates the error block as a data artifact, not a centered splash
   - Metadata grid (`dl`): labeled rows transform raw error data into scannable structured diagnostics — this is the structural shift
   - `CodeBlock` for incident + message: machine output in machine-output chrome, not prose
   - Incident row: `error.digest` is now surfaced — engineers can correlate to logs
   - Timestamp: temporal context — when did this fail?
   - Copy payload: structured JSON artifact for ticket filing
   - Status link: escalation path for platform outages
   - `Badge variant="destructive"`: semantic signal without an icon

3. **Would a Sentry engineer think "real engineer's error page" or "prototype"?** The metadata grid, the digest row with inline CodeBlock, and the copy-payload action are the three things that would pass a Sentry engineer's bar. The status link would pass a GitHub infra engineer's bar. The card layout (not centered illustration) would pass a Datadog PM's bar.

4. **Did I default to centered single-column?** No. The card is centered in the content area (unavoidable for a route-segment error with no content to anchor it) but the card itself is a two-column metadata grid — the visual language of a data panel, not a splash screen.
