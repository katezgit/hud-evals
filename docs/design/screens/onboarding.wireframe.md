# Onboarding — Screen Wireframes

Routes: `/onboarding/org` → `/onboarding/invite` → `/` (Home, "Get Started" landing)

Cross-link: [`docs/design/flows/onboarding.md`](../flows/onboarding.md)

---

## Layout shell — all onboarding screens

Centered-card layout. No global sidebar. No top nav. `bg-muted` page, card `variant="elevated"`. The shell signals "you are outside the app" without a dark-page inversion.

**Progress strip**: Two dots only — one for org-create, one for invite. Shown on Step 1 and Step 2. Not shown on the post-onboarding Get Started landing (Step 3 is the dashboard, not a wizard step).

```
Step dots:  ● ○
            Org  Invite
```

Two dots, not seven. No percentage text. No step-count label. Positioned above the card, centered, `mb-6`.

**Skip onboarding**: Text link at top-right of the card header on both wizard screens (Step 1 and Step 2). Mirrors current production pattern from screenshot `00d`. One click drops the user directly to the empty dashboard. Copy: "Skip onboarding".

**Card width**: `max-w-[480px]`.

**Back affordance**: `← Back` text link, top-left above the card, below the progress strip. Present on Step 2. Absent on Step 1.

---

## Step 1 — Create organization (`/onboarding/org`)

```
┌──────────────────────────────────────────────────────────────────┐
│                 PAGE: bg-muted (full viewport)                    │
│                                                                  │
│         ●  ○   ← step progress strip (2 dots)                    │
│                                                                  │
│         ┌────────────────────────────────────────┐              │
│         │  CARD variant="elevated"  max-w-[480px] │              │
│         │                                        │              │
│         │  CARD HEADER  px-6 pt-6               │              │
│         │  ┌───┐                  Skip onboarding│              │
│         │  │HUD│  BrandMark sm (24px)    text-link│              │
│         │  └───┘  mb-4               muted-fg    │              │
│         │                                        │              │
│         │  Create your organization              │              │
│         │  text-title font-medium                │              │
│         │                                        │              │
│         │  You can change this later in Settings │              │
│         │  text-body muted-fg                    │              │
│         │                                        │              │
│         │  CARD CONTENT  px-6 py-6  gap-5        │              │
│         │                                        │              │
│         │  ── Logo (optional) ─────────────────  │              │
│         │  ┌──────────────────────────────────┐  │              │
│         │  │  [  Upload logo  ]               │  │              │
│         │  │  Button variant="outline" sm     │  │              │
│         │  │  "Optional — add later in Settings" │              │
│         │  │  text-meta muted-fg              │  │              │
│         │  └──────────────────────────────────┘  │              │
│         │                                        │              │
│         │  FormField  label="Organization name"  │              │
│         │  ┌──────────────────────────────────┐  │              │
│         │  │  Input  value="Acme Robotics"    │  │              │
│         │  │  (pre-filled from signup name)   │  │              │
│         │  └──────────────────────────────────┘  │              │
│         │                                        │              │
│         │  FormField  label="URL slug"           │              │
│         │  ┌──────────────────────────────────┐  │              │
│         │  │  hud.ai/  acme-robotics           │  │              │
│         │  │  ← prefix locked, slug editable  │  │              │
│         │  └──────────────────────────────────┘  │              │
│         │  Slug auto-derived; editable inline    │              │
│         │                                        │              │
│         │  ┌──────────────────────────────────┐  │              │
│         │  │  Create organization             │  │              │
│         │  │  Button primary full             │  │              │
│         │  └──────────────────────────────────┘  │              │
│         │                                        │              │
│         └────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

**Annotations**:
- Org name pre-filled from the name field on `/register`. Editable.
- Slug auto-derived from org name (lowercase, hyphens). Updates live as the user types the org name. Editable independently.
- "Create organization" disabled until org name is non-empty and slug is valid (letters, numbers, hyphens, ≥2 chars).
- No role picker — user is always Owner at org creation.
- Logo upload is optional and has an explicit label calling it optional. If skipped, the org placeholder initial is used everywhere.
- "Skip onboarding" at top-right drops to `/` with no wizard steps completed. Org record is not created on skip — user lands on dashboard with a deferred "Finish setting up your org" prompt in the header. (Same pattern current production 00d uses for the Setup accordion.)
- `signup` funnel event fires on the OAuth callback / magic-link verification. This screen does not fire an event — it's the first dashboard interaction post-signup.

**Persona notes**:
- Alex: pre-filled name correct → one click "Create organization". Logo skipped. 20 seconds max.
- Sam: may rename to team or company name. Still ≤30 seconds.
- Riley: solo contractor — own name or company name. Same flow as Alex.

---

## Step 2 — Invite members (`/onboarding/invite`)

```
┌──────────────────────────────────────────────────────────────────┐
│                 PAGE: bg-muted (full viewport)                    │
│                                                                  │
│         ●  ●   ← step progress strip (2 dots, both active)       │
│         ← Back                                                   │
│                                                                  │
│         ┌────────────────────────────────────────┐              │
│         │  CARD variant="elevated"  max-w-[480px] │              │
│         │                                        │              │
│         │  CARD HEADER  px-6 pt-6               │              │
│         │  ┌───┐                  Skip onboarding│              │
│         │  │HUD│  BrandMark sm (24px)    text-link│              │
│         │  └───┘  mb-4               muted-fg    │              │
│         │                                        │              │
│         │  Invite members                        │              │
│         │  text-title font-medium                │              │
│         │                                        │              │
│         │  Optional — add teammates now or       │              │
│         │  skip this step.                       │              │
│         │  text-body muted-fg                    │              │
│         │                                        │              │
│         │  CARD CONTENT  px-6 py-6  gap-5        │              │
│         │                                        │              │
│         │  FormField  label="Email addresses"    │              │
│         │  ┌──────────────────────────────────┐  │              │
│         │  │  teammate@company.com ×          │  │              │
│         │  │  another@co.com ×               │  │              │
│         │  │  Input  chip-style (comma-sep or │  │              │
│         │  │  Enter to add)                  │  │              │
│         │  └──────────────────────────────────┘  │              │
│         │  "Separate emails with commas or Enter"│              │
│         │  text-meta muted-fg                    │              │
│         │                                        │              │
│         │  FormField  label="Role"               │              │
│         │  [Member ▾]  ← Select, default Member  │              │
│         │  Options: Admin / Member               │              │
│         │                                        │              │
│         │  ── SUCCESS STATE (replaces form) ─── │              │
│         │  ┌──────────────────────────────────┐  │              │
│         │  │  ✓ Invitations sent              │  │              │
│         │  │  text-body  ← inline, no new scr │  │              │
│         │  └──────────────────────────────────┘  │              │
│         │  Shown after "Send invitations" fires  │              │
│         │  asynchronously. Form collapses.       │              │
│         │                                        │              │
│         │  CARD FOOTER  px-6 pb-6                │              │
│         │  ┌──────────────────────────────────┐  │              │
│         │  │  Send invitations                │  │              │
│         │  │  Button primary full             │  │              │
│         │  └──────────────────────────────────┘  │              │
│         │  Skip  ← text-link, muted-fg, centered │              │
│         │  Equal visual weight to primary CTA    │              │
│         │                                        │              │
│         └────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

**Skip and Send states**:

**Default state**: Form visible. "Send invitations" primary CTA. "Skip" text-link at equal visual prominence — same row, centered below the button.

**After "Send invitations"**: Invites queued async. Form collapses. Inline one-line success: `✓ Invitations sent` in `text-body`. CTA becomes "Continue" (same primary full style). No separate confirmation screen — no `/onboarding/invited` step.

**After "Skip"**: No invite queued. Proceeds directly to the Get Started landing.

**Annotations**:
- "Skip" is a text-link directly below the "Send invitations" button. Same card, same visual plane. Not hidden in small type — same size as card supporting copy. Skipping is one click.
- Chip-style email input: chips render as the user types and presses comma or Enter. Chips are deletable (× on each chip). Fallback: plain comma-separated text input if the chip library is not yet available.
- Role selector default: Member. Admin option for users who want to give billing / settings access from day one.
- "Send invitations" fires async — no loading state that blocks progress. If send fails silently, invites remain accessible via Org Settings.
- After success, "Continue" replaces "Send invitations". "Skip" link disappears (already past that gate).
- SAML / SSO configuration not surfaced here. Lives in Org Settings.
- `invites_sent` event fires on "Send invitations" with `invite_count` and `org_id`.
- No separate `/onboarding/invited` screen. The `00c` pattern (separate confirmation screen) is explicitly collapsed into inline success.

**Persona notes**:
- Alex: clicks "Skip". One click. Total time: ≤5 seconds.
- Sam: enters teammate emails (comma-separated or chip), sends, sees inline success, continues. ~30–60 seconds.
- Riley: clicks "Skip" — solo contractor by default.

---

## Step 3 — Get Started landing (`/`, first session)

This is the dashboard, not a wizard screen. Wizard chrome (progress strip, card shell) is gone. The standard sidebar and global nav appear for the first time.

```
┌──────────────────────────────────────────────────────────────────┐
│  GLOBAL HEADER (standard — sidebar + nav)                         │
├──────────────┬───────────────────────────────────────────────────┤
│  SIDEBAR     │  MAIN  flex-col gap-8 px-8 pt-6                   │
│  (standard)  │                                                   │
│              │  WELCOME HEADING                                  │
│              │  Get started with HUD                             │
│              │  text-display font-medium                         │
│              │                                                   │
│              │  ── Intro video (optional) ──────────────────     │
│              │  ┌────────────────────────────────────────┐      │
│              │  │  [▶  Video thumbnail / embed block  ]  │      │
│              │  │  16:9 aspect ratio, max-w-[640px]      │      │
│              │  │  If no video: skip block entirely      │      │
│              │  └────────────────────────────────────────┘      │
│              │                                                   │
│              │  How do you want to get started?                  │
│              │  text-title font-medium                           │
│              │                                                   │
│              │  ┌──────────────────────┐ ┌──────────────────┐   │
│              │  │  CARD interactive    │ │  CARD interactive │   │
│              │  │  border border-border│ │  border-border    │   │
│              │  │                      │ │                   │   │
│              │  │  [Boxes icon]        │ │  [Docs icon]      │   │
│              │  │                      │ │                   │   │
│              │  │  Use an Environment  │ │  Read the docs    │   │
│              │  │  template            │ │                   │   │
│              │  │  text-body font-semi │ │  text-body        │   │
│              │  │  font-semibold       │ │  font-semibold    │   │
│              │  │                      │ │                   │   │
│              │  │  [Most popular]      │ │  docs.hud.ai ↗   │   │
│              │  │  Badge sm muted-fg   │ │  text-meta        │   │
│              │  │                      │ │  muted-fg         │   │
│              │  │  Deploy from a       │ │  Quickstart,      │   │
│              │  │  template and run    │ │  SDK reference,   │   │
│              │  │  your first eval.    │ │  and examples.    │   │
│              │  │  text-caption        │ │  text-caption     │   │
│              │  │  muted-fg            │ │  muted-fg         │   │
│              │  └──────────────────────┘ └──────────────────┘   │
│              │                                                   │
│              │  Skip  ← text-link, muted-fg                      │
│              │  "or go to your dashboard →"                      │
│              │  text-caption  ← below the two cards, centered    │
│              │                                                   │
│              │  ── Setup panel (collapsed by default) ────────   │
│              │  ┌────────────────────────────────────────┐      │
│              │  │  SETUP PANEL  bg-elevated border        │      │
│              │  │  border-border rounded-md               │      │
│              │  │  px-4 py-3  gap-3                       │      │
│              │  │  ← dismissible, collapsed state default │      │
│              │  │                                         │      │
│              │  │  SET UP  [▸]  [Dismiss ×]               │      │
│              │  │  text-meta font-mono uppercase          │      │
│              │  │  ← collapsed: click to expand          │      │
│              │  │                                         │      │
│              │  │  EXPANDED STATE (user toggles open):    │      │
│              │  │  Install uv / Install HUD Tool /        │      │
│              │  │  Get and Set API Keys /                 │      │
│              │  │  Create Your First Environment /        │      │
│              │  │  Explore Documentation                  │      │
│              │  │  ← accordion items, each self-reporting │      │
│              │  │  [I've done this] per step              │      │
│              │  │  mirrors production 00d accordion       │      │
│              │  └────────────────────────────────────────┘      │
│              │                                                   │
└──────────────┴───────────────────────────────────────────────────┘
```

**Annotations**:
- This is the dashboard, not a wizard screen. The two-dot progress strip does not appear here.
- "Get started with HUD" heading is the entire onboarding carry-over at this stage. It replaces the standard Home empty state for the first session only.
- Cards: "Use an Environment template" links to the template picker flow (mirrors screenshot `00f` — eight template tiles: Blank Environment, Browser, Coding, Deep Research, Remote Browser, Data Science, Verilog Coding, Rubrics). "Read the docs" opens `docs.hud.ai` in a new tab.
- "Most popular" badge on the template card — follows operator-endorsed vocabulary from the Get Started screen reference.
- "Skip / or go to your dashboard →" text-link below the two cards. One click shows the empty dashboard directly. The Get Started landing does not re-appear after dismissal (persisted state).
- Setup panel: collapsed by default. Title row shows "SET UP" in monospace uppercase + expand toggle + "Dismiss ×". Dismiss × permanently removes the panel. Expanding shows the same five-item accordion as production `00d`. This is where install-uv, API key, first-environment steps live — not in the forced wizard.
- `api_key_issued` event fires from within the setup panel's "Get and Set API Keys" accordion item (key generated on expand or on button click).
- `env_deployed` and `first_call_from_deployed_code` fire from the template flow (reached via "Use an Environment template" card), not from the onboarding wizard.

**Persona notes**:
- Alex: clicks "Use an Environment template" → picks template → CLI flow. Three clicks total from org creation to template CLI. Setup panel stays collapsed — he already has his key from the SDK path. The panel is not friction because it is collapsed.
- Sam: may expand setup panel to walk through API key step, then clicks "Use an Environment template".
- Riley: clicks "Skip / or go to your dashboard →" — already knows the SDK, goes to Environments directly.

---

## Component summary

| Screen | DS primitives | Notes |
|---|---|---|
| Step 1 (Org create) | `Card variant="elevated"`, `FormField`, `Input`, `Button variant="outline" size="sm"` (logo), `Button variant="primary" full`, text-link | Progress strip: 2-dot lightweight component. Logo upload optional affordance. |
| Step 2 (Invite) | `Card variant="elevated"`, chip `Input`, `Select` (role), `Button variant="primary" full`, text-link | Inline success replaces form on send — no new screen. |
| Step 3 (Get Started) | Standard layout shell + sidebar, `Card variant="interactive"` (×2), `Badge sm`, dismissible accordion panel (`bg-elevated border`) | Not a wizard screen. Dashboard shell with first-session get-started surface. |

---

## Out of scope

These are not in any onboarding screen:

- Workspace-mode dedicated step (solo vs team radio). The invite step covers the distinction: send invites = team, skip = solo.
- Forced API-key + prereqs step. Lives in the Setup panel (collapsed, user-initiated) or in the template/CLI flow.
- Forced template deploy step. Downstream of "Use an Environment template" card.
- Forced first-eval step. Downstream of template flow.
- Activation screen. `onboarding_complete` fires as an event; there is no celebration screen.
- Post-activation checklist panel (the 8-step wireframe's Step 8). Superseded by the Get Started landing and the dismissible Setup panel.
- SAML / SSO configuration (Org Settings).
- Billing entry (no credit card in onboarding).
- Persona survey or "which persona are you?" modal.
- Product tour overlays.
- Gamification, badges, streaks.
- Celebration copy or confetti.
- Training Job surfaces before first eval.
- Compliance chrome.

---

Derived from: [`docs/design/flows/onboarding.md`](../flows/onboarding.md), [`docs/design/guidelines/onboarding.md`](../guidelines/onboarding.md), [`docs/product/personas.md`](../../product/personas.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/platform.md`](../../product/platform.md).
