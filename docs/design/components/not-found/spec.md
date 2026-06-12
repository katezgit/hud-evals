# Not-Found Page — Component Spec

**Scope decision: hybrid (c) — universal default + per-segment carve-outs for Job and Run only.**

Justification is in §5. Read it before changing the approach.

**Semantic refs:** `docs/design/foundations/color.md`, `typography.md`, `spacing.md`, `radius.md`, `elevation.md`.

**Phase carve-out:** `components` spec authored during `wireframes` phase — foundational engineering need. No domain-review gate required for this carve-out; operator-approved scope.

---

## 1. Scope Boundary

This spec covers the Next.js App Router `not-found.tsx` surface — the page rendered when:

1. A URL does not match any route segment in `app/` (typo, bookmark rot, dead link)
2. A Server Component calls `notFound()` explicitly (entity ID looked up in the database, came back null or 404)

**Distinct from:**

| Surface | Why excluded |
|---|---|
| `error.tsx` (runtime crash) | Route segment threw — different failure mode. Error-page spec at `docs/design/components/error-page/spec.md`. Same chrome language; different content. |
| Inline empty states | "No jobs yet" — the route exists, the data is empty. Zero-state, not missing-route. |
| Toast / form errors | Transient, non-blocking, in-context. Not a route boundary. |

**What this surface says:** "The thing at this URL does not exist." It does not say "something crashed." That distinction governs every copy and action decision below.

---

## 2. Composition

### 2.1 Layout

Mounts inside the app shell. Header and sidebar persist. This surface occupies the **main content area** — the scrollable region that normally shows route content. Identical shell behavior to `error.tsx`.

```
┌──────────────────────────────────────────────┐
│  [Header — persists]                         │
├─────────────┬────────────────────────────────┤
│             │                                │
│  [Sidebar   │                                │
│  persists]  │      ┌────────────────────┐    │
│             │      │                    │    │
│             │      │   [badge]          │    │
│             │      │   [headline]       │    │
│             │      │   [diagnostic]     │    │
│             │      │                    │    │
│             │      │   [primary action] │    │
│             │      │   [secondary]      │    │
│             │      │                    │    │
│             │      └────────────────────┘    │
│             │                                │
└─────────────┴────────────────────────────────┘
```

The content block is vertically centered in the main content area, horizontally centered within it. `max-w-[480px]` — same cap as error-page, consistent feel at widescreen.

Layout classes: `flex items-center justify-center w-full min-h-full py-12` on the boundary container; `flex flex-col items-center gap-4 max-w-[480px] px-6 text-center` on the content block.

### 2.2 Badge Treatment

**Decision: monospaced badge showing `404` — matching the `exit 1` language family from error-page.**

The error-page spec established the terminal/CLI motif for this product's error-class surfaces. `404` is the exact vocabulary of the failure — it is what Aman sees in server logs, curl output, and HTTP traces. `not_found` (the POSIX-ish variant) reads natural in a per-segment context, and is used for entity-specific variants (see §3).

**Rendering spec:**

```
┌──────────┐
│  404     │   ← font-mono, text-label (12px), font-medium
└──────────┘
```

Token references:
- Background: `bg-muted` (`--color-muted`)
- Border: `border border-border` (`--color-border`)
- Text: `text-muted-foreground font-mono` (`--color-muted-foreground`)
- Radius: `rounded-md` (`--radius-md`, 6px)
- Padding: `px-3 py-1.5`
- Size: self-sized (inline-flex)

For per-segment variants, the badge shows `not_found` — the distinction signals "this specific entity does not exist" vs. "this URL does not match any route." Both read as the same motif family; the text shifts the register slightly toward the data layer.

### 2.3 Headline Copy Pattern

Copy rules (same register as error-page):
- Present-tense statement of fact
- No "Oops", "Sorry", "Uh oh", "We can't find", "It looks like"
- HUD vocabulary: entity names match the product noun (Job, Taskset, Run, Environment, Agent, Model)
- Neutral tone — not accusatory ("you typed a bad URL"), not apologetic ("we lost it")

**Universal (unknown URL):**
```
Page not found
```

This is the fallback for URLs that match no route — a typo, a stale link, a nav bug. "Page" is acceptable here because the specific entity type is unknowable from an unmatched route.

**Per-segment variants** (entity-specific — see §3 for when these fire):

```
Job not found
```
```
Run not found
```

Token references: `text-title font-semibold text-foreground` (`--text-title` 18px, `--font-weight-semibold` 600, `--color-foreground`)

### 2.4 Diagnostic Line

**Decision: show the bad URL path for the universal case; show the entity ID for per-segment variants.**

Rationale: The diagnostic line is the first triage signal. For an unmatched URL, the path itself is the signal — Aman can immediately see if he copy-pasted a wrong slug. For a per-segment 404 on a Job or Run, the ID is the relevant signal — the URL is already in the browser bar, but the ID is what he needs to cross-reference against Slack notifications, CI logs, or a teammate's message.

**Universal variant:**
```
/tasksets/checkout-flow/jobs/4822x          ← truncated at 80 chars, mono
```

**Per-segment Job/Run variant:**
```
Job 4821 · deleted or superseded by a re-run
```

The secondary hint ("deleted or superseded by a re-run") is static copy — it is the most common reason an Aman-triggered 404 occurs (Slack notification → click → job gone). It is a hypothesis, not a fact, but it is the right hypothesis to surface for triage.

**Rendering spec:**
- `text-body text-muted-foreground font-mono` for the path/ID portion — `--text-body` (13px), `--color-muted-foreground`
- For the hint text on per-segment: `text-body text-muted-foreground` (sans-serif) — `--text-body` (13px)
- `max-w-[440px]`
- `line-clamp-2`

**Do not show:** "Error 404" as a sentence, stack traces, internal route resolution details.

### 2.5 Primary Action

**Universal:** `Go to Jobs`

`/jobs` is the anchor surface — the root redirect, the "wake-up triage" view. It is guaranteed to render for any authenticated user and covers Aman's recovery path (all jobs surface, filter to find what he was looking for).

**Per-segment Job/Run variant:** `Go to Jobs`

Same anchor. After a deleted-job 404, returning to the Jobs list is the correct recovery — it shows the current fleet state and the user can determine if the job was superseded, renamed, or genuinely gone.

Button spec:
- `variant="primary"` (near-black fill, `--color-primary`)
- `size="default"`
- Rendered as a Next.js `<Link>` inside `<Button asChild>`

### 2.6 Secondary Action

**Universal:** `Go back`

Uses `router.back()`. Justification: for an unmatched URL (typo, dead link), the most likely recovery is returning to wherever they came from. Unlike an error-page crash, there is no broken segment to reset — the user simply navigated to a nonexistent destination. `router.back()` covers bookmark-rot (Priya's case), mistyped URLs, and stale doc links. It does not loop (the previous route was a valid, rendered page).

**Per-segment Job/Run variant:** `Go to Taskset`

When a specific Job or Run 404s, the parent Taskset is the recovery surface — Aman can see the full job list for that taskset, confirm whether the job was superseded, and open the replacement. This is more useful than `Go back` (which might be the same 404 page if they arrived via a Slack deep link) and more specific than `Go to Jobs` (which loses the taskset context).

The Taskset link is derived from the URL: `/tasksets/[id]/jobs/[jid]` → secondary action links to `/tasksets/[id]`. The per-segment `not-found.tsx` receives the dynamic params from the segment context.

Button spec:
- `variant="ghost"` (transparent, `text-foreground`)
- `size="default"`
- Rendered as `<Button asChild>` wrapping `<Link>`

**Why not "Browse Tasksets" or Search?** Browse is a low-value recovery action for Aman — he knows which taskset he wants. Search does not exist yet in the portal; spec it when it ships.

---

## 3. Variant Matrix

Three variants. Same layout, same badge-motif family, copy and badge text changes.

| Variant | Fires when | Badge | Headline | Diagnostic | Primary | Secondary |
|---|---|---|---|---|---|---|
| Universal | URL matches no route (any `app/not-found.tsx`) | `404` | `Page not found` | URL path (mono, truncated) | `Go to Jobs` | `Go back` |
| Job | `/tasksets/[id]/jobs/[jid]/not-found.tsx` — job ID not found in DB | `not_found` | `Job not found` | `Job [jid] · deleted or superseded by a re-run` | `Go to Jobs` | `Go to Taskset` |
| Run | `/tasksets/[id]/jobs/[jid]/runs/[rid]/not-found.tsx` — run ID not found | `not_found` | `Run not found` | `Run [rid] · deleted or no longer available` | `Go to Jobs` | `Go to Taskset` |

---

## 4. Token References

All tokens are confirmed present in `packages/ui/src/styles/`. No new tokens introduced.

### Badge

| Role | Token | Utility | Resolved value |
|---|---|---|---|
| Badge surface | `--color-muted` | `bg-muted` | `#f0f0f3` |
| Badge border | `--color-border` | `border-border` | `#d9d9e0` |
| Badge text | `--color-muted-foreground` | `text-muted-foreground` | `#60646c` |
| Badge font | `--font-mono` | `font-mono` | JetBrains Mono / Geist Mono |
| Badge text size | `--text-label` | `text-label` | 12px |
| Badge radius | `--radius-md` | `rounded-md` | 6px |

### Headline

| Role | Token | Utility | Resolved value |
|---|---|---|---|
| Headline text | `--color-foreground` | `text-foreground` | `#1c2024` |
| Headline size | `--text-title` | `text-title` | 18px / 24px line-height |
| Headline weight | `--font-weight-semibold` | `font-semibold` | 600 |
| Letter spacing | `--text-title--letter-spacing` | `tracking-(--text-title--letter-spacing)` | −0.015em |

### Diagnostic

| Role | Token | Utility | Resolved value |
|---|---|---|---|
| Path/ID text | `--color-muted-foreground` | `text-muted-foreground` | `#60646c` |
| Path font | `--font-mono` | `font-mono` | JetBrains Mono / Geist Mono |
| Path size | `--text-body` | `text-body` | 13px |
| Hint text | `--color-muted-foreground` | `text-muted-foreground` | `#60646c` |

### Actions

| Role | Token | Notes |
|---|---|---|
| Primary button | `--color-primary` / `--color-primary-foreground` | `Button variant="primary"` — inherits all button tokens |
| Ghost button | `--color-foreground` on transparent | `Button variant="ghost"` — inherits all button tokens |
| Action gap | spacing ramp | `gap-2` (8px) between primary and secondary — spacing-2, inline sibling gap for action-row Button + Button per spacing.md |

---

## 5. Scope Decision — Hybrid Justified

**Pick: (c) Hybrid — universal default + per-segment carve-outs for Job and Run only.**

### The analysis

**Aman's frequency driver is concrete.** The spec input names it: Slack notification → click → job deleted / moved / superseded by re-run. Continuous quality pipelines generate high job churn. A Job 404 for Aman is not a navigation mistake — it is a meaningful data signal: "this job existed, now it doesn't, why?" The copy "Job 4821 · deleted or superseded by a re-run" answers his triage question *on the page* before he has to open the Taskset list. "Page not found" gives him nothing.

A Run 404 is the same pattern one level deeper — runs within a job come and go; Aman or a CI system may be deep-linking to a specific run that has since been garbage-collected or overwritten.

**Priya's frequency driver is low.** Broken doc links and stale screenshot URLs are occasional, not continuous. The universal `404` + "Page not found" + URL diagnostic is sufficient for her case. She does not need entity-specific copy to recover from a dead link — she needs to navigate somewhere valid.

**Why not (b) — per-segment for every entity route?**

Entity routes today: `tasksets/[id]`, `tasksets/[id]/jobs/[jid]`, `tasksets/[id]/jobs/[jid]/runs/[rid]`, `environments/[id]`, `models/[id]`, `agents/[id]`, `library/[id]`.

Applying (b) fully:
- `tasksets/[id]/not-found.tsx` — Taskset not found. When does this fire for Aman? Tasksets are durable; they are not deleted by CI. Low frequency. Copy: "Taskset not found." Recovery: `Go to Tasksets`. Marginally better than universal, but not high-leverage.
- `environments/[id]/not-found.tsx` — same argument. Environments are stable infrastructure; they are not deleted at high frequency. Low leverage.
- `models/[id]/not-found.tsx`, `agents/[id]/not-found.tsx`, `library/[id]/not-found.tsx` — very low frequency. An agent or model 404 is almost always a bad URL, not a deletion event.

The marginal copy improvement for Taskset / Environment / Model / Agent / Library does not justify 5 additional files, 5 additional Storybook stories, and the maintenance surface of keeping them in sync as the product evolves. The rule is: if the entity type is high-churn and deep-link-delivered (Slack/CI → URL), give it a per-segment. If it is a durable resource rarely deep-linked in hot workflows, universal covers it.

**Why not (a) — universal only?**

Because "Page not found" for a deleted Job is a lie of omission. Aman knows the job *existed* — he has the ID from Slack. "Page not found" reads as a broken URL. "Job 4821 · deleted or superseded by a re-run" reads as honest telemetry. The copy difference is the difference between "your navigation broke" and "the entity lifecycle moved on." At Aman's usage frequency, that distinction is daily friction.

**The hybrid produces:**
- `app/not-found.tsx` — universal fallback (typos, stale links, any unmatched URL)
- `app/(app)/tasksets/[id]/jobs/[jid]/not-found.tsx` — Job variant
- `app/(app)/tasksets/[id]/jobs/[jid]/runs/[rid]/not-found.tsx` — Run variant

Three files. Manageable. Incrementally extensible if Taskset churn increases over time.

---

## 6. Engineering Handoff Notes

### `not-found.tsx` is a Server Component

Unlike `error.tsx`, `not-found.tsx` does not require `"use client"`. It is a standard Server Component (or can be). No `reset()` prop, no error boundary. The component can be async and read params from `useParams()` (client) or receive them from the calling Server Component via `notFound()` context.

**Note:** Next.js does not currently pass the missing ID to `not-found.tsx` directly via props. The per-segment variants need to read the ID from `params` (which ARE available in `not-found.tsx` when it's inside a dynamic segment). The segment `not-found.tsx` file lives inside `[jid]/` so `params.jid` is available via the standard Next.js params mechanism.

### Props surface

The shared `NotFoundPage` component (in `packages/ui` or `apps/web/components`) receives:

```tsx
type NotFoundVariant =
  | { kind: "universal"; path: string }
  | { kind: "job"; tasksetId: string; jobId: string }
  | { kind: "run"; tasksetId: string; jobId: string; runId: string }
```

- `kind: "universal"` — renders `404` badge, "Page not found", URL path diagnostic, "Go to Jobs" + "Go back"
- `kind: "job"` — renders `not_found` badge, "Job not found", job-ID diagnostic, "Go to Jobs" + "Go to Taskset"
- `kind: "run"` — renders `not_found` badge, "Run not found", run-ID diagnostic, "Go to Jobs" + "Go to Taskset"

The `path` for the universal variant: server-side read of the incoming URL from `headers()` (`x-invoke-path` or `x-url` depending on deployment target), or passed down from the root layout. Implementation detail is the engineer's; the component accepts a string.

### `router.back()` for secondary action on universal variant

The universal `not-found.tsx` is a Server Component, so `router.back()` must be wrapped in a small `"use client"` button subcomponent. Pattern:

```tsx
"use client"
export function GoBackButton() {
  const router = useRouter()
  return <Button variant="ghost" onClick={() => router.back()}>Go back</Button>
}
```

The engineer should not make the entire `not-found.tsx` a Client Component just to use `router.back()`. Extract the button only.

### `notFound()` call location

The per-segment 404 fires when a Server Component in that segment calls `notFound()`. Example for Job detail:

```tsx
// app/(app)/tasksets/[id]/jobs/[jid]/page.tsx
const job = await fetchJob(params.jid)
if (!job) notFound()
```

Next.js then renders `not-found.tsx` in the nearest ancestor that has one — which is the per-segment file at the same route level.

### 6.5 Group-level chrome on typo'd URLs

Group-level `not-found.tsx` files (e.g. `(manage)/not-found.tsx`) only render with the group's layout (sidebar, header) wrapped around them when `notFound()` is **explicitly** called inside the group's segment chain. Next.js 16's `global-not-found.tsx` intercepts typo'd URLs by default and renders chrome-less. To preserve the group's chrome on typo'd URLs, add a catch-all under that group:

```tsx
// app/(group)/<root>/[...catchAll]/page.tsx
import { notFound } from "next/navigation";
export default function CatchAll() { notFound(); }
```

See `docs/conventions/app-conventions.loading-and-errors.md` § "Next.js 16: global-not-found.tsx shadows group-level not-found.tsx" for the engineering rule.

---

## 7. Wireframes

### Universal

```
┌──────────────────────────────────────────────────────────────┐
│  [App Header — persists]                                     │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  [Sidebar    │                                               │
│   persists]  │           ┌──────────────────┐               │
│              │           │  404             │  ← badge      │
│              │           └──────────────────┘               │
│              │                                               │
│              │          Page not found                       │
│              │                                               │
│              │   /tasksets/checkout-flow/jobs/4822x          │
│              │                                               │
│              │        [  Go to Jobs  ]  [Go back]            │
│              │                                               │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

### Job variant

```
┌──────────────────────────────────────────────────────────────┐
│  [App Header — persists]                                     │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  [Sidebar    │                                               │
│   persists]  │           ┌──────────────────┐               │
│              │           │  not_found       │  ← badge      │
│              │           └──────────────────┘               │
│              │                                               │
│              │           Job not found                       │
│              │                                               │
│              │  Job 4821 · deleted or superseded by a re-run │
│              │                                               │
│              │     [  Go to Jobs  ]  [Go to Taskset]         │
│              │                                               │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

Elements stack vertically with `gap-4` (16px) between badge, headline, diagnostic, and action row — spacing-4, block-to-block per spacing.md. Action row: `flex-row gap-2` — primary left, ghost right (reading order matches action priority). Identical layout rhythm to error-page.

---

## 8. Anti-Patterns

**Copy:**
- "We couldn't find that page" — passive, apology register
- "Oops! That page doesn't exist" — consumer product
- "404 Error — Page Not Found" — redundant, bureaucratic
- "Please check the URL and try again" — condescending; Aman knows how URLs work
- "Don't worry, you can always go back!" — encouragement is noise

**Visual:**
- Lost astronaut / ghost illustration — personality doc rules this out explicitly
- Colored wash (red/orange 404 treatment) — decorative color anti-pattern per personality
- Giant `404` typographic display — this is not a consumer marketing page
- Empty state treatment (dashed border, "No results") — this is a missing-route, not an empty data set

**Interaction:**
- Auto-redirect countdown ("Redirecting to /jobs in 5…") — removes user control, disorienting
- Showing the full stack trace of the notFound() call — security risk, noise
- Broken link checker embedded in the page — scope creep; not a portal concern

---

## 9. Component Token Summary

No new component-level tokens. Composes existing semantic tokens identical to the error-page:

| Token | From spec |
|---|---|
| `bg-muted`, `border-border`, `text-muted-foreground` | color.css |
| `text-foreground`, `text-title`, `font-semibold` | color.css, typography.css |
| `font-mono`, `text-code`, `text-label`, `text-body` | typography.css |
| `rounded-md` | radius.css |
| `Button variant="primary"`, `Button variant="ghost"` | button/spec.md |
