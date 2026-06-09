# Taskset Detail Page — Screen Wireframe (`/tasksets/[taskset-slug]`)

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome (sidebar, credits widget, user chip). This wireframe covers the `MAIN` region only.
- [`docs/design/screens/tasksets.wireframe.md`](./tasksets.wireframe.md) — index page; back-navigation target for breadcrumb (`← Tasksets`). Tab-conditional patterns (visibility pill semantics, star / fork-count distinction, owner prominence) inherited here.
- [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md) — structural template for this wireframe. The breadcrumb + title row + descriptor strip header altitude is finalized in that file (§2); this page inherits it verbatim and adapts only the field set.

**Sibling tab files** (one per tab, inherit header + variant matrix from this anchor):
- [`taskset-detail-tasks.wireframe.md`](./taskset-detail-tasks.wireframe.md) — §5 Tasks tab
- [`taskset-detail-jobs.wireframe.md`](./taskset-detail-jobs.wireframe.md) — §6 Jobs tab
- [`taskset-detail-performance.wireframe.md`](./taskset-detail-performance.wireframe.md) — §7 Performance tab
- [`taskset-detail-settings.wireframe.md`](./taskset-detail-settings.wireframe.md) — §8 Settings tab (owner variants only)

Visual reference: operator-supplied production screenshots of the current hud.ai Taskset Detail page — Jun 2026. Images #26 (Settings tab), #27 (Performance tab), #28 (Jobs tab), #29 (Tasks tab), #30 (Overview tab), #31 (finalized model-detail heading reference). Patterns inherited only where they pass the persona/job test; current production is *not* treated as spec.

**Scope of this anchor file:** §1–§4 (shared layout, page header, tab bar, Overview tab) + §9–§14 (variant matrix, states coverage, responsive, a11y, persona notes, open questions, drift log). §5–§8 are cross-link stubs to sibling files.

---

## HUD-side question answered

### What does each persona DO on this page, and why?

**Alex (Frontier RL Researcher — PRIMARY)** arrives here from several entry paths, each with a distinct job:

1. **From the Tasksets index (Public tab)** — discovery loop. He's found a Taskset with an interesting leaderboard preview; he arrives to verify: how hard is it really? What's the top score? What Environment is it running against? What's the task count? Sub-15-second landing scan. This is Phase 1 / pre-eval orientation.

2. **From the Tasksets index (My Team tab)** — his own Taskset, post-`hud eval`. He ran a Job overnight; he wants to see the updated leaderboard position of his model relative to others he's already tested. Phase 1 follow-up, also Phase 4 loop return.

3. **From a Job detail page** (Taskset used in the Job) — he finished a training Job and is now checking reward against the Taskset the training target was defined on. He wants the model's current position in the leaderboard and the full history across that model's Jobs. Phase 4 (training loop) or Phase 5 (reward-hack).

4. **From the CLI handoff** — `hud eval <taskset-slug> -m <model>` reported a score; the web URL in the output lands here. He needs the trace drill path from the leaderboard row immediately.

5. **Leaderboard reference while authoring Scenarios** — Phase 3 (Scenario authoring). He wants to confirm that his authored Tasks land in the Tasks tab and that the Grader scores propagate to the leaderboard correctly.

Alex's dominant jobs on this page, weighted by frequency:
- **Leaderboard scan** — highest frequency; "who's winning, what's the gap, can my model beat the top?"
- **Trace drill from leaderboard** — high frequency when forensics mode is active (Phase 5)
- **Add a Task / run a new Job** — moderate frequency during Phase 3–4 authoring loops (Private Taskset owner)
- **Copy Taskset slug for CLI** — moderate frequency; `hud eval <slug> -m <model>` starts here
- **Fork a Public Taskset** — low-moderate frequency; discovery loop leads to fork when Alex wants to build on an existing benchmark

Anti-pattern guard: **Alex compliance creep.** No compliance affordances (audit-export, regulatory badges, visibility-change confirmations with legal copy) belong on Alex's primary path here. Visibility toggle (Publish / Unpublish) is in Settings, not in the header — the primary CTA is `▶ Run Taskset`.

**Sam (Applied Agent Engineer — SECONDARY)** arrives here from:
1. **From a weekly regression Job** — he ran an eval batch; he wants to check that the target model is still above the pass threshold on his frozen Taskset. Overview leaderboard is the landing signal.
2. **From a model-selection decision** — he found this Public Taskset through the index or a colleague link; he wants to understand how different models perform across it before choosing one for production.

Sam's jobs on this page:
- Read the leaderboard for a deployment decision
- Check that the top-scoring model's average is above his production threshold
- Drill to a Trace from a failing model row (incident-response path; Phase 5 equivalent)
- Read the Taskset description to confirm it covers his workflow domain

Sam anti-pattern: **Sam RL creep.** Sam does not need training-curve surfaces, checkpoint selectors, or RL-specific reward-function editors on this page. Those belong to Alex. The Jobs tab (Job history) and Performance tab (distribution analysis) are in scope for Sam only insofar as they support his regression-check and model-comparison jobs.

**Riley (RL Environment Vendor — TERTIARY)** arrives here as the owner of a Private Taskset being packaged for delivery. His jobs:
- Verify that all Tasks are QA'd and that the QA pass rate meets the contract threshold (Tasks tab — next pass)
- Check the leaderboard to confirm the expected score range for the buying lab
- Edit the Description and Settings (Taskset name, system prompt, visibility) before publishing

Riley anti-pattern: **Riley collapsed into Alex.** Riley's authoring and QA surfaces need buying-lab polish — clear pass/fail counts, a readable description, a publish workflow. Alex's raw-output posture (dense leaderboard, CLI-snippet empty states) is correct for Alex on this page; but Riley also needs the Settings tab's Publish flow and the Description edit affordance. These coexist without collision because they live at different altitudes (leaderboard is the dominant surface; Settings is the admin surface).

---

## Decision log

### Decision 1: Descriptor strip field set for Taskset

**HUD-side question:** What does Alex see in the strip below the Taskset name on the first landing scan that he cannot get more efficiently anywhere else on the page?

**Choice (updated 2026-06-09):** Three fields in the strip: `task-count Tasks  ·  slug [⎘]  ·  Owned by: <org>`

- **Task count** — exact integer, e.g., `367 Tasks`. Load-bearing: Alex's "how comprehensive is this?" question is answered here without a tab click. Sam needs this to size the eval run's credit cost. Leads the strip as the first sizing signal.
- **Taskset slug** — monospace + copy button `[⎘]`. Alex pastes this into `hud eval <slug> -m <model>` every time he runs an eval. Same high-frequency, sub-second job as the API name on the model-detail strip. Non-negotiable inclusion. Second field because it is the immediate next-action item after understanding scale.
- **Owner** — org name, linked to org profile if available. Added to the strip (moved from the standalone lineage line) so all-variant pages carry the owner signal at header altitude. Closes the strip as the least time-sensitive of the three fields.

**Removed from the strip:**
- **Environment chip** — environment is conveyed in the leaderboard Model cell (each row shows the env chip inline), in the Tasks tab, and in the Jobs tab. Surfacing it a second time in the header strip is redundant clutter that leads the eye before Task count. Dropped per Operator review (2026-06-09).

**Not included in the strip:**
- **Purpose (Benchmark / Training)** — admin field in Settings. Alex does not gate his usage decision on this.
- **Job count** — available in the Jobs tab badge. Strip duplication adds no value.
- **Last activity / Created** — not load-bearing for Alex's sub-15-second scan. Available in the About block.
- **Scenario count** — Task count is more actionable. Omit.

**Persona reason:** Alex's primary landing question is "what is this, can I run it, how do I run it?" — Task count (how big), slug (how to run from CLI), Owner (whose work is this). All three load-bearing. Sam asks the same questions for the same reasons before a deployment eval.

### Decision 2: Primary CTA logic by variant

**HUD-side question:** What action does Alex (or Sam) most want to trigger within three seconds of landing on this page? And how does that change for Public non-owner vs Private owner?

**Choice:** `▶ Run Taskset` is the only primary right-slot CTA for owner variants. `+ Create Task` moves to the overflow `≡` menu. Public non-owner: `[Fork]` is the only secondary CTA, left of Run Taskset.
- **Private Taskset (owner):** right slot = `[▶ Run Taskset]` only. `+ Create Task` is in the overflow `≡` menu.
- **Public Taskset (non-owner, e.g., Alex browsing):** right slot = `[Fork]` (secondary) + `[▶ Run Taskset]` (primary). Alex's discovery loop ends in "run my model against this" — the primary CTA captures that. Fork is the after-thought (he forks only when he wants to extend or modify the Taskset, which is a lower-frequency job than running).
- **Public Taskset (owner):** right slot = `[▶ Run Taskset]` only. `+ Create Task` is in the overflow `≡` menu.
- **Overflow menu `≡`** (all variants): Star / Bookmark (toggle), + Create Task (owner only — Private + Public owner), Export (Taskset slug + task list), Publish / Unpublish (owner only). Production's `≡` confirmed in Image #30 header; this wireframe specifies what folds there.

**Persona reason:** Alex (PRIMARY) authors Tasks via `hud taskset add-task` / Python — see personas.md:10 — and never via a header form. A header `+ Create Task` CTA on Alex's primary path violates the anti-pattern. Sam and Riley CAN benefit from Create Task — but their authoring is bulk / occasional, well-served by the overflow menu surface.

### Decision 3: Visibility pill in the title row

**HUD-side question:** The index page's My Team tab shows visibility pills on cards to signal "this team view mixes Public and Private." On the detail page, what does the visibility indicator need to communicate, and to whom?

**Choice:** Visibility pill in the title row, same register as model-detail Variant C's `🔒 Private` pill. `🔒 Private` for Private Tasksets; `🌐 Public` for Public Tasksets.

Both pills are present on the detail page (unlike the index, where Public-tab cards omit the Public pill). Rationale: on the detail page, the user arrived via a direct link or from search, not necessarily from the context of a visibility-filtered tab. They need the signal regardless of entry path.

**Star in the title row (Public Tasksets):** A `☆` star with community count appears in the title row for Public Tasksets, immediately following the visibility pill. On the detail page, the star functions as a community-credibility signal (same as grid card header on the index), not merely a personal bookmark. Count is community-wide. The star is interactive (click to toggle bookmark for current user). Semantics: identical to the index card star on Public-tab cards.

**Persona reason:** Riley needs the `🔒 Private` pill as a guard before publishing (confirms the Taskset is not yet visible to the buying lab). Alex browsing a Public Taskset needs `🌐 Public` to confirm it's a community resource, not a teammate's accidentally-shared private Taskset. Both are load-bearing trust signals.

### Decision 4: Lineage line for forked Tasksets

**HUD-side question:** Analogous to model-detail's two-link lineage line (`Forked from: X · Trained via: Y`), what lineage does a forked Taskset carry that is load-bearing on the landing scan?

**Choice (updated 2026-06-09):** Forked-from provenance moves out of the page header and into the Overview tab's About block as a `Forked from:` row (see §4a About block annotations). The page header no longer carries a lineage line — the descriptor strip now carries Owner as its third field, which is sufficient header-altitude provenance for all Tasksets. The full `Forked from: <name> (slug)` detail is reference content, not a landing-scan signal, and belongs at Overview tab altitude.

**What was the lineage line:** `Forked from: OSWorld-Verified (osworld-verified-0020)  ·  Owned by: HUD` — this appeared conditionally below the descriptor strip for forked Tasksets only.

**Why moved:** (a) The header's sticky altitude should be structurally consistent across all Tasksets — conditional extra lines add visual height variance as users tab between Tasksets. (b) Forked-from is provenance reference, not a decision input Alex needs on every scan. Alex needs to know the owner (now in the strip); he only needs the forked-from detail when he is explicitly evaluating provenance, which happens in the Overview context. (c) The About block already has a `Source` row placeholder (see §4a); replacing `Source` with the richer `Forked from:` row costs nothing new.

**Persona reason:** Alex's landing scan does not require forked-from on every page load — he needs it once, when evaluating whether to use or fork a Taskset. Overview tab is the right moment for that. Riley's buying-lab customer reads the About block carefully; `Forked from:` there is exactly what they need for their "original or derived?" inspection.

### Decision 5: Tab set by variant

**HUD-side question:** The production page has 5 tabs: Overview, Tasks, Jobs, Performance, Settings. Which tabs should be visible or hidden depending on the visitor's relationship to the Taskset?

**Choice:**
- **Private (owner):** All 5 tabs. Full access.
- **Public (non-owner):** 4 tabs. Settings tab hidden — non-owners cannot configure a Taskset they don't own. Tasks tab is read-only (can browse but not add/edit). Overview, Jobs, Performance: full visibility.
- **Public (owner):** All 5 tabs. Settings tab visible; contains Publish/Unpublish action.

The "About" block (owner, license, created date, fork count) appears in the Overview footer **only on the Public non-owner variant** — it carries information that Settings would normally hold, surfaced here because Settings is hidden for this audience.

**Persona reason:** Hiding Settings for non-owners eliminates the "I don't have permission to do this" dead-end. Alex browsing a Public Taskset has no reason to visit Settings; removing it reduces navigation noise. Riley's buying-lab customer (inspecting a Public Taskset before purchase) similarly doesn't need Settings — they need the About block and the Tasks tab (read-only).

### Decision 6: Default active tab

**HUD-side question:** When a user lands on the Taskset detail page, which tab gives them the highest-value signal fastest?

**Choice: Overview tab is the default active tab.**

Alex's primary landing job is "who's winning?" — the leaderboard is the answer. The leaderboard lives in the Overview tab. The Jobs tab (Job history) and Performance tab (score distributions) are secondary reads — Alex navigates there after the leaderboard orients him. This matches the production screenshot (Image #30 shows the Overview tab with the Agent leaderboard as the primary content).

Production's `Overview` tab default is kept. The model-detail page defaults to Results for the same reason (the primary landing job is "how is this performing?").

**Persona reason:** Alex's sub-15-second scan is the Overview leaderboard. Sam's regression-check landing job is the same — "is my model above threshold?" — answered by the leaderboard. Neither persona needs to land on Jobs or Tasks to orient.

### Decision: Validity scope on Overview aggregations

**HUD-side question:** Should an Invalidated Job's results appear in the leaderboard / chart / averages?

**Choice:** **Valid Jobs only.** Every aggregation on the Overview tab — leaderboard rank, Avg, Best@K, Pass@1, Steps, Top 5 Performers chart — filters to `Validity = Valid`. Invalidated Jobs are excluded from the signal but remain visible in the Jobs tab list (with hatch overlay) for audit.

**Persona reason:** Alex's trust in the leaderboard depends on it being a quantitative truth-source. If an Invalidated Job (env error, reward hack, wrong config) anchors the top score, every subsequent comparison is wrong. Sam's regression decision and Riley's buying-lab claim both rely on the leaderboard reflecting only Jobs the owner has affirmed as valid measurements. Audit transparency is preserved in the Jobs tab, not on the Overview tab.

### Decision 7: Overview hero — leaderboard table, then Top 5 Performers chart, then Description

**HUD-side question:** The production Overview tab (Image #30) shows a `Agent` h2 with count + leaderboard table + Top 5 Performers bar chart + Description block. Is this ordering correct? Does the chart earn its position?

**Choice:** Keep the production ordering. Leaderboard table anchors the top; Top 5 Performers chart immediately below; Description block below the chart.

**Chart justification:** The chart earns its position when the leaderboard has more than 5 models — at that point, the chart provides a glanceable visual summary of the top-5 performance gap without requiring the user to scan individual rows. For leaderboards with ≤5 models, the chart is redundant with the table; however, the chart is still rendered (not conditionally hidden) because the complexity of conditional hiding is not worth the marginal density gain. The chart is compact and the Description block (below it) is below the fold anyway, so the chart does not displace primary content.

**Description block:** Rendered below the chart. Carries the Taskset description as authored by the owner. `Copy all` and `✏ Edit` actions on the Description block — `Edit` is owner-only (non-owners see description as read-only). Production shows `Copy all` and `✏ Edit` in Image #30; inherit both.

**About block (Public non-owner variant only):** Appears below the Description block. Contains: Owner org name, License (if applicable), Created date, Fork count, Source (if forked from another Taskset — links to lineage Taskset). This block surfaces Settings-tab content for non-owners who lack the Settings tab.

**Persona reason:** Alex's sub-15-second landing scan is served by the leaderboard table. The chart is a redundant glanceable that helps at medium scale (5–20 models) without harming small-scale (1–3 models) or large-scale (20+ models). Description is reference content — it exists below the fold, which is correct for reference material. Riley's buying-lab customer reads the Description carefully; placing it below the chart preserves Riley's access without adding it to Alex's above-fold noise.

### Decision 8: Leaderboard table column set

**HUD-side question:** The production Overview (Image #30) shows columns: `Average ▾ / Best@3 / Best@5 / Best@10 / Pass@1 / Steps`. Are these the right columns? What column semantics are load-bearing?

**Choice:** Inherit the production column set with one clarification on `—` semantics.

| Column | Content | Notes |
|---|---|---|
| Rank | Gold/silver/bronze/N rank chip | Same rank-color chip pattern from index card leaderboard rows |
| Model | Model name + Environment chip | Same two-line cell: display name (links to Model detail page) + env-chip tag below |
| Average | Mean reward float, 1 decimal place displayed as percentage (e.g., `88.9%`) | Primary sort column, descending. Sort toggle `▾` inherits production. |
| Best@3 | Best score across 3 Runs per Task | `—` when fewer than 3 Runs/Task exist |
| Best@5 | Best score across 5 Runs per Task | `—` when fewer than 5 Runs/Task exist |
| Best@10 | Best score across 10 Runs per Task | `—` when fewer than 10 Runs/Task exist |
| Pass@1 | Probability of passing on first attempt | `—` when insufficient data |
| Steps | Mean Tool turns per Run | Right-aligned integer with 1 decimal |

`—` semantics: not zero, not "no score." `—` means "insufficient data at this sample size" — honest, per personality.

Each Model row links to the Model detail page (row click or model name click). Inline "View Traces" action per row — same one-click drill path pattern from model-detail Results tab. Label: `View Traces` icon link opens Traces filtered to this Taskset × this Model.

**Persona reason:** `Average` is Alex's primary ranking signal. `Best@K` columns support his k-shot evaluation workflow — "does the model solve this task if it gets K attempts?" `Steps` is a cost-efficiency proxy Alex actively monitors (fewer tool turns = lower cost, Phase 4 secondary reward). Sam reads `Average` and `Pass@1` for a go/no-go deployment signal.

### Decision 9: Empty-state CTA in Overview — no Jobs run

**HUD-side question:** When no Jobs have been run against this Taskset, the leaderboard table is empty. What does the empty state show?

**Choice:** Empty state with `▶ Run Taskset` button + CLI snippet.

```
No results yet.

hud eval <taskset-slug> -m <model>   [⎘]

Read the docs ↗
```

Slug is the Taskset's actual slug, verbatim, in the CLI command. Same Earnest pattern as model-detail empty state. Description block still renders below the empty state — the owner may have authored a description even before running Jobs.

**Persona reason:** Alex landing on a newly-created Private Taskset (or a Public one with zero Jobs run) needs the exact CLI command to start. No wizard, no modal-launch. The description being present confirms the Taskset is valid even without results.

### Decision 10: Taskset slug copy in the header strip

**HUD-side question:** Should the Taskset slug be in the header strip alongside the Environment chip and Task count, or is it lower-priority (Settings-only)?

**Choice:** Taskset slug in the header strip, monospace, with copy button `[⎘]`.

Alex pastes `hud eval <taskset-slug>` every time he runs an eval from the CLI. This is a high-frequency action identical in nature to the API-name copy on the model-detail strip. Burying the slug in Settings adds two clicks to a sub-second action. The index already surfaces slugs on hover; the detail page makes the slug permanently visible with a copy button.

**Persona reason:** Same rationale as model-detail Decision 3 (API name). High-frequency, sub-second copy action → strip, not Settings. Non-negotiable.

---

## §1 Shared layout note

The `MAIN` region is the content area to the right of AppShell's persistent sidebar. This wireframe does not redraw the sidebar, credits widget, or user chip.

```
┌─────────────────────┬─────────────────────────────────────────────────────────┐
│  SIDEBAR (AppShell) │  MAIN                                                   │
│  [see app-shell     │                                                         │
│   wireframe.md]     │  [TASKSET DETAIL CONTENT — this file]                   │
│                     │                                                         │
└─────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## §2 Page header anatomy

The header altitude pattern is **finalized** — breadcrumb + title row + descriptor strip — inherited verbatim from `model-detail.wireframe.md §2`. This section specifies only the Taskset-specific field set. Do not redesign the altitude pattern.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER  (sticky)                                                           │
│                                                                                  │
│  ← Tasksets  /  browser Tasks                                                    │
│  (breadcrumb — "← Tasksets" links back to /tasksets; current page name is plain) │
│                                                                                  │
│  TITLE ROW                                                                       │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  browser Tasks  [🌐 Public]  ☆ 18                                         │  │
│  │  (h1 / Taskset name)  (visibility pill)  (star + community count)         │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│  (right slot — Public non-owner):  [Fork]  [▶ Run Taskset]                       │
│  (right slot — Private owner):     [▶ Run Taskset]                               │
│  (right slot — Public owner):      [▶ Run Taskset]                               │
│                                                                                  │
│  DESCRIPTOR STRIP (one line, below title row)                                    │
│  367 Tasks  ·  browser-tasks-01a4f [⎘]  ·  Owned by: HUD                        │
│  (task count · taskset slug copy · owner)                                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Breadcrumb:** `← Tasksets` links to `/tasksets`. Current page name (Taskset name) is plain text, not a link. Identical pattern to model-detail breadcrumb.
- **Taskset name h1:** human-readable name as authored. Not the slug.
- **Visibility pill:** `🌐 Public` or `🔒 Private`. Renders on all variants (unlike the index Public tab, where the Public pill is omitted as redundant). Justification: detail page is entry-path-agnostic; the signal must be present regardless of where the user came from.
- **Star:** `☆ 18` (outline = not starred by current user; filled `★ 18` = starred). Present on Public Tasksets. Semantics on detail page: community count (identical to index Public tab). Interactive: click toggles current user's bookmark. See open question §14 item 1 for count semantics on Private Tasksets.
- **Right-slot CTAs by variant:** see Decision 2. `▶ Run Taskset` is always the primary (rightmost/prominent) CTA. Secondary CTA left of it varies by variant. Both are rendered as distinct buttons, not split-button.
- **Overflow `≡` menu:** Star / Bookmark toggle, + Create Task (owner only — Private + Public owner), Export (JSON/CSV of Taskset task list), Publish (Private owner → makes Public), Unpublish (Public owner → reverts to Private). Destructive actions (Delete Taskset) live in Settings Danger Zone, not in the overflow menu on the header.
- **Descriptor strip:** single line below the title row. Three fields: Task count (exact integer + "Tasks" label) · Taskset slug (monospace + copy button) · Owner name (text link to org profile if available, else plain text). No Environment chip (environment is conveyed in the leaderboard Model cell and elsewhere — redundant at header altitude). No status field (Tasksets don't have runtime status analogous to Model `● Available`). Fields separated by `·` (middle dot). Order rationale: Task count is the first sizing signal Alex reads; slug is the immediate CLI-action item; Owner is the least time-sensitive field and closes the line.
- **Lineage (forked Tasksets):** no longer a header-altitude line. Forked-from provenance moves into the Overview tab's About block (see §4a `Forked from:` row). The page header is the same structure for all Tasksets regardless of fork status — the forked-Taskset variant no longer adds a separate line.
- **Sticky behavior:** full page header (breadcrumb + title row + strip) stays sticky as tab content scrolls. Same as model-detail.

---

## §3 Tab bar anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TAB BAR  (sticky, below page header)                                            │
│                                                                                  │
│  Private (owner), 5 tabs:                                                        │
│  [Overview]  [Tasks 367]  [Jobs 12]  [Performance]  [Settings]                   │
│                                                                                  │
│  Public (non-owner), 4 tabs:                                                     │
│  [Overview]  [Tasks 367]  [Jobs 12]  [Performance]                               │
│                                                                                  │
│  Public (owner), 5 tabs:                                                         │
│  [Overview]  [Tasks 367]  [Jobs 12]  [Performance]  [Settings]                   │
│                                                                                  │
│  ← underline variant; active tab underlined; active default = Overview           │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Overview** — no count badge. The Overview tab shows the leaderboard (count of models with results), but that count is already surfaced as the `Agent [N]` section header inside the tab. A tab badge here would duplicate it.
- **Tasks** — count badge = total Task count in this Taskset (e.g., `Tasks 367`). Load-bearing: Alex needs this before deciding to run a Job (size = credits estimate). Same count as the strip's Task count field — deliberate repetition because the strip disappears below scroll and the tab badge is visible at all times when the tab bar is sticky.
- **Jobs** — count badge = total Job count on this Taskset (e.g., `Jobs 12`). Load-bearing: Alex and Sam both want to know "how many times has this been run?" when evaluating history depth. Production (Image #28) confirms count makes sense here.
- **Performance** — no count badge. Performance is a configured analysis view, not a countable list.
- **Settings** — no count badge. Admin tab.
- **Default active tab:** Overview. See Decision 6.
- **Tab bar sticky behavior:** same as model-detail; tab bar pins just below the sticky page header as the tab content scrolls.

---

## §4 Overview tab — IN FULL

### §4a Default state (Jobs have been run)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  OVERVIEW TAB — default state                                                    │
│                                                                                  │
│  LEADERBOARD SECTION                                                             │
│  Agent  [5]                                                                      │
│  (section h2 + count badge; "Agent" = the ranked entity per platform vocabulary) │
│                                                                                  │
│  TABLE                                                                           │
│                                                                                  │
│  RANK │ MODEL                    │ AVG ▾    │ BEST@3  │ BEST@5  │ BEST@10 │ PASS@1 │ STEPS │
│  ─────────────────────────────────────────────────────────────────────────────── │
│  [1]  │ Claude Haiku 4.5         │ 100.0%   │ 100.0%  │ —       │ —       │ 66.7%  │  4.4  │
│       │ [browser]                │          │         │         │         │        │       │
│  [2]  │ Kimi K2.5                │  88.9%   │ —       │ —       │ —       │ 66.7%  │  5.7  │
│       │ [browser]                │          │         │         │         │        │       │
│  [3]  │ Claude Opus 4.1          │  66.7%   │ 100.0%  │ —       │ —       │ 66.7%  │  3.3  │
│       │ [browser]                │          │         │         │         │        │       │
│  [4]  │ DeepSeek V3.2            │  22.2%   │ —       │ —       │ —       │  0.0%  │  1.0  │
│       │ [browser]                │          │         │         │         │        │       │
│  [5]  │ Operator                 │   0.0%   │  0.0%   │ —       │ —       │  0.0%  │  1.2  │
│       │ [browser]                │          │         │         │         │        │       │
│                                                                                  │
│  (Inline per-row action, icon right of row: "View Traces"                        │
│   → opens Traces tab pre-filtered to this Taskset × this Model)                 │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  TOP 5 PERFORMERS CHART                                                          │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  Top 5 Performers                                                          │  │
│  │                                                                            │  │
│  │  100% ┤   █                                                                │  │
│  │   80% ┤   █    █                                                           │  │
│  │   60% ┤   █    █    █                                                      │  │
│  │   40% ┤   █    █    █                                                      │  │
│  │   20% ┤   █    █    █    █                                                 │  │
│  │    0% ┤   █    █    █    █    █                                            │  │
│  │        Haiku  Kimi  Opus  DS   Op                                          │  │
│  │       (bar per model, colored per rank — hue is design-tokens-phase)       │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│  chart aria-hidden="true"; table is accessible data source                       │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  DESCRIPTION BLOCK                                                               │
│                                                                                  │
│  Description                          [Copy all]  [✏ Edit]  (Edit: owner only)  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Browser-based task evaluation focused on web navigation, form submission,       │
│  and multi-step task completion. 367 Tasks across 3 Scenarios.                  │
│  (body text, as authored by owner)                                               │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  ABOUT BLOCK  (Public non-owner variant only)                                    │
│                                                                                  │
│  About                                                                           │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Owner        HUD                                                                │
│  License      MIT                                                                │
│  Created      2025-11-04                                                         │
│  Forks        3                                                                  │
│  Forked from  OSWorld-Core v1 (osworld-core-v1)  ↗  (absent if original)        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Leaderboard table annotations:**

- **Validity scope:** The leaderboard table, the Top 5 Performers chart, and the Avg / Best@K / Pass@1 / Steps aggregates include **Valid Jobs only.** Invalidated Jobs are excluded from rank, scores, and chart bars. Users navigate to the Jobs tab to audit which Jobs were invalidated, by whom, when, and why. See `platform.md` Terminology → Job lifecycle states for the `Valid` / `Invalidated` axis definition.
- **Section header:** `Agent [N]` — `Agent` is the correct platform term for the ranked entity (a Model paired with a target). The count badge `[N]` is the number of distinct Models/Agents that have run against this Taskset. "Agent" is not "Model" — the production screenshot (Image #30) uses "Agent" as the section h1, which aligns with platform vocabulary (`platform.md` confirms Agent = a Model configured with a target for a specific job). Inherit this.
- **Rank chips:** Gold `[1]`, silver `[2]`, bronze `[3]`, then plain `[4]`, `[5]`, etc. Hue treatment is design-tokens-phase decision; wireframe notes the pattern.
- **Model cell (two-line):** display name on top (clickable link to Model detail page) + Environment chip tag below (small, muted). Multi-Environment: show primary env chip + `+N`.
- **Score columns:** exact percentage values to 1 decimal place. `—` for cells with insufficient data (fewer than K Runs/Task for Best@K columns). `0.0%` is a genuine zero, not missing data — shown as `0.0%`, never as `—`.
- **Average column:** sorts descending by default; sort toggle in header.
- **Steps column:** mean Tool-turn count per Run, 1 decimal place. Right-aligned.
- **Row action:** "View Traces" icon link at the far right of each row (ghost weight). `aria-label="View Traces for [Model name] on this Taskset"`. Navigates to Traces tab pre-filtered for this Model × Taskset combination. One click from leaderboard row → Traces for that run. This is the Phase 5 drill path — non-negotiable.

**Top 5 Performers chart annotations:**

- Vertical bar chart. One bar per model, ordered by rank (highest to lowest left to right). Bar height proportional to Average score. Each bar labeled with truncated model name below.
- Chart is a glanceable supplement to the table. When leaderboard has 1–2 models, the chart is minimal but still rendered (Decision 7). When leaderboard has 20+ models, the chart still shows only Top 5 — the name "Top 5 Performers" is literal.
- `aria-hidden="true"` on the chart SVG. The accessible data source is the leaderboard table.

**Description block annotations:**

- Section h2 "Description". Body text as authored.
- `Copy all` copies the full description to clipboard. `✏ Edit` opens inline edit mode (owner only). Non-owners see the body as read-only text; `Copy all` is still present.
- Empty description: if no description has been authored, Private owner sees "Add a description…" placeholder with a visible `✏ Edit` affordance. Non-owners and non-empty state: block rendered as above.

**About block annotations (Public non-owner only):**

- `<dl>` structure with `<dt>`/`<dd>` pairs, same pattern as model-detail Settings metadata.
- `Owner:` links to the org's team page if available, else plain text.
- `License:` plain text. If no license set: `—`.
- `Forks:` integer count. If zero: `0`.
- `Forked from:` (was `Source:`) — link to parent Taskset detail page, displayed as `<name> (<slug>)` with an external-link `↗` indicator. Absent if this Taskset is an original (not a fork). Replaces the terse `Source` label with `Forked from:` for clarity and parity with the provenance language used in platform.md. This row is where the full lineage detail now lives (moved from the header's conditional lineage line per 2026-06-09 update). Placement rationale: the About block is provenance reference territory — Owner / License / Created / Forks / Forked-from are all of the same class of metadata. Alex and Riley's buying-lab customer read this row when evaluating "original or derived?" — the Overview tab is the right moment for that question.
- This block is absent on Private (owner) variant and Public (owner) variant — Settings tab carries this information for the owner.

---

### §4b No-leaderboard-yet state (zero Jobs run)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  OVERVIEW TAB — empty state (no Jobs run)                                        │
│                                                                                  │
│  Agent  [0]                                                                      │
│  (section h2 + zero count badge)                                                 │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  No results yet.                                                                 │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  hud eval browser-tasks-01a4f -m <model>                          [⎘]   │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  [▶ Run Taskset]                                                                  │
│  (primary button — same as header CTA; present here so user does not need to     │
│   scroll back to header)                                                          │
│                                                                                  │
│  Read the docs ↗                                                                 │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  DESCRIPTION BLOCK  (renders regardless of Job count)                            │
│  (same anatomy as §4a Description block)                                         │
│                                                                                  │
│  ABOUT BLOCK  (Public non-owner only — same as §4a)                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- CLI command uses the actual Taskset slug (not `<taskset-slug>` placeholder) — slug is always available from the Taskset's own header strip.
- `▶ Run Taskset` button duplicates the header CTA. Justification: empty states are the moment when the user most wants to act and the header may have scrolled up on first open (if the page loaded to the tab content). Earning, not redundant.
- Description block still renders — owner may have authored a description even before running Jobs. Non-owners can read it.
- Top 5 Performers chart: absent in the empty state (nothing to chart). Leaderboard table: absent (replaced by the empty state block). Description and About blocks: present.

---

### §4c Loading state

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  OVERVIEW TAB — loading state                                                    │
│                                                                                  │
│  Agent  [░░]                                                                     │
│  (section h2; count badge = skeleton shimmer)                                    │
│                                                                                  │
│  LEADERBOARD SKELETON                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  [░░] │ [░░░░░░░░░░░░░░░░░░]  │ [░░░░░] │ [░░░] │ [░░░] │ [░░░] │ [░░] │    │
│  │       │ [░░░░░░░]  (env tag)   │         │       │       │       │      │    │
│  │  [░░] │ [░░░░░░░░░░░░░░░]     │ [░░░░░] │ [░░░] │ [░░░] │ [░░░] │ [░░] │    │
│  │       │ [░░░░░░]               │         │       │       │       │      │    │
│  │  [░░] │ [░░░░░░░░░░░░░░░]     │ [░░░░░] │ [░░░] │ [░░░] │ [░░░] │ [░░] │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│  3–5 skeleton rows, matching the populated row height + two-line cell shape      │
│                                                                                  │
│  TOP 5 PERFORMERS CHART SKELETON                                                 │
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]              │
│  (rectangular shimmer, matches chart region height)                              │
│                                                                                  │
│  DESCRIPTION SKELETON                                                            │
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  (3 text bars)    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Skeleton rows match the two-line cell shape (model name bar + env-tag bar) so there is no layout shift when data loads.
- Chart skeleton is a single rectangular shimmer block at the chart region's height.
- Description skeleton shows 3 text-width bars of varying length to mimic a paragraph.
- Filter row (for tabs that have one): rendered but with disabled/skeleton state on controls.
- `aria-busy="true"` on the tabpanel. Off-screen `aria-live` region announces "Loading" to screen readers.

---

## §5 Tasks tab

Tab anatomy specced in a sibling file. See [`taskset-detail-tasks.wireframe.md`](./taskset-detail-tasks.wireframe.md).

Inherits the page header, tab bar, and variant matrix from this anchor.

---

## §6 Jobs tab

Tab anatomy specced in a sibling file. See [`taskset-detail-jobs.wireframe.md`](./taskset-detail-jobs.wireframe.md).

Inherits the page header, tab bar, and variant matrix from this anchor.

---

## §7 Performance tab

Tab anatomy specced in a sibling file. See [`taskset-detail-performance.wireframe.md`](./taskset-detail-performance.wireframe.md).

Performance is variant-invariant — same content for all three variants. Inherits the page header, tab bar, and variant matrix from this anchor.

---

## §8 Settings tab

Tab anatomy specced in a sibling file. See [`taskset-detail-settings.wireframe.md`](./taskset-detail-settings.wireframe.md).

Owner-only tab (Variants A + C). Variant B (Public non-owner) does not render this tab; owner / license metadata appears in the Overview tab's About block per §4a.

---

## §9 Variant cross-cuts (structural summary)

| Variant | Title row | Descriptor strip | Right-slot CTAs | Tab set | About block in Overview |
|---|---|---|---|---|---|
| A — Private (owner) | Taskset name · `🔒 Private` pill | N Tasks · slug [⎘] · Owned by: org | `[▶ Run Taskset]` (Create Task in overflow `≡`) | Overview / Tasks / Jobs / Performance / Settings (5) | Absent (Settings carries this) |
| B — Public (non-owner) | Taskset name · `🌐 Public` pill · `☆ N` star | N Tasks · slug [⎘] · Owned by: org | `[Fork]` `[▶ Run Taskset]` | Overview / Tasks (read-only) / Jobs / Performance (4) | Present (includes `Forked from:` row when applicable; Settings hidden) |
| C — Public (owner) | Taskset name · `🌐 Public` pill · `☆ N` star | N Tasks · slug [⎘] · Owned by: org | `[▶ Run Taskset]` (Create Task in overflow `≡`) | Overview / Tasks / Jobs / Performance / Settings (5) | Absent (Settings carries this) |

**Uniform header structure:** The descriptor strip is identical in structure across all three variants — three fields, same order. No variant-specific extra lines. Forked-from provenance is not a header-altitude element; it lives in the About block of the Overview tab (Variant B) and the Settings tab (Variants A + C).

**Note on forked Tasksets:** A fork of a Public Taskset is itself Public by default. The forked variant renders as Variant C (Public owner). The `Forked from:` row in Settings (Variants A + C) and in the About block of Overview (Variant B) surfaces the lineage at the appropriate altitude — reference metadata, not a persistent sticky header element.

---

## §10 States coverage

| Surface | Default (data) | Empty (no data) | Loading |
|---|---|---|---|
| Overview — leaderboard | Rank table + chart + description + about (variant B only) | Empty state with CLI command + `▶ Run Taskset` + description block | Skeleton rows + chart shimmer + description shimmer |
| Overview — description block | Authored text + Copy all + Edit (owner) | "Add a description…" placeholder (owner only) | 3-line shimmer |
| Overview — about block (B only) | Owner / License / Created / Forks / Forked from (if applicable) | N/A (block absent when no data to show) | `<dl>` skeleton fields |
| Tasks tab | See [`taskset-detail-tasks.wireframe.md`](./taskset-detail-tasks.wireframe.md) | ↑ | ↑ |
| Jobs tab | See [`taskset-detail-jobs.wireframe.md`](./taskset-detail-jobs.wireframe.md) | ↑ | ↑ |
| Performance tab | See [`taskset-detail-performance.wireframe.md`](./taskset-detail-performance.wireframe.md) | ↑ | ↑ |
| Settings tab | See [`taskset-detail-settings.wireframe.md`](./taskset-detail-settings.wireframe.md) (Variants A + C only) | N/A | ↑ |

---

## §11 Responsive behavior

### Desktop — full layout

All leaderboard columns visible. Descriptor strip on one line. Breadcrumb full text. Right-slot CTAs both inline. Top 5 Performers chart full width below the table.

### Tablet — reduced

- Descriptor strip wraps to two lines if the slug is long: line 1 = N Tasks; line 2 = slug [⎘] · Owned by: org.
- Leaderboard table: `BEST@10` column hidden (recoverable from Jobs tab detail). `STEPS` column hidden at narrowest tablet. `PASS@1` kept — Sam's deployment signal.
- Top 5 Performers chart: compressed width, labels may truncate to initials with full name in tooltip.
- Right-slot CTAs: both remain inline; button labels may truncate (`▶ Run` instead of `▶ Run Taskset`) only if horizontal space is genuinely insufficient.
- About block (Variant B): `<dl>` layout compresses to 1-column (label above value) instead of 2-column label-value row.

### Mobile

- Breadcrumb collapses to `← Tasksets` only (no current Taskset name to save space).
- Descriptor strip: vertical stack. Env chip on its own line; Task count on next line; slug [⎘] on next line.
- Title row: Taskset name + visibility pill on one line; star count below on its own line if it doesn't fit inline.
- Right-slot CTAs: stack vertically below the descriptor strip, full width. Primary (`▶ Run Taskset`) first, secondary below.
- Leaderboard table: collapses to card-stack layout. Each card: Rank chip + Model name + Average score + Steps (collapsed). `View Traces` icon retained inline. `Best@K` and `Pass@1` hidden; accessible from expanded card state.
- Top 5 Performers chart: hidden on mobile. Leaderboard card stack is the primary signal at mobile width.
- Description block: collapses to 2-line preview with "Show more" toggle if the description is longer than 2 lines.
- About block (Variant B): `<dl>` 1-column stack, same as tablet.
- Lineage line: truncates source Taskset name to 30 chars with ellipsis; full name in tooltip on tap.

---

## §12 Keyboard and accessibility

- `<main>` wraps the detail MAIN region.
- `<h1>` = Taskset name (not "Taskset Detail").
- **Breadcrumb:** `<nav aria-label="Breadcrumb">` wrapping `<ol>`. "← Tasksets" is an `<a>`; current page name is plain `<li>` text (not a link).
- **Descriptor strip:** `<dl>` with `<dt>`/`<dd>` pairs for Task count, slug, and Owner. Copy button: `<button aria-label="Copy Taskset slug browser-tasks-01a4f">`. Matches model-detail §12 copy-button label pattern. Owner `<dd>` is a link if an org profile exists, else plain text.
- **Tab bar:** `role="tablist"`, each tab `role="tab"`, `aria-selected`, `aria-controls`. Count badges: `aria-label="Tasks, 367"` (count spoken as part of the tab label, not a separate element). Arrow keys navigate between tabs.
- **Leaderboard table:** `<table>` with `<thead>` and `aria-sort` on the Average column header. Each `<tbody>` row = one Model. "View Traces" icon link per row: `aria-label="View Traces for Claude Haiku 4.5 on this Taskset"`.
- **Rank chip:** `<span aria-label="Rank 1">` (number readable for screen readers; visual chip is decorative).
- **Score `—` cells:** `aria-label="Not enough data"` (not "dash" or "em dash").
- **Top 5 Performers chart:** `aria-hidden="true"` on the SVG; accessible data is the leaderboard table. Chart region has a visually-hidden text description: "Bar chart showing Top 5 performers by Average score. Data in the table above."
- **Star button:** `<button aria-label="Star browser Tasks" aria-pressed="false/true">`. Toggles. `aria-pressed="true"` when starred. Label switches to "Unstar browser Tasks" when starred.
- **Description block Copy all button:** `<button aria-label="Copy Taskset description to clipboard">`.
- **Description block Edit button (owner only):** `<button aria-label="Edit Taskset description">`. When activated, the description renders as a `<textarea>` with a Save / Cancel pair. `<textarea aria-label="Taskset description">`.
- **About block `<dl>`:** standard `<dt>`/`<dd>` pairs. Links within values (`Owner`, `Source`) have descriptive labels.
- **Empty state CLI command:** code block rendered as `<pre><code>`. Copy button: `<button aria-label="Copy command to clipboard">`.
- **Loading state:** `aria-busy="true"` on `role="tabpanel"`. Off-screen `<span aria-live="polite">Loading</span>` announces state change to screen readers.
- **`▶ Run Taskset` button:** accessible label is "Run Taskset" (strip the ▶ glyph from the label; use it only visually). Same for `+ Create Task` and `Fork`.

---

## §13 Persona notes by surface decision

| Decision | Alex (PRIMARY) | Sam (SECONDARY) | Riley (TERTIARY) |
|---|---|---|---|
| Decision 1: Descriptor strip field set (Task count · slug · Owner) | Load-bearing — Task count sizes the Job; slug paste into `hud eval` is high-frequency; Owner is lightweight provenance | Load-bearing — slug and Task count are needed before launching a regression Job | Acceptable — slug needed for CLI QA runs; Task count is a delivery-size signal; Owner surfaces who built it |
| Decision 2: Primary CTA = `▶ Run Taskset` always; secondary varies by variant | Correct — primary action is running his model; Fork is secondary | Correct — regression eval is the primary action | Correct — QA run is the primary action |
| Decision 3: Visibility pill present on all detail page variants | Low-value for Alex (he knows if it's his or public) | Low-value — he landed here intentionally | Load-bearing for Riley — must confirm `🔒 Private` before Publish |
| Decision 4: Lineage / provenance (moved to About block in Overview) | Acceptable — he sees `Forked from:` in the About block when evaluating provenance; not needed on every scan | Acceptable — provenance is nice-to-have for regression check, not blocking | Load-bearing — buying-lab customer reads About block for "original or derived?" before using the Taskset |
| Decision 5: Settings tab hidden for non-owners | Correct — removes a dead-end navigation for Alex and Sam | Correct — Sam does not need to configure a Taskset he doesn't own | N/A (Riley is the owner) |
| Decision 6: Default tab = Overview | Correct — leaderboard is his primary landing signal | Correct — regression-check landing signal is the leaderboard | Acceptable — Riley lands on Overview then navigates to Tasks/Settings |
| Decision 7: Leaderboard → chart → description ordering | Correct — leaderboard is the primary signal; description is reference material below the fold | Correct — same ordering for regression check landing | Acceptable — Riley reads description before publishing, but it being below the fold is fine |
| Decision 8: Leaderboard columns (Avg / Best@K / Pass@1 / Steps) | Load-bearing — `Average` is primary; `Best@K` for k-shot eval design; `Steps` for cost-efficiency tracking | Load-bearing — `Average` and `Pass@1` for go/no-go deployment signal | Acceptable — Riley reads `Average` to confirm expected score range for delivery |
| Decision 9: Empty state with CLI snippet + `▶ Run Taskset` | Load-bearing — CLI command is the exact next action | Correct — `▶ Run Taskset` button is the next action for regression setup | Correct — QA run initiates the same way |
| Decision 10: Taskset slug in strip, always visible with copy | Load-bearing — `hud eval <slug>` is his primary CLI invocation | Load-bearing — needed to set up CI-triggered regression runs | Acceptable — `hud eval <slug>` for QA runs |

---

## §14 Open questions (do not block, flag for follow-up)

1. **Star semantics on Private Tasksets:** On the detail page, should Private Tasksets show the star affordance at all? If the Taskset is private to an org, the "community count" concept doesn't apply. Options: (a) show star with org-member-only count (personal bookmark, small number), (b) hide the star entirely for Private Tasksets. The index page's My Team tab demotes the star on private cards to a personal bookmark — the detail page may want to follow the same logic. Decision needed.

2. **Fork count on Private Tasksets:** Can a Private Taskset be forked? If a user forks a Private Taskset they have read access to, the fork count may be meaningful. If forking is restricted to Public Tasksets only, the `Forks` field in the About block is a Public-only concept. Confirm platform behavior.

3. **`▶ Run Taskset` CTA behavior:** Does clicking `▶ Run Taskset` open a Job composition modal (select Model, checkpoint, Job config), or does it navigate to a Job creation page? The Job composition flow is out of scope for this wireframe, but the launch mechanism matters for the button's `aria-haspopup` spec. Flag for Job composition wireframe.

4. **`Fork` CTA behavior:** Does `Fork` open an inline modal (choose a target name + visibility for the fork) or navigate to a fork-creation page? Fork modal is out of scope for this wireframe; flag for a Fork flow wireframe.

5. **Multi-Environment Tasksets:** The Environment chip has been removed from the descriptor strip (2026-06-09). The leaderboard `Model` cell still shows the env chip per row. If a Taskset spans multiple Environments, the Model cell's chip behavior for multi-env is still unresolved — should each row show all env chips, just the primary, or `[env] +N`? Confirm with platform team. (The descriptor-strip portion of this question is now moot.)

6. **`Agent` vs `Model` in leaderboard section header:** Production screenshot (Image #30) uses "Agent" as the h1 for the leaderboard section. `platform.md` confirms Agent = a Model configured with a target for a specific job — the leaderboard does rank Agents (Models configured for a Job), not raw Models. However, the entries in the leaderboard are identified by Model name (Claude Haiku 4.5, Kimi K2.5) — if the same Model was run with two different Agent configurations (different system prompts), would they appear as separate rows? Platform behavior confirmation needed. If no: the section header should be `Model [N]` (what the user identifies entries by). If yes: `Agent [N]` is correct.

7. **Leaderboard row drill path — Traces tab vs trace viewer:** The "View Traces" action per leaderboard row navigates to the Traces tab pre-filtered. Is the Traces tab a tab on this page (which would require a §5 spec in a subsequent pass) or does it open the Trace detail viewer directly? Production screenshot (Images #26–#30) does not show a Traces tab — the 5 tabs are Overview, Tasks, Jobs, Performance, Settings. If there is no Traces tab on the Taskset detail page, the "View Traces" row action should link to the Traces tab on the Model detail page pre-filtered by this Taskset, or to a standalone trace list. Flag for product confirmation.

8. **Description empty state for non-owners:** If a Taskset has no authored description and the current user is a non-owner, should the Description block render at all, or is it absent? Options: (a) render block with muted "No description" text, (b) omit the block entirely. The About block always renders for Variant B if there is metadata to show; the Description block is the owner's content. If there is no content and the user is a non-owner, omitting the block seems cleaner. Decision needed.

9. **Leaderboard pagination:** If more than 5 (or N) Models have run against a Taskset, does the leaderboard table paginate or load-more? At what threshold? The Top 5 Performers chart already caps at 5; the table should probably show more (top 10 default, then load-more). Confirm the default display limit.

10. **"Best@K" column availability by run count:** The `—` semantics for Best@K columns rely on knowing how many Runs/Task each Job had. If different Jobs ran different Runs/Task counts, which one wins? E.g., Job A had 3 Runs/Task and Job B had 5 Runs/Task for the same Model — does the Best@3 column show the best across both? Confirm aggregation logic with platform team.

---

## Out of scope

- **Job detail page (`/jobs/[id]`)** — including the Invalidate action (Image #35: top-right red `[⚠ Invalidate Job]` CTA on Job detail Overview tab) and the QA Agent runner. Separate wireframe. The Taskset Detail Jobs tab cross-links to Job detail via every row click.
- **Job composition modal triggered by `▶ Run Taskset`** — the Job launch flow is a separate wireframe. `▶ Run Taskset` is a button with a defined target; the modal it opens is not designed here.
- **Fork modal** — triggered by `[Fork]` CTA. Fork creation flow is a separate wireframe.
- **Tasks tab content (§5)** — task list table, dynamic columns, add-task flow, Scenario arg editor, LLM-assisted Task generation affordance. Specced in next pass.
- **Jobs tab content (§6)** — Job history, filter chips, Job cards with Run grids, error badges, model chip annotations. Specced in next pass.
- **Performance tab content (§7)** — Configure/Run panel, Overview comparison table, Top workflows, Tool Usage distribution, Trace Dynamics charts. Specced in next pass.
- **Settings tab content (§8)** — Taskset name edit, Purpose toggle (Benchmark / Training), system prompt textarea, Progress Steps, Visibility toggle, Publish/Unpublish flow, Danger Zone with Delete Taskset. Specced in next pass.
- **Trace detail viewer** — drilling into a specific Trace from the "View Traces" row action opens the trace viewer; the trace-detail wireframe is a separate artifact.
- **QA Agent flow from Tasks tab** — Riley's per-task QA Agent affordance lives on the Tasks tab, which is a subsequent pass.
- **Taskset sharing and invite flows** — not in scope for this design phase.

---

## Drift log

- **Visibility pill on all detail page variants (vs. index omission on Public-tab cards):** The index page's Public-tab cards omit the `Public` pill because every card on that surface is public by definition — the pill is redundant. On the detail page, the user may arrive via direct link regardless of context. This wireframe adds `🌐 Public` to the title row for Public Tasksets on the detail page. Justified: entry path is agnostic; the signal must be present.

- **Slug in the descriptor strip (new design; not in production):** Production header (Image #30) shows Taskset name + the three CTAs (`[Create Task] [▶ Run Taskset] [≡]`) but no slug copy affordance in the header area. This wireframe adds the slug to the descriptor strip with a copy button. Justified: the slug is the exact string Alex pastes into `hud eval <slug>`; this is a high-frequency sub-second action identical in nature to the API name copy on the model-detail strip (Decision 3 in model-detail.wireframe.md). Burying it in Settings mirrors the problem model-detail Decision 3 fixed.

- **Declared explicit Valid-only scope on Overview leaderboard + Top 5 chart + aggregates.** Was implicit before; operator-confirmed Invalidate flow (Image #35) made the scope question load-bearing.

- **`[Fork]` CTA for Public non-owner (new design; not visible in production screenshots):** Production screenshots #26–#30 are all of a Private Taskset — no Fork CTA is visible. This wireframe adds `[Fork]` as the secondary CTA for Public non-owner variants. Justified: discovery-loop completion for Alex (and Sam browsing benchmarks) requires a path from "I found an interesting Taskset" to "I can build on it." Fork is the platform primitive for this; it belongs here as a secondary CTA.

- **About block in Overview for Public non-owner (new design):** Production screenshots show no "About" section on the Overview tab. This wireframe adds it for the Public non-owner variant as a proxy for the hidden Settings tab. Justified: the Public non-owner variant loses the Settings tab (Decision 5); the owner/license/created/fork-count information must surface somewhere. The Overview footer is the natural location — it's below the primary content (leaderboard + description) and carries reference metadata. Riley's buying-lab customer reads this before deciding to use the Taskset.

- **Out-of-scope list updated to call out Job detail page (where Invalidate originates).** Cross-link from Taskset Detail Jobs tab → Job detail Overview tab is implicit in row-click navigation.

- **`+ Create Task` vs production `[Create Task]`:** Production header (Image #30) shows `[+ Create Task]` inline. This wireframe retains the `+` prefix — standard HUD convention for create actions observed across screenshots. No change.

- **Default active tab remains Overview:** Production shows Overview as the active tab in Image #30. This wireframe inherits that default. No drift.

- **Secondary CTA `[Fork]` vs production's absence:** Production screenshots do not show a Fork CTA because they are all Private Taskset views. The Fork CTA is specced here as a new design element for the Public non-owner variant. This is not a drift from a production decision — it fills an unspecced gap.

- **Demoted `+ Create Task` from header secondary CTA to overflow `≡` menu (owner variants only).** Production header (Image #30) shows `[+ Create Task]` inline in the header CTAs. This wireframe moves it to the overflow `≡` menu for Private owner (Variant A) and Public owner (Variant C). Reason: domain-review FAIL — Alex anti-pattern (`personas.md:10`). Alex authors Tasks via `hud taskset add-task` or `scenario.task(arg=value)` in Python, never via a header form. A header `+ Create Task` CTA places form-based Task authoring on Alex's primary scan path, which violates the anti-pattern. Production has it inline; this is intentional divergence justified by persona discipline.

- **Icon removed from title row; fork-default-visibility corrected.** (a) The leading Environment icon / Taskset glyph before the h1 title has been removed. The Environment is already conveyed by the descriptor strip's Environment chip one line below — the icon in the title row was redundant and added visual noise to the primary identity signal. (b) The §9 note on forked Tasksets previously implied a fork defaults to Private (Variant A). Corrected: a fork of a Public Taskset is Public by default (Variant C with lineage line). The lineage line is not exclusive to Private forks — it applies to any forked Taskset per Decision 4.

- **2026-06-09 — Descriptor strip + lineage header anatomy change (Operator review).** Three changes applied uniformly to Variants A / B / C:
  1. **Environment chip dropped from the descriptor strip.** The env chip led the strip but is redundant — environment is present in the leaderboard Model cell (per-row env tag) and elsewhere. Alex's landing scan is better served by leading with Task count (sizing signal) rather than a chip that repeats info already in the tab content. Operator-requested; applied.
  2. **`Owned by: org` added as the third field of the descriptor strip**, replacing the standalone lineage line's Owner clause. The descriptor strip is now `N Tasks · slug [⎘] · Owned by: org`. Order: Task count first (comprehensiveness / cost sizing), slug second (immediate CLI action), Owner third (provenance, least time-sensitive). Strip is now structurally identical across all three variants — no conditional extra line for any variant.
  3. **`Forked from:` provenance moved from the header's conditional lineage line into the Overview tab's About block.** Was: a separate sticky-header line appearing only on forked Tasksets. Now: a `Forked from: <name> (<slug>) ↗` row inside the existing About block `<dl>` (Variant B), replacing the terse `Source` label with a fully descriptive `Forked from:` label. Variants A + C carry forked-from in their Settings tab (existing pattern). Rationale: forked-from is reference provenance, not a landing-scan signal; the page header should be structurally consistent across all Tasksets; the About block is the correct altitude for this class of metadata.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md). Visual references: operator-supplied production screenshots Images #26–#31 of hud.ai Taskset Detail and model-detail pages — Jun 2026. Structural anchor: [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md). Sibling index wireframe: [`docs/design/screens/tasksets.wireframe.md`](./tasksets.wireframe.md). AppShell chrome: [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md).*
