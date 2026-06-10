# App-shell — sign-out placement decision

**Phase:** `wireframes` (`components` carve-out)
**Date:** 2026-05-29
**Author:** product-designer
**Status:** decision — pending engineering implementation alongside v4 spec

---

## Decision

**Option (a): header avatar dropdown.** Avatar becomes a `DropdownMenu` trigger; menu contains "Manage" + "Sign out". The current direct `Link` to `/manage` is replaced by this menu.

One-sentence rationale: the avatar is the only identity surface in the shell, it is already the rightmost header element, and a two-item dropdown is the minimum viable mechanism to hold both the account-nav action and the sign-out action without adding a single pixel of persistent chrome for a low-frequency operation.

---

## Why not the alternatives

**(b) Sidebar footer** — sign-out would sit alongside Marketplace ↗ and Docs ↗ in the demoted utility footer zone, which uses `h-7` / `text-label` (12px) / `text-meta-foreground`. That zone communicates "external link, low priority." A user-identity action — terminating your authenticated session — does not belong in the same semantic tier as "open docs in a new tab." The sidebar is also Aman's instrument plane; adding a destructive session action below the divider pollutes a nav surface he reads for orientation.

**(c) /manage only** — fails Priya's discoverability. She visits the portal less frequently than Aman and does not know the IA by heart. She will look near her identity marker (avatar) first. If sign-out is not reachable from there, she goes hunting through nav. `/manage` is the account-admin destination; it is not labeled in a way that signals "session control." This option optimizes shell tidiness at Priya's expense — impermissible since she is the discoverability sanity check.

**(d) Hybrid** — over-engineering a low-frequency action. If the avatar dropdown carries sign-out, a secondary button inside `/manage` duplicates affordance without adding discoverability (anyone who found the `/manage` button already has the dropdown). Not worth the maintenance surface.

---

## Placement detail

### Surface

Header, rightmost cluster. The avatar is already the last element in the right cluster: `[NewMenu] [Avatar]`. The avatar becomes a `DropdownMenu` trigger.

```
Header right cluster (right-to-left read order):
  [Avatar ▾]  ← DropdownMenu trigger (no visible chevron; avatar IS the trigger)
  [New ▾]
```

The avatar does not sprout a visible dropdown indicator (no `ChevronDownIcon`). The interaction affordance is cursor-pointer on hover — consistent with every B2B platform using an avatar trigger. Adding a chevron would inflate the header and imply the avatar is a select input, not an identity control.

### DropdownMenu composition

```
┌───────────────────────────────┐
│  kate@hud.app                 │  ← user email, non-interactive, text-label, text-muted-foreground
│  ─────────────────────────    │  ← Separator
│  Manage                       │  ← DropdownMenuItem → /manage (replaces current direct link)
│  ─────────────────────────    │  ← Separator
│  Sign out                     │  ← DropdownMenuItem → calls signOut() server action
└───────────────────────────────┘
```

**Item order rationale:** Email at top is identity confirmation — lets Priya confirm she's on the right account before acting. "Manage account" before "Sign out" — the less destructive action is first. Separator above "Sign out" creates a visual break that signals the final action is categorically different. This is the same pattern used by Vercel, Linear, and GitHub — adopted because the ordering maps correctly onto the HUD user's mental model, not as pattern-following for its own sake.

**Menu width:** `min-w-[200px]` — enough to display a typical email address without truncation. The `Avatar size="sm"` is the trigger so the menu anchors to the avatar's right edge, aligning with the header's right padding.

**Menu alignment:** `align="end"` — right-aligned to the avatar, so the menu does not bleed beyond the header's right edge.

### Token references

The `DropdownMenu` component is an existing `@repo/ui` primitive. No new tokens required — it inherits:

- **Trigger (avatar):** no visual change to the avatar itself. Hover state: `cursor-pointer`. Focus-visible: existing global ring (`--color-ring`, `--color-ring-glow`). Remove the wrapping `Link` and replace with a `DropdownMenuTrigger` wrapping the `Avatar`.
- **Menu surface:** `--color-popover` (`--surface-card`, `#fcfcfd`) — existing DropdownMenu default.
- **Menu border:** `--color-border` (`--neutral-200`) — existing.
- **Email label:** `text-label` (12px), `text-muted-foreground` (`--neutral-500`). Non-interactive — not a `DropdownMenuItem`, just a `div` inside `DropdownMenuContent`.
- **Menu items (Manage account, Sign out):** standard `DropdownMenuItem` — `text-body` (13px), `text-foreground` on hover, `bg-hover` (`--neutral-150`) on hover.
- **Sign out item color:** default `text-foreground` — NOT destructive red. Rationale below.
- **Separators:** `DropdownMenuSeparator` — `bg-border` (`--neutral-200`), existing.

---

## Copy

**"Sign out"** — not "Log out."

HUD's vocabulary is technical and exact (personality.md: "Peer, not guide. Copy is terse and specific."). "Sign out" is the precise term for terminating an authenticated session in web platform convention (Google, Vercel, GitHub, Linear all use "Sign out"). "Log out" is the older, lower-register variant with a system-console connotation — correct in terminal contexts, out of register for a web app. HUD's portal is a web app. "Sign out" is the correct term.

**"Manage"** — not "Manage account", "Account settings", "Profile", or "Settings."

The destination is `/manage` which covers Team, API Keys, Billing, Usage, Credits, Secrets, and Settings — it is a workspace-admin destination, not a personal-profile page. "Manage account" implies a profile-edit surface that does not exist. "Manage" matches the sidebar nav label for the same destination, ensuring consistent vocabulary across the shell. "Account settings" implies only preferences; "Profile" implies personal data; "Settings" alone is ambiguous between app prefs and org admin. "Manage" is accurate and consistent.

---

## Sign-out interaction: direct, no confirmation

One click signs out. No confirmation modal.

**Reason:** The session is cookie-based (`portal_session`, 7-day max-age). `signOut()` calls `clearSession()` then `redirect("/login")`. The cookie holds `{email, name, signedInAt}` only — no workbench state. All Taskset authoring, Job configs, reward function edits, and Library artifacts are server-persisted entities; they are not stored in or keyed to the session cookie. Clearing the cookie loses nothing. Aman can re-sign-in in under 10 seconds and land back at exactly where he was. The action is fully recoverable.

A confirmation modal ("Are you sure you want to sign out?") would be correct if: (a) the action were irreversible, or (b) in-progress work would be lost. Neither is true here. Adding a modal for a recoverable action is friction on a persona who already has zero patience for ceremony (personality.md: "Unceremonious").

**The one exception to watch:** if a future iteration adds client-side-only draft state (e.g., an unsaved Scenario authoring buffer that has not been auto-saved), that draft would be lost on sign-out. At that point, re-evaluate and add a warning only if there is active unsaved state — not an always-on confirmation. This is a future screens-phase concern; current state machine has no such draft.

---

## After sign-out redirect

`/login`

`signOut()` already calls `redirect("/login")`. The redirect is correct — after clearing the session, the user must authenticate to access any portal route (all protected by `requireSession()`). Landing on `/` would immediately redirect to `/login` anyway; skipping the bounce is cleaner.

---

## Engineering handoff

### @repo/ui primitives needed

- `DropdownMenu` — existing primitive. Wrapper, trigger, content, item, separator, label components.
  - `DropdownMenuTrigger` — replaces the current `<Link href="/manage">` wrapping `<Avatar>`
  - `DropdownMenuContent` — menu panel
  - `DropdownMenuLabel` or a `div` — email display (non-interactive)
  - `DropdownMenuSeparator` — two instances (above "Manage account" group boundary; above "Sign out")
  - `DropdownMenuItem` — two instances ("Manage", "Sign out")
- `Avatar` / `AvatarFallback` — existing, no change to the component itself

No new primitives required.

### Lucide icons

No icons in the menu items. The two actions are unambiguous from their labels; adding icons adds visual noise at the small size with no disambiguation value. The avatar trigger already carries identity semantics. No `LogOutIcon` next to "Sign out" — that is cargo-culted from consumer apps where the user might not read the label.

### Wiring

**"Manage" item:** `<Link href="/manage">` inside `DropdownMenuItem`. Remove the current `<Link href="/manage">` wrapping the `Avatar` in `layout.tsx`.

**"Sign out" item:** `DropdownMenuItem` with `onClick` that calls the existing `signOut` server action from `@/lib/auth/actions`. The action already handles `clearSession()` + `redirect("/login")`. No new server action needed.

`signOut` is a `"use server"` function. Calling it from a client `onClick` requires the `AvatarMenu` component to be a client component (`"use client"`). This is the same pattern as `NewMenu` (currently client for `DropdownMenu` disclosure state).

### Client island

The current `Avatar` is rendered inside the server `AppLayout` as a static `<Link>`. To become a `DropdownMenu` trigger, the avatar must move into a new client component — call it `AvatarMenu` — parallel to the existing `NewMenu` client component.

| Component | Client? | Reason |
|---|---|---|
| `AvatarMenu` | Yes | `DropdownMenu` disclosure state + `signOut` `onClick` handler |
| `AppLayout` | No — remains server component | `AvatarMenu` is a leaf client island; layout stays server |

`AvatarMenu` receives the user initial (or full name/email for the menu label) as a prop from `AppLayout`, which already calls `requireSession()` and has access to `session.name` and `session.email`.

### Session data for the menu label

`AppLayout` currently computes `initial` from `session.name`. Pass `session.email` as an additional prop to `AvatarMenu` so the menu can display the email label. No additional data fetch — it is already available from `requireSession()`.

---

## Self-roast — explicit

**1. Does the pick respect Aman's "almost never signs out" reality?**

Yes. The dropdown adds zero persistent chrome. The avatar's footprint is unchanged. Aman's sign-out path requires two clicks from his current position (click avatar → click "Sign out"). The action is invisible in his daily flow. It is not a button he sees at `/jobs` triage, on a job detail page, or in the trace viewer. It is tucked behind the avatar where it belongs — findable in seconds, invisible otherwise.

**2. Did I default to (a) because every SaaS does it?**

The check: does (a) fit HUD specifically, or is it just pattern-matching?

HUD specific factors that confirm (a):
- The avatar is already the rightmost header element and already associated with identity (`Link to /manage`). The affordance already exists — upgrading it to a dropdown is the minimum-change path.
- The shell has no other identity surface. There is no user profile popover, no team switcher, no notification bell. The avatar is the only natural anchor for user-session actions.
- The sidebar is an instrument plane for navigation — not an appropriate location for session destruction.
- `/manage` is already the account admin destination; the label "Manage" correctly points there and matches the sidebar nav label.

(a) is right for HUD, not just because it's common.

**3. If I had picked (c), would the discoverability path hold?**

No. Priya navigating to `/manage` to sign out requires her to: (1) know that `/manage` contains sign-out, (2) click "Manage" in the sidebar, (3) find the sign-out button in a page that covers Team, API Keys, Billing, Usage, Credits, Secrets, and Settings. Step 1 is not discoverable for a user unfamiliar with the IA. This path is not defended.

**4. Direct-vs-confirm: did I auto-pick "direct because recoverable"?**

Counter checked: session cookie holds `{email, name, signedInAt}` only. No client-side draft state exists in the current implementation. There is no in-progress workbench state tied to the session token. Confirmed: direct is correct for the current implementation. Documented the future condition under which a warning (not a modal) would be appropriate.
