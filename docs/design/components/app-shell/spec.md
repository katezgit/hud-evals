# App-shell — component spec

**Phase:** `components` (foundation carve-out from `wireframes`)
**Date:** 2026-05-29
**Author:** product-designer
**Status:** v4 — operator-directed revision (active-nav color treatment)

---

## What this spec covers

The persistent chrome that wraps every authenticated portal page:
- Header bar (brand mark, `+ New` menu, avatar)
- Sidebar (zone labels, nav items with icons, footer utility links)
- Main content area (padding, scroll, max-width)

It does NOT cover per-page content, route-level tabs, or empty states. Those are screens-phase artifacts.

---

## Counterexample — what the current implementation gets wrong

Read this before reading the spec. The current commit (`13f527e`) is the anti-pattern.

**Active state.** `bg-secondary text-foreground font-medium` — `--color-secondary` is `--neutral-150`, a 3% luminance delta from hover (`--neutral-150` is hover too). The active item and hovered item are visually indistinguishable at a glance. `aria-current="page"` exists in the DOM but does nothing visual beyond what the class already expresses. An item that is "you are here" must read as structurally different from "you could go here." One-weight-bump + same-background is not structurally different.

**Surface.** Header and sidebar both use `bg-background` (`--neutral-50`). The entire chrome plane is one uniform wash. No depth, no plane separation. The sidebar has a right border (`border-border`) as its only separator — functional but declares "I am a box next to another box," not "I am a navigation instrument."

**Colors.** Brand color (`--gold: #f7b717`) appears nowhere. Not one semantic accent anywhere in the shell except the `+ New` button fill which is `--neutral-950` (near-black primary). Correct for the button. But the shell itself is a monotone: five shades of cool grey. There is no HUD identity in the chrome.

**Spacing.** Zone label → first nav item gap is 4px (`gap-1` in the container, 0.5 between items). Zone-to-zone gap is `gap-6`. These are correct values in isolation but the ratio is arbitrary — there's no declared rhythm rule; the numbers don't read as a system.

**Brand mark.** `H` in an `md` rounded square + "HUD portal" text. The square is `bg-primary` (`--neutral-950`). Dark square on `--neutral-50` background. Reads as a favicon placeholder. No craft, no intent. "HUD portal" as label text is developer naming, not product naming.

**Header height.** `h-12` = 48px. Fine for density. But the header background is identical to the body background — the only border is `border-b border-border`. Aman glances at the top of every page. The header plane should read as a distinct surface, not a top strip of the same wash.

---

## v3 Spec

### 1. Layout geometry

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER  h-11 (44px) — surface: bg-muted                     │
├──────────┬───────────────────────────────────────────────────┤
│ SIDEBAR  │ MAIN CONTENT AREA                                 │
│ w-[240px]│ flex-1, overflow-y-auto                           │
│ overflow │ padding: 24px (top) × 32px (sides)               │
│ -y-auto  │                                                   │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

- **Header height:** 44px (`h-11`). Dense. One step below the current 48px — removes the slack that made it look unintentional.
- **Sidebar width:** 240px. Low end of B2B enterprise norm (240–280px). Enough for all nav labels without truncation. Does not compete with content at 1280+ viewport.
- **Sidebar surface:** darker than `--color-background`. See Surface Treatment below.

---

### 2. Surface treatment and color

The shell needs two distinct planes. HUD's content surfaces are `--color-background` (`--neutral-50`, off-white). The shell — header + sidebar — sits one step darker, creating the plane separation that tells Aman "this is instrument, not content."

**Sidebar + Header surface:** `bg-muted` (Tailwind utility generated from `--color-muted`, which resolves to `--neutral-100`, `#f0f0f3`)

No new token. `--color-muted` already exists in `@theme` and generates the `bg-muted` utility. The semantic fit is exact: "muted" means a subdued, non-focal surface — precisely what persistent chrome is. It frames the content area; it does not foreground itself. The delta from `--neutral-50` (background) to `--neutral-100` (muted) is 9 luminance points — visible at a glance, not jarring.

`--color-card` and `--color-popover` both resolve to `--surface-card` (`#fcfcfd`), which is *lighter* than `--neutral-50` — wrong direction for a shell that needs to sit darker than content. `--color-secondary` resolves to `--neutral-150` — a 4-step jump that would make the sidebar noticeably dark for a large persistent plane. `--color-muted` at `--neutral-100` is the correct one-step darker shell surface.

**Header border-bottom:** `--color-border` (`--neutral-200`). Same border that divides sidebar from content.

**Sidebar right border:** `--color-border`. Matches header bottom — consistent single-line plane boundary.

**Content area background:** `--color-background` (`--neutral-50`). Lighter than sidebar — content floats above the instrument plane.

**Gold accent — where it appears:**
`--color-brand` (`--gold: #f7b717`) appears in exactly one shell location: the brand mark dot. Nowhere else in chrome. Gold is brand decoration only — per the hard rule in `packages/ui/src/styles/color.css`. It is not a state indicator. The active nav state uses `--color-foreground` (`--neutral-950`) for both the bar and the icon.

---

### 3. Header chrome

**Height:** 44px (`h-11`)
**Surface:** `bg-muted` — same as sidebar, visually fused with it on the left
**Bottom border:** `border-b border-border`
**Horizontal padding:** `px-3` on left (sidebar edge alignment), `px-3` on right

### 3a. Brand mark

Left edge of header, vertically centered via `items-center` on the header flex row.

**Composition:** notched-viewport SVG mark + gold dot + wordmark

```
[▣·]  HUD
```

The mark is a **notched viewport frame**: a hollow rectangular frame (`fill-rule="evenodd"`) with the top-right corner removed. The notch is 4px wide × 4px tall at the SVG's 16-unit coordinate system. This produces a frame that is asymmetric by geometry — the missing corner prevents radial-symmetry read and makes the mark instrument-like rather than institutional. The shape evokes the HUD concept (heads-up display = an instrumented viewport) without using a letterform.

**SVG path data (canonical):**
```
d="M12 0H0V16H16V4H12V0ZM13 4H3V13H13V4Z"
```

`fill="currentColor"` — inherits `text-foreground` (`--neutral-950`). No fill color specified on the element; the mark itself must NEVER be gold.

**Gold dot:** `size-1` (4px) `rounded-full` `bg-brand` circle. Positioned `absolute -top-0.5 -right-0.5` on a `relative` wrapper div that contains the SVG. This places the dot at the top-right corner of the mark bounding box — the corner that the notch opens. The dot appears to anchor the notch, not float randomly. The gold dot is the only chromatic element in the lockup and in the shell. Per `color.css` hard rule, gold is brand decoration only — it does not appear in any nav state indicator.

**Wordmark:** `font-mono text-label font-medium tracking-widest text-muted-foreground`. Text: `HUD`. Uppercase. Not "HUD portal." Gap from mark: `gap-2` (8px).

**Render sizes:**
- Expanded (lg+ sidebar, drawer header): mark `size-5` (20px), wordmark visible
- Collapsed (md icon rail): mark `size-4` (16px), wordmark hidden (`null`)

The whole lockup container is an `aria-label="HUD"` div (not a link — the brand mark is an identity anchor, not a home button). The SVG carries `aria-hidden="true"`; the wordmark span carries `aria-hidden="true"`. The container's `aria-label` is the accessible name.

`needs token: none — text-foreground, bg-brand, text-muted-foreground all in @theme`

#### 3b. `+ New ▾` button

Right side of header, `gap-3` from avatar.

Uses the existing `Button variant="primary" size="sm"` — `bg-primary` (`--neutral-950`), `text-primary-foreground`. Correct and intentional: the only filled CTA in the chrome is the creation action. No change from current implementation.

Menu trigger text: `New` (no `+` prefix needed — the `PlusIcon` carries that signal). Keep `PlusIcon size-3.5` + `ChevronDownIcon size-3.5`.

Dropdown items: Environment / Taskset / Eval Job / Training Job — as per approved IA.

#### 3c. Avatar

Rightmost element. `Avatar size="sm"`. `AvatarFallback` with first initial. Link to `/manage`.

Wrapping `Link` gets focus-visible ring via global base.css rule (`outline-color: --color-ring`). No additional ring class needed.

---

### 4. Sidebar

**Width:** `w-[240px]` (prop override of `w-60` which is 240px — same value, but name the intent)
**Surface:** `bg-muted` — fused with header
**Right border:** `border-r border-border`
**Scroll:** `overflow-y-auto` on the nav flex container; sidebar itself is `flex flex-col h-full`
**Padding (nav container):** `pt-3 pb-3 px-2` — tighter horizontal than current `p-3`. Nav items touch the sidebar edges with only 8px guard on each side; no unnecessary inner box.

#### 4a. Zone label

Appears above each nav group: "WORKSPACE" and "MANAGE".

- **Font:** `text-label` (12px)
- **Weight:** `font-medium`
- **Case:** uppercase (`uppercase`)
- **Color:** `text-meta-foreground` (`--neutral-400`)
- **Letter-spacing:** `tracking-wider` — nav-proposal I-06 calls out that the current rendering looks right; keep it
- **Padding:** `px-2 py-1.5` — the 2px x-align ensures zone label left edge matches nav item text
- **Spacing above zone (gap between zones):** `mt-5` on the second zone's wrapper div. Not `gap-6` between zones — `gap-6` is 24px which pads excessively for dense sidebar. 20px (`mt-5`) is the correct inter-zone gap.
- **Spacing below zone label (before first item):** `mt-0.5` — 2px. The label is already padded; a hairline gap closes the visual relationship without pushing the item away. No `<Separator>` between nav zones. Zone-to-zone boundary is expressed by gap alone (20px `mt-5` on the second zone wrapper). The separator at §4e (below the last nav zone, before utility footer) is the only inter-group rule in the sidebar. Adding a Separator between WORKSPACE and OBSERVE is a spec violation.

**No separator between brand mark and first zone.** The brand mark and nav zones share one instrument plane (§2). Visual separation is produced by the brand mark's own `py-4` and the nav container's `pt-3` — no `Separator` is inserted above the WORKSPACE zone label. The §4e divider earns its presence because it marks a real categorical shift (page nav → external utility); brand-to-nav is not that kind of boundary. Applies identically in lg+ sidebar, md icon rail, and mobile drawer.

#### 4b. Nav item — state matrix (PRIMARY SPEC)

This is the load-bearing decision. The active indicator is a **left-edge accent bar** — a **4px** vertical stripe in `--color-foreground` (`--neutral-950`, near-black) — combined with a `font-medium` weight bump. No gold in state indication; gold is reserved exclusively for the brand mark dot.

**Why 4px near-black, not 2px gold:**
- Gold is out per `color.css` hard rule. It is brand decoration only.
- `--brand-blue` (`#4a7a96`) is the focus-ring token. Using the same color for the active bar creates a state-machine collision: a focused-but-not-active item and an active item would share the same visual color. Incorrect.
- `--color-foreground` (`--neutral-950`) carries the semantic "definitive, present, maximum weight" — which is what "you are here" means. It has no other assignment in the nav interaction state space. Against `bg-muted` (`--neutral-100`), near-black produces maximum contrast; the bar reads at peripheral vision without color literacy.
- Widening from 2px to 4px doubles the visual mass. At 4px, the bar is a bold structural mark, not a subtle hairline. Shape + weight does the work that color was previously doing.

**Active vs hover separation strategy:**
- **Hover:** `bg-hover` (`--neutral-150`) + `text-foreground` + `text-foreground` icon. No bar. No weight bump.
- **Active:** `bg-secondary` (`--neutral-150`) + `text-foreground` + `text-foreground` icon + **4px near-black bar** + `font-medium`.
- The background values are identical between hover and active — that is intentional. The separation is structural (bar presence) and typographic (font-weight bump). The bar is present or absent; there is no gray zone. A hovering-but-not-active item cannot look like an active item because it has no bar and no weight.

**Dimensions:**
- Height: `h-8` (32px) — current is also `h-8`, correct for dense B2B
- Left padding: `pl-8` on the label (to clear the icon), right padding: `pr-2`
- Icon area: `w-4` (`size-4`), positioned with `pl-2` from item left edge
- Border-radius: `rounded-md` (`--radius-md`, 6px) — on the item background, NOT the stripe; the stripe itself is `rounded-none` on the item's left edge
- Width: `w-full` minus `px-2` outer container padding on each side = item fills to 224px (240 − 8 − 8)

**State matrix:**

| State | Background | Text color | Icon color | Left edge | Weight |
|---|---|---|---|---|---|
| **default** | transparent | `text-muted-foreground` (`--neutral-500`) | `text-muted-foreground` | none | `font-regular` (400) |
| **hover** | `bg-hover` (`--neutral-150`) | `text-foreground` (`--neutral-950`) | `text-foreground` | none | `font-regular` |
| **focus-visible** | `bg-hover` | `text-foreground` | `text-foreground` | none | `font-regular` — focus ring via global rule |
| **active** | `bg-secondary` (`--neutral-150`) | `text-foreground` (`--neutral-950`) | `text-foreground` (`--neutral-950`) | 4px solid `--color-foreground` (near-black) | `font-medium` (500) |
| **active + hover** | `bg-selected` (`--neutral-200`) | `text-foreground` | `text-foreground` | 4px solid `--color-foreground` | `font-medium` |
| **pressed** | `bg-selected` (`--neutral-200`) | `text-foreground` | `text-foreground` | 4px solid `--color-foreground` | `font-medium` |

The left-edge bar is implemented as a `::before` pseudo-element (CSS) or as a `div` positioned absolutely on the left edge of the item. The bar spans the full item height (32px). It is clipped by `overflow-hidden` on the item wrapper to respect `rounded-md`. The bar does not bleed into the sidebar border.

**Icon active-state reasoning:** In the active state, the icon is `text-foreground` (`--neutral-950`) — same as the bar, same as the text. All three signals (bar, icon, label) are the same near-black token. The active item reads as fully saturated, maximum-weight. Default state uses `text-muted-foreground` (`--neutral-500`) for both icon and label — low weight, stepping back. Hover lifts both to `text-foreground` without adding any structural indicator. The step from hover to active is purely structural (the 4px bar appears, the weight bumps) — color does not change between hover and active text/icon. This makes the state change legible even for users who cannot distinguish subtle color differences.

**Structural implementation note for engineering:**

The item wrapper needs `relative overflow-hidden` to contain the bar. The bar is an absolutely-positioned left-edge element: `absolute left-0 inset-y-0 w-1 bg-foreground`. Visible only in `active` and `active+hover` states. (`w-1` = 4px.)

Nav item layout: `flex items-center gap-2 pl-2 pr-2` with the icon as the first child (`size-4`, flex-shrink-0) followed by the label text.

`needs token: none — uses --color-secondary (--neutral-150) for active bg, --color-selected (--neutral-200) for active+hover, --color-foreground (--neutral-950) for bar + active icon, --color-hover (--neutral-150) for hover bg, --color-muted (--neutral-100) for shell surface`

Note: `--color-hover` and `--color-secondary` both resolve to `--neutral-150`. This is intentional — hover and active-background are the same base, but the active state's 4px bar and font-medium weight make them structurally distinct regardless of color.

#### 4c. Nav items — full list per approved IA

Icon system: `lucide-react` (existing dep in `apps/portal/package.json`). Icon size: `size-4` (16px). All icons are `flex-shrink-0`.

**WORKSPACE zone:**

| # | Label | Route | Lucide export | Reasoning |
|---|---|---|---|---|
| 1 | Jobs | `/jobs` | `PlayCircle` | A job is an execution run — something that ran or is running. `Briefcase` is HR-corporate. `Activity` is a chart line. `PlayCircle` maps to Aman's mental model: "I kicked off a run." |
| 2 | Tasksets | `/tasksets` | `ListChecks` | A taskset is a structured list of eval tasks. `ListChecks` is literal and correct — no metaphor required. |
| 3 | Environments | `/environments` | `Box` | A sandbox compute environment = an enclosed, isolated container. `Box` is the direct mental model. `Server` is hardware-connotation; `Container` doesn't exist in lucide as a clean form. |
| 4 | Models | `/models` | `BrainCircuit` | A trained ML model = a neural network. `BrainCircuit` is ML-specific. Not `Database` (storage) or `Cpu` (compute hardware). |
| 5 | Agents | `/agents` | `Bot` | Aman's agent is an autonomous program. `Bot` is the direct, unambiguous term. No metaphor needed. |
| 6 | Library | `/library` | `BookOpen` | Asset reuse / saved artifacts library. `BookOpen` is library-native. Not `Archive` (archived = dead) or `Folder` (generic filesystem). |

**MANAGE zone:**

| # | Label | Route | Lucide export | Reasoning |
|---|---|---|---|---|
| 7 | Manage | `/manage` | `Settings2` | Org/team/billing settings. `Settings2` is the less-heavy variant (sliders form) vs `Settings` (gear). For a manage panel entry point, the sliders form reads as "configuration" more precisely than a gear icon. |

Active state logic: `pathname === href || pathname.startsWith(href + "/")` — current implementation is correct.

#### 4d. Tag chips ("root", "promoted")

The nav-proposal does not place tag chips on sidebar nav items. The sitemap mentions them only in the context of Jobs and Models/Library page content (sub-page data chips, not sidebar chrome). **Tag chips do not appear in the sidebar nav.** If a future IA decision adds them, this spec must be updated.

If tag chips are needed per nav item at screens phase (e.g., a "beta" label on Agents), they use:
- `Badge` component — existing primitive
- `variant="outline"` or a new `variant="subtle"` if needed
- `text-caption` (12px), `font-regular`, `text-muted-foreground`
- `px-1.5 py-0` — tight, not decorative
- Max one chip per item. No stacking.

#### 4e. Sidebar divider + utility footer

Below the MANAGE zone, a horizontal separator demotes external links from primary nav:

**Divider:** `Separator` component (existing), `mx-2` for inset, `my-3` for vertical breathing room. Color: `bg-border` (`--neutral-200`). The separator signals "these next items are not page nav."

**Footer items — Marketplace ↗ and Docs ↗:**

Text-only. No leading icon. The trailing `↗` arrow chip already carries the semantic load ("this opens externally"). A leading icon would be a second signal competing with the first, and at `text-label` (12px) size the row height cannot absorb both without inflating. The demotion is expressed through size and color, not icon absence — these items are explicitly secondary.

- Height: `h-7` (28px — 4px less than nav items; intentional demotion)
- Background: transparent at default; `bg-hover` on hover
- Text: `text-label` (12px — one step below body), `text-meta-foreground` (`--neutral-400`; secondary muted, not primary muted — further demoted)
- Hover text: `text-muted-foreground` (`--neutral-500`) — still below nav item default color
- Trailing icon: `ArrowUpRightIcon size-3` (current is `size-3.5` — reduce by 1 unit to match the label downscale)
- `px-2` horizontal padding — aligns with nav items
- `rounded-md` — consistent with nav items
- Open in new tab: `target="_blank" rel="noreferrer"` — current implementation is correct
- No focus ring override — global rule handles it

The footer section has `pt-0` (the separator's `my-3` provides spacing above). The footer items themselves have `gap-0.5` (2px) between them — tight, because they're demoted chrome, not primary navigation.

---

### 5. Main content area

**Left padding:** none — content touches the sidebar border directly. Pages own their own internal padding.
**Internal page padding:** `p-6` (24px all sides) applied by the page, not the shell. Shell provides `<main className="flex-1 overflow-y-auto">` only.

Rationale: If the shell applies `p-6`, every page that needs edge-to-edge content (a full-bleed table, a trace viewer) must fight the shell padding. Content owns its padding; shell owns its scroll container.

**Max-width:** None in the shell. Pages that benefit from max-width constrain themselves (e.g., a settings form at `max-w-2xl`). Tables, trace viewers, and training-curve dashboards need full width. Shell max-width would require every content page to override it.

**Responsive shell note (2026-06-10):** The responsive shell (sm drawer / md icon rail / lg+ sidebar) does not change this policy. At no breakpoint does `<main>` apply a max-width or centering wrapper. At `md` with a 52px icon rail, usable width is ~716px — no cap is needed or applied. At `lg+` with the full 248px sidebar, full remaining width is available to the page. Pages that display narrow forms (profile, organization settings) own their own `max-w-*` constraint on their content wrapper. ManageShell remains a separate exception: its main region applies `max-w-3xl mx-auto px-8 py-8` directly, owned by the manage layout, not by AppShell.

**Overflow:** `overflow-y-auto` on `<main>`. The sidebar also has its own `overflow-y-auto`. Both scrollbars use the global custom scrollbar styling (`--color-border-strong` track thumb).

---

### 6. Typography scale per region

| Region | Token | Size | Weight | Color token |
|---|---|---|---|---|
| Brand glyph `H` | `text-subtitle` | 15px | `font-semibold` | `text-foreground` |
| Brand name `HUD` | `text-label` | 12px | `font-medium` | `text-muted-foreground` |
| Zone label | `text-label` | 12px | `font-medium` | `text-meta-foreground` |
| Nav item (default) | `text-body` | 14px | `font-regular` (400) | `text-muted-foreground` |
| Nav item (active)  | `text-body` | 14px | `font-medium` (500)  | `text-foreground` / `text-primary` |
| Footer item | `text-label` | 12px | `font-regular` | `text-meta-foreground` |
| `+ New` button | uses Button component defaults | — | — | — |

---

### 7. Spacing rhythm

The scale is the 4px grid (`--spacing: 0.25rem`). Named rules:

| Rule | Value | Applies to |
|---|---|---|
| **Icon unit** | 4px (`gap-1`) | spacing within a compound element (glyph + dot) |
| **Item internal** | 8px (`gap-2`) | icon-to-label gap within nav item |
| **Item h-padding** | 8px (`px-2`) | nav item horizontal padding; zone label x-align |
| **Item gap** | 2px (`gap-0.5`) | consecutive nav items; footer items |
| **Sidebar outer** | 8px (`px-2`, `pt-3`, `pb-3`) | nav container sides and cap |
| **Zone gap** | 20px (`mt-5`) | second zone's top margin from first zone's last item |
| **Zone label bottom** | 0px (`pb-0`) | zone label container bottom padding; 2px gap comes from `mt-0.5` on the `<ul>` |
| **Header h-padding** | 12px (`px-3`) | header left and right |
| **Header right cluster gap** | 12px (`gap-3`) | NewMenu → Avatar |
| **Footer separator** | 12px (`my-3`) | Separator vertical margin |
| **Footer item gap** | 2px (`gap-0.5`) | between Marketplace and Docs |

The ratio between item-gap (2px) and zone-gap (20px) is intentional: siblings read as a group, zones read as separate instruments.

---

### 8. Spacing and sizing — explicit values

| Element | Property | Value | Px |
|---|---|---|---|
| Header | height | `h-11` | 44px |
| Sidebar | width | `w-[240px]` | 240px |
| Nav item | height | `h-8` | 32px |
| Nav item | border-radius | `rounded-md` | 6px |
| Nav icon | size | `size-4` | 16px |
| Icon-to-label gap | gap | `gap-2` | 8px |
| Active bar | width | `w-1` | 4px |
| Active bar | height | full item height | 32px |
| Footer item | height | `h-7` | 28px |
| Zone label | padding-x | `px-2` | 8px |
| Zone label | padding-y | `py-1.5` | 6px |
| Nav container | padding-x | `px-2` | 8px |
| Nav container | padding-y top | `pt-3` | 12px |

---

### 9. Client island boundaries

Only two components require `"use client"`:

1. **`NewMenu`** — uses `DropdownMenu` (disclosure state, click handler). Current implementation is correctly client.
2. **`SidebarNavLink`** — uses `usePathname()` to compute `isActive`. Current implementation is correctly client.

Everything else in the layout — the `AppLayout` server component, `NavZone`, the footer anchor elements — is server-rendered. No `usePathname` in the server layout; active state computation lives entirely in `SidebarNavLink`.

Do NOT make `NavZone` a client component to pass active state top-down. That direction — lifting pathname detection — would make the entire layout tree client-side and break streaming. Each `SidebarNavLink` detects its own active state independently.

---

### 10. Token list — complete reference

All tokens used in this spec. Engineers reference this list; no other values are valid.

**No new tokens required.** All shell tokens are existing `@theme` entries.

**Colors:**
- `--color-background` (`--neutral-50`) — content area background
- `--color-muted` (`--neutral-100`) — header + sidebar instrument plane (`bg-muted`)
- `--color-foreground` (`--neutral-950`) — nav item active/hover text, brand glyph
- `--color-muted-foreground` (`--neutral-500`) — nav item default text, brand name
- `--color-meta-foreground` (`--neutral-400`) — zone labels, footer items
- `--color-hover` (`--neutral-150`) — nav item hover background
- `--color-secondary` (`--neutral-150`) — nav item active background (same value as hover — bar + icon color are the differentiators)
- `--color-selected` (`--neutral-200`) — nav item active+hover background
- `--color-border` (`--neutral-200`) — sidebar right border, header bottom border, separator
- `--color-brand` (`--gold: #f7b717`) — brand mark dot only (decoration, not state)
- `--color-primary` (`--neutral-950`) — `+ New` button fill (via Button component)
- `--color-primary-foreground` (`--surface-card`) — `+ New` button text (via Button component)
- `--color-ring` (`--focus-ring`) — focus ring (via global base.css)
- `--color-ring-glow` (`--focus-glow`) — focus shadow (via global base.css)

**Typography:**
- `--text-subtitle` (15px) — brand glyph
- `--text-label` (12px) — zone label, brand name, footer items
- `--text-body` (14px) — nav items

**Spacing:** 4px grid throughout. Named values in §8.

**Radius:**
- `--radius-md` (6px) — nav items, footer items

---

## Critique notes

### Pass 1 — v1 self-roast

**Defect: active bar vs hover look-the-same problem wasn't solved, just renamed.** v1 said "active background = `--color-secondary`, hover = `--color-hover`" — both resolve to `--neutral-150`. I called that intentional but didn't validate that the bar alone suffices. Validation: a 2px gold stripe against a `--neutral-150` background is a shape change, not just a color change. It will read at peripheral. The bar is 2px wide against a 240px sidebar — it's not subtle; it's precise. PASS.

**Defect: zone label gap was `gap-6` (inherited from current) — arbitrary.** Fixed: replaced with `mt-5` (20px) on the second zone and documented the ratio rule (2px sibling gap : 20px zone gap). The rule is: siblings belong to the same instrument; zones are separate instruments. The ratio is 1:10. PASS.

**Defect: sidebar surface was left as `bg-background`.** v1 draft still used `bg-background` for the sidebar. This was the same mistake as the current implementation — no plane separation. Fixed: use `bg-muted` (`--color-muted`, `--neutral-100`). PASS.

**Defect: brand mark was still a placeholder.** v1 had the rounded square removed but the gold dot was described vaguely as "brand mark accent." Tightened to: 4px circle, `bg-brand`, top-third position relative to `H` cap height, implemented as a `size-1 rounded-full` element. PASS.

**Defect: footer items had no explicit height demotion.** v1 said "slightly smaller" — hedging. Fixed: `h-7` (28px) vs nav items `h-8` (32px). 4px demotion. Explicit. PASS.

**Defect: "HUD portal" as product name.** v1 still said "text: HUD portal". The portal IS hud.ai — there is no sub-product. Fixed to `HUD` (uppercase, 3 characters). PASS.

### Pass 2 — v2 self-roast

**Defect: `--color-sidebar` is not in `components.css` — it's proposed but not located.** v2 resolved this by introducing a new token. v3 resolves it by eliminating the new token entirely and using `--color-muted` directly. No new file edit needed in `components.css`. PASS.

**Defect: Does the spec say anything meaningful about the `main` padding handoff?** v1/v2 said "pages own their padding" but didn't justify why. Added rationale: full-bleed content (trace viewer, tables) can't fight shell padding; shell must be a transparent scroll container. PASS.

**Defect: Typography table was missing font-regular for nav default.** Fixed: added `font-regular (400)` explicitly. Active state gets `font-medium (500)`. PASS.

**Defect: Is the gold bar actually HUD identity or is it borrowed from VS Code?** HUD's brand color is gold. The bar is the primary appearance of brand color in the shell. The bar's job is to say "you are here" — not "I am styled like VS Code." The form (left-edge bar) is borrowed; the color (gold) is HUD's own. The combination is not a copy. PASS.

**Defect: Active + hover state has `--color-selected` (`--neutral-200`) but hover-without-active uses `--color-hover` (`--neutral-150`). The active+hover state is DARKER than plain hover. Is this correct?** Yes. The active item should resist being "unhovered" visually — it's already the selected destination. Slightly darker active+hover confirms the selection rather than flickering it away. PASS.

**Defect: "No icons" — was listed as a permanent spec decision.** Reversed in v3 by operator directive. Icons added. See v3 revision notes below.

### Pass 3 — v3 self-roast (operator-directed revisions only)

**Did I cheat on the surface token by picking the easiest option?**
The three candidates with defensible semantics were `--color-muted`, `--color-accent`, and `--color-secondary`. Both `--color-muted` and `--color-accent` resolve to `--neutral-100` — same raw value. The differentiator is semantic naming: `accent` in shadcn convention means "highlighted or interacted-with state" (hover backgrounds on menus, etc.). `muted` means "subdued, non-focal surface." The shell is not an accent — it does not demand attention. It is literally muted background chrome. Choosing `--color-muted` is not the easiest choice because `--color-accent` resolves identically — it is the semantically correct choice. `--color-secondary` at `--neutral-150` was considered and rejected because a large persistent plane at that value is perceptibly dark for a light-mode shell; 9-point luminance delta (`--neutral-100` vs `--neutral-50`) is the correct instrument-from-content separation. PASS.

**Are the lucide icon picks generic or HUD-anchored?**
- `PlayCircle` for Jobs: rejected `Briefcase` (corporate/HR mental model, not Aman's), rejected `Activity` (a chart line, not a run trigger). `PlayCircle` maps to "execution run" — the primary mental model for a job in an RL eval context. Aman thinks "run" not "task" at the job level. PASS.
- `ListChecks` for Tasksets: direct. A taskset IS a structured list of eval tasks. No metaphor layer. PASS.
- `Box` for Environments: the mental model for a sandbox is enclosure/isolation. `Box` is the closest lucide primitive. `Server` implies physical hardware. `Container` in Docker sense isn't available as a clean lucide icon at this density. PASS.
- `BrainCircuit` for Models: ML-specific. Not `Database` (storage), not `Cpu` (hardware), not `LayoutDashboard` (the generic fallback). A model is a trained neural network. `BrainCircuit` is the only lucide icon that is unambiguously "ML model" in Aman's vocabulary. PASS.
- `Bot` for Agents: Aman's agents are autonomous programs. The icon needs to say "autonomous actor." `Bot` is the direct, unambiguous term — no abstraction required. PASS.
- `BookOpen` for Library: a library of reusable assets/artifacts. `BookOpen` is library-native. `Archive` implies dead storage. `Folder` is generic filesystem. PASS.
- `Settings2` for Manage: org/team/billing configuration. `Settings2` (sliders form) reads as "configuration" more precisely than `Settings` (gear), which in many systems means app-level prefs. The manage route is org-level; the sliders form maps better to "manage parameters." PASS.

**Do the icon active-state colors fight the gold bar or reinforce it?**
Active icon color: `text-brand` (gold). The bar is `bg-brand` (gold). Both signals are the same gold — they do not compete, they echo. Default and hover icons are `text-muted-foreground` / `text-foreground` respectively — no gold appears until the active state. Gold is therefore exclusive to "you are here." The bar is structural (left edge); the icon color is chromatic (inline with label). Two signals, same message, different channels. PASS in v3 — superseded by v4 (gold violated color.css hard rule).

No defects surfaced in Pass 3. v3 is superseded by v4.

---

## Critique notes — v3 revision

### What changed from v2 and why

**Surface token: `--color-sidebar` removed. `bg-muted` used instead.**
v2 introduced `--color-sidebar: var(--neutral-100)` as a new semantic token in `components.css`. Operator rejected this. The raw value (`--neutral-100`) already has a semantic home in `@theme`: `--color-muted`. The semantic fit is exact — "muted" means subdued, non-focal surface, which is precisely what shell chrome is. No new token needed. Engineering uses `bg-muted` everywhere the previous spec said `bg-sidebar`. Zero `components.css` edit required.

**Icons added to all nav items.**
v2 explicitly prohibited icons ("No icons in nav items"). v3 adds them by operator directive. Icon system: `lucide-react`. Size: `size-4` (16px). Icon sits left of label with `gap-2` (8px). Full route → lucide mapping in §4c. Active icon color: `text-brand` (gold) — superseded in v4.

**Utility footer: confirmed text-only.**
No leading icons on Marketplace/Docs footer items. The `↗` trailing chip carries the external-link semantic. A leading icon would be a competing signal at the same size with no additional information.

---

## Critique notes — v4 revision

### What changed from v3 and why

**Active bar color: gold (`bg-brand`) → near-black (`bg-foreground`).**
v3 used `--color-brand` (gold, `#f7b717`) for the active left-edge bar and `text-brand` for the active icon. `packages/ui/src/styles/color.css` contains an explicit hard rule: "Gold is brand decoration only." v3 violated that rule. v4 corrects it.

**Active bar width: 2px (`w-0.5`) → 4px (`w-1`).**
Without gold to provide chromatic pop, the bar needed more visual mass. 4px near-black against `--neutral-100` produces maximum contrast without relying on color at all. The bar is now a legible structural mark at peripheral vision regardless of color perception.

**Active icon color: `text-brand` (gold) → `text-foreground` (near-black).**
Both bar and icon are now `--color-foreground`. The active item reads as fully saturated at maximum weight — bar, icon, and label all share the same token. No gold appears anywhere in the state matrix.

**Gold retained on brand mark dot only.**
`bg-brand` remains on the 4px circle in the brand lockup. This is brand decoration — identity-level, not state-level. The hard rule is satisfied.

### v4 self-roast

**Does it read?** Hover and active differ as follows: hover = background fill + no bar + regular weight. Active = same background fill + 4px near-black bar + font-medium. The bar is present or absent — binary. At peripheral vision, a vertical black stripe on the left edge of a nav item is impossible to confuse with a hovered item that has no stripe. The weight bump reinforces the read even if the bar is below perceptual threshold at distance. PASS.

**Does it respect the gold rule?** Audit: `bg-brand` appears in exactly one location in the spec — the brand mark dot in §3a. No `text-brand` or `border-brand` in any state of the nav item state matrix. No gold in the engineering handoff icon table. PASS.

**Does it feel deliberate or defaulted?** The near-black choice is not a shortcut. Three candidates were evaluated: `--color-foreground` / `--color-primary` (both `--neutral-950`), `--brand-blue` (`#4a7a96`), and a combined mechanism. `--brand-blue` was rejected: it is the focus-ring token. Using the same color for "active nav item" and "keyboard focus indicator" creates a state-machine ambiguity — a focused-but-not-active item would have a blue ring, an active item would have a blue bar, and a focused active item would have both. Two different states in the same color is noise, not signal. `--color-foreground` was chosen because it carries the semantic "definitive, present, maximum weight" — the correct semantic for "you are here" — and it has no other assignment in the nav interaction state space. The 4px width was chosen to replace the chromatic signal that gold was providing — mass replaces color. PASS.

---

## Engineering handoff

### Token changes

**No new tokens required.** v3 uses only tokens already in `@theme`:

- Shell surface: `bg-muted` (from `--color-muted` → `--neutral-100`) — no `components.css` edit needed
- Active bar: `bg-foreground` (from `--color-foreground` → `--neutral-950`) — already in `@theme`
- Active icon: `text-foreground` (from `--color-foreground` → `--neutral-950`) — already in `@theme`
- Brand mark dot remains `bg-brand` (gold) — this is brand decoration, not state indication

Remove the `--color-sidebar` token addition if it was staged from v2. It is not needed.

### Icon implementation

Package: `lucide-react` (already in `apps/portal/package.json`).
Size: `size-4` (16px) on every icon. `flex-shrink-0`.
Layout: `flex items-center gap-2` on the nav item interior. Icon is first child, label is second.

| Route | Lucide export name | Active icon class | Hover icon class | Default icon class |
|---|---|---|---|---|
| `/jobs` | `PlayCircle` | `text-foreground` | `text-foreground` | `text-muted-foreground` |
| `/tasksets` | `ListChecks` | `text-foreground` | `text-foreground` | `text-muted-foreground` |
| `/environments` | `Box` | `text-foreground` | `text-foreground` | `text-muted-foreground` |
| `/models` | `BrainCircuit` | `text-foreground` | `text-foreground` | `text-muted-foreground` |
| `/agents` | `Bot` | `text-foreground` | `text-foreground` | `text-muted-foreground` |
| `/library` | `BookOpen` | `text-foreground` | `text-foreground` | `text-muted-foreground` |
| `/manage` | `Settings2` | `text-foreground` | `text-foreground` | `text-muted-foreground` |

Hover state icon color: `text-foreground` — icon tracks label color on hover.
Active state icon color: `text-foreground` — same as hover. The active signal comes from the 4px near-black bar and font-medium weight, not from a distinct icon color. Do NOT use `text-brand` (gold) for active icons — gold is brand decoration only.

### Anti-patterns — explicit guardrails for engineering

These are failure modes the spec is designed to prevent. If an engineer makes any of these choices, it is a spec violation:

1. **Do not use `bg-background` for the sidebar or header.** That is the current mistake. The shell uses `bg-muted`.

2. **Do not add a new `--color-sidebar` token to `components.css`.** v2 proposed this; v3 retracts it. `--color-muted` already exists and resolves to the same value (`--neutral-100`). Adding a duplicate semantic token is redundant and pollutes the token namespace.

3. **Do not put the active state left-edge bar in a separate sibling element outside `SidebarNavLink`.** It lives inside the nav link's wrapper, positioned absolutely (`absolute left-0 inset-y-0 w-1 bg-foreground`). If it's outside, keyboard focus and active state can desync.

4. **Do not omit icons from nav items.** All seven nav items (Jobs, Tasksets, Environments, Models, Agents, Library, Manage) require an icon per the icon table above. "I'll decide the icon myself" is a spec violation.

5. **Do not use gold (`text-brand`) for any nav state indicator — not active, not hover.** Gold is brand decoration only (the brand mark dot). The active bar uses `bg-foreground` (near-black). The active icon uses `text-foreground`. No gold in the state matrix.

6. **Do not apply `p-6` in `<main>` in the shell layout.** Pages own their padding. Shell provides `<main className="flex-1 overflow-y-auto">` only.

7. **Do not make `NavZone` a client component.** Pathname detection lives in `SidebarNavLink` only.

8. **Do not use `bg-[var(--color-brand)]` or `bg-[var(--color-muted)]` arbitrary syntax.** Both tokens are in `@theme` and generate utilities. Use `bg-brand` and `bg-muted`.

9. **Do not round the active bar (`rounded-l-none` or similar on the bar itself).** The bar is rectangular. The item wrapper has `rounded-md` + `overflow-hidden` which clips the bar cleanly. The bar does not need its own radius.

10. **Do not remove `aria-current="page"` from active nav items.** It's load-bearing for screen readers and for CSS attribute selectors if they're ever added. Current implementation has it; keep it.

11. **Do not use `text-sm` or `text-xs` Tailwind defaults.** Use `text-label` (12px) and `text-body` (13px) — HUD's named scale is the only text-{name} utilities in `@theme`.

12. **Do not put "HUD portal" as the brand mark text.** The product name in the lockup is `HUD` — uppercase, `text-label`, `font-medium`, `text-muted-foreground`.

### Client island summary

| Component | Client? | Reason |
|---|---|---|
| `AppLayout` | No — async server component | Calls `requireSession()` |
| `NavZone` | No — pure server component | No interactive state |
| `NewMenu` | Yes | DropdownMenu disclosure |
| `SidebarNavLink` | Yes | `usePathname()` for active state |
| Footer `<a>` elements | No | Static anchors |
| Avatar `Link` | No | Static link |

### Mockup

No HTML mockup is produced for this spec. The spec is a components-phase artifact; visual preview will come from Storybook stories authored by `storybook-documenter` after implementation.

---

## Critique notes — v5 revision in progress

**Problem statement (operator-verbatim):** The v4 active state reads as "funereal." The combination of `bg-muted` sidebar + `bg-secondary` active fill + `--neutral-950` bar + `--neutral-950` text + `--neutral-950` icon produces an entirely dark-on-muted-gray render. All signals in the same weight class, no chroma, no energy. The sidebar looks dead.

**Root cause:** v4 solved the structural "you are here" problem (bar = present/absent, weight bump) but ignored the chromatic energy problem. Four near-black signals (bar + icon + label + bg-secondary all at or near neutral-950 + neutral-150) produce visual monotony regardless of their structural legibility. "Readable" and "alive" are independent axes. v4 got readable; it missed alive.

**Revision scope:** Active state mechanism only. Surface tokens, header, footer, spacing, icons — all unchanged. Three candidate mechanisms are under operator review before v5 finalizes.

---

## Active state variants under review

Three HTML mockups are produced for operator selection. Each explores a different mechanism. None of the three is the same shade of the same neutral — they differ in mechanism, not degree.

### v1 — bar + brand-blue bar + neutral-200 active bg

**File:** `/mockups/app-shell-active-v1-blue-bar-lifted-neutral.html`

**Recipe:** 4px left bar in `--brand-blue` (#4a7a96, steel-teal) + active background = `--neutral-200` (#d9d9e0, one step above hover's `--neutral-150`) + text/icon = `--color-foreground` (near-black) + `font-weight: 500`.

**Token justification:** `--brand-blue` is a raw palette token in `:root` — it is NOT a semantic `@theme` token (only `--color-ring` references it). Its value (#4a7a96) is a saturated steel-teal that adds chroma without screaming. `--neutral-200` is `--color-selected` in `@theme` — existing token, no new token needed. The stronger background (neutral-200 vs hover's neutral-150) means the active state has BOTH a structural indicator (bar) AND a slightly stronger fill — two signals, both legible.

**Focus-ring caveat:** `--brand-blue` is the source value for `--color-ring` (the focus ring). Using the same raw hex for the bar and the focus ring creates a hue match, though they are spatially distinct (left fill bar vs outline ring). Readable in practice, but operators and engineers should verify the combined active+focused render.

**Why it's not funereal:** The steel-teal bar injects chroma into a previously all-neutral-gray palette. One saturated color makes the sidebar feel like a product, not a wireframe.

---

### v2 — no bar + neutral-200 active bg + brand-blue icon

**File:** `/mockups/app-shell-active-v2-no-bar-blue-icon.html`

**Recipe:** NO left bar. Active background = `--neutral-200` (#d9d9e0). Active icon = `--brand-blue` (#4a7a96, steel-teal). Active text = `--color-foreground` + `font-weight: 500`. Hover remains `--neutral-150` bg + foreground text/icon.

**Token justification:** Same tokens as v1 but no bar. The active signal is carried by two mechanisms: (1) bg fill step (`--neutral-200` > hover's `--neutral-150` — legible at a glance, not heavy), and (2) chromatic icon shift (muted-gray icon → steel-teal icon — a clear state change visible at peripheral). `--brand-blue` is used on the icon only, not a full fill — a tighter use of the chroma budget.

**Why no bar:** Without the bar, the sidebar is visually cleaner — no left-edge interrupt. The active state reads through fill + icon color alone. The tradeoff: the active/hover separation is weaker than a bar variant (fill step is subtle; icon color is the primary differentiator). Works if the icon color change is strong enough — preview determines this.

**Why it's not funereal:** The blue icon is the life. One teal icon breaks the all-gray monotony without changing the overall sidebar tone.

---

### v3 — dark sidebar inversion + gold bar

**File:** `/mockups/app-shell-active-v3-dark-sidebar-gold-bar.html`

**Recipe:** Sidebar surface = `--neutral-950` (#1c2024, near-black). Header fused (same dark bg). Active item = slightly lifted dark bg (#2a3035, between neutral-900 and neutral-950) + `--neutral-0` (#ffffff) text/icon + 3px `--gold` (#f7b717) left bar. Default item text = #a8adb5 (between neutral-400 and neutral-300). Hover = #252b30 bg + white text. Content area stays `--neutral-50` (light).

**Token justification:** `--neutral-950` and `--neutral-0` are raw palette values. `--gold` is `--color-brand`. Active bg uses an intermediate dark hex not currently in the palette — this would require a new raw palette value or accept it as a one-off mockup value (spec would formalize if chosen). The `--color-brand` gold rule issue: on a dark sidebar, gold reads as brand identity (HUD's gold on HUD's dark surface), not as arbitrary state color. The argument for operator approval: gold bar is the ONLY gold in the nav interaction space; its position (left edge bar) is spatially separate from the header brand mark dot; on dark bg it reads unmistakably as "anchor point." Operator must explicitly approve this gold exception if choosing v3.

**Implementation note if chosen:** Would require a new semantic token for the dark sidebar surface (e.g., `--color-sidebar: var(--neutral-950)` in `components.css`) or a new `@theme` entry. This is the one variant that DOES require a new token. The new tokens required: sidebar surface, dark hover bg, dark active bg, dark text colors. Four new tokens total — all raw palette references, no new hex values except the intermediate dark (#2a3035 and #252b30, which could be defined as `--neutral-925` and `--neutral-970` in the raw palette).

**Why it's not funereal:** It's the opposite of funereal — it's editorial. Dark sidebar + light content + gold accent is a confident, directional design choice. The "life" comes from the strong dark/light plane contrast and the unmissable gold bar on the dark surface. The risk is the opposite: it might read as too heavy for the overall portal tone. Operator decides.
