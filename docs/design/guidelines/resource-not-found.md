# Resource-Not-Found Pattern

**Scope:** Resource-detail routes only — `/<resource-type>/<id>` and nested variants (`/<parent>/<id>/<child>/<child-id>`). Does not apply to marketing-site 404s, page-level error boundaries, or navigation 404s.

---

## Prior art

Six SaaS products handle resource-detail 404s in meaningfully different ways. The load-bearing insights:

**The 404/403 collapse** is an intentional security policy, not a simplification. GitHub collapses 404 and 403 into the same surface at org-level access boundaries; confirming a private repo exists would help attackers enumerate org assets. Linear applies the same collapse everywhere — deleted issues and issues that never existed produce identical surfaces, since confirming deletion reveals that someone deleted something, which in team contexts can be sensitive. The collapse is the right default at any boundary where existence-confirmation carries enumeration risk.

**Wrong-workspace is the one cause worth distinguishing.** Vercel shows "This project belongs to a different team" with a team-switch affordance, accepting a mild existence leak in exchange for a concrete recovery path. This tradeoff is correct when the user is already authenticated and can actually act on the information — the cost of confirming cross-workspace ownership is low; the recovery value is high.

**Nav chrome should stay visible for authenticated-in-context 404s.** Sentry and Plausible both keep their navigation intact when an authenticated user lands on a missing resource — the surface is treated as a content-area event, not a site-level event. Full-page takeover is reserved for unauthenticated or deeply wrong-context cases where there is no nav context worth preserving.

**Deleted vs. never-existed should not be distinguished by default.** Sentry names deletion and accepts the existence leak because data retention is a first-class operational concern in a data product. For products that are not primarily data-retention services (where deletion semantics are a first-class user concern), the honest collapse of deleted and never-existed into "isn't available" is the correct default.

---

## 1. Decision tree — ResourceNotFound vs ErrorState

Start here. Use the first match.

```
Did the resource fail to load due to a network or backend error?
  YES → ErrorState  (the page tried and failed; the resource may still exist)

Did the resource URL resolve but the resource does not exist, is inaccessible,
or belongs to a different workspace?
  YES → ResourceNotFound  (the resource itself is the problem, not the load)
```

### Summary table

| Situation | Component |
|---|---|
| Backend returned 5xx / network timeout | **ErrorState** |
| Backend returned 404 — ID not found or deleted | **ResourceNotFound** |
| Backend returned 403 — no permission (authenticated, intra-org) | **ResourceNotFound** (collapsed — see §3) |
| Resource exists in a different workspace | **ResourceNotFound** `wrong-workspace` variant |
| Page loaded but data region is empty (no items) | **EmptyState** (see `empty-and-error-states.md`) |

**Key test:** Did the _resource_ not exist / not be accessible, or did the _page_ fail to _load_? Resource problem → ResourceNotFound. Load failure → ErrorState. The distinction matters because ErrorState carries a retry affordance; ResourceNotFound does not — there is nothing to retry.

---

## 2. Resource vocabulary discipline

Every copy string on this surface must use the canonical noun for the resource type. Generic web vocabulary is forbidden.

**Required:** Each project must enumerate the canonical noun for each resource type in its product (e.g. Project, Workspace, Repository, Pipeline, Deployment). Use these verbatim on the surface — never a generic substitute.

**Banned:** page · resource · item · record · content · entity

The Next.js default copy — "This page could not be found" — is explicitly forbidden. It uses banned vocabulary and signals a framework default, not a designed surface.

| Anti-pattern | Correct |
|---|---|
| "This page could not be found." | "This \<Resource\> isn't available." |
| "The resource you're looking for doesn't exist." | "This \<Resource\> isn't available." |
| "We couldn't find this item." | "This \<Resource\> isn't available." |
| "Page not found" (heading) | "\<Resource\> \<id\> isn't available." (heading) |

Name the specific resource type on every surface. If the route encodes the resource type, there is no ambiguity — use it.

---

## 3. Cause taxonomy

Five backend causes collapse into three user-visible states. The collapse is the central design decision.

| Backend cause | User-visible state | Rationale |
|---|---|---|
| ID never existed (typo, fabricated URL) | **"This \<Resource\> isn't available."** | Collapse with deleted — confirming never-existed vs. deleted leaks whether the resource was real |
| Resource deleted / archived | **"This \<Resource\> isn't available."** | Confirming deletion exposes the resource existed; collapse is correct in a multi-org product |
| 403 — org-scoped permission denied | **"This \<Resource\> isn't available."** | 404/403 collapse at the authenticated boundary — see §8 decision point 1 for the intra-org exception |
| Resource is in a different workspace | **"This \<Resource\> is in a different workspace."** | Worth distinguishing — user can recover by switching. Mild existence confirmation is acceptable here |
| Transient backend error (5xx, timeout) | **ErrorState** (separate surface) | Not a not-found — do not show ResourceNotFound for transient failures |

**The 404/403 collapse is not a simplification.** Confirming existence-but-inaccessible helps enumerate org assets — wrong in a multi-org B2B context. The wrong-workspace variant is the deliberate exception: recovery value (switch workspace) justifies mild existence confirmation when cross-workspace ownership is confirmed by the backend.

**What is never distinguished:** deleted vs. never-existed. The backend may know; the surface does not expose it. (See §8 decision point 3 for the soft-delete exception.)

---

## 4. Tone and copy

Voice is peer, not guide. Direct cause. No apology, no hedge, no encouragement copy. Show what the user can do, not how the system feels about the situation.

### Copy form per state

**"Isn't available" (default state)**

```
Heading:   <Resource> <id> isn't available.
Sub-label: (omit — the heading is sufficient)
CTA:       Go to <Resource list>
```

Example: `Project abc123 isn't available.` → `[Go to Projects]`

**"Wrong workspace" variant**

```
Heading:   This <Resource> is in a different workspace.
Sub-label: Switch workspace to view it.
CTA:       Switch workspace
```

**Incorrect copy examples:**

- "Oops! We couldn't find this page." — apology construct; "page" is banned vocabulary.
- "It looks like this resource may have been moved or deleted." — hedge; "resource" is banned; "may have been" is weak.
- "Sorry, we can't find what you're looking for." — apology; no named resource type; no recovery direction.
- "404 — Not Found" — HTTP code is not user vocabulary.

---

## 5. Information exposure rules

These rules govern what the surface is permitted to show. Engineers wiring backend status codes to copy should treat this as the binding spec.

**Show:**

- The resource type using the project's canonical noun verbatim.
- The resource ID from the URL — the user already has it (it is in their address bar) and may need it to cross-reference with logs, CLI output, or a colleague. Pattern: `<Resource> <id> isn't available.`
- Parent context derivable from the URL without a permissions check. If the URL encodes a parent resource ID for a missing child, linking to the parent is safe because the parent ID is already in the URL structure.
- Workspace name in the wrong-workspace variant (the recovery action requires it; existence confirmation is accepted for this variant only).

**Do not show:**

- Whether the resource was deleted vs. never existed.
- Which user or org deleted it, or when.
- Backend error detail: database errors, null-pointer output, internal UUIDs that differ from the URL-visible ID.
- HTTP status codes in copy ("404", "403") — implementation details, not user vocabulary.
- Confirmation that a resource exists when the user lacks permission (the 404/403 collapse rule).
- Stack traces or query context under any circumstances.

---

## 6. Recovery affordances

Ordered by priority. The surface presents only the highest applicable affordance as the primary CTA — do not stack all three.

**1. Domain-specific back-route (primary CTA — always present)**

1. Link to the closest list-level parent (`/<resource-type>`), not to the application root. Users orient fastest from the closest list-level parent.
2. For nested resources (`/<parent>/<id>/<child>/<child-id>`), link to the parent resource if it exists, else link to the parent list (`/<parent>`).

**2. Workspace switch (wrong-workspace variant only)**

Show "Switch workspace" as primary CTA when the backend can confirm cross-workspace ownership. Do not show this affordance when the resource origin is unknown — it would falsely imply the resource exists somewhere the user can reach.

**3. cmd+K / search (passive — no explicit CTA)**

When the nav chrome is visible (the authenticated default — see §7), cmd+K is available without a surface-level CTA. Do not lead with it; it is not the primary recovery path and adding it as a CTA adds noise to a surface that should stay minimal.

**Do not include:** "Contact support" as any affordance on this surface. Support access belongs in the help menu.

---

## 7. Visual weight and chrome

**Default (authenticated):**

- Render in the content area where the resource would have appeared. Header, top nav, and sidebar stay intact.
- Inline, not full-page. The "not found" state is a content-area event, not a site-level event.
- Low visual weight: heading + optional sub-label (wrong-workspace variant only) + primary CTA. No illustration. No large icon.

**Exception (unauthenticated / session expired):**

When the user is unauthenticated (shared link opened without a session, expired session), a full-page surface is appropriate — there is no nav context to preserve and the user needs to authenticate before any recovery path is meaningful.

### Anatomy — default ("isn't available") state, authenticated context

```
┌─ content area (where the resource view would render) ──────────────────┐
│                                                                        │
│                                                                        │
│              ┌─ max-width: 360px ────────────────────┐                  │
│              │                                        │                  │
│              │  Project abc123 isn't available.       │  ← --color-foreground
│              │                                        │                  │
│              │  [Go to Projects]                      │  ← Button default
│              │                                        │                  │
│              └────────────────────────────────────────┘                  │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

360px column is centered (horizontally + vertically) in the content area.
Heading and CTA read left-aligned within the column.
Nav chrome (header + sidebar) stays visible above and alongside.
No icon block. No illustration. No sub-label in default state.
```

**Token assignments:**

| Element | Token |
|---|---|
| Heading text | `--color-foreground` |
| CTA | `Button` default variant (inherits from design system) |
| Background | content area background — no overlay, no scrim |
| Sub-label (wrong-workspace variant only) | `--color-muted-foreground` |

**Sizing and spacing:**

- Heading: body-large or equivalent — matches the product's base heading scale for content areas.
- CTA: standard Button size for the content area (not compact, not oversized).
- Vertical alignment: centered within the content area — the small visual weight (no icon, no illustration, single heading + CTA) reads as a soft halt in the middle of the slot rather than a top-loaded content block.
- Horizontal: centered within the content area; the 360px inner column stays left-aligned internally so heading and CTA read naturally within their own axis.

---

## 8. Decisions the adopting project must resolve

Do not resolve these in the UI spec until the project has answered them. Each is a design branch point.

**1. Backend 404/403 reliability.**
Can the backend reliably return a distinct status for "resource exists but permission denied" vs. "resource does not exist" at query time, without an extra DB round-trip? If yes, an authenticated intra-org "You don't have access to this \<Resource\>" state (with a request-access affordance) is buildable. If not, or if the extra call is expensive, the collapse to "isn't available" is preferable. This is the largest copy-tree branch — it determines whether a request-access CTA is ever surfaced.

**2. Wrong-workspace detection.**
Can the backend cheaply detect that a resource ID exists in a different workspace the authenticated user belongs to (multi-org membership)? If yes, the workspace-switch variant is buildable. If not, wrong-workspace collapses into the standard "isn't available" message and the workspace-switch affordance is removed.

**3. Deleted resource retention.**
Are deleted resources soft-deleted (tombstoned with a deleted-at timestamp) or hard-deleted? Soft-delete would enable a specific "This \<Resource\> was deleted on \<date\>" message without leaking content. Decide whether that message is useful enough to add implementation complexity for, or whether "isn't available" covers it adequately.
