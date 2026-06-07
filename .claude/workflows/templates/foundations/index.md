# ThruScan Foundations

Atomic, machine-consumable design values. One file per category. These are the vocabulary of the design system — composed in `patterns/`, applied in `components/`, contextualized in `guidelines/`.

| File | Contains |
|---|---|
| [color.md](./color.md) | Surface, status, entity, network, hash, copy, skeleton color tokens (light + dark) |
| [typography.md](./typography.md) | Font families, hash sizes, numeric display sizes, font features, mono tracking |
| [spacing.md](./spacing.md) | Table row height, cell padding, page layout, touch targets, breakpoints |
| [radius.md](./radius.md) | Border radius scale and philosophy |
| [elevation.md](./elevation.md) | Z-index scale and stacking model |
| [motion.md](./motion.md) | Duration tokens, three canonical easings, composite transitions, skeleton + copy interaction timings |
| [component-tokens.md](./component-tokens.md) | Badge and search dimensions (temporary — will move into `components/badge/` and `components/search/` once those exist) |

## Layering Model

```
@repo/ui base tokens          — general-purpose, app-agnostic
    ↓
ThruScan overrides            — personality adjustments
    ↓
Blockchain semantic tokens    — chain data, tx status, network health
```

## Implementation

### File location

```
apps/thruscan/app/globals.css
```

### CSS custom property pattern

`@theme inline` in Tailwind 4 resolves values at build time and does not support `light-dark()` runtime evaluation. Use standard CSS custom properties for any token that uses `light-dark()`.

```css
@import "@repo/ui/styles.css";

:root {
  color-scheme: dark;

  --color-primary: light-dark(#4f46e5, #6366f1);
  /* ... all light-dark() tokens */
}

@theme {
  --badge-height: 20px;
  --table-row-height: 44px;
  /* ... all static tokens */
}
```

### Browser fallback for `light-dark()`

```css
:root {
  --color-tx-confirmed: #22c55e;  /* dark-first hard fallback */

  @supports (color: light-dark(red, blue)) {
    --color-tx-confirmed: light-dark(#16a34a, #22c55e);
  }
}
```

### Font loading

Geist is in the monorepo as `GeistVF.woff` and `GeistMonoVF.woff`. Wire in `layout.tsx` as CSS variables matching `--font-display` and `--font-data`.

## Token naming convention

**Suffixes:**
- No suffix = foreground text color (e.g. `--color-tx-confirmed`)
- `-bg` = background fill
- `-hover` = hover state override
- `-row-bg` = table row background (distinct from element bg)
- `-ring` = focus/interaction ring color

**Namespaces:**
- `--color-tx-*` — transaction status semantics
- `--color-network-*` — network health semantics
- `--color-hash-*` — monospace/address interaction states
- `--color-surface-*` — background surfaces (not text)
- `--color-data-link` — generic chain data link (v1)
- `--color-entity-*` — per-entity-type links (v2)

**When to add a new token vs. reuse:** Add a new token only when the value needs to change independently from existing tokens. If a new component always shares a value with an existing token, use the existing token with an alias comment.

## Honest status

| Section | Status |
|---|---|
| Tx status colors | Provisional — WCAG-verified, not user-tested |
| Typography tokens | Provisional — Geist availability unconfirmed |
| Spacing / layout | Provisional |
| Entity link colors | Deferred to v2 |
| Density modes | Deferred to v2 — single mode ships in v1 |
| All token values | Not validated with real users |

## Open questions

| Question | Impact | Priority |
|---|---|---|
| Confirm Thru brand primary hue | Overrides `--color-primary` | High |
| Confirm Geist Mono `ss01` feature availability in woff files | Affects hash readability | Medium |
| Light mode opt-in vs. system-preference-based switching | Changes `color-scheme` strategy | Medium |
