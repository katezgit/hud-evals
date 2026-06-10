# Table — Component Spec

**Semantic refs:** `docs/design/foundations/color.md`, `typography.md`, `sizing.md`, `radius.md`, `spacing.md`, `interaction-states.md`.

**Palette basis:** cool-neutral `reference-tokens-preview.html` palette (approved 2026-05-26).

**Source audit:** `packages/ui/src/components/table.tsx` (CSS-only export, shadcn-derived)

**Primitives scope:** semantic `<table>` elements + base styling. Sorting, filtering, pagination compose in `apps/**`.

---

## Anatomy

```
┌──────────────────────────────────────────────────────┐  ← ScrollArea (dependency)
│  [TH] NAME        [TH] STATUS    [TH] REWARD ↕       │  ← thead sticky
│  ────────────────────────────────────────────────    │
│  [TD] run_8f3a4c   [TD] ● Scored  [TD] 0.7341        │  ← row default
│  [TD] run_2b9f11   [TD] ● Running [TD] —             │  ← row hover
│ ▌[TD] run_0c5d22   [TD] ● Scored  [TD] 0.6890        │  ← row selected (rail)
│                                                       │
│       No results                                      │  ← empty state
└──────────────────────────────────────────────────────┘
```

---

## Sub-component Table

| Sub-component | HTML Element | Class export | Role |
|---|---|---|---|
| Table | `<table>` | `tableClass` | Root container. `w-full caption-bottom border-collapse`. Background is `bg-background`. |
| TableHeader | `<thead>` | `tableHeaderClass` | Header band. `bg-background`. Sticky behavior is on individual `<th>` cells, not the `<thead>`. |
| TableBody | `<tbody>` | `tableBodyClass` | Row container. Suppresses last-row border via `[&_tr:last-child]:border-b-0`. |
| TableFooter | `<tfoot>` | `tableFooterClass` | Summary / aggregate row band. `bg-muted`, `border-t border-border`, `font-medium`. |
| TableRow | `<tr>` | `tableRowVariants` | Row with hover, selected, and divider states. |
| TableHead | `<th>` | `tableHeadVariants` | Column header cell. Sticky, uppercase label register, `border-b`. Density: `default px-4 py-2` / `compact px-3 py-1.5`. |
| TableCell | `<td>` | `tableCellVariants` | Body data cell. Default prose; `variant="mono"` for IDs/numbers; `variant="truncated"` for long strings; `variant="row-action"` for trailing action buttons. Density matches `<th>`. |
| TableCaption | `<caption>` | `tableCaptionClass` | Table-level footnote. Below table (`caption-bottom`). `text-caption` (12px). |

---

## Token Table

Format: `--table-[slot]-[state]`

### Container

| Token | Semantic ref | Light value | Dark value | Notes |
|---|---|---|---|---|
| `--table-bg` | `--color-background` | `#F6F8FA` | `#0C1016` | Sits on page canvas |
| `--table-border` | `--color-border` | `rgba(20,30,25,.17)` | `rgba(255,255,255,.17)` | Outer border + row dividers |
| `--table-radius` | `--radius-none` | `0` | `0` | Tables are instruments — no rounding |

### Column headers `<th>`

| Token | Semantic ref | Light value | Dark value | Notes |
|---|---|---|---|---|
| `--table-header-bg` | `--color-background` | `#F6F8FA` | `#0C1016` | Matches canvas; sticky header masks scrolling content |
| `--table-header-fg` | `--color-muted-foreground` | `#54637A` | `#9CA9B9` | De-emphasized column labels |
| `--table-header-border-bottom` | `--color-border` | `rgba(20,30,25,.17)` | `rgba(255,255,255,.17)` | Divider between header and body |
| `--table-header-font` | `--text-label` / `--font-weight-medium` | 12px / 500 | 12px / 500 | `letter-spacing: 0.01em`, uppercase |
| `--table-header-padding-default` | `px-3` | 12px inline | — | No block padding — height set by `h-8` on row |
| `--table-header-padding-sm` | `px-3` | 12px inline | — | Same inline padding; compact tier uses same header height |

**Header style:** `text-label font-medium uppercase tracking-[0.01em] text-muted-foreground`. Instrument-register 12px / 500 / `0.01em` / uppercase. De-emphasized chrome; the value register (mono cells) remains dominant.

**Sort icon affordance.** `ChevronUp`/`ChevronDown` at `--icon-size-sm` (12px), `gap-1` (4px) trailing the label. Color `--muted-foreground` at rest; `--foreground` on active sorted column. Sort logic is app-layer; this spec covers icon color and placement only.

**Vertical column borders — not supported.** Column separators are consumer-grade. HUD instrument tables use horizontal dividers only.

**Header top border — none.** No top border on the header band — the sticky surface sits flush with the scroll container top edge.

### Rows `<tr>`

Row height: explicit `h-9` (36px) default / `h-8` (32px) compact on `<tr>`. `align-middle` on cells centres 14px/22px body text within the row. See `## Cell heights` below.

| Token | Semantic ref | Light value | Dark value | Notes |
|---|---|---|---|---|
| `--table-row-bg` | transparent | — | — | Rows sit on canvas |
| `--table-row-bg-hover` | `--color-hover` | `#F0F2F6` | `#161D28` | Pointer hover — surface lift |
| `--table-row-bg-selected` | none | — | — | No bg wash (see Row States) |
| `--table-row-selected-rail` | `--color-accent` | `#087A6C` | `#2BE0C8` | 2px left border signals selected row |
| `--table-row-divider` | `--color-border` | `rgba(20,30,25,.17)` | `rgba(255,255,255,.17)` | Bottom border on every `<tr>` except last |
| `--table-row-padding-default` | `px-3` | 12px inline | — | No block padding — height set by `h-9` on row |
| `--table-row-padding-sm` | `px-3` | 12px inline | — | Compact: `h-8` on row |

**Motion.** Hover fill: `transition-[background-color] duration-fast ease-out-standard`. New row reveal: `animation: row-reveal var(--motion-enter)` (`220ms, --ease-out-emphasized`).

**Zebra stripes — not supported.** Zebra is a consumer-UI pattern. HUD's density and the `--hover` + selected-rail system make row tracking unambiguous without alternating fills. Zebra conflicts with status-row washes.

### Row States

| State | Background | Left Rail | Border | Notes |
|---|---|---|---|---|
| Default | `transparent` | none | `border-b border-border` | Rows sit on canvas. |
| Hover | `bg-hover` (`--color-hover`) | none | unchanged | Pointer-hover surface lift. Hover applies on all rows (read-only and interactive) — row tracking in a 100+ row fleet table. |
| Selected | `transparent` | `border-l-2 border-l-accent` | unchanged | Accent teal rail only — no bg wash. Selected is visually distinct from hover via chromatically distinct rail. |
| Selected + Hovered | `bg-hover` | `border-l-2 border-l-accent` | — | Both signals present. No conflict — fill and rail are orthogonal CSS properties. |
| Disabled | `opacity-50` on row content | none | unchanged | Consumers apply `opacity-50` or `pointer-events-none` at the row level. |
| Status-washed | Consumer applies `--state-{x}-subtle` via `data-state` or `className` | none | unchanged | App-layer. The design system row is wash-neutral; status fills compose on top. Selected + status-washed: rail identifies selected row, data-state wash preserved. |

**Why no bg wash on selected:** The removed bg wash (`--color-selected`) was only one perceptual step darker than `bg-hover`. The two states were visually nearly identical — the 2px rail was the only disambiguator. The rail is sufficient; the wash was redundant and collided with data-state washes.

**Why accent-colored rail:** `--color-primary` resolves to the foreground text color (achromatic). A `border-l-2` in foreground-text color reads as a structural border, not a state indicator. `--color-accent` (teal) is the only chromatically distinct non-neutral hue in the semantic palette. personality.md: "color = state." The accent is reserved for active/selected/live states.

### Cell types `<td>`

**Default text cell**

| Token | Semantic ref | Light value | Dark value |
|---|---|---|---|
| `--table-cell-fg` | `--color-foreground` | `#18212E` | `#E8EEF5` |
| `--table-cell-font` | `--text-body` / `--font-weight-regular` | 14px / 400 | — |

**Monospace cell** (run IDs, model IDs, step counts, reward values)

| Token | Value | Notes |
|---|---|---|
| Font family | `--font-mono` | IBM Plex Mono |
| Font size | `--text-code` | 12px |
| Color | `--color-foreground` | `#18212E` / `#E8EEF5` |
| `font-feature-settings` | `'tnum' 1, 'lnum' 1` | Required — prevents column drift in reward tables |

`variant="mono"` is an explicit opt-in per column via `tableCellVariants`. Not a global table prop. Reward columns, step-count columns, and ID columns all use `variant="mono"`.

**Badge cell.** `Badge` component inline. Cell padding unchanged.

**Avatar cell.** `Avatar` at `size-sm`, `gap-2` between avatar and text label.

**Truncated cell.** `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` on `<td>`. Column width constraint is app-layer.

**Row-action cell.** Right-aligned `<td>`, `width: 48px`. Contains icon-only destructive ghost `Button` per `button/spec.md`.

### Numeric alignment convention

**Rule:** Numeric columns are right-aligned. Non-numeric columns are left-aligned. No exceptions.

Right-alignment lets users compare numeric magnitudes vertically — leading digits align, place values stack. A reward column is meaningless for comparison when left-aligned.

| Alignment | Column types |
|---|---|
| Right | Reward / score (float), percentage, currency / cost-per-rollout, duration (seconds/ms), step count (integer), token count, rank |
| Left | ID (run ID, model ID, env ID) — identifiers are labels, not magnitudes. Name, label, description, status badge |
| Right (date/time) | ISO timestamps — chronological sort aligns at the end of the string |

**Monospace + alignment travel together:** right-aligned numeric cells always use `variant="mono"` (`tnum+lnum` tabular figures). ID columns use `variant="mono"` but stay left-aligned.

**Implementation:** Consumers apply `text-right` to `<th>` and `<td>` via TanStack column/header `meta.className`. No `align` variant in `tableCellVariants` or `tableHeadVariants` — lower coupling, sufficient.

**Storybook guidance:**
- Right-aligned numeric columns: `meta: { className: "text-right" }` on both column def and header
- Numeric cells: `variant="mono"` on `tableCellVariants`
- ID cells: `variant="mono"` only (no `text-right`)

### Empty state

| Slot | Value | Notes |
|---|---|---|
| Text color | `--color-muted-foreground` | `#54637A` / `#9CA9B9` |
| Text style | `--text-body` / `--font-weight-regular` | Centered in body |
| Row padding | `py-8` | 32px vertical — reads as intentional, not glitch |

---

## Cell heights

**Body row — default density: 36px.** Set via `h-9` on `<tr>`. Body text is 14px / line-height 22px; `py-[7px]` × 2 + 22px = 36px. Cells use `align-middle` — height is enforced on the row, not the cell.

**Body row — compact density: 32px.** Set via `h-8` on `<tr>`. Matches the 32px Button default baseline (canonical: `sizing-primitives.stories.tsx`). A trailing `IconButton size="sm"` (24px) fits inside 32px with 4px margin top/bottom — no row height adjustment needed for trailing actions.

**Header row: 32px.** Set via `h-8` on `<th>` (or row-level `h-8` if cells span a `<tr>`). Header labels are 12px / uppercase / `font-medium` — tighter than body. Header is always 32px regardless of density tier. A shorter header provides a clear visual hierarchy break between the label band and the data band.

**Rule:** Default body rows are 36px; compact body rows are 32px; header rows are always 32px. Rows with a trailing `IconButton size="sm"` (24px) do not change height — the 24px icon fits within 32px (compact) with 4px clearance and within 36px (default) with 6px clearance. Selectable rows (checkbox column) do not change height. No per-row height exceptions.

**Rationale:** 36px default is the correct instrument density for HUD — Alex, Sam, and Riley all scan 50–200-row tables (fleet, eval, trace). 40px (the prior value) added ~10% vertical waste per row across a 100-row table. 36px matches Linear's production issue-list row height (`--row-height: 36px` in their production stylesheet) and sits one step above their 32px compact tier. The 32px header is shorter than the body by 4px, providing a hierarchy signal without additional chrome.

## Density tiers

| Tier | `<th>` height | `<tr>` (body) height | `<th>` padding | `<td>` padding |
|---|---|---|---|---|
| Default | `h-8` (32px) | `h-9` (36px) | `px-3` | `px-3` |
| Compact | `h-8` (32px) | `h-8` (32px) | `px-3` | `px-3` |

Density is driven by a `density` variant on `tableHeadVariants` / `tableCellVariants` (default `"default"`). Vertical padding on cells is removed in favour of explicit row height (`h-*`) on `<tr>`; `align-middle` centres content.

---

## Sticky header

`position: sticky; top: 0; z-index: z-sticky` on `<th>`. Surface matches `--table-header-bg` to mask scrolling rows. Sticky offset is relative to the ScrollArea scroll container, not the viewport.

**Sticky header is always-on.** HUD tables are long (fleet view can render 100+ eval runs). Non-sticky headers are not a supported mode.

---

## Footer

`tableFooterClass` (`bg-muted border-t font-medium`) is for totals/summary rows (total cost, mean reward, run count). It is not for pagination controls or action bars — those compose outside the `<table>` in `apps/**`.

---

## ScrollArea dependency

Tables with overflow rows wrap in `<ScrollArea><Table/></ScrollArea>`. Table does not own overflow — it is a raw primitive.

---

## Token Cross-Reference

| Table slot | Token used | Light value | Dark value |
|---|---|---|---|
| Table / header background | `--color-background` | `#F6F8FA` | `#0C1016` |
| Header text | `--color-muted-foreground` | `#54637A` | `#9CA9B9` |
| Header bottom border | `--color-border` | `rgba(20,30,25,.17)` | `rgba(255,255,255,.17)` |
| Row hover fill | `--color-hover` | `#F0F2F6` | `#161D28` |
| Row selected fill | none | — | — |
| Row selected rail | `--color-accent` (teal) | `#087A6C` | `#2BE0C8` |
| Row divider | `--color-border` | `rgba(20,30,25,.17)` | `rgba(255,255,255,.17)` |
| Body cell text | `--color-foreground` | `#18212E` | `#E8EEF5` |
| Mono cell font | `--font-mono` | IBM Plex Mono | — |
| Mono cell size | `--text-code` | 12px | 12px |
| Footer background | `--color-muted` | `#F0F2F6` | `#161D28` |
| Footer border-top | `--color-border` | `rgba(20,30,25,.17)` | `rgba(255,255,255,.17)` |
| Caption text | `--color-muted-foreground` | `#54637A` | `#9CA9B9` |
| Caption size | `--text-caption` | 12px | 12px |
| Empty state text | `--color-muted-foreground` | `#54637A` | `#9CA9B9` |
| Sticky z-index | `z-sticky` | design-system z-scale | — |

---

*No elevation tokens apply to table internals. elevation.md §3: "No row-level shadows." Row hover and selection use fill changes, never shadow.*
