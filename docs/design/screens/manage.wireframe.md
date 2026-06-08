# Manage — Screen Wireframes

Routes:
- `/manage/profile`
- `/manage/notifications`
- `/manage/appearance`
- `/manage/organization`
- `/manage/members`
- `/manage/usage`
- `/manage/api-keys`

Cross-link: [`docs/design/flows/manage.md`](../flows/manage.md) *(forward link — flow doc not yet written)*

Sibling wireframes: [`docs/design/screens/onboarding.wireframe.md`](./onboarding.wireframe.md), [`docs/design/screens/post-signup-quickstart.wireframe.md`](./post-signup-quickstart.wireframe.md)

---

## Shared layout shell — all /manage routes

The `<ManageShell>` component (rendered by `apps/portal/src/app/(manage)/layout.tsx`) provides the sidebar and enforces `requireSession()`. Each page's main content column is `max-w-3xl mx-auto` — a comfortable reading-width column, not full-bleed.

The sidebar is not redesigned here; it is captured once from the production screenshot for reference and not redrawn in each section.

```
┌──────────────────────────────────────────────────────────────────────┐
│  MANAGE SHELL (ManageShell component)                                 │
├─────────────────────────┬────────────────────────────────────────────┤
│  SIDEBAR  w-[220px]     │  MAIN  max-w-3xl mx-auto  px-8 py-8        │
│  bg-muted  border-r     │                                            │
│                         │  [page content — per route below]          │
│  [HUD logo / brand]     │                                            │
│                         │                                            │
│  ← Back to app          │                                            │
│  text-link  muted-fg    │                                            │
│                         │                                            │
│  ⚙  Settings            │                                            │
│  text-label font-medium │                                            │
│                         │                                            │
│  PERSONAL               │                                            │
│  text-meta uppercase    │                                            │
│  muted-fg  tracking     │                                            │
│                         │                                            │
│  👤  Profile            │                                            │
│  🔔  Notifications      │                                            │
│  🎨  Appearance         │                                            │
│                         │                                            │
│  ORGANIZATION           │                                            │
│  text-meta uppercase    │                                            │
│  muted-fg  tracking     │                                            │
│                         │                                            │
│  ⚙  Organization        │                                            │
│  👥  Members            │                                            │
│  📊  Usage              │                                            │
│  🔑  API keys           │                                            │
│                         │                                            │
│  ┌─────────────────────┐│                                            │
│  │ 🔒 Billing, limits, ││                                            │
│  │ secrets & privacy   ││                                            │
│  │ are managed by an   ││                                            │
│  │ owner.              ││                                            │
│  │ text-meta muted-fg  ││                                            │
│  └─────────────────────┘│                                            │
└─────────────────────────┴────────────────────────────────────────────┘
```

**Sidebar notes:**
- Active item: highlighted row, foreground text weight.
- Info card at bottom: shown to non-owners only. Owner sees this card removed (they manage billing directly from the Organization page or a billing portal link).
- "← Back to app" returns to the main dashboard; uses the browser history or a hardcoded `/` route.
- Icons are decorative; sidebar labels are the primary affordance.

**Table conventions:**
Numeric values — and the column header that labels them — are right-aligned. Non-numeric columns (name, email, role, status, prefix, source) stay left-aligned. This lets the eye scan a numeric column for magnitude by place value. All tables in this file follow this rule.

**Role-gating convention used throughout this document:**
- Fields or actions restricted to org owners are shown in the wireframe with the suffix `[owner-only]` and carry a `disabled` state with a tooltip: `"Only the org owner can change this."` Non-owners see the field but cannot interact with it. This matches the bottom info-card pattern already established in production.

---

## 1. Profile (`/manage/profile`)

**HUD question:** Alex is OAuth-authenticated (GitHub/Google). The current production page shows name + email fields. What else belongs here for an SDK-first user?

Answer: connected OAuth providers (one-click re-connect / disconnect) and nothing else. No avatar upload wizard, no timezone picker, no notification preferences (those are on Notifications). The page stays one card deep.

```
┌──────────────────────────────────────────────────────────────────────┐
│  MAIN  max-w-3xl mx-auto  px-8 py-8                                  │
│                                                                      │
│  Profile                                                             │
│  text-display  font-medium                                           │
│                                                                      │
│  Your personal account. Only affects you.                            │
│  text-body  muted-fg                                                 │
│                                                                      │
│  ── CARD: Account ───────────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Account                                                      │   │
│  │  text-title  font-medium                                      │   │
│  │                                                               │   │
│  │  FormField  label="Name"                                      │   │
│  │  ┌───────────────────────────────────────────────────────┐   │   │
│  │  │  Input  value="Avery Lin"                             │   │   │
│  │  └───────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  FormField  label="Email"                                     │   │
│  │  ┌───────────────────────────────────────────────────────┐   │   │
│  │  │  Input  value="avery@acme.dev"                        │   │   │
│  │  └───────────────────────────────────────────────────────┘   │   │
│  │  "Changing your email triggers a verification link to the     │   │
│  │  new address."  text-meta  muted-fg                           │   │
│  │                                                               │   │
│  │  ─ card footer ─────────────────────────────────────────     │   │
│  │                                          [Save]              │   │
│  │                                 Button primary sm            │   │
│  │                                 disabled until dirty          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── CARD: Connected accounts ────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Connected accounts                                           │   │
│  │  text-title  font-medium                                      │   │
│  │  "Sign in with these providers. At least one must remain      │   │
│  │  connected."  text-body  muted-fg                             │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  [GitHub icon]  GitHub                                   │ │   │
│  │  │  "Connected as @alexresearcher"  text-meta muted-fg      │ │   │
│  │  │                                       [Disconnect]       │ │   │
│  │  │                             Button variant="ghost" sm    │ │   │
│  │  │                             disabled if last provider    │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  [Google icon]  Google                                   │ │   │
│  │  │  Not connected                                           │ │   │
│  │  │  text-meta  muted-fg                                     │ │   │
│  │  │                                       [Connect]          │ │   │
│  │  │                             Button variant="outline" sm  │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── DANGER ZONE: Delete account ─────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  border-destructive  rounded                                  │   │
│  │                                                               │   │
│  │  Delete account                                               │   │
│  │  text-title  font-medium  text-destructive                    │   │
│  │  "Permanently delete your personal account and remove you     │   │
│  │  from all organizations. This cannot be undone."              │   │
│  │  text-body  muted-fg                                          │   │
│  │                                                               │   │
│  │                                     [Delete account]         │   │
│  │                          Button variant="destructive" sm      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

**Delete account confirmation dialog:**
```
┌──────────────────────────────────────────────────────┐
│  Dialog  max-w-[440px]                               │
│                                                      │
│  Delete account?                                     │
│  text-title  font-medium                             │
│                                                      │
│  This permanently removes your account and all       │
│  personal data. You will be removed from all orgs.   │
│  text-body  muted-fg                                 │
│                                                      │
│  To confirm, type your email:                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  Input  placeholder="avery@acme.dev"          │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Cancel]                   [Delete my account]     │
│  Button ghost               Button destructive      │
│  disabled until email matches                        │
└──────────────────────────────────────────────────────┘
```

**Annotations:**
- "Save" is disabled until any field changes. On save, a success toast appears inline below the card: `✓ Profile updated` — no page reload.
- Email change: triggers a verification email to the new address. The email field reverts to the old value until verified. Copy: `"Verification sent to [new-email]. Check your inbox."` as an inline banner below the field.
- Connected accounts: at least one provider must remain connected. "Disconnect" is disabled (with tooltip: `"You must keep at least one sign-in method connected."`) when only one provider is active.
- OAuth redirect for "Connect" goes to the provider and returns to this page on success.
- Delete account: confirmation input must exactly match the user's current email. "Delete my account" remains disabled until it does.

**Persona notes:**
- Alex: this page is low-traffic for him. He cares that his GitHub is connected (that's how he signed up). He won't touch it unless something breaks. The connected-accounts card answers a question he'd otherwise go to GitHub OAuth settings to solve.
- Sam: may update email if the work address changes. Invite flow from Members page sends to the email here.
- Riley: solo contractor — occasionally checks name matches a billing contact name. One-time.

---

## 2. Notifications (`/manage/notifications`)

**HUD question:** Alex is bursty — he submits 50 Jobs on a weekend and doesn't want an email per Job. Sam is waiting on one regression run against a specific Taskset and does want that email. What granularity of notification control does HUD need?

Answer: per-event-type toggles, one channel (email) at MVP. Grouping by section (Job events, collaboration events, billing events) matches the mental model. Slack/webhook surface as aspirational annotations, not interactive controls.

```
┌──────────────────────────────────────────────────────────────────────┐
│  MAIN  max-w-3xl mx-auto  px-8 py-8                                  │
│                                                                      │
│  Notifications                                                       │
│  text-display  font-medium                                           │
│                                                                      │
│  Choose which events send you an email.                              │
│  text-body  muted-fg                                                 │
│                                                                      │
│  ── CARD: Notifications ─────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  SECTION: Job & Trace events                                  │   │
│  │  text-label  font-medium  muted-fg  border-b  pb-2  mb-4     │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  [Toggle]  Job completed                                 │ │   │
│  │  │  "Email when any Job in your org finishes."              │ │   │
│  │  │  text-meta  muted-fg                                     │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  [Toggle]  Job failed                                    │ │   │
│  │  │  "Email when a Job errors out before completing."        │ │   │
│  │  │  text-meta  muted-fg                                     │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  [Toggle]  Eval finished                                 │ │   │
│  │  │  "Email when an eval Job completes and a Trace is        │ │   │
│  │  │  available."  text-meta  muted-fg                        │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  SECTION: Collaboration                                       │   │
│  │  text-label  font-medium  muted-fg  border-b  pb-2  mb-4     │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  [Toggle]  Taskset shared with you                       │ │   │
│  │  │  "Email when another user grants you access to a         │ │   │
│  │  │  Taskset."  text-meta  muted-fg                          │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  [Toggle]  Member invite accepted                        │ │   │
│  │  │  "Email when someone you invited joins the org."         │ │   │
│  │  │  text-meta  muted-fg                                     │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  SECTION: Credits & billing                                   │   │
│  │  text-label  font-medium  muted-fg  border-b  pb-2  mb-4     │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  [Toggle ON — default]  Credit balance low               │ │   │
│  │  │  "Email when your org's Credits drop below a threshold." │ │   │
│  │  │  Threshold: [100 Credits ▾]  ← select inline            │ │   │
│  │  │  text-meta  muted-fg                                     │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  ─ card footer ─────────────────────────────────────────     │   │
│  │                                          [Save]              │   │
│  │                                 Button primary sm            │   │
│  │                                 disabled until dirty          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── CARD: Channels ──────────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Channels                                                     │   │
│  │  text-title  font-medium                                      │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  Email  ← active channel                                 │ │   │
│  │  │  avery@acme.dev                                          │ │   │
│  │  │  text-meta  muted-fg                                     │ │   │
│  │  │  "Change in Profile settings"  ← text-link to /profile  │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  Slack  [Coming soon]  Badge muted sm                    │ │   │
│  │  │  "Connect your Slack workspace to receive notifications  │ │   │
│  │  │  in a channel."  text-meta  muted-fg                     │ │   │
│  │  │                         [Connect Slack]  disabled        │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  Webhook  [Coming soon]  Badge muted sm                  │ │   │
│  │  │  "POST to a URL on each event."                          │ │   │
│  │  │  text-meta  muted-fg                                     │ │   │
│  │  │                         [Configure webhook]  disabled    │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- All toggles are off by default except "Credit balance low" (on, threshold 100 Credits). Defaulting job-completion emails off respects Alex's bursty pattern — he will not want 50 emails on a hackathon weekend.
- Save applies the full toggle state in one write. No per-toggle auto-save — this is a form, not a live config panel.
- Credit threshold select: options `[25 · 50 · 100 · 250 · 500]` Credits. Only shown when the toggle is on.
- Channels card: email address is read-only here with a link to `/manage/profile`. Cross-linking is the correct pattern — don't duplicate the email field.
- Slack/Webhook: visible but disabled with `[Coming soon]` badge. The buttons are non-interactive but show the intended action copy so the user knows what will appear when the feature ships. Do not hide them entirely — the presence signals platform direction without false availability.

**Persona notes:**
- Alex: turns off "Job completed" (too noisy), keeps "Job failed" on, keeps "Credit balance low" on. Two toggle flips. Total time: 15 seconds.
- Sam: turns on "Eval finished" — that's the regression-run notification he cares about. May turn on "Taskset shared with you" if working with a domain advisor.
- Riley: turns on "Job completed" and "Member invite accepted" — delivery-cadence tracking.

---

## 3. Appearance (`/manage/appearance`)

**HUD question:** What appearance preferences are actually useful for an SDK-first user staring at dense trace data? Theme matters (dark reduces eye strain at 2 AM). Code font matters (monospace legibility in Trace viewer). Layout density matters for Alex's information-dense surfaces.

Keep tight. No color-blind palette pickers, no font size sliders for marketing content, no avatar frame styles.

```
┌──────────────────────────────────────────────────────────────────────┐
│  MAIN  max-w-3xl mx-auto  px-8 py-8                                  │
│                                                                      │
│  Appearance                                                          │
│  text-display  font-medium                                           │
│                                                                      │
│  Affects your view only.                                             │
│  text-body  muted-fg                                                 │
│                                                                      │
│  ── CARD: Appearance ────────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  FormField  label="Theme"                                     │   │
│  │  "Applies to the dashboard and Trace viewer."                 │   │
│  │  text-meta  muted-fg                                          │   │
│  │                                                               │   │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐      │   │
│  │  │               │ │               │ │               │      │   │
│  │  │  [Light swatch│ │  [Dark swatch]│ │ [System swatch│      │   │
│  │  │   preview]    │ │               │ │  preview]     │      │   │
│  │  │               │ │               │ │               │      │   │
│  │  │  Light        │ │  Dark         │ │  System       │      │   │
│  │  │  [selected ✓] │ │               │ │               │      │   │
│  │  └───────────────┘ └───────────────┘ └───────────────┘      │   │
│  │  Three-tile selector. Selected tile has border-primary ring. │   │
│  │  Swatches are small color-block previews (bg/text sample),   │   │
│  │  not full-page screenshots.                                   │   │
│  │                                                               │   │
│  │  FormField  label="Code font"                                 │   │
│  │  "Used in Trace viewer, code blocks, and CLI output panels."  │   │
│  │  text-meta  muted-fg                                          │   │
│  │                                                               │   │
│  │  [JetBrains Mono ▾]  ← Select                                │   │
│  │  Options:                                                     │   │
│  │    JetBrains Mono  (default)                                  │   │
│  │    Fira Code                                                  │   │
│  │    Cascadia Code                                               │   │
│  │    IBM Plex Mono                                              │   │
│  │    System monospace                                            │   │
│  │                                                               │   │
│  │  Preview:                                                     │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  def reward_fn(state):                                  │  │   │
│  │  │      return 1.0 if state["order_placed"] else 0.0       │  │   │
│  │  │                                                         │  │   │
│  │  │  hud eval hud/coding-lite --model claude-3-7-sonnet     │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │  monospace preview block  bg-code  text-xs-mono              │   │
│  │  Updates live as font selection changes.                      │   │
│  │                                                               │   │
│  │  FormField  label="Density"                                   │   │
│  │  "Controls row height and padding in tables and Trace grids." │   │
│  │  text-meta  muted-fg                                          │   │
│  │                                                               │   │
│  │  ○ Comfortable   ●  Compact  (default for new accounts)       │   │
│  │  Radio group  inline                                          │   │
│  │                                                               │   │
│  │  ─ card footer ─────────────────────────────────────────     │   │
│  │                                          [Save]              │   │
│  │                                 Button primary sm            │   │
│  │                                 disabled until dirty          │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Theme: "System" follows OS-level dark/light preference via `prefers-color-scheme`. No additional options. "Dark" is the expected default for most users in this persona cohort — but we do not force it; the setting defaults to "System" so it adapts per device.
- Code font: default is JetBrains Mono. The preview block renders the actual chosen font. The preview uses HUD-flavored content (a reward function snippet + a CLI command) rather than "The quick brown fox" — because the font will be read in exactly this context.
- Density: "Compact" is the default — Alex's surfaces are information-dense and he does not need padding. "Comfortable" is there for Sam or anyone using a lower-resolution display. No "Cozy" or third tier — binary choice keeps the decision trivial.
- Save applies all three settings at once.
- No per-surface density override in this version. If per-surface density becomes needed (e.g., compact in Trace viewer but comfortable in Members table), that is an additive future setting, not a reason to add it now.

**Persona notes:**
- Alex: switches to Dark + Compact. One visit, two changes, never returns.
- Sam: may prefer System + Comfortable on a 4K monitor. Same path.
- Riley: no strong preference; likely leaves System + Compact as-is.

---

## 4. Organization (`/manage/organization`)

**HUD question:** What org-level configuration does an owner need vs what does a member need to read? Billing summary is read-only here — the "Manage billing" action deep-links to the external billing provider. This is not a billing page; it is an org identity + plan-summary page.

```
┌──────────────────────────────────────────────────────────────────────┐
│  MAIN  max-w-3xl mx-auto  px-8 py-8                                  │
│                                                                      │
│  Organization                                                        │
│  text-display  font-medium                                           │
│                                                                      │
│  Org-wide settings. Changes affect everyone in the organization.     │
│  text-body  muted-fg                                                 │
│                                                                      │
│  ── CARD: Organization identity ─────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Organization identity                                        │   │
│  │  text-title  font-medium                                      │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │  Logo                                                │    │   │
│  │  │  ┌────┐                                              │    │   │
│  │  │  │ A  │  [32×32 logo avatar or org initial]          │    │   │
│  │  │  └────┘                                              │    │   │
│  │  │  [Change logo]  [Remove]                             │    │   │
│  │  │  Button outline sm  ·  Button ghost sm               │    │   │
│  │  │  "PNG or SVG, max 2 MB"  text-meta muted-fg          │    │   │
│  │  │  [owner-only]  Non-owner: buttons disabled, tooltip  │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  │                                                               │   │
│  │  FormField  label="Organization name"  [owner-only]          │   │
│  │  ┌───────────────────────────────────────────────────────┐   │   │
│  │  │  Input  value="Acme Robotics"                         │   │   │
│  │  │  disabled + tooltip for non-owner                     │   │   │
│  │  └───────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  FormField  label="URL slug"  [owner-only]                   │   │
│  │  ┌───────────────────────────────────────────────────────┐   │   │
│  │  │  hud.ai/  acme-robotics                               │   │   │
│  │  │  prefix locked  /  slug editable  [owner-only]        │   │   │
│  │  └───────────────────────────────────────────────────────┘   │   │
│  │  "Changing the slug invalidates existing deep links."         │   │
│  │  text-meta  muted-fg  text-warning                            │   │
│  │                                                               │   │
│  │  ─ card footer ─────────────────────────────────────────     │   │
│  │                                          [Save]              │   │
│  │                             Button primary sm  [owner-only]  │   │
│  │                             disabled until dirty              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── CARD: Plan ──────────────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Plan                                                         │   │
│  │  text-title  font-medium                                      │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  Cloud  [badge]                                          │ │   │
│  │  │  text-title  font-medium                                 │ │   │
│  │  │                                                          │ │   │
│  │  │  $0.25 / Environment-hour                                │ │   │
│  │  │  text-body  muted-fg                                     │ │   │
│  │  │                                                          │ │   │
│  │  │  Credits remaining: 847                                  │ │   │
│  │  │  text-body  ← exact integer, not rounded                 │ │   │
│  │  │                                                          │ │   │
│  │  │  [Manage billing ↗]  [Top up Credits]                    │ │   │
│  │  │  Button outline sm  ·  Button primary sm                 │ │   │
│  │  │  "Manage billing ↗" opens billing portal in new tab      │ │   │
│  │  │  [owner-only]  buttons disabled + tooltip for non-owner  │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  Current period: Jun 1 – Jun 30                               │   │
│  │  text-meta  muted-fg                                          │   │
│  │                                                               │   │
│  │  "Detailed usage breakdown →"  text-link to /manage/usage    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── DANGER ZONE: Delete organization ─────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  border-destructive  rounded                                  │   │
│  │                                                               │   │
│  │  Delete organization  [owner-only]                            │   │
│  │  text-title  font-medium  text-destructive                    │   │
│  │  "Permanently deletes the org, all Environments, Tasksets,   │   │
│  │  Jobs, and Traces. This cannot be undone."                    │   │
│  │  text-body  muted-fg                                          │   │
│  │                                                               │   │
│  │                               [Delete organization]          │   │
│  │                    Button variant="destructive" sm  [owner-only] │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

**Delete organization confirmation dialog:**
```
┌──────────────────────────────────────────────────────┐
│  Dialog  max-w-[440px]                               │
│                                                      │
│  Delete organization?                                │
│  text-title  font-medium                             │
│                                                      │
│  Permanently deletes all Environments, Tasksets,     │
│  Jobs, and Traces in this org. Members are removed   │
│  but their personal accounts are not deleted.        │
│  text-body  muted-fg                                 │
│                                                      │
│  To confirm, type the org slug:                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Input  placeholder="acme-robotics"           │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Cancel]              [Delete organization]        │
│  Button ghost          Button destructive           │
│  disabled until slug matches                         │
└──────────────────────────────────────────────────────┘
```

**Annotations:**
- Slug-change warning (`"Changing the slug invalidates existing deep links."`) is surfaced inline as soon as the slug field gains focus. It is not a modal — it is persistent copy in the helper text below the field, styled with `text-warning`. This addresses the HUD personality principle "Earnest — error copy states cause."
- Plan card is read-only for all users; owner gate applies only to "Manage billing ↗" and "Top up Credits" buttons. All users can see the plan name, credit balance, and billing period.
- "Detailed usage breakdown →" cross-links to `/manage/usage` — avoids duplicating the full chart here.
- Enterprise plan state: the Plan card shows `Enterprise` badge, hides "Top up Credits" (enterprise billing is invoiced), shows "Manage billing ↗" for owner only. The plan card structure is otherwise identical.
- Logo "Remove" button only appears when a custom logo is set; it is absent (not disabled) when only the org initial is shown.

**Persona notes:**
- Alex: arrives once to verify org slug. Never touches it again. Plan card is glanceable for credit balance.
- Sam: arrives to check plan + credit balance before a large regression run batch. "Detailed usage breakdown →" is the exit path.
- Riley: owner — may update org name when rebranding. Slug change warning is directly relevant.

---

## 5. Members (`/manage/members`)

**HUD question:** Who needs to see the member list? Everyone. Who can change roles or remove members? Only owners and admins (with a further restriction: an admin cannot remove or downgrade an owner). Sam uses this to invite a domain advisor. Riley uses it to hand off Taskset access to a buying lab contact.

```
┌──────────────────────────────────────────────────────────────────────┐
│  MAIN  max-w-3xl mx-auto  px-8 py-8                                  │
│                                                                      │
│  Members                                                             │
│  text-display  font-medium                                           │
│                                                                      │
│  Manage who has access to your organization.                         │
│  text-body  muted-fg                                                 │
│                                                                      │
│  ── INVITE ROW (above the member table, prominent) ─────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ┌───────────────────────────────────────────┐ [Member ▾]   │   │
│  │  │  Input  placeholder="email@example.com"   │             │   │
│  │  └───────────────────────────────────────────┘             │   │
│  │                                               [Invite]      │   │
│  │                                 Button primary sm           │   │
│  │  [owner / admin only]  Non-authorized: row hidden entirely  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── CARD: Members (N total) ─────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  MEMBER TABLE                                                 │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │ Name / Email          Role        Last active   ─    │    │   │
│  │  │ text-label muted-fg  text-label  text-label          │    │   │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │ ┌──┐  Avery Lin       [Owner ▾]   Jun 7, 2026   ···  │    │   │
│  │  │ │av│  avery@acme.dev  role badge  text-meta          │    │   │
│  │  │ └──┘  (you)                                          │    │   │
│  │  │       text-meta muted-fg                             │    │   │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │ ┌──┐  Sam Okafor      [Admin ▾]   Jun 6, 2026   ···  │    │   │
│  │  │ │so│  sam@acme.dev                text-meta          │    │   │
│  │  │ └──┘                                                  │    │   │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │ ┌──┐  Riley Marsh     [Member ▾]  May 30, 2026  ···  │    │   │
│  │  │ │rm│  riley@sharpe.io             text-meta          │    │   │
│  │  │ └──┘                                                  │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  │                                                               │   │
│  │  right-aligned: Last active                                   │   │
│  │                                                               │   │
│  │  Role dropdown per row:                                       │   │
│  │    Options: Owner / Admin / Member                            │   │
│  │    Disabled on own row (cannot demote self)                   │   │
│  │    Disabled on Owner rows for non-owners                      │   │
│  │                                                               │   │
│  │  ··· row action menu (opens on click):                       │   │
│  │    Remove from organization  ← destructive, red text         │   │
│  │    Disabled on own row                                        │   │
│  │    Disabled for admin acting on owner row                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── CARD: Pending invites ───────────────────────────────────────── │
│  (hidden if no pending invites)                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Pending invites (2)                                          │   │
│  │  text-title  font-medium                                      │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  alex@openai.com       Member     Sent Jun 5, 2026  ···  │ │   │
│  │  │  text-meta muted-fg               text-meta              │ │   │
│  │  ├─────────────────────────────────────────────────────────┤ │   │
│  │  │  dana@lab.ai           Admin      Sent Jun 3, 2026  ···  │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  ··· action menu per pending invite:                         │   │
│  │    Resend invite                                              │   │
│  │    Revoke invite  ← destructive                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── CARD: Invite link ───────────────────────────────────────────── │
│  [owner / admin only]                                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Invite link                                                  │   │
│  │  text-title  font-medium                                      │   │
│  │  "Anyone with this link can join as a Member."               │   │
│  │  text-body  muted-fg                                          │   │
│  │                                                               │   │
│  │  ┌───────────────────────────────────────────┐ [Copy ⎘]     │   │
│  │  │  hud.ai/join/xk9q-acme-robotics           │             │   │
│  │  │  Input  readonly  text-mono text-meta      │             │   │
│  │  └───────────────────────────────────────────┘             │   │
│  │                                                               │   │
│  │  [Revoke and regenerate]                                      │   │
│  │  Button variant="ghost" sm  text-destructive                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

**Remove member confirmation dialog:**
```
┌──────────────────────────────────────────────────────┐
│  Dialog  max-w-[400px]                               │
│                                                      │
│  Remove Sam Okafor?                                  │
│  text-title  font-medium                             │
│                                                      │
│  They will lose access to all Environments,          │
│  Tasksets, and Jobs in this organization.            │
│  Their personal account is not deleted.              │
│  text-body  muted-fg                                 │
│                                                      │
│  [Cancel]                    [Remove member]        │
│  Button ghost                Button destructive     │
└──────────────────────────────────────────────────────┘
```

**Revoke invite link confirmation dialog:**
```
┌──────────────────────────────────────────────────────┐
│  Dialog  max-w-[400px]                               │
│                                                      │
│  Revoke and regenerate invite link?                  │
│  text-title  font-medium                             │
│                                                      │
│  The current link will stop working immediately.     │
│  A new link will be generated.                       │
│  text-body  muted-fg                                 │
│                                                      │
│  [Cancel]                         [Revoke]          │
│  Button ghost                     Button destructive │
└──────────────────────────────────────────────────────┘
```

**Annotations:**
- Role badge colors correspond to role state (token-assigned in design-tokens phase — not specified here).
- Avatar initials: two characters from name (e.g., "av" for Avery), `bg-muted` circle, `text-mono text-sm`.
- "Last active" is a relative date in the table view (e.g., "Jun 7, 2026" or "3 days ago" — exact format TBD with engineering; this wireframe uses absolute date as reference).
- Invite row is hidden entirely (not disabled) for Members. Role restriction is enforced server-side; UI hiding is a UX affordance, not a security gate.
- Role dropdown on the owner row: disabled for all non-owners. The `[Owner ▾]` appears as a badge, not a functional dropdown, for members looking at the owner row.
- "You" label below the current user's name disambiguates the viewer's own row without requiring a separate column.
- Empty state for Pending invites: card hidden (not shown with "No pending invites" copy). Card only renders when invites exist.
- Invite link card: shown to owners and admins only. Hidden for members.

**Empty state (no members beyond self):**
```
┌──────────────────────────────────────────────────────────────────┐
│  CARD: Members (1 total)                                          │
│                                                                   │
│  ┌──┐  Avery Lin  [Owner]  Jun 7, 2026  (you)                   │
│  └──┘                                                             │
│                                                                   │
│  No other members yet. Invite teammates above.                   │
│  text-meta  muted-fg  ← shown below the table when only 1 row   │
└──────────────────────────────────────────────────────────────────┘
```

**Persona notes:**
- Alex: solo researcher — one member (himself). Invite link is there if he ever shares a Taskset. Members page is ≤5 second glance.
- Sam: comes here to invite a domain advisor. Invite row → email → role → Invite. Returns to check if the invite was accepted. Primary workflow on this page.
- Riley: invites a buying lab contact as Member. Role dropdown matters — Member (read-only) vs Admin (can launch Jobs on the org's Environments). Riley gives lab contacts Member access.

---

## 6. Usage (`/manage/usage`)

**HUD question:** Sam comes here to check spend against budget before authorizing a large regression run. Alex glances at credit balance occasionally. The numbers that matter are: total Credits consumed this period, breakdown by what consumed them, and which Jobs/Tasksets drove cost. Billing management is elsewhere (Organization page → "Manage billing ↗").

```
┌──────────────────────────────────────────────────────────────────────┐
│  MAIN  max-w-3xl mx-auto  px-8 py-8                                  │
│                                                                      │
│  Usage                                                               │
│  text-display  font-medium                                           │
│                                                                      │
│  Credit consumption for your organization.                           │
│  text-body  muted-fg                                                 │
│                                                                      │
│  ── STAT ROW ────────────────────────────────────────────────────── │
│  ┌───────────────────────┐ ┌───────────────────────┐               │
│  │  Credits remaining    │ │  Used this period      │               │
│  │  847                  │ │  153                   │               │
│  │  text-display         │ │  text-display          │               │
│  │  font-mono            │ │  font-mono             │               │
│  │  ← exact integer      │ │  ← exact integer       │               │
│  │  text-meta muted-fg   │ │  text-meta muted-fg    │               │
│  │  "Credits remaining"  │ │  "Jun 1 – Jun 8, 2026" │               │
│  └───────────────────────┘ └───────────────────────┘               │
│                                                                      │
│  [Top up Credits]  ← Button primary sm  [owner-only]               │
│                                                                      │
│  ── CARD: Monthly chart ─────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Credits consumed                                             │   │
│  │  text-title  font-medium                                      │   │
│  │                                                               │   │
│  │  Period:  [This month ▾]  ← Select  options: This month /    │   │
│  │                              Last 30 days / Last 3 months     │   │
│  │                                                               │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │                                                         │  │   │
│  │  │   ▓                                                     │  │   │
│  │  │   ▓  ▓                                                  │  │   │
│  │  │   ▓  ▓  ▒  ▒                                           │  │   │
│  │  │   ▓  ▓  ▒  ▒  ▒                                        │  │   │
│  │  │  ─────────────────────────────────────────             │  │   │
│  │  │  Jun 1  Jun 2  Jun 3  Jun 4  Jun 5  Jun 6  Jun 7  Jun8 │  │   │
│  │  │  text-meta muted-fg  ← x-axis labels                   │  │   │
│  │  │                                                         │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │  Bar chart  by day  y-axis = Credits  x-axis = date          │   │
│  │  Tooltip on hover: "Jun 5: 34 Credits — 12 Jobs"            │   │
│  │  Color = single accent (token assigned in design-tokens phase)│   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── CARD: Breakdown by source ───────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Breakdown                                                    │   │
│  │  text-title  font-medium                                      │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │  Source               Credits     % of total         │    │   │
│  │  │  text-label muted-fg                                  │    │   │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │  Environment runs     98          64%                 │    │   │
│  │  │  Model Gateway        41          27%                 │    │   │
│  │  │  RL training Jobs     14           9%                 │    │   │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │  Total                153         100%                │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  │  All numbers exact integers. Percentages rounded to integer.  │   │
│  │  right-aligned: Credits, % of total                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── CARD: Top consumers ─────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Top consumers                                                │   │
│  │  text-title  font-medium                                      │   │
│  │  "Which Jobs burned the most Credits this period."            │   │
│  │  text-meta  muted-fg                                          │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │  Job / Taskset        Credits   Runs  Date            │    │   │
│  │  │  text-label muted-fg                                  │    │   │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │  job-7f3a  [↗]        52        200   Jun 5           │    │   │
│  │  │  acme/coding-v2       text-mono text-meta             │    │   │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │  job-4c1d  [↗]        31        120   Jun 3           │    │   │
│  │  │  acme/browser-agent                                   │    │   │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │  job-2e8b  [↗]        28        100   Jun 2           │    │   │
│  │  │  acme/coding-v2                                       │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  │  Rows: Job ID (deep-link to Job detail page) / Taskset name  │   │
│  │  "Shows top 10 by Credits consumed."  text-meta muted-fg     │   │
│  │  right-aligned: Credits, Runs                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

**Empty state (no Jobs run yet):**
```
┌──────────────────────────────────────────────────────────────────┐
│  CARD: Top consumers                                              │
│                                                                   │
│  No Jobs run yet.                                                 │
│  Run `hud eval <taskset>` to start.                              │
│  text-body  ← CLI command in monospace                            │
└──────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Credit values are exact integers throughout (personality: "Exact"). No rounded display like "~150" or "150.2".
- "Top up Credits" is owner-only. Non-owners see the stat row read-only with no button.
- Job ID in the top-consumers table is a deep link to the Job detail page (`/jobs/[id]`) — this is the "provenance on every aggregate" principle: a credit number without a link to the Job is not a HUD surface.
- Taskset name below the Job ID cross-links to the Taskset's detail page if the user has access.
- Monthly chart tooltip format: `"[Date]: [N] Credits — [M] Jobs"` — exact integers, not rounded.
- Period selector default: "This month". No custom date range picker at MVP — the three options cover the dominant use cases.
- "RL training Jobs" row in the breakdown is only shown when RL Jobs exist on the org. If the org is on Cloud plan and has never run RL training, that row is absent (not shown as 0).

**Persona notes:**
- Alex: glances at Credits remaining + the top-consumers table to see which of his weekend Jobs burned the most. Deep-links to a Job from the table. 30 seconds.
- Sam: checks "Used this period" against team budget before approving a 1,000-task regression run. If the number is close to budget, he goes to Organization → "Top up Credits". That exit path is the "Top up Credits" button on this page too.
- Riley: checks breakdown to report to a buying lab contact on environment-run cost for a delivery batch.

---

## 7. API keys (`/manage/api-keys`)

**HUD question:** Alex is CLI-heavy. The first thing he does after signup is copy a key into `HUD_API_KEY`. Every subsequent week, he may create a new key per project. The page needs to be fast to copy from and fast to create a new key. The secondary concern is revocation — if a key leaks, the user needs to revoke it in one action.

This is the highest-traffic /manage page for Alex. It must surface "your default key" prominently for new users — the onboarding quickstart's Generate flow creates the key here.

```
┌──────────────────────────────────────────────────────────────────────┐
│  MAIN  max-w-3xl mx-auto  px-8 py-8                                  │
│                                                                      │
│  API keys                                                            │
│  text-display  font-medium                                           │
│                                                                      │
│  Authenticate the HUD CLI and SDK.                                   │
│  text-body  muted-fg                                                 │
│                                                                      │
│  ── CLI SNIPPET (new user / no keys yet: shown prominently) ──────  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  CALLOUT  bg-accent-subtle  border-accent  rounded           │   │
│  │  (shown only when user has no keys — dismissed once one is   │   │
│  │   created, or user clicks ×)                                 │   │
│  │                                                               │   │
│  │  Set your key in the CLI:                                    │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  export HUD_API_KEY="<your-key>"                     │ [⎘] │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │  "Generate a key below, then paste it here."                 │   │
│  │  text-meta  muted-fg                                          │   │
│  │                                               [×]            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  (Once a key exists, this callout is hidden. The copy-ready snippet  │
│  moves to the key row itself — see below.)                           │
│                                                                      │
│  ── CREATE KEY ROW (above the table) ───────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                          [+ Create API key]  │   │
│  │                              Button primary sm               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── CARD: API keys (N) ──────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │  Name          Prefix       Created      Last used   ···  │    │
│  │  │  text-label muted-fg                                 │    │   │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │  Default key   hud-sk-••7f  Jun 1, 2026  Jun 8, 2026 ···  │    │
│  │  │                             text-meta    text-meta        │    │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │  hackathon-env hud-sk-••3a  Jun 3, 2026  Jun 5, 2026 ···  │    │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │  ci-runner     hud-sk-••1c  Jun 5, 2026  Never       ···  │    │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  │                                                               │   │
│  │  right-aligned: Created, Last used                           │   │
│  │                                                               │   │
│  │  ··· row action menu:                                        │   │
│  │    Copy key prefix  (copies the masked prefix for reference) │   │
│  │    Copy CLI snippet  ← copies                                │   │
│  │                         `export HUD_API_KEY="hud-sk-[...]"`  │   │
│  │    Rename                                                     │   │
│  │    Revoke  ← destructive, red text                            │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

**Create API key dialog:**
```
┌──────────────────────────────────────────────────────┐
│  Dialog  max-w-[440px]                               │
│                                                      │
│  Create API key                                      │
│  text-title  font-medium                             │
│                                                      │
│  FormField  label="Name"                             │
│  ┌──────────────────────────────────────────────┐   │
│  │  Input  placeholder="e.g. local-dev"          │   │
│  └──────────────────────────────────────────────┘   │
│  "Name the key for your own reference."              │
│  text-meta  muted-fg                                 │
│                                                      │
│  [Cancel]                       [Create key]        │
│  Button ghost                   Button primary      │
│  "Create key" disabled until name non-empty          │
└──────────────────────────────────────────────────────┘
```

**Key created — reveal state (appears inline after dialog closes):**
```
┌──────────────────────────────────────────────────────────────────┐
│  INLINE BANNER  bg-accent-subtle  border-accent  rounded         │
│  (appears at top of key list, above the table header)            │
│                                                                   │
│  API key created. Copy it now — it won't be shown again.         │
│  text-body  font-medium                                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐        │
│  │  hud-sk-xk9qmn7f3a1c…                               │ [Copy ⎘] │
│  │  monospace  full key value  bg-code                  │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐        │
│  │  export HUD_API_KEY="hud-sk-xk9qmn7f3a1c…"          │ [Copy ⎘] │
│  │  monospace  CLI snippet                               │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                   │
│  [Done]  ← dismisses banner, key now appears in table masked     │
└──────────────────────────────────────────────────────────────────┘
```

**Revoke key confirmation dialog:**
```
┌──────────────────────────────────────────────────────┐
│  Dialog  max-w-[400px]                               │
│                                                      │
│  Revoke "hackathon-env"?                             │
│  text-title  font-medium                             │
│                                                      │
│  Any CLI or SDK using this key will stop working     │
│  immediately.                                        │
│  text-body  muted-fg                                 │
│                                                      │
│  [Cancel]                          [Revoke key]     │
│  Button ghost                      Button destructive│
└──────────────────────────────────────────────────────┘
```

**Empty state (no keys):**
```
┌──────────────────────────────────────────────────────────────────┐
│  CARD: API keys                                                   │
│                                                                   │
│  No API keys yet.                                                 │
│  Create a key above to authenticate the CLI.                     │
│  text-body  muted-fg                                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  export HUD_API_KEY="<your-key>"                        │ [⎘]  │
│  └────────────────────────────────────────────────────────┘      │
│  "Generate a key first, then paste it here."                     │
│  text-meta  muted-fg                                              │
└──────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Full key value is shown exactly once — in the post-create reveal banner. After the user dismisses "Done", the key is masked to the prefix (`hud-sk-••7f`) in the table. There is no "Reveal full key" action. This is standard API key UX for security; users must copy on create.
- "Copy CLI snippet" in the row action menu copies `export HUD_API_KEY="hud-sk-[full-value]"` — but since the full key is not available post-creation, this action copies the export command with the prefix only if the full value is no longer cached. UX consequence: if the user copies the CLI snippet after the reveal banner is dismissed, they get the masked prefix, which is not a valid key. This is expected behavior for API key security; the copy action in the row menu is an affordance for the reveal state only, or shows a tooltip "Full key not available — revoke and create a new one if needed." This needs an engineering validation check.
- "Created by" column omitted from the wireframe MVP — in a small team, this is noise. If org admins need audit visibility into which team member created a key, the column can be added as a second iteration.
- No scope picker at MVP. If scoped tokens (read-only vs full access) become a product requirement, the Create dialog adds a scope select. Not added now — the HUD question does not require it.
- The new-user callout ("Set your key in the CLI") is shown only when the user has zero keys. Once one key exists, the callout is permanently hidden. This is not a persistent panel.
- `api_key_issued` event fires when "Create key" confirms and the key is returned to the UI — consistent with the onboarding quickstart instrumentation.

**Persona notes:**
- Alex: creates a key on Day 1, copies the CLI snippet from the reveal banner, pastes into his shell config. Returns a few weeks later to create `hackathon-env` for a project. The ··· menu's "Copy CLI snippet" is what he wants on return visits when he's setting up a new machine. If that action can't provide the full key for security reasons, the copy opens a "Create a new key" flow.
- Sam: arrives to get a key for CI. Creates `ci-runner`. Copies the snippet. Done.
- Riley: may have multiple keys per project deliverable. Names them by client (e.g., `deepmind-delivery-jun`). Uses the table to track which key is active per engagement.

---

## Cross-cutting behavior

**Dirty / Save pattern (Profile, Notifications, Appearance, Organization):**
All four settings pages follow the same form pattern:
- "Save" button is disabled until any field changes from its persisted value.
- On save, a success indicator appears inline below the card: `✓ Saved` or `✓ [Setting] updated`, `text-meta`, appears for 3 seconds then fades (motion timing is motion-designer's layer). No page reload.
- On save error, an inline error banner replaces the success indicator: `"Save failed — [reason]. Try again."` with a retry button.

**Role gating:**
- `[owner-only]` fields: visible to all, disabled (not hidden) for non-owners, with a tooltip on hover: `"Only the org owner can change this."` This pattern is established by the production info card at the bottom of the sidebar ("Billing, limits, secrets & privacy are managed by an owner.") and is extended consistently to inline field-level gating.
- `[owner / admin only]` UI (invite row, invite link card): hidden entirely for Members (not disabled). The distinction from owner-only fields is intentional — invite-row access is a capability, not a readable field.

**Destructive confirmations:**
All destructive actions (revoke key, remove member, revoke invite, delete account, delete organization) follow the same pattern:
- Initiated from a ··· action menu or a clearly labeled button in a danger-zone card.
- Opens a dialog with: (1) plain-language consequence statement, (2) confirmation input where appropriate (email match for account delete, slug match for org delete), (3) `[Cancel]` (ghost) and `[Destructive action]` (destructive variant) buttons.
- No toast-based undo for destructive actions — they are final.

---

## Component summary

| Route | DS primitives | Notes |
|---|---|---|
| `/manage/profile` | `Card`, `FormField`, `Input`, `Button` (primary sm, ghost sm, outline sm, destructive sm), `Dialog` | Connected accounts card is new vs production. Delete account danger zone. |
| `/manage/notifications` | `Card`, toggle rows (`Switch` or `Toggle`), `Select` (threshold), `Button` primary sm, `Badge` sm (Coming soon) | Per-event toggles, not a global on/off. |
| `/manage/appearance` | `Card`, three-tile selector, `Select`, code preview block, radio group, `Button` primary sm | Font preview renders in real font — live update on select change. |
| `/manage/organization` | `Card`, `FormField`, `Input`, `Button` variants, `Badge` sm (plan), `Dialog` | Slug-change warning is inline helper text, not a modal. |
| `/manage/members` | `Card`, member table with avatar initials, role `Select` per row, ··· action menu, `Dialog`, invite `Input`, `Button` primary sm | Pending invites card hidden when empty. Invite link card owner/admin only. |
| `/manage/usage` | `Card`, stat row (large monospace numbers), bar chart, breakdown table, top-consumers table with Job deep-links, `Select` (period), `Button` primary sm | Job ID column is a deep-link. All numbers exact integers. |
| `/manage/api-keys` | `Card`, key table, ··· action menu, `Dialog` (create, revoke), post-create reveal banner, code blocks with copy, `Button` primary sm | Full key shown once only. CLI snippet copy in row menu. |

---

## Out of scope

- **SAML / SSO configuration.** Enterprise-only. Would live under Organization or as a separate `/manage/security` route. Not designed here.
- **Audit log.** Sam's compliance surface — not Alex's path. If added, it is a separate `/manage/audit` route under the ORGANIZATION group.
- **Personal API key scopes.** If scoped keys become a product requirement, the Create dialog gains a scope select. Not designed here.
- **Billing portal pages.** Billing is managed externally (Stripe or similar). "Manage billing ↗" opens a new tab to the external portal. No billing UI in `/manage`.
- **Team-level environment variable management.** Not a current platform primitive.
- **Per-key rate limiting.** Engineering concern; no UI for it at this scope.
- **Two-factor authentication / passkeys.** Would live in `/manage/security`. Not in this file.
- **Data export.** Sam's compliance surface, not in scope here.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/design/screens/onboarding.wireframe.md`](./onboarding.wireframe.md), [`docs/design/screens/post-signup-quickstart.wireframe.md`](./post-signup-quickstart.wireframe.md). Production reference: screenshot of `/manage/profile` at hud.ai (Operator-supplied, Jun 2026).*
