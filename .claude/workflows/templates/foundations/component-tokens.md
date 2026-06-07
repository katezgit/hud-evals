# Component Tokens (Temporary)

These are component-level dimension tokens. They live here until `components/badge/` and `components/search/` exist as full component specs — at which point they should move into those folders.

## Status badge

The badge appears on every transaction row.

```css
--badge-height:      20px;
--badge-padding-x:    8px;
--badge-font-size:  0.6875rem;  /* 11px */
--badge-font-weight: 500;
--badge-radius:      var(--radius-badge);  /* 4px */
--badge-line-height: 1;
```

## Search

Search is the primary interaction on any block explorer.

```css
--search-focus-ring-color:   var(--color-focus-ring);
--search-focus-ring-width:   2px;
--search-focus-ring-offset:  0px;  /* inset ring on dark bg */

--search-result-row-height:  44px;
--search-result-row-hover:   var(--color-surface-row-hover);
--search-result-icon-size:   16px;

--search-no-results-color:   light-dark(#737373, #525252);
--search-input-icon-size:    18px;
--search-input-icon-color:   light-dark(#9ca3af, #6b7280);
```

## Summary

| Token | Value |
|---|---|
| `--badge-height` | `20px` |
| `--badge-padding-x` | `8px` |
| `--badge-font-size` | `11px` |
| `--badge-radius` | `4px` |
| `--search-height` | `44px` |
| `--search-max-width` | `640px` |
| `--search-result-row-height` | `44px` |
| `--search-input-icon-size` | `18px` |
