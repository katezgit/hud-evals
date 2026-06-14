# UX Flow — Onboarding

Route arc: `/register` → `/onboarding/org` → `/onboarding/invite` → `/` (Home, Get Started landing)

Cross-link: [`docs/design/screens/onboarding.wireframe.md`](../screens/onboarding.wireframe.md)

---

## North star

**Time to First Hello World (TTFHW) under 5 minutes.** Every step must justify its existence against this budget. Drop-off between any two steps is a fixable bug. [Source: `docs/design/guidelines/onboarding.md` Rule 1]

Activation is defined as: first Eval Job completed with ≥1 Trace returned from a deployed Environment. Activation is an event, not a screen.

---

## What this flow covers

Post-signup through the Get Started dashboard landing. The two forced wizard screens (org-create and invite) are the entire forced onboarding surface. Everything downstream (install SDK, set API key, deploy first Environment, run first eval) is user-initiated from the dashboard.

---

## Flow diagram

```
[ OAuth / magic-link signup ]
        │
        ▼
[ 1. Create org ]           ← /onboarding/org
  Name + slug
  Logo optional
  No skip affordance — org creation is required
        │
        ▼
[ 2. Invite members ]       ← /onboarding/invite
  Email(s) + role
  "Skip" text-link below CTA (single skip path)
  Inline success on send — no separate confirmation screen
  ┌─────┴───────┐
  Skip       Send invitations
  │               │
  └─────┬─────────┘
        │
        ▼
[ 3. Get Started landing ]  ← / (Home — persistent for new users)
  "Get started with HUD" heading
  Optional intro video
  Two cards: "Use an Environment template" (Most popular) | "Read the docs"
  "Skip / or go to your dashboard →" → navigates to /jobs, no flag written
  Dismissible Setup panel (collapsed by default, dismiss is in-session only)
  Install uv / API key / first Environment accordion — user-initiated
        │
        ├─── "Use an Environment template" ──→ template picker → CLI flow
        │     env_deployed + first_call_from_deployed_code fire here
        │
        ├─── "Read the docs" ──→ docs.hud.ai (new tab)
        │
        └─── "Skip / go to your dashboard →" ──→ /jobs (sidebar nav also available at any time)
```

---

## Step-by-step

### Step 1 — Create org (`/onboarding/org`)

**Who**: All users, immediately after email verification / OAuth callback.

**Screen**: `/onboarding/org` — single centered card. Two required fields (org name, slug) and one optional affordance (logo upload). No skip affordance — org creation is the only forced step.

**Action that ends the step**: User clicks "Create organization" with a valid org name + slug.

**System response**: Org record created. User record attached to org as Owner. Session scoped to new org.

**Success criterion**: Org exists in the system with slug; user is Owner.

**TTFHW impact**: One required form; pre-filled from signup name reduces friction. ~20 seconds.

---

### Step 2 — Invite members (`/onboarding/invite`)

**Who**: All users, immediately after Step 1.

**Screen**: `/onboarding/invite` — single centered card. Chip-style email input (comma-separated or Enter-to-add). Role selector (default: Member). "Send invitations" primary CTA. "Skip" text-link directly below the CTA at equal visual weight. No header-level skip link — one skip path only (the in-card link below the CTA).

**Action that ends the step**:
- "Skip" text-link → proceeds to Get Started landing. No invites queued. ~1 click.
- "Send invitations" → invites queued async. Form collapses to inline one-line success (`✓ Invitations sent`). CTA becomes "Continue". Proceeds on click.

**No separate confirmation screen**: The `00c` pattern (a dedicated `/onboarding/invited` screen) is replaced by inline success within the same card.

**System response**: Invites queued and sent asynchronously. User proceeds to Get Started landing immediately — invite delivery does not block progress.

**Success criterion**: User reaches the Get Started landing regardless of invite send status.

**TTFHW impact**: Alex path: 1 click (Skip). Sam path: ~30–60 seconds.

---

### Step 3 — Get Started landing (`/`)

**Who**: All users who completed Steps 1–2.

**Surface**: Standard dashboard layout (sidebar + global nav restored). The Get Started landing is the persistent home for new users — it always renders on first load of `/`. Not a wizard screen; wizard chrome is gone. There is no completion flag and no auto-redirect away from `/` for returning users. Returning users reach `/jobs` and other surfaces via the sidebar at any time.

**Contents**:
- Heading: "Get started with HUD"
- Optional intro video block (16:9 embed; omitted if no video asset)
- Question: "How do you want to get started?"
- Two cards: "Use an Environment template" (badge: "Most popular") and "Read the docs" (links `docs.hud.ai`)
- "Skip / or go to your dashboard →" text-link below the cards — navigates to `/jobs`. Writes no persistent state (no localStorage, no session flag).
- Dismissible Setup panel: collapsed by default, title row "SET UP" with expand toggle and Dismiss ×. "Dismiss ×" hides the panel for the current in-session view only — does NOT gate the landing on future loads (no localStorage write). Expanding reveals the five-item accordion (Install uv, Install HUD Tool, Get and Set API Keys, Create Your First Environment, Explore Documentation) mirroring production screenshot `00d`. Each item has a self-report "I've done this" affordance.

**Action that ends the step**: The user navigates away voluntarily — via any card, the skip link, or the sidebar. No gate, no forced redirect.

**System response**: User's chosen path initiates downstream flow (template picker, docs tab, or `/jobs`).

**Success criterion**: User has entered the dashboard and chosen an initial path.

**TTFHW impact**: One click from this landing to any path. The template card is the highest-signal path to first eval.

---

## Persona divergence

| Step | Alex (Frontier RL Researcher) | Sam (Applied Agent Engineer) | Riley (RL Env Vendor) |
|---|---|---|---|
| Create org | Pre-filled name → one click. Logo skipped. ~20 sec. | May rename to team/company. Still ≤30 sec. | Own name or company. Same as Alex. |
| Invite members | Clicks "Skip" (in-card link). 1 click. | Enters ~5 teammate emails, sends. ~30–60 sec. | Clicks "Skip" (in-card link). Solo contractor. |
| Get Started landing | Clicks "Use an Environment template" → picks Coding or Blank template → CLI. Ignores setup panel. | May expand Setup panel for API key, then clicks template card. | Clicks "Skip / go to your dashboard →" → uses sidebar to navigate to Environments directly. |
| Total to template/CLI | 3 clicks (create org → skip invite → template card) | ~2 min (create org → invite teammates → template card) | 3 clicks (create org → skip invite → sidebar nav) |

**Alex path critical rule**: If Alex ran `hud init` before opening the dashboard, the system treats the account as "not new" and skips onboarding entirely. The Get Started landing does not appear. Dashboard shows the standard Home with the first Job already seeded.

---

## What is excluded from the forced flow

These were previously forced wizard steps. They are now downstream of the Get Started landing or live in the Setup panel.

| Previously forced | Now lives at |
|---|---|
| Workspace-mode step (solo vs team radio) | Removed. Invite step covers the distinction: send = team, skip = solo. |
| API key + prereqs step | Setup panel on the dashboard (collapsed, user-initiated) or within the template flow. |
| Template deploy step | Downstream of "Use an Environment template" card. |
| First Eval Job step | Downstream of template flow. |
| Activation screen | `onboarding_complete` event only. No screen. |
| Post-activation checklist panel | Superseded by the Get Started landing + dismissible Setup panel. |

Also excluded from all screens:
- SAML / SSO configuration (Org Settings)
- Billing entry (no credit card in onboarding)
- Persona survey or "which persona are you?" modal
- Product tour overlays
- Gamification, badges, streaks
- Celebration copy or confetti
- Training Job surfaces
- Compliance chrome (Alex's path)

---

## Instrumentation

Five funnel events from `docs/design/guidelines/onboarding.md` Rule 7 plus HUD-specific onboarding events.

| Event | Trigger | Surface that fires it | Properties |
|---|---|---|---|
| `landing` | User lands on `/register` or `/login` | Pre-signup public surface | `source`, `utm_*` |
| `signup` | OAuth callback / magic-link verified — account created | `/register` callback | `provider` (github / google / email) |
| `api_key_issued` | Key first displayed in the Setup panel | Dashboard Setup panel accordion — "Get and Set API Keys" item | `key_type` (test), `org_id` |
| `first_successful_call` | First API call using the issued key returns 2xx | Backend / SDK — fires server-side | `org_id`, `env_id` |
| `first_call_from_deployed_code` | First Trace created from user's deployed Environment | Backend / template flow — fires on first Trace | `env_id`, `taskset_id`, `job_id` |
| `invites_sent` | User clicks "Send invitations" on Step 2 | `/onboarding/invite` | `invite_count`, `org_id` |
| `env_deployed` | Environment deployed via template flow | Template picker → deploy action | `template_id`, `env_id`, `org_id` |
| `first_trace_returned` | First Run in an Eval Job completes | Job execution — fires on first completed Run | `job_id`, `trace_id`, `org_id`, `time_since_signup_ms` |
| `onboarding_complete` | User first navigates away from the Get Started landing (via card, skip link, or sidebar) | Dashboard routing | `org_id`, `path_taken` (template / docs / skip / sidebar), `ttfhw_ms` |

**Funnel event surface mapping (the five mandated events)**:

1. `landing` → `/register` or `/login` (pre-signup surface, unchanged)
2. `signup` → OAuth callback (unchanged)
3. `api_key_issued` → **Setup panel** on the dashboard (moved from previously-forced Step 4 wizard screen)
4. `first_successful_call` → **server-side / SDK** (unchanged — not a screen event)
5. `first_call_from_deployed_code` → **template/CLI flow** (moved from previously-forced Step 6 wizard screen)

No funnel event is lost. Events 3 and 5 move from forced wizard screens to user-initiated surfaces. Drop-off from `signup` → `api_key_issued` now measures how many users open the Setup panel — which is a more honest signal of intent than "user clicked through a forced screen."

Drop-off between any two consecutive events is a fixable bug. Alert on funnel regressions weekly.

---

Derived from: `docs/design/guidelines/onboarding.md`, `docs/product/personas.md`, `docs/product/alex-workflow.md`, `docs/product/alex-user-stories.md`, `docs/product/platform.md`, `docs/product/personality.md`.
