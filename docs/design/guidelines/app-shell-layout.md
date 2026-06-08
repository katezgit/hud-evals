# App Shell Layout — Sidebar, Topbar, Content Widths

**Scope:** Project-agnostic guidelines for B2B / enterprise SaaS dashboards. Token values, font choices, and exact colors are NOT here — those live in the implementation spec for each project. When forking this repo, update the project-specific spec but keep this file intact.

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
| **Expanded (default)** | **240–280** (`w-60` to `w-72`) | 256 (`w-64`) is the modal value (Linear, Vercel, Stripe, Ant, shadcn). |
| **Collapsed (icon rail)** | **56–64** (`w-14` to `w-16`) | 56 fits a 40px icon button + 8px gutters. |
| **Wide (file tree / deep hierarchy)** | **280–320** (`w-72` to `w-80`) | Use only when the sidebar contains a tree, not a flat list. |

**Resizable?** Optional. If yes: persist per-user; clamp to [200, 400]. Most products don't bother.

### Topbar

| Style | Height | Notes |
|---|---|---|
| **Compact (utility bar)** | **48** (`h-12`) | Logo + search + account. No nav. |
| **Standard** | **56** (`h-14`) | Most enterprise dashboards. |
| **Tall (with tabs / breadcrumbs row)** | **64–96** | Reserve for products where breadcrumbs are load-bearing (GitHub). |

### Main content region (between sidebar and right inspector)

| Pattern | Max width | Use for |
|---|---|---|
| **Standard cap** | **1200–1280** (`max-w-7xl`) | Default for dashboards. Modal value across peer set (Vercel, Stripe, Ant, shadcn, GitHub). |
| **Wide cap** | **1440** | Boards, timelines, Gantt views (Jira). |
| **Fluid (no cap)** | full available width | Data-dense surfaces: tables with many columns, traces, observability, log views. Linear lists, W&B, Datadog, Grafana. |
| **Reading cap (nested inside above)** | **640–720** (`max-w-prose` / `max-w-2xl`) | Forms, settings panes, long-form docs. Apply as an *inner* cap, not as the page cap. |

**Centering:** center the content region inside its container (`mx-auto`) so the cap behaves predictably on ultrawide monitors. Do not left-align against the sidebar — text drifts away from the user's cursor as viewport widens.

**Padding inside the content region:** **24–32** (`px-6` to `px-8`) horizontal, **24–40** vertical. Tighter (16) is acceptable for data-dense screens.

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
| Sidebar + content | 256 | 1280 | — | 1536 |
| Sidebar + content + inspector | 256 | 1024 | 360 | 1640 |
| Sidebar + topbar + content | 256 | 1280 | — | 1536 (same; topbar steals height not width) |
| Sidebar + content (fluid) | 256 | — | — | 1024 (sidebar collapses below this) |

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
- Content cap: fluid.
- Inspector: same width (320–400).

Do not narrow the sidebar to gain content width — users perceive narrower nav as "less product," and the saved pixels rarely matter at the content cap.

---

## 5. Quick reference — picking a width fast

| Question | Answer |
|---|---|
| Sidebar width? | **256** unless deep tree (then 280–320) |
| Sidebar collapsed? | **56–64** |
| Topbar height? | **56** |
| Content cap on dashboards? | **1280** (`max-w-7xl`) |
| Content cap on tables / traces? | **Fluid** |
| Content cap on forms / settings? | **640–720** nested inside the dashboard cap |
| Right inspector width? | **360** standard, **480–560** for rich detail |
| When to use sidebar + topbar? | Enterprise SaaS with workspace switcher in topbar + deep nav in sidebar |
| When to drop the sidebar? | ≤3 destinations, or single-canvas tools |

---

## 6. Anti-patterns

- **Stretching content to full viewport on ultrawide monitors.** Line lengths exceed 120 characters; forms become unscannable. Cap at 1280 and center.
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
