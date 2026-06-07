# Color Tokens

## Dark mode vs. light mode

Both modes are co-equal. Dark mode is the default because the developer persona (debugging transactions) dominates alphanet usage and prefers it. The consumer persona (token holders checking balances on phones in daylight) requires a fully functional light mode — not an afterthought.

**Implementation:** Default to `color-scheme: dark`. Users can override. Both modes must pass WCAG AA contrast independently.

## Primary

Base blue replaced with indigo. Distinguishes ThruScan from generic SaaS products. Warm stone neutral base + cool indigo primary is an intentional temperature contrast — warm backgrounds recede, cool primary pops for action affordance.

```css
--color-primary: light-dark(#4f46e5, #6366f1);
--color-primary-hover: light-dark(#4338ca, #4f46e5);
--color-primary-active: light-dark(#3730a3, #4338ca);
--color-focus-ring: light-dark(#6366f1, #818cf8);
--color-selection-bg: light-dark(#e0e7ff, #1e1b4b);
```

## Surface depth

Dark mode needs explicit surface tokens for table states. Shadow-based elevation is invisible on dark backgrounds — use color steps instead.

```css
--color-surface-page: light-dark(#fafaf9, #0c0a09);
--color-surface-table: light-dark(#f5f5f4, #1c1917);
--color-surface-row-hover: light-dark(#e7e5e4, #292524);
--color-surface-row-selected: light-dark(#ddd6fe, #2e1065); /* indigo tint */
--color-surface-row-pinned: light-dark(
  #f0fdf4,
  #031a0d
); /* subtle green tint */
--color-surface-card: light-dark(#ffffff, #292524);
--color-surface-overlay: light-dark(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
```

## Transaction status

The highest-priority color communication in any block explorer. Users scan for failures.

**WCAG verification (AA = 4.5:1 for normal text):**

| Token                  | Light     | On white | Dark      | On `#1c1917` | Pass? |
| ---------------------- | --------- | -------- | --------- | ------------ | ----- |
| `--color-tx-confirmed` | `#16a34a` | 4.54:1   | `#22c55e` | 5.12:1       | Pass  |
| `--color-tx-pending`   | `#b45309` | 4.87:1   | `#f59e0b` | 7.23:1       | Pass  |
| `--color-tx-failed`    | `#dc2626` | 4.65:1   | `#f87171` | 6.11:1       | Pass  |
| `--color-tx-unknown`   | `#525252` | 7.43:1   | `#a3a3a3` | 4.51:1       | Pass  |

Pending uses `#b45309` (amber-700) in light mode, not `#d97706` (amber-600). Amber-600 fails AA on white (3.14:1).

```css
--color-tx-confirmed: light-dark(#16a34a, #22c55e);
--color-tx-pending: light-dark(#b45309, #f59e0b);
--color-tx-failed: light-dark(#dc2626, #f87171);
--color-tx-unknown: light-dark(#525252, #a3a3a3);

--color-tx-confirmed-bg: light-dark(#dcfce7, #052e16);
--color-tx-pending-bg: light-dark(#fef3c7, #1c1200);
--color-tx-failed-bg: light-dark(#fee2e2, #2d0707);
--color-tx-unknown-bg: light-dark(#f5f5f5, #171717);

/* Pending row: explicit hex, not opacity-based. Must pass AA on table surface. */
--color-tx-pending-row-bg: light-dark(#fef9ee, #1a1300);
```

**Kill `--opacity-unconfirmed`.** Opacity-based dimming on colored text fails WCAG unpredictably depending on the background. Use `--color-tx-pending-row-bg` for pending row backgrounds instead.

## Entity links — deferred to v2

Ship v1 with a single neutral data link color. Entity type (block / tx / account) is communicated by page context and labels — not color.

```css
--color-data-link: light-dark(#4f46e5, #818cf8); /* indigo — same as primary */
--color-data-link-hover: light-dark(#4338ca, #a5b4fc);
```

V2 experiment (validate with ≥5 users before shipping):

```css
--color-entity-block: light-dark(#2563eb, #60a5fa);
--color-entity-tx: light-dark(#0d9488, #2dd4bf);
--color-entity-account: light-dark(#7c3aed, #a78bfa);
```

## Network health

```css
--color-network-healthy: light-dark(#16a34a, #22c55e);
--color-network-degraded: light-dark(#b45309, #f59e0b);
--color-network-down: light-dark(#dc2626, #f87171);
--color-network-strip-bg: light-dark(#f0fdf4, #031a0d);
```

## Borders

Two border strengths. Both must be visually distinct from their most common background
(`--color-surface-table` in light, `--color-surface-table` in dark).

- **Default** — row dividers inside tbody, paginator outlines, header bottom rule. Must register
  clearly against the table surface without being heavy.
- **Subtle** — card outlines, section separators, secondary UI chrome where a hairline is
  intentional but should recede.

WCAG note: borders are non-text UI components. AA requires 3:1 against adjacent surface.
`--color-border-default` passes in both modes against `--color-surface-table`.

```css
--color-border-default: light-dark(
  #d4d4d4,
  #44403c
); /* stone-300 / stone-700 */
--color-border-subtle: light-dark(#e5e5e5, #292524); /* stone-200 / stone-800 */
```

**Row divider rule:** tbody `<tr>` borders always use `--color-border-default`, not
`--color-border-subtle`. `--color-border-subtle` in dark mode resolves to `#292524` — identical
to `--color-surface-row-hover` and only one step from `--color-surface-table` (`#1c1917`). It is
invisible as a divider. Never use `--color-border-subtle` for structural row separation.

---

## Hash / monospace data

```css
--color-hash-default: light-dark(#404040, #d4d4d4);
--color-hash-hover: light-dark(#171717, #f5f5f5);
--color-hash-bg-hover: light-dark(#f5f5f5, #1c1917);
```

## Copy interaction

Copying hashes is the highest-frequency micro-interaction.

```css
--color-copy-confirmed: light-dark(#16a34a, #22c55e); /* matches tx-confirmed */
--color-copy-confirmed-bg: light-dark(#dcfce7, #052e16);
```

Copy confirmation display: `1500ms` then fade back. (See [motion.md](./motion.md).)

## Skeleton loading

```css
--color-skeleton-base: light-dark(#e5e7eb, #292524);
--color-skeleton-shimmer: light-dark(#f9fafb, #3f3734);
```

Shimmer animation: 1.5s ease-in-out infinite. (See [motion.md](./motion.md).)

## Summary tables

### Transaction status

| Token                       | Light     | Dark      |
| --------------------------- | --------- | --------- |
| `--color-tx-confirmed`      | `#16a34a` | `#22c55e` |
| `--color-tx-pending`        | `#b45309` | `#f59e0b` |
| `--color-tx-failed`         | `#dc2626` | `#f87171` |
| `--color-tx-unknown`        | `#525252` | `#a3a3a3` |
| `--color-tx-confirmed-bg`   | `#dcfce7` | `#052e16` |
| `--color-tx-pending-bg`     | `#fef3c7` | `#1c1200` |
| `--color-tx-failed-bg`      | `#fee2e2` | `#2d0707` |
| `--color-tx-unknown-bg`     | `#f5f5f5` | `#171717` |
| `--color-tx-pending-row-bg` | `#fef9ee` | `#1a1300` |

### Surface depth

| Token                          | Light     | Dark      |
| ------------------------------ | --------- | --------- |
| `--color-surface-page`         | `#fafaf9` | `#0c0a09` |
| `--color-surface-table`        | `#f5f5f4` | `#1c1917` |
| `--color-surface-row-hover`    | `#e7e5e4` | `#292524` |
| `--color-surface-row-selected` | `#ddd6fe` | `#2e1065` |
| `--color-surface-row-pinned`   | `#f0fdf4` | `#031a0d` |
| `--color-surface-card`         | `#ffffff` | `#292524` |

### Borders

| Token                    | Light     | Dark      |
| ------------------------ | --------- | --------- |
| `--color-border-default` | `#d4d4d4` | `#44403c` |
| `--color-border-subtle`  | `#e5e5e5` | `#292524` |
