# New Training Job — Screen Wireframe (`/jobs/new?type=training`)

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome. This wireframe covers the `MAIN` region only.
- [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md) — entry point: `▶ Run on taskset ▾ → Run Training job` routes here with `?taskset=` prefilled.
- [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md) — entry point: `Fork & Train` CTA routes here with `?modelId=` prefilled.
- [`docs/design/flows/job-launch.md`](../flows/job-launch.md) — all job-launch paths; CLI equivalents.

**Scope:** Training variant only (`?type=training`). Eval variant, junction picker (no `?type=`), and drawer variant are separate dispatches.

---

## HUD-side question answered

### What do Alex and Sam DO on this page, and why?

**Sam (Applied Agent Engineer — PRIMARY DESIGN DRIVER for this page)** arrives here from taskset-detail (`Run Training job`) or from the Jobs index (`+ New Job → Training`). He has iterated on this page many times this week. The stepper maps 1:1 to his four mental questions:

1. "Am I improving the right base?" → **Step 1: Model**
2. "Against the right eval?" → **Step 2: Taskset**
3. "Which tasks should I train on?" → **Step 3: Tasks**
4. "How long, how much will this cost?" → **Step 4: Review** (cost/time estimates + Launch)

Sam's dominant anti-patterns to guard against:
- **Sam baseline wall:** blocking launch behind eval completion converts a decision-support signal into mandatory overhead
- **Sam hyperparameter creep:** surfacing non-existent or advanced config at default view altitude wastes his scan budget
- **Sam cost surprise:** discovering cost only after full form commitment; Review step surfaces it before Launch

**Alex (Frontier RL Researcher — PRIMARY persona globally)** arrives here post-checkpoint-fork from model-detail. He is in iteration mode: configure the next segment of a training run. He needs:
- CLI escape: Review step offers "Copy as CLI command" link for reproducibility and scripting
- Locked base model confirmed visually (he forked the right checkpoint)
- Locked or pre-selected taskset confirmed (his reward function is stable)
- Steps are short — he moves through them fast; no wizard-fatigue risk given only 5 real fields

**Riley (RL Environment Vendor — TERTIARY)** does not design this page — he lands here rarely to verify a training job against his packaged taskset. Sanity gate only.

---

## Decision log

### Decision A (revised): 4-step stepper replaces single-scroll

**Revised:** Previous Decision 1 proposed single-scroll + section anchor nav. Operator identified that the production wizard already had a stepper and the revised field set (5 fields total) is small enough that a stepper does not fight density — it paces distinct decisions. Revert to stepper pattern.

**HUD-side question:** Does the stepper add safety value at 5 fields, or impose wizard-friction?

**Persona reason:** With only 5 real fields across 4 conceptually distinct decisions (model, taskset, tasks, cost-commit), each step maps cleanly to one mental question. There is no hidden-field risk (Alex can't miss a field he needs to tweak — the full field set is 5 items and he knows them). The stepper's structural benefit — keeping commit cost visible at Step 4 only — is correct: the cost table appears when the user is about to Launch, not before.

**Design implication:** 4-step stepper header: `Model · Taskset · Tasks · Review`. Gold 2px bottom underline on the active step. Steps 1–3: footer shows `[Cancel] [← Previous] [Next →]`. Step 4: footer shows `[Cancel] [← Previous: Tasks] [Launch Training Job]` (gold primary). Section anchor nav and CLI equivalent section are removed — they belonged to the single-scroll pattern.

### Decision B (kept): Drop the OR layout on Model selection

**HUD-side question:** Is "Continue Training" vs "Fork a Public Model" a top-level user decision, or a consequence of which model they pick?

**Persona reason:** It is a consequence. The vertical OR divider created a false pricing-tier impression. A single picker with sub-sections (My Models first, Trainable Base Models below) preserves the distinction implicitly: picking from My Models = continue; picking from Base Models = fork. The user never sees a binary choice they must name before they can act.

**Design implication:** Single `Model` picker. Two sub-sections: **My Models** (anchored open if ≥1 exists) and **Trainable Base Models**. Both render the same row shape. When `?modelId=` is set, field renders locked: filled row + lock glyph + `[Change]` secondary link.

### Decision C1 (kept): Picker control — inline expandable list

**HUD-side question:** Modal picker vs dropdown vs inline list for the Model control?

**Persona reason:** Alex needs to read the capability strip (usage · reasoning · speed · context · price/M) before committing. An inline expandable list keeps the capability data visible at the form altitude, lets Alex compare rows without an overlay.

**Picker interaction states:**
- Default: shows My Models section open (if any), Base Models collapsed
- Selected: selected row rendered filled/highlighted with capability strip below; other rows de-emphasize
- Locked (URL prefill): single filled row with lock glyph; `[Change]` secondary link unlocks picker

### Decision C2 (kept, renamed from D): Baseline coverage hint — advisory, not a wall

**HUD-side question:** Should a missing baseline block launching a training job, or serve as an informational signal?

**Persona reason:** Sam's loop is: run training → re-eval. Blocking behind a mandatory eval gate doubles his iteration cost when he already has a mental model of the baseline. The production red error box with "Proceed without evaluation" checkbox treats a normal workflow as an error state. Baseline is decision support, not a safety gate.

**Design implication:** Inline hint below the Taskset picker in Step 2. Three states:
- **Evaluated (green):** "Avg reward Y% across N tasks · [View results]"
- **Partial (amber):** "M of N tasks evaluated — Avg Y% so far · [Complete baseline]"
- **No baseline (info/neutral):** "No baseline yet — running eval first can save compute if the model already passes most tasks · [Run baseline eval]"

All three states allow the user to advance to Step 3 and Launch without action.

### Decision C3 (kept, renamed): Tasks sub-select — two-column layout, list LEFT + histogram RIGHT

**HUD-side question:** When a user selects a subset of tasks from the taskset, do they need the reward distribution immediately?

**Persona reason:** Yes. The histogram tells Alex whether the tasks he is including cover the interesting reward range or are all trivially easy/hard. Sam uses it to confirm the task mix before committing compute.

**Design implication (final — supersedes earlier single-column recommendation):** `lg:grid-cols-[1fr_280px]` — task list LEFT (flex-1, scrollable), chart RIGHT (fixed 280px, sticky). Column order is left=primary (list) right=secondary (chart) to match western reading flow: Sam acts on the list, then reads the chart to validate. Left column contains: toolbar (search + filter chips + reward toggle + select all), checkbox list with inline reward bars per row, stat summary line, duplication warning + acknowledgment. Right column contains: "Per-Task Avg Reward" histogram (vertical bars, y-axis = reward 0→1). Right column is `sticky top-0 self-start`. See Revision log for superseded D+A inline-bar-only approach.

### Decision D (revised): Steps 1–3 footer — nav only, no cost

**Revised:** Previous Decision 7 showed cost in a sticky footer visible throughout the single-scroll form. With a stepper, cost belongs at Step 4 (Review) — the commit moment. Showing cost on Steps 1–3 is premature; the user is still deciding what to run.

**Design implication:** Steps 1–3 footer: `[Cancel]` (secondary) and nav buttons only. Step 4 footer: `[Cancel] [← Previous: Tasks] [Launch Training Job]` plus cost/time visible in the Review step body (estimates table), not in the footer itself. The footer remains the action bar; estimates live in the Review content.

### Decision E (revised): Footer inner row centered to content max-width

**Revised:** Previous sticky footer spanned edge-to-edge (full main-content width). Inner content row should align to the same max-width as the form above it.

**Design implication:** Footer background is full-width (sticky to viewport bottom, white + border-top). Footer inner row is `max-width: 1100px; margin: 0 auto; padding: 0 32px` — aligns flush with the form column above. Background extends to viewport edges; row content aligns to form width.

### Decision F (new): Field set grounded in CLI surface

**HUD-side question:** Which fields are real product fields vs. fabrications?

**CLI surface (authoritative):**
```
hud rl run <source>
  -m, --model-id <id>          Model ID to train (interactive selector if omitted)
  --reasoning-effort <level>   low | medium | high  (default: medium)
  -y, --yes                    auto-accept all prompts
```

**Max tool calls** is visible in the production "Configuration" step as the only editable field there. That step is folded into Review in this design.

**Absent fields and why:**
- `--output-model-name` — platform auto-names (Kate Im's GPT 5 (2) → (3) on next training). Not user-facing. Remove.
- Job name field — auto-generates from timestamp. Not user-facing. Remove. The "Job" section is eliminated entirely.
- `--method` / `--algorithm` / SFT-vs-GRPO toggle — method is provider-derived (OpenAI → GRPO). Not user-selectable. Replace with read-only label in Review.
- Hyperparameter grid (learning rate, total steps, KL coefficient, beta) — none exist in the CLI or production UI. Remove.
- GPU class / GPU count — not in CLI or production UI. Remove.

**Resulting field set (5 fields total):**
1. Model (Step 1) — `-m / --model-id`
2. Taskset (Step 2) — `<source>` positional arg
3. Tasks sub-selection (Step 3) — sub-set of the source taskset
4. Reasoning effort (Step 4) — `--reasoning-effort low | medium | high`, default medium
5. Max tool calls (Step 4) — production default 30

### Decision G (new): Footer alignment

**Design implication:** Footer is sticky to viewport bottom. The bar itself spans full width (white background + border-top). The inner row content is constrained to `max-width: 1100px; margin: 0 auto` so buttons and estimates align to the form column above. At Step 4, the inner row is: `[Cancel] [← Previous: Tasks] [Launch Training Job]` — all centered to content width.

### Decision H (new): Model row anatomy — API slug placement and TRAINABLE column removal

**HUD-side question:** Where does the API slug belong in the model row? Is TRAINABLE a useful capability-strip column here?

**Slug placement:** Remove from every unselected row. Surface only on the selected row's expansion, below the capability strip with a copy button. The slug is load-bearing only after the pick is made (SDK config / CLI), not during it. Rendering it on every row is provenance noise per the anti-drift map.

**TRAINABLE column:** Remove from the capability strip. The picker already filters to trainable models — every visible row would show ✓, making the column a constant with zero decision value. The trainable gate belongs at the row level as a badge right-aligned in the title row only when mixed lists appear (e.g., "not trainable" rows dim and show a badge), not as a capability-strip column inside a surface already filtered to that subset.

**Version count:** Promote from parenthetical in title `(2)` to explicit label `2 checkpoints` — signals fork recency for Alex choosing between two GPT-5 variants in his org's library.

**Recommended row anatomy:**
```
[radio]  Kate Im's GPT 5  (2 checkpoints)               [Trainable]
         REASONING    SPEED    CONTEXT    PRICE/M
         ●●●●         ●●●      128K       $2.50

── selected state only ──────────────────────────────────
         kate-im/gpt-5-v2  [⎘]
```

**Sam's reading order:** display name → trainable gate → capability strip → version count. API slug not needed during selection. **Alex's reading order:** display name (confirmation) → trainable gate → HEAD checkpoint / version count → capability strip (he knows the perf profile already).

### Decision I (new): Taskset picker — enriched combobox, not card-list

**HUD-side question:** Switch to card-list for Step 2, enrich the combobox options, or keep name-only?

**Persona reason:** Sam arrives at the Taskset field knowing his target by name; he is configuring, not discovering. Option A (card-list) solves a problem Sam rarely has and is structurally inconsistent with Step 1's enriched dropdown pattern. Option B aligns with Step 1: same combobox structure, richer option rows — metadata available on demand, zero ambient noise to the form's default reading state.

**Design implication (Option B — selected):** Group options into "My Tasksets" / "Public Tasksets" sections. Each option row: `[name]` (left, body weight) + `[N tasks · visibility · owner]` (second line or right, muted). Search filters by name; metadata is display-only. No structural change from Step 1 — same combobox component, enriched options.

**Rejected:** Option A (card-list) — discovery-surface pattern, not configuration-surface. Option C (name-only) — buries load-bearing metadata (812 public tasks vs 3 private) after the choice is made.

### Decision J (new): Combobox option rhythm — spacing, separator, typography

**Context:** Applies to all grouped combobox dropdowns in this wizard (Step 2 Taskset, Step 1 Model if converted to combobox).

**Per-option padding:** `py-2` (8px top + bottom). Two-line rows at `py-1.5` (6px) fuse into a block with no air between consecutive options.

**Typography:** Name at `text-body text-foreground` (14px, full contrast — decision signal). Metadata sub-line at `text-meta text-muted-foreground mt-0.5` (12px, muted, 2px gap — confirmation detail).

**Section separator:** `CommandSeparator` with `-mx-1 my-3 h-px bg-border` (override default `my-1` to `my-3`). A hairline at 12px top+bottom definitively marks the group break; gap-only reads ambiguous in dense lists.

**Section heading:** `text-meta text-muted-foreground tracking-wider uppercase px-2 pt-2 pb-1`. `tracking-wider uppercase` at `text-meta` is the standard label-over-list treatment. `pt-2` (not `pt-3`) because the separator's `my-3` already provides top gap — double-counting creates over-space.

**Hover/selected state:** `data-[selected=true]:bg-highlight-surface` (no change — already calibrated against `bg-popover`).

### Decision K (new): Step 3 toolbar — single row, action bar order

**HUD-side question:** How should the Step 3 toolbar be structured for a multi-function task list?

**Action bar order (one row at lg+):** `[Search (flex-1)]` · `[Filter chips]` · `[Reward shown ▾]` · `[Select all / Deselect all]`

**Rationale:** Sam reads left-to-right in one pass: enter keywords → narrow by prefix → scope the metric view → act on selection. Two rows add a scan break for a control set that is already sparse.

**Filter chips:** appear inline in the toolbar only when the taskset has >1 prefix; hidden (not collapsed) when a single prefix makes filtering meaningless. `[+ Add filter]` opens a popover to emit prefix chips (e.g., `menu:order-*`).

**Select all / Deselect all:** right edge of the single toolbar row — utility action, anchors right where destructive-range controls live by convention. Toggles in place.

**"Tasks" title above the right column:** Remove. The step heading already reads "Tasks / Choose which tasks to include in training." A second "Tasks" label above the histogram adds zero information. The histogram's own subtitle ("Per-Task Avg Reward") already names what it is.

### Decision L (new): Step 3 function audit — restored controls

Four production functions audited against wireframe spec:

**A — Reward sort toggle:** `Reward shown: [This Model ▾]` toggle above the task list, with options "This Model" / "All Models". Both signals are load-bearing: "This Model" shows where HIS model struggles; "All Models" shows whether those tasks are universally hard (high signal) or noise. Neither can be dropped. A sort dropdown buries the distinction; two columns add scan cost at 240 rows. Toggle above the list keeps one reward bar per row while letting Alex flip the reference frame. Persists for the session.

**B — Search + filter chips:** Add a `Search tasks…` input above the chip row. At 240 tasks, unassisted scrolling is not a workflow. Free-text slug matching via search input; prefix-chip narrowing via `+ Add filter` popover. Both additive to the existing toolbar row — no new chrome.

**C — Args line (restored) + 4-digit badge (dropped):** The 4-digit index badge (`0000`) is index-as-chrome — carries no decision signal; the task slug already uniquely identifies the row. Remove. The args line (`title=check errands`) is the opposite: two tasks with the identical slug (`menu:order-recovery`) are distinguishable ONLY by their args. Without it, Alex cannot tell which variant he is including or excluding. Restore as a secondary line below the slug, truncated at one line.

**D — Selected stat summary:** Keep. Place below the task list's scroll boundary, above the acknowledgment warning. `Selected · N tasks · Avg Reward · X%` is a glance-altitude readout — the histogram shows distribution shape; the stat line shows the scalar summary. At 240 tasks, the arithmetic is non-trivial.

### Decision M (new): Model picker color rest

**HUD-side question:** Which color elements on the selected model row are load-bearing vs decorative?

**Load-bearing:** Radio glyph (border-primary bg-primary + white check) — the single authoritative selection indicator. Row border (`border-primary`) — perimeter signal that the row is selected.

**Decorative (remove):** Row background glow (`bg-primary-glow`) — redundant with the border; creates a teal-on-teal canvas that amplifies every other teal element. Display name `text-primary` — the row already has border + glyph; name in primary is a third teal hit where the eye lands first; converting to `text-foreground` loses zero information.

**Spared:** Radio glyph fill, reasoning-check `text-state-scored-text` green (semantic capability indicator), usage sparkline (already neutral — reads correctly once glow canvas is gone), speed bar fill (already neutral).

**Concrete changes:**
- Row container: `selected ? "border-primary bg-card" : "border-border hover:border-border-strong"` (was `bg-primary-glow`)
- Display name: unconditional `text-foreground` (was `selected ? "text-primary" : "text-foreground"`)

### Decision N (new): MoE progress bar color — threshold-based

**HUD-side question:** Should the Margin of Error bar in the Run Taskset drawer be static amber, always neutral, or threshold-based?

**Verdict: Option B — threshold-based color.** Static amber violates "color = state, never decoration": MoE at n=40 is not the same state as MoE at n=4, but the bar reads identically. Neutral always (Option A) discards a signal Sam is actively watching as he adjusts group size. Threshold-based: amber fires only when MoE > 20% (standard "acceptable precision" threshold in eval literature), turns off to neutral fill once n is sufficient. Bar length encodes magnitude; color encodes threshold status — both are state, neither is decoration. Threshold should be a future-configurable constant.

### Decision O (new): Drawer font tiers (Run Taskset drawer)

**Applies to:** `run-taskset-dialog.tsx`, `max-steps-control.tsx`, `group-size-control.tsx`, `cost-formula.tsx`. Token scale: `text-display` 24px / `text-subtitle` 16px / `text-body` 14px / `text-label` 12px 0.02em / `text-caption` 12px 0em / `text-code` 12px mono / `text-meta` 10px 0.16em mono+uppercase.

**Two elements need fixing:**
1. **MoE meta line** (`at n=3 · 95% CI · p̂≈0.5`) — currently `text-meta` (10px). Fix to `text-caption font-mono` (12px, 0em tracking). This is mono prose annotation, not a structural uppercase label.
2. **Footer trace formula** (`0 × 4 × 3 = 0 traces`) — currently `text-meta` (10px). Fix to `text-caption font-mono` (12px). Calculation readout, not a column-header glyph.

**Missing helper texts (gaps, not wrong sizing):**
- Max Steps: add `text-caption text-muted-foreground` helper below label: "Maximum steps per task. Default is 15."
- Group Size: add `text-caption text-muted-foreground` helper: "Trials per task. Higher n shrinks the margin of error."

**All other elements confirmed correct** (DrawerTitle `text-subtitle`, model row name `text-body`, form labels `text-label`, slider tick labels `text-meta font-mono`, MoE bar value `text-label font-mono`).

### Decision P (new): Step 3 column order — list LEFT, chart RIGHT

**HUD-side question:** Current live implementation places the histogram LEFT (fixed `280px`) and task list RIGHT. The wireframe spec (Decision C3) specifies the opposite. Which is correct?

**Verdict: task list LEFT, chart RIGHT** — wireframe spec is correct; live implementation is transposed.

**Rationale:** Western reading flow maps primary actor (task list) left, decision-support artifact (chart) right. At default state (all tasks checked), the chart shows a distribution Sam hasn't curated — landing on it first makes it noise, not signal. He must scan right to do his actual work. Corrected order: act (left) → observe result (right). The chart then reacts to his left-column selections, which is the correct temporal order.

### Decision R (revised): Step 4 layout — Configuration block ABOVE the Review preview

**HUD-side question:** Editable Max tool calls field on Step 4 (Review) — the "Review" header implies read-only confirmation; an editable input inside it conflates two semantics. Where should the field live?

**Verdict: top-of-step `Configuration` block (editable) followed by the read-only Review preview (summary + estimates + notes).**

**Persona reason:** The semantic clash is real — editable inputs should not interleave with read-only review content. Layering them top→bottom (configure first, then review) preserves the "Review = no surprises" semantic for the read-only portion while keeping Max tool calls visible without an extra click. An `Advanced` disclosure was tested and rejected: tucking config behind a chevron makes it discoverable but not glanceable; Sam scanning Step 4 should see all values that will be committed.

**Rejected alternatives:**
- `▶ Advanced` disclosure at the bottom (initial direction): hides config below review content, requires a click to expose values that will be committed.
- Restoring Configuration as Step 5 of 5: adds a step + stepper segment that 95% of users would click through unchanged.
- Moving Max tool calls into Step 3 (Tasks): semantic stretch — max tool calls is a per-task constraint, but Step 3 is about WHICH tasks. Different question.
- Dropping user control and hardcoding 30: closes the escape hatch Alex needs for environments with unusual tool budgets.

**Design implication:** Step 4 body, in order:
1. `Configuration` section heading + Max tool calls label + helper + number input (editable)
2. Summary sentence: `Training {model} on {taskset} with {provider} using {method}.`
3. Derived method label: `Training method: GRPO via OpenAI (derived from model provider)`
4. Estimates table (Estimated time / Hourly rate / Estimated cost)
5. Amber notes callout

The `Configuration` heading style matches the canonical section-label treatment used elsewhere on the step (e.g., `ESTIMATES`).

---

### Decision Q (new): Mobile Select prefix pattern + flex-1 spacing

**Applies to:** Any SegmentedControl that collapses to Select on mobile (jobs toolbar scope/time filters, Step 1 model view toggle).

**Prefix pattern (Option A):** Embed the category name inside the trigger as a prefix: `Scope: Team ▾` / `Time: 7d ▾`. Without the sibling segments as visual anchors, the selected value loses its category. A prefix inside the trigger restores that anchor at zero layout cost. Aria-label-only fails the visual scan requirement; external labels add a row and break swap-not-stack rule; placeholder-pattern only shows context when empty.

**Spacing:** Both Selects fill the row equally (`flex-1`), `gap-2` between them, `mt-2` below search row. Trigger height `h-9` matches search input — keeps the two rows visually continuous.

**Per-surface:**
- Jobs toolbar: `Scope: My ▾` / `Time: 24h ▾` prefix pattern; both `flex-1`, same row, `h-9`.
- Step 1 model view toggle (if converted to Select on mobile): `View: My Models ▾` — "View" as governing category; single Select `w-full`.

---

## Revision log

| Earlier decision | Final answer | Reason superseded |
|---|---|---|
| Step 3: D+A combo — inline per-task reward bars + compact histogram strip above list (40px, full-width) | Two-column `lg:grid-cols-[1fr_280px]` (Decision C3 final) | 56px horizontal strip is lossy encoding of a vertical distribution; sticky left-column with full scroll-height gives chart real visual resolution. D+A is single-column, which eliminates the chart's resolution advantage. |
| Step 3: chart column LEFT (live implementation) | Task list LEFT, chart RIGHT (Decision P) | Western reading flow; Sam acts on list before interpreting chart; landing on chart first makes it noise at default state. |

---

## §1 Page-level layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AppShell sidebar (52px collapsed — icon-only rail)                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  MAIN CONTENT AREA  (bg: app-bg)                                        ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────┐        ││
│  │  │  PAGE HEADER  (breadcrumb + h1 + descriptor strip)           │        ││
│  │  └──────────────────────────────────────────────────────────────┘        ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────┐        ││
│  │  │  STEPPER HEADER  (Model · Taskset · Tasks · Review)          │        ││
│  │  └──────────────────────────────────────────────────────────────┘        ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────┐        ││
│  │  │  STEP CONTENT (one step visible at a time, max-width 1100px) │        ││
│  │  └──────────────────────────────────────────────────────────────┘        ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────┐        ││
│  │  │  STICKY FOOTER  (full-width bar; inner row centered 1100px)  │        ││
│  │  └──────────────────────────────────────────────────────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## §2 Page header

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Jobs                                                                  │
│                                                                          │
│  New Training Job                          [serif h1, HUD display font] │
│  Configure a training run for a model checkpoint.  [subtitle, read-tier]│
└─────────────────────────────────────────────────────────────────────────┘
```

- Breadcrumb: `← Jobs` (links to `/jobs`)
- h1: "New Training Job" — serif display font (matches production screenshots)
- Subtitle: one sentence, read-tier weight
- No primary CTA at header altitude — the stepper footer owns the Launch action

---

## §3 Stepper header

```
┌─────────────────────────────────────────────────────────────────────────┐
│   Model   ·   Taskset   ·   Tasks   ·   Review                          │
│           ─────────────────────────────────────                         │
│                                              ▔▔▔▔▔▔▔▔ (gold underline) │
└─────────────────────────────────────────────────────────────────────────┘
```

- Four labels in a horizontal row
- Active step: gold 2px bottom underline, primary-tier text weight
- Completed steps: checkmark glyph (✓) prefix, read-tier weight, clickable to return to that step
- Future steps: meta-tier text weight, not clickable until visited
- Stepper header is not a progress bar — there is no % fill or connecting line, just the labels + underline convention from production screenshots

---

## §4 Step 1: Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Model                                        [step heading]            │
│  Choose the model checkpoint to train.        [step description]        │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ▼ My Models  ─────────────────────────────────────────────  (open)    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ● Kate Im's GPT 5  (2 checkpoints)              [selected row]    │ │
│  │   REASONING    SPEED    CONTEXT    PRICE/M                         │ │
│  │   ●●●●         ●●●      128K       $2.50                           │ │
│  │   kate-im/gpt-5-v2  [⎘]    ← selected state only                  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ▶ Trainable Base Models  ──────────────────────────────────  (collapsed)│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

LOCKED STATE (when ?modelId= is set):
┌────────────────────────────────────────────────────────────────────────┐
│  🔒 Kate Im's GPT 5  (2 checkpoints)                         [Change]  │
│     REASONING    SPEED    CONTEXT    PRICE/M                           │
│     ●●●●         ●●●      128K       $2.50                             │
└────────────────────────────────────────────────────────────────────────┘
```

**My Models (anchored open)**
- Sub-header with disclosure toggle, anchored open when user has ≥1 model
- Each row: radio glyph (●/○) · model name · version count `(N checkpoints)` · capability strip (REASONING · SPEED · CONTEXT · PRICE/M) below on selected row
- API slug appears below capability strip on selected row only, with copy button
- TRAINABLE column removed from capability strip — picker already filters to trainable models; column would be a constant ✓ with zero decision value
- Selected row: light card background (`bg-card`), border-primary border (no primary glow — see Decision M)
- Display name: `text-foreground` unconditionally (not `text-primary` when selected)

**Trainable Base Models (collapsed)**
- Sub-header with ▶ disclosure; click to expand
- Same row shape as My Models

**Locked state (URL ?modelId=):**
- Single filled row: lock glyph + model name + version count + capability strip
- `[Change]` secondary link top-right — clicking unlocks the picker

**Footer for Step 1:** `[Cancel]` · `[Next: Taskset →]`

---

## §5 Step 2: Taskset

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Taskset                                      [step heading]            │
│  Select the taskset to train against.         [step description]        │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  hud-browser                                            [▾]      │   │
│  │  4 tasks · private · Kate Im · 20 days ago                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  OPEN DROPDOWN (enriched combobox options):                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Search tasksets…                                                │   │
│  │  ─────────────────────────────────────  [my-tasksets separator]  │   │
│  │  MY TASKSETS                                                     │   │
│  │    hud-browser                         4 tasks · private · Kate Im│  │
│  │    api-regression-v2                   12 tasks · private · Kate Im│  │
│  │  ─────────────────────────────────────  [public separator]       │   │
│  │  PUBLIC TASKSETS                                                 │   │
│  │    webarena                            812 tasks · public · hud-ai│  │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  BASELINE HINT (appears after taskset selected):                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ⚪ No baseline yet                                               │   │
│  │  No baseline yet — running eval first can save compute if the     │   │
│  │  model already passes most tasks.                                 │   │
│  │  [Run baseline eval]                                     [dismiss]│   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  LOCKED STATE (?taskset= param):                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  🔒 hud-browser                                         [Change] │   │
│  │  4 tasks · private · Kate Im · 20 days ago                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Taskset picker (enriched combobox — Decision I):**
- Grouped sections: "My Tasksets" / "Public Tasksets" with hairline separator between (`CommandSeparator -mx-1 my-3`)
- Section headings: `text-meta text-muted-foreground tracking-wider uppercase` (10px, uppercase — structural label)
- Each option: name at `text-body text-foreground` (14px) + metadata sub-line at `text-meta text-muted-foreground mt-0.5` (12px, muted)
- Per-option padding: `py-2` (8px — two-line rows need air between; `py-1.5` fuses them)
- Locked state: chip + lock glyph + `[Change]` link (same pattern as Model Step 1)

**Baseline coverage hint (appears after taskset is selected):**

State 1 — **Evaluated (green):**
```
  ✅ Evaluated
  Avg reward 68% across 4 tasks · [View results]
```

State 2 — **Partial (amber):**
```
  ⚠ Partial coverage
  3 of 4 tasks evaluated — Avg 72% so far · [Complete baseline]
```

State 3 — **No baseline (info/neutral):**
```
  ⚪ No baseline yet
  Running eval first can save compute if the model already passes most tasks.
  [Run baseline eval]
```

All three states: advisory only. None disable "Next: Tasks".

**Footer for Step 2:** `[Cancel]` · `[← Previous: Model]` · `[Next: Tasks →]`

---

## §6 Step 3: Tasks

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Tasks                                        [step heading]            │
│  Choose which tasks to include in training.   [step description]        │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  [Search ________________________] [browser: ×] [+ Add filter]           │
│                       [Reward shown: This Model ▾]  [Deselect all]      │
│                                                                          │
│  ┌─────────────────────────────────────────┐  ┌──────────────────────┐  │
│  │                                         │  │ Per-Task Avg Reward  │  │
│  │ ☑ browser:2048-near-win                 │  │                      │  │
│  │   title=2048-near-win          [40%] ██ │  │  ▄                  │  │
│  │ ☑ browser:todo-create                   │  │  ▄       ▄         │  │
│  │   title=todo-create            [ 0%] ░  │  │ 0%   50%   100%     │  │
│  │ ☑ menu:order-recovery                   │  │                      │  │
│  │   title=check errands          [ 0%] ░  │  │ (vertical bars,      │  │
│  │ ☑ menu:order-recovery                   │  │  sticky right col,   │  │
│  │   title=pick up prescriptions  [ 0%] ░  │  │  y-axis = reward     │  │
│  │                                         │  │  0→1,                │  │
│  │ ─────────────────────────────────────── │  │  reacts to left-col  │  │
│  │ Selected · 4 tasks · Avg Reward · 10%   │  │  selection)          │  │
│  │                                         │  └──────────────────────┘  │
│  │ ⚠ Selected 4 tasks — minimum is 10.    │                             │
│  │   Tasks will be duplicated to reach 10. │                             │
│  │ ☐ I understand tasks will be duplicated │                             │
│  └─────────────────────────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

**Toolbar (single row at lg+):**
- Left: `Search tasks…` input (flex-1) — free-text slug matching
- Middle: filter chips (inline when taskset has >1 prefix; hidden otherwise) + `[+ Add filter]` (opens popover that emits prefix chips)
- Right: `[Reward shown: This Model ▾]` toggle (options: This Model / All Models) · `[Select all / Deselect all]`
- "Tasks" title above the right column: removed (step heading is sufficient; see Decision K)

**Task list (left column, flex-1, scrollable):**
- Each row: checkbox · task slug (monospace) · args line below slug (secondary, truncated at one line) · inline reward bar + percentage (right-aligned)
- Inline reward bar: `w-16 h-1.5 rounded-full` track, fill at `bg-brand/60` (matches histogram color, stays subordinate)
- 4-digit index badge removed (no decision signal — slug already uniquely identifies the row)
- Default: all tasks in the selected taskset checked
- Reward bar re-renders against the selected reference frame (This Model / All Models toggle)

**Stat summary line (below list, above acknowledgment):**
- `Selected · N tasks · Avg Reward · X%` — scalar summary; histogram shows distribution, stat shows aggregate
- Visible when the list scrolls; co-located with min-10 warning

**Inline validation warning (amber):** when selected count < 10
**Acknowledgment checkbox:** "I understand tasks will be duplicated" — required when count < 10

**Histogram (right column, fixed 280px, sticky):**
- Title: "Per-Task Avg Reward" (per Decision K — right column keeps its own subtitle)
- Vertical bars: x-axis = task count buckets, y-axis = reward 0→1
- `sticky top-0 self-start` within the step card — stays in view as left column scrolls
- Reacts to left-column selection changes
- No interaction required (static reference artifact)

**Column order: task list LEFT, chart RIGHT** (Decision P — matches western reading flow; live implementation reverses this and must be corrected)

**"Next: Review" gating:** `aria-disabled` when 0 tasks selected, or tasks < 10 AND acknowledgment unchecked.

**Footer for Step 3:** `[Cancel]` · `[← Previous: Taskset]` · `[Next: Review →]`

---

## §7 Step 4: Review

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Review                                       [step heading]            │
│  Confirm configuration and launch.            [step description]        │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Training Kate Im's GPT 5 (2) on hud-browser with OpenAI         │   │
│  │  using GRPO.                                [read-only summary]  │   │
│  │                                                                    │   │
│  │  Training method: GRPO via OpenAI (derived from model provider)  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Reasoning effort                                                        │
│  ( ) Low    (●) Medium    ( ) High                                       │
│                                                                          │
│  Max tool calls                                                          │
│  ┌──────────┐                                                            │
│  │ 30       │                                                            │
│  └──────────┘                                                            │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ESTIMATED TIME     HOURLY RATE        ESTIMATED COST            │   │
│  │  ~0–6 hours         $250.00/hour       ~$0–$1,417                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ⚠ Important notes for OpenAI training                           │   │
│  │  • Environment startup time: Must be under 60 seconds.           │   │
│  │  • Rate limits: Environment needs to handle bursts of 50 req/s.  │   │
│  │  • Vision tasks: Not currently supported for training.           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  [Copy as CLI command]                        [secondary text link]     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Summary block (top, read-only):**
- Sentence pattern: `Training [Model] on [Taskset] with [Provider] using [Method].`
- Example: "Training Kate Im's GPT 5 (2) on hud-browser with OpenAI using GRPO."
- Second line: `Training method: GRPO via OpenAI (derived from model provider)` — read-only, meta register

**Configuration fields (middle, inline — not collapsed):**
- Reasoning effort: radio group — `( ) Low  (●) Medium  ( ) High` — default Medium
- Max tool calls: number input, default 30
- Both editable here; their values were not set in earlier steps

**Estimates table:**
- Three columns: `Estimated time: ~0–6 hours` · `Hourly rate: $250.00/hour` · `Estimated cost: ~$0–$1,417`
- Tabular layout, read-only
- Cost is visible at the commit moment (Step 4) only — not surfaced in the footer on Steps 1–3 (Decision D)

**Amber callout — Important notes for OpenAI training:**
- Verbatim from production:
  - "Environment startup time: Must be under 60 seconds."
  - "Rate limits: Environment needs to handle bursts of 50 req/s."
  - "Vision tasks: Not currently supported for training."

**Copy as CLI command link:**
- Secondary text link below the amber callout
- Clicking copies the equivalent `hud rl run <source> -m <model> --reasoning-effort <level>` command to clipboard
- This is the CLI parity surface in stepper mode — replaces the standalone CLI equivalent section from the single-scroll design

**Footer for Step 4:** `[Cancel]` · `[← Previous: Tasks]` · `[Launch Training Job]` (gold primary, dark text)

---

## §8 States coverage

### Required-field validation
- Model (Step 1): Next disabled until model is selected (`aria-disabled`)
- Taskset (Step 2): Next disabled until taskset is selected
- Task acknowledgment (Step 3): Next disabled when count < 10 AND acknowledgment unchecked
- Reasoning effort and Max tool calls (Step 4): pre-filled with defaults; Launch enabled by default on this step if all prior steps completed

### URL prefill variants
- `?modelId=<id>`: Step 1 renders locked (filled row + lock + Change link). User begins on Step 1, sees the locked model, clicks Next immediately.
- `?taskset=<slug>`: Step 2 renders locked. Baseline hint appears immediately for the prefilled model × taskset pair.
- `?modelId=<id>&taskset=<slug>`: Both steps 1 and 2 locked. User can advance to Step 3 without any selections.
- No URL params: all steps editable, form starts with Model and Taskset empty.

### Baseline hint states
- Evaluated: green accent (Avg reward X% across N tasks)
- Partial: amber accent (M of N tasks evaluated)
- No baseline: info/neutral accent
- All states advisory; none block "Next: Tasks"

### Task count validation
- ≥10 selected: no warning, acknowledgment checkbox absent, Next enabled
- 1–9 selected: amber warning + duplication note + acknowledgment checkbox (required for Next)
- 0 selected: Next `aria-disabled` with tooltip "Select at least one task."

---

## §9 Responsive (desktop primary — mobile out of scope)

- Viewport assumption: 1440px wide desktop
- Form content: `max-width: 1100px` centered in main content area
- Footer inner row: same `max-width: 1100px; margin: 0 auto` — aligns with form above (Decision E / G)
- Step 3 two-column layout (`lg:grid-cols-[1fr_280px]`): collapses to single column below `lg` breakpoint — not specced for this pass
- Mobile Select prefix pattern (Decision Q) applies when SegmentedControls collapse to Select triggers on jobs toolbar and model view toggle

---

## §10 Keyboard / a11y

- Stepper header: completed steps are keyboard-navigable tab targets (Enter returns to that step)
- All form controls: label → input pairing, `aria-required` on required fields
- Next/Launch buttons: `aria-disabled` with accessible tooltip (not HTML `disabled`, which removes focus)
- Task checkboxes: standard checkbox semantics, group labelled by step heading
- Reasoning effort: standard `<fieldset>` + `<legend>` + radio group
- Lock glyph: visually hidden text "Prefilled from URL — read-only" for screen readers
- Copy CLI link: `aria-label="Copy training command to clipboard"`
- Search input in Step 3 toolbar: `aria-label="Search tasks"`
- Reward toggle (`Reward shown: This Model ▾`): `aria-label="Reward reference frame"` on the Select trigger
- Args line per task row: `aria-label` on the row or `aria-describedby` pointing to the args text so screen readers announce "browser:todo-create, title=check errands"

---

## §11 Persona notes

**Sam's primary path (happy path, stepper edition):**
1. Lands with `?taskset=hud-browser` — stepper opens at Step 1 (Model)
2. Step 1: Picks "Kate Im's GPT 5 (2 checkpoints)" from My Models in one click → Next: Taskset
3. Step 2: Taskset prefilled (locked) — reads "No baseline yet" advisory, dismisses, clicks Next: Tasks
4. Step 3: All 4 tasks pre-selected — sees duplication warning, checks acknowledgment → Next: Review
5. Step 4: Reads summary line, confirms defaults (Medium effort, 30 tool calls), sees "$0–$1,417 / 0–6 hours" — decides cost is acceptable → Launch Training Job
6. Total interaction: ~5 clicks. No hidden fields. No wizard-friction.

**Alex's primary path (CLI-escape mode):**
1. Lands from model-detail with `?modelId=kate-im/gpt-5-2` — Step 1 shows locked model, confirmed at a glance → Next: Taskset
2. Step 2: Types/selects taskset slug — dismisses "No baseline" advisory → Next: Tasks
3. Step 3: Searches for weak-task slugs, deselects easy ones, flips Reward to "All Models" to check if weak tasks are universally hard, checks acknowledgment → Next: Review
4. Step 4: Reads summary, keeps defaults, sees estimate, clicks "Copy as CLI command" for his training script → Launch

---

## §12 Open questions

1. **Taskset picker — combobox vs simple dropdown.** For users with 50+ tasksets, a searchable combobox is strictly better. Blocked on `Combobox` component availability. A dropdown with embedded search is acceptable for first pass.

2. **Baseline hint: auto-trigger or lazy?** The baseline hint appears after taskset is selected. Does this require a real-time API call (fetch eval status for model × taskset on taskset selection), or is it cached? Loading state needs speccing if API-driven. Not blocking for wireframe — should be resolved before screen-spec.

3. **"Copy as CLI command" — command shape.** The CLI is `hud rl run <source> -m <id> --reasoning-effort <level>`. Does Max tool calls have a flag? Not visible in the CLI docs. Needs engineering confirmation before screen-spec.

4. **My Models empty state.** When user has no models: should My Models sub-section show an empty state with a prompt to train a base model, or should Trainable Base Models reorder to first? Recommend: empty-state message in My Models position, Base Models expand below — preserves information architecture.

5. **Cost/time range calculation.** What drives the range? The `(?)` tooltip copy needs engineering confirmation of the formula before screen-spec.

6. **Reward toggle persistence.** "Reward shown: This Model / All Models" toggle — does it persist across Steps (session-level) or reset on step nav? Recommend: session-level persistence.

7. **Args line truncation.** Args line is truncated at one line. When a task has multiple args, how are they shown? Recommend: comma-separated on one line, ellipsis if overflow, full args in a tooltip.

8. **MoE threshold constant.** Decision N establishes 20% as the MoE amber threshold. Should this be configurable per-org or user-level in the drawer settings? Flag for platform team.

---

## §13 Out of scope (this dispatch)

- Eval form variant (`?type=eval`)
- Junction picker (no `?type=` param)
- Drawer variant (Run Taskset drawer is specced in Decision O for font tiers only)
- Mobile / tablet layout
- Loading states for taskset picker and baseline hint
- Error states for form submission failure
- Post-launch redirect behavior
- Motion / animation — motion-designer scope
- Run Taskset drawer full wireframe — separate dispatch

---

## §14 Drift log

- Production wizard stepper (5-step) → revised design keeps stepper, reduces to 4 steps: **Model · Taskset · Tasks · Review**
- Production OR layout on Model selection → replaced with single picker + sub-sections (Decision B)
- Production red error box for missing baseline → replaced with advisory inline hint card (Decision C2)
- Production "Configuration" step (Max Tool Calls only) → folded into Review step as an inline editable field (Decision F)
- Production "Final Details" step → folded into Review step as the estimates table + amber callout (Decision F)
- Single-scroll + section anchor nav design (previous iteration) → reverted to stepper (Decision A revised)
- **Output model name field** — fabrication; removed. Platform auto-names models. (Decision F)
- **"Job" section entirely** — fabrication; removed. Job names auto-generate. (Decision F)
- **Method chip toggle (SFT | RL-GRPO)** — fabrication; removed. Method is provider-derived. Replaced with read-only label in Review. (Decision F)
- **Hyperparameter grid** (learning rate, total steps, KL coefficient, beta) — fabrication; removed. Not in CLI or production. (Decision F)
- **GPU class / GPU count** — fabrication; removed. Not in CLI or production. (Decision F)
- **CLI equivalent section** — removed as a standalone section; replaced with "Copy as CLI command" text link on the Review step. (Decision A revised)
- **Sticky footer cost display throughout** — moved to Review step body (estimates table); footer on Steps 1–3 shows nav only. (Decision D revised)
- **API slug in every model row** — removed from unselected rows; surfaces on selected row only below capability strip (Decision H)
- **TRAINABLE capability-strip column** — removed; picker already filters to trainable models, column is a constant ✓ with zero decision value (Decision H)
- **bg-primary-glow on selected model row** — removed; border-primary alone closes the selection signal; glow creates teal-on-teal canvas (Decision M)
- **text-primary on selected model display name** — removed; unconditional text-foreground; three teal signals were two too many (Decision M)
- **Card-list for taskset picker** — rejected; structurally inconsistent with Step 1's enriched dropdown pattern; adds discovery-surface chrome to a configuration surface (Decision I)
- **Step 3 chart column LEFT (live)** — transposed; corrected to task list LEFT, chart RIGHT (Decision P / Revision log)
- **Step 3 single-column D+A layout** — superseded by two-column lg+ grid; strip histogram was lossy encoding (Revision log)
- **4-digit index badge per task row** — removed; index-as-chrome, no decision signal (Decision L-C)

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md). Operator-confirmed locked decisions: Jun 2026. Flow reference: [`docs/design/flows/job-launch.md`](../flows/job-launch.md). Peer wireframes: [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md), [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md).*
