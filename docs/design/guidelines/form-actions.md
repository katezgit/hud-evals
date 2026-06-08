# Form Footer Action Pattern — Save / Cancel

**Scope:** Cross-cutting interaction pattern for forms in dashboard products (settings pages, resource creation forms, inline edit panels, side-drawer forms). This is not a component spec — it governs the behavior and layout of the footer action area of any form. Component implementation detail lives in the design system.

---

## 1. The rule

> **Save** is always visible and always enabled.
> **Cancel** is rendered only when the form is dirty (the user has made unsaved changes).

No state of the form — empty, partially filled, fully filled, validation-errored, loading — changes Save's presence or enabled state. Cancel's presence is the only variable; it appears and disappears based on dirty state alone.

---

## 2. Rationale

Predictable affordances reduce scan cost in tools used by expert operators across long sessions. A Save button that conditionally appears or greys out forces users to verify footer state before acting. Always-present Save removes that check.

Cancel's conditional rendering carries a secondary function: it signals "you have unsaved changes" without a separate dirty indicator. A clean form has no Cancel. When Cancel appears, the user knows — without reading any label — that there is something to revert. This is ambient status.

Two alternatives this pattern rejects:

- **Disable-until-dirty** penalises re-submission of an unchanged form — which may be a legitimate action in some domains. It also forces the user to make a change just to prove they can save.
- **Disable-until-valid** moves validation state into the button instead of inline into the field. It hides the reason for inaction. Inline errors locate the problem at the source; a greyed Save does not.

---

## 3. Behavior detail

### What "dirty" means

The form is dirty when any field's current value differs from the value it held when the form was loaded (or when it was last successfully saved). Dirty resets to clean after:

- A successful save (server confirms the write).
- An explicit revert (user presses Cancel and form values return to their loaded state).

Dirty does not reset on navigation — if the user navigates away with unsaved changes, the caller is responsible for an unsaved-changes guard (browser `beforeunload` or in-app route guard). That guard is out of scope for this pattern.

### What Save does when the form is clean

Save remains responsive on a clean form. Whether the network round-trip runs or is short-circuited client-side is an implementation choice that depends on whether re-submitting identical data carries semantic value in your domain (e.g. force-re-run vs. idempotent save). The user-visible feedback — success confirmation — must be the same either way.

---

## 4. Visual and layout

### Button order and alignment

```
[  form fields  ]
─────────────────────────────────
                [Cancel]  [Save]
```

- Footer is right-aligned.
- Save is the rightmost (primary) button.
- Cancel sits immediately left of Save.
- No other actions in the footer. Destructive actions (delete, archive) live elsewhere — in a dedicated danger zone or a confirmation dialog, never alongside Save/Cancel.

### No layout jump on Cancel appearance

Save's position must not change when Cancel appears or disappears. Two acceptable implementations:

1. **Reserve the space.** Always allocate Cancel's width in the footer; render it invisible (`opacity: 0`, `pointer-events: none`) when clean. Save's x-position stays constant.
2. **Animate Cancel in.** Render Cancel with a brief opacity + translate-x enter transition when dirty state is first detected. Save does not move — Cancel slides into the reserved space from the left.

Option 1 is the default. Option 2 is acceptable on prominent editing surfaces where Cancel's appearance is a meaningful signal (e.g. a full-page settings form). If your project has a motion system, defer the animation spec there; otherwise pick one approach and document it once.

---

## 5. Edge cases

### Form is submitting

While a save is in flight:

- Save shows a loading state (spinner replaces label or sits inline — per the Button component's loading variant).
- Cancel is hidden (not merely disabled). There is nothing to cancel client-side while the request is mid-flight. If server-side cancellation is required, that is a separate affordance, not the footer Cancel.
- After the request settles: on success, dirty resets to clean and Cancel disappears; on failure, the form returns to its pre-submit dirty state and Cancel reappears.

### Validation errors

Save remains enabled. Validation errors surface inline on the fields that failed, on submit attempt. Save does not pre-disable based on field validity.

Inline errors on submit are immediate and located — the user presses Save, errors appear adjacent to the offending fields, the path forward is clear.

### Destructive or irreversible forms

This pattern applies unchanged. When a form targets a resource whose edits are difficult or impossible to undo, trigger a confirmation dialog on Save. The dialog is separate from the form footer and does not alter Save's enabled state or Cancel's visibility logic. Never put irreversibility warnings in the footer alongside the buttons.

---

## 6. When NOT to use this pattern

| Context | Why this pattern does not apply |
|---|---|
| **Modal / dialog forms** | The dialog's Cancel/Close button is part of the dismiss affordance and must always be visible — it doubles as the escape hatch for the overlay. Follow dialog-specific dismiss patterns instead. |
| **Multi-step wizard forms** | Back and Next replace Save/Cancel in the step footer. A Save or Finish button may appear only on the final step. The dirty/clean logic does not apply to in-progress multi-step state. |
| **Inline cell editing (tables)** | Confirm (✓) and discard (✕) icon buttons are the right affordance at that density. The full Save/Cancel pattern is too heavy for a cell-level edit. |
| **Forms inside command palette or popover** | These surfaces close on Escape; no explicit Cancel button is needed. Save (or equivalent) submits and closes. |
