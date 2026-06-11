# App Shell Layout — Sidebar, Topbar, Content Widths

**Scope:** Shell layout guidelines for the HUD portal `(app)/**` route group. Token values, font choices, and exact colors are NOT here — those live in the design foundations specs. The `(manage)/**` route group has its own shell and its own width rules; see that shell's spec.

**Peer set studied:** Linear, Vercel, Stripe, GitHub, Atlassian (Jira / Confluence), Notion, Ant Design Pro, MUI, Carbon, shadcn dashboard blocks, W&B, Datadog, Grafana.

---

## 1. Decision tree — which shell to use

Start at the top. Use the first match.

```
Does the product have ≥4 top-level destinations
  that users switch between many times per session?
  YES → Left sidebar (primary nav)

Is the product a single-purpose tool with ≤3 top-level destinations,
  or marketing-adjacent (landing, docs, billing-only)?
  YES → Topbar only

Does the product have deep hierarchy (workspace > project > resource)
  AND need a persistent global utility bar (account, search, env switcher)?
  YES → Sidebar + topbar (combined)

Is the primary surface a single document / canvas with peripheral tools?
  YES → Topbar + right inspector (no left sidebar)
```

### Summary

| Shell | Use when | Peer examples |
|---|---|---|
| **Left sidebar only** | Many top-level destinations; nav is the dominant action | Linear, Notion, Slack, VS Code |
| **Topbar only** | ≤3 destinations; marketing-adjacent; or org-level pages | Stripe (top-level), Vercel (marketing) |
| **Sidebar + topbar** | Enterprise SaaS with workspace switcher, search, account in topbar AND deep nav in sidebar | GitHub, Jira, Vercel dashboard, Stripe dashboard |
| **Topbar + right inspector** | Document / canvas tools where the artifact is primary | Figma, Notion (page view), Linear (issue detail) |

**Anti-patterns:**
- Sidebar with <4 entries → use topbar; the sidebar is dead weight.
- Topbar with >7 entries → switch to sidebar; topbar overflows on narrow viewports.
- Sidebar + topbar with duplicate destinations in both → pick one home for each destination.

---

## 2. Widths — the canonical values

All values in `px`. Tailwind utility shown where the value matches a default scale stop.

### Left sidebar (primary nav)

| State | Width | Notes |
|---|---|---|
| **Expanded (default)** | **240–280** (`w-60` to `w-72`) | 256 (`w-64`) is the modal value (Linear, Vercel, Stripe, Ant, shadcn). HUD portal implements 248px — within range, no change needed. |
| **Collapsed (icon rail)** | **52–64** (`w-13` to `w-16`) | Floor is 52 (fits a 40px icon button + 6px gutters). HUD portal implements 52px — matches this floor exactly, no code change needed. |
| **Wide (file tree / deep hierarchy)** | **280–320** (`w-72` to `w-80`) | Use only when the sidebar contains a tree, not a flat list. |

**Resizable?** Optional. If yes: persist per-user; clamp to [200, 400]. Most products don't bother.

### Topbar

| Style | Height | Notes |
|---|---|---|
| **Compact (utility bar)** | **48** (`h-12`) | Logo + search + account. No nav. |
| **Standard** | **56** (`h-14`) | Most enterprise dashboards. |
| **Tall (with tabs / breadcrumbs row)** | **64–96** | Reserve for products where breadcrumbs are load-bearing (GitHub). |

### Main content region (between sidebar and right inspector)

**Single uniform cap: `1536px` (`max-w-[1536px]`).**

Every `(app)/**` page uses one container at this width — dashboards, tables, traces, catalogs, and detail pages alike. No per-surface split.

**Rationale (HUD-specific):** HUD's three personas (Alex on trace/forensics, Sam on model comparison, Riley on bulk task authoring) all work at 1280–1440px laptops with a 248px sidebar, leaving ~1030–1190px of usable content width. At a 1920px external monitor the content region is ~1540px — wide enough for dense tables and trace timelines without artificial truncation. At 3440px ultrawide the cap prevents runaway line lengths. `max-w-7xl` (1280) clips those same trace and catalog surfaces on 1440px laptop + sidebar; fully fluid breaks on ultrawide. 1536 covers the full HUD surface set at every realistic viewport without a per-page override.

**Centering:** `mx-auto` on the container. Do not left-align against the sidebar — content drifts away from the user's focal point as viewport widens.

**Horizontal padding scale:**

| Breakpoint | Padding | Tailwind |
|---|---|---|
| `sm` (< 768px) | 16px | `px-4` |
| `md` (768px – 1023px) | 24px | `px-6` |
| `lg` (≥ 1024px) | 32px | `px-8` |

**Vertical padding:** page header top padding is `pt-10` (40px) — defined in §7, not here. Pages own their own vertical spacing; the shared container does not set it.

**Nested reading cap (forms and settings):** wrap form content in a second inner container at `max-w-2xl` (672px) or `max-w-3xl` (768px) inside the 1536 container. This is a layout-level inner wrapper, not the page container. Settings panels already use `max-w-2xl` / `max-w-3xl` — keep as-is.

**Tables wider than the container:** tables that naturally exceed the cap scroll horizontally inside the container (`overflow-x-auto` on the table wrapper). The page container stays at 1536 — the table does not break out of it. This is correct for HUD's surfaces: a trace log with 12 columns does not need to span 3440px; it needs a horizontal scroll track so every column is reachable without distorting the shell.

**Scope note:** This section governs `(app)/**` routes only. The `(manage)/**` route group uses a separate full-view-swap shell with its own width rules and is not covered here.

**Implementation:** Apply the cap **per-page**, not at the layout level. The shared `<main>` element in `AppShell` (`apps/portal/src/components/shell/app-shell.tsx`) is the scroll region — do NOT add any width wrapper there. The `<main>` element also carries the grid backdrop (see §9); the per-page cap container sits on top of it.

Pages that have a sticky page-header must keep the chrome **full-bleed** across `<main>` — the `sticky top-0 z-page-chrome bg-background border-b border-border` block spans the full scroll-region width so the background and border never clip on ultrawide viewports. Inside the sticky header, wrap the visible content (title, tabs, filters) with the cap class so it aligns with the body below:

```jsx
<div className="flex flex-col">
  {/* sticky header — chrome is full-bleed */}
  <div className="sticky top-0 z-page-chrome bg-background border-b border-border">
    <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 pt-10">
      {/* title, tabs, filters */}
    </div>
  </div>
  {/* body content */}
  <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 py-6">
    {/* page content */}
  </div>
</div>
```

Pages without a sticky header wrap their content directly in `mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8`. Pages own their own vertical padding in both cases.

### Right inspector / content sidebar

| State | Width | Notes |
|---|---|---|
| **Standard** | **320–400** (`w-80` to `w-96`) | Properties panel, filters, activity feed. |
| **Wide** | **480–560** | Issue detail, document inspector with rich content. |
| **Drawer (overlay, modal)** | **400–720** | Slide-over from right; up to 720 for editing-heavy flows. Atlassian-style. |

**Resizable?** Common for inspectors. Persist per-user; clamp to [280, 600].

---

## 3. Combined layouts — total width math

Use these to sanity-check that the shell fits at common breakpoints.

| Layout | Sidebar | Content cap | Inspector | Min viewport |
|---|---|---|---|---|
| Sidebar + content | 248 | 1536 | — | 1024 (sidebar collapses to 52px rail below this) |
| Sidebar + content + inspector | 248 | 1536 | 360 | 1640 (sidebar + cap + inspector at comfortable density) |
| Sidebar + topbar + content | 248 | 1536 | — | 1024 (same; topbar steals height not width) |

**Collapse rules:**
- Below **1024px**: collapse left sidebar to icon rail OR hide behind a hamburger.
- Below **768px**: hide sidebar entirely; switch to topbar + mobile drawer.
- Below **640px**: collapse right inspector behind a tab/drawer.

---

## 4. Density — when to tighten

Default values above target a 14px base font and standard density. For data-dense surfaces (telemetry, log views, dense tables):

- Sidebar: same width (240–280).
- Topbar: drop to compact (48).
- Content padding: 16 horizontal, 16 vertical.
- Content cap: 1536 (uniform — same as all other surfaces; wide tables scroll horizontally inside).
- Inspector: same width (320–400).

Do not narrow the sidebar to gain content width — users perceive narrower nav as "less product," and the saved pixels rarely matter at the content cap.

---

## 5. Quick reference — picking a width fast

| Question | Answer |
|---|---|
| Sidebar width? | **256** unless deep tree (then 280–320); HUD portal uses 248 — within range |
| Sidebar collapsed? | **52–64**; HUD portal uses 52 |
| Topbar height? | **56** |
| Content cap (all surfaces)? | **1536** (`max-w-[1536px]`) — uniform across dashboards, tables, traces, catalogs |
| Content cap on forms / settings? | **640–720** nested inside the 1536 container (`max-w-2xl` / `max-w-3xl`) |
| Right inspector width? | **360** standard, **480–560** for rich detail |
| When to use sidebar + topbar? | Enterprise SaaS with workspace switcher in topbar + deep nav in sidebar |
| When to drop the sidebar? | ≤3 destinations, or single-canvas tools |

---

## 6. Anti-patterns

- **Stretching content to full viewport on ultrawide monitors.** Line lengths exceed 120 characters; forms become unscannable. The uniform 1536 cap and `mx-auto` centering handle this — do not remove the cap for any surface type.
- **Applying the form cap (640) at the page level.** Wastes screen real estate; tables and dashboards need the 1280 container with the form cap nested inside.
- **Mixing fluid and capped content within the same screen without a clear hierarchy.** Pick one; nest the other.
- **Narrowing the sidebar to <200px to "save space."** Truncates labels; users misclick. If you need more content width, collapse the sidebar entirely (icon rail).
- **Topbar taller than 64px without breadcrumbs.** Wastes vertical space on laptop screens.
- **Right inspector wider than the main content.** Reverses the visual hierarchy; the inspector should always be secondary.

---

## 7. Page header vertical rhythm

**Rule:** All `(app)` page top padding is `pt-10` (40px), measured from the top bar border to the page title. One value. No role-based variation.

**Rationale:** A single value means the eye learns one resting position for page titles across every route in the shell. Landing/summary and catalog/data-table surfaces use the same value — this is stronger than role-derived nuance for a dense data product where the user is already context-aware.

**Peer benchmarks** (page-header top padding in peer enterprise dashboards):

| Product | Surface | Top padding |
|---|---|---|
| Linear | Inbox / Home | ~40–48px |
| Vercel | Projects dashboard | ~40px |
| GitHub | Dashboard | ~40px |
| Atlassian Jira | Your Work / Home | ~32–40px |

40px is the median value across the peer set. 24px appears in their *secondary list* pages (issue index, file browser) where the title is a way-finder, not a session anchor. HUD uses one value across both roles because a dense data product benefits from a consistent resting position more than from role-derived nuance.

**Other values on the header block** (do not change these):

- H1 → subtitle: `mt-1` (4px). Tight coupling so the subtitle reads as a direct modifier of the H1, not a separate element. They fuse into one display unit.
- Header block → first content section: `gap-8` (32px). Separates the title group from the content group. Large enough to signal a hierarchy break; small enough not to add ceremony to the transition.

---

## 9. Main scroll-region backdrop

### Visual effect

A subtle square-grid of hairlines sits on the `<main>` scroll region. The grid is **purely decorative** — mood, not measurement scaffolding. It must not compete visually with data; it should be perceptible at glance distance and disappear under any content block sitting on top.

Peer reference: Vercel dashboard landing (~80px grid, near-invisible on white); Linear app-shell has no grid. HUD is closer to Vercel in intent — the grid sets an engineering-tool register, not a productivity-app register.

---

### Block size

**80px square.**

Rationale: at the HUD target viewport (1280–1440px laptop, 248px sidebar → ~1030–1190px usable content width), 80px tiles 13–15 columns across. The pattern reads as ambient texture without resolving into a visible measurement grid. 64px starts to look like a ruler; 96px leaves too few repetitions at laptop width for the pattern to register. 80px is the same value Vercel uses on their dashboard background.

---

### Token

A single new semantic token `--color-grid-line` is declared in `packages/ui/src/styles/theme.css` inside the existing color-roles `@theme {}` block, under the Surfaces group:

```css
/* Grid backdrop — decorative hairline for the main scroll region.
 * Derivative of border-seed: same hue family as structural borders, alpha-only.
 * Light: 2% alpha dark seed over --surface-bg-light (#F6F8FA) → effective L≈0.97 OKLCH.
 * Dark:  1.5% alpha white seed over --surface-bg-dark (#0C1016) → effective L≈0.11 OKLCH. */
--color-grid-line: light-dark(
  rgb(var(--border-seed-light) / .02),
  rgb(var(--border-seed-dark)  / .015)
);
```

The token is a derivative of the existing `--border-seed-light` / `--border-seed-dark` primitives (already used by `--color-border` and `--color-border-strong`). Using `var()` derivation instead of hex literals keeps the grid line in the same hue family as structural borders and avoids silent drift if the seed changes — matching the derivative-tokens-no-hex-copy rule.

**Pending operator color confirmation.** This token must NOT be written to `theme.css` until the operator approves the alpha values above.

---

### CSS approach

**Linear-gradient pair** (not SVG). Two single-pixel gradients stacked via `background-image`, sharing one `background-size`. Fully token-driven, no inline SVG escape hatch, works cleanly with Tailwind v4 `@theme` utilities.

CSS applied to the `<main>` element in `apps/portal/src/components/shell/app-shell.tsx` (line 147):

```css
background-color: var(--color-background);
background-image:
  linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px),
  linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px);
background-size: 80px 80px;
```

Line weight is **1px** — the conventional grid hairline. No justification needed for deviation.

In Tailwind v4 class form on the `<main>` element:

```jsx
className="... bg-background [background-image:linear-gradient(to_right,var(--color-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line)_1px,transparent_1px)] [background-size:80px_80px]"
```

> Note for implementation: arbitrary `background-image` values cannot be expressed via Tailwind v4 `@theme` utilities — the two `[…]` arbitrary properties above are the correct Tailwind v4 approach. `background-color` stays `bg-background` (generated utility).

---

### Scroll behavior

**Default scroll** (no `background-attachment: fixed`). The grid scrolls with content. Rationale: HUD personas are in the UI for forensics and operations, not passive reading — `fixed` backgrounds create GPU compositing layers that cause jank during rapid scroll on trace and table surfaces. Default-scroll eliminates that class of perf risk entirely. The "viewport-fixed grid" Vercel landing effect is a marketing-page affordance; it reads as decorative friction on a data tool.

---

### Where it applies and where it does not

| Surface | Gets grid? | Reason |
|---|---|---|
| `<main>` in `AppShell` (`(app)/**`) | **Yes** | The entire scroll region right of the sidebar |
| Left sidebar (rail at 52px / expanded at 248px) | **No** | Uses `--muted-surface` + border treatments; grid would clash with rail icons |
| Mobile top bar (`MobileTopBar`, `bg-muted`) | **No** | Chrome strip, not a scroll region |
| `(manage)/**` shell | **No** | Separate shell, separate spec |

The grid is applied at the `<main>` level — it covers the entire scroll region including areas short pages leave empty below the fold, and the margins outside the centered content cap on ultrawide viewports (≥1920px). **This is intentional:** the empty side margins and the gaps between content blocks both show the grid. Page headers with `bg-background` cover the grid in their sticky chrome. Cards (`bg-card`, `bg-panel`) and other raised surfaces cover the grid beneath them. Empty space between content blocks remains visible — this is the desired effect, consistent with the decorative intent.

At ultrawide viewports (e.g. 3440px), the area beyond the 1536px content cap shows the grid pattern extending to both viewport edges. This is correct and desirable — it signals that the shell extends to the viewport without requiring a full-bleed content container.

---

### Light + dark mode behavior

| Mode | Background (`--color-background`) | Grid line (`--color-grid-line`) | Effective line lightness |
|---|---|---|---|
| Light | `#F6F8FA` (OKLCH L≈0.98) | `rgb(20 30 25 / .02)` | OKLCH L≈0.97 — barely above bg |
| Dark | `#0C1016` (OKLCH L≈0.09) | `rgb(255 255 255 / .015)` | OKLCH L≈0.11 — barely above bg |

Both modes maintain equivalent perceptual contrast between line and ground (~3 OKLCH lightness points). The dark-mode value is slightly warmer in effect (white seed over near-black) but the alpha is low enough that the tint is negligible.

---

## 8. References

- Linear — sidebar 240, content fluid (lists) / ~1024 (settings)
- Vercel dashboard — sidebar 256, content 1200 (`max-w-screen-xl`)
- Stripe dashboard — sidebar 240, content ~1200
- GitHub — sidebar ~296 (repo nav), content 1280 (`xl` container)
- Ant Design Pro — sidebar 256, content 1200
- shadcn dashboard blocks — sidebar 256, content 1280 (`max-w-7xl`)
- Atlassian (Jira / Confluence) — sidebar 240–280, content 1440 (boards) / ~1024 (issue view)
- Notion — sidebar 240, page content 708 default
- MUI / Carbon — drawer 240–256, content fluid (recommend ≤1440)
- W&B / Datadog / Grafana — sidebar 240, content fluid (dense telemetry)
