# Typography Tokens

## Font families

```css
--font-display: 'Geist', 'Inter', var(--font-family-sans);
--font-body:    var(--font-family-sans);
--font-data:    'Geist Mono', var(--font-family-mono);
```

**Note on Geist Mono font features:** `font-feature-settings: 'ss01' 1` (slashed zero) must be verified against the actual Geist Mono font file before shipping. Confirm `ss01` is present in the woff files used in this repo. Remove if unverified — slashed-zero is also available via `font-variant-numeric: slashed-zero` which is a safer CSS standard path.

## Hash / address sizes

Two values. The previous spec had 12px and 13px — a 1px difference imperceptible in practice.

```css
--font-size-hash-inline:    0.75rem;    /* 12px — full hash in table cells, tight contexts */
--font-size-hash-prominent: 0.875rem;   /* 14px — hash as page title/hero, detail pages */
```

## Numeric display sizes

```css
--font-size-stat-hero: 2rem;       /* 32px — TPS, block height on homepage */
--font-size-stat-lg:   1.5rem;     /* 24px — balance, large counters */
--font-size-stat-base: 1.0625rem;  /* 17px — table numeric cells */
--font-size-stat-sm:   0.8125rem;  /* 13px — secondary metrics */
```

## Font features (CSS utilities)

```css
/* Tabular figures — prevents layout jitter on live-updating numbers */
.font-tabular {
  font-variant-numeric: tabular-nums;
}

/* Monospace data — slashed zero prevents 0/O confusion in hashes */
.font-mono-data {
  font-variant-numeric: tabular-nums slashed-zero;
  /* font-feature-settings: 'ss01' 1; — verify before enabling */
}
```

## Mono tracking

```css
--tracking-mono-tight: -0.01em;  /* subtle tightening for long hash strings */
```

## Number formatting conventions

Display conventions, not tokens. Documented here for engineer reference.

- **Large integers:** Abbreviate at 1M+ (`1.23M`, `45.6K`). Show full value in tooltip.
- **Token amounts:** 4 decimal places for amounts < 1000, 2 decimal places above. Never truncate on detail pages.
- **Block heights:** Never abbreviate. Always show full integer with thousands separator (`1,234,567`).
- **Timestamps:** Relative on list views (`12s ago`), absolute ISO on detail pages.

## Summary

| Token | Value |
|---|---|
| `--font-size-hash-inline` | `12px` |
| `--font-size-hash-prominent` | `14px` |
| `--font-size-stat-hero` | `32px` |
| `--font-size-stat-lg` | `24px` |
| `--font-size-stat-base` | `17px` |
| `--font-size-stat-sm` | `13px` |
