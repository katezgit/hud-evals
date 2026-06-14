# Combobox — Component Spec

**Pattern:** Single-value searchable dropdown. Trigger IS the search input — typing in the trigger filters the popover list in real time.

**Semantic refs:** `docs/design/foundations/color.md`, `typography.md`, `sizing.md`, `radius.md`, `interaction-states.md`.

**Palette basis:** `docs/design/foundations/palette-canonical.md` (Instrument Precision v1, operator-approved 2026-05-29).

**Scope distinction:** `Combobox` = trigger-as-input that opens a filterable list for single-value commitment. Distinct from `Select` (non-searchable, closed trigger) and `MultiSelect` (multi-value chips + input). `Select` and `Combobox` share trigger chrome dimensions and state tokens — they must look identical when closed.

---

## Decisions Log

**2026-06-13** — Two-line option rendering pattern added to spec (§3a). Gap surfaced by /jobs/new redesign (PR #45, merged): taskset picker required primary name + secondary metadata line; engineers composed Popover+Command locally. Tokens and layout ratified from that implementation; visual contract now canonical.

**2026-05-30 (IP-v1)** — Open-state ring removed (`border-ring`/`shadow-focus` on open); chevron rotation is sole open indicator. `data-[state=open]:focus-visible:outline-none/shadow-none` suppression classes no longer needed. `bg-popover` dark-mode defect resolved (`components.css` dark override added).

**2026-05-28** — Open trigger no longer applies `bg-selected`. Focus ring is the sole open-state affordance — input semantic, consistent with the Input component family.

**2026-05-28** — Popover width pinned to trigger (not min-width); long labels truncate with ellipsis. `className` prop targets the wrapper element for layout control; input fills wrapper.

**2026-05-28** — Trigger hover background removed — input semantic, not button. Cursor (I-beam) is the sufficient hover affordance.

**2026-05-28** — State machine consolidated. Final model: input is a plain text filter; query initializes from `labelFor(value)` and syncs only on external value change. Commit paths (click, Enter-no-nav, Enter-on-highlight) set committed flag. Close paths revert to `initialValueRef` if uncommitted. Backspace-to-empty fires intermediate `onValueChange(null)`; revert-on-close restores if user doesn't commit.

**2026-05-28** — match-sorter filtering rule added (§5 Filtering): threshold `rankings.CONTAINS`, keys `['label', 'value']`, diacritics stripped.

**Pre-2026-05-28** — Spec evolved across multiple rounds: trigger-as-input pattern established (CommandInput removed), `searchPlaceholder` prop removed, `groups` prop added for grouped options.

---

## Pattern summary

The trigger renders as a styled `<input>` (not a `<button>`). There is no separate search input inside the popover — the trigger input IS the search. `CommandInput` inside the `Command` root is removed; the `Command` component is driven by an external controlled filter via pre-filtered option lists (`shouldFilter={false}`).

```
Closed (no value):
┌─────────────────────────────────────┐
│  Select language…               ⌕⌄  │   ← placeholder, chevron always visible
└─────────────────────────────────────┘

Open, no query typed (value = "English"):
┌─────────────────────────────────────┐
│  English                         ⌕⌄  │   ← input shows selected label as editable text
└─────────────────────────────────────┘
  ┌───────────────────────────────────┐
  │  Auto-detect                      │
  │  MOST POPULAR                     │
  │  ✓ English               ←checkmark on selected item
  │    Hindi                          │
  │    Spanish                        │
  │  ALL LANGUAGES                    │
  │    Arabic                         │
  │    Bengali                        │
  └───────────────────────────────────┘

Open, query typed ("Engl"):
┌─────────────────────────────────────┐
│  Engl                           ⌕   │   ← chevron hidden when query present; no clear-X
└─────────────────────────────────────┘
  ┌───────────────────────────────────┐
  │  ✓ English                        │   ← checkmark persists on selected item in filtered list
  └───────────────────────────────────┘
```

---

## 1. State model

### State variables

| Variable | Type | Meaning |
|---|---|---|
| `value` | `string \| null` | The committed selection. Prop-controlled — persists until user commits a new item or the parent resets it. |
| `query` | `string` | Live text in the trigger input. Internal to the component — not exposed as a prop. Also the filter source-of-truth. |
| `initialValueRef` | `string \| null` (ref) | The `value` at the moment the popover opens. Set once per open session; not updated during the session. Used by the revert path. |
| `committedRef` | `boolean` (ref) | Set to `true` on any commit path (click, Enter) during a session. Guards the revert path on close. |

### Initialization and external sync

On mount: `query = labelFor(value)` — the user sees the current selection immediately, editable as plain text.

When the `value` prop changes from outside (parent re-renders): `query = labelFor(value)`. The `initialValueRef` is allowed to drift to the new external value — external prop wins.

### Popover lifecycle

**Open (closed → open):**
- `initialValueRef.current = value` — baseline is captured
- `committedRef.current = false`
- Popover renders

**Close path — runs on every close trigger:**
- If `committedRef.current === false`: revert — `onValueChange(initialValueRef.current)` and `setQuery(labelFor(initialValueRef.current))`
- `committedRef.current = false` — reset for the next session

### Commit path

Any of the following trigger a commit:
- User clicks an item
- User presses Enter with a cmdk-highlighted item
- User presses Enter with no highlighted item (selects first filtered non-disabled item; no-op if list is empty)

On commit:
1. `onValueChange(item.value)`
2. `query = item.label`
3. `committedRef.current = true`
4. Popover closes (revert is skipped because `committedRef === true`)

### Close triggers

| Trigger | Revert? |
|---|---|
| User selects an item (commit) | No — `committedRef === true` |
| User presses Escape | Yes, if uncommitted |
| User clicks outside the popover | Yes, if uncommitted (handled via Radix `onOpenChange`) |
| Input blurs to a non-popover element | Yes, if uncommitted (150 ms setTimeout to handle item-click race) |
| Tab key | Yes, if uncommitted (blur fires; same path as above) |

### User actions while popover is open

| Action | `query` | `value` | Popover |
|---|---|---|---|
| Type / backspace | Updates | Unchanged | Stays open; list re-filters |
| Backspace until empty | `""` | `onValueChange(null)` fired immediately (intermediate) | Stays open; full unfiltered list; revert-on-close will restore `initialValueRef` if no commit follows |
| ArrowDown / ArrowUp | Unchanged | Unchanged | cmdk moves highlighted item |
| Enter (no highlighted item) | Synced to first match's label | `onValueChange(first.value)` | Closes |
| Enter (highlighted item) | Synced to item label | `onValueChange(item.value)` | Closes |
| Click an item | Synced to item label | `onValueChange(item.value)` | Closes |
| Escape | Reverted to `labelFor(initialValueRef)` | Reverted to `initialValueRef` | Closes |
| Click outside / blur to external | Reverted to `labelFor(initialValueRef)` | Reverted to `initialValueRef` | Closes |

### State transitions table

| Trigger | `value` | `query` | Popover |
|---|---|---|---|
| Component mounts with no `value` | `null` | `""` | Closed |
| Component mounts with `value` set | `"english"` | `"English"` | Closed |
| `value` prop changes externally | new value | Synced to new selected label (or `""`) | Unchanged |
| User clicks / focuses trigger (closed) | unchanged | unchanged | Opens; `initialValueRef` captured |
| User types "Engl" | unchanged | `"Engl"` | Open; list filtered |
| User selects item from list | `"english"` | `"English"` | Closes (commit path) |
| User backspaces to empty (`query === ""`) | `null` (intermediate) | `""` | Open; revert will restore on close if uncommitted |
| User presses Escape (uncommitted) | Reverted to `initialValueRef` | Reverted to `labelFor(initialValueRef)` | Closes |
| User clicks away (uncommitted) | Reverted to `initialValueRef` | Reverted to `labelFor(initialValueRef)` | Closes |
| Input blurs to non-popover element (uncommitted) | Reverted to `initialValueRef` | Reverted to `labelFor(initialValueRef)` | Closes |
| ArrowDown key (closed) | unchanged | unchanged | Opens |
| ArrowDown / ArrowUp key (open) | unchanged | unchanged | cmdk moves highlight |
| Enter (highlighted item) | `item.value` | `item.label` | Closes (commit) |
| Enter (no highlighted item) | `first.value` | `first.label` | Closes (commit); no-op if list empty |

### Backspace-to-empty: intermediate vs. permanent

When the user backspaces until `query === ""`: `onValueChange(null)` fires immediately as **intermediate feedback** — the checkmark disappears and the list shows unfiltered. This is NOT a permanent clear. If the user then selects an item, that commit wins. If the user closes without committing, the revert path fires and restores `initialValueRef`.

### Display rule

`query` is always the input's displayed value. There is no separate "unfocused display" path.

---

## 2. Trigger visual

### Chrome

The trigger uses the same visual chrome as `SelectTrigger`: `h-8` / `h-7` heights, `px-2.5` / `px-2` padding, `rounded-lg` (md) / `rounded-md` (sm), `border border-border`, `bg-background`. The element is an `<input type="text">` instead of a `<button>` — the chrome classes apply identically.

| Size | Height | Padding | Radius | Background |
|---|---|---|---|---|
| `md` (default) | `h-8` (32px) | `px-2.5` (10px) | `rounded-lg` (8px) | `bg-background` |
| `sm` | `h-7` (28px) | `px-2` (8px) | `rounded-md` (6px) | `bg-background` |

`bg-background` is the recessed well — not transparent. `bg-transparent` was pre-v1; Input-parity requires `bg-background`.

The `SelectTrigger` parity goal holds for the **closed/unfocused** state. When open and typing, the trigger diverges from `Select` intentionally.

### Chevron

| Input state | Chevron (`ChevronsUpDownIcon`) |
|---|---|
| No query (empty input) | Visible; `text-muted-foreground opacity-mid` |
| Query present (`query.length > 0`) | Hidden (`opacity-0 pointer-events-none`) |

No clear-X (×) button. Backspace-to-empty covers clearing. A clear-X would duplicate the affordance and clutter the trigger.

The chevron sits at `absolute right-2.5` inside the trigger wrapper (`pointer-events-none`). The input has `pr-8` (md) / `pr-7` (sm) to avoid text running under it. `opacity-0` (not `hidden`) so there is no layout shift when the chevron disappears.

Combobox uses `ChevronsUpDownIcon` (double chevron), not `ChevronDownIcon` (Select). The double chevron signals "this field is typeable and filterable."

### Focus indicator

- Closed, focus-visible: global `*:focus-visible` ring — `outline-ring` + `shadow-focus`. No override needed.
- Open: No `border-ring`/`shadow-focus` on open state — chevron rotation is the only open signal. `data-[state=open]:focus-visible:outline-none/shadow-none` suppression classes are not needed.

The trigger input retains focus throughout the open state. cmdk's keyboard model keeps focus on the input and uses `aria-activedescendant` to track the cursor in the list.

### State table

| State | Border | Background | Shadow | Chevron | Text |
|---|---|---|---|---|---|
| Idle (no value) | `border-border` | `bg-background` | — | Visible, muted | Placeholder (`text-meta-foreground`) |
| Idle (value set) | `border-border` | `bg-background` | — | Visible, muted | Selected label (`text-foreground`) |
| Hover | `border-border` | `bg-background` | — | Visible, muted | Unchanged |
| Focus-visible (closed) | base.css ring | `bg-background` | `shadow-focus` | Visible, muted | Unchanged |
| Open, no query | `border-border` | `bg-background` | — | Visible, muted | Selected label (or empty if no value) |
| Open, query present | `border-border` | `bg-background` | — | Hidden | Typed query (`text-foreground`) |
| Disabled | `border-border` | `bg-muted` | — | Visible, muted | Placeholder or value (`text-muted-foreground`) |
| Error (rest) | `border-state-errored` | `bg-background` | — | Visible, muted | Unchanged |
| Error (focus) | `border-state-errored` | `bg-background` | base.css errored ring | Visible, muted | Unchanged |

---

## 3. Item active/highlighted state

When the user presses ArrowUp or ArrowDown, cmdk moves the highlighted cursor to a list item. That item must show a visible treatment.

**Rule: reuse the dropdown/menu hover token vocabulary — do not invent a separate highlight token.**

Mouse-hover and keyboard-highlight are visually identical: same row background, same token. There is no separate "focused-but-not-hovered" state. The two interaction modes converge on a single visual affordance.

| State | Row background | Label weight |
|---|---|---|
| Default (not hovered, not highlighted) | `bg-transparent` | Regular |
| Mouse hover / Keyboard highlighted (`data-[selected=true]`) | `bg-border` — matches CommandItem and Select patterns | Regular |
| Selected (checkmark present) | `bg-transparent` | Regular |
| Selected + highlighted | `bg-border` | Regular |

**No `font-medium` on highlighted or selected rows.** Weight shift causes layout shift. Ratchet the fill token only.

The checkmark (`CheckIcon`) on the selected row is determined by `value === option.value`, independent of highlight state. `opacity-0` / `opacity-100` toggle — reserves icon width unconditionally to prevent text reflow when an item becomes selected.

---

## 3a. Two-line option rendering

### When to use

Use two-line rendering when the secondary metadata is **load-bearing for disambiguation** — that is, when two or more options share an identical or near-identical primary name and the user cannot reliably distinguish them without the supplementary detail. The canonical case is the taskset picker: tasksets across owners may share names; the secondary line (`{N} tasks · visibility · by {owner}`) is the differentiator. Single-line rendering remains the default — do not add a secondary line as decoration.

### Anatomy

```
┌────────────────────────────────────────────┐
│                                            │
│  Primary name                      [✓]     │  ← text-body 14px font-medium text-foreground
│  N tasks · visibility · by owner          │  ← text-meta 12px font-normal text-muted-foreground
│                                            │
└────────────────────────────────────────────┘
   ↑                                    ↑
   flex-col items-start gap-0.5        checkmark vertically centered to full row
   py-2 px-2 pr-8
```

Container layout: `flex-col items-start`. The row expands to approximately 48–50px (8px top padding + 20px primary line + 2px gap + 16px secondary line + 8px bottom padding) — a clean and predictable step above the 32px single-line baseline.

### Token table

| Element | Token | Value | Notes |
|---|---|---|---|
| Primary line font-size | `text-body` | 14px | Matches single-line item default |
| Primary line font-weight | `font-medium` | 500 | Elevates primary above secondary without size change |
| Primary line color | `text-foreground` | `--color-foreground` | Full-contrast; same as single-line label |
| Secondary line font-size | `text-meta` | 12px | Legitimate dense-metadata use; Alex/Sam read this fluently |
| Secondary line font-weight | `font-normal` | 400 | Recedes below primary |
| Secondary line color | `text-muted-foreground` | `--color-muted-foreground` | Visually subordinate; readable against both `bg-transparent` and `bg-border` |
| Line gap (primary → secondary) | `gap-0.5` | 2px | Tight coupling — they read as one unit, not two separate elements |
| Row vertical padding | `py-2` | 8px top + 8px bottom | Preserves visual breathing room at the expanded height |
| Horizontal padding | `px-2` | 8px left; `pr-8` check-icon reserve | Matches single-line `CommandItem` horizontal rhythm |

No new design tokens. All tokens above are already defined in the HUD design system.

### Highlight and selected behavior

The `bg-border` row background on hover/keyboard-highlight (§3) applies to the **entire row**, including the secondary line area. Neither the primary nor the secondary line changes color or weight on highlight. Rule: no font-weight shift on highlight — layout shift prevention applies here as in single-line rows.

| State | Row background | Primary color | Secondary color | Checkmark |
|---|---|---|---|---|
| Default | `bg-transparent` | `text-foreground` | `text-muted-foreground` | `opacity-0` |
| Highlighted (`data-[selected=true]`) | `bg-border` | `text-foreground` | `text-muted-foreground` | unchanged |
| Selected | `bg-transparent` | `text-foreground` | `text-muted-foreground` | `opacity-100` |
| Selected + highlighted | `bg-border` | `text-foreground` | `text-muted-foreground` | `opacity-100` |

`text-muted-foreground` has sufficient contrast against `bg-border` — do not dim the secondary line further on highlight.

### Truncation

- **Primary line:** truncates with `truncate` (ellipsis + `overflow-hidden whitespace-nowrap`). The primary name is the commit-path label; partial display is acceptable.
- **Secondary line:** does **not** truncate. The secondary line is shorter by nature (structured metadata: count, enum, short owner handle) and must remain fully readable. If a secondary string is genuinely long enough to overflow (atypical), it wraps to a second line — do not clip metadata that disambiguates the selection.

### Checkmark alignment

The trailing `CheckIcon` must be **vertically centered against the full two-line row**, not pinned to the primary line. In a `flex-col` container, achieve this by wrapping the checkmark in an absolutely positioned element or by placing it in a sibling `flex` row that spans the full row height with `self-center`. The `pr-8` reserve on the row container already accounts for the icon width — the positioning rule is that the icon's visual center aligns with the row's vertical midpoint.

### Engineer note

The component API for two-line items — whether implemented as a render prop (`renderOption`), a compound subcomponent (`Combobox.Option`), or an extended `ComboboxOption.description` field — is a design-system-engineering choice. This spec defines the visual contract only: primary at `text-body font-medium text-foreground`, secondary at `text-meta font-normal text-muted-foreground`, `gap-0.5` between them, `py-2` row padding, checkmark centered to full row height. The engineer selects the API shape that best fits the existing `options`/`groups` prop contract and tree-shakes cleanly for single-line consumers.

**Decided (2026-06-13):** `renderOption: (option: ComboboxOption) => ReactNode` render prop added to `ComboboxPropsBase`. Default (omitted) renders the existing single-line `<span>{label}</span>` — all existing consumers remain unchanged. When provided, the consumer controls the row content to the left of the checkmark; the checkmark is always Combobox-owned. A companion `ComboboxTwoLineOption` helper is exported for the canonical two-line layout (`primary` + `secondary` string props). Row vertical padding overrides to `py-2` when `renderOption` is present.

---

## 5. Popover internals

### Popover width

Popover content width = trigger width exactly. `width: var(--radix-popover-trigger-width)` on `PopoverContent`, combined with `overflow-hidden`. Long option labels truncate with ellipsis.

### CommandInput removal

`CommandInput` (the search input inside the popover) is removed entirely. The trigger input replaces it.

`Command` runs with `shouldFilter={false}` — the component pre-filters options itself against `query` before passing them to `CommandList`.

### Grouped options

`ComboboxProps` takes either `options: ComboboxOption[]` (flat) or `groups: ComboboxGroup[]` (grouped) — mutually exclusive. Grouped display renders `CommandGroup` sections with headings.

### Empty state

`CommandEmpty` stays. When `query` produces no matches, it renders `emptyText` (or the default EmptyState component from `CommandEmpty`).

### Filtering

Filtering runs via `match-sorter` with `threshold: rankings.CONTAINS` and `keys: ['label', 'value']`.

**Ranking order (highest → lowest):** CASE_SENSITIVE_EQUAL → EQUAL → STARTS_WITH → WORD_STARTS_WITH → CONTAINS. Items below CONTAINS are excluded.

**Keys:** both `label` and `value` are ranked. HUD users frequently know identifiers (`claude-opus-4-7`, env slugs, dataset names) that differ from the display label.

**Diacritics:** `keepDiacritics: false` (library default). Typing without accent marks matches accented labels.

**Why not the default MATCHES threshold:** character-spread fuzzy matching produces high false-positive noise in technical-ID–heavy option lists. CONTAINS keeps results predictable.

### Checkmark logic

The trailing `CheckIcon` on a list item is rendered when `value === option.value`. Computed from `value` only — NOT from `query`.

---

## Sub-component table

| Sub-component | Root element | Role |
|---|---|---|
| `TriggerInput` (internal) | `<div>` wrapper + `<input type="text">` | Form-field chrome; live search input; opens popover on focus/type |
| `PopoverPrimitive.Content` | `<div>` portal (Radix Popover) | Floating popover surface |
| `CommandListPrimitive` | `<div>` (cmdk, `role="listbox"`) | Scrollable item container |
| `CommandEmptyPrimitive` | `<div>` (cmdk) | Empty state message row |
| `CommandGroup` | `<div>` (cmdk) | Optional group wrapper with heading label |
| `CommandItem` | `<div>` (cmdk, `role="option"`) | Selectable row |
| `ChevronsUpDownIcon` | `<svg>` (absolutely positioned in wrapper) | Open/closed state indicator; hides when query present |
| `CheckIcon` | `<svg>` (inside `CommandItem`) | Selected item indicator; opacity-toggled |

---

## States per sub-component

### TriggerInput wrapper `<div>`

| State | Wrapper class |
|---|---|
| md | `h-8` |
| sm | `h-7` |

### TriggerInput `<input>`

| State | bg | border | text (value) | placeholder | chevron | outline |
|---|---|---|---|---|---|---|
| Rest (no value) | `bg-background` | `border-border` | — | `text-meta-foreground` | `text-muted-foreground`, `opacity-mid` | none |
| Rest (has value) | `bg-background` | `border-border` | `text-foreground` | — | `text-muted-foreground`, `opacity-mid` | none |
| Rest (query typed) | `bg-background` | `border-border` | `text-foreground` | — | `opacity-0` (hidden) | none |
| Focus (closed) | `bg-background` | `border-border` | unchanged | unchanged | unchanged | base.css ring (`--color-ring`, 2px, offset 2px) |
| Open | `bg-background` | `border-border` (unchanged) | unchanged | unchanged | see query state | none — chevron rotation is only open signal |
| Open + focus-visible | `bg-background` | base.css ring applies when keyboard focus | unchanged | unchanged | see query state | base.css ring (`--color-ring`, 2px, offset 2px) |
| Disabled | `bg-muted` | `border-border` | `text-muted-foreground` | `text-muted-foreground` | `text-muted-foreground` | none |
| Error (rest) | `bg-background` | `border-state-errored` | unchanged | unchanged | unchanged | none |
| Error (focus) | `bg-background` | `border-state-errored` | unchanged | unchanged | unchanged | base.css errored ring (`--color-state-errored`) |

### PopoverPrimitive.Content

| Property | Value | Token | Notes |
|---|---|---|---|
| bg | `bg-popover` | `--color-popover` dark `#11161F` / light `#FFFFFF` | Dark override in `components.css`; correct |
| text | `text-foreground` | `--color-foreground` | Inherited |
| border | `border border-border` | `--color-border` rgba alpha | Correct |
| radius | `rounded-lg` | `--radius-lg` 8px | Floating surface tier |
| shadow | `shadow-(--shadow-popover)` | `--shadow-popover` = `--shadow-2` | Medium elevation |
| z-index | `z-dropdown` | `--z-dropdown` 30 | Correct |
| padding | `p-1` | 4px | Inset around list |
| width | `var(--radix-popover-trigger-width)` | inline style | Matches trigger width |
| sideOffset | `4` (px) | — | Gap between trigger bottom edge and content top |

### CommandListPrimitive

| Property | Value | Notes |
|---|---|---|
| max-height | `max-h-[360px]` | ~11 items at 32px before scroll |
| scroll | `overflow-x-hidden overflow-y-auto` | Correct |
| scroll-padding | `scroll-py-1` | Correct |

### CommandEmptyPrimitive (empty state)

| Property | Value |
|---|---|
| padding | `py-6` |
| text-align | `text-center` |
| font-size | `text-body` (14px) |
| color | `text-muted-foreground` |
| content | `emptyText ?? "No results found."` (or EmptyState component) |

### CommandGroup heading

| Property | Value |
|---|---|
| font-size | `text-label` (12px) |
| font-family | `font-sans` |
| font-weight | `font-normal` (400) — no medium weight |
| color | `text-muted-foreground` |
| padding | `px-2 py-1.5` |
| text-transform | none (sentence-case) |

### CommandItem (selectable row)

| State | bg | text (label) | check icon | notes |
|---|---|---|---|---|
| Rest | transparent | `text-foreground` | `opacity-0` | |
| Highlighted (`data-[selected=true]`) | `bg-border` | `text-foreground` | unchanged | |
| Selected (`aria-selected="true"`) | transparent | `text-foreground` | `opacity-100`, `text-foreground` | No bg change on selected-at-rest |
| Selected + highlighted | `bg-border` | `text-foreground` | `opacity-100`, `text-foreground` | |
| Disabled (`data-[disabled=true]`) | transparent | `text-text-disabled` | hidden | |

Padding: `py-1.5 px-2` plus trailing `pr-8` reserve for check icon. Radius: `rounded-md` (6px). Height: ~32px. Font: `text-body` (14px) `font-sans` `font-normal`.

### ChevronsUpDownIcon (chevron)

| State | opacity | color |
|---|---|---|
| Query empty | `opacity-mid` | `text-muted-foreground` |
| Query present | `opacity-0` | — |

Position: `absolute right-2.5`. Size: `size-4` (16px). `pointer-events-none`.

---

## Sizing table

| Size | Trigger height | px-padding | pr-reserve | font-size | radius |
|---|---|---|---|---|---|
| `md` (default) | `h-8` (32px) | `px-2.5` (10px) | `pr-8` (32px) | `text-body` 14px | `rounded-lg` 8px |
| `sm` | `h-7` (28px) | `px-2` (8px) | `pr-7` (28px) | `text-body` 14px | `rounded-md` 6px |

Content panel: always `rounded-lg` (8px), regardless of trigger size.
Item height: always ~32px.

---

## 6. Accessibility

### ARIA pattern

Follows **ARIA 1.2 Combobox Pattern** — "Editable Combobox with List Autocomplete" variant. The trigger `<input>` carries:

```
role="combobox"
aria-expanded={open}
aria-controls={listboxId}
aria-activedescendant={activeItemId}
aria-autocomplete="list"
aria-haspopup="listbox"
autoComplete="off"
```

`CommandList` gets `role="listbox"` and a stable `id`. Each `CommandItem` gets `role="option"`, a stable `id` (set to `option.value`), and `aria-selected={value === option.value}`.

### Keyboard model

Focus stays on the trigger input throughout. List items are not independently focusable. cmdk handles ArrowDown / ArrowUp / Enter cursor management via events bubbling from the trigger input to the `Command` root.

| Key | Behavior |
|---|---|
| Type any character | Updates `query`; filters list |
| Backspace | Edits `query`; if empty, fires `onValueChange(null)` (intermediate) |
| ArrowDown | Opens popover if closed; moves highlight down |
| ArrowUp | Moves highlight up |
| Enter (no highlighted item) | Select first filtered non-disabled item → commit; no-op if list empty |
| Enter (highlighted item) | Select highlighted item → commit |
| Escape | Close popover; revert `value` and `query` to `initialValueRef` if uncommitted |
| Tab | Close popover; blur fires → revert if uncommitted |

---

## 7. API

### Current interface

```ts
export type ComboboxOption = {
  value: string
  label: string
  disabled?: boolean
}

export type ComboboxGroup = {
  heading: string
  options: ComboboxOption[]
}

// Discriminated union: options XOR groups — not both.
export type ComboboxProps =
  | (ComboboxPropsBase & { options: ComboboxOption[]; groups?: never })
  | (ComboboxPropsBase & { groups: ComboboxGroup[]; options?: never })

type ComboboxPropsBase = {
  value: string | null               // controlled
  onValueChange: (value: string | null) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  size?: "sm" | "md"                 // renamed from "default" to "md" for Button/Input parity
  className?: string
  // removed: searchPlaceholder (no separate search input exists)
}
```

### Prop reference

| Prop | Type | Notes |
|---|---|---|
| `value` | `string \| null` | Controlled. The committed selection. |
| `onValueChange` | `(value: string \| null) => void` | Called on commit and on backspace-to-empty (intermediate `null`). Also called on revert-on-close. |
| `options` | `ComboboxOption[]` | Flat option list. Mutually exclusive with `groups`. |
| `groups` | `ComboboxGroup[]` | Grouped option list with headings. Mutually exclusive with `options`. |
| `placeholder` | `string` | Shown when no value and no query. |
| `emptyText` | `string` | Shown in `CommandEmpty` when query produces no matches. |
| `disabled` | `boolean` | Disables trigger and prevents popover from opening. |
| `size` | `"sm" \| "md"` | Controls trigger height and padding. `"md"` is default (renamed from `"default"`). |
| `className` | `string` | Applied to the trigger wrapper (the layout root). Use for width constraints (`max-w-*`, `w-*`), margins. |

---

## 8. MultiSelect parity

MultiSelect uses a similar trigger-with-input pattern. The core "trigger IS the input" principle is the same, but the trigger chrome and chip model differ.

**Flag for follow-up:** After this Combobox pattern is implemented and reviewed, audit MultiSelect's blur/escape/clear behavior for consistency with the rules defined here (§1 state model). Out of scope for this spec.

---

## Resolved decisions

| # | Decision | Resolution |
|---|---|---|
| OD-1 | Trigger input placement relative to `<Command>` root | Input nested inside `Command` as first child. cmdk's `onKeyDown` on the root div receives events bubbling from the trigger input; `useCommandState` inside `TriggerInput` resolves from cmdk context. |
| OD-2 | Chevron hide: `hidden` vs `opacity-0` | `opacity-0 pointer-events-none` — no layout shift; chevron stays in DOM. `aria-hidden` on the icon means no a11y impact. |
| OD-3 | `options` / `groups` prop API shape | Discriminated union: `options XOR groups`. |
| OD-4 | `"default"` → `"md"` size rename | Done in code. Any consumer passing `size="default"` must update to `size="md"`. |
| OD-5 | Open-state ring | Removed. Chevron rotation is sole open indicator. `border-ring`/`shadow-focus` on open removed. `focus-visible` suppression classes removed. |
| OD-6 | `bg-popover` dark-mode defect | Resolved. `--color-popover` now has a `[data-theme="dark"]` override (`#11161F`) in `components.css`. `bg-popover` is correct. |

---

## Open questions

1. **`aria-invalid` pattern.** Combobox does not currently implement `aria-invalid` error state (unlike Input and Select). For use in a `FormField` that sets `aria-invalid="true"` on the field, the `<input>` element must respond with `aria-invalid:border-state-errored`. The architect should add this to `TriggerInput`. This is a gap vs Input/Select.

2. **`opacity-mid` token.** The chevron uses `opacity-mid`. Must be a valid token in the Tailwind config (`@theme { --opacity-mid: ... }`). If undefined, the chevron renders fully opaque. Verify; fall back to `opacity-50` if token is absent.

3. **Async combobox variant.** Loading state deferred from v1. When async variant is scoped, evaluate wrapper vs. first-class `loading` prop. Wrapper first.

---

## Dependencies

- `docs/design/components/command/spec.md` — canonical cursor/disabled rule for `CommandItem` rows.
- `docs/design/components/select/spec.md` — trigger chrome tokens.
- `docs/design/components/multi-select/spec.md` — sibling pattern; parity flagged in §8.
- `match-sorter@^8.3.0` — runtime dependency for filter implementation.
- No new design tokens required.
