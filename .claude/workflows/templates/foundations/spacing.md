# Spacing Tokens

## Table row height

V1 ships one density: `44px`. This is the minimum touch target for consumer users on phones. Developer users get the same — it is comfortable for scanning.

```css
--table-row-height: 44px;  /* v1 only */

/* v2 options (validate before building): */
/* --table-row-height-compact:    36px; */
/* --table-row-height-comfortable: 52px; */
```

## Table cell padding

```css
--table-cell-px-sm: 12px;  /* narrow columns: height, timestamp */
--table-cell-px-md: 16px;  /* standard columns */
--table-cell-px-lg: 20px;  /* first column, prominent data */
```

## Page layout

```css
--page-header-height:          56px;
--network-strip-height:        32px;
--page-max-width:            1280px;
--page-content-padding-x:      24px;   /* desktop */
--page-content-padding-x-sm:   16px;   /* mobile */
```

## Mobile touch targets

Minimum touch target for any interactive element: `44px` × `44px`. Applies to:
- Copy hash button
- Status badge (if tappable)
- Table row tap area
- Search input
- Navigation items

## Responsive breakpoints (table → card collapse)

Tables become unreadable on narrow screens. Collapse to card layout at:

- `< 640px` (sm): tables collapse to stacked card rows
- `640–1024px` (md): tables show reduced columns
- `> 1024px` (lg): full table view

At `< 640px`: hide secondary columns (timestamp, gas, nonce), show only the data the consumer persona needs (hash truncated, status, value, age).

## Search component spacing

```css
--search-height:     44px;   /* touch-safe minimum */
--search-max-width: 640px;
```

## Summary

| Token | Value |
|---|---|
| `--page-header-height` | `56px` |
| `--network-strip-height` | `32px` |
| `--page-max-width` | `1280px` |
| `--page-content-padding-x` | `24px` |
| `--page-content-padding-x-sm` | `16px` |
| `--table-row-height` | `44px` |
| `--table-cell-px-sm` | `12px` |
| `--table-cell-px-md` | `16px` |
| `--table-cell-px-lg` | `20px` |
