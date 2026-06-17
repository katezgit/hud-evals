# Header Rhythm

Personality posture is **spare and dense** (see `docs/product/personality.md`). Alex arrives 40 minutes deep into a problem; Sam needs a Trace in 90 minutes. Gaps that read as "airy" in a marketing context read as "wasteful" here. Every spacing value is the tightest value that avoids a collision — not the most comfortable value that still works.

---

## Canon

| Relationship | Value | Token | Notes |
|---|---|---|---|
| Title → Description (index pages: h1 → p) | 4px | `gap-1` | Line-height already opens space; any larger reads as a section break, not a subtitle |
| Title column → Metadata row (detail pages: h1+badges → `·`-separated row) | 4px | `gap-1` | Same logic — both lines are part of the same header unit |
| Metadata row — between items (count · slug · owner) | 8px | `gap-2` | Needs breathing room to parse as discrete tokens at a glance |
| Slug + CopyButton inline group | 0px | `gap-0` (or omit `gap`) | CopyButton (`size-6 IconButton`) carries its own internal padding; explicit gap adds dead space between text and copy target |

**One outlier to normalize:** `header-subtitle.tsx` in the Models detail currently uses `gap-1.5` (6px) for its metadata row. Canon is `gap-2` (8px) — update to match.

---

## Utilities to add to `apps/portal/src/app/globals.css`

```css
/* ─── Page header ─────────────────────────────────────────────────────────────
 * Wraps the full <header> element inside a page-shell page.
 * Owns: Title → Description/Metadata-row vertical rhythm (gap-1).
 * Does NOT own: breadcrumb → title gap (gap-3 stays inline on call sites that
 * have breadcrumbs, because index pages have no breadcrumb). */
@utility page-header {
  @apply flex flex-col gap-1;
}

/* ─── Page header meta row ────────────────────────────────────────────────────
 * Wraps the horizontal `count · slug · owner` row on detail pages.
 * Owns: between-item spacing (gap-2) + text/color base for the row.
 * Compose inside page-header's title column, after the <h1> block. */
@utility page-header-meta {
  @apply flex flex-wrap items-center gap-2 text-body text-muted-foreground;
}

/* ─── Slug + CopyButton inline group ─────────────────────────────────────────
 * Wraps the `<span class="font-mono">{id}</span><CopyButton/>` pair.
 * Gap is intentionally 0: CopyButton (size-6 IconButton) supplies its own
 * internal padding; any added gap creates dead space between the text and
 * the copy target, breaking the flush "one unit" affordance. */
@utility page-header-meta-group {
  @apply inline-flex items-center gap-0;
}
```

**Call-site shape after adopting these:**

```tsx
// Index page (no breadcrumb, no meta row)
<header className="page-header">
  <div className="flex items-center justify-between gap-2">
    <h1 className="text-display font-semibold text-foreground">Jobs</h1>
    {/* doc link, CTA */}
  </div>
  {description && <p className="text-body text-muted-foreground">{description}</p>}
</header>

// Detail page (breadcrumb lives outside page-header; title column uses page-header)
<div className="flex min-w-0 flex-col page-header">          {/* was: gap-1 inline */}
  <div className="flex items-center gap-2">
    <h1 className="text-display font-semibold text-foreground">{name}</h1>
    {badge}
  </div>
  <div className="page-header-meta">                         {/* was: gap-2 inline */}
    <span>{count} Tasks</span>
    <Separator />
    <span className="page-header-meta-group">               {/* was: gap-1 inline */}
      <span className="font-mono">{slug}</span>
      <CopyButton … />
    </span>
    <Separator />
    <span>Owned by: {owner}</span>
  </div>
</div>
```

---

## Leave inline (judgment call)

**Breadcrumb → title gap (`gap-3`, 12px).** The breadcrumb row lives outside the title column and its spacing to the title block varies slightly depending on whether the header has a `pt-2` offset or sits flush in the shell. Baking it into `page-header` would force a `pt-2` assumption on the outer `<header>` that not all pages share. Leave `gap-3` inline on the outer `<header className="flex flex-col gap-3 …">`.

**Outer `<header>` on detail pages.** Detail-page headers use `<header className="flex flex-col gap-3 pt-2 pb-6">` — this is the breadcrumb-to-title-block rhythm, not the header's internal title column rhythm. The two should not be conflated. `page-header` targets the title column `<div>` (h1 → subtitle/meta), not the full `<header>` element on detail pages.

---

## Relation to `page-shell`

`page-shell` owns the browser-edge-to-header (`py-6`) and header-to-content (`gap-6`) spacing. The utilities here own the rhythm *inside* the header block. They compose without conflict: a page-shell page places a `<header class="page-header">` as its first child; `page-shell`'s `gap-6` separates that header from the content block below.
