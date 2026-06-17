# Agent Attachment Drawer — Footer Hierarchy

The footer's job is: let the user confirm what their Save will do before they click it. Consequence first, reference data second.

## Order (top → bottom inside footer block)

1. Consequence line — what the Save will do (visible only when `isDirty`)
2. Model + Cost reference rows (always visible, secondary tier)
3. Action row `[Close]` `[Save (N changes)]`

Current layout puts items in order 2 → 1+3 (consequence is inline-left of the buttons, below Model/Cost). The fix swaps them: consequence moves above Model/Cost as its own row.

---

## Consequence line spec

**Trigger:** renders when `pendingAddCount > 0 || pendingRemoveCount > 0` (matches existing `isDirty` logic — no new condition needed).

**Copy:** unchanged from current `consequence-note.tsx` — the three variants are correct:
- Add only: `Adding N taskset(s) — this agent will run on each (~$0.12 / run when active).`
- Remove only: `Detaching N taskset(s) — no further runs there.`
- Both: `Adding N, detaching N tasksets — cost (~$0.12 / run) applies to each active attachment.`

**Icon:** drop `ArrowUpRight`. It carries no semantic weight here and costs visual scan. Replace with no icon. If an indicator is still wanted, a solid dot (`·` U+00B7) as a left gutter marker is acceptable; do not use an arrow.

**Font:** `text-body text-foreground` — upgrade from the current `text-label text-muted-foreground`. This is the most important line in the footer; it must read at full weight. `text-body` = 14px per the project default. `text-foreground` (not muted) because the user must clock it before clicking Save.

**Wrap behavior at narrow widths:** truncate with `truncate` + Tooltip for the full string. Do not let the consequence line overflow into the action button row. The current bug (text wraps under the avatar trigger at narrow widths) is caused by the consequence line and buttons sharing one flex row — moving the consequence to its own row above the buttons eliminates the collision entirely. With its own full-width row and `truncate`, overflow is contained. Tooltip surfaces the full string on hover/focus so truncation is lossless.

**Aria:** keep `role="status" aria-live="polite"` on the wrapper — the live region must persist in the DOM even when invisible so screen readers announce the update when changes are staged. Existing `consequence-note.tsx` already does this correctly.

---

## Reference rows (Model / Cost)

Downgrade to secondary tier now that they are no longer the visual lead.

- **Font:** `text-label text-muted-foreground` for both key and value (currently key is `text-muted-foreground`, value is `text-foreground` — both move to muted at this tier)
- **Exception:** the cost numeric itself (`$0.12`) stays `font-mono` for alignment; its color becomes `text-muted-foreground` rather than `text-foreground`
- **Layout:** same two-column `<dl>` key-value structure, `w-12` label column — no structural change
- **Conditionality:** always visible (no change). Model and cost are reference data for audit, not conditional on dirty state. Riley and Sam both benefit from seeing the model/cost even when no changes are staged — it is how they verify they are looking at the right agent before attaching.

---

## Full footer DOM order (revised)

```
<DrawerFooter className="flex-col items-stretch justify-start gap-3 border-t border-border">

  {/* 1. Consequence — own row, full width */}
  <ConsequenceNote ... />

  {/* 2. Reference metadata */}
  <FooterMetadata ... />

  {/* 3. Action row */}
  <div className="flex items-center justify-end gap-2">
    <Button variant="ghost" onClick={onClose}>Close</Button>
    <Button variant="primary" onClick={handleSave} disabled={!isDirty || isSaving}>
      {saveButtonLabel}
    </Button>
  </div>

</DrawerFooter>
```

Note: action row changes from `justify-between` to `justify-end` — the consequence line is no longer inline-left of the buttons, so there is no left content to space against.

---

## Where to edit

**Primary file — footer layout:**
`apps/portal/src/app/(app)/agents/_components/preset-agent-detail-drawer/index.tsx`
Lines 251–283 — the `<DrawerFooter>` block. Move `<ConsequenceNote>` from inside the `<div className="flex items-center justify-between gap-3">` row (line 257) to a standalone row above `<FooterMetadata>`. Remove `justify-between` from that div (or remove the div entirely; the buttons alone need `justify-end` or can be a plain `flex gap-2` flush right).

**Secondary file — consequence line styling:**
`apps/portal/src/app/(app)/agents/_components/preset-agent-detail-drawer/consequence-note.tsx`
Line 61 — `<div className="flex items-start gap-1.5 text-label text-muted-foreground">`:
- Remove `ArrowUpRight` icon import and JSX (lines 3, 62–63)
- Change classes to `text-body text-foreground`
- Add `truncate` to the `<span>` and wrap in a `<Tooltip>` for the full string at narrow widths

**No changes needed** to `drawer-sections.tsx` `FooterMetadata` structure — only token class values on the dt/dd elements change (value color: `text-foreground` → `text-muted-foreground`).

---

## Operator override notes

- **Color choice:** consequence line is `text-foreground`, not `text-state-warning` or `text-state-running`. This is a confirmation of intent, not a warning. The user already chose to stage the change; the footer is confirming it back. If the operator wants the add-only variant to read more urgently (cost implication), `text-foreground` with `font-medium` is the next step before introducing a semantic color.
- **Icon removal:** `ArrowUpRight` dropped because it pointed nowhere and added scan cost. If the operator wants a visual differentiator to separate the consequence line from the reference rows visually, a `border-l-2 border-primary pl-2` left accent on the consequence div is an alternative to color — it signals "this is the active change" without implying warning.
- **Buttons flush right:** moving to `justify-end` means Close is no longer implicitly associated with the consequence text. If the operator prefers Close to stay left-aligned as a "bail out" affordance, `justify-between` with an empty spacer div works — but the current pairing of consequence-text + Close was accidental, not intentional.

---

## Persona anchor

- **Alex** moves fast and doesn't want surprise cost — consequence line at full `text-foreground` above the fold of the footer stops him before he clicks Save without thinking.
- **Sam** audits before clicking — Model/Cost reference rows remain visible (not hidden) so he can cross-check model identity against his expected cost before saving.
- **Riley** is bulk-attaching — he reads the consequence line quickly across multiple drawers. `truncate` + Tooltip means he is never slowed down by wrapping text, and the Tooltip is available if he needs the full string.
