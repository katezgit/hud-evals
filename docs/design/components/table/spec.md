# Table — Component Spec

**Semantic refs:** `docs/design/foundations/color.md`, `typography.md`, `sizing.md`, `radius.md`, `spacing.md`, `interaction-states.md`.

**Palette basis:** cool-neutral `reference-tokens-preview.html` palette (approved 2026-05-26).

**Source audit:** `packages/ui/src/components/table.tsx` (CSS-only export, shadcn-derived)

**Primitives scope:** semantic `<table>` elements + base styling. Sorting, filtering, pagination compose in `apps/**`.

**Engineering convention:** see [docs/conventions/table.md](../../../conventions/table.md) for API usage (JSX primitive vs CSS-string), Pattern A/B examples, and the bg-muted/bg-card token gotcha.

---

## Anatomy

**Pattern B — Card-contained (plain `<Table>`, no `bordered`):**
```
┌──────────────────────────────────────────────────────┐  ← Card chrome (clips corners)
│  [TH] NAME        [TH] STATUS    [TH] REWARD ↕       │  ← thead sticky, bg-muted
│  ────────────────────────────────────────────────    │
│  [TD] run_8f3a4c   [TD] ● Scored  [TD] 0.7341        │  ← row default
│  [TD] run_2b9f11   [TD] ● Running [TD] —             │  ← row hover
│ ▌[TD] run_0c5d22   [TD] ● Scored  [TD] 0.6890        │  ← row selected (rail)
│                                                       │
│       No results                                      │  ← empty state
└──────────────────────────────────────────────────────┘
```

**Pattern A — Page-section (`<Table bordered>`, no Card):**
```
╭──────────────────────────────────────────────────────╮  ← rounded-md border border-border bg-card overflow-hidden
│  [TH] NAME        [TH] STATUS    [TH] REWARD ↕       │  ← thead sticky, bg-muted
│  ────────────────────────────────────────────────    │
│  [TD] run_8f3a4c   [TD] ● Scored  [TD] 0.7341        │  ← row default (bg-card body)
│  [TD] run_2b9f11   [TD] ● Running [TD] —             │  ← row hover
│ ▌[TD] run_0c5d22   [TD] ● Scored  [TD] 0.6890        │  ← row selected (rail)
╰──────────────────────────────────────────────────────╯
```

Anti-pattern: `<Card><Table bordered>` — double chrome (Card border + bordered wrapper).

---

## Sub-component Table

| Sub-component | HTML Element | Class export | Role |
|---|---|---|---|
| Table | `<table>` | `tableClass` | Root container. `w-full caption-bottom border-collapse`. Accepts `bordered` prop — see Bordered variant section. |
| TableHeader | `<thead>` | `tableHeaderClass` | Header band. `bg-muted` always (both density tiers). Sticky behavior is on individual `<th>` cells, not the `<thead>`. |
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
| `--table-bg` | `--color-background` | `#F6F8FA` | `#0C1016` | Sits on page canvas (non-bordered case, inside Card) |
| `--table-border` | `--color-border` | `rgba(20,30,25,.17)` | `rgba(255,255,255,.17)` | Row dividers; also outer border in bordered case |
| `--table-radius` | `--radius-none` | `0` | `0` | Table element itself has no rounding; bordered wrapper uses `rounded-md` |

#### Bordered variant wrapper tokens

| Token | Tailwind class | Notes |
|---|---|---|
| Background | `bg-card` (`#FFFFFF` / `#11161F`) | NOT `bg-elevated` — see token gotcha below |
| Border | `border border-border` | Outer frame |
| Radius | `rounded-md` | Corner rounding on wrapper |
| Overflow | `overflow-hidden` | Clips table corners to wrapper radius |

### Column headers `<th>`

| Token | Semantic ref | Light value | Dark value | Notes |
|---|---|---|---|---|
| `--table-header-bg` | `--color-muted` | `#F0F2F6` | `#161D28` | `bg-muted` on `<thead>` — both density tiers; provides structural label-band differentiation |
| `--table-header-fg` | `--color-muted-foreground` | `#54637A` | `#9CA9B9` | De-emphasized column labels |
| `--table-header-border-bottom` | `--color-border` | `rgba(20,30,25,.17)` | `rgba(255,255,255,.17)` | Divider between header and body |
| `--table-header-font` | `--text-label` / `--font-weight-medium` | 12px / 500 | 12px / 500 | `letter-spacing: 0.01em`, uppercase |
| `--table-header-padding-default` | `py-2 px-3` (middle) / `pl-6` (first) / `pr-6` (last) | 8px block, 12px middle inline | — | Height governed by `min-h-8` (32px) |
| `--table-header-padding-sm` | same as default | — | — | Header is density-invariant: always `min-h-8` / `py-2` |

**Header style:** `text-label font-medium uppercase tracking-[0.01em] text-muted-foreground`. Instrument-register 12px / 500 / `0.01em` / uppercase. De-emphasized chrome; the value register (mono cells) remains dominant.

**Sort icon affordance.** `ChevronUp`/`ChevronDown` at `--icon-size-sm` (12px), `gap-1` (4px) trailing the label. Color `--muted-foreground` at rest; `--foreground` on active sorted column. Sort logic is app-layer; this spec covers icon color and placement only.

**Vertical column borders — not supported.** Column separators are consumer-grade. HUD instrument tables use horizontal dividers only.

**Header top border — none.** No top border on the header band — the sticky surface sits flush with the scroll container top edge.

### Rows `<tr>`

Row min-height: `min-h-10` (40px) default / `min-h-9` (36px) compact on `<tr>`. Explicit `py-*` on cells provides block padding; `align-middle` centres body text. See `## Cell heights` below.

| Token | Semantic ref | Light value | Dark value | Notes |
|---|---|---|---|---|
| `--table-row-bg` | transparent | — | — | Rows sit on canvas / Card bg |
| `--table-row-bg-hover` | `--color-hover` | `#F0F2F6` | `#161D28` | Pointer hover — surface lift |
| `--table-row-bg-selected` | none | — | — | No bg wash (see Row States) |
| `--table-row-selected-rail` | `--color-accent` | `#087A6C` | `#2BE0C8` | 2px left border signals selected row |
| `--table-row-divider` | `--color-border` | `rgba(20,30,25,.17)` | `rgba(255,255,255,.17)` | Bottom border on every `<tr>` except last |
| `--table-row-padding-default` | `py-2 px-4` (middle) / `pl-6` (first `<td>`) / `pr-6` (last `<td>`) | 8px block, 16px middle inline | — | First/last cells align with `CardHeader`'s `px-6` |
| `--table-row-padding-sm` | `py-1.5 px-3` (middle) / `pl-6` (first) / `pr-6` (last) | 6px block, 12px middle inline | — | Compact density |

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

**Body row — default density: 40px.** Governed by `min-h-10` on `<tr>` + `py-2` (8px) on cells. Body text is 14px / line-height 22px; `py-2` × 2 + 22px = 38px fits within the 40px minimum. Cells use `align-middle`.

**Body row — compact density: 36px.** `min-h-9` on `<tr>` + `py-1.5` (6px) on cells. A trailing `IconButton size="sm"` (24px) fits inside 36px with 6px clearance top/bottom — no row height adjustment needed.

**Header row: 32px (density-invariant).** `min-h-8` on `<th>` + `py-2` (8px) on header cells. Header is always 32px regardless of body density tier. The shorter header provides a visual hierarchy break between the label band and data band.

**Rule:** Default body rows are 40px (`min-h-10`); compact body rows are 36px (`min-h-9`); header rows are always 32px (`min-h-8`) in both tiers. Explicit `py-*` on cells sets block padding — row height is governed by min-height, not fixed height. Selectable rows (checkbox column) do not change height. No per-row height exceptions.

**First/last cell padding.** `pl-6` on first `<th>` and `<td>`; `pr-6` on last `<th>` and `<td>`. Applies to both density tiers. Aligns the first column's text with `CardHeader`'s `px-6`, so section headings and column labels read on the same vertical grid.

## Density tiers

| Tier | `<th>` min-height | `<tr>` (body) min-height | `<th>` cell padding | `<td>` middle cell padding | First cell | Last cell |
|---|---|---|---|---|---|---|
| Default | `min-h-8` (32px) | `min-h-10` (40px) | `py-2 px-3` | `py-2 px-4` | `pl-6` | `pr-6` |
| Compact | `min-h-8` (32px) | `min-h-9` (36px) | `py-2 px-3` | `py-1.5 px-3` | `pl-6` | `pr-6` |

Header is density-invariant: always `min-h-8` / `py-2`. Density is driven by a `density` variant on `tableHeadVariants` / `tableCellVariants` (default `"default"`). Block padding is set on cells (not row-level height); `align-middle` centres content.

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

## Bordered variant

The `bordered` prop on `<Table>` adds `rounded-md border border-border bg-card overflow-hidden` to the table wrapper element.

**When to use (Pattern A):** Page-section tables that stand alone without a Card — Members, Limits, Secrets, API keys. The bordered wrapper provides containment when no parent Card exists.

**When NOT to use (Pattern B):** Tables inside a Card. The Card provides chrome; `bordered` adds a second border (double chrome). Use plain `<Table>` inside Card — edge-to-edge so Card clips table corners.

**Anti-pattern:** `<Card><Table bordered>` — double chrome. If you're writing this, remove `bordered`.

**Wrapper classes applied by `bordered` prop:**

```
rounded-md border border-border bg-card overflow-hidden
```

The `bg-card` on the wrapper ensures the `bg-muted` `<thead>` is visible (see token gotcha below). The `overflow-hidden` clips the table's square corners to the wrapper's `rounded-md`.

> **Token gotcha — `--color-elevated` == `--color-muted`:** In this palette, `--color-elevated` and `--color-muted` resolve to identical hex values (`#F0F2F6` / `#161D28`). Pairing them produces zero contrast. The bordered wrapper uses `bg-card` (white `#FFFFFF` / `#11161F`), not `bg-elevated`, so the `bg-muted` thead band is visible against the body. Tracked as TODO in `docs/testing/TODO.md`.

---

## Token Cross-Reference

| Table slot | Token used | Light value | Dark value |
|---|---|---|---|
| Table background (non-bordered / inside Card) | `--color-background` | `#F6F8FA` | `#0C1016` |
| Bordered wrapper background | `--color-card` (`bg-card`) | `#FFFFFF` | `#11161F` |
| Bordered wrapper border | `--color-border` | `rgba(20,30,25,.17)` | `rgba(255,255,255,.17)` |
| Header background | `--color-muted` | `#F0F2F6` | `#161D28` |
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
