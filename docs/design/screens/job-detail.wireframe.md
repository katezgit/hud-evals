# Job Detail — Wireframe

> **Phase:** `wireframes` — structure / hierarchy / copy / flow only.
> No px sizes · no Tailwind class hints · no color tokens · no hex.
>
> **Sibling stubs** (separate wireframe files, next pass):
> - `job-detail-tasks.wireframe.md` — Tasks tab
> - `job-detail-traces.wireframe.md` — Traces tab
>
> **Canonical references:**
> - App shell outer chrome: `docs/design/screens/app-shell.wireframe.md`
> - Platform vocabulary: `docs/product/platform.md` (personality.md, personas.md)
> - Production screenshots: `.intermediate/current-design/screenshots/04-job-detail.png`, image-cache `6.png`

---

## Decision Log

Fifteen load-bearing decisions. Each follows the HUD-side question → Choice → Persona reason pattern. D5 and D7 updated in revision pass 2026-06-14 (FAIL #1, #2, #3 resolution). D4 corrected and D10–D13 added in revision pass 2026-06-14-v3 (production-derived fixes from image-cache `10.png`). D10 superseded in revision pass 2026-06-14-v4 (operator heading pattern directive — structured title replaces user-authored name in H1; user name moves to subtitle).

### D1 — Status pill promotion
**HUD-side question:** Where should job status live — in the Details panel (current production) or in the title row?
**Choice:** Title row, immediately right of the job name H1, visible above the fold without scrolling.
**Persona reason:** Alex's primary job on this page is verifying job integrity (persona job #1). Status is the first diagnostic signal — it determines which recovery actions are valid and which recipe steps are enabled. Burying it in the Details panel inside the Overview scroll means Alex cannot confirm state before acting. Status in the title row makes the page's diagnostic posture ambient the moment it loads (personality: "Status is ambient, not requested").

### D2 — Configuration collapsed by default (CORRECTED 2026-06-14-v3)
**HUD-side question:** Should the Configuration block be collapsed (current production) or expanded?
**Choice:** Collapsed by default behind a `▶ Configuration` disclosure toggle at the bottom of the Overview content column, below the QA Agent runner. Expanded state shows the full `<dl>` of agent revision / taskset version / environment image SHA / model params / seed / max steps / RL hyperparams (when applicable). The expanded state persists within the session but resets to collapsed on next page load.
**Persona reason:** Alex expands Config only when reproducing or comparing a run — not on every visit. Configuration is reference content, not scan signal. Collapsing it by default reduces Overview height and keeps the diagnostic spine (Task Coverage → Results → Recipe) readable without scrolling past config rows Alex isn't using on this visit. The prior rationale ("reproducibility on every visit") was wrong — Alex's actual pattern is deliberate expand-before-rerun, not ambient scan. Production collapses Configuration; this correction realigns with that evidence. If Config content grows large (env vars, secrets-redacted manifests), the disclosure contains it without promoting to a Config tab.

### D3 — Tool Usage tab vs. Overview block
**HUD-side question:** Should Tool Usage (distribution + common patterns + pattern/trace matrix) live in the Overview tab or a dedicated tab?
**Choice:** Tool Usage stays in the Overview for jobs under ~300 tasks. At scale (1k+ tasks, RC regression runs), the data volume makes the analytical block dominate and displace the diagnostic spine — in that scale variant, Tool Usage promotes to a dedicated Usage tab. The tab bar carries a Usage tab stub that is activated at scale. For this wireframe, Overview contains the block; stub the Usage tab.
**Persona reason:** For Alex's typical dev run (100–300 tasks), Tool Usage is supporting analytical evidence he reads after the diagnostic spine (Task Coverage → Recipe → Results), not the primary job. Moving it to a tab at dev-run scale forces a navigation step for a block he reads every run. At RC regression scale (1k–5k tasks), the distribution table becomes its own analytical workbench and deserves its own tab.

### D4 — Tab set
**HUD-side question:** Which tabs does Job detail need, and in what order?
**Choice:** Overview (default) · Tasks · Traces · [Usage — conditional at scale, see D3]
**Persona reason:** The diagnostic spine is: Overview (status + coverage + recipe + tool-usage) → Tasks (isolate failures, regression filter) → Traces (audit individual trajectories). That ordering mirrors Alex's actual diagnostic sequence (persona jobs #1 → #2 → #3). A Config tab is only promoted out of Overview if Config content grows (flagged open question). Logs is an open question — see §14. Usage tab is stubbed but inactive at default scale.

### D5 — Baseline comparison surface
**HUD-side question:** Where does the baseline-delta callout live on a Completed job, and what is "baseline"?
**Choice:** A callout block in the Overview, below the Task Coverage row, visible only on `Completed` status variants. It shows: the reference job (baseline), a delta row (N regressions — tasks that flipped Passed → Failed, N recoveries — tasks that flipped Failed → Passed, overall score delta). A "View regressions" link jumps to the Tasks tab pre-filtered to the Regressed filter state.

**Baseline definition (resolved):** Resolved sequence — (1) Operator-pinned reference Job IF one is set on this Taskset; (2) ELSE last-passing Job on this Taskset; (3) ELSE the baseline-delta block is suppressed entirely (not shown, not an empty state). The "Set baseline" action lives in the overflow menu of any Completed Job as `Pin as baseline for [taskset-name]` — it is a Taskset-level pin, populated from a Job. When a baseline is resolved, the "Compared to" line shows resolution inline, e.g., "vs last-passing run on browser Tasks — Job #4f3a". When no baseline can be resolved (no prior Jobs on this Taskset), the block is suppressed — no empty state CTA.

**Persona reason:** Alex's persona job #2 is "isolate regressions." The baseline delta must appear on the same Overview view that shows Task Coverage — not in a separate Compare tab requiring navigation. The jump to Tasks with pre-applied filter is a one-click path, not a drill hierarchy. "One-click drill over navigation depth" (personality: sacrificial choice #1). Baseline definition chosen as a fallback sequence rather than a single mode to handle first-run Jobs (no pinned baseline yet) without presenting a broken "Set baseline" empty state on every new Taskset.

### D6 — Multi-model layout
**HUD-side question:** How does the page express when a Job ran N models against the Taskset?
**Choice:** Descriptor strip carries an explicit "N models" count chip that links to a model breakdown view. The Results panel shows one coverage row per model (not a collapsed "+1"). The title row status pill reflects the aggregate outcome.
**Persona reason:** "Exact" personality principle — hiding behind "+1" forces Alex to click just to see what ran. In a multi-model regression job, each model's result row is independent diagnostic signal. The production "+1" pattern is a shortcut that degrades Alex's forensic accuracy. Multi-model jobs are a documented production pattern (DeepSeek V3.2 +1 in the reference screenshot).

### D7 — Recipe sidebar step semantics
**HUD-side question:** Should the Recipe sidebar steps change by job status, and which Step 3 actions appear for which persona × job-purpose?
**Choice:** Yes. The sidebar is a status-conditional AND persona/purpose-conditional component. Step 1 (View Traces) always shows trace count. Step 2 (Rerun) adapts label and CTA by status (see §9 variant matrix). Step 3 (Improve) is gated by `(persona, job-purpose)` — see Step 3 visibility matrix below and §9 purpose cross-cut sub-table.

**Step 3 visibility matrix:**

| Persona | Job purpose | Step 3 content |
|---------|-------------|----------------|
| Alex | Training | "Train model on N tasks" — enabled when trace threshold met; disabled with exact deficit count otherwise |
| Alex | Eval | "Train model on N tasks" — shown only when trace threshold is met (forward-looking post-Eval action). Hidden when below threshold. |
| Alex | Re-eval | Same as Eval — threshold-gated "Train" IF Alex is the actor; see §9 Re-eval distinction |
| Sam | Eval | Step 3 omitted entirely. Sam's loop closes at Rerun (Step 2). No Train, no Refine. |
| Sam | Re-eval | Step 3 omitted entirely. Same rationale. |
| Riley | Any | "Refine environment" only — `<env-name> chip  [→ Open env]`. Train omitted. |

Rationale for Sam collapse: Sam's Job → Re-eval → Rerun loop has no Improve step. He compares prompts, not model weights. Adding a disabled Train step would be Sam RL creep (anti-pattern, `alex-user-stories.md:291`). Omitting Step 3 is cleaner than showing a step that is never actionable.

**Step labels are imperative and brief — not marketing copy.**
**Persona reason:** Alex's closed loop is the gold thread (View Traces → Rerun → Improve). At `Running`, "Rerun" is replaced by "Cancel" — conflating them causes destructive action errors. At `Failed`, "Improve" Train is disabled because traces may be tainted. The step structure forces correct sequencing without being a wizard — it is a recipe, not a gated flow. Personality: "Phase order over shortcut flows" (sacrificial choice #2). "Refine environment" is Riley's Phase 2 primitive — surfacing it on Alex's or Sam's path is the "Riley collapsed into Alex" anti-pattern (`alex-user-stories.md:290`).

### D9 — "Pin as baseline" action placement
**HUD-side question:** Where does the action that sets a Taskset's baseline reference Job live?
**Choice:** Overflow menu of any Completed Job, as `Pin as baseline for [taskset-name]`. It is a Taskset-level pin set from a Job's overflow. No separate "Set baseline" page or flow. The action resolves into D5's sequence: pinned baseline takes precedence over the last-passing-job fallback; clearing the pin via `Change baseline ▼ → Clear pinned baseline` reverts to the fallback.
**Persona reason:** Alex and Sam both want to pin a specific Job as the reference run when a last-passing fallback is wrong (e.g., pinning the pre-experiment baseline before a training run). The overflow menu is the correct low-friction location — not a dedicated settings page. The action is rare (set once per experiment cadence), not daily. Personality: "one-click where the data is" over navigating to a settings surface.

### D8 — QA Agent runner placement
**HUD-side question:** Is the QA Agent runner block in its current Overview position (surfaced on all jobs) appropriate, or does it belong to Riley's path only?
**Choice:** Keep the block in Overview but flag it as a persona-scope open question (§14). It is specced here in its current position but annotated as a candidate for Riley-specific visibility or a per-job config gate.
**Persona reason:** Riley's QA flow uses it daily (bulk taskset QA pass before delivery). Alex occasionally uses it for spot-checking but it is not his primary path. Surfacing it prominently on every job's Overview may be Riley-centric friction on Alex's forensic surface. This is a placement decision that requires Operator confirmation — do not resolve unilaterally.

### D10 — Title pattern: `{Eval | Train | Re-eval} {batch?} N tasks` (SUPERSEDES prior Runs/Task suffix approach)

**HUD-side question:** How does Alex know at a glance what kind of job this is and at what scale?

**Choice:** The H1 title is a machine-generated structured string — not the user-authored job name. Pattern: `{Eval | Train | Re-eval} {batch?} N tasks`.

- `Eval` — job type is evaluation.
- `Train` — job type is training.
- `Re-eval` — job type is re-evaluation.
- `batch` — present iff `models.length > 1` OR `checkpoints.length > 1`. Absent otherwise.
- `N tasks` — total task count for this job run.

**Examples:**
- Single-model eval, 10 tasks → `Eval 10 tasks`
- Multi-model eval (3 models), 10 tasks → `Eval batch 10 tasks`
- Multi-checkpoint training sweep, 10 tasks → `Train batch 10 tasks`
- Single-model re-eval, 10 tasks → `Re-eval 10 tasks`

**Where the user-given job name lives:** Subtitle — one line directly below the H1 title, text-meta size, muted-foreground. Single line, no clamp. This is secondary recognition for the operator who authored the job; Alex's primary forensic question ("what job am I looking at and what kind?") is answered by the structured title above it.

**Model list gone from heading:** Model names (`gpt-4o · qwen2.5-14b · llama-3.1-8b`) do not appear in the heading. `batch` signals multi-model or multi-checkpoint at a glance. The Traces tab count line carries `3 models`; the Overview carries the per-model breakdown. No duplication.

**Persona reason:** Alex's first scan on landing is job type + scale, not the name he gave it. A title like `eval · Multi-model browser sweep · gpt-4o · qwen2.5-14b · llama-3.1-8b` forces him to parse five tokens before understanding the job shape. `Eval batch 10 tasks` answers the forensic question in three words; the subtitle surfaces the name for recognition without competing for primary altitude. The prior `(N×)` Runs/Task suffix approach is retired — the structured pattern encodes type + scale more explicitly and drops the collision with user-authored names.

### D11 — By Trace / By Task aggregation toggle in Results panel
**HUD-side question:** When tasks have N runs each, how does Alex switch between per-trace and per-task analytical lenses?
**Choice:** Segmented toggle `[By Trace] [By Task]` in the Results panel header, default `By Task` (matches production). `By Trace` flattens N attempts × M tasks into N×M individual data points. `By Task` aggregates runs per task (see §14 open question on per-task aggregation default: best / avg / median — not yet confirmed platform-side).
**Persona reason:** Alex's analytical question depends on his current job. Debugging individual rollouts → `By Trace` (see which of the 3 attempts on task 0014 failed). Measuring task-level capability → `By Task` (see which tasks the model can't pass consistently). One toggle, two lenses, no navigation change.

### D12 — Score Distribution histogram
**HUD-side question:** Task Coverage squares show "how many ran" — what shows "how scores cluster"?
**Choice:** Score Distribution histogram alongside Task Coverage squares in the Results panel. Both render together — they serve distinct jobs (glance vs. read). Histogram: X-axis = score bins (default 5 bins: N/A, 0%, 20%, 40%, 60%, 100%); Y-axis = task count. Controls: bin slider (default 5 bins, range 3–10) and `☐ Treat no-score as 0%` toggle (default unchecked — honesty default; checked folds missing-score tasks into the 0% bin).
**Persona reason:** Alex's variance question requires distribution shape, not just success count. Task Coverage tells him how many ran; Score Distribution tells him where scores landed and whether they're clustered (deterministic) or spread (inconsistent). Sam's go/no-go decision needs the cluster pattern: scores clustered at 0% = systematic break; bimodal distribution = some workflows fine, others broken. Both read the histogram before drilling into per-task rows.

### D13 — Invalidate Job: placement and visual weight
**HUD-side question:** Where does Invalidate Job live, and how prominent should it be?
**Choice:** Filled destructive button at the top-right of the Results panel header — contextually adjacent to the data it invalidates. NOT in the page-header right-slot or overflow menu. Visible on Failed / Errored / Completed / Invalidated status variants. Absent on Running (can only Cancel) and Cancelled (no runs to invalidate).
**Persona reason:** Q&A finding: ~95% of Alex's daily job-recovery actions are Rerun or Invalidate. Burying Invalidate in the page-header overflow adds a click to the most common recovery path on broken jobs. Contextual placement next to Results data matches the semantic: Alex sees bad scores and immediately has the invalidation action within reach. Filled destructive treatment (not outline or alpha-tinted) signals permanence and demands intentional click — the correct cost signal for a destructive operation.

### D14 — Status pill visual weight: filled for destructive states
**HUD-side question:** Are all status pills visually equivalent, or do destructive states require more visual weight?
**Choice:** Two-tier visual treatment. Subtle alpha-tinted background for non-destructive states (Completed-pass, Completed-regression, Running). Filled (solid background, white foreground) for destructive / terminal-error states: Failed, Errored, Invalidated. Cancelled gets filled-meta treatment — destructive in outcome but distinct semantic from an error (user- or system-initiated stop).
**Persona reason:** Diagnostic urgency demands visual weight. Errored / Failed / Invalidated are precisely the states where Alex's time pressure is highest and correct state recognition must be instantaneous. A subtle outline pill on an error state buries the signal that should be the first thing Alex reads. Production shows `× ERROR (100% failed)` as a filled red pill — this corrects the prior spec which treated all pills uniformly.

### D15 — Updated-N-ago staleness indicator
**HUD-side question:** How does the user know whether the data on this page is fresh?
**Choice:** Compact `↻ Updated <relative time>` indicator at the far right of the tab bar row, horizontally aligned with tab labels. Renders on all status variants. For Running jobs, updates live (every N seconds — see §14 open question on polling interval). For terminal states (Completed, Failed, Cancelled, Invalidated), static — shows time of last data change.
**Persona reason:** Long-running jobs may have stale page state if Alex navigated back from a trace. Recent completions need recency confirmation before Alex acts on the data shown. Honest freshness cue per personality principle "Earnest" — surface what the user needs to know, don't assume data is fresh. Production shows `↻ Updated less than a minute ago` at the top-right of the tab content row; this spec places it at the same horizontal altitude as the tab bar for visual compactness.

---

## §1 — Shared layout

This page renders inside the App Shell. The App Shell provides: top nav, sidebar, and the main content slot. This wireframe covers the main content slot only.

Reference: `docs/design/screens/app-shell.wireframe.md`

The Job detail main content slot uses the standard detail-page layout: sticky page header (breadcrumb + title row + descriptor strip) + sticky tab bar, with tab content scrolling beneath.

---

## §2 — Page header anatomy

### 2.1 Breadcrumb (sticky)

```
← Jobs / <job-display-name>
```

- "Jobs" is a link to `/jobs`.
- `<job-display-name>` is plain text (current page, not a link).
- Display name resolution: use the authored job name if set; fall back to `Job <short-id>`.
- `aria-label="breadcrumb"` on the `<nav>` element. Current page rendered as `aria-current="page"`.

### 2.2 Title row (sticky)

```
[H1: <structured-title>]  [Status pill]                         [Right-slot CTAs]
<user-job-name>  (subtitle — text-meta, muted-foreground)
```

- **H1 — structured title** (machine-generated per D10): `{Eval | Train | Re-eval} {batch?} N tasks`
  - `batch` appears iff `models.length > 1` OR `checkpoints.length > 1`. Omitted for single-model, single-checkpoint runs.
  - Examples: `Eval 10 tasks` · `Eval batch 10 tasks` · `Train batch 10 tasks` · `Re-eval 10 tasks`
  - Model names do NOT appear in the H1. Model identity lives in the Traces tab count line (`3 models`) and the Overview per-model breakdown.
- **Subtitle — user-given job name:** one line directly below the H1. text-meta size, muted-foreground. Single line, no clamp. Absent when the job has no user-authored name. This is the operator's authored label for their own recognition — not the primary forensic signal.
- **Status pill:** immediately right of H1 (aligned to first line of title row). Status-conditional — see §9 for each variant's pill text, icon, and visual treatment.
  - Failure rate clause is inline in the pill on `Error` status: `× Error · 100% failed`.
  - Regression count clause is inline on `Completed (regression)`: `⚠ Completed · N regressions`.
  - **Visual weight per D14:** Filled (solid background, white foreground) on Failed, Errored, Invalidated, Cancelled. Subtle alpha-tinted background on Completed-pass, Completed-regression, Running.
- **Right-slot CTAs:** far right of the title row. Status-conditional — see §9 for each variant's CTA set.
  - Primary CTA is always a single visible button.
  - Secondary CTAs appear as visible buttons only when there are ≤2 meaningful actions.
  - Additional actions collapse into an overflow menu (`···`). On Failed / Errored / Completed / Invalidated variants, `Invalidate Job` is NOT in this overflow — it lives in the Results panel header per D13.

### 2.3 Descriptor strip (one line below title row)

Static descriptors separated by `·`. Status is NOT in the strip (it is the title-row pill).

Fields in order:

```
<taskset-name>  ·  <model-name-or-N-models-chip>  ·  Created <relative-time>  ·  Avg duration <value>  ·  Job <short-id>
```

- **Taskset name:** linked to `/tasksets/<id>`.
- **Model field:**
  - Single model: linked model name → `/models/<id>`.
  - Multi-model: "N models" chip → opens model-breakdown inline view or links to a model list anchored on this job. See §14 open question.
- **Created:** relative time with absolute timestamp in `title` attribute (e.g., "3 hours ago", `title="2026-06-14 09:31 UTC"`).
- **Avg duration:** exact value (e.g., "2m 16s" — not "~2 min").
- **Job ID:** short ID, monospace, copy-on-click affordance.

---

## §3 — Tab bar

### 3.1 Tab bar anatomy

```
[Overview]  [Tasks <N>]  [Traces <N>]  [Usage*]
```

Underline variant. Active tab underlined. Sticky below page header.

- **Overview** — no badge. Default tab on load.
- **Tasks** — count badge: total task count for this job (e.g., `Tasks 300`). On `Failed` or `Completed (regression)` variants, badge is prominence-elevated to draw attention.
- **Traces** — count badge: total Run count for this job. One task may produce multiple Runs (see §14 open question on Run multiplier).
- **Usage** — visible but dimmed / inactive at default scale (sub-300 tasks). Activates at scale (1k+ tasks working assumption — confirm in §14 item 14) when Tool Usage is promoted out of Overview. Operator decision — see D3, §14.

### 3.2 Staleness indicator (per D15)

Far right of the tab bar row, horizontally aligned with the tab labels:

```
↻ Updated <relative-time>
```

- Renders on all status variants.
- **Running jobs:** live-updating on a polling interval (see §14 open question on interval). Text updates in-place without page reload: e.g., `↻ Updated just now` → `↻ Updated 30 seconds ago`.
- **Terminal states (Completed, Failed, Cancelled, Invalidated):** static — shows time of last data write.
- `aria-live="polite"` on the indicator element so screen readers announce updates for Running jobs without interrupting active reads.
- Mobile (< 640): indicator is hidden to reduce tab bar crowding. Freshness is conveyed by the Running status pill animation instead.

---

## §4 — Overview tab

Default tab. Contains the diagnostic spine: Task Coverage → Recipe sidebar → Results summary → Tool Usage analytical block → Configuration → Description → Comments.

### 4.1 Layout structure

Two-column layout on wide viewports. Three-column would crowd the Recipe sidebar — two columns is the correct reading altitude.

```
┌─────────────────────────────────┬──────────────────────────┐
│  LEFT + CENTER COLUMN (2/3)     │  RIGHT COLUMN (1/3)       │
│                                 │                           │
│  [Task Coverage]                │  [Recipe Sidebar]         │
│  [Baseline Delta] (Completed)   │                           │
│  [Live Tail] (Running)          │                           │
│  [Results]                      │                           │
│  [Tool Usage]                   │                           │
│  [Configuration]                │                           │
│  [QA Agent Runner]              │                           │
│  [Description]                  │                           │
│  [Comments]                     │                           │
└─────────────────────────────────┴──────────────────────────┘
```

On narrow viewports (below the two-column breakpoint), the Recipe sidebar stacks below Task Coverage, before Results.

### 4.2 Task Coverage block

```
Task Coverage
<taskset-name>        [Revalidate All]

[■][■][■][ ][ ][ ][ ]  ← colored squares row, one per task

Legend:  ■ Scored  ■ No score  □ Not run  ■ Invalidated

<N> invalidated · [☐ Show invalidated]
```

- **Header:** "Task Coverage" label + taskset name as a link.
- **Colored squares row:** one square per task in the taskset. Squares are small but distinguishable. For jobs over ~50 tasks, squares become micro-dots maintaining the visual coverage shape rather than individual readability.
- **Legend:** four states. Copy is exact: Scored / No score / Not run / Invalidated. "Invalidated" at the Task square means **all Runs on this Task were invalidated**. A Task with some-but-not-all Runs invalidated still renders as Scored or No-score based on its surviving Runs. Hover on any square shows a tooltip with the per-Task Run breakdown: e.g., "Task 0003 — 2 Runs: 1 scored, 1 invalidated." See option (b) rationale in §14 resolution below.
- **Invalidated disclosure:** shows "N invalidated · Show" when N > 0 — N is the count of Tasks where all Runs were invalidated. "Show" expands the invalidated squares inline — does not navigate away.
- **Revalidate All:** button, far right of header, active when there are invalidated runs. Destructive-enough to require confirmation — see empty/error state §4.9.

**Multi-model variant:** When job ran N models, the Task Coverage block shows one coverage row per model, each labeled with the model name. Legend is shared.

### 4.3 Baseline delta callout (Completed status only)

Appears below Task Coverage, above Results. Suppressed on all other status variants. Also suppressed when no baseline can be resolved (see D5 sequence — no prior Jobs on this Taskset).

```
Compared to: <baseline-job-name> [<baseline-job-id>]  [Change baseline ▼]
             vs last-passing run on <taskset-name> — Job #<short-id>

  ↓ N regressions    (Passed → Failed)   [View regressions →]
  ↑ M recoveries     (Failed → Passed)
  Δ score  +0.0312

```

- **Baseline resolution** follows D5 sequence: operator-pinned IF set → last-passing Job on this Taskset → suppressed. The "Compared to" line shows the resolution context inline: "vs operator-pinned baseline — Job #a1b2" OR "vs last-passing run on <taskset-name> — Job #4f3a".
- Regression count links to Tasks tab pre-filtered to `Regressed` filter state.
- Score delta is exact float. Positive delta is not celebrated — it is a fact. Negative delta is not alarmed — it is a fact.
- **No empty-state CTA.** When no baseline can be resolved, the block is suppressed entirely. There is no "No baseline available" message in this block — the block simply does not render. (Users who want to pin a baseline do so from any Completed Job's overflow menu: `Pin as baseline for [taskset-name]`.)
- **`Change baseline ▼` dropdown:** (a) current operator-pinned baseline (if set, labeled "Pinned"), (b) filterable list of other Completed Jobs on this Taskset selectable as the reference, (c) "Clear pinned baseline" — reverts to last-passing-run fallback. This dropdown only changes the pinned baseline; the last-passing fallback is automatic when no pin is set.

### 4.4 Live tail block (Running status only)

Appears below Task Coverage when status is `Running`. Suppressed on all other status variants.

```
Live output — <N> tasks running

[scrolling log lines — most recent 20 lines, auto-tail]

[● Streaming]  [■ Stop tail]

```

- Log lines are monospace. Timestamps left-aligned. Level tags (INFO / WARN / ERROR) inline.
- "Stop tail" pauses auto-scroll; log continues capturing. A "Resume tail" affordance appears when paused.
- Full log is accessible via the overflow action "View full logs" (see §9 Running variant right-slot CTAs).
- Open question: whether a separate Logs tab is warranted — see §14.

**Training metrics sub-block (Training-purpose Running jobs only):**

```
Training metrics

Loss            ████████░░  0.3241 (step 1,024 / 4,096)
Reward (mean)   ██████░░░░  0.6812
KL divergence   ███░░░░░░░  0.1204

[View full training curve →]
```

- Values are exact floats. Steps are exact integers.
- "View full training curve" links to a model or training-run detail page (out of scope for this wireframe).

### 4.5 Results block

```
Results                        [By Trace] [By Task]      [⚠ Invalidate Job]
─────────────────────────────────────────────────────────────────────────────

Score Distribution

  N
  │  ██
  │  ██      ██
  │  ██      ██  ██
  │  ██      ██  ██  ██
  └─────────────────────── score
    N/A  0%  20% 40% 60% 100%

Bins: [──●──────] 5   [☐ Treat no-score as 0%]

─────────────────────────────────────────────────────────────────────────────

Task <id>   Status    Score     Duration   Model       Trace
<id-0000>   ✓ Scored  0.9341    1m 12s     <model>     [→]
<id-0001>   × Failed  —         —          <model>     [→]
<id-0002>   × Error   —         —          <model>     [→]

[All results → Tasks tab]
```

**Results panel header (top bar):**
- **Left:** "Results" label.
- **Center:** Segmented toggle `[By Trace] [By Task]` — per D11. Default: `By Task`.
  - `By Task`: table rows show one row per task; score is the aggregated value for that task's runs. Aggregation default (best / avg / median) is an open question — see §14.
  - `By Trace`: table rows show one row per individual Run — N×M rows for N runs × M tasks. Score is the per-Run float.
- **Right:** `[⚠ Invalidate Job]` — filled destructive button per D13. Visible on Failed / Errored / Completed / Invalidated status variants. Absent on Running and Cancelled.

**Score Distribution histogram (per D12):**
- Immediately below the Results panel header, above the task/trace table.
- X-axis: score bins. Default 5 bins: N/A · 0% · 20% · 40% · 60% · 100%.
- Y-axis: task count (By Task mode) or run count (By Trace mode). Y-axis label updates with toggle.
- **Bin slider:** horizontal slider beneath the histogram. Range 3–10 bins, default 5. Adjusting redraws the histogram in place.
- **Treat no-score as 0% toggle:** checkbox label `☐ Treat no-score as 0%`. Default unchecked — tasks with no score appear in the N/A bin (honest representation). When checked, no-score tasks fold into the 0% bin.
- Both controls are inline below the histogram, on the same row.

**Task / Run summary table:**
- Shows a collapsed summary (top N rows by failure prominence) — not the full task list (Tasks tab).
- `[All results → Tasks tab]` link at the bottom.
- Score is exact float. Missing score shown as `—`, not `null` or blank.
- Trace link `[→]` navigates to the trace viewer for that Run. Direct link, not a modal.
- In `By Trace` mode, each row is a Run; `Task <id>` column groups by task but each run is its own row.

**Empty / Invalidated state (replaces the table):**

When ALL runs are invalidated:
```
All <N> runs invalidated. Re-validate or re-run to produce results.
```

Not "No results yet." — that copy is misleading when runs exist but were invalidated.

When job is Running:
```
<N> tasks complete · <M> running · Partial results above
```

Histogram renders on partial results (running jobs) with whatever data is available. Bin slider and toggle remain interactive.

### 4.6 Recipe sidebar

Boxed, numbered steps. Position: right column (§4.1 layout). Sticky within the right column until the content column extends past it, then natural flow.

Step 3 is persona/purpose-conditional — see D7 matrix. The wireframe below shows the Alex+Training variant (all steps visible). For other personas/purposes, Step 3 renders as described in D7.

**Alex + Training job (reference rendering):**
```
┌─────────────────────────────────────────┐
│  1  View Traces                          │
│     <N> traces available                │
│     [View Traces →]                     │
│                                         │
│  2  Rerun Same Evaluation               │
│     <taskset-name> chip  <env-name> chip│
│     [↻ Rerun <N> Tasks]                 │
│                                         │
│  3  Improve                             │
│     Train model on <N> tasks            │
│     [Need <M> more traces]  (disabled)  │
└─────────────────────────────────────────┘
```

**Riley variant (any job purpose):**
```
┌─────────────────────────────────────────┐
│  1  View Traces                          │
│     <N> traces available                │
│     [View Traces →]                     │
│                                         │
│  2  Rerun Same Evaluation               │
│     <taskset-name> chip  <env-name> chip│
│     [↻ Rerun <N> Tasks]                 │
│                                         │
│  3  Improve                             │
│     Refine environment                  │
│     <env-name> chip  [→ Open env]       │
└─────────────────────────────────────────┘
```

**Sam variant (Eval or Re-eval job):**
```
┌─────────────────────────────────────────┐
│  1  View Traces                          │
│     <N> traces available                │
│     [View Traces →]                     │
│                                         │
│  2  Rerun Same Evaluation               │
│     <taskset-name> chip  <env-name> chip│
│     [↻ Rerun <N> Tasks]                 │
└─────────────────────────────────────────┘
```
(Step 3 omitted. Sam's loop closes at Rerun.)

Step rendering rules by status:

The sidebar is a **recipe** (description + navigation only). Primary destructive and primary recovery actions live exclusively in the right-slot CTA (§2.2, §9). The sidebar never duplicates those CTAs.

| Status | Step 1 | Step 2 | Step 3 |
|--------|--------|--------|--------|
| Running | "N traces so far" · View Traces enabled | "Job is running. Cancel from the title bar." (description only — no CTA in sidebar) | Alex+Training: Train disabled · Riley: Refine enabled · Sam: omitted |
| Failed | "N traces available" · View Traces enabled | "Rerun Same Evaluation" · Rerun CTA | Alex+Training: Train disabled (traces may be tainted) · Alex+Eval: Train hidden (below threshold requirement; if threshold met, show) · Riley: Refine enabled · Sam: omitted |
| Completed | "N traces available" · View Traces enabled | "Rerun Same Evaluation" · Rerun CTA | Alex+Training: Train enabled if threshold met, disabled with count if not · Alex+Eval: Train shown only if threshold met · Riley: Refine enabled · Sam: omitted |
| Invalidated | "0 traces — runs were invalidated" | "Rerun to produce new traces" · Rerun CTA | Alex: Train disabled · Riley: Refine enabled · Sam: omitted |
| Cancelled | "N traces available (partial)" | "Rerun Same Evaluation" · Rerun CTA | Alex+Training: Train disabled if partial threshold not met · Riley: Refine enabled · Sam: omitted |

Step 3 Train copy:
- **Enabled:** "Train model on N tasks" with a "Start training →" CTA.
- **Disabled:** "Need N more traces" — exact integer, not "~10". CTA rendered but disabled with the count as the label.
- **Hidden:** not rendered at all (Sam on any job; Alex+Eval below threshold; Riley).

"Train model" affordance note: This surfaces the distillation / DPO harvest loop that ~80% of engineers perform post-successful-job. The threshold "N more traces" is an open question — see §14.

### 4.7 Tool Usage analytical block

Full-width below the two-column area (or within the left column if Recipe sidebar has ended). Contains three panels:

**Panel A — Distribution table**

```
Tool Usage  ·  <N> calls  ·  <M> tools  ·  <K> avg/trace

Distribution

TOOL               AVG/TR    TIME      SCORE    EMPTY%    AVG OUT
<tool_name>        6.50      41ms      100.0%   23%       2.3k
<tool_name>        0.50      431ms     100.0%   0%        2.3k
<tool_name>        0.50      475ms     100.0%   0%        2.3k
<tool_name>        3.50      581ms     100.0%   0%        21
```

- All values are exact (no rounding).
- EMPTY% column: percentage of calls that returned empty output — diagnostic signal for broken tools.
- Inline bar visualization on AVG/TR column (bar length proportional to avg call count per trace).

**Panel B — Common Patterns**

```
Common Patterns

#     PATTERN                                     N     SCORE    ALT    N
P1    [tool_a] → [tool_b] → [tool_c]             2     100.0%   100.0% 1
P2    [tool_a] → [tool_b] → [tool_d]             1     100.0%   —      —
P3    [tool_a] → [tool_b] → [tool_c] → [tool_a]  1     100.0%   100.0% 2
```

- Patterns are shown as sequential chip chains (tool name chips in a row).
- N = number of traces that matched this pattern.
- SCORE = mean score for traces matching this pattern.
- ALT = alternative success pattern (if any). Dash if none.

**Panel C — Pattern / Trace Matrix**

Mini heatmap. Rows = patterns (P1–PN). Columns = individual traces. Cell = whether that trace matched the pattern. Hover → tooltip showing trace ID + score.

```
Pattern / Trace Matrix  [?]

     [trace-0] [trace-1] [trace-2]
P1   [■]       [ ]       [ ]
P2   [ ]       [■]       [ ]
P3   [ ]       [ ]       [■]
```

**Filter chips — per-task drill:**

```
Filter by task:
[All Tasks]  [0000]  [0001]  [0002]
```

Selecting a task chip filters Distribution, Common Patterns, and Pattern/Trace Matrix to that task's runs only. "All Tasks" resets. At high task counts, chips overflow to a dropdown or paginated chip row.

### 4.8 Configuration block (collapsed by default per D2)

Collapsed by default behind a `▶ Configuration` disclosure toggle. Position: bottom of the Overview content column, below QA Agent runner and above Description.

**Collapsed state:**
```
▶ Configuration
```

**Expanded state (user activates `▶ Configuration` → `▼ Configuration`):**
```
▼ Configuration

Agent               <agent-name> <agent-version>    [→ Agent detail]
Taskset             <taskset-name> v<version>        [→ Taskset detail]
Environment         <env-name>                       [→ Environment detail]
Environment image   <image-sha-short>                [copy]
Model               <model-name(s)>
Seed                <integer or "not set">
Max steps           <integer>
Params              <key>: <value>  ·  <key>: <value>  ...
RL hyperparams      <key>: <value>  ·  ...           (Training jobs only)

Job ID              <full-job-id>                    [copy]
```

- **Default state:** collapsed. Expanded state persists within the session (user expands → stays expanded until page reload or deliberate collapse).
- Environment image SHA: monospace, copy-on-click. Short SHA displayed (7–12 chars), full SHA in tooltip.
- Job ID: monospace, copy-on-click, full ID.
- Links to Agent detail, Taskset detail, Environment detail are inline text links — not buttons.
- RL hyperparams row: rendered only for Training-purpose jobs.
- If Config content exceeds ~8 rows (env vars, secrets-redacted parameters), the expanded state contains a "View full config →" inline link that expands further in-place. No Config tab promotion is needed — the disclosure contains growth.

### 4.9 QA Agent runner block

```
QA Agent

Run this Job's traces through a QA agent to validate task coverage.

[Select QA Agent ▼]   [Run QA Agent]
```

- Position: below Configuration, above Description.
- "Select QA Agent" is a dropdown/combobox populated from the user's available agents.
- "Run QA Agent" is disabled until an agent is selected.
- See §14 open question: persona scope of this block.

### 4.10 Description block

```
Description

<description text>   [Edit]
```

Empty state:
```
Description                         [Add]
```

- Empty state renders as "Description" label + an `[Add]` action inline. No placeholder copy, no ellipsis hint.
- Clicking `[Add]` opens an inline textarea. Save / Cancel controls per `docs/design/guidelines/form-actions.md`.
- Pre-run intent (authored at job creation) OR post-run forensic annotation — see §14.

### 4.11 Comments block

```
Comments

[text input: Add a comment...]                        [Post]

──── No comments. ────
```

When comments exist:

```
<avatar> <user-name>  ·  <relative-time>
<comment text>

<avatar> <user-name>  ·  <relative-time>
<comment text>
```

- Input always visible (not a "Add comment" CTA that reveals an input).
- Post button enabled only when input is non-empty.
- Empty state copy: "No comments." — not an illustration, not a paragraph. The always-visible input field is the affordance; no coaching copy needed.

---

## §5 — Tasks tab (STUB)

> Specced in sibling file: `docs/design/screens/job-detail-tasks.wireframe.md`

Summary of intent for cross-reference:

- Per-task table. Columns: Task ID, Status, Score, Duration, Model (if multi-model), Trace link.
- Filter bar: All / Passed / Failed / Errored / Regressed / Invalidated.
- Regression filter is the primary Alex diagnostic tool: collapses all passing rows to expose only tasks that flipped Passed → Failed vs. the baseline.
- Density: designed for 1k–5k rows (RC regression scale). Virtualized scrolling required.
- Click row → navigates to Trace viewer for that Run.

---

## §6 — Traces tab (STUB)

> Specced in sibling file: `docs/design/screens/job-detail-traces.wireframe.md`

Summary of intent for cross-reference:

- Per-Run list (one row per Run, not one per Task — see §14 Run multiplier open question).
- Columns: Run ID, Task ID, Status, Score, Duration, Model, Started.
- Filter by: outcome, task, model, date range.
- Click row → Trace viewer.

---

## §7 — Usage tab (STUB, conditional)

Conditional: this tab activates only when the job has 1k+ tasks (RC regression scale) and Tool Usage would dominate the Overview. At default scale, Tool Usage lives in Overview (§4.7).

When activated, the tab contains the full Tool Usage analytical block (§4.7 verbatim content) without the Overview's surrounding context.

---

## §8 — Config tab (STUB, conditional)

Conditional: this tab is promoted from the Overview Configuration block only if Config content grows large enough (env vars, secrets-redacted parameters, full manifest) to displace Overview readability. At default scale, Configuration is a compact block in Overview (§4.8).

---

## §9 — Variant cross-cuts

Status determines: title-row pill (text + visual weight per D14), H1 suffix (per D10), right-slot CTAs, Results panel Invalidate button, Overview content conditionals, Recipe sidebar step rendering.

| Variant | Status pill text + visual weight (D14) | H1 suffix (D10) | Right-slot CTAs | Results panel | Overview content notes |
|---|---|---|---|---|---|
| **Running** | `● Running · N% complete` — subtle alpha-tinted | `(<N>×)` or `(<N> steps)` as applicable | Primary: `■ Cancel` · Overflow: `Copy ID`, `Export`, `Share` | No Invalidate button (cannot invalidate while running). Toggle and histogram render on partial data. | Live tail block visible (§4.4). Training metrics sub-block if Training-purpose job. Baseline delta suppressed. |
| **Failed** | `× Failed` (all failed) OR `× Error · N% failed` (partial) — **FILLED destructive** | `(<N>×)` or `(<N> steps)` | Primary: `↻ Re-run` · Overflow: `Copy stack trace`, `Copy ID`, `Export`, `Share` | `[⚠ Invalidate Job]` filled destructive button in Results header. | Stack-trace excerpt block below Results (brief excerpt, "Copy full trace" link). Infra health line if applicable. Baseline delta suppressed. |
| **Completed (pass)** | `✓ Completed` — subtle alpha-tinted | `(<N>×)` or `(<N> steps)` | Primary: `↻ Re-run` · Secondary: `Compare to baseline` · Overflow: `Pin as baseline for [taskset]`, `Copy ID`, `Export`, `Share` + purpose-scoped actions | `[⚠ Invalidate Job]` filled destructive button in Results header. | Baseline delta callout visible (§4.3). Recipe Step 3 per D7 matrix. |
| **Completed (regression)** | `⚠ Completed · N regressions` — subtle alpha-tinted | `(<N>×)` or `(<N> steps)` | Primary: `↻ Re-run` · Secondary: `Compare to baseline` · Overflow: `Pin as baseline for [taskset]`, `Copy ID`, `Export`, `Share` + purpose-scoped actions | `[⚠ Invalidate Job]` filled destructive button in Results header. | Baseline delta callout visible, regression count prominent, "View regressions" → Tasks tab filtered. |
| **Invalidated** | `⊘ Invalidated` — **FILLED destructive** | `(<N>×)` or `(<N> steps)` | Primary: `↻ Re-run` · Overflow: `Re-validate`, `Copy ID`, `Export`, `Share` | `[⚠ Invalidate Job]` filled destructive button visible (re-invalidation path; button label may be `Re-invalidate` if platform supports). | Invalidation reason block (who invalidated, when, reason string). Results block shows "All N runs invalidated" state. Recipe Step 1 shows "0 traces — runs were invalidated." |
| **Cancelled** | `× Cancelled` — **FILLED meta** (distinct from error: user- or system-initiated stop, not a failure) | `(<N>×)` or `(<N> steps)` | Primary: `↻ Re-run` · Overflow: `Copy ID`, `Export`, `Share` | No Invalidate button (cancelled job has no runs to invalidate beyond partial). | Cancellation reason + actor (who cancelled / system) + timestamp. Partial results shown if any runs completed before cancellation. Recipe Step 3 disabled if threshold not met. |

> **Invalidate removal from page-header overflow (D13):** All previous overflow entries for `Invalidate` are removed from the page-header right-slot CTAs and overflow menu. `Invalidate Job` lives exclusively in the Results panel header. `Copy ID` replaces `Invalidate` in the page-header overflow slot across all variants where it previously appeared.

Cross-cut: **job purpose × persona** (Eval / Training / Re-eval × Alex / Sam / Riley). Proper sub-table below.

#### §9 Purpose cross-cut sub-table

| Job purpose | Primary actor(s) | Load-bearing Overview surface | Recipe Step 3 Improve action | Overflow — purpose-scoped additions on Completed |
|---|---|---|---|---|
| **Eval** | Alex (Phase 1) · Sam (regression check) | Task Coverage + Results + Tool Usage. No Training metrics block. | Alex: "Train model on N tasks" IF threshold met (forward-looking post-Eval action) · Sam: Step 3 omitted · Riley: "Refine environment" | Promote model: **absent** · Tag as Release Candidate: **absent** · (Eval doesn't produce a model artifact to promote.) `Pin as baseline for [taskset]` present. |
| **Training** | Alex (Phase 4) | Task Coverage + Training metrics sub-block (Running) + Results + Tool Usage. | Alex: "Train model on N tasks" — primary Improve action; threshold-gated | Promote model: **present** (Completed only) · Tag as Release Candidate: **present** (Completed only). Alex is the actor; RL output ceremony is appropriate here. |
| **Re-eval** | Alex (Training-output re-eval) · Sam (prompt-regression re-eval) | Baseline delta callout is the primary Results interpretation surface. | Alex (Training-output re-eval): "Train model on N tasks" if threshold met · Sam (prompt-regression): Step 3 omitted | Alex (Training-output re-eval): Promote model **present**, Tag as RC **present** · Sam (prompt-regression): Promote model **absent**, Tag as RC **absent** — Sam doesn't own the model. Distinguishing Training-output vs. prompt-regression Re-eval is a platform question: see §14 new open question. |

**Rule enforced by this table:** "Promote model" and "Tag as Release Candidate" are Training-purpose Alex actions only. Eval Jobs (regardless of persona) produce no model artifact to promote. Sam's Re-eval Jobs (prompt-regression check) never yield Promote/Tag — Sam compares prompt variants, not model checkpoints. Surface these actions in overflow only when `(purpose == Training OR (purpose == Re-eval AND actor == Alex with Training-output source))` and `status == Completed`.

---

## §10 — States coverage

| Surface | State | Specced in |
|---|---|---|
| Task Coverage | Default (data present), Empty (no tasks run), Loading, Multi-model (N rows) | §4.2 |
| Baseline delta callout | Completed-with-baseline, No-baseline-set, Suppressed (non-Completed) | §4.3 |
| Live tail | Running (auto-tail), Paused, Training-metrics sub-block, Suppressed (non-Running) | §4.4 |
| Results block | Data present, All-invalidated, Running-partial (histogram on partial data), Empty-not-started | §4.5 |
| Results — By Trace / By Task toggle | By Task (default), By Trace; absent when no runs exist | §4.5, D11 |
| Score Distribution histogram | Default (5 bins), Bins-adjusted (3–10), No-score-as-0%-checked, Empty (no scored runs) | §4.5, D12 |
| Invalidate Job button (Results header) | Visible: Failed, Errored, Completed, Invalidated. Absent: Running, Cancelled | §4.5, D13 |
| Recipe sidebar | Per-status step rendering (6 status variants) | §4.6, §9 |
| Tool Usage | Default (data), Empty (no runs), Filter-active (per-task) | §4.7 |
| Configuration | Collapsed (default), Expanded (user-activated), Large config with "View full config →" | §4.8, D2 |
| QA Agent runner | Pre-select (disabled CTA), Agent selected (enabled CTA) | §4.9 |
| Description | Pre-authored, Empty / Add affordance, Edit mode | §4.10 |
| Comments | Empty, With comments, Posting (disabled while in-flight) | §4.11 |
| Title row — H1 suffix | Multi-run `(N×)`, Training `(N steps)`, Single-run (no suffix) | §2.2, D10 |
| Title row — status pill | 6 status variants × 2 visual tiers (subtle / filled) | §2.2, §9, D14 |
| Staleness indicator | Running (live-updating), Terminal (static), Hidden on mobile | §3.2, D15 |
| Right-slot CTAs | 6 status variants; Invalidate removed from overflow per D13 | §2.2, §9 |
| Tasks tab | (stub) | §5 |
| Traces tab | (stub) | §6 |
| Usage tab | Conditional-active, Conditional-inactive (dimmed) | §3.1, §7 |

---

## §11 — Responsive behavior

| Breakpoint | Behavior |
|---|---|
| Wide (≥ 1280) | Two-column layout: left+center (2/3) + Recipe sidebar right (1/3). Tab bar + page header sticky. Tool Usage full-width below columns. Staleness indicator visible at far right of tab bar. Score Distribution histogram full-width in Results panel. |
| Mid (900–1279) | Two-column layout preserved but Recipe sidebar may narrow. Tool Usage Distribution table truncates rightmost columns with horizontal scroll. Score Distribution histogram full-width. Staleness indicator visible. |
| Narrow (< 900) | Single-column layout. Recipe sidebar stacks below Task Coverage, before Results. Tool Usage collapses to Distribution table only; Common Patterns and Pattern/Trace Matrix behind a disclosure. Score Distribution histogram full-width in Results panel. Staleness indicator moves to below the tab bar (stacked row) rather than inline with tabs. |
| Mobile (< 640) | Page header condensed — breadcrumb and descriptor strip wrap. Status pill stays in title row. H1 Runs/Task suffix stays (it is part of the label, not chrome). Tab bar horizontally scrollable. **Staleness indicator hidden** — freshness is conveyed by Running status pill animation. Score Distribution histogram collapses to a compact variant (bar chart, no Y-axis label, bin slider hidden — tapping the histogram reveals a "Customize bins" sheet). By Trace / By Task toggle remains visible. Invalidate Job button remains visible in Results header. Not a primary surface for Alex — acceptable degradation on all collapsed analytics. |

---

## §12 — Keyboard and accessibility

| Element | Keyboard behavior |
|---|---|
| Breadcrumb | Tab-navigable. Breadcrumb nav has `aria-label="breadcrumb"`. Back link is a standard `<a>`. Current page has `aria-current="page"`. |
| Tab bar | `role="tablist"`. Left/right arrow keys move between tabs. Tab key navigates to tab panel. Active tab has `aria-selected="true"`. |
| Status pill | Read-only, not interactive. `aria-label="<full status text>"` including failure rate if present. |
| Right-slot CTAs | Primary CTA has descriptive `aria-label` including job name (e.g., "Re-run job Batch Run: 3 tasks"). Overflow menu: `aria-haspopup="menu"`, `aria-expanded`. |
| Task Coverage squares | Each square has `aria-label="Task <id>: <status>"`. Colored squares use color + shape encoding (square vs dot vs outlined). Color alone does not carry meaning — legend and aria-labels are required. |
| Revalidate All | Confirmation dialog on activation. `aria-label="Revalidate all invalidated runs for this job"`. |
| Recipe sidebar steps | Steps are reading-order numbered. CTAs within steps have descriptive labels ("Re-run 3 Tasks" not just "Re-run"). |
| Tool Usage table | `<table>` with `<th scope="col">` headers. Sortable columns get `aria-sort`. |
| Configuration `<dl>` | `<dl>` / `<dt>` / `<dd>` structure. Copy-on-click affordance has `aria-label="Copy <field name>"`. |
| Comments textarea | `<textarea aria-label="Add a comment">`. Post button disabled state uses `aria-disabled="true"`. |
| Focus management | Tab switches: focus moves to the tab panel content (h2 or first interactive element). Drill link to Traces tab with pre-applied filter: focus lands at filter bar. |
| By Trace / By Task toggle | `role="group"` with `aria-label="Results aggregation"`. Each option is a `<button role="radio">` with `aria-checked`. Left/right arrow keys move between options. Enter/Space activates. Changing selection re-renders the table and histogram; announce with `aria-live="polite"` on the Results panel region. |
| Score Distribution histogram | Not an interactive chart requiring per-bar keyboard navigation (bars are display-only). Screen reader summary: `aria-label="Score Distribution: <N> tasks scored — <X>% in top bin, <Y>% in bottom bin"` on the histogram container. Bin slider: `<input type="range">` with `aria-label="Number of bins"`, `aria-valuemin="3"`, `aria-valuemax="10"`, `aria-valuenow="5"`. Treat no-score toggle: standard `<input type="checkbox">` with visible label. |
| Invalidate Job button | `aria-label="Invalidate this job"`. Filled destructive button — must not be activatable by accidental keyboard pass-through; requires deliberate Enter/Space press. Confirmation dialog on activation: `role="alertdialog"`, `aria-labelledby` pointing to the dialog title, focus trapped inside until resolved. |
| Configuration disclosure | `<button aria-expanded="false" aria-controls="config-panel">▶ Configuration</button>`. `aria-expanded` updates on toggle. Panel id="config-panel". |
| Staleness indicator | `role="status"`, `aria-live="polite"` for Running jobs. Screen reader reads updates as they arrive without interrupting. For terminal states, static — no `aria-live`. |

---

## §13 — Persona notes

Load-bearing operator Q&A quotes, mapped to the surface decisions they drive.

| Surface | Persona job / quote | Decision |
|---|---|---|
| Title-row status pill | "Verify job integrity — confirm the run didn't fail from infrastructure fluke." (persona job #1) | Status must be visible above the fold, not inside a scrollable Details panel. Promotes to title row. |
| Baseline delta callout | "Isolate regressions — filter out passing tasks; isolate tasks that flipped Passed → Failed vs the baseline." (persona job #2) | Baseline delta callout is an Overview-level block, not a Compare tab. Regression count links to Tasks tab pre-filtered. |
| Trace viewer link in Results | "Audit agent trajectories — trace chronological thought-action-observation loops to find where a tool arg mutated or a model hallucinated." (persona job #3) | Every task row in Results and every task row in Tasks tab carries a direct Trace link. |
| Export action in overflow | "Export for action — extract error payload, system state, prompt vars → patch locally or convert to permanent unit test." (persona job #4) | Export surfaces in overflow on all status variants. |
| Recipe sidebar — Rerun step | "Rerun / Invalidate: ~95% — constant daily utility (rate-limit fluke, system prompt typo)." | Rerun CTA is the primary Step 2 action and the primary right-slot CTA on Failed/Completed. |
| Recipe sidebar — Train step | "Training models from job traces: ~80% — engineers harvest successful traces for distillation and pair success/failure traces for DPO/alignment." | Step 3 Train surfaces prominently in the Recipe sidebar, not buried. Disabled with exact deficit count when threshold not met. |
| Task volumes (Tasks tab density) | "Enterprise RC regression: 1,000–5,000+ tasks." | Tasks tab uses virtualized scrolling. Usage tab conditional on scale. |
| Running: Cancel CTA | "Running — Cancel/Abort" (status-dependent action matrix) | Cancel is the primary right-slot CTA on Running variant. Not in an overflow — it is time-sensitive. |
| Failed: Copy stack trace | "Failed — Retry/Rerun, Copy stack trace." | Stack trace excerpt block on Overview for Failed variant. Copy stack trace in overflow menu. |
| Completed: Promote / Tag RC | "Completed — Compare to baseline, Filter for regressions, Promote/Tag model." | Promote and Tag as Release Candidate in overflow on Completed variants. Compare to baseline as visible secondary CTA. |
| Tool Usage block | Alex actively reads distribution + common patterns to identify tool misuse. | Tool Usage is in Overview (not behind a tab) for sub-300-task jobs. Power-user analytical signal within reach of the diagnostic spine. |
| Configuration block collapsed by default | Alex expands Config only when reproducing or comparing — not on every visit. Config is reference content, not ambient scan signal. | Configuration block defaults to collapsed `▶` disclosure. Alex expands deliberately before re-running. Production-aligned. |
| H1 Runs/Task suffix | Alex's first scan question on multi-run jobs: "what variance am I reading?" — 3 runs per task vs. 1 run is a fundamentally different analytical context. | `(N×)` suffix in H1. Omitted for single-run jobs. Training jobs show step count instead. |
| By Trace / By Task toggle | Alex's analytical frame changes by job: debugging a single rollout (By Trace) vs. measuring task-level capability (By Task). | Segmented toggle in Results panel header, default By Task. |
| Score Distribution histogram | Task Coverage shows "how many ran." Alex's variance question requires "where did scores land?" before reading per-row data. | Histogram in Results panel with bin slider and no-score toggle. Renders alongside Task Coverage data, not replacing it. |
| Invalidate Job in Results header | ~95% Rerun/Invalidate daily utility. Burying Invalidate in overflow adds a click to the highest-frequency recovery path. | Filled destructive button in Results panel header, contextual to the data it invalidates. Absent from page-header overflow. |
| Filled status pill on destructive states | Errored / Failed / Invalidated are the states where Alex's diagnostic urgency is highest. Quiet outline pills bury the signal. | Filled (solid + white text) for Failed, Errored, Invalidated, Cancelled. Subtle alpha-tinted for Completed, Running. |
| "No results yet" misleading copy | "6 invalidated · Show" exists in production alongside "No results yet" — contradictory state. | Results block copy is state-accurate: "All N runs invalidated. Re-validate or re-run to produce results." |

---

## §14 — Open questions

1. **Multi-model jobs — descriptor strip and Results panel pattern.** "N models" chip in descriptor strip is specced; the model-breakdown inline view it links to is undefined. Confirm platform support for the explicit N-model Results panel row layout vs. the current "+1" collapsed pattern.

2. **QA Agent runner persona scope.** Currently surfaces on every job's Overview. Is this Riley's QA workflow leaking onto Alex's primary forensic surface? Options: (a) keep as-is, (b) move below Description (lower priority), (c) gate by job purpose or user role, (d) move to a separate QA tab. Requires Operator decision.

3. **Comments — async vs. real-time.** Are comments a lightweight async thread (like Linear) or a real-time collaborative surface? Affects: threading model, notification surface, presence indicators. Currently specced as async append-only.

4. **Description authoring — pre-run intent vs. post-run annotation.** If authored at job creation, the description is intent. If authored here, it is forensic annotation. Both are valid; the edit affordance changes (inline edit here vs. read-only with "edit in job creation" hint). Requires Operator decision.

5. **Live streaming logs for Running jobs — Logs tab, side drawer, or inline Overview block?** Specced here as an inline Live tail block in Overview. A dedicated Logs tab would expose full log history (not just tail) and be accessible on non-Running jobs. Recommend confirming whether orchestration/scheduler logs at job level are distinct from trace-level logs.

6. **Improve recipe — Train threshold.** "Need 10 more traces" — where does 10 come from? Is it tunable per job type (DPO vs. distillation vs. RLHF)? Is it Operator-configurable? Currently specced as an exact displayed integer; the source of the integer is undefined.

7. **Refine environment recipe step.** "→ Open env" is specced as a chip link. Does this navigate to the Environment detail page, open an Environment edit modal, or initiate an Environment fork? The affordance shape differs for each — fork implies a new primitive; edit modal implies in-place mutation. Out of scope for this wireframe but the link target must be confirmed before the screen-spec phase.

8. **Task Coverage legend semantics — precise definitions.**
   - "Scored" = a Run completed and a Grader returned a float score.
   - "No score" = a Run completed but no Grader scored it (Grader errored or not configured).
   - "Not run" = no Run was attempted for this Task in this Job.
   - "Invalidated" = one or more Runs were explicitly invalidated (by user or system).
   Confirm these definitions. "No score" vs. "Not run" is the most confusing pair — may need a tooltip.

9. **Invalidated runs vs. tasks — Run multiplier. RESOLVED.** §4.2 legend now uses option (b): "Invalidated" at the Task square means all Runs on that Task were invalidated. A Task with partially-invalidated Runs still shows its surviving-Run status. Per-Task Run breakdown shown in hover tooltip. The one-square-per-Task (not per-Run) visual is kept for bounded square count at all Job sizes. Platform confirmation still needed: confirm that Run is the per-Task execution unit and a Job can produce N Runs per Task by config (affects Traces tab row count — separate open question there).

10. **Compare-to-baseline — what is "baseline"? RESOLVED.** Resolved in D5 (revision pass 2026-06-14): sequence = operator-pinned IF set → last-passing Job on this Taskset → block suppressed. "Pin as baseline" action lives in Completed Job overflow (D9). No residual open question on the definition itself. Platform confirmation needed: can the platform surface "last-passing Job on this Taskset" as a query at render time? If not, fallback needs a different implementation path (flag at screen-spec phase).

11. **Promote / Tag as Release Candidate — action target.** Is this job-level metadata, model-level metadata, or taskset-level metadata? The action surface and confirmation dialog differ for each. Currently placed in the overflow menu on Completed variants without a confirmed target.

12. **Logs vs. Traces vocabulary.** Model detail separated "Traces" from "Gateway Logs." At Job level: are there gateway logs (orchestration/scheduler logs for the Job run) distinct from per-Run Traces? If yes, does a Logs tab belong here? If no, Traces is the only log surface. Confirm before sibling-file spec.

13. **"Automate this analysis" affordance near failure clusters.** Q&A note: engineers initially copy-paste trace JSON into external LLMs to triage failure clusters, then program an LLMJudgeGrader. The Job detail page is the natural location for a "turn this triage into a Grader" affordance. Flagged as an open question — do not invent the surface in this wireframe, but note the placement candidate (below Tool Usage, after failure cluster is visible).

14. **Usage tab activation threshold.** Currently proposed as "1k+ tasks." Is this the right threshold? Consider: at 300 tasks, Tool Usage in Overview is still manageable but may crowd on narrow viewports. Confirm or adjust.

15. **Re-eval purpose — Training-output vs. prompt-regression distinction.** The §9 purpose cross-cut gives Alex (Training-output Re-eval) Promote/Tag-RC overflow actions and withholds them from Sam (prompt-regression Re-eval). This requires the platform to distinguish between the two Re-eval variants — either via a Job metadata field set at creation time (e.g., `re_eval_source: training_output | prompt_regression`) or via actor inference (Alex-role vs. Sam-role users). If the platform cannot distinguish, the safe fallback is to **omit** Promote/Tag-RC from all Re-eval Jobs (conservative; Sam never sees them; Alex misses the shortcut on Re-eval but retains it on Training Jobs). Confirm before screen-spec phase.

16. **By Task aggregation default: best / avg / median?** D11 specifies `By Task` as the default toggle state and defers aggregation method. Production shows aggregate scores but does not surface the method name in the UI. Options: (a) best-of-N (optimistic; rewards any successful run), (b) mean (unbiased; diluted by outliers), (c) median (robust; preferred for skewed distributions). This is a platform-level analytical decision — confirm before screen-spec phase so the histogram Y-axis label and the table's "Score" column header can be accurate.

17. **Score Distribution bin range defaults.** Specced as 3–10 bins, default 5. Confirm: (a) whether the bin edges are equal-width or user-defined, (b) whether 3–10 is the right range for the expected score distributions (0.0–1.0 float range with N/A bin), (c) whether the N/A bin is always pinned as the leftmost bin regardless of slider setting.

18. **Staleness indicator polling interval for Running jobs.** D15 defers the polling interval. Confirm: how frequently should `↻ Updated <time>` refresh for a Running job — polling the data endpoint or a lightweight "last-event" endpoint. If SSE / WebSocket is available for job-level events, interval polling is not needed. Confirm the data freshness mechanism before screen-spec phase.

19. **Invalidated state Invalidate button label.** D13 notes that on an already-Invalidated job, the Invalidate Job button may read `Re-invalidate` if the platform supports invalidating an already-invalidated job (e.g., updating the invalidation reason). Confirm whether re-invalidation is a supported operation, or whether the button should be absent on the Invalidated status variant.

---

## Drift log

| Decision | Deviation from production | Rationale |
|---|---|---|
| Status pill location | Production: status inside Details panel. Wireframe: title row. | Above-the-fold diagnostic requirement — persona job #1. |
| Configuration visibility | Production: collapsed `▶ Configuration`. Wireframe: always visible `<dl>`. | Reproducibility is Alex's repeat-job trigger — collapse hides the action-critical data. |
| "No results yet" copy | Production: "No results yet" even when 6 runs are invalidated. Wireframe: "All N runs invalidated. Re-validate or re-run to produce results." | Exact personality principle — the copy was factually incorrect for the current state. |
| Multi-model "+1" | Production: hides second model behind "+1". Wireframe: explicit N-model layout in descriptor strip and Results. | Exact personality principle — "+1" is a hedge, not a value. |
| Right-slot CTAs | Production: always `↓ Export` + `< Share`. Wireframe: status-conditional primary CTA matrix. | Status-dependent action set is a forensic necessity; Export/Share are overflow, not primary. |
| Tool Usage tab placement | Production: Tool Usage inline in Overview always. Wireframe: in Overview for <300 tasks, conditional Usage tab at 1k+ scale. | At RC regression scale, Tool Usage would displace the diagnostic spine (Task Coverage + Recipe). |
| Recipe sidebar Step 3 — persona gate (revision pass 2026-06-14) | Prior pass: Train and Refine environment surfaced unconditionally on all non-Running statuses. Revised: Step 3 gated on persona × job-purpose per D7 matrix. Sam omits Step 3. Riley shows Refine only. Alex shows Train (threshold-gated) on Training and Eval purposes. | Domain review FAIL #1 — "Sam RL creep" and "Riley collapsed into Alex" anti-patterns. |
| Baseline definition (revision pass 2026-06-14) | Prior pass: §14 #10 enumerated three options without choosing. Revised: D5 resolved as sequence (operator-pinned → last-passing → suppressed). "Set baseline" CTA from empty state removed; action moved to Completed Job overflow as "Pin as baseline for [taskset]". | Domain review FAIL #2 — "baseline" undefined in a load-bearing Completed-state block. |
| §9 purpose cross-cut (revision pass 2026-06-14) | Prior pass: Promote model + Tag as Release Candidate in Completed overflow for all jobs regardless of purpose. Revised: proper Eval/Training/Re-eval sub-table; Promote/Tag-RC scoped to Training (and Training-output Re-eval by Alex only). Eval Jobs never carry Promote/Tag-RC. | Domain review FAIL #3 — Eval Jobs don't produce a model artifact to promote; Sam's Re-eval doesn't yield model promotion rights. |
| "Invalidated" legend semantic (revision pass 2026-06-14) | Prior pass: "Invalidated" as a Task-level state without defining the Run-to-Task aggregation rule. Revised: "Invalidated" at Task altitude = all Runs on this Task were invalidated. Hover tooltip shows per-Task Run breakdown. | Domain review W3 (near-FAIL) — Run is the invalidation unit; Task legend must specify aggregation. |
| Description empty state (revision pass 2026-06-14) | Prior pass: "Add description..." ellipsis placeholder. Revised: "Description  [Add]" — label + action, no hint copy. | Domain review W2 — ellipsis placeholder is encouragement copy; anti-personality drift. |
| Comments empty state (revision pass 2026-06-14) | Prior pass: "No comments yet. Start the conversation." Revised: "No comments." | Domain review W1 — "Start the conversation" is encouragement copy; personality.md anti-pattern. |
| Configuration collapsed by default (revision pass 2026-06-14-v3) | Prior spec (D2): always-visible `<dl>`, no collapse toggle. Revised: collapsed by default behind `▶ Configuration` disclosure. | Production-derived correction from image-cache `10.png`. Prior rationale ("reproducibility on every visit") was wrong — Alex expands Config only when reproducing or comparing, not on every visit. Config is reference content, not scan signal. |
| H1 Runs/Task suffix (revision pass 2026-06-14-v3) | New addition: D10. Prior spec had no sample-size signal in the title row. | Production shows `Batch Run: 4 tasks (3 times)` — the `(3×)` suffix answers Alex's first-scan variance question before any score is read. |
| By Trace / By Task aggregation toggle (revision pass 2026-06-14-v3) | New addition: D11. Prior Results block had no per-trace vs. per-task lens switch. | Production shows `[By Trace] [By Task]` toggle. Required for multi-run jobs where Alex's analytical question is lens-dependent. Aggregation default (best/avg/median) deferred to §14 #16. |
| Score Distribution histogram (revision pass 2026-06-14-v3) | New addition: D12. Prior spec had a placeholder "Score distribution visualization" without anatomy. | Production has histogram with bin slider and `Treat no-score as 0%` toggle. Anatomy now fully specced in §4.5. |
| Invalidate Job placement (revision pass 2026-06-14-v3) | Prior spec: `Invalidate` in page-header overflow menu. Revised: filled destructive button in Results panel header; removed from all page-header overflow entries across §9. `Copy ID` takes its slot in page-header overflow. | Production places Invalidate next to Results data (contextual). Per D13 — ~95% rerun/invalidate frequency; burying it in overflow penalizes the most common recovery flow. |
| Status pill visual weight (revision pass 2026-06-14-v3) | New addition: D14. Prior spec treated all status pills visually equivalently. Revised: filled (solid + white) for Failed, Errored, Invalidated, Cancelled; subtle alpha-tinted for Completed, Running. | Production shows `× ERROR (100% failed)` as a filled red pill. Diagnostic urgency demands visual weight on destructive states. |
| Staleness indicator (revision pass 2026-06-14-v3) | New addition: D15 / §3.2. Prior spec: `Updated <relative-time>` without `↻` prefix or `aria-live` behavior. Revised: `↻ Updated <relative-time>` with live-updating for Running jobs, static for terminal states, hidden on mobile. | Production shows `↻ Updated less than a minute ago`. Earnest personality principle — surface freshness honestly. |

---

## Out of scope

- Motion (durations, easings, reduced-motion) — motion-designer layer.
- Color token assignments for status states — design-tokens phase.
- px / rem dimensions — design-tokens / screen-spec phase.
- Tailwind class names — engineering layer.
- Trace viewer detail page — separate screen spec.
- Model detail page / training curve — separate screen spec.
- Environment detail / edit / fork — separate screen spec.
- Job creation flow — `docs/design/screens/jobs-new.wireframe.md`.
- Grader authoring / LLMJudgeGrader picker — Scenario editor scope.
- User role / permissions model for Comments, QA Agent runner, Promote/Tag RC.
- Notification surface for Comments.
- Riley's bulk QA export and quality-report delivery — Riley's separate path.
- Compliance chrome (audit-log export, BAA language) — Sam's path only.
