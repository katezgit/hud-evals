# New Environment Page — Screen Wireframe (`/environments/new`)

> Wireframe convention: structure, hierarchy, copy, and flow only. No pixel sizes, no Tailwind classes, no hex values. Token names used verbatim (text-display, bg-panel, text-muted-foreground, etc.). Structural and hierarchical decisions are locked here; token assignments are confirmed in the screen-spec phase.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome (sidebar, credits widget, user chip). This wireframe covers the `MAIN` region only.
- [`docs/design/screens/environments.wireframe.md`](./environments.wireframe.md) — the upstream index this page is linked from. The "+ New Environment" CTA in the index header and the empty-state CTA both land here.
- [`docs/design/screens/environment-detail.wireframe.md`](./environment-detail.wireframe.md) — visual sibling. Header altitude, breadcrumb pattern, descriptor-strip convention, and section rhythm are all inherited from this file.

---

## HUD-side question answered

### Who lands here, and why?

Three honest audiences arrive at `/environments/new`:

1. **First-time user from post-signup / onboarding.** Just created the org. "New environment" is the next visible CTA. They need to understand that the actual creation work happens in the CLI, not in this dashboard form. The page must hand them off to the CLI immediately — not after scrolling through a template gallery.
2. **Returning user from the `/environments` index.** Clicked "+ New Environment" from the index page header or the index empty-state. They already know what they want; they came here because they need the exact CLI invocation. Same as audience 1: fastest path wins.
3. **User browsing for templates as discovery.** Wants to fork a known-good starting shape before running `hud init`. Templates are secondary — the user still ends up in the CLI after choosing one.

**Conclusion:** Audiences 1 and 2 are the majority and are both CLI-destination users. Audience 3 is served by Templates as a secondary affordance. The visual hierarchy must lead with CLI, not Templates.

### Section order decision

**Chosen order: header → CLI Quickstart → Templates.**

The current code renders `<TemplatesSection />` before `<CliQuickstart />`. The page header copy says "The fastest path is the CLI." These contradict each other: the copy points forward to CLI but the first visible content is a template gallery. Audiences 1 and 2 — who are the majority — are sent to the wrong place first.

Flipping the order aligns the visual hierarchy with the copy and with the honest journey: "here is how you do it (CLI) → if you want a head start, here are templates." Audience 3 (discovery) is not harmed by scrolling past the three-step CLI quickstart; the Templates section remains present and reachable. Audience 1 and 2 are immediately served by the CLI content at the top of the page body.

**This is a structural decision, not a copy change.** The operator's constraint is "keep both sections and the current copy intact" — the section order is a hierarchy decision within that constraint.

---

## Decision log — 8 required decisions

### Decision 1: Section order

**HUD-side question:** Does the current Templates-first order serve the three honest audiences, given the header copy that leads with CLI?

**Choice: CLI Quickstart first, Templates second.**

Audiences 1 and 2 (the majority) are CLI-destination users who arrived here to get a deploy command. Showing them a template gallery first creates a hierarchy mismatch with the page's own copy ("fastest path is the CLI"). Reversing the order makes structure and copy agree: lead with the actual fastest path, then offer the discovery affordance for audience 3. Both sections remain; neither is removed or merged.

**Persona reason:** Alex is hackathon-day fresh or returning from a CLI session — he reads the page top-to-bottom for the exact command. Putting the CLI step list at the top of the body means he never has to scroll past a gallery to find it. Sam is similarly CLI-literate and arrives to confirm the deploy command syntax. Riley, if browsing templates, is already comfortable with a scroll.

---

### Decision 2: Header altitude — gap and descriptor line

**HUD-side question:** The detail page header uses `gap-3 pt-2 pb-6`. The current new page uses `pt-2 pb-2` — visually flat compared to the detail. Should the altitude match? And does the title row need a descriptor line in the slot where the detail page carries its meta row (chip · slug · created)?

**Choice: Match the detail page gap — `gap-3 pt-2 pb-6`. No descriptor line below the title.**

The detail page's `pb-6` is load-bearing: it creates air between the header and the tab strip (or, in this case, the first section). The current `pb-2` makes the header feel clipped against the content below, breaking the visual rhythm shared by every other detail-surface page.

The detail page uses the descriptor strip (chip · slug · copy button · source · created date) to carry actionable metadata for a specific resource. The new-environment page is not a resource — it has no slug, no source, no created date. There is nothing honest to put in a descriptor strip. The slot is left empty; the title stands alone with its subhead. The title row is title + subhead only, matching the detail page's structural shape without forcing phantom metadata.

**Persona reason:** Alex reads the header for orientation ("I'm on the right page") then immediately scans for the first step. Visual breathing room (`pb-6`) signals "page begins here" without adding content that isn't there.

---

### Decision 3: Sticky header behavior

**HUD-side question:** Should the `/environments/new` header adopt the sticky container + scroll-cue border that the detail page uses?

**Choice: Sticky header, inheriting the detail page's sticky + scroll-cue pattern. (Locked 2026-06-11 by operator override.)**

Earlier draft argued against sticky (no tab strip → no functional payoff). Operator override: surface coherence wins. The detail page's sticky header + scroll-cue is the visual signature of `/environments/*`; rendering this page without it produces a small but legible "this page is different" tell as the user scrolls. Keeping the header pinned costs almost nothing structurally and preserves the cross-page identity.

**Inherited pattern (from `env-detail-shell.tsx`):**

- Sticky container wraps the entire header (breadcrumb + title row + subhead paragraph).
- `sticky top-0 z-page-chrome bg-background pt-6` — pt-6 lives INSIDE the sticky element (not on the page wrap), so the sticky's natural top edge sits at scroll y=0; otherwise outer padding would push it down and it would visibly creep upward during scroll 0→24 before pinning.
- Scroll-cue border slot is always occupied (`border-b`) so flipping border-color does not shift layout. Border-color is `border-transparent` at y=0, transitioning to `border-border` once `usePageScrolled` reports scrolled. Same hook the detail page uses (`@repo/libs/hooks` → `usePageScrolled({ ref: stickyRef })`).
- `shadow-scroll-cue` appears at the same threshold; `shadow-none` at rest.
- `transition-[border-color,box-shadow] prop-(--motion-state-change)` mirrors the detail page.

**Persona reason:** Alex and Sam toggle between `/environments/[id]` and `/environments/new` during onboarding and exploration. A header that pins on one and floats away on the other reads as inconsistency. The sticky behavior also keeps the breadcrumb + page identity visible as the user scans the CLI step list — useful when the page extends past one viewport on smaller screens.

**Page-wrap implication.** Because `pt-6` moves INSIDE the sticky element, the outer page container drops its `py-6` and keeps `pb-` only (matching the detail-shell approach). The page becomes a `"use client"` component (the sticky needs the ref + scroll hook).

---

### Decision 4: Page horizontal rhythm

**HUD-side question:** The current page uses `px-8` flat. The detail page uses `px-4 md:px-8`. Which rhythm applies here?

**Choice: Inherit `px-4 md:px-8` from the detail page.**

The detail page's responsive horizontal rhythm is the canonical pattern for this product surface. Using `px-8` flat breaks the horizontal rhythm for narrow viewports and deviates from the established convention without a reason grounded in this page's content. The new-environment page has no layout reason to deviate — it is a single-column page and the responsive padding serves it the same way it serves the detail page.

**Persona reason:** Consistency of horizontal inset across the environments surface is a product-coherence signal that users read without noticing. Inconsistency reads as incompleteness.

---

### Decision 5: Section separation

**HUD-side question:** Currently `gap-8` between sections (inherited from page outer flex column). Should sections be separated by a divider (`border-border` hairline), a generous vertical gap, or a visible card containing each section?

**Choice: `border-border` hairline divider between CLI Quickstart and Templates, with generous vertical gap above and below the rule.**

A divider is appropriate here because the two sections are genuinely distinct in purpose: one is an instruction sequence (CLI steps), the other is a discovery affordance (template gallery). A divider signals "these are two different things," which is true, and does so without visual mass. A card container around each section is rejected: the `<Card>` guideline requires content to be a discrete object with stable identity, actionable as a unit, and sitting alongside peers of the same shape. Neither section is a discrete, action-able, peer-shaped object — they are structural zones of a single page. The card would add a border and bg-panel surface wrapping sections that already live on bg-panel, creating redundant layering. A hairline is the minimum signal to separate two zones of different purpose.

Compare the detail page: its tab content areas are not individually carded — sections within a tab are separated by spacing and sub-headings, not cards. Same pattern applies here.

**Persona reason:** Alex and Sam are reading this page linearly. A divider confirms "I have reached the end of one thing and the start of another" without requiring a visual jump to a new card surface.

---

### Decision 6: Templates section visual treatment

**HUD-side question:** Card surface, grid columns, hover affordance, and mono name — confirm or revise each.

**Card surface: Confirm `bg-panel` border-rounded with `brand/15` icon tile.**

The detail page uses `bg-panel` cards in the Scenarios tab for scenario cards — same surface convention. The template cards are forkable artifacts, not configuration rows; a bordered panel with an icon tile is the correct object-level container for something the user navigates to (GitHub). No revision.

**Grid columns: Revise from 1 / 2 / 3 to 1 / 2 / 2.**

Three columns at `lg` is appropriate when cards carry minimal content (icon + title only). These cards carry a two-line description (`line-clamp-2`). At three columns on a standard desktop viewport, each card is narrow enough that the two-line description becomes cramped and the icon tile loses breathing room. Two columns at `md` and `lg` gives the description room to breathe and improves legibility without sacrificing density. At `sm` / single-column, cards stack vertically.

**Hover affordance: Confirm `bg-hover` on the card container + ArrowUpRight graying-to-foreground.**

Locked 2026-06-11: operator chose to keep `bg-hover` fill, no brand-tinted border on hover. The existing hover (surface lifts to `bg-hover`, icon intensifies to `text-foreground`) is sufficient for a link-navigating card and avoids introducing a new color usage at this scope. The brand-tinted-border option remains available for a future revisit if hover legibility surfaces as an issue.

**Mono name: Confirm `font-mono text-body font-semibold`.**

Template names are repository identifiers (`hud-browser`, `trading-rl-env`) — they are slugs, not prose titles. Monospace rendering is semantically correct: it signals "this is an identifier you might type or reference" and is consistent with how the detail page renders the env slug in the descriptor strip.

**Persona reason:** Riley and Alex read template names as CLI handles — the mono rendering sets the right expectation before they click through to GitHub.

---

### Decision 7: CLI Quickstart visual treatment

**HUD-side question:** Numbered step chip rail, CodeBlock treatment, Alert semantic variant, and footer doc pointer — confirm or revise.

**Numbered step chip: Add a vertical hairline rail connecting the three step chips.**

Locked 2026-06-11 by operator. The current standalone chips (circular `bg-muted font-mono`) are visually isolated. When three steps form a numbered sequence, a vertical hairline running through the chip column — from below chip 1 to above chip 3 — visually links the steps as a chain and signals "these are ordered, connected." This is a structural cue, not a decorative one: it tells the reader that steps are sequential before they read the numbers. The hairline uses `border-border` and is rendered between chips only (not below chip 3 or above chip 1). No new tokens introduced.

**CodeBlock: Confirm.**

CodeBlock is already token-correct (`variant="block"`, `language="bash"`, `text-code` for inline references). No change.

**Alert variant: Revise from `warning` to `info`.** (Locked 2026-06-11 by operator.)

The current `variant="warning"` carries a semantic of "something might go wrong." The Alert content is an iteration-loop optimization tip — it is advisory, not cautionary. The user is not at risk of anything by not reading it; they are offered a faster workflow. The detail page uses `Alert variant="info"` for advisory content (deploy flags, SDK tips) in the same register. Using `warning` here creates a semantic mismatch: a user who reads "Iteration loop" under an amber/yellow warning signal may expect a failure mode, not a time-saving tip. `info` (neutral) is the honest read.

**Footer doc pointer: Confirm as inline text, not a "Related" sub-section.**

"See **Deploy & Go Remote** for deploy flags, secrets, and auto-deploy options." is one sentence. Elevating it to a sub-section header with link affordance creates structural weight disproportionate to its content. It is a trail marker, not a nav landmark. Inline text with the doc title in `font-medium text-foreground` (as currently implemented) is sufficient. If the linked doc surface grows to three or more references in the future, a "Related" sub-section earns its keep — not yet.

**Persona reason:** Alex reads code blocks and the iteration tip before running `hud deploy` for the first time. Info-register tip reads as helpful peer advice; warning-register tip reads as "I might break something" — the latter creates unnecessary friction at the step where Alex needs confidence, not caution.

---

### Decision 8: Non-goal explicit statement

**HUD-side question:** Should this page have any creation affordance — a "Create" button, a form, a dashboard fork operation?

**Choice: No creation affordance. This page has no form and no "Create" button.**

This page is a launcher / handoff surface. Templates navigate to GitHub (external link, new tab) — no HUD dashboard operation is triggered. The CLI Quickstart is reference content with copy-able code blocks — no wizard, no submit. The page does not create an Environment in HUD's data model. An environment is created when the user runs `hud deploy` locally — that is a CLI operation, not a dashboard one.

This constraint is stated explicitly so no engineer adds a "Create" button at implementation time. If a future product decision adds dashboard-side environment creation (a form that POSTs to the HUD API), that is a new wireframe, not a revision to this one.

**Persona reason:** Alex and Sam create environments from the CLI. A dashboard creation form would require mirroring all the configuration that `hud init` handles interactively — it would be a worse, incomplete wizard of a tool they already have.

---

## §1 Shared layout note

The `MAIN` region is the content area to the right of AppShell's persistent sidebar. This wireframe does not redraw the sidebar, credits widget, or user chip.

```
┌─────────────────────┬─────────────────────────────────────────────────────────┐
│  SIDEBAR (AppShell) │  MAIN                                                   │
│  [see app-shell     │                                                         │
│   wireframe.md]     │  [NEW ENVIRONMENT CONTENT — this file]                  │
│                     │                                                         │
└─────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## §2 Page header anatomy

Inherits the detail page's two-altitude header pattern: breadcrumb + title row + subhead. No descriptor strip (no resource-level metadata exists for this page). No sticky container (no tab strip below — see Decision 3).

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER  (not sticky)                                                       │
│                                                                                  │
│  Environments  /  New                                                            │
│  (breadcrumb — "Environments" links to /environments; "New" is plain text,       │
│   aria-current="page")                                                           │
│                                                                                  │
│  TITLE ROW                                                                       │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  Let's create your custom environment                                      │  │
│  │  (h1 / text-display / font-semibold / text-foreground)                    │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  The fastest path is the CLI — hud init — scaffolds a working environment in    │
│  seconds. Or fork a template repo below to start from a known-good shape.       │
│  (text-body / text-muted-foreground; "hud init" rendered text-code / font-mono) │
│                                                                                  │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│  (pb-6 breathing room below subhead — inherits detail page altitude)             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Breadcrumb:** `Environments` links to `/environments`. Breadcrumb separator is `›` (ChevronRight, `size-3`, `text-meta-foreground`). Current node "New" is plain text, `text-foreground`. Typography: `text-label`, `text-muted-foreground` for parent link (hover: `text-foreground`). Matches the detail page breadcrumb exactly.
- **Title h1:** `text-display font-semibold text-foreground`. Copy: "Let's create your custom environment" — verbatim, no change.
- **Subhead:** `text-body text-muted-foreground`. Inline `hud init` in `font-mono text-code`. Copy verbatim.
- **No descriptor strip:** This page is not a resource — there is no slug, no source label, no created date, no visibility pill. The slot is empty. The header ends at the subhead.
- **No right-slot CTA:** Nothing to act on at the header level. The CLI steps are the action; they live in the body.
- **Vertical gap:** `gap-3` between breadcrumb and title, `pb-6` below the subhead (matching `env-detail-header.tsx`). Current `pb-2` is revised to `pb-6`.

---

## §3 Page body

Single-column layout. No tab strip. Two sections separated by a `border-border` hairline divider (Decision 5). Section order: CLI Quickstart first, Templates second (Decision 1).

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PAGE BODY                                                                       │
│                                                                                  │
│  [ §4 CLI QUICKSTART SECTION ]                                                   │
│                                                                                  │
│  ── border-border hairline ────────────────────────────────────────────────────  │
│                                                                                  │
│  [ §5 TEMPLATES SECTION ]                                                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Vertical rhythm:** generous gap above and below the hairline divider. Consistent with the spacing between sections in the detail page's Overview tab body.

---

## §4 CLI Quickstart section anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SECTION: Get started with the CLI                                               │
│  (section, aria-labelledby="cli-heading")                                        │
│                                                                                  │
│  Get started with the CLI                                                        │
│  (h2 / text-subtitle / font-semibold / text-foreground)                          │
│  Three CLI commands from hud init to a remote eval.                              │
│  (text-label / text-muted-foreground; "hud init" font-mono text-code)            │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  ORDERED STEPS LIST                                                        │  │
│  │                                                                            │  │
│  │  [  1  ] │  Initialize                                                    │  │
│  │          │  (h3 / text-body / font-medium / text-foreground)               │  │
│  │          │  Spin up a new HUD environment from a CLI preset                │  │
│  │          │  (blank, browser, or deep-research):                            │  │
│  │          │  (text-label / text-muted-foreground)                           │  │
│  │          │  ┌─────────────────────────────────────────────────────────┐   │  │
│  │          │  │  # Choose preset interactively                          │   │  │
│  │          │  │  hud init                                               │   │  │
│  │          │  │  # Or jump straight to a preset                         │   │  │
│  │          │  │  hud init my-deep -p deep-research                      │   │  │
│  │          │  │  (CodeBlock variant="block" language="bash")            │   │  │
│  │          │  └─────────────────────────────────────────────────────────┘   │  │
│  │          │                                                                 │  │
│  │  [  2  ] │  Setup                                                         │  │
│  │          │  Install dependencies and wire up your HUD API key.            │  │
│  │          │  ┌─────────────────────────────────────────────────────────┐   │  │
│  │          │  │  uv sync                                                │   │  │
│  │          │  │  cp .env.example .env  ...                              │   │  │
│  │          │  │  hud set HUD_API_KEY=your-key-here ...                  │   │  │
│  │          │  └─────────────────────────────────────────────────────────┘   │  │
│  │          │                                                                 │  │
│  │  [  3  ] │  Deploy & Run                                                  │  │
│  │          │  Push the environment, sync your tasks, and run an eval:       │  │
│  │          │  ┌─────────────────────────────────────────────────────────┐   │  │
│  │          │  │  hud deploy .                                           │   │  │
│  │          │  │  hud sync tasks <taskset-name>                          │   │  │
│  │          │  │  hud eval <taskset-name> claude --remote --full         │   │  │
│  │          │  └─────────────────────────────────────────────────────────┘   │  │
│  │                                                                            │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  [i]  Iteration loop                                                       │  │
│  │       hud deploy is the slow step — run it once. After that, edit         │  │
│  │       tasks.py and re-run hud sync tasks (takes seconds). Only redeploy   │  │
│  │       when env.py or the Dockerfile changes.                               │  │
│  │  (Alert variant="info")                                                    │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  See  Deploy & Go Remote  for deploy flags, secrets, and auto-deploy options.   │
│  ("Deploy & Go Remote" in font-medium text-foreground; rest text-label           │
│   text-muted-foreground)                                                         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Section heading:** `h2 text-subtitle font-semibold text-foreground`. Section subhead: `text-label text-muted-foreground`. Copy verbatim.
- **Step chip:** Circular chip, `bg-muted`, `font-mono text-meta font-semibold text-muted-foreground`. Diameter sized to contain a single digit comfortably.
- **Vertical hairline rail:** A `border-border` vertical line runs through the chip column between chips 1–2 and 2–3. The line is absent above chip 1 and below chip 3. This visually chains the three steps as an ordered sequence without adding text. Token: `border-border`. Width: hairline (1px at implementation). This is a new structural element not present in the current code — it is additive, not a change to the chip itself.
- **Step label:** `h3 text-body font-medium text-foreground`.
- **Step description:** `text-label text-muted-foreground`.
- **CodeBlock:** `variant="block"` `language="bash"`. Token-correct as-is. All inline code references (`hud init`, `tasks.py`, `hud sync tasks`, `env.py`) use `font-mono text-code`.
- **Alert variant: `info`, not `warning`.** See Decision 7. The iteration loop tip is advisory, not cautionary. The detail page uses `Alert variant="info"` in the same advisory register.
- **Footer doc pointer:** Inline text. "Deploy & Go Remote" as `font-medium text-foreground` inline span. Surrounding text as `text-label text-muted-foreground`. No sub-section elevation.

---

## §5 Templates section anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SECTION: Start from a template on GitHub                                        │
│  (section, aria-labelledby="templates-heading")                                  │
│                                                                                  │
│  Start from a template on GitHub                                                 │
│  (h2 / text-subtitle / font-semibold / text-foreground)                          │
│  Fork or clone any of these to get a working HUD environment in seconds.         │
│  (text-label / text-muted-foreground)                                            │
│                                                                                  │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────────┐   │
│  │  TEMPLATE CARD                      │  │  TEMPLATE CARD                  │   │
│  │  ┌─────┐  hud-browser  [↗]          │  │  ┌─────┐  trading-rl-env  [↗]  │   │
│  │  │brand│  (font-mono   (arrow)      │  │  │brand│  (font-mono)           │   │
│  │  │ /15 │  text-body                 │  │  │ /15 │                        │   │
│  │  │icon │  font-semibold)            │  │  │icon │                        │   │
│  │  └─────┘                            │  │  └─────┘                        │   │
│  │  Browser automation scaffold with   │  │  RL trading environment …       │   │
│  │  Playwright integration and task    │  │  (text-label text-muted-         │   │
│  │  graders pre-wired. (line-clamp-2)  │  │   foreground line-clamp-2)      │   │
│  │  (text-label text-muted-foreground) │  │                                 │   │
│  └─────────────────────────────────────┘  └─────────────────────────────────┘   │
│  (bg-panel border-border rounded-lg — link navigates to GitHub, new tab)         │
│                                                                                  │
│  ┌─────────────────────────────────────┐                                         │
│  │  TEMPLATE CARD                      │                                         │
│  │  …                                  │                                         │
│  └─────────────────────────────────────┘                                         │
│                                                                                  │
│  Grid: 1-col at sm / 2-col at md / 2-col at lg                                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Section heading:** `h2 text-subtitle font-semibold text-foreground`. Subhead: `text-label text-muted-foreground`. Copy verbatim.
- **Grid:** `grid-cols-1 sm / grid-cols-2 md / grid-cols-2 lg`. Revised from the current `lg:grid-cols-3` (see Decision 6). Two columns gives the two-line description (`line-clamp-2`) adequate reading width; three columns at standard desktop width is too narrow for the description content.
- **Card surface:** `bg-panel border border-border rounded-lg`. On hover: `bg-hover` fill. Confirmed as-is (Decision 6). Brand-tinted border on hover is proposed as an open question for operator confirmation — not specified here.
- **Card header row:** Icon tile (`bg-brand/15 text-brand`, square rounded-md) + template name (`font-mono text-body font-semibold text-foreground`) + `ArrowUpRightIcon` (`text-meta-foreground`, on hover: `text-foreground`).
- **Card body:** Two-line description. `text-label text-muted-foreground line-clamp-2`.
- **Card is a link:** `<a href={repoUrl} target="_blank" rel="noopener noreferrer">`. Clicking navigates to the GitHub repository. This is the only action available — there is no "create in HUD" operation (see Decision 8).
- **Template name in mono:** Confirmed. Names are repository identifiers, not prose titles — mono is semantically correct.

---

## §6 States coverage

| State | Behavior |
|---|---|
| **Default** | Header + CLI Quickstart + divider + Templates, as specified above. No loading state — content is static. |
| **No templates configured** | Templates section shows an empty state: "No templates available." `text-label text-muted-foreground`. No card grid rendered. Section heading and subhead remain. |
| **Narrow viewport (< md)** | Template grid collapses to 1-col. Step chips and CodeBlocks go full-width. Page reads as a linear scroll. |

There is no form state, no loading state, no error state for user input — this page has no form and no submit action (Decision 8).

---

## §7 Explicit non-goals

- **No "Create Environment" button or form.** This page is a launcher, not a creation surface. Environments are created by `hud deploy` in the CLI. If engineering sees this spec and is tempted to add a Create CTA, see Decision 8.
- **No dashboard fork operation.** Template cards navigate to GitHub. There is no HUD API call behind a template click.
- **No wizard.** This is not an onboarding flow. Steps are reference content, not a stateful wizard with validation.
- **No status or progress indicator.** Nothing is running on this page. No polling, no WebSocket.
- **No breadcrumb to "New" as a child of a specific environment.** The breadcrumb reads `Environments / New` — "New" is a page-level destination, not a child of an existing env. This distinction matters for routing.
