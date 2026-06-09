# Taskset Detail — Settings Tab Wireframe

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md) — **anchor**. Header, descriptor strip, variant matrix, tab bar, and Overview tab are fully specced there. This file covers the Settings tab content only — do not restate the outer chrome.
- [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md) — peer reference. §8 Settings tab establishes the Display Name editor + Metadata `<dl>` block pattern mirrored in §7 of this file.
- [`docs/conventions/destructive-actions.md`](../../conventions/destructive-actions.md) — Dialog pattern with `TriangleAlertIcon`, `DialogCancelButton`, `DialogDestructiveButton`. Adopted verbatim for the Danger Zone.

**Variant scope — OWNER-ONLY tab.** Per anchor §3 and §9 variant matrix: Variant B (Public non-owner) does not render the Settings tab. Its owner/license metadata is surfaced in the Overview tab's About block (anchor §4a). This file is Variant A (Private owner) and Variant C (Public owner) only. Any delta between A and C is called out per section.

---

## HUD-side question answered

The Settings tab is a low-frequency but high-consequence surface. Every section here is either set-and-forget (Name, System Prompt, Purpose) or irreversible (Delete). The design question is: what friction level is correct for each action, and for which persona?

**Alex (owner — Variant A, Private Taskset):**
Configures his personal Taskset's purpose classification, system prompt baseline, and progress pipeline. Visits Settings once at Taskset creation and rarely after that — except when a training experiment reveals the system prompt is contaminating reward signals (Phase 5 forensics → Settings → System Prompt edit). Changing the System Prompt invalidates prior Job baseline comparisons; the disclaimer must say so exactly, not generically.

**Sam (owner — Variant A, Private Taskset):**
Manages weekly-regression Tasksets used by his team's CI. Name and Purpose are stable. He cares most about the confirmation friction on destructive actions — his team depends on this Taskset, and an accidental delete has a blast radius. Server-confirm save model (not optimistic) is correct for Sam's risk tolerance.

**Riley (owner — Variant A Private or Variant C Public):**
Load-bearing persona on this tab. Two critical actions:
- **Publish** (Variant A → C transition): flipping to Public ships the contractual deliverable to the buying lab. This action must be explicit, confirmed, and reversible-with-caveats.
- **Delete**: losing a delivery Taskset has contract consequences. Typed-name confirmation is appropriate.

Riley's Publish flow is the most consequential non-destructive action on the entire Settings tab — it gets a confirmation dialog even though it is not a delete.

---

## Decision log

### Decision 1: Section ordering — most-touched at top, most-consequential at bottom

**HUD-side question:** What order minimizes scroll cost for the most-frequent access pattern while keeping the Danger Zone at maximum visual distance from accidental interaction?

**Choice:** Purpose → Name → System Prompt → Progress Steps → Visibility → Metadata → Danger Zone.

Matches production ordering. Rationale: Purpose and Name are the two fields set at Taskset creation and occasionally revisited; System Prompt is an authoring decision visited during Phase 3; Progress Steps is a pipeline configuration visited once; Visibility is a state-change action; Metadata is read-only reference (low visit frequency); Danger Zone is always last, visually separated.

### Decision 2: Save model — per-section Save, not global Save

**HUD-side question:** What save model prevents an accidental commit of a System Prompt draft when the user intended to save only the Name?

**Choice:** Each section has an independent Save button, disabled until the section is dirty. The button is enabled only when the field(s) in that section have been modified from the committed value. On success: section-level toast — exact copy: "Taskset Name updated." / "System Prompt updated." / "Progress Steps updated." No success banner that displaces content.

Server-confirm over optimistic save: inputs are disabled during the in-flight request. Given the consequence weight of System Prompt changes (affects Job scoring baselines) and Progress Steps changes (affects the pipeline all Jobs run through), optimistic save would hide errors at the worst moment. The added latency (~200–500ms) is acceptable for these low-frequency writes.

### Decision 3: Purpose segmented control — confirm on change

**HUD-side question:** Does changing Purpose (Benchmark ↔ Training) require friction, given it affects where the Taskset surfaces in the index and Marketplace?

**Choice:** Segmented control `[Benchmark | Training]`. Selecting a new value does not immediately commit — it marks the section as dirty and enables the Save button. On Save: confirmation dialog. Title: `⚠ Change Taskset purpose?` Body: "Changing the purpose to [Training / Benchmark] may change where this Taskset appears in filters and listings." Confirm / Cancel. Cancel restores the segmented control to the committed value without a server round-trip.

Confirm-on-Save (not confirm-on-click) is consistent with the per-section save model: the user can freely experiment with the control, then decide to commit or abandon.

### Decision 4: Progress Steps editor — ordered pipeline with locked steps

**HUD-side question:** The pipeline has platform-required steps (K runs, Ready, Verified) that cannot be disabled, and an optional step (Golden sequence) plus owner-insertable custom steps. How does the UI communicate locked vs configurable without visual clutter?

**Choice:** Ordered list. Each step row shows: step name · mode label (`auto` / `manual`) · lock state. Locked steps (`K runs`, `Ready`, `Verified`) show a lock indicator and `always on` label; they render as non-interactive rows. `Golden sequence` has a toggle (on/off). The insert-row affordance (`+ Add step between Runs and Ready`) appears between the last auto step and the `Ready` step — the only slot where custom steps may be inserted per production behavior.

Mode (`auto` / `manual`) is per-step metadata displayed as a muted label — not a user-editable field in this view (it is authored in code). Its presence informs the owner why a step behaves as it does.

### Decision 5: Locked-step explanation

**HUD-side question:** A first-time owner will ask "why can't I turn off Ready?" The lock glyph alone is insufficient — it signals the fact but not the reason.

**Choice:** Tooltip on the lock indicator: "Required step in the Taskset progress pipeline. Cannot be disabled." The lock indicator is a non-interactive glyph (`aria-label="Locked — required step"`). Tooltip triggered on hover/focus.

### Decision 6: Visibility section — state display + action button

**HUD-side question:** Visibility is a single binary state (Private / Public). The user needs to see the current state and be able to change it. What's the minimum surface that handles both without a settings page that feels like it has a control panel?

**Choice:** Plain-text state display with a glyph prefix + one action button below.

- **Variant A (Private owner):** `🔒 Private` + help text "This Taskset is only visible to your org." + `[Publish]` primary button.
- **Variant C (Public owner):** `🌐 Public` + help text "This Taskset is visible in the public Marketplace." + `[Unpublish]` outline button.

Publish requires confirmation (see §6 spec). Unpublish requires confirmation with caveats (public forks persist; public Job history remains attributed).

### Decision 7: Delete — Dialog pattern per destructive-actions.md, with typed-name field extension

**HUD-side question:** Is the standard Dialog pattern (Cancel + Destructive button) sufficient for a Taskset delete, or does the consequence weight justify an additional typed-name confirmation?

**Choice:** Adopt `docs/conventions/destructive-actions.md` Dialog pattern verbatim as the base. Add a typed-name field inside the Dialog as an extension. The Destructive button is disabled until the input value matches the Taskset name exactly (case-sensitive). This is the typed-confirmation pattern used by GitHub, Vercel, and Linear for irreversible resource deletion.

**Justification:** The convention doc covers the Dialog primitive but does not address whether to add a typed-confirmation field. The gap is flagged in open questions (§13 item 1). The typed-name extension is proposed here because: (a) Taskset deletion removes all Tasks within it and breaks Job history links — it has a wider blast radius than, say, cancelling a Job; (b) Riley's delivery Tasksets are contract artifacts.

The typed-name field extends, not replaces, the convention pattern. The Dialog still uses `size="sm"`, `TriangleAlertIcon`, `DialogCancelButton`, `DialogDestructiveButton`.

### Decision 8: Metadata `<dl>` sub-block — read-only reference, below Visibility

**HUD-side question:** The owner-facing Settings tab needs to surface the same reference metadata that the About block in Overview carries for non-owners (anchor §4a). Where does it live for the owner?

**Choice:** A read-only `<dl>` Metadata block between Visibility and Danger Zone. Fields: Taskset ID (copy button), Created (date), Created by (user handle), Last modified (date + user handle). Mirrors model-detail §8 Metadata `<dl>` pattern.

Taskset ID with a copy button provides the same high-frequency copy affordance as the API name in model-detail. The slug in the header strip serves the `hud eval` use case; the Taskset ID here is the internal identifier used in SDK calls and Job linkage.

### Decision 9: System Prompt — destructive-on-prior-Jobs disclaimer

**HUD-side question:** Changing the System Prompt changes scoring baselines for all future Jobs. Existing Jobs are not retroactively re-scored. Does the user know this?

**Choice:** Help text below the textarea (always visible, not a warning triggered on change): "Changing this prompt affects future Job runs only. Existing leaderboard scores stay as recorded."

This is an informational note, not a confirmation gate — the user can change the prompt freely. The per-section Save model already protects against accidental commits. Adding a confirmation dialog on System Prompt Save would be over-friction for Alex (who changes the prompt frequently during Phase 3 authoring).

### Decision 10: Save button position — section's bottom-right boundary

**HUD-side question:** Where does the Save button live per section, and is the position consistent across sections?

**Choice:** Save is at the section's bottom-right boundary. Exact position varies by section content shape, matching production:
- **Name:** input is a single-line field; Save sits inline to the right of the input. Natural reading terminus for a one-line form row.
- **System Prompt:** textarea is multi-line; Save sits below the textarea, right-aligned. The textarea width spans the content column; right-aligned below is the natural bottom-right terminus.
- **Progress Steps:** ordered list is a block; Save sits below the list, right-aligned. Same pattern as System Prompt.
- **Purpose:** segmented control is inline-width; Save sits below the control and help text, right-aligned.

All Save buttons share the same disabled → dirty → in-flight → success state cycle (Decision 2).

---

## §1 Tab content layout

Single column, vertically stacked sections separated by hairline rules. Max content width matches model-detail Settings: narrow enough to keep form inputs readable at a comfortable measure — not full viewport. On desktop this is the center column of the MAIN region; the settings tab does not use a two-column layout.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SETTINGS TAB  (Variant A: Private owner; Variant C: Public owner)               │
│                                                                                  │
│  §2 PURPOSE                                                                      │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  §3 TASKSET NAME                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  §4 SYSTEM PROMPT                                                                │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  §5 PROGRESS STEPS                                                               │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  §6 VISIBILITY                                                                   │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  §7 METADATA                                                                     │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  §8 DANGER ZONE  (red top-border + section heading)                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## §2 Purpose section

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PURPOSE                                                                         │
│  (section h3)                                                                    │
│                                                                                  │
│  [  Benchmark  |  Training  ]                                                    │
│  (segmented control; active value = committed value; dirty when changed)         │
│                                                                                  │
│  Benchmarks appear in model leaderboards and public listings.                   │
│  Training Tasksets are surfaced when filtering for training data.               │
│  (help text, 2 lines)                                                            │
│                                                                                  │
│                                              [Save]  (disabled until dirty)     │
│                                                                                  │
│  ── CONFIRM DIALOG (on Save when Purpose has changed) ──────────────────────── │
│                                                                                  │
│  ⚠ Change Taskset purpose?                                                       │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Changing to [Training / Benchmark] may change where this Taskset appears       │
│  in filters and listings.                                                        │
│                                                                                  │
│  [Cancel]                              [Change Purpose]                          │
│  (DialogCancelButton)                  (DialogDestructiveButton — outline        │
│                                         variant; not red; this is not a delete)  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- The confirm dialog on Purpose change uses `Dialog size="sm"` per `destructive-actions.md` but the confirm CTA is **not** `DialogDestructiveButton` (red) — Purpose change is consequential but not destructive. Use a standard primary button with label "Change Purpose." See open question §13 item 2.
- On dialog Cancel: segmented control snaps back to the committed value; Save button returns to disabled.
- On dialog Confirm: server request fires; inputs disabled during in-flight; section-level toast "Purpose updated." on success.

---

## §3 Taskset Name section

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TASKSET NAME                                                                    │
│  (section h3)                                                                    │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐  [Save]       │
│  │  browser Tasks                                               │  (disabled     │
│  └──────────────────────────────────────────────────────────────┘   until dirty)│
│                                                                                  │
│  This name is displayed throughout the platform.                                 │
│  (help text)                                                                     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Input populated with current Taskset name.
- Save sits inline right of the input (Decision 10 — single-line form terminus).
- No confirmation dialog on Name save — Name changes are low-consequence and reversible.
- Toast on success: "Taskset Name updated."
- Validation: empty name is invalid; Save button remains disabled if the field is empty. Inline error below input: "Name cannot be empty."

---

## §4 System Prompt section

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SYSTEM PROMPT                                                                   │
│  (section h3)                                                                    │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  Enter a system prompt to apply to all Tasks in this Taskset…           │    │
│  │  (textarea ~5 rows; placeholder shown when empty; populated when set)   │    │
│  │                                                                          │    │
│  │                                                                          │    │
│  │                                                                          │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                            [Save]                 │
│                                           (disabled until dirty; right-aligned)  │
│                                                                                  │
│  This prompt is prepended to every Task's system prompt when running Jobs.       │
│  Changing this prompt affects future Job runs only.                              │
│  Existing leaderboard scores stay as recorded.                                   │
│  (help text — always visible; Decision 9)                                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- No confirmation dialog on System Prompt Save — help text is the friction, not a modal. Over-friction for Alex's Phase 3 authoring loop (Decision 9).
- Toast on success: "System Prompt updated."
- Empty state: placeholder text renders in the textarea; saving an empty prompt is valid (removes the system prompt). Help text does not change for the empty case.

---

## §5 Progress Steps editor

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PROGRESS STEPS                                                                  │
│  (section h3)                                                                    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐     │
│  │  ☐  Golden sequence                                 auto               │     │
│  │     (toggle — owner can enable/disable)             (mode label)        │     │
│  │  ─────────────────────────────────────────────────────────────────────  │     │
│  │  ●  K runs                             auto  ·  always on  🔒           │     │
│  │     (filled indicator — on; non-interactive)  (locked; Decision 5)      │     │
│  │  ─────────────────────────────────────────────────────────────────────  │     │
│  │  +  Add step between Runs and Ready                                    │     │
│  │     (insert-row affordance; opens inline step-name input on click)      │     │
│  │  ─────────────────────────────────────────────────────────────────────  │     │
│  │  ◌  Ready                            manual  ·  always on  🔒           │     │
│  │     (open circle — manual; non-interactive)   (locked; Decision 5)      │     │
│  │  ─────────────────────────────────────────────────────────────────────  │     │
│  │  ◌  Verified                         manual  ·  always on  🔒           │     │
│  │     (open circle — manual; non-interactive)   (locked; Decision 5)      │     │
│  └─────────────────────────────────────────────────────────────────────────┘     │
│                                                            [Save]                 │
│                                           (disabled until dirty; right-aligned)  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Step row anatomy:**
| Column | Content |
|---|---|
| Indicator | `☐` toggleable off, `●` always-on auto, `◌` always-on manual |
| Name | Step name string |
| Mode label | `auto` or `manual` — muted text, right-aligned |
| Lock indicator | `🔒` on always-on steps; absent on toggleable steps |

**Annotations:**
- `Golden sequence` toggle: clicking toggles `☐ → ●` (enabled) or `● → ☐` (disabled). Marks section dirty.
- `K runs`, `Ready`, `Verified`: non-interactive rows. Lock indicator tooltip: "Required step in the Taskset progress pipeline. Cannot be disabled." (Decision 5).
- `+ Add step between Runs and Ready`: clicking expands an inline input row between `K runs` and `Ready`. Input field for step name + mode selector (auto / manual) + `[Add]` / `[Cancel]` inline. Added steps appear as toggleable rows and can be removed with an `×` remove affordance.
- Save commits the full pipeline configuration. Toast: "Progress Steps updated."
- Custom steps are the only rows that can be reordered (drag handle) within their allowed insertion zone (between `K runs` and `Ready`).

---

## §6 Visibility section

### Variant A (Private owner)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  VISIBILITY                                                                      │
│  (section h3)                                                                    │
│                                                                                  │
│  🔒 Private                                                                      │
│  This Taskset is only visible to your org.                                       │
│                                                                                  │
│  [Publish]                                                                       │
│  (primary button; triggers confirmation dialog below)                            │
│                                                                                  │
│  Make this Taskset visible in the public Marketplace.                            │
│  (help text below the button)                                                    │
│                                                                                  │
│  ── PUBLISH CONFIRMATION DIALOG ───────────────────────────────────────────── │
│                                                                                  │
│  ⚠ Publish 'browser Tasks' to the Marketplace?                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  This Taskset and its leaderboard entries will be visible to other orgs.         │
│  Future Job runs on this Taskset will appear in the public leaderboard.          │
│                                                                                  │
│  [Cancel]                                      [Publish]                         │
│  (DialogCancelButton)              (primary confirm button — not destructive)    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Variant C (Public owner)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  VISIBILITY                                                                      │
│  (section h3)                                                                    │
│                                                                                  │
│  🌐 Public                                                                       │
│  This Taskset is visible in the public Marketplace.                              │
│                                                                                  │
│  [Unpublish]                                                                     │
│  (outline button; triggers confirmation dialog below)                            │
│                                                                                  │
│  Revert to Private. Public forks remain independent forks.                       │
│  Public Job history stays attributed to this Taskset.                            │
│  (help text below the button)                                                    │
│                                                                                  │
│  ── UNPUBLISH CONFIRMATION DIALOG ─────────────────────────────────────────── │
│                                                                                  │
│  ⚠ Unpublish 'browser Tasks'?                                                    │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  This Taskset will no longer appear in the public Marketplace.                   │
│  Public forks remain independent. Job history stays attributed.                  │
│                                                                                  │
│  [Cancel]                                      [Unpublish]                       │
│  (DialogCancelButton)                    (DialogDestructiveButton — outline      │
│                                           variant; visibility rollback is        │
│                                           reversible but consequential)          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Publish dialog uses `Dialog size="sm"` per convention. Confirm CTA is a standard primary button — publishing is consequential but not destructive. Use "Publish" as label. (Same reasoning as Purpose change; see open question §13 item 2 for whether to standardize non-destructive confirms.)
- Unpublish dialog uses `DialogDestructiveButton` (outline red) — removing visibility is a consequential state rollback. Not the same weight as Delete but warrants the destructive visual register.
- Neither dialog includes a typed-name field — Publish and Unpublish are reversible actions. Typed confirmation is reserved for the irreversible Delete.
- After Publish succeeds: Variant A page reloads as Variant C (Settings tab remains; tab bar gains no new tabs — owner has 5 tabs in both variants). Toast: "browser Tasks is now public."
- After Unpublish succeeds: page reloads as Variant A. Toast: "browser Tasks is now private."

---

## §7 Metadata block

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  METADATA                                                                        │
│  (section h3; read-only)                                                         │
│                                                                                  │
│  Taskset ID      tskt-0a1b2c3d4e5f                         [⎘]                  │
│  Created         2025-11-04                                                      │
│  Created by      @alex-chen                                                      │
│  Last modified   2026-05-12  by @alex-chen                                       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- `<dl>` structure with `<dt>`/`<dd>` pairs. Mirrors model-detail §8 Metadata block pattern.
- Taskset ID copy button: `<button aria-label="Copy Taskset ID tskt-0a1b2c3d4e5f">`. The Taskset slug (for `hud eval`) lives in the header strip. The Taskset ID here is the internal identifier for SDK calls and Job linkage — distinct from the slug.
- Created by and Last modified user handles link to the user's org profile if available; plain text otherwise.
- No Save or edit affordance — this block is read-only.
- No section hairline below Metadata — the Danger Zone uses its own red top-border visual separator.

---

## §8 Danger Zone

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  ═══════════════════════════════════════════════════════════════════════════════  │
│  (red top-border hairline — color is design-tokens-phase; wireframe notes red)   │
│                                                                                  │
│  DANGER ZONE                                                                     │
│  (section h3 in destructive/error text color)                                    │
│                                                                                  │
│  Permanently delete this Taskset and all Tasks within it.                        │
│  Existing Jobs that used this Taskset remain in Job history;                     │
│  the Taskset link becomes broken. This action cannot be undone.                  │
│                                                                                  │
│  [🗑 Delete Taskset]                                                              │
│  (destructive button variant; triggers Dialog below)                             │
│                                                                                  │
│  ── DELETE CONFIRMATION DIALOG ────────────────────────────────────────────── │
│                                                                                  │
│  ⚠ Permanently delete 'browser Tasks'?                                           │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Deleting browser Tasks will permanently remove this Taskset, all Tasks          │
│  within it, and unlink it from existing Jobs. Job history stays; the             │
│  Taskset link becomes broken. This action cannot be undone.                      │
│                                                                                  │
│  Type the Taskset name to confirm:                                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                          │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│  (text input; placeholder: "browser Tasks")                                      │
│                                                                                  │
│  [Cancel]                           [Delete Taskset]                             │
│  (DialogCancelButton)               (DialogDestructiveButton; disabled until     │
│                                      input matches Taskset name exactly)         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Dialog uses `Dialog size="sm"`, `TriangleAlertIcon`, `DialogCancelButton`, `DialogDestructiveButton` per `docs/conventions/destructive-actions.md`.
- The typed-name field is an extension of the convention pattern, not a replacement (Decision 7). Field label: "Type the Taskset name to confirm:". The `DialogDestructiveButton` is disabled until the input value exactly matches the Taskset name (case-sensitive).
- Pending state: `DialogDestructiveButton` label switches to "Deleting…" during in-flight request. Input and Cancel button both disabled during in-flight.
- On success: navigate to `/tasksets` index. No success toast (the Taskset is gone; a toast on the index would be: "browser Tasks deleted.").
- `⚠` in the dialog title is `TriangleAlertIcon` from lucide-react, `aria-hidden="true"`, per convention.
- `🗑` on the trigger button: icon-only decoration, `aria-hidden="true"`. Accessible label of the button: "Delete Taskset".

---

## §9 States

| Section | Default | Dirty (unsaved changes) | Save in-flight | Save error | Empty |
|---|---|---|---|---|---|
| Purpose | Committed value in segmented control; Save disabled | Save enabled; confirm dialog on Save click | Inputs disabled; Save shows "Saving…" spinner | Save returns to enabled; inline error: "Failed to save. Try again." | N/A (always has a value) |
| Taskset Name | Committed name in input; Save disabled | Save enabled | Input disabled; Save shows "Saving…" | Save returns to enabled; inline error below input | Blocked — empty input disables Save |
| System Prompt | Committed prompt in textarea or placeholder | Save enabled | Textarea disabled; Save shows "Saving…" | Save returns to enabled; inline error below textarea | Valid — save clears the prompt |
| Progress Steps | Committed pipeline in list | Save enabled | All step rows disabled; Save shows "Saving…" | Save returns to enabled; inline error below list | N/A (platform steps always present) |
| Visibility | State text + action button | N/A (no dirty state — action is a discrete button click, not an editable field) | Button shows "Publishing…" / "Unpublishing…"; disabled | Error toast: "Failed to publish. Try again." | N/A |
| Metadata | `<dl>` block populated | N/A (read-only) | N/A | N/A | `—` for fields not yet set (Created by, Last modified — possible on newly created Tasksets) |
| Danger Zone | Delete trigger button | N/A (no dirty state) | Dialog Destructive button shows "Deleting…"; input and Cancel disabled | Dialog stays open; error below typed-name input: "Delete failed. Try again." | N/A |

**Save model justification (server-confirm over optimistic):** System Prompt and Progress Steps changes affect every future Job run on this Taskset. Showing committed state before the server confirms creates a false sense of safety — if the request fails silently, the user proceeds under incorrect assumptions. The ~200–500ms disable-during-request is the correct tradeoff.

---

## §10 Responsive behavior

**Desktop:** Single column within the MAIN center column. All sections at their natural heights. Hairline separators full content width.

**Tablet:** No layout change — Settings is already single-column. Progress Steps list may compress slightly but remains a vertical ordered list. Confirm modals: standard Dialog centered in viewport.

**Mobile:** No layout change for the form sections. Save buttons remain right-aligned to the content column (which is now full-width). Confirm modals become bottom sheets (this is a global modal behavior from the design system, not a Settings-specific decision). The typed-name Delete confirmation: bottom sheet with keyboard-visible input above the fold when the keyboard is open.

---

## §11 Keyboard and accessibility

**General form semantics:**
- Each section is a `<section>` with a `<h3>` label.
- Every form input is associated with its label via `<label for>` or `aria-labelledby`.
- Save buttons: `<button type="submit">` within their section's implicit form, or `type="button"` with explicit click handler. Accessible label: "Save Purpose" / "Save Taskset Name" / "Save System Prompt" / "Save Progress Steps" — never bare "Save" (ambiguous when multiple Save buttons exist on the page).
- Disabled state: `disabled` attribute (not `aria-disabled`), so keyboard focus skips disabled buttons naturally.

**Purpose segmented control:** `role="radiogroup"` with `role="radio"` items. Arrow keys navigate between options. `aria-checked` reflects committed value before dirty; changes to the dirty value on arrow-key selection but does not commit. Save button accessible label: "Save Purpose".

**Taskset Name input:** `<input type="text" aria-label="Taskset Name">`. Save button: `<button aria-label="Save Taskset Name" disabled>`.

**System Prompt textarea:** `<textarea aria-label="System Prompt" aria-describedby="system-prompt-help">`. Help text element carries `id="system-prompt-help"`. Save button: `<button aria-label="Save System Prompt">`.

**Progress Steps:**
- Ordered list rendered as `<ol>` with `role="listitem"` rows.
- `Golden sequence` toggle: `<button role="switch" aria-checked="false/true" aria-label="Golden sequence step">`.
- Locked rows: `aria-disabled="true"` on the row; lock indicator `<span aria-label="Locked — required step">`.
- `+ Add step` button: `<button aria-label="Add step between Runs and Ready">`. Activating it moves focus into the inline input.
- Save: `<button aria-label="Save Progress Steps">`.

**Visibility:**
- State text: `<p>` with glyph as `aria-hidden="true"` + screen-reader text "Private" or "Public".
- Publish button: `<button aria-label="Publish Taskset">`. Unpublish: `<button aria-label="Unpublish Taskset">`.
- Confirm dialogs: `<dialog>` with `role="alertdialog"`, `aria-labelledby` pointing to dialog title. Focus traps inside dialog on open; returns to trigger button on close.

**Delete dialog:**
- `role="alertdialog"`. Focus moves to the typed-name input on open (not to Cancel — the user must consciously type to proceed).
- Input: `<input type="text" aria-label="Type the Taskset name to confirm deletion" aria-describedby="delete-confirm-desc">`. Description element explains the match requirement.
- `DialogDestructiveButton`: `aria-disabled="true"` until match (not `disabled`, so screen readers announce its presence and state). `aria-label="Delete Taskset — type the name above to enable"` when disabled; switches to `aria-label="Delete Taskset"` when enabled.
- ESC dismisses dialog, returns focus to Delete trigger button.

---

## §12 Persona notes by surface decision

| Decision | Alex (owner) | Sam (owner) | Riley (owner) |
|---|---|---|---|
| Decision 1: Section ordering | Acceptable — visits Settings rarely; when he does it's for System Prompt or Progress Steps (mid-page) | Acceptable — Name at top is useful; Danger Zone at bottom is correct for his blast-radius concern | Load-bearing — Publish in Visibility section; its position above Danger Zone prevents accidental proximity to Delete |
| Decision 2: Per-section Save, server-confirm | Correct — he changes System Prompt in Phase 3 isolation; server-confirm prevents a silent bad commit | Load-bearing — team depends on this Taskset; he wants to know the save landed before closing the tab | Correct — delivery Tasksets must not silently fail on Publish or System Prompt save |
| Decision 3: Purpose confirm-on-Save | Acceptable — Alex rarely changes Purpose; when he does, the confirm is a reminder of downstream effect | Load-bearing — his CI filters by Purpose; an accidental change breaks the filter | Load-bearing — Purpose determines where the deliverable surfaces in the buying lab's listing |
| Decision 4: Progress Steps — locked vs toggleable | Load-bearing — Alex authors custom pipelines; must know which steps are platform-required vs optional | Low-value — Sam rarely edits Progress Steps; locked-step clarity prevents confusion but is not blocking | Acceptable — Riley may configure Golden sequence for QA pipeline; locked steps are a delivery constraint |
| Decision 5: Locked step tooltip | Useful — Alex will ask why K runs is non-negotiable; tooltip answers without extra UI | Low-value | Low-value |
| Decision 6: Visibility state + single action button | Low-value — Alex has Private Tasksets and does not Publish them (his work is private by design) | Acceptable — Sam's Tasksets are Private; Publish is not part of his workflow | **Load-bearing** — Publish is the contractual delivery action; its position, copy, and confirmation are critical |
| Decision 7: Typed-name Delete confirmation | Acceptable — Alex deletes Tasksets occasionally; typed confirmation is slightly over-friction but acceptable given the blast radius | Load-bearing — prevents accidental team-facing Taskset deletion | Load-bearing — prevents loss of a contract artifact |
| Decision 8: Metadata `<dl>` | Low-value during authoring; useful for SDK references (Taskset ID) | Low-value — he reads the Taskset ID from CLI output | Acceptable — buying lab may ask for the Taskset ID |
| Decision 9: System Prompt disclaimer (existing scores unaffected) | **Load-bearing** — he changes prompts iteratively; must know existing leaderboard scores are preserved | Acceptable — his regression Tasksets have stable prompts; reminder is harmless | Acceptable — Riley rarely changes System Prompt post-QA |
| Decision 10: Save position per section content shape | Low-value — he will find Save regardless | Low-value | Low-value |

---

## §13 Open questions

1. **Typed-name confirmation not in destructive-actions.md convention.** The convention doc specifies the `Dialog` pattern but does not address whether to add a typed-name input. This file proposes the extension for Taskset Delete. **Decision needed:** should `docs/conventions/destructive-actions.md` be updated to cover when typed-name confirmation is appropriate (e.g., when the deleted resource has downstream linkage effects), or should this remain a per-screen decision?

2. **Non-destructive confirm dialog button variant.** Purpose change and Publish both use confirm dialogs but are not destructive actions. The convention doc covers `DialogDestructiveButton` for destructive flows. **Decision needed:** is there a `DialogConfirmButton` (primary variant) or should the convention be extended? Currently specced as a standard primary button inside the Dialog footer for non-destructive confirms. Unpublish is specced as `DialogDestructiveButton` (outline) — flag if that register is wrong.

3. **Does Purpose change require re-running existing Jobs?** If a Taskset is changed from Training to Benchmark, do existing Jobs need to be recomputed for leaderboard visibility? Or does the Purpose flag affect only where the Taskset appears, not what the Jobs scored? If Jobs need recomputation: a confirmation dialog is insufficient — there may need to be a queued-recompute indication. Platform behavior confirmation needed.

4. **What happens to in-progress Jobs when Delete is invoked?** The current body copy says existing Jobs remain in Job history with a broken Taskset link. But if a Job is currently running when the Taskset is deleted, should the in-flight Job be cancelled or allowed to complete against the now-deleted Taskset? **Decision needed.** If in-progress Jobs exist, the Delete dialog should warn: "N Jobs currently running against this Taskset will be cancelled."

5. **Can a Public Taskset be re-privated once community Jobs have been run against it?** The Unpublish help text currently says "Job history stays attributed." But if community orgs have run Jobs whose leaderboard entries reference this Taskset, Unpublishing removes the leaderboard context. Does HUD allow this, or is Unpublish gated once community Jobs exist? If gated: the Unpublish button should be disabled with an explanation when community Job count > 0.

6. **System Prompt character limit.** Is there a maximum character count for the System Prompt? If yes, a character counter should be present in the textarea footer. Platform constraint confirmation needed.

7. **Custom step insert zone.** Production shows `+ Add step between Runs and Ready` as the only insert point. Is this the intended UX (only one insertion zone), or should custom steps be insertable anywhere? If only one zone: the wireframe is correct. If anywhere: the ordered list needs drag-handle affordances and insert affordances between every pair of steps.

---

## Out of scope

- **Publish modal flow detail** — if the Publish action becomes a multi-step flow (e.g., set license, add description, choose leaderboard visibility options) rather than a single confirmation dialog, that is a separate flow wireframe.
- **Marketplace listing configuration** — a future surface for setting the public listing description, tags, and license separate from the main Settings tab.
- **Fork-source management** — if a Taskset is a fork of a Public Taskset, the Settings tab does not currently surface an "update from source" affordance. Out of scope for this pass.
- **Team permissions** — if orgs have sub-team or role-based access to Tasksets, that settings surface is out of scope.
- **Taskset export** — Export (JSON/CSV of the Taskset task list) lives in the `≡` overflow menu on the page header (anchor §2 annotations), not in Settings.

---

## Drift log — divergences from production (Image #26)

| Production | This wireframe | Reason |
|---|---|---|
| `h2 Taskset Settings` as page heading | Heading lives in the tab bar (tab label "Settings") + section `h3` labels per section | Anchor tab-bar pattern supersedes a per-tab page heading |
| No confirmation on Purpose save | Confirm dialog on Save when Purpose value has changed | Downstream UX consequence (filters, listings) justifies friction |
| No Publish confirmation dialog | Confirm dialog on Publish | Riley's load-bearing delivery action; one-click Publish with no confirmation is a liability |
| No typed-name confirmation on Delete | Typed-name field inside the Delete dialog | Blast radius (all Tasks deleted, Job links broken) justifies typed confirmation beyond the standard Dialog pattern |
| No Metadata sub-block | Metadata `<dl>` block (Taskset ID, Created, Created by, Last modified) between Visibility and Danger Zone | Mirrors model-detail §8; provides Taskset ID copy affordance for SDK calls |
| System Prompt help text does not mention existing scores | Added: "Changing this prompt affects future Job runs only. Existing leaderboard scores stay as recorded." | Exact, not chatty — Decision 9; personality principle |
| No Save disabled-until-dirty behavior stated | Save disabled until section is dirty; server-confirm; inputs disabled during in-flight | Decision 2 — prevents accidental multi-section saves |

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md). Anchor: [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md). Peer: [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md) §8. Convention: [`docs/conventions/destructive-actions.md`](../../conventions/destructive-actions.md). Visual reference: Image #26 (Settings tab, current production hud.ai — Jun 2026).*
