# Elevation & Z-Index Tokens

Dark mode renders shadow-based elevation invisible. Use surface color steps (see [color.md](./color.md) §Surface depth) for visual depth, and z-index for stacking order.

## Z-index scale

```css
/* Stacking order (ascending) */
--z-base:           0;
--z-network-strip: 30;   /* health bar — above content, below header */
--z-sticky-header: 20;   /* sticky nav */
--z-hash-tooltip:  40;   /* full hash overlay on truncated hash hover */
--z-modal:         50;   /* dialogs, sheets */
```

`--z-sticky-header: 20` and `--z-network-strip: 30` — the strip sits visually above the header when scrolling. If the strip scrolls away first, set strip to `z: 10` and header to `z: 20`.

## Sticky header separator

Shadows are invisible on dark; use a border instead.

```css
--border-header-bottom: 1px solid var(--color-border-default);
```

## Summary

| Token | Value |
|---|---|
| `--z-base` | `0` |
| `--z-sticky-header` | `20` |
| `--z-network-strip` | `30` |
| `--z-hash-tooltip` | `40` |
| `--z-modal` | `50` |
