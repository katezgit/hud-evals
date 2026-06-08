# Empty + Error State Patterns

**Scope:** Project-agnostic guidelines for empty and error state surfaces in dashboard products.

---

## 1. Decision tree — which component to use

Start at the top. Use the first match.

```
Did the page / region fail to load entirely?
  YES → ErrorState

Did a form field fail validation?
  YES → Inline field error (attached to the input)

Did a user action complete but something peripheral went wrong?
  YES → Toast (if transient / auto-dismisses) or Alert (if persistent / requires awareness)

Is a content region loaded but showing nothing?
  Is there a filter, search, or query active?
    YES → EmptyState variant="no-results"
    NO  → EmptyState variant="zero-state"
```

### Summary table

| Situation | Component |
|---|---|
| Region or page failed to load; data cannot be shown | **ErrorState** |
| Collection is genuinely empty; no failure | **EmptyState** `zero-state` |
| Filter / search / query returned nothing; data is intact | **EmptyState** `no-results` |
| Page loaded; a peripheral action failed or needs attention | **Alert** (inline) |
| Ephemeral feedback after a user action | **Toast** |
| Single input failed validation | **Inline field error** |

**Key test for ErrorState vs EmptyState:** Is the content region replaced by the failure, or
is it simply unfilled? If the user cannot reach their intended surface without retrying — use
ErrorState. If data loaded fine and the collection happens to be empty — use EmptyState.

**Key test for zero-state vs no-results:** Is there active filter or search state? If yes,
`no-results`. If the collection is genuinely empty independent of any filter — `zero-state`.
Never show a zero-state icon block while a filter is active; the user will think they are at
the wrong place, not that their query is too narrow.

---

## 2. Anatomy patterns

Both components share the same structural skeleton: a vertically centered column with a fixed
stack order. The differences are in which slots are present and what they communicate.

### EmptyState

```
[icon block]        ← present for zero-state; absent for no-results
[title]             ← required
[subtitle]          ← optional
[CTA]               ← optional; one maximum
```

### ErrorState

```
[icon block]        ← present by default; suppressible for compact contexts
[title]             ← required
[subtitle]          ← optional but strongly recommended for any surface with user data
[action slot]       ← optional; one or two actions maximum
```

### Layout principles

- **Vertical centered column.** `flex-direction: column; align-items: center; text-align: center`.
- **Icon block sits above title.** No swap, no side-by-side layout.
- **Title above subtitle.** Fixed order.
- **CTA / action below subtitle** (or below title if no subtitle).
- **Padding scales with context.** Full-panel contexts use generous vertical padding (e.g.
  `py-12`). Compact dropdowns or inline filter results collapse to a tighter value (e.g. `py-6`).
  The component accepts a `className` override for callers that need custom padding in full-height
  panels — the component itself does not manage viewport-filling centering.
- **Icon and icon container are shown or suppressed together.** Never show a bare icon without
  its container; never show an empty container without an icon.

---

## 3. Variants — the universal axes

These axes apply regardless of which project uses this codebase. They define the combinatorial
surface of both components.

### EmptyState axes

| Axis | Options | Rule |
|---|---|---|
| Variant | `zero-state` / `no-results` | Drives whether the icon block is shown at all |
| Icon | present / absent | Required for `zero-state` at full size; absent for `no-results` |
| Subtitle | present / absent | Omit when context is self-explanatory and one line suffices |
| CTA | present / absent | One maximum; absent for read-only contexts |
| Size | regular / compact | Regular for full-panel and table bodies; compact for dropdown interiors |

**Compact size behavior:** At compact size the icon block is suppressed even for `zero-state` —
the container at that scale adds visual weight without spatial gain. Text only.

### ErrorState axes

| Axis | Options | Rule |
|---|---|---|
| Icon | present (default) / suppressed (`icon={null}`) | Suppress in compact regions where the container dominates |
| Subtitle | present / absent | Almost always present — reassurance is load-bearing |
| Action | present / absent / two actions | Two-action maximum; primary action renders first |

---

## 4. Copy voice

### Universal principles (apply to every project)

**DO:**
- Name the content type or feature in the title. "No active runs" or "Couldn't load runs" — not
  "Nothing here" or "Error".
- Keep the title to five words or fewer.
- Keep the subtitle to one or two short sentences.
- Give the user a concrete next action. Name the action and its object in the CTA label:
  "Start a run", "Clear filters", "Try again". Not "Go", "Do it", "Get started".
- For error subtitles: use a two-part structure — what failed + reassurance. "Something went wrong
  loading [feature]. [Reassurance]."
- Suppress subtitle when context makes the single title unambiguous (rare but valid).

**DON'T:**
- Use filler openings: "Oops", "Hmm", "Uh oh", "It looks like...", "Unfortunately...".
- Restate the title in the subtitle. Every word must add signal.
- Use generic CTAs: "Get started", "Add item", "Try again" without naming what is being retried
  (in a named context).
- Include technical detail in the rendered UI (HTTP codes, stack traces, internal method names).
- Use blame language ("You may have lost connection") — frame failure as a system event.
- Use two CTAs on EmptyState (one maximum).

**zero-state copy form:** State what is absent, present tense. "No active runs." Then state what
will fill the space. "Runs you start will appear here." Forward-looking without encouraging
narrative.

**no-results copy form:** Name the failure mode. "No matches." Then give the fix. "Adjust your
filters." One sentence each. Direct.

**ErrorState copy form:** "Couldn't load [feature]." Then: "Something went wrong. [Reassurance
if data is personal]." Then action: "Try again."

Register, warmth, and exact word choices are project-level decisions documented in each product's copy voice spec.

---

## 5. Accessibility (universal)

These rules are non-negotiable regardless of project personality.

### EmptyState

- Root element: `role="status"`. Screen readers announce the state when it dynamically replaces
  list content.
- Icon: `aria-hidden="true"`. Decorative — semantic meaning lives on the title.
- No keyboard focus trap. CTA participates in normal tab order.
- WCAG AA minimum on both title and subtitle colors against their background.

### ErrorState

- Root element: `role="alert"` + `aria-live="assertive"`. Screen readers announce immediately
  when the error is injected into the DOM.
- Icon: `aria-hidden="true"`. The title carries semantic meaning.
- On mount, focus should move to the action button (if present) so keyboard users can retry
  without navigating back. This is **caller responsibility** — implement via `autoFocus` or a
  `useEffect` ref in the parent boundary. The component does not enforce it internally.
- WCAG AA minimum on title and subtitle. Icon on its container fill: AA minimum.

### Shared

- Do not suppress the action entirely on error. Giving the user something to do reduces
  stuck/helpless moments and is essential for accessible UX.
- Icon container fill and icon color must meet AA contrast against each other.
- CTA inherits focus ring from the Button component — no custom focus treatment needed at the
  EmptyState or ErrorState level.

---

## 6. Consumer integration patterns

How the component is placed affects which size and padding settings to apply.

### Inline in a list or table body

The component renders inside a full-width cell (e.g. `<td colSpan={n}>`). The wrapper cell
is the caller's responsibility.

- Use regular size.
- Padding: default (`py-12 px-6` or equivalent for the project's scale token).
- For `zero-state` in a table: include the icon and CTA — high value for first-time users.
- For `no-results` in a table: subtitle is sufficient; CTA only if clearing the filter is an
  explicit action.

### Inline in a dropdown or command palette

The component renders inside a constraint-height list overlay (combobox, command palette, select).

- Use compact size.
- Icon is suppressed (compact size behavior).
- Title only is often sufficient. Subtitle adds height without proportional value at this scale.
- The outer primitive (e.g. `CommandEmpty` from cmdk) controls visibility — the component
  replaces the content inside it, not the primitive itself.

### Full-region replacement (page error boundary, drawer body)

The component fills the region intended for main content.

- Use regular size.
- The parent sets max-width (e.g. `max-w-sm` or `max-w-md` centered) — the component does not
  enforce a max-width internally.
- Page-level error boundaries use `flex-1 items-center` to fill the viewport — set at the page
  level, not inside the component.
- `role="alert"` + focus management is critical here; the user arrived expecting content.

### Inside a Card (compact empty)

A card used as a list-shell container (e.g. "Recent activity" card) may have zero items.

- Use regular size if the card has substantial height; compact if the card is a small widget.
- If the card title already communicates the content type, the icon can be omitted.
- CTA inside a card should only appear if the action originates on this surface. If the action
  requires navigating away, a text link is often more appropriate than a Button.

---

## 7. Token roles

Components reference these semantic token roles. Rename token values per project palette; keep the role names.

| Token name | Role |
|---|---|
| `--color-foreground` | Title text |
| `--color-muted-foreground` | Subtitle text |
| `--color-muted` | EmptyState zero-state icon container fill |
| `--color-state-errored` | ErrorState icon color |
| `--color-state-errored-subtle` | ErrorState icon container fill |
| `--radius-lg` (or equivalent) | EmptyState icon container shape |
| `--radius-full` | ErrorState icon container shape |
