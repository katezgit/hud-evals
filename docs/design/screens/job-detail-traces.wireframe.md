# Job Detail — Traces Tab Wireframe

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

> **Affordance over instruction — no chrome-level text that explains how to interact.** If the design needs a label to teach a user to click something, the affordance has failed. Remove the instruction; fix the affordance.

**This file specifies the Traces tab anatomy only.** Job detail page header, tab bar, and sibling tabs (Overview, Runs, Usage) are out of scope here.

Mockup: `docs/design/mockups/job-detail-traces-tab/index.html`

Cross-links:
- [`docs/design/screens/job-detail-usage.wireframe.md`](./job-detail-usage.wireframe.md) — peer format reference. Decision-log pattern and section conventions inherited from here.
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome.

---

## Context

The Traces tab is the primary forensic surface on the Job detail page. It is where Alex and Sam audit trace outcomes after a job run completes — scanning reward distribution, curating invalid traces, and launching targeted QA analysis on failing or low-scoring runs.

**Primary surface goal:** Let an RL researcher or agent engineer identify which tasks and traces succeeded, failed, or need curation — fast, at 100-trace scale, without context-switching to the CLI.

**Persona load:**
- **Alex (primary)** — frontier RL researcher. Arrives after a job completes to inspect the reward distribution. Scans task-level aggregate rows to spot which tasks are scoring low, expands those tasks to compare individual attempt rewards, and invalidates environmental failures. The task-tree matches Alex's actual question sequence: task-level → trace-level.
- **Sam (secondary)** — applied agent engineer. Uses the Traces tab to audit regression eval results. Filters to "No score" or low-reward tasks after a CI pipeline run; expands affected tasks to invalidate traces where env setup failed so they don't pollute job aggregate stats.
- **Riley (incidental)** — env vendor. Reviews traces during QA of a new taskset to verify each task is reachable. Uses card view when env-state screenshots are available.

---

## Design questions

### D1 — Task-grouped tree as default list view

**HUD-side question:** How does Alex scan reward distribution across tasks when each task has multiple attempts (traces)?

**Choice:** Task-grouped tree — parent row per task (chevron + task ID + prompt + aggregate metrics), collapsible child rows per trace (indented, per-attempt values). This is the default list view. Card view remains unchanged as an alternate.

**Persona reason:** At 10 tasks × 10 attempts = 100 traces, a flat list repeats the same task prompt 10 times in a row. Alex's first forensic question is "which tasks are scoring poorly?" not "which individual trace IDs are low?". The tree answers the task-level question immediately at the parent row and lets Alex drill into attempts only for tasks that flag attention. The production HUD already patterns this (`> 0001 Group 2 · 0/3 (3 err) · ...`), confirming the mental model is task-first.

**Click semantics:**
- Parent row click → toggle expand/collapse
- Child trace row click → opens Trace viewer
- ↗ on child row → opens trace in new tab
- Parent row has no ↗ — it is not a navigable entity, only a group header

**What was rejected in prior iteration:** Flat one-row-per-trace as the default list mode. Causes "task name repeats N times" scan problem at realistic scale.

---

### D2 — State column dropped; reward carries state via color

**HUD-side question:** How does Alex know the outcome of a trace at a glance?

**Choice:** No State column. The Reward cell is the single state signal: color band encodes outcome, and chip variants handle the non-numeric cases (invalidated, not run). This eliminates a column and a redundant concept — "scored" is `reward ≥ 0` with a color, "invalidated" is the amber chip, "not run" is the neutral chip.

**APP-LEVEL NOTE:** The reward-band → color mapping is applied at the consumer call site, not extracted into a `@repo/ui` primitive. Business rules stay at the app level. See anti-patterns section.

**Color bands (app-level, consumer-applied):**
- `reward >= 0.7` → `text-state-scored-text` (green)
- `0.4 <= reward < 0.7` → `text-state-warning-text` (amber)
- `reward < 0.4` → `text-state-errored-text` (red)
- Invalidated → muted strikethrough number + small amber `invalidated` chip
- Not run → small neutral `not run` chip, no number

---

### D3 — Model column dropped; model identity in count line

**HUD-side question:** Where does the model identity live, and how does it change when a job compares N models against one taskset?

**Single-model job (N=1):** The count line states the model name inline in monospace muted-foreground text. No chip. No separate column. Format: `88 Traces · across 10 Tasks · claude-opus-4-6`.

**Multi-model job (N≥2):** The count line states the model count inline. Format: `88 Traces · across 10 Tasks · 3 models`. Per-model reward identity is carried entirely within the task rows (the per-model reward strip in D9) and the list-view expansion levels (D10). No chip cluster in the tab header.

**"3 models" affordance decision — no hover, no tooltip, no popover.**

Alex and Sam arrive on this tab in a forensic posture: their first act is expanding task parent rows to read the per-model reward strip. Model identities (`gpt-4o`, `qwen2.5-14b`, `llama-3.1-8b`) appear immediately in those strips — one row-expand away. The count line is a summary anchor, not a model directory. Adding hover-to-discover creates interaction debt to surface information Alex already encounters the moment he expands a single row; it also violates the affordance-over-instruction principle (a text trigger "hover to see models" would be necessary to teach the gesture). `3 models` stays plain text. Model identity belongs in the tree, not the count line.

- **Reward column in task parent row:** A per-model reward strip — a compact horizontal sequence of model-reward pairs sorted by overall reward descending (e.g., `gpt-4o 0.81 · qwen 0.73 · llama 0.65`). Each pair is color-banded with the same reward-tier mapping as D2. When a model has no scored trace on a task, its slot shows `—`. Aggregate cost / turns / duration columns remain rolled up across all models.
- **No separate Model column** in either mode.
- **No chip cluster in the tab header** in either mode — the operator directed removal of the chip cluster entirely; per-model reward summary belongs in Overview (comparison headline), not the Traces tab header.

**N=1 degenerates cleanly:** the count line shows the model name (monospace, muted), the Group by toggle is absent, and the Reward column stays as a single avg value.

---

### D8 — Group by toggle (multi-model, list view only)

**HUD-side question:** What is the primary lens for a multi-model job — comparing models on the same task, or auditing one model across all tasks?

**Choice:** A `Group by: Task | Model` toggle in the filter bar, visible only when N≥2 AND list/table view is active.

- **Placement:** Filter bar, between the status pills and the view segmented control. Rendered as a segmented ghost control (`Task | Model`), mirroring the visual weight of the view toggle.
- **Default:** `Task` — because the headline forensic question in a multi-model eval is "which model won task X, and where did they diverge?" That question requires comparison across models on the same task row, not within a single model's history.
- **Visibility gate — list view only:** Rendered only when N≥2 AND the list/table view is active. In card view the toggle is absent. Rationale: card view has no group-rendering mechanism; the toggle would be dead UI with no visual effect, creating false affordance.
- **Visibility gate — N=1:** For N=1 the control is always absent regardless of view mode.
- **Group by Task behavior:** Task parent rows. Each collapsed parent shows the per-model reward strip (D9). Expansion is two-level: task → per-model sub-row → individual runs (D10).
- **Group by Model behavior:** Model section headers (anatomy in list view anatomy section below). Expand → task rows under that model (current parent row shape). Expand task → individual runs. This is the "how does model X perform across the taskset?" lens.

---

### D9 — Per-model reward strip (multi-model, Group by Task)

**HUD-side question:** How does Alex read which model won a task at a glance in the collapsed parent row?

**Choice:** The Reward column cell in the collapsed task parent row shows a compact horizontal strip of per-model rewards in place of the single avg value. Format: `model-label reward · model-label reward · …` (separator `·`). Each reward token is color-banded per D2's tier mapping (app-level, call site). Sort order matches header chip cluster (winner first by overall reward).

- When a model has no scored trace on a task: its slot renders `—` in `text-meta-foreground`, no color band.
- The strip is text-only in the table cell. Hover on the cell may surface a tooltip with full precision rewards (implementation detail, not specced here).
- Column heading stays "Reward"; no heading change needed — the strip is the cell value.

---

### D10 — Two-level expansion (multi-model, Group by Task)

**HUD-side question:** What are the three levels of detail Alex needs to drill through in a multi-model job?

**Choice:** Task → per-model sub-row → individual run (trace) rows.

- **Level 1 — Task parent row (collapsed):** chevron + task ID + task prompt + per-model reward strip + rolled-up attempts/turns/duration/cost across all models. Click toggles expand/collapse.
- **Level 2 — Per-model sub-row (first expansion):** indented under the task parent. Shows model name (mono, muted, same visual as a trace ID) + that model's aggregate over this task: reward avg, attempts n/N, turns avg, duration avg, cost total. A nested chevron allows further expansion.
- **Level 3 — Individual run rows (second expansion):** same child trace row shape as today (trace hash + attempt N + per-attempt values + Invalidate / ↗ actions). Indented a second level under the model sub-row.
- **Click semantics:** Task row → expand/collapse level 2. Model sub-row → expand/collapse level 3. Trace row → opens Trace viewer.
- **Checkbox semantics:** Task row checkbox → tri-state select all traces under this task (all models). Model sub-row checkbox → select all traces for this model on this task.

---

### D4 — Run QA Agent: two surfaces, different scopes

**HUD-side question:** How does "Run QA Agent" scope itself differently from the header (all/subset) vs bulk selection (explicit)?

**Choice:** Two surfaces, not duplicates:

**Header button (always visible):** `Run QA Agent ▾` is a dropdown. The ▾ opens a scope picker. Single-model: `All traces (N)` · `Failed only` · `Low-reward (<0.4)` · `Choose traces…`. Multi-model (N≥2): `All traces (N)` · `Failed only` · `Low-reward (<0.4)` · `Per model: qwen | llama | gpt-4o` (inline model links) · `Choose traces…`. The button label always reads "Run QA Agent"; the scope is picked from the dropdown, not encoded in the button label.

**Bulk-action bar (conditional, ≥1 row selected):** `Run QA Agent` with no ▾ and no scope picker. Selection IS the scope. Clicking launches immediately on the selected set.

**What was explicitly rejected:** Run QA Agent on the Overview tab. Overview deep-link CTAs (e.g., "Analyze 7 failures →") pre-stage scope on the Traces tab, but the agent launcher lives here.

---

### D5 — Invalidate / Revalidate semantics

**HUD-side question:** What does invalidating a trace do to the job aggregate?

**Choice:** Invalidate is a curation flag, not a re-run trigger. The reward number is preserved on the trace record but excluded from the job aggregate (avg reward, pass-rate, cost-per-success) when flagged as invalidated. Invalidated traces remain in the Traces tab table, first-class, with their reward shown but visually muted and chipped.

This must be specced explicitly because Alex and Sam need to trust that invalidating a bad env setup trace does not retroactively corrupt the reward distribution they are analyzing. The value is kept; only the aggregate inclusion is toggled.

**Row-level actions per state:**
- Default trace: `Invalidate` button + `↗` open in new tab
- Invalidated trace: `Revalidate` button (amber-tinted border) + `↗` open in new tab
- Not-run trace: only `↗` (no Invalidate — nothing to curate yet)

---

### D6 — Scale baseline and progressive reveal

**HUD-side question:** What is the realistic working scale, and how does the table handle it?

**Choice:** 10 tasks × 10 traces = 100 rows total is the design baseline. The table initially renders a capped preview (suggest 30 rows); a `Show all 100 traces` ghost button reveals the full set in place (no navigation). Pagination is not specced for v1.

Low-volume: ≤30 traces renders the full set without the "Show all" control.

---

### D7 — Card view: purpose and when to use it

**HUD-side question:** What does card view give Alex that table view doesn't?

**Choice:** Card view surfaces env-state previews — the visual state of the environment at trace end. For game-domain tasks (2048, etc.) or browser-control tasks, the env screenshot is diagnostic: Alex can see exactly where the agent got stuck. The card also promotes the task prompt as a title, making it easier to scan which task is which by content rather than ID.

Card view is an alternate render of the same data as table view, toggled via the view segmented control. Both views share the same filter/search state.

---

## Layout

Top-to-bottom rendering order within the tab body (below the sticky tab bar). Diagram shows the **multi-model (N≥2) canonical case**; see degeneration note below.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  FAILED-TRACE BANNER  (conditional — only when ≥1 trace has a failure error)  │
│  ⚠  5 failed traces · gpt-4o 0 · qwen2.5-14b 2 · llama-3.1-8b 3           │
│     Client is not connected. Use the 'async with client:' context manager…   │
│     [Jump to 5 traces ↗]                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│  TAB HEADER LINE                                                              │
│  88 Traces · across 10 Tasks · 3 models              [Run QA Agent ▾]       │
├──────────────────────────────────────────────────────────────────────────────┤
│  FILTER BAR (list view active — Group by toggle visible)                      │
│  [Search tasks…]  [All (88)] [Scored (72)] [Invalid (12)] [No score (4)]    │
│               [Task | Model]  [Model: all 3 ▾]  [≡ Table | ⊞ Card]         │
│                                                                               │
│  FILTER BAR (card view active — Group by toggle absent)                       │
│  [Search tasks…]  [All (88)] [Scored (72)] [Invalid (12)] [No score (4)]    │
│                              [Model: all 3 ▾]  [≡ Table | ⊞ Card]          │
├──────────────────────────────────────────────────────────────────────────────┤
│  BULK-ACTION BAR  (conditional — only when ≥1 trace selected)                │
│  [3 selected]  [Run QA Agent]  │  [Invalidate]  [Revalidate]        [Clear] │
├──────────────────────────────────────────────────────────────────────────────┤
│  LIST VIEW  (default — task-grouped tree, Group by Task active)              │
│  [cb] Task/Trace · Reward (per-model strip) · Attempts · Turns · Dur · Cost │
│  ─────────────────────────────────────────────────────────────────────────── │
│  ☐ ▼ 0001  Reach the 2048 tile…  gpt-4o 0.81 · qwen 0.73 · llama 0.65     │
│      ├─ ▼ gpt-4o          0.8100 avg    3/3   5.2 avg  2m18s avg  $0.0310  │
│      │    • a3f1b2c9  attempt 1   0.9100  —   4  1m55s  $0.0091  [Inv][↗]  │
│      │    • d7e4c801  attempt 2   0.8100  —   5  2m28s  $0.0103  [Inv][↗]  │
│      │    • 59f0a232  attempt 3   0.7100  —   7  2m31s  $0.0116  [Inv][↗]  │
│      └─ ▶ qwen2.5-14b     0.7300 avg    3/3   6.1 avg  2m44s avg  $0.0298  │
│           ▶ llama-3.1-8b  0.6500 avg    3/3   7.4 avg  3m01s avg  $0.0241  │
│  ☐ ▶ 0002  Consolidate the left column…  gpt-4o 0.79 · qwen 0.71 · llama — │
│  …                                                                            │
│  [Show all 10 tasks]                                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│  CARD VIEW  (alternate — toggled via view segmented control)                  │
│  [card] [card] [card]                                                         │
│  [card] [card] [card]                                                         │
│  …                                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

**N=1 degeneration:** When a job has one model, the count line reads `88 Traces · across 10 Tasks · claude-opus-4-6` (model name inline, monospace, muted-foreground). The `Task | Model` Group by toggle is absent in all views. The per-model reward strip collapses to the single avg reward value. The two-level expansion collapses to one-level (task → runs). No code branching needed in the parent row structure — the strip with N=1 model is visually identical to today's avg cell.

**Role labels:**

| Section | Role |
|---|---|
| Failed-trace banner | Forensic alert — surfaces the error string, per-model failure breakdown (N≥2), and a jump link; conditional |
| Tab header line | Aggregate context — trace count + task count + model identity (N≥2: "3 models"; N=1: model name) + QA Agent launcher |
| Filter bar | Scope control — search, status filter pills, Group by toggle (N≥2 + list view only), Model filter (N≥2 only), view toggle |
| Bulk-action bar | Selection actions — conditional on ≥1 trace selected |
| List view | Default — task-grouped tree. Two-level expansion in N≥2 (task → model sub-row → run). One-level in N=1 (task → run) |
| Card view | Visual alternate — env-state preview per trace, prompt as title, model dot badge in N≥2 |

---

## Failed-trace banner anatomy

**Single-model variant:**
```
⚠  1 failed trace
   Client is not connected. Use the 'async with client:' context manager first.
   [Jump to trace ↗]
```

**Multi-model variant (N≥2):**
```
⚠  5 failed traces · qwen2.5-14b 2 · llama-3.1-8b 3 · gpt-4o 0
   Client is not connected. Use the 'async with client:' context manager first.
   [Jump to 5 traces ↗]
```

- Background: `bg-alert-destructive-bg` (very low alpha red tint)
- Border: `border-state-errored` at low opacity
- Icon: warning triangle, `text-state-errored-text`
- Headline: `N failed trace` / `N failed traces` — `text-state-errored-text`, weight 600, text-body. In multi-model mode, a per-model breakdown line follows the count on the same line, separated by `·`: `model-name count · model-name count · …`, sorted by header chip order. Models with 0 failures are still shown (to confirm absence). Title row contains only the count + breakdown — no button.
- Error snippet: monospace code block, smaller size, darker inset background. Shows the first error string. When N > 1: snippet shows first error + muted `+N more` caption below.
- `Jump to trace ↗` ghost (non-destructive) link-style button: rendered flush-left below `AlertDescription`, inside the Alert content column. Reads `Jump to N traces ↗` when N > 1. Filters the table to failed rows and scrolls to the first.

**Placement rationale:** The button is a follow-up navigation action that only makes sense after reading the error string. Placing it after the description preserves the correct reading order: label → evidence → action. It also eliminates any title-row layout collision on narrow viewports — the title never has two elements competing for width. The button uses ghost (neutral) style, not ghost-destructive, because navigating to the failing trace is not a corrective or dangerous action — the destructive Alert context already communicates severity via its border and icon.

**Conditional rendering:** Only renders when at least one trace has a non-null error string in a failure state. Clean runs suppress the banner entirely.

---

## Tab header line anatomy

**Single-model (N=1):**
```
88 Traces · across 10 Tasks · claude-opus-4-6              [Run QA Agent ▾]
```

**Multi-model (N≥2):**
```
88 Traces · across 10 Tasks · 3 models                     [Run QA Agent ▾]
```

Left cluster — a single line, no chips, no hint text:
- `N Traces` — foreground, weight 600, monospace. Count reflects active filter; with "All" active shows full count.
- `· across N Tasks` — muted-foreground, monospace, weight 500.
- **Single-model:** `· model-name` — monospace, muted-foreground. Reads as plain inline text, not a chip. See D3.
- **Multi-model:** `· N models` — monospace, muted-foreground. Plain inline text. No hover, no tooltip, no popover — see D3 affordance decision. Per-model reward detail lives in the task row strip (D9) and expansion levels (D10), not here.
- No chip cluster. No hint text (`click row to open Trace` is conventional behavior; explaining it is an admission of failed affordance design — see wireframe principle above).

Right:
- `Run QA Agent ▾` — secondary button style (bg-card, border-border-strong, text-foreground). ▾ indicates a dropdown. See D4 for dropdown options (multi-model adds per-model scope lines).

---

## Filter bar anatomy

**Single-model (N=1):**
```
[Search tasks…]  [All (100)] [Scored (72)] [Invalid (21)] [No score (7)]
                                                           [≡ Table | ⊞ Card]
```

**Multi-model (N≥2):**
```
[Search tasks…]  [All (42)] [Scored (35)] [Invalid (5)] [No score (2)]
                    [Task | Model]  [Model: all 3 ▾]  [≡ Table | ⊞ Card]
```

Left to right:
1. **Search input** — placeholder `Search tasks…`. Searches task prompt substring (not run ID, not task ID). Matched rows surface in the active view; unmatched rows are hidden.
2. **Status filter pills** — pill-tab group (bg-card outer container, pill-tab buttons inside): `All · Scored · Invalid · No score`. Active pill: bg-secondary-surface. Count shown in muted sub-text per pill.
3. **(flex spacer)**
4. **Group by toggle** (N≥2 AND list view active only) — segmented control: `Task | Model`. Active segment: bg-secondary-surface. Default: `Task`. Hidden when N=1. Also hidden when card view is active — card view has no group-rendering mechanism; the toggle would be dead UI. See D8 for behavior of each option.
5. **Model filter** (N≥2 only) — ghost chip dropdown: `Model: all 3 ▾`. Opens a multi-select list of model names. Default: all selected. Selecting a subset narrows the per-model reward strip and child rows to only those models. This is a secondary refinement; the Group by toggle is the primary control. Hidden for N=1.
6. **View segmented control** — two icon buttons (list lines / grid squares): `Table (default) · Card`. Active button: bg-secondary-surface.

---

## Bulk-action bar anatomy

```
[3 selected]  [Run QA Agent]  │  [Invalidate]  [Revalidate]        [Clear]
```

- Renders between filter bar and table/card view, only when ≥1 trace is selected.
- `[N selected]` chip — bg-primary-soft, border-primary-border, text-primary, monospace.
- `Run QA Agent` — primary-ghost style (border-primary-border, text-primary). No ▾ — selection is the scope. Clicking launches immediately.
- Divider — 1px border-strong vertical rule.
- `Invalidate` / `Revalidate` — both always shown when bulk bar is visible (any selected trace may be valid or invalid; both actions are always valid over a mixed selection, applied per-row based on current state).
- `Clear` — right-aligned ghost, meta-foreground. Deselects all rows.

---

## List view anatomy

The list view is a task-grouped tree. Two row types share the same column set but render distinct content and interactions.

### Column spec

| Column | Heading | Parent task row | Per-model sub-row (N≥2) | Child trace row |
|---|---|---|---|---|
| Checkbox | (none) | Per-task select-all (tri-state) | Per-model select-all for this task (tri-state) | Per-trace select |
| Task/Trace | Task / Trace | Chevron + task ID mono-muted + task prompt weight-600 + attempt count pill | Nested chevron + model name (mono, muted) | Indent + bullet dot + trace hash mono muted + `attempt N` meta-foreground |
| Reward | Reward | **Single-model:** avg float 4dp, color-banded, `avg` suffix. **Multi-model:** per-model reward strip inline (D9) | Per-model reward avg over this task, float 4dp, color-banded, `avg` suffix | Per-attempt float 4dp, color-banded (same bands as D2). Invalidated: strikethrough + amber chip. Not run: neutral chip, no number |
| Attempts | Attempts | `n / N` across all models. If any invalid: `(K err)` suffix | Per-model `n / N` for this task | `—` |
| Turns | Turns | Avg across all models, `avg` suffix | Per-model avg for this task | Per-attempt integer |
| Duration | Duration | Avg across all models, `avg` suffix, muted | Per-model avg for this task | Per-attempt `Xm Xs`, muted |
| Cost | Cost | Sum across all models, `total` suffix | Per-model cost total for this task | Per-attempt `$X.XXXX` |
| (actions) | (hidden) | No actions | No actions | `[Invalidate\|Revalidate]` + `[↗]` |

**Reward column note:** Single-model jobs render a single avg value as today. Multi-model jobs render the per-model reward strip in the task parent row. The column heading stays "Reward" in both modes.

**Aggregate computation rules (app-level):**
- Reward avg: mean over attempts where `reward != null AND invalidated == false`. Excludes invalidated and not-run.
- Attempts `n/N`: n = count where run_at is non-null (attempted, regardless of validity); N = total.
- `(K err)` count: K = count where `error != null`.
- Turns avg: mean over completed attempts (same filter as reward avg).
- Duration avg: mean over completed attempts.
- Cost total: sum over ALL attempts including invalidated — money spent regardless of validity.

**Column headings:** normal case (not UPPERCASE). Weight + color establish hierarchy.

### Parent task row interactions

- Row click → toggle expand / collapse
- Checkbox click → tri-state select of all child traces (`stopPropagation`)
- Row hover → `bg-hover-surface`
- No ↗ — task parent is not a navigable target

**Parent row visual:**
- Background: `bg-card` (slightly heavier than child recessed bg)
- Task prompt: weight 600, `text-foreground`
- Chevron rotates -90deg when collapsed
- Attempt count: inline pill `bg-secondary-surface border-border text-muted-foreground mono text-meta`

### Per-model sub-row (N≥2, Group by Task, first expansion level)

Rendered between the task parent row and the individual run rows when a multi-model task parent is expanded.

- **Visual:** indented 24px under task parent. Background: `bg-elevated-surface` (one step between parent `bg-card` and child `bg-background`). Left border or indent guide may be added at implementation for visual hierarchy clarity (not tokenized here).
- **Content:** nested chevron + model name (mono, muted, 12px) + per-model aggregates in their respective columns.
- **Click:** toggles expansion of individual run rows for that model.
- **Checkbox:** tri-state select of all trace rows for this model under this task.

### Group by Model — section header anatomy (N≥2)

When the Group by toggle is set to `Model`, the list view shows model section headers instead of task parent rows.

```
▼ gpt-4o          overall reward 0.81  14 traces  $0.124 total  win-rate 67%
   ▼ 0001  Reach the 2048 tile…  0.8100 avg  3/3   5.2 avg  2m18s avg  $0.0310
         • a3f1b2c9  attempt 1   0.9100  —   4  1m55s  $0.0091  [Inv][↗]
         • d7e4c801  attempt 2   0.8100  —   5  2m28s  $0.0103  [Inv][↗]
         • 59f0a232  attempt 3   0.7100  —   7  2m31s  $0.0116  [Inv][↗]
   ▶ 0002  Consolidate the left column…  0.7900 avg  3/3   …
▶ qwen2.5-14b     overall reward 0.73  14 traces  $0.098 total  win-rate 22%
▶ llama-3.1-8b    overall reward 0.65  14 traces  $0.072 total  win-rate 11%
```

**Model section header fields:**
- Chevron + model name: weight 600, mono, `text-foreground`
- `overall reward N.NN` — color-banded per D2 tiers
- `N traces` — `text-muted-foreground`
- Cost total — `$X.XXX total`, muted
- Win-rate — `win-rate X%` (% of tasks where this model had the highest reward avg among all models), `text-muted-foreground`. This is an app-level computation.

**Expansion:** model section → task rows (current parent row shape, no per-model strip — this is already a single-model lens) → individual run rows.

### Child trace row interactions

- Row click → opens Trace viewer for that trace
- Checkbox click → selects row; does not open trace (`stopPropagation`)
- Action button click → performs action; does not open trace (`stopPropagation`)
- Row hover → `bg-hover-surface`

**Child row visual:**
- Background: `bg-background` (recessed vs parent `bg-card`)
- Indented 24px under parent's Task/Trace cell
- Trace hash: `text-muted-foreground mono text-meta`
- `attempt N` label: `text-meta-foreground`
- Not-run trace hash: `text-meta-foreground` (further dimmed)
- Selected trace: `bg-primary-soft` at very low alpha (teal wash)

### Show all control

```
[Show all 10 tasks]
```

- Centered ghost button, `border-border`.
- Renders when total task count > cap (suggest 10 tasks initially visible, each collapsed by default at this count).
- At low task count (≤ 10), all tasks render without the control; default expansion state is first task expanded, rest collapsed.
- "Show all" reveals remaining task rows collapsed; does not auto-expand child traces.
- Not rendered when total task count ≤ 10.

---

## Card view anatomy

### Grid

3-column grid. Each cell is a trace card. Same filter/search/group-by state as table view; same total row count cap / Show all control applies.

### Card structure

```
┌──────────────────────────────────┐
│ ⋮ (kebab, top-right, overlaps preview) │
│ ┌────────────────────────────────┤
│ │ [chrome strip ● ● ●]           │
│ │                                │
│ │    [tile grid — env state]     │
│ │                                │
│ │          [Turns · Tools · dur · reward pill]│ (meta badge bottom-right)
│ └────────────────────────────────┤
│  ○  Reach the 2048 tile by      │
│     merging the two 1024s…      │ (2-line clamp)
│     claude-opus-4-6             │
│     task 0001 · run_01 · 35m ago│
└──────────────────────────────────┘
```

**Preview pane** (top section, ~16:10 aspect ratio):
- Background: bg-muted-surface
- Browser chrome strip at top (bg-secondary-surface, macOS traffic-light dots: ●●● red/amber/green)
- Canvas area: env-state screenshot placeholder. For game-domain tasks: tile grid render. For browser tasks: screenshot thumbnail. For unknown: empty board state.
- Bottom-border: border-border separates preview from card body

**Meta badge** (overlay, bottom-right of preview):
- High-opacity near-black background (`bg-black/90`, `backdrop-blur-sm`). Not a HUD semantic surface token — this overlays the env screenshot and must not theme-flip. The background is intentionally opaque enough to be effectively black in both light and dark mode, so white text always has sufficient contrast regardless of the preview surface behind it. Semi-translucent (72%) was the prior value; 90% is required to prevent composite lightening in light mode where the preview pane is near-white.
- Text: `text-white/90`. Separator dots: `text-white/55` (lighter than content, heavier than the old 40% which fell below AA at small sizes in light mode).
- WCAG AA: white/90 on black/90 composited over white preview = ~14:1. Passes at all text sizes including 10px mono.
- Content: `Turns N · Tools N · dur · [reward pill]`
- Reward pill: colored by band (same mapping as table). Invalidated uses destructive pill (`INV` label) regardless of raw reward value. Pills carry their own colored chip background and are unaffected by this change.

**Kebab button** (`⋮`, top-right, overlaps preview below chrome strip):
- Semi-translucent dark background, white text
- `stopPropagation` — does not trigger card click
- Opens action menu: Invalidate / Revalidate · Open in new tab

**Card body**:
- Avatar circle: bg-primary-soft, text-primary. Muted variant (bg-secondary-surface, text-meta-foreground) for no-score. Destructive variant (bg-state-errored-subtle, text-state-errored-text) for invalidated.
- Prompt title: text-foreground, weight 600, 2-line clamp. Muted (text-muted-foreground) for no-score.
- Model name: text-muted-foreground, text-label. Meta-foreground for no-score. In multi-model jobs this line is load-bearing — it identifies which model produced this trace.
- Footer meta: `task XXXX · run_XX · N min ago`, monospace, text-meta, meta-foreground.

**Multi-model card additions (N≥2):**
- A small color-coded model dot appears next to the model name line. The dot color is an **app-level composition** of existing tokens at the call site — each model is assigned one of the existing semantic surface colors (e.g., teal/primary for winner, secondary-surface-derived tints for others). No new DS color token. See anti-patterns section.
- A secondary "Group by Model" affordance in the card grid header (a toggle row above the grid, mirrors the table-view Group by toggle). When active, cards are visually sorted into model-labeled sections.
- The card remains the unit of interaction (click → trace viewer). The group header is non-clickable decoration.

**Invalidated card:**
- Preview frame: destructive-tinted border (`border-state-errored` at low opacity)
- Chrome strip: destructive-tinted background
- Tile grid: opacity 0.65
- Center overlay label: `env crash · invalidated` — dark semi-translucent background, monospace, text-state-errored-text. (Label text is the invalidation reason if known; fallback: `invalidated`.)

**No-score card:**
- Card opacity: 0.75 (card-level, not per-element)
- Preview: empty board state
- Reward pill: neutral

---

## States and variants

### Default (list view, all filter active, no selection)

Task-grouped tree. All task parent rows visible; first task expanded, remainder collapsed. Banner renders if any traces have errors. Bulk-action bar hidden. Sort: task ID ascending (matches taskset order).

### With filter active (e.g., Scored)

Trace count in header updates to reflect filtered set. "Show all" count updates accordingly. Banner remains visible independent of filter (error is on the tab, not filtered out).

### With ≥1 row selected

Bulk-action bar slides in below the filter bar. Table rows with selected state receive bg-primary-soft wash. Header trace count does not change.

### Group by toggle

**Single-model (N=1):** No Group by toggle in any view. The list is always task-grouped.

**Multi-model (N≥2), list view active:** The `Task | Model` segmented control renders in the filter bar. Default: `Task`. Switching to `Model` restructures the list into model section headers (see Group by Model anatomy above). The toggle state persists for the session; resetting filters does not reset group-by.

**Multi-model (N≥2), card view active:** The Group by toggle is absent from the filter bar. Card view has no group-rendering mechanism; rendering the toggle would produce dead UI with no effect. The Model filter chip remains visible and functional (it narrows which models' cards are shown).

### Empty (no traces)

Tab renders normally through the header line and filter bar. Table body shows: centered message `No traces yet — this job has not run.` with a muted icon. No "Show all" control.

### Empty (filter match zero)

Filter is active but matches nothing. Table body: `No traces match "search term"` or `No traces in this state.` with a ghost clear-filter link.

---

## Data inputs

Minimal contract. List shapes, not full TypeScript types.

**Per-task group (parent row):**

```
{
  task_id: string,              // "0001" — mono-muted
  task_prompt: string,          // full prompt text, truncated in cell
  traces: Trace[],              // child rows — all models interleaved; filtered by model_id at render
  // Aggregates rolled up across ALL models — computed at query/API layer
  reward_avg: number | null,    // avg over scored traces, all models
  attempts_completed: number,   // count where run_at != null
  attempts_total: number,       // traces.length
  error_count: number,          // count where error != null
  turns_avg: number | null,
  duration_avg_ms: number | null,
  cost_total_usd: number | null, // sum ALL traces including invalidated
  // Multi-model: per-model aggregates for this task (empty map in N=1)
  per_model_aggregates: Record<model_id, {
    reward_avg: number | null,
    attempts_completed: number,
    attempts_total: number,
    turns_avg: number | null,
    duration_avg_ms: number | null,
    cost_total_usd: number | null,
  }>,
}
```

**Per-trace row (child):**

```
{
  trace_id: string,             // "f1a8e576" — short hash, monospace
  model_id: string,             // "gpt-4o" — identifies model in multi-model jobs
  attempt_index: number,        // 1-based: "attempt 1", "attempt 2", …
  reward: number | null,        // null for not-run
  invalidated: boolean,
  error: string | null,         // error string for failed-trace banner
  duration_ms: number | null,
  turns: number | null,
  cost_usd: number | null,      // null for not-run
  run_at: string | null,        // ISO timestamp; null = not-run
  env_screenshot_url: string | null, // for card view preview; null = empty board
}
```

**Job aggregate (for header):**

```
{
  trace_count: number,          // total traces (unfiltered)
  task_count: number,           // total tasks
  // Single-model: model_id populated; models array has one entry
  // Multi-model: models array has N entries sorted by overall reward desc
  model_id: string | null,      // null when N≥2 (use models array instead)
  models: ModelSummary[],       // N=1: one entry; N≥2: all entries sorted winner-first
  failed_count: number,         // total failed traces across all models
  // Multi-model: per-model failed counts for banner breakdown line
  failed_by_model: Record<model_id, number>,
  first_error: string | null,   // for banner snippet
  failed_trace_id: string | null, // for "Jump to trace →" target
}

ModelSummary {
  model_id: string,             // "gpt-4o"
  overall_reward: number | null,// avg over all scored traces for this model
  trace_count: number,          // total traces for this model
  cost_total_usd: number | null,
  win_rate: number | null,      // fraction of tasks where this model had best reward_avg
}
```

**Filter counts:**

```
{
  all: number,
  scored: number,
  invalid: number,
  no_score: number,
}
```

---

## Open questions

**OQ-1 — Invalidated card: reward pill or destructive-pill?**

The table view shows the raw reward number with a strikethrough + amber `invalidated` chip. The card view (v1 exploration) used a destructive `INV` pill for all invalidated cards regardless of reward value — prioritizing the validity state over the reward value in the limited badge space. For the card view, this spec follows the v1 exploration direction (`INV` destructive pill for invalidated). Confirm whether the pilot/QA review feedback requires the numeric reward to appear in the badge.

**OQ-2 — Group by: `None` option behavior**

The list view defaults to `Task` grouping (the tree). `None` reverts to a flat one-row-per-trace list (prior flat design). `Run` is ambiguous given traces are already one-per-run-per-task; candidate for dropping from v1 Group by options. Confirm whether `None` (flat) is worth exposing at all — if the task-tree supersedes it, the dropdown may simplify to just an expand-all / collapse-all affordance.

**OQ-3 — "Jump to trace →" when N > 1 failed traces**

When N > 1 failed traces, the button reads `Jump to N traces →` and applies a filter to show only failed rows. An alternative is to show the count in the button and scroll to the first, keeping all rows visible. Confirm the interaction with engineering before implementation.

**OQ-4 — Env screenshot in card view: fallback when unavailable**

Spec says "empty board state" when `env_screenshot_url` is null. For non-game-domain tasks, "empty board" is not meaningful. Confirm the fallback rendering for generic tasks (e.g., a muted placeholder icon, or a text-only card without a preview pane).

**OQ-5 — Per-model reward strip at very large N (checkpoint sweep)**

When N is large (e.g., a checkpoint sweep with 10+ models), the per-model reward strip in the collapsed task row becomes unreadably wide. At what N threshold should the strip switch to a compact sparkline or dot strip with hover tooltip showing model labels + rewards? Needs product input on the realistic max N before the design diverges from the text-strip pattern.

**OQ-6 — Model filter chip vs. header chip click as "filter to this model"**

Two competing discoverable affordances exist for isolating one model: (a) click a model chip in the header cluster, (b) use the Model filter chip dropdown in the filter bar. If both are implemented, they must stay in sync. If only one ships in v1, the header chip click is the lower-friction path (no dropdown open required) but less explicit. Confirm which affordance is primary and whether both ship together.

---

## Out of scope

- **Job detail page header and tab bar** — the Job page anchor wireframe owns the page header, descriptor strip, and tab bar.
- **Trace viewer** — row/card click navigates to the existing Trace viewer. This tab does not reimplement trace content.
- **QA Agent configuration UI** — the scope dropdown on Run QA Agent is specced here; the full QA Agent configuration panel (parameters, model, output format) is a separate surface.
- **Cross-job trace comparison** — this tab is scoped to traces from a single job. Cross-job search and comparison live in a future analytics surface.
- **Real-time updates** — traces are shown as-of-last-load. Live streaming of trace results as a job runs is out of scope; a refresh control is sufficient for v1.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md). Peer format reference: [`docs/design/screens/job-detail-usage.wireframe.md`](./job-detail-usage.wireframe.md). Mockup: [`docs/design/mockups/job-detail-traces-tab/index.html`](../../design/mockups/job-detail-traces-tab/index.html).*
