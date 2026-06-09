# Model Detail Page — Screen Wireframe (`/models/[model-id]`)

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome. This wireframe covers the `MAIN` region only.
- [`docs/design/screens/models.wireframe.md`](./models.wireframe.md) — index page; IA conventions, header pattern, table density, filter chip pattern, provider-disambiguation language, and tablet-collapse rules inherited here.

Visual reference: operator-supplied production screenshots of the current hud.ai model detail page — Jun 2026. Patterns inherited only where they pass the persona/job test; current page is *not* treated as the spec.

---

## HUD-side question answered

### What does each persona DO on this page, and why?

**Alex (Frontier RL Researcher — PRIMARY)** arrives here from four entry paths, each with a distinct job:

1. **From the Models index** — picking a model for an upcoming Job. He wants: API name (paste into `hud rl run -m`), trainable flag (can he fine-tune it?), provider routing, HEAD checkpoint. Sub-15-second landing scan.
2. **From a Training Job detail page** (model used) — he already ran a Job; he is now in eval-forensics mode. He wants: how is this model performing across the tasksets I ran it on? Which eval regressed after the last checkpoint?
3. **From a Checkpoints list or comparison view** — RL phase 4 (training loop). He wants: score trajectory across training steps; which checkpoint is HEAD; can he promote a different one?
4. **From Trace detail** (the model that ran the trace) — Phase 5 (reward-hack inspection). He is here as ambient context, not the primary destination; he will quickly navigate back.

Alex's dominant jobs on this page, weighted by frequency:
- **API name copy** — highest frequency, sub-second action, called many times a week
- **Eval forensics scan** — high frequency when tracking regression across tasksets
- **Checkpoint trajectory** — high frequency during RL training runs
- **Fork to start a new fine-tune** — moderate frequency (once per project setup)
- **Run a Job against this model from the Results tab** — moderate frequency

**Sam (Applied Agent Engineer — SECONDARY)** arrives here from the index (model selection for production config) or from a regression eval result. His jobs:
- Copy API name → paste into SDK config (same as Alex, same frequency weight)
- Check model performance on his specific taskset (Results tab, evaluated rows only)
- Audit inference logs when Gateway usage is questioned (Logs tab)
- Compare this model's regression against a prior version on a frozen taskset

Sam's anti-patterns on this page: does NOT need training-curve surfaces, Checkpoint promotion controls, Fork for RL, or reward-weight editors. These belong to Alex.

**Riley (RL Environment Vendor — TERTIARY)** visits this page rarely and incidentally — checking which base models clients are likely running against his environments. No primary jobs here. Design for Alex and Sam; Riley is a sanity gate.

---

## Decision log — the 10 required decisions

### Decision 1: Results table density

**HUD-side question:** Alex arrives at this page to scan how a specific model performs across tasksets he cares about. A table mixing evaluated rows with rows that have never been run produces a signal-to-noise problem: `0/367` rows with dashes everywhere are visually indistinguishable from errors. The question is whether unevaluated tasksets belong in this view at all, and if so, where.

**Choice: Split into two sections — "Evaluated (N)" anchored at top, "Not yet evaluated" collapsed below a disclosure.**

The evaluated section renders immediately with full column data. The "Not yet evaluated" section is a collapsed disclosure row: "N tasksets not yet run on this model — [Show all]". Clicking it expands a simplified list with only Taskset name and a "Run" button per row. Unevaluated rows do not get the score columns at all — they are a different thing (an invitation to run, not a result) and rendering empty dashes in score columns treats them as if they failed, which is misleading.

**Persona reason:** Alex's eval forensics job is scanning *results* — the evaluated section is the entire signal. The unevaluated rows are noise during a forensics scan but become signal when he wants to expand coverage. The collapse handles both without compromise. Sam never needs the unevaluated rows during a regression check.

### Decision 2: Bucket column semantics

**HUD-side question:** The current columns labeled `0-99%`, `5-75%`, `15-40%` are opaque to a new reader and likely represent reward-band bins or score-distribution percentile ranges. A user cannot tell whether "0-99%" means "tasks scored anywhere from 0 to 99" (nearly all tasks) or "tasks in the 0–99th percentile" or something else entirely.

**Choice: Replace range-labeled bin columns with semantically named distribution columns. Use three fixed bands: Pass (≥0.75), Partial (0.25–0.74), Fail (<0.25).**

The threshold values are presented as axis labels on the distribution sparkline cell, not as column names. The column header becomes "Distribution" (one column, not three). The sparkline shows the count breakdown across the three bands inline, with the band definitions disclosed in a column-header tooltip.

**Persona reason:** Alex reads reward as a float — he knows what 0.75 means. Named bands (Pass / Partial / Fail) communicate the same information as opaque range labels but are immediately legible. "0-99%" as a column header tells him nothing; "Pass (≥0.75)" tells him the threshold his grader is implicitly using. Sam, coming from a deployment decision context, needs even cleaner signal — a distribution showing pass/partial/fail proportion is exactly the eval summary he needs.

### Decision 3: API name surfacing

**HUD-side question:** Alex copies the API name (`claude-sonnet-4-6`, `gpt-5.4-0614`) every time he configures a Job or writes an SDK call. The current production page buries it in Settings → Advanced, behind two clicks. This is a high-frequency, sub-second action being treated as a rare administrative action.

**Choice: Surface the API name inline in the header metadata strip, with a copy button always visible.**

Position: below the model name in the header, alongside provider and status. Format: monospace, same copy-button pattern established in the Models index (`[model-id] [⎘]`). This is not duplicated in Settings; Settings can reference it for completeness but the primary affordance is the header.

**Persona reason:** Alex pastes the API name into `hud rl run -m` and into SDK config several times per session. This is the most frequent action on the page. Burying it behind a Settings tab adds two clicks to a sub-second action that he needs dozens of times. The index page already established the pattern: model-id is always visible with a copy button. The detail page inherits this.

### Decision 4: Header metadata strip

**HUD-side question:** What does Alex need to see the moment he lands on this page, before clicking any tab? The strip must carry load-bearing info for the landing scan without becoming a dashboard of everything.

**Choice: Two-altitude header — title row (model name + status pill + primary CTA) above a static-descriptors strip (provider · API slug · trainable · HEAD).**

**Title row** — carries the model name (h1), the status pill immediately to the right of the name, and the primary CTA at the far right.

For **all variants** the title row reads:
`[provider icon]  Model Name   [● Available]   (far right: [Fork & Train] if trainable)`

**Strip below** — carries only static descriptors (what is this and how do I integrate?). Status is absent from the strip.

For **base trainable models**:
`[Provider chip]  ·  api-name-slug [⎘]  ·  ✦ Trainable`

For **base non-trainable models**:
`[Provider chip]  ·  api-name-slug [⎘]`
(trainable chip absent — omission is the signal)

For **fine-tuned models** the HEAD slot is in the strip because HEAD ≠ API name:
`[HUD glyph]  ·  api-name-slug [⎘]  ·  ✦ Trainable  ·  HEAD: step-N [⎘]`

For **proxied deployments**:
`[Anthropic · Bedrock]  ·  api-name-slug [⎘]`

Rules governing each field:
- **Status pill** — `● Available` / `● Unavailable`. Small pill-style badge in the title row, immediately right of the model name. Inherits existing available green dot color treatment from Models index. Runtime signal only — not in the strip.
- **Provider chip** — text label for vendor models (`[Anthropic]`, `[OpenAI]`, `[Google]`, `[xAI]`). For HUD-org models: icon-only HUD glyph (no text — dashboard chrome already conveys HUD context). For proxied variants: two-part chip `[Anthropic · Bedrock]`.
- **API name** — monospace slug + copy button `[⎘]`. Always visible in the strip.
- **Trainable chip** — `✦ Trainable` (icon + word, no colon, no label-value pattern). Present only when trainable. Non-trainable models: absent. Do not show `✦ Not trainable` or `✦ —`.
- **HEAD slot** — present only for fine-tuned models (HEAD ≠ API name). Label `HEAD:` is kept because the bare checkpoint value (`step-8192`) needs the label to be interpretable. Copy button `[⎘]` on the checkpoint ID. Base models and proxied models: HEAD slot absent.

Not included in the strip: total evaluated tasksets, total credits spent. Rationale:
- **Total evaluated tasksets** — available in the Results tab count badge. Moving it to the header creates duplication.
- **Total credits spent** — not relevant to any of Alex's jobs on this page. Alex monitors credits from the sidebar widget, not per-model.

**Persona reason:** The two-altitude shape separates the runtime question (can I call this right now?) from the integration questions (what is this, what do I paste?). Alex's sub-15-second landing scan gets the availability signal at title height — the same place his eye lands for the model name — while the strip below remains a clean reference row for provider, slug, and trainable state.

*Revision note (Jun 2026): Strip reduced from five fields to four for base models. HEAD slot dropped on base models because HEAD === API name by construction — duplicate ink. Trainable label-value pattern (`Trainable: ✓`) replaced with icon-chip (`✦ Trainable`) to normalize the register: all fields are now chip-nouns, no mixed label-value pairs. Non-trainable models drop the chip entirely — absence is the signal, consistent with the absent Fork & Train CTA.*

*Revision note (Jun 2026): Header restructured from single strip to two altitudes. Status (`● Available`) answers "can I call this right now?" — a runtime question — and moved to the title row as a pill next to the model name. Provider, slug, and trainable answer "what is this and how do I integrate?" — static descriptors — and remain in the strip below. Flattening both into one strip blurred the altitudes; the two-altitude shape separates them.*

*Revision note (Jun 2026): Two additive changes to Variant C (org fine-tuned). (1) Privacy indicator changed from bare text `Private` to a lock-pill `🔒 Private` — small dark pill with lock glyph, same chip register as the `● Available` status pill — for visual consistency with the lock treatment on the Models index. The pill sits in the title row between the model name and the `● Available` pill; the two coexist because they answer different questions (access vs runtime). (2) Lineage secondary line expanded from single-link `Trained from: [job]` to two-link `Forked from: GPT-5 (gpt-5-2025-08-07)  ·  Trained via: training-job-20260601-webagent` — base model link on the left, training job link on the right, separated by middle dot. Alex's landing scan now resolves "what is this forked from?" without a hop into the job.*

### Decision 5: Trainable affordance

**HUD-side question:** Should the page show a "Train Model" button for non-trainable models (currently disabled with a tooltip "This model is not trainable and cannot be trained"), or hide it entirely?

**Choice: Hide the "Train Model" button for non-trainable models. The Trainable field in the header metadata strip conveys the capability flag; no button needed.**

For trainable models: "Fork & Train" primary CTA appears in the page header right slot. This is the correct action label — "Fork" is the right primitive (you fork the base model to begin fine-tuning, producing a new private Model), "Train" clarifies what the fork is for.

For non-trainable models: "Fork & Train" is absent. The header strip shows `Trainable: —`. No disabled button, no tooltip.

**Persona reason:** A disabled button with a tooltip "this cannot be done" is noise — it draws attention to a dead end. Alex and Sam have both read the index page, where Trainable is a visible column. They arrive at the detail page knowing the trainability status. The strip provides the signal; the absent button creates no confusion. The "Spare" personality principle directly supports this: nothing on screen that has no function.

### Decision 6: Checkpoints tab — base-model state (non-fine-tuned)

**HUD-side question:** A non-fine-tuned base model (GPT-5, Claude Sonnet 4.5) has exactly one checkpoint: HEAD = the current release. The current page shows this as a single card on an empty canvas, which reads as missing content.

**Choice: Replace the checkpoint canvas with a structured metadata view for the base-model state. No card, no canvas.**

The base-model Checkpoints tab layout:
```
HEAD checkpoint
────────────────────────────────────────
  Checkpoint ID:   [model release version string]  [⎘]
  Status:          BASE (not fine-tuned)
  Released:        [date]

  This is the base model checkpoint. To create a training checkpoint,
  run `hud rl run <taskset> -m [model-id]`.
  (monospace CLI command, copyable)
  Read the docs ↗
```

This is not an empty state — it is a factually complete view for a base model. The copy is matter-of-fact, not apologetic. The CLI command is the standard empty-state pattern from the models index.

**Persona reason:** The current "single card on empty canvas" reads as if something is missing or broke. For a base model, there is nothing missing — HEAD IS the only checkpoint that can exist. The structured metadata view presents this honestly without implying absence. The CLI command (Earnest personality principle) tells Alex exactly what to do if he wants checkpoints.

### Decision 7: Checkpoints tab — fine-tuned model state

**HUD-side question:** A fine-tuned model (produced by `hud rl run`) has 5–20 checkpoints across training steps. Alex's job is: understand the score trajectory, decide which checkpoint to promote as HEAD, and copy the checkpoint ID for use in a subsequent Eval Job.

**Choice: Checkpoints tab shows a score-over-training-step sparkline chart at top, then a table of checkpoints below.**

Chart: x-axis = training step (exact integers), y-axis = score (the eval score on the baseline taskset, if one was run at each checkpoint). Clicking a point on the chart scrolls the table to that checkpoint row and highlights it.

Table columns: `STEP` · `CHECKPOINT ID` (copy button) · `SCORE` · `TASKSET` · `CREATED` · `HEAD` (badge on the current HEAD row) · `[ Set HEAD ]` (action button, all non-HEAD rows).

Table default sort: step descending (most recent at top). HEAD checkpoint row visually distinguished (e.g., bold ID, HEAD badge).

Score column: the eval score from the most recent Eval Job run against this checkpoint on the taskset most recently used. If no eval has been run for a checkpoint, show `—` (not 0, not "no score" — `—` is honest).

**Persona reason:** Alex's "which checkpoint do I deploy?" job (Phase 4) requires two things: seeing the trajectory (is the score improving? did it regress at step 3072?) and acting on it (promote a checkpoint to HEAD). The chart gives him the trajectory at glance altitude; the table gives him the action at deep altitude. These are exactly the two altitudes the personality doc specifies. The Set HEAD action must be inline on each row — not behind a modal.

### Decision 8: Tab taxonomy — Traces vs Logs

**HUD-side question:** The current tabs include both "Traces" and "Logs." A fresh user cannot distinguish them from labels alone. The risk is that Alex navigates to Traces expecting inference logs and vice versa, or that he never discovers one because the labels are too similar.

**Choice: Rename tabs to "Traces" and "Gateway Logs." Keep them separate (not merged).**

Rationale for keeping separate: the two surfaces are fundamentally different artifacts.
- **Traces** = per-Run recordings of agent task execution through HUD's eval harness (tool calls, arguments, payloads, prompt, response, reward signal). Produced by Eval or Training Jobs. The "load-bearing UX" per personality doc.
- **Gateway Logs** = raw inference request/response records from the Model Gateway (`inference.hud.ai`). Produced by any inference call routed through the gateway. Sam's incident-response artifact.

Merging them would harm both use cases: Alex drilling into a reward-hack trace needs the structured task-execution view; Sam auditing an inference log needs the raw request/response record. They are not the same thing.

"Gateway Logs" (not just "Logs") disambiguates from Traces in context. The subtitle of the Gateway Logs tab can carry: "Raw inference requests routed through the Model Gateway."

**Persona reason:** The distinction is load-bearing for both Alex (Traces = Phase 5 forensics tool) and Sam (Gateway Logs = incident-response artifact). Blurring the label creates navigation confusion that costs Alex the one-click drill path the personality doc requires. "Gateway Logs" is the honest label — these are logs of gateway-layer inference, not of agent task execution.

### Decision 9: Model variant matrix

Four variants must work without sub-pages:

**Variant A — Trainable base (e.g., GPT-5, open-weight model capable of fine-tuning):**
- Title row: `[OpenAI icon] GPT-5   [● Available]   [Fork & Train]`
- Strip: `OpenAI  ·  gpt-5-2025-08-07 [⎘]  ·  ✦ Trainable`
- Checkpoints tab: base-model state (Decision 6) with CLI command
- Results tab: evaluated tasksets section (may be empty if never run)

**Variant B — Non-trainable base (e.g., Claude Sonnet 4.5):**
- Title row: `[Anthropic icon] Claude Sonnet 4.5   [● Available]`
- Strip: `Anthropic  ·  claude-sonnet-4-5 [⎘]`
- Header right: no primary CTA (no "Fork & Train")
- Checkpoints tab: base-model state (Decision 6), CLI command not shown (not trainable)
- Results tab: populated or empty per eval history

**Variant C — HUD org fine-tuned model (e.g., rl-webagent-v2, private):**
- Title row: `[HUD glyph] rl-webagent-v2  [🔒 Private]   [● Available]   [Fork & Train]`
- Strip: `[HUD glyph]  ·  hud-rl-webagent-v2-20260601 [⎘]  ·  ✦ Trainable  ·  HEAD: step-8192 [⎘]`
- Two-link lineage secondary line below the strip: `Forked from: GPT-5 (gpt-5-2025-08-07)  ·  Trained via: training-job-20260601-webagent`
- Checkpoints tab: fine-tuned model state (Decision 7) — chart + table
- Visibility pill: `🔒 Private` in the title row — small dark pill with lock glyph + text, positioned between model name and `● Available` pill. Two pills coexist: `🔒 Private` (static access indicator) + `● Available` (runtime serving signal).
- Note: `[HUD]` text chip collapses to icon-only glyph; strip positional slot is preserved but the text "HUD" is dropped since dashboard chrome conveys org context.

**Variant D — Proxied deployment (e.g., Claude Sonnet 4.6 via AWS Bedrock):**
- Title row: `[Anthropic icon][Bedrock icon] Claude Sonnet 4.6 (Bedrock)   [● Available]`
- Strip: `Anthropic · Bedrock  ·  global.anthropic.claude-sonnet-4-6-bedrock [⎘]`
- Provider disambiguation: two-part chip `[Anthropic · Bedrock]` — same pattern established in the models index discussion. The provider field shows the model family (Anthropic) and the routing provider (Bedrock). This prevents the ambiguity of showing only "Anthropic" when the routing is through AWS.
- Trainable chip absent (non-trainable). HEAD slot absent (proxied, no training checkpoints).
- Checkpoints tab: base-model state
- No "Fork & Train" CTA (proxied deployments are not trainable via HUD)

### Decision 10: Trainable vs non-trainable layout shift

**HUD-side question:** Should the page restructure between trainable and non-trainable variants (e.g., Checkpoints tab hidden for non-trainable), or stay the same shell with the tab present but showing a base-model state?

**Choice: Keep the same tab shell for all variants. The Checkpoints tab is always present; its content adapts to the variant.**

Rationale: Hiding the Checkpoints tab for non-trainable models creates a layout shift that varies the navigation mental model. More importantly, the Checkpoints tab for a non-trainable base model is not useless — it shows the HEAD checkpoint and release version, which Alex needs before pasting the API name. The "empty canvas" problem (Decision 6) is solved by redesigning the base-model content, not by hiding the tab.

The Settings tab is similarly always present. The Trainable row in Settings is always shown with `Yes` or `No` — the tab does not restructure.

Exception: for Variant D (proxied deployment), if there is genuinely no head checkpoint information available for a third-party proxied model, the Checkpoints tab may show: "Checkpoint information is not available for proxied deployments routed through [Bedrock]. See the provider's release notes." This is factually honest and not an empty state.

**Persona reason:** The "Composed" personality principle says structural complexity is not exposed as navigation overhead. Varying the tab set between model variants adds cognitive overhead on navigation ("wait, why does this model have fewer tabs?"). The consistent shell is more composed. Alex already knows from the Trainable field whether the checkpoint content will be rich or sparse.

---

## 1. Shared layout note

The `MAIN` region is the content area to the right of AppShell's persistent sidebar. This wireframe does not redraw the sidebar, credits widget, or user chip.

```
┌─────────────────────┬─────────────────────────────────────────────────────────┐
│  SIDEBAR (AppShell) │  MAIN                                                   │
│  [see app-shell     │                                                         │
│   wireframe.md]     │  [MODEL DETAIL CONTENT — this file]                     │
│                     │                                                         │
└─────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Page header anatomy

The header is the same sticky pattern as the Models index, adapted for a detail page. The breadcrumb row provides back-navigation context.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER  (sticky)                                                           │
│                                                                                  │
│  ← Models  /  Claude Sonnet 4.6                                                  │
│  (breadcrumb — "← Models" links back to /models; current page name is plain)    │
│                                                                                  │
│  TITLE ROW                                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  ┌───────┐ │
│  │  [provider icon]  Claude Sonnet 4.6   [● Available]             │  │[Fork  │ │
│  │  (h1 / model name)                   (status pill, right of h1) │  │& Trai]│ │
│  └──────────────────────────────────────────────────────────────────┘  └───────┘ │
│                                                                                  │
│  STRIP (static descriptors only — one line, below title row)                     │
│  Base trainable:     [OpenAI]  ·  gpt-5-2025-08-07 [⎘]  ·  ✦ Trainable         │
│  Base non-trainable: [Anthropic]  ·  claude-sonnet-4-5 [⎘]                      │
│  Fine-tuned:         [HUD glyph]  ·  hud-rl-webagent-v2-20260601 [⎘]  ·  ✦ Trainable  ·  HEAD: step-8192 [⎘]  │
│  Proxied:            [Anthropic · Bedrock]  ·  slug [⎘]                          │
│  (provider chip · API name copy · trainable chip if trainable · HEAD if fine-tuned — NO status field) │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Breadcrumb:** `← Models` links to `/models`. Current page name (model name) is plain text, not a link. Provides back-nav without a browser back button dependency.
- **Provider icon:** same 14×16 colored chip pattern as the Models index. For proxied variants: `[Anthropic · Bedrock]` two-part chip.
- **Model name h1:** human-readable name. Not the API name.
- **Status pill:** `● Available` (green dot + text) rendered as a small pill immediately to the right of the model name in the title row, with a small gap. This is a runtime signal — it answers "can I call this right now?" — and belongs at title altitude, not in the strip. Inherits the existing `available` green color treatment from the Models index dot pattern.
- **Privacy pill (variant-conditional):** `🔒 Private` — small dark pill with lock glyph + "Private" text, same chip register as the status pill. Present only for org-owned private models (Variant C). Position: in the title row, after the model name, before the `● Available` pill. The two pills coexist because they answer different questions: `🔒 Private` is a static access indicator (who can see this model?); `● Available` is a runtime serving signal (can I call this right now?). Public models (Variants A, B, D): privacy pill absent.
- **Static descriptors strip:** single line below the title row. Fields separated by `·` (middle dot). Carries only static/integration descriptors — provider, API slug, trainable, HEAD. Status is absent from this strip — it has moved to the title row.
  - **Provider chip** — text label for vendor models (`[Anthropic]`, `[OpenAI]`, `[Google]`, `[xAI]`). For HUD-org models: icon-only HUD glyph (no text). For proxied: `[Anthropic · Bedrock]` two-part chip.
  - **API name** — monospace slug + copy button `[⎘]`. Always visible.
  - **Trainable chip** — `✦ Trainable` (icon + word). Present only when trainable. Non-trainable models: chip absent entirely.
  - **HEAD slot** — `HEAD: step-N [⎘]`. Present only for fine-tuned models (HEAD ≠ API name). Base and proxied models: absent.
- **Fork & Train CTA:** primary button, header right slot. Present only for trainable models (base or fine-tuned). Non-trainable: right slot is empty.
- **Fine-tuned model lineage line:** for Variant C (org-trained), a second metadata line appears below the strip with two clickable destinations: `Forked from: GPT-5 (gpt-5-2025-08-07)  ·  Trained via: training-job-20260601-webagent`. `Forked from:` links to the base Model detail page (human display name + API name in parens); `Trained via:` links to the Training Job detail page (job ID). Separator: middle dot. This answers both "what is this a derivative of?" and "how was it produced?" from a single landing scan without a hop.
- **Scroll behavior:** full page header (breadcrumb + title row + strip) stays sticky as tab content scrolls.

---

## 3. Tab bar anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TAB BAR  (sticky, below page header)                                            │
│                                                                                  │
│  [Results  12]  [Checkpoints  8]  [Traces]  [Gateway Logs]  [Settings]           │
│  ← underline variant; active = underlined; count badge on Results + Checkpoints  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Results** — count badge shows number of evaluated tasksets (N evaluated). Does not count unevaluated rows.
- **Checkpoints** — count badge shows number of checkpoints (0 for non-fine-tuned shows `1` for the HEAD base checkpoint, not 0).
- **Traces** — no count badge (count varies per filter; no default scope).
- **Gateway Logs** — no count badge (same reason).
- **Settings** — no count badge.
- **Default active tab:** Results. Rationale: the primary landing jobs (eval forensics, API name copy) are served from Results and the header strip respectively. Results is the most common destination.

---

## 4. Results tab

### 4a. Evaluated section (default state)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  RESULTS TAB — Evaluated section                                                 │
│                                                                                  │
│  FILTER ROW                                                                      │
│  [🔍] Search tasksets…  [Checkpoint ▾]  [Taskset ▾]                              │
│  [12 evaluated · Most recent ▾]  (right-justified)                               │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  TABLE                                                                           │
│                                                                                  │
│  TASKSET           │ CHECKPOINT  │ AVG SCORE │ DISTRIBUTION  │ TASKS  │ RUNS/TASK │
│  ────────────────────────────────────────────────────────────────────────────── │
│  [Taskset name]    │ step-4096   │  0.7341   │ [▓▒░ 60/28/12]│ 50/50  │  3        │
│  taskset-id [⎘]    │             │           │ P  Pa  F      │        │           │
│  [Taskset name]    │ HEAD        │  0.6128   │ [▓▒░ 45/35/20]│ 50/50  │  1        │
│  ...               │             │           │               │        │           │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Column definitions:**

| Column | Content | Notes |
|---|---|---|
| TASKSET | Taskset name (links to taskset detail) + ID (copy) | Same two-line cell pattern as Models index MODEL cell |
| CHECKPOINT | Checkpoint ID the result was run on; `HEAD` if run on HEAD | Monospace; copy button |
| AVG SCORE | Mean reward float, 4 decimal places (`0.7341`) | Right-aligned. Exact, per personality. |
| DISTRIBUTION | Stacked mini-bar: Pass (≥0.75) / Partial (0.25–0.74) / Fail (<0.25) counts, then `P · Pa · F` labels below | Distribution column replaces the opaque range-label columns. Hover tooltip: "Pass ≥0.75 · Partial 0.25–0.74 · Fail <0.25" |
| TASKS | `N/N` — tasks with a result / total tasks | `50/50` = all tasks ran. A Job that died early shows `23/50`. |
| RUNS/TASK | Number of repetitions per task (int) | Right-aligned |

**Filter row:**
- `Search tasksets…` — filters by taskset name within evaluated results.
- `Checkpoint ▾` — filter to a specific checkpoint. Default: all checkpoints. Useful for Alex comparing checkpoint-A vs checkpoint-B performance on the same tasksets.
- `Taskset ▾` — (redundant with search but useful for selecting from a list, not typing). Kept for discoverability.
- Result count + sort right-justified. Sort options: Most recent, Highest score, Lowest score, Name A–Z.

**Row actions:**
- Entire row (except copy buttons) links to the Taskset detail page for that eval result.
- Inline "View Traces" icon link on each row — navigates to Traces tab pre-filtered by this taskset + checkpoint combination. One click from Results row → Traces for that run. This is the drill path the personality doc requires.

### 4b. Not-yet-evaluated section (below evaluated section)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  NOT YET EVALUATED  (disclosure row, collapsed by default)                       │
│                                                                                  │
│  ▶  15 tasksets not yet run on this model  [Show]                                │
│     (collapsed; count is prominent; chevron toggles)                             │
│                                                                                  │
│  ── expanded ──────────────────────────────────────────────────────────────────  │
│  ▼  15 tasksets not yet run on this model  [Hide]                                │
│                                                                                  │
│  TASKSET                              │ TASKS   │                                │
│  [Taskset name]  taskset-id           │ 0/50    │ [Run ▾]                        │
│  [Taskset name]  taskset-id           │ 0/367   │ [Run ▾]                        │
│  ...                                  │         │                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- The disclosure row is the visual anchor: collapsed by default so it does not pollute the eval forensics scan. Alex sees only results by default.
- Expanded list shows minimal columns (Taskset name + task count + Run button). No score columns — they are not yet populated.
- `[Run ▾]` is a split button: default action launches a Job with defaults; dropdown allows checkpoint selection before running.
- This section is only shown if unevaluated tasksets exist. If the model has been run against all org tasksets, the section is absent (not shown as "0 tasksets not yet run").

### 4c. Results tab — empty state (no evals run yet)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE — Results tab, zero evaluated tasksets                              │
│                                                                                  │
│  No results yet.                                                                 │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────┐              │
│  │  hud eval <taskset> -m claude-sonnet-4-6               [⎘]    │              │
│  └────────────────────────────────────────────────────────────────┘              │
│                                                                                  │
│  Read the docs ↗                                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

CLI command uses the model's API name verbatim in the `<taskset>` / `-m` slot. Earned, earnest, spare.

### 4d. Results tab — loading state

Filter row renders. Table area shows skeleton rows: name bar (full Taskset column width) + ID bar (shorter) + score placeholder + distribution bar shape + tasks count bar. Same skeleton pattern as Models index rows.

---

## 5. Checkpoints tab

### 5a. Base-model state (non-fine-tuned, Variants A and B)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  CHECKPOINTS TAB — base model                                                    │
│                                                                                  │
│  HEAD CHECKPOINT                                                                 │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  Checkpoint ID    claude-sonnet-4-6-20261012  [⎘]                                │
│  Status           BASE                                                           │
│  Released         2026-10-12                                                     │
│  Source           Anthropic                                                      │
│                                                                                  │
│  This is the base model. Fine-tuning produces a new private Model                │
│  with training checkpoints.                                                      │
│                                                                                  │
│  hud rl run <taskset> -m claude-sonnet-4-6               [⎘]                    │
│  Read the docs ↗                                                                 │
│                                                                                  │
│  (CLI command shown only if Trainable: ✓; omitted for non-trainable models)     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- This is not an empty state — it is a complete base-model checkpoint record.
- "Status: BASE" is the informational signal that distinguishes this from a training checkpoint.
- Copy button on Checkpoint ID — Alex may need to paste this for provenance tracking.
- The CLI command and docs link appear only when `Trainable: ✓`. Non-trainable models omit this block entirely (the note would read "this model cannot be fine-tuned via HUD" — which adds no value over the Trainable flag already visible in the header strip).

### 5b. Fine-tuned model state (Variant C, populated)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  CHECKPOINTS TAB — fine-tuned model                                              │
│                                                                                  │
│  FILTER ROW                                                                      │
│  [Taskset for scores ▾: WebAgent Bench]   (which taskset's scores to show)      │
│  [8 checkpoints · Step ▾]  (right-justified; sort by step, score, or created)   │
│                                                                                  │
│  SCORE CHART                                                                     │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  Score over training steps (WebAgent Bench)                                │  │
│  │                                                                            │  │
│  │  1.0 ┤                                                 ●                  │  │
│  │  0.8 ┤                          ●        ●──────────                     │  │
│  │  0.6 ┤           ●──────●                              ● ← HEAD          │  │
│  │  0.4 ┤  ●                                                                 │  │
│  │  0.2 ┤                                                                    │  │
│  │      └────────────────────────────────────────────────────────────────    │  │
│  │       512   1024  2048  3072  4096  5120  6144  7168  8192  step          │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│  Clicking a point on the chart scrolls to and highlights the matching table row  │
│                                                                                  │
│  CHECKPOINT TABLE                                                                │
│                                                                                  │
│  STEP   │ CHECKPOINT ID       │ SCORE  │ TASKSET          │ CREATED    │         │
│  ─────────────────────────────────────────────────────────────────────          │
│  8192   │ ckpt-8192-a3f7  [⎘] │ 0.8341 │ WebAgent Bench   │ 2026-06-07 │ [HEAD] │
│  7168   │ ckpt-7168-b2e1  [⎘] │ 0.7912 │ WebAgent Bench   │ 2026-06-06 │ [Set HEAD] │
│  6144   │ ckpt-6144-c1d8  [⎘] │ 0.8102 │ WebAgent Bench   │ 2026-06-05 │ [Set HEAD] │
│  5120   │ ckpt-5120-d0c5  [⎘] │ 0.7641 │ WebAgent Bench   │ 2026-06-04 │ [Set HEAD] │
│  4096   │ ckpt-4096-e9b2  [⎘] │ 0.7823 │ WebAgent Bench   │ 2026-06-03 │ [Set HEAD] │
│  3072   │ ckpt-3072-f8a1  [⎘] │ 0.6490 │ WebAgent Bench   │ 2026-06-02 │ [Set HEAD] │
│  2048   │ ckpt-2048-g7f0  [⎘] │ 0.7201 │ WebAgent Bench   │ 2026-06-01 │ [Set HEAD] │
│  1024   │ ckpt-1024-h6e9  [⎘] │ 0.5903 │ WebAgent Bench   │ 2026-05-31 │ [Set HEAD] │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- **Chart:** score on y-axis (0.0–1.0), training step on x-axis (exact integers). Each data point is a clickable point that scrolls + highlights the corresponding table row. HEAD checkpoint is labeled on the chart.
- **"Taskset for scores ▾"** — which taskset's eval scores to display on the chart and in the SCORE column. Defaults to the most recently used taskset. Alex may want to switch tasksets to see how the trajectory looks on a different benchmark.
- **SCORE column:** the eval score from the most recent Eval Job run against this checkpoint. `—` if no eval has been run for a checkpoint. Not `0.0` — `—` is honest.
- **[HEAD] badge:** on the current HEAD checkpoint row. Not interactive.
- **[Set HEAD] button:** small, inline, on every non-HEAD row. Clicking triggers a confirmation: "Set checkpoint [ID] as HEAD for [model name]? Jobs and SDK calls using this model will use this checkpoint." Confirm / Cancel. This is a platform-level action with consequence (production routing changes).
- **Chart with no scores:** if no checkpoints have been evaluated, the chart area shows: "No eval scores yet. Run an eval Job against this model to see scores over training steps." The table still shows all checkpoints with `—` in the SCORE column.

### 5c. Checkpoints tab — loading state

Chart area shows skeleton placeholder (rectangular shimmer). Table shows skeleton rows same pattern as Results tab.

---

## 6. Traces tab

### 6a. Default state (some traces exist)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TRACES TAB                                                                      │
│                                                                                  │
│  FILTER ROW                                                                      │
│  [Checkpoint ▾]  [Taskset ▾]  [Outcome ▾: All · Scored · Failed · Errored]      │
│  [Density ▾: Compact · Comfortable]  [N traces · Most recent ▾]  (right)        │
│                                                                                  │
│  TRACE GRID                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  Job: eval-20260607-webagent [→]   Taskset: WebAgent Bench   50 runs     │    │
│  │  [■][■][□][■][■][□][□][■][■][□]  [■][■][■][□][■][□][■][■][□][■]        │    │
│  │  [■][□][■][■][□][■][■][□][□][■]  ...                                    │    │
│  │  ■ = scored  □ = failed  ◪ = errored  · = not run                       │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  [Load more traces]  (if paginated)                                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- The trace grid pattern matches the Job detail page — one square per Run, colored by outcome.
- Traces are grouped by Job. Each group shows the Job name (clickable link to Job detail), taskset name, and run count.
- Filters: Checkpoint narrows to traces from a specific training checkpoint. Taskset narrows to a specific taskset. Outcome filters to outcome states.
- Clicking any square opens the Trace for that Run inline (same one-click drill path established in personality doc).
- The density toggle (Compact / Comfortable) adjusts grid square size — same control from the current production page; carry forward as-is (it passes the persona test: Alex running 50-run jobs needs compact density to see all runs at once).

### 6b. Empty state — no traces yet

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE — no traces                                                         │
│                                                                                  │
│  No Traces yet.                                                                  │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────┐              │
│  │  hud eval <taskset> -m claude-sonnet-4-6               [⎘]    │              │
│  └────────────────────────────────────────────────────────────────┘              │
│                                                                                  │
│  Read the docs ↗                                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Filter row is still rendered (so the user can confirm it's not a filter problem). Empty state replaces the grid area only.

---

## 7. Gateway Logs tab

### 7a. Default state (logs exist)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  GATEWAY LOGS TAB                                                                │
│                                                                                  │
│  Subtitle: Raw inference requests routed through the Model Gateway.              │
│                                                                                  │
│  FILTER ROW                                                                      │
│  [Checkpoint ▾]  [User ▾: All users]  [Time ▾: Last 7 days]                     │
│  [N requests · Most recent ▾]  (right-justified)                                 │
│                                                                                  │
│  LOG TABLE                                                                       │
│  TIMESTAMP          │ REQUEST ID     │ USER         │ INPUT TOKENS │ OUTPUT TOKENS │ LATENCY  │ STATUS  │
│  ─────────────────────────────────────────────────────────────────────────────── │
│  2026-06-07 14:23   │ req-a3f7b [⎘] │ alex@acme    │ 1,243        │ 842           │ 1.2s     │ 200     │
│  2026-06-07 14:21   │ req-b2e1c [⎘] │ alex@acme    │ 987          │ 1,102         │ 1.8s     │ 200     │
│  ...                │               │              │              │               │          │         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- "Gateway Logs" label in the tab differentiates this from Traces. Subtitle row below the tab bar reinforces: "Raw inference requests routed through the Model Gateway."
- Filters: Checkpoint, User, Time range. These carry over from the current production page (they pass the persona test for Sam's audit job).
- Log rows: clicking a row expands the full request/response payload inline. This is Sam's incident-response action — "pull up the exact inference payload for this request."
- REQUEST ID has a copy button — Sam needs to share request IDs with ops or support teams.
- STATUS shows the HTTP status code: 200, 429 (rate limit), 500 (server error).

### 7b. Empty state — no inference logs

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE — no Gateway logs                                                   │
│                                                                                  │
│  No Gateway logs yet.                                                            │
│  Logs appear when this model is called through the Model Gateway API.            │
│                                                                                  │
│  Read the docs ↗  (→ docs.hud.ai/gateway)                                       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

No CLI command here — Gateway logs are produced by SDK/API calls, not CLI commands. The doc link is the actionable next step.

---

## 8. Settings tab

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SETTINGS TAB                                                                    │
│                                                                                  │
│  DISPLAY NAME                                                                    │
│  ┌────────────────────────────────────────────┐                                  │
│  │  Claude Sonnet 4.6                         │                                  │
│  └────────────────────────────────────────────┘                                  │
│  [Save]                                                                          │
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  METADATA                                                                        │
│                                                                                  │
│  Model ID        claude-sonnet-4-6                         [⎘]                  │
│  API Name        claude-sonnet-4-6                         [⎘]                  │
│  Provider        Anthropic                                                       │
│  Status          Available                                                       │
│  Routes          inference.hud.ai → Anthropic                                   │
│  Created         2026-10-12                                                      │
│  Trainable       ✓ Yes                                                           │
│  HEAD            claude-sonnet-4-6-20261012                [⎘]                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Settings is the administrative surface. Display Name is the only editable field (for private/org models).
- The Metadata section retains the fields from the current production page. API Name is shown here for completeness but is not the primary affordance — the header strip is.
- For public base models: Display Name editing may be disabled (can't rename GPT-5 for the org). Show the field as read-only with a note: "Display names for public models are set by the provider."
- Routes field: shows the gateway routing path, e.g., `inference.hud.ai → Anthropic`. For proxied variants: `inference.hud.ai → Anthropic via Bedrock`.

---

## 9. Variant cross-cuts (structural summary)

| Variant | Title row | Strip (static descriptors) | Header CTA | Checkpoints tab content | Notes |
|---|---|---|---|---|---|
| A — Trainable base | Model name · `● Available` pill | Provider · API name [⎘] · ✦ Trainable | `Fork & Train` | Base-model state + CLI command | GPT-5 class; HEAD slot absent (HEAD = API name) |
| B — Non-trainable base | Model name · `● Available` pill | Provider · API name [⎘] | (none) | Base-model state, no CLI command | Claude Sonnet 4.5 class; trainable chip absent; HEAD slot absent |
| C — Org fine-tuned | Model name · `🔒 Private` pill · `● Available` pill | HUD glyph · API name [⎘] · ✦ Trainable · HEAD: step-N [⎘] | `Fork & Train` | Fine-tuned state: chart + table | Produced by `hud rl run`; HEAD slot present (HEAD ≠ API name); two-link lineage below strip: `Forked from: [base model link]  ·  Trained via: [job link]` |
| D — Proxied deployment | Model name · `● Available` pill | Anthropic · Bedrock · API name [⎘] | (none) | Base-model state; note: "Checkpoint info unavailable for proxied deployments" | `global.anthropic.…` slug; trainable chip absent; HEAD slot absent |

---

## 10. States coverage

| Tab | Default (data) | Empty (no data) | Loading |
|---|---|---|---|
| Results | Evaluated section + collapsed unevaluated | Empty state with CLI command | Skeleton rows in table |
| Checkpoints (base) | HEAD checkpoint metadata | N/A (HEAD always exists) | Skeleton metadata |
| Checkpoints (fine-tuned) | Chart + table | Chart area note + table with `—` scores | Chart shimmer + skeleton rows |
| Traces | Grid grouped by Job | Empty state with CLI command | Grid area shimmer |
| Gateway Logs | Log table with filter row | Empty state with doc link | Skeleton rows |
| Settings | Display name + metadata | N/A | Field skeletons |

---

## 11. Responsive behavior

### Desktop — full layout

All columns visible in all tables. Metadata strip one line. Breadcrumb full text.

### Tablet — reduced

- Header metadata strip wraps to two lines (API name + HEAD on line 2).
- Results table: RUNS/TASK column hidden (recoverable from row expand). CHECKPOINT column shows abbreviated ID (truncated at 12 chars with tooltip).
- Checkpoints table (fine-tuned): TASKSET column hidden at tablet; applies to the filtered taskset from the filter dropdown. CREATED column hidden.
- Gateway Logs: INPUT TOKENS and OUTPUT TOKENS collapse to "Tokens: 1,243 / 842" in a single column.

### Mobile

- Breadcrumb collapses to `← Models` only (no current page name to save space).
- Metadata strip: vertical stack. Provider · Status · API name (copy) visible; Trainable and HEAD move to Settings.
- Results tab: table collapses to card list. Each card shows: Taskset name + Avg Score + Tasks count + Distribution mini-bar. Checkpoint and Runs/task hidden.
- Checkpoints chart: chart hides on mobile; table only.
- Gateway Logs: full table collapses to timestamp + status + expand arrow per row.

---

## 12. Keyboard and accessibility

- `<main>` wraps the detail MAIN region.
- `<h1>` = model name (not "Model Detail").
- Breadcrumb: `<nav aria-label="Breadcrumb">` wrapping `<ol>`.
- Metadata strip: `<dl>` with `<dt>/<dd>` pairs, or equivalent landmark-bearing structure. Copy buttons: `<button aria-label="Copy API name claude-sonnet-4-6">`.
- Tab bar: `role="tablist"`, each tab `role="tab"`, `aria-selected`, `aria-controls`.
- Results table: `<table>` with `<thead>` and `aria-sort`. "View Traces" link per row: `aria-label="View Traces for [taskset name] on checkpoint [ID]"`.
- Distribution sparkline bar: `aria-hidden="true"` on bar; accessible label on cell: `aria-label="Pass: 60, Partial: 28, Fail: 12"`.
- Checkpoints chart: `aria-hidden="true"` on the chart SVG; the table is the accessible data source.
- Set HEAD button: `aria-label="Set checkpoint [ID] as HEAD"`. Confirmation dialog is a `<dialog>` element with `role="alertdialog"`.
- Gateway Logs expand: `<button aria-expanded="false/true" aria-controls="log-row-[id]">`.
- Status badges: `<span role="status">` for live updates on model availability.

---

## 13. Persona notes by surface decision

| Decision | Alex (PRIMARY) | Sam (SECONDARY) | Riley (TERTIARY) |
|---|---|---|---|
| API name in header strip (always visible, copy button) | Load-bearing — he pastes this dozens of times per session | Equally load-bearing — copy into SDK config on first visit | Not relevant |
| Results table split: evaluated / unevaluated collapsed | Correct — eval forensics scan is signal-dense; unevaluated rows are noise by default | Correct — regression check wants the evaluated score, not the not-yet-run list | Acceptable |
| Distribution columns renamed (Pass/Partial/Fail) | Correct — float-literate, but the semantics of "0-99%" vs "Pass (≥0.75)" is immediately clearer | Correct — cleaner for deployment decisions | Not relevant |
| Fork & Train CTA hidden for non-trainable | Correct — no dead-end affordance; Trainable: — in the strip is sufficient | Acceptable | N/A |
| Checkpoints tab always present (base model state redesigned) | Correct — HEAD checkpoint info is relevant even for base models; consistent shell | Acceptable | N/A |
| Checkpoints tab fine-tuned: chart + table with Set HEAD | Load-bearing — Phase 4 checkpoint decision job | Out of scope for Sam (RL training is not Sam's workflow) | N/A |
| Traces tab one-click drill from Results row | Load-bearing — Phase 5 one-click drill path is the product's primary surface contract | Load-bearing for Sam's incident-response job | N/A |
| Gateway Logs tab renamed from "Logs" | Low value for Alex (he looks at Traces, not gateway logs) | Load-bearing for Sam — incident-response audit | Not relevant |
| Tab: Results default-active | Correct — his primary landing job (eval forensics) starts there | Correct — regression check starts there | N/A |

---

## 14. Open questions (do not block, flag for follow-up)

1. **"Set HEAD" confirmation scope:** when a user sets a new HEAD checkpoint, does this affect all org members using this model? If yes, the confirmation dialog must name this consequence explicitly. Confirm with platform team.

2. **Distribution thresholds:** the Pass ≥0.75 / Partial 0.25–0.74 / Fail <0.25 bands are proposed here. Are these org-configurable? Are they the right HUD-standard defaults? If the org's reward function returns only 0.0 or 1.0 (binary), the Partial band is always empty — should the distribution column degrade gracefully (show only Pass/Fail)? Confirm.

3. **Checkpoint score source:** the Checkpoints tab chart shows "score over training steps." What is the exact source? Is this the eval score from a HUD Eval Job, or the training reward curve? These are different things. Recommendation: Eval Job score (the grader reward on an external eval taskset), not the training reward signal. The training reward is on the Job detail page. Confirm.

4. **Gateway Logs checkpoint filter:** for non-fine-tuned models, checkpoint is always HEAD — the checkpoint filter in Gateway Logs is vacuous. Should it be hidden for non-fine-tuned models or kept for consistency? Recommendation: hidden when only one checkpoint exists.

5. **Proxied deployment variant — Checkpoint tab content:** for Variant D (e.g., `global.anthropic.claude-sonnet-4-6-bedrock`), if HUD genuinely has no checkpoint metadata from the provider, the proposed copy is "Checkpoint information is not available for proxied deployments routed through Bedrock." Confirm whether HUD exposes any checkpoint/version information from Bedrock at all.

6. **Fork & Train vs Fork separately:** the current production page has a `Fork` button separate from `Train Model`. The proposed merge into `Fork & Train` assumes the primary reason to fork a model is to train it. Is there a use case for forking without training? If yes, split CTA back: `[Fork]` (secondary) + `[Train Model]` (primary, enabled only when trainable).

7. **Results tab default sort:** proposed "Most recent" (by Job run date). Confirm if "Highest score" is a more useful default for Alex's forensics scan — he may prefer to see his best-performing tasksets first to understand where the model excels, and scan for regressions from there.

---

## Out of scope

- **Job launch modal/page** — the `Run ▾` button in the unevaluated section launches a Job; the Job composition flow is on the Jobs surface.
- **Trace detail view** — clicking a Trace square opens the trace; the trace viewer is its own wireframe.
- **Grader editor navigation from Trace** — contextual "Edit Grader" link from a flagged Trace (Phase 5 surface implication) is on the Trace detail wireframe.
- **Model Gateway configuration** — routing rules, fallback chains — admin surface.
- **Access request flow for locked models** — referenced at lock icon on the index; when a locked model's detail page is reached, it would show an access request panel. Not designed here.
- **Billing / Credits per-model attribution** — billing surface.

---

## Drift log

- **Distribution column replaces three separate range-labeled columns:** The current production page has three separate columns with opaque range labels (`0-99%`, `5-75%`, `15-40%`). This wireframe collapses them into a single Distribution column with a stacked mini-bar and named bands. Justified: the separate columns add horizontal width without adding interpretability. The named bands add semantics the opaque labels lack.

- **Tab bar: "Gateway Logs" not "Logs":** Renaming "Logs" to "Gateway Logs" is a vocabulary divergence from current production. Justified: the current label is ambiguous against "Traces"; the longer name carries the distinguishing context.

- **No "Train Model" disabled button for non-trainable models:** Current production shows a disabled CTA with a tooltip. This wireframe omits it. Justified: the Trainable flag in the header strip carries the capability signal without a dead-end button.

- **Checkpoints tab redesigned for base-model state:** The current production single-card canvas is replaced with a structured metadata view. Justified: the canvas reads as broken; a structured view reads as complete.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md), [`docs/product/alex-user-stories.md`](../../product/alex-user-stories.md). Visual reference: operator-supplied production screenshots of hud.ai model detail page — Jun 2026. Structural anchor: [`docs/design/screens/models.wireframe.md`](./models.wireframe.md). AppShell chrome: [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md).*
