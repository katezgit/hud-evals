# App Shell — Screen Wireframes

Cross-links:
- [`docs/design/screens/manage.wireframe.md`](./manage.wireframe.md) — ManageShell detail + all /manage route screens
- [`docs/design/screens/onboarding.wireframe.md`](./onboarding.wireframe.md) — pre-shell wizard screens
- [`docs/design/screens/post-signup-quickstart.wireframe.md`](./post-signup-quickstart.wireframe.md) — first-session Get Started landing

> **Open item — manage.wireframe.md delta:** Image #3 (operator-supplied, Jun 2026) shows four nav items in ManageShell's ORGANIZATION group that are not yet in `manage.wireframe.md`: **Billing**, **Limits**, **Secrets**, and **Privacy controls**. These items are annotated in ManageShell's anatomy below. `manage.wireframe.md` itself is not updated in this pass — that file needs a dedicated follow-up to add the four routes, design the screens, and reconcile the sidebar info-card copy ("Billing, limits, secrets & privacy are managed by an owner.") against the newly-visible items.

---

## 1. Shell variants

Two shells share a common structural contract (brand slot, user chip, sidebar rail, responsive collapse) but differ in their navigation content and contextual affordances.

**AppShell** — wraps every authenticated route in the main application (`/(app)/...` route group). Responsible for: WORKSPACE + OBSERVE nav groups, Credits widget, external links (Marketplace, Documentation), and the full user chip with org switcher. This is the shell Alex lands in from any SDK deep-link. Navigation here is the primary way he orients before opening the trace viewer or kicking off a Job.

**ManageShell** — wraps every `/manage/...` route. Responsible for: "← Back to app" escape hatch, Settings header, PERSONAL + ORGANIZATION nav groups, and a simplified user chip (no org switcher). The user is already scoped to the org; switching orgs from within settings is not a valid action.

**What both shells share:**
- HUD brand mark + wordmark in the top-left brand slot
- Sidebar rail with a consistent width class hint at desktop (`lg:`)
- User chip anchored to the bottom of the sidebar
- Identical responsive collapse behavior (icon rail at `md`, drawer at `sm`)
- `aria-current="page"` on the active nav item
- Skip-to-content link before the sidebar in DOM order

**What they do not share:**
- Nav group content (WORKSPACE/OBSERVE vs PERSONAL/ORGANIZATION)
- Credits widget (AppShell only)
- External links row (AppShell only)
- "← Back to app" + Settings header (ManageShell only)
- Org switcher chevron on user chip (AppShell only; ManageShell user chip shows email instead of org + role meta)

---

## 2. Anatomy — desktop (`lg+`)

### 2a. AppShell — desktop

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  PAGE LAYOUT  lg+                                                            │
├─────────────────────────┬────────────────────────────────────────────────────┤
│  SIDEBAR  lg:w-[220px]  │  MAIN  flex-1                                      │
│  bg-sidebar  border-r   │  bg-page                                           │
│                         │                                                    │
│  ── BRAND SLOT ───────  │  [page content — per route]                        │
│  ┌─────────────────┐    │                                                    │
│  │  [■] HUD        │    │                                                    │
│  │  mark  wordmark │    │                                                    │
│  └─────────────────┘    │                                                    │
│  px-4 py-4              │                                                    │
│                         │                                                    │
│  ── WORKSPACE ────────  │                                                    │
│  text-meta uppercase    │                                                    │
│  muted-fg  tracking-wide│                                                    │
│  px-4 mt-6 mb-1         │                                                    │
│                         │                                                    │
│  ┌─────────────────────┐│                                                    │
│  │▌ [icon]  Home    ●  ││  ← selected: leading accent bar, label             │
│  │          text-accent││    text-accent, trailing unread dot                │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Tasksets 12││  ← trailing count chip (muted-fg, text-meta)       │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Environments│                                                    │
│  │                    8 ││                                                    │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Models    5 ││                                                    │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Agents    4 ││                                                    │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Library    ││  ← no count                                        │
│  └─────────────────────┘│                                                    │
│                         │                                                    │
│  ── OBSERVE ──────────  │                                                    │
│  text-meta uppercase    │                                                    │
│  muted-fg  tracking-wide│                                                    │
│  px-4 mt-6 mb-1         │                                                    │
│                         │                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Dashboard  ││                                                    │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Progress   ││                                                    │
│  └─────────────────────┘│                                                    │
│                         │                                                    │
│  ── SPACER (flex-1) ──  │                                                    │
│                         │                                                    │
│  ── EXTERNAL LINKS ───  │                                                    │
│  px-2 pb-2              │  ← last item inside <nav>                          │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Marketplace│                                                     │
│  │                   ↗ ││  ← trailing external arrow                         │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Documentation                                                    │
│  │                   ↗ ││                                                    │
│  └─────────────────────┘│                                                    │
│                         │                                                    │
│  ── CREDITS WIDGET ───  │  ← outside <nav>; account status cluster begins   │
│  mx-2 mb-2              │                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  credits            ││  ← label: lowercase, muted-fg, text-meta           │
│  │             4,230   ││  ← current: right-aligned, font-mono               │
│  │           / 10,000  ││  ← cap: right-aligned, muted-fg                    │
│  │  [████░░░░░░░░░░░░] ││  ← progress bar, full width, neutral fill          │
│  └─────────────────────┘│                                                    │
│  (deep-links to /manage/usage; outside <nav>)                                │
│                         │                                                    │
│  ── USER CHIP ─────────  │  ← outside <nav>; account status cluster ends    │
│  px-2 pb-2              │                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [D]  Demo User     ││  ← avatar circle (initial), primary name           │
│  │  Acme Robotics       ││  ← org name, muted-fg, text-meta                  │
│  │  · owner          ↕ ││  ← role, muted-fg · trailing switcher chevron ↕    │
│  └─────────────────────┘│                                                    │
│  (chevron opens org switcher popover — see §4)                               │
└─────────────────────────┴────────────────────────────────────────────────────┘
```

**Selected state — canonical pattern:**

The selected nav item in AppShell uses a **leading accent bar** (vertical, ~`w-0.5`, accent color, full item height) + **label text in accent color** + unread dot (trailing, present when there is new/unread content on that surface, absent otherwise). The item row itself has a subtle background tint (`bg-sidebar-accent-subtle`) to reinforce selection without the full pill shape.

This pattern is distinct from ManageShell's pill selection (see §2b). The divergence is intentional: AppShell nav items are dense and row-oriented — the leading bar with a tinted row is a lower-footprint selection signal that scans faster in a 7-item list. ManageShell has fewer, spaced-out items where the pill-bg reads unambiguously as selection without a separate bar marker. The two shells are visually different contexts; matching the treatment to the density is correct.

**Count chips:**
- Appear only on items with countable primitives (Tasksets, Environments, Models, Agents).
- Library has no count — it is a view, not a primitive collection with a stable cardinality.
- Dashboard and Progress have no count — they are observability surfaces, not inventories.
- Count is the org's total owned items of that type (not filtered by user). Displayed as integer, no abbreviation unless >9999 (then `9999+`).
- Count chips are `text-meta muted-fg`, right-aligned within the item row, flush to the sidebar right edge.

**Unread dot:**
- Trailing filled circle, accent color, `size-1.5`.
- Appears when the surface has content the user has not viewed since it was created or updated. Specific semantics (what counts as "new" per surface) are defined in the surface's own screen spec, not here.
- In Image #2, the dot appears on Home. Its presence on Home is likely a "new activity" signal — a Job completed or a new trace arrived since last visit.

**Nav item icons:**
- Leading icon slot only. Icon is decorative — the label is the primary affordance.
- Icon size `size-4`. Icons are not specified here (design-tokens phase); each item has a dedicated icon slot.

---

### 2b. ManageShell — desktop

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  PAGE LAYOUT  lg+                                                            │
├─────────────────────────┬────────────────────────────────────────────────────┤
│  SIDEBAR  lg:w-[220px]  │  MAIN  flex-1  max-w-3xl mx-auto  px-8 py-8        │
│  bg-sidebar  border-r   │                                                    │
│                         │  [page content — per /manage route]                │
│  ── BRAND SLOT ───────  │                                                    │
│  ┌─────────────────┐    │                                                    │
│  │  [■] HUD        │    │                                                    │
│  └─────────────────┘    │                                                    │
│  px-4 py-4              │                                                    │
│                         │                                                    │
│  ← Back to app          │                                                    │
│  text-link  muted-fg    │                                                    │
│  px-4 mb-2              │                                                    │
│                         │                                                    │
│  ─────────────────────  │                                                    │
│  divider border-b       │                                                    │
│                         │                                                    │
│  ┌─────────────────┐    │                                                    │
│  │ [⚙]  Settings  │    │                                                    │
│  └─────────────────┘    │                                                    │
│  text-label font-medium │                                                    │
│  px-4 py-3              │                                                    │
│                         │                                                    │
│  ── PERSONAL ─────────  │                                                    │
│  text-meta uppercase    │                                                    │
│  muted-fg tracking-wide │                                                    │
│  px-4 mt-2 mb-1         │                                                    │
│                         │                                                    │
│  ┌─────────────────────┐│                                                    │
│  │▌ [icon]  Profile    ││  ← selected: leading bar + pill-bg tint            │
│  │  bg-sidebar-accent  ││    (ManageShell selection = bar + full-width pill) │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Notifications                                                    │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Appearance ││                                                    │
│  └─────────────────────┘│                                                    │
│                         │                                                    │
│  ── ORGANIZATION ─────  │                                                    │
│  text-meta uppercase    │                                                    │
│  muted-fg tracking-wide │                                                    │
│  px-4 mt-4 mb-1         │                                                    │
│                         │                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Organization                                                     │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Members    ││                                                    │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Billing    ││  ← new (not yet in manage.wireframe.md)            │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Usage      ││                                                    │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Limits     ││  ← new (not yet in manage.wireframe.md)            │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  API keys   ││                                                    │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Secrets    ││  ← new (not yet in manage.wireframe.md)            │
│  └─────────────────────┘│                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [icon]  Privacy    ││  ← new (not yet in manage.wireframe.md)            │
│  │          controls   ││                                                    │
│  └─────────────────────┘│                                                    │
│                         │                                                    │
│  ── SPACER (flex-1) ──  │                                                    │
│                         │                                                    │
│  ── USER CHIP ─────────  │                                                   │
│  px-2 pb-2              │                                                    │
│  ┌─────────────────────┐│                                                    │
│  │  [D]  Demo User     ││  ← avatar circle + primary name                    │
│  │  demo@hud.app       ││  ← email, muted-fg, text-meta (no org/role meta)   │
│  └─────────────────────┘│                                                    │
│  (no org switcher — settings are scoped to current org)                      │
└─────────────────────────┴────────────────────────────────────────────────────┘
```

**ManageShell selected state — justified divergence:**

ManageShell uses a **leading accent bar** + **full-width pill background** (`bg-sidebar-accent`) for the selected item. The pill background is wider/more prominent than the AppShell tint because ManageShell items are fewer and more widely spaced — the pill reads clearly as selection without blending into adjacent rows. The leading bar is retained for visual consistency with AppShell (the same accent-bar signal tells the user "this bar means selected" across both contexts). The label color shifts to accent on selection in both shells.

**Resulting canonical pattern across both shells:**
- Leading accent bar — always present on selected item in both shells
- Accent-colored label — always present on selected item in both shells
- Row background tint — present in both, heavier fill in ManageShell (more space per item), lighter in AppShell (denser list)

This is not two different selection patterns; it is one pattern scaled to the density of the list it appears in.

**Role-gating on ORGANIZATION items:**
Billing, Limits, Secrets, and Privacy controls are owner-restricted. The items are visible to all authenticated members (per the established role-gating convention: visible, not hidden) but display a tooltip on non-owner hover/focus: `"Only the org owner can access this."` The sidebar info-card used in the production shell ("Billing, limits, secrets & privacy are managed by an owner.") may be retired when the inline tooltip convention is fully applied — that decision belongs in the manage.wireframe.md follow-up pass.

---

## 3. Anatomy — Credits widget (AppShell only)

### Layout

```
┌─────────────────────────┐  ← bg-muted/60 rounded-md panel; mx-2 mb-2 inset
│  credits                │    label row: left-aligned, muted-fg, text-meta
│                  4,230  │
│                / 10,000 │  ← current / cap: right-aligned, font-mono,
│  [████░░░░░░░░░░░░░░░] │    text-meta. Current in default-fg, cap in muted-fg.
└─────────────────────────┘  ← progress bar: full width, neutral fill (not accent)
```

The numeric line uses the right-aligned numeric convention from `manage.wireframe.md`: the current value and the cap are on the same right edge. The label "credits" floats left on the same row or on its own row above — either reading is consistent with the reference screenshot; the label above the numerics is cleaner at small sidebar widths.

**Containment:** The widget sits inside a `bg-muted/60 rounded-md mx-2 mb-2` panel rendered **outside the `<nav>` element**, directly above the user chip. Credits is account status, not page navigation — it exits `<nav>` and forms an account-status cluster with the user chip at the structural footer. The `rounded-md` cap is load-bearing — it closes the bounding shape even at low fill contrast. No divider between Credits and the user chip; they are the same semantic group. The `border-t border-border` on the External Links row above is the separator between page-nav and the account-status cluster.

**Burn rate and runway are not surfaced in the sidebar widget.** They live on `/manage/usage`. The sidebar widget is a glance-instrument for remaining budget; runway derivation belongs one level deeper.

**Progress fill:** `bg-muted-foreground/30` — a 30% alpha `--neutral-500` fill. Reads as present, legible, ignorable; same perceptual weight as zone-label text. Not a teal accent, not a semantic state color.

**Clickability:** The entire Credits widget is a clickable region that deep-links to `/manage/usage`. No visible link affordance — the widget is not styled as a button. On hover/focus, a subtle `bg-sidebar-accent-subtle` tint appears and a tooltip reads `"View usage details"`. Alex uses this to get to the usage breakdown fast; it is not the primary nav, so it does not get an `aria-current`.

### Loading state

```
┌─────────────────────────┐  ← bg-muted/60 rounded-md panel (mx-2 mb-2 inset)
│  credits                │
│            ░░░░░░░░░░   │  ← skeleton line, right-aligned
│  [░░░░░░░░░░░░░░░░░░░] │  ← skeleton progress bar
└─────────────────────────┘
```

Skeleton uses `bg-muted animate-pulse`. No spinner — the widget shape is fixed; skeleton prevents layout shift. No meta-row skeleton — the row is removed.

### Empty state (zero credits)

```
┌─────────────────────────┐  ← bg-muted/60 rounded-md panel (mx-2 mb-2 inset)
│  credits                │
│                       0 │  ← 0, exact, right-aligned, text-destructive
│                / 10,000 │
│  [░░░░░░░░░░░░░░░░░░░] │  ← empty progress bar (no fill)
│  Add credits →          │  ← text-link to /manage/billing
└─────────────────────────┘
```

When Credits reach zero, the current value renders in `text-destructive` (role, not hex — token phase assigns color). The progress bar is unfilled. The CTA row "Add credits →" links to `/manage/billing`. No burn rate or runway is shown — not meaningful at zero.

### Enterprise tier (unlimited credits)

```
┌─────────────────────────┐  ← bg-muted/60 rounded-md panel (mx-2 mb-2 inset)
│  credits                │
│               unlimited │  ← text, not a number, muted-fg italic or text-meta
│  [████████████████████] │  ← progress bar fully filled, neutral fill
└─────────────────────────┘
```

Enterprise accounts on unlimited credit plans show the word "unlimited" instead of a numeric ratio. The progress bar is fully filled in the neutral fill token (`bg-muted-foreground/30`) — same token as the default state. The burn-rate meta row is absent at all tiers in the sidebar widget. Cost-awareness for enterprise lives on `/manage/usage`.

Self-serve accounts with a credit cap (Cloud tier) always show the numeric ratio. No burn-rate or runway row in the sidebar widget at any tier.

### Deep-link target

The Credits widget links to `/manage/usage`. It does not link to `/manage/billing` or `/manage/organization`. Usage is where Alex and Sam go to understand what consumed the credits; billing (payment) is a different action. The Credits widget is a read surface, not a purchase entry point.

---

## 4. Anatomy — User chip + org switcher

### AppShell user chip (with org switcher)

```
┌───────────────────────────────────┐
│  [D]  Demo User                   │  ← avatar: initial, bg-muted circle, size-8
│       Acme Robotics · owner    ↕  │  ← org name + role, muted-fg, text-meta
└───────────────────────────────────┘   trailing ↕ chevron, muted-fg
```

The chevron is a button trigger (keyboard-activatable, `role="button"` or as a `<button>` wrapper on the entire chip). The whole chip is the trigger — the user does not need to click precisely on the chevron.

### ManageShell user chip (no org switcher)

```
┌───────────────────────────────────┐
│  [D]  Demo User                   │  ← avatar + name
│       demo@hud.app                │  ← email, muted-fg, text-meta (not org/role)
└───────────────────────────────────┘
```

Email instead of org meta in ManageShell: the user is already in settings scoped to the current org. Showing the email confirms "these are your personal settings." Org switching is blocked in settings context (switching orgs mid-settings could produce confusing partial saves). If the user wants to switch orgs, they go back to the app first.

### Org switcher popover

Triggered by activating the AppShell user chip. Opens directly above the chip (popover with upward offset), left-aligned to the sidebar.

```
┌─────────────────────────────────────┐
│  POPOVER  min-w-[220px]             │
│                                     │
│  ── CURRENT ORG ─────────────────  │
│  ┌─────────────────────────────┐   │
│  │  [■]  Acme Robotics  ✓      │   │  ← checkmark on current org
│  │       owner                 │   │  ← role below org name, muted-fg
│  └─────────────────────────────┘   │
│                                     │
│  ── OTHER ORGS ───────────────── │  │
│  ┌─────────────────────────────┐   │
│  │  [■]  OpenPipe Research     │   │  ← orgs where user is a member
│  │       member                │   │
│  └─────────────────────────────┘   │
│                                     │
│  + Create organization              │  ← text-link or ghost-btn, full width
│                                     │
│  ─────────────────────────────────  │
│  divider                            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [D]  Demo User             │   │  ← account row (avatar + name)
│  │       demo@hud.app          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Manage account →                   │  ← links to /manage/profile
│  Sign out                           │  ← destructive-fg or muted-fg
│                                     │
└─────────────────────────────────────┘
```

**Popover behaviors:**
- Selecting a different org switches context and reloads the app shell with the new org's data. The current route is preserved where possible (if `/environments` is valid for the new org, stay there; if the route references a resource not in the new org, fall back to `/`).
- "Create organization" navigates to `/onboarding/org` — the same wizard used during initial onboarding. The user is not forced through the invite step again.
- "Manage account →" navigates to `/manage/profile` in ManageShell.
- "Sign out" fires a sign-out action and redirects to the marketing/login page.
- The account row at the bottom is read-only (no action). It disambiguates which user is signed in when the org list has many entries.

**Keyboard:**
- `Enter` or `Space` on the chip trigger opens the popover.
- `Escape` closes the popover, returns focus to the chip trigger.
- `Tab` / `Shift+Tab` cycle through popover items in DOM order.
- Arrow keys optionally navigate between org rows (progressive enhancement — not required at MVP; Tab is the baseline).
- Selecting an org item via `Enter` fires the org switch.

**Accessibility:**
- Chip trigger: `aria-haspopup="menu"`, `aria-expanded` reflects open/closed state.
- Popover: `role="menu"`, each org row is `role="menuitem"`.
- Current org row: `aria-checked="true"` or indicated by the visible checkmark with an `aria-label` supplement: `"Acme Robotics, current organization"`.
- Focus trap: focus is trapped inside the popover while open. Escape releases trap and closes.

---

## 5. Responsive — three states

Breakpoints use Tailwind v4 names only. No pixel values.

### lg+ (desktop) — full persistent sidebar

```
┌─────────────┬───────────────────────────────────┐
│  SIDEBAR    │  MAIN CONTENT                     │
│  lg:w-[220px]│  flex-1                           │
│  persistent  │  bg-page                          │
│  border-r    │                                   │
│  [full nav]  │  [page]                           │
│  [credits]   │                                   │
│  [ext links] │                                   │
│  [user chip] │                                   │
└─────────────┴───────────────────────────────────┘
```

Sidebar is always visible. No toggle. Main content fills remaining horizontal space. This is Alex's primary context — the rail is muscle memory; he never hides it.

---

### md (tablet) — icon rail

```
┌──────┬──────────────────────────────────────────┐
│ RAIL │  MAIN CONTENT                            │
│md:w-  │  flex-1                                  │
│[48px]│                                          │
│      │  [page]                                  │
│ [■]  │                                          │  ← brand: mark only (no wordmark)
│      │                                          │
│ [○]  │                                          │  ← Home icon (selected state:
│ [○]  │                                          │    accent bg circle, no bar needed
│ [○]  │                                          │    at this width — icon is the signal)
│ [○]  │                                          │
│ [○]  │                                          │
│      │                                          │
│ [○]  │                                          │  ← Dashboard
│ [○]  │                                          │  ← Progress
│      │                                          │
│ [flex│                                          │
│  gap]│                                          │
│      │                                          │
│ [○]  │                                          │  ← Marketplace icon
│ [○]  │                                          │  ← Documentation icon  (last inside <nav>)
│      │                                          │
│ [◉]  │                                          │  ← Credits: icon with progress ring (outside <nav>)
│      │                                          │
│ [D]  │                                          │  ← User chip: avatar only (outside <nav>)
└──────┴──────────────────────────────────────────┘
```

**Icon rail rules:**
- Labels hidden. Counts hidden. Group labels hidden. User chip text hidden.
- Each icon is a `<button>` or `<a>` with an `aria-label` of the item name (e.g., `aria-label="Tasksets"`).
- Count chips surface as a tooltip on hover/focus: `"Tasksets — 12"`. Count is not visible in the rail itself (insufficient space without label context to interpret the number).
- Selected item: accent-colored icon inside a circular or square `bg-sidebar-accent-subtle` badge. The leading bar treatment is dropped at this width — at `w-[48px]`, the item width is too narrow for a left-edge bar to read; a background token on the icon area is the correct signal.
- Brand: mark-only (`[■]` square logo badge, no wordmark). Same mark used in ManageShell and AppShell.

**Credits at `md` — icon with progress ring:**

The Credits widget collapses to a **single icon with a circular progress ring** around it (representing used/total Credits proportionally). Tooltip on hover/focus: `"Credits: 4,230 / 10,000 · ~38h left"`. This is chosen over hiding entirely because Alex uses the Credits widget as a quick burn-rate check before starting a Job — removing it at tablet would break that habit. A single icon + ring preserves the signal without taking label space. The ring is an SVG circle; fill proportional to credits consumed (not remaining, so that a nearly-full ring = nearly-depleted budget — the alarming direction).

At zero credits, the ring is fully filled and rendered in `text-destructive` color to signal the empty state even at a glance.

Enterprise (unlimited): the ring is fully filled in a neutral/muted tone, no destructive color. Tooltip reads `"Credits: unlimited"`.

**ManageShell at `md`:**
ManageShell collapses to an identical icon rail. The "← Back to app" item becomes a back-arrow icon with `aria-label="Back to app"`. The Settings header is hidden (the gear icon in the rail approximates it). PERSONAL / ORGANIZATION group icons are shown in sequence with no group separators visible. The user chip collapses to avatar-only, same as AppShell.

---

### sm/below (mobile) — top bar + drawer

```
┌──────────────────────────────────────────────────┐
│  TOP BAR  h-12  border-b  bg-muted               │
│  ┌──┐  [■·]               [4,230] [D]            │
│  │☰ │  mark+dot (no wdmk)  chip    avatar         │
│  └──┘                                            │
├──────────────────────────────────────────────────┤
│  MAIN CONTENT  flex-1                            │
│  bg-page                                         │
│  [page]                                          │
│                                                  │
└──────────────────────────────────────────────────┘
```

Sidebar is hidden by default. A top bar replaces it:
- Left: hamburger icon button (`aria-label="Open navigation"`, `aria-expanded` reflects state)
- Center: `BrandMark` in collapsed (mark + gold dot only) mode — wordmark is dropped on mobile. Layout rationale: `justify-between` with an asymmetric right cluster would push the brand off-center if the wordmark is retained; mark-only is the standard resolution. Redundancy rationale: user has already opened the app.
- Right cluster (`flex items-center gap-1`): **credits chip** + user avatar

**Credits chip (`MobileCreditsChip`) — sm only:**

The chip is a compact inline display of the current credits balance. It links to `/manage/usage` (same destination as the sidebar `CreditsPill`). It does NOT appear at `md+` — it renders inside `MobileTopBar` which is already `md:hidden`.

- Format: adaptive — `< 10,000` → full comma-separated (`4,230`); `≥ 10,000` → compact rounded (`42k`). Hundreds matter when balance is in the thousands (4.2k vs 4.8k is a real call at 200 cr/hr burn); above 10k they don't.
- Typography: `font-mono text-label tabular-nums`
- Healthy color: `text-meta-foreground`; on hover: `text-foreground`
- Tap target: `min-h-8 px-1.5` — entire chip is the link; ≥ 32px height
- Hover: `bg-hover` tint (same as other nav affordances)

**Credits chip state variants (sm only):**

| State     | Display            | Color                  | Note                                    |
| --------- | ------------------ | ---------------------- | --------------------------------------- |
| Healthy   | `4,230` or `42k`   | `text-meta-foreground` | Adaptive format per rule above          |
| Zero      | `0`                | `text-destructive`     | No inline CTA — tap navigates to usage  |
| Unlimited | chip hidden        | —                      | `total === 0` convention; avatar shifts left |
| Loading   | skeleton `w-10 h-4`| `bg-muted-foreground/20` | Fixed width; avatar position does not shift |

No intermediate warning state (e.g., "low" at 10%) — only zero is unambiguous and actionable at a glance.

**Top-bar item reference (sm):**

```
[hamburger 36px] [mark·dot ~24px] ···gap··· [chip ~42–51px] [gap-1 4px] [avatar 32px]
px-3 12px each side
Total at 375px: 12 + 36 + 24 + 51 + 4 + 32 + 12 = 171px · slack: 204px ✓
```

**Drawer (tap hamburger to open):**

```
┌────────────────────────────────────────────────────────────────────┐
│  DRAWER OVERLAY  left-0 top-0 h-full  z-overlay                    │
│  ┌─────────────────────────────────────────────────────┐           │
│  │  DRAWER PANEL  w-[280px]  bg-sidebar  h-full        │  [scrim] │
│  │  overflow-y-auto                                    │          │
│  │                                                     │          │
│  │  [×]  [■] HUD                ← close button (top-right)        │
│  │  px-4 py-4                                          │          │
│  │                                                     │          │
│  │  ── WORKSPACE ───────────────────────────────────── │          │
│  │  [full lg+ nav items, labels, counts, icons]        │          │
│  │                                                     │          │
│  │  ── OBSERVE ─────────────────────────────────────── │          │
│  │  [Dashboard]  [Progress]                            │          │
│  │                                                     │          │
│  │  ── SPACER ──────────────────────────────────────── │          │
│  │                                                     │          │
│  │  ── EXTERNAL LINKS ──────────────────────────────── │          │
│  │  [Marketplace ↗]  [Documentation ↗]  (last in nav) │          │
│  │                                                     │          │
│  │  ── CREDITS WIDGET ──────────────────────────────── │          │
│  │  [full credits widget — same as lg+ layout]         │          │
│  │  (outside <nav>; account status cluster)            │          │
│  │                                                     │          │
│  │  ── USER CHIP ───────────────────────────────────── │          │
│  │  [D]  Demo User                                     │          │
│  │       Acme Robotics · owner  ↕                      │          │
│  │                                                     │          │
│  └─────────────────────────────────────────────────────┘          │
│  [scrim — semi-transparent, tapping closes drawer]                 │
└────────────────────────────────────────────────────────────────────┘
```

**Drawer rules:**
- Drawer carries the **full lg+ layout** including counts, credits, external links, and user chip. Mobile users on a small screen should not get a degraded navigation experience — the drawer is essentially the full sidebar presented as a panel.
- The Credits widget in the drawer is the same as lg+ (label, numeric, progress bar, meta row). No collapse or ring variant — the drawer has enough width to show the full widget.
- Drawer width: `w-[280px]` (class hint, wider than sidebar to account for touch tap targets).
- Close: × button top-right of drawer, `aria-label="Close navigation"`. Tapping the scrim closes. Swipe-left on the drawer also closes (touch gesture — engineering implementation detail, not a design constraint).
- `Escape` key closes the drawer.

**Focus trap:**
When the drawer is open, focus is trapped inside the drawer panel. The first focusable element inside the drawer receives focus on open (the close button × or the first nav item). Closing the drawer returns focus to the hamburger button that opened it.

**ManageShell drawer at `sm`:**
The drawer for ManageShell carries:
- "← Back to app" as the first item after the brand slot
- Settings header (`[⚙] Settings`) below the back link
- PERSONAL + ORGANIZATION nav groups (full labels, no counts)
- User chip with email (same as ManageShell lg+, no org switcher chevron)

"← Back to app" survives into the mobile drawer header because it is the primary exit path from settings. On mobile, this is more important than on desktop where the sidebar is persistent and the link is always visible. Its placement immediately after the brand slot ensures it is found without scrolling.

---

## 6. Keyboard + a11y

**Skip-to-content:**
A visually hidden `<a href="#main-content">Skip to main content</a>` is the first focusable element in the DOM, before the sidebar. It becomes visible on focus (keyboard users only). Target is `id="main-content"` on the main content region.

**Landmark structure:**
- Sidebar: `<nav aria-label="Main navigation">` (AppShell) or `<nav aria-label="Settings navigation">` (ManageShell)
- Main content region: `<main id="main-content">`
- Group labels (WORKSPACE, OBSERVE, PERSONAL, ORGANIZATION): `<h2>` with `aria-hidden="true"` if the group is also communicated by the nav landmark's `aria-label`, or rendered as visually styled text with `role="group"` and `aria-label` on the surrounding group container. Either approach is acceptable — the engineering decision is which semantic is cleaner given the component structure. The design requirement is that group membership is communicated to screen readers.

**Active item:**
`aria-current="page"` on the currently selected nav item. This is read by screen readers as "current page" without needing the visual bar to be perceived. The visual leading bar is additional confirmation for sighted users.

**Org switcher popover:**
See §4 for keyboard and ARIA details. Focus trap inside the popover while open; Escape releases.

**Mobile drawer:**
Focus trap inside the drawer while open (see §5). `aria-modal="true"` on the drawer panel to prevent screen readers from reading background content.

**Credits widget (clickable region):**
Rendered as a `<button>` or `<a>` with `aria-label="View usage details"` since the widget's text content does not itself name the action. Keyboard-activatable with `Enter` or `Space`.

**Icon rail at `md`:**
Each icon-only item has an `aria-label` that matches the full item name (e.g., `aria-label="Environments"`). Count is communicated as part of the tooltip only — tooltips are not reliable for screen readers, so the count is also in the `aria-label`: `aria-label="Environments, 8 total"`. This ensures screen-reader users get parity with the count-chip information available to sighted users on desktop.

**Reduced motion:**
Animation behavior (drawer slide-in, popover open transition) is the motion-designer's layer. The wireframe does not specify durations or easings, but the a11y requirement is that all transitions respect `prefers-reduced-motion: reduce` — motion states (open/closed) must be instantaneous when the preference is set.

---

## 7. Cross-link to `manage.wireframe.md` — delta flag

**Current `manage.wireframe.md` sidebar inventory (ORGANIZATION group):**
- Organization
- Members
- Usage
- API keys
- *(info card for non-owners re: billing/limits/secrets/privacy)*

**Image #3 actual sidebar (ORGANIZATION group):**
- Organization
- Members
- Billing ← **missing from manage.wireframe.md**
- Usage
- Limits ← **missing from manage.wireframe.md**
- API keys
- Secrets ← **missing from manage.wireframe.md**
- Privacy controls ← **missing from manage.wireframe.md**

**Follow-up required (not addressed in this file):**
1. Add `/manage/billing`, `/manage/limits`, `/manage/secrets`, `/manage/privacy` to the route list and component summary table in `manage.wireframe.md`.
2. Design the four screens. Likely scope: Billing = external billing portal link + invoice list (owner-only). Limits = spend caps, concurrent Job limits (owner-only). Secrets = org-level secret store for environment variables the agent sees at runtime (owner-controlled visibility). Privacy controls = data retention, trace storage policy, third-party sharing consent.
3. Reconcile the info-card copy at the sidebar bottom ("Billing, limits, secrets & privacy are managed by an owner.") with the decision to show these items as navigable (if visible, the info card may be redundant — owner-tooltip on each item inline is cleaner).
4. Update the route list at the top of `manage.wireframe.md`.

This file (app-shell) annotates these four items as `← new` in the ManageShell anatomy above and does not design their page content.

---

## Component summary

| Shell | Component / region | Notes |
|---|---|---|
| Both | `<nav>` sidebar rail | `aria-label` distinguishes Main vs Settings navigation |
| Both | Brand slot | Mark + wordmark at `lg+`; mark only at `md`; mark + wordmark in drawer at `sm` |
| Both | User chip | `<button>` wrapping the full chip; `aria-haspopup` at AppShell |
| AppShell | Nav groups (WORKSPACE, OBSERVE) | 7 items with icons, counts, unread dot |
| AppShell | Credits widget | Clickable `<a>` or `<button>` linking to `/manage/usage` |
| AppShell | External links row | Marketplace, Documentation — trailing `↗`, `target="_blank" rel="noopener"` |
| AppShell | Org switcher popover | `role="menu"`, focus trap, Escape closes |
| ManageShell | "← Back to app" | First item after brand slot; present in drawer at `sm` |
| ManageShell | Settings header | `[⚙] Settings`, `text-label font-medium`, below back link + divider |
| ManageShell | Nav groups (PERSONAL, ORGANIZATION) | 11 items including 4 new (Billing, Limits, Secrets, Privacy controls) |
| `sm` only | Top bar | `h-12`, hamburger + brand + avatar; no sidebar |
| `sm` only | Drawer overlay | `w-[280px]`, focus trap, scrim, full lg+ layout inside |
| `md` only | Icon rail | Icons only, `aria-label` on each, count in tooltip + aria-label, Credits → ring icon |

---

## Out of scope

- Per-route page headers, breadcrumbs, and content areas — each surface has its own screen spec.
- Job launch controls (not a shell-level concern — lives in the Jobs or Tasksets surface).
- Notification center / notification tray — if added, it would be a top-bar icon in AppShell; not designed here.
- Global search — if added, it would live in the top bar or as a sidebar control; not designed here.
- Sidebar collapse/expand toggle at `lg+` — the sidebar is always visible at desktop. A user-triggered collapse is a future enhancement if users request more horizontal space (e.g., when using the trace viewer full-width).
- Theme-specific sidebar colors (dark vs light mode) — defined in design-tokens phase.
- Motion: drawer slide-in, popover transitions, skeleton animation timings — motion-designer's layer.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md). Visual references: operator-supplied screenshots Image #2 (AppShell) and Image #3 (ManageShell), Jun 2026. Sibling wireframes: [`manage.wireframe.md`](./manage.wireframe.md), [`onboarding.wireframe.md`](./onboarding.wireframe.md), [`post-signup-quickstart.wireframe.md`](./post-signup-quickstart.wireframe.md).*
