# Models Index — Screen Wireframe (`/models`)

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome (sidebar, credits widget, user chip). This wireframe covers the `MAIN` region only.
- [`docs/design/screens/environments.wireframe.md`](./environments.wireframe.md) — structural sister with activity-bar precedent.
- [`docs/design/screens/tasksets.wireframe.md`](./tasksets.wireframe.md) — older structural sister; tab / filter / pagination conventions.

Visual references: operator-supplied screenshots (Image #1 dark aspirational, Image #2 current production light) — Jun 2026.

---

## HUD-side question answered

### What does each persona DO on this page?

**Alex (Frontier RL Researcher — PRIMARY):** Picks a Model for a Job. His criteria are crisp: `Trainable` (he may want to fine-tune), `Reasoning` (some tasks benefit from chain-of-thought compute), cost (he watches spend per training run), and speed (latency matters across 50-run jobs). He is not browsing for discovery — he already has two or three candidate models in mind and is confirming availability, current pricing, and capability flags before launching a Job. He checks the Model Gateway status to know the routing layer is live before submitting. "My models" = the fine-tuned private models his org trained via HUD's RL training pipeline — this is a real, meaningful category for him.

**Sam (Applied Agent Engineer — SECONDARY):** Compares models for regression eval. His question is "which model performs best at this task class at this cost?" He needs `PRICE/M` and `SPEED` to build a cost-efficiency argument for a deployment decision, and `REASONING` to know whether the model will work well on multi-step workflows. He rarely trains, so "My models" count is typically 0 or 1 unless his team has a fine-tuned model.

**Riley (RL Environment Vendor — TERTIARY):** Visits occasionally to check which models his clients are likely running against his environments. Not a primary surface for him. He may filter by `Trainable` to confirm what base models clients can use for RL fine-tuning with his environments. "My models" = likely 0 for Riley unless a client commissioned a custom model.

### Are the "All models / My models" tabs orthogonal and load-bearing?

**Yes, and clearly so.** "All models" = every Model accessible through the Model Gateway for this org's tier (Anthropic, OpenAI, Google, xAI public models + any org-trained private Models). "My models" = the subset of private Models the org has fine-tuned via HUD's RL training pipeline (i.e. produced by a Training Job). These are first-class entities in the platform vocabulary — a fine-tuned private Model lives alongside base models and is URL-addressable. The tabs are orthogonal: "My models" is a strict subset of "All models"; they do not overlap in concept.

Count of 4 "My models" is realistic for an active RL research org — each `hud rl run` that completes produces a new private Model. An org that has completed 4 RL training runs has 4 private Models. This is a small but non-trivial count.

### Are the filter chips the right set?

The operator's proposed chips: `Provider ▾` · `Trainable (16)` · `Reasoning (18)` · `Favorites`.

**Keep all four.** Each is a distinct filter dimension:
- `Provider ▾` — source routing (Anthropic vs OpenAI vs Google vs xAI). Used by Alex when a specific lab's model is required by a Job configuration; by Sam when corporate policy restricts provider.
- `Trainable` — capability flag. Load-bearing for Alex. He will filter by this before selecting a model for a training Job.
- `Reasoning` — capability flag. Both Alex and Sam use this. Reasoning models are a distinct class for multi-step problem solving; they have a different cost/latency profile.
- `Favorites` — personal bookmark. Sam uses this to surface his 2–3 "go-to" models for regression eval without scrolling the full list.

**Not adding: context window or modality.** Context window is visible on the detail page and is a secondary decision signal — it does not change the model list structure, and the vast majority of HUD workloads are not context-window-constrained. Modality (vision, audio) would be valuable at the gateway layer but adds complexity not yet needed for the primary use cases. Flag as a future addition once multimodal Jobs become a primary workflow.

**Not adding: a "by provider" group-by control.** The Provider filter chip already narrows to a provider. Group-by adds navigation overhead that is unjustified for a list of 27 models (vs 2,500 Environments). The list is short enough that a flat filtered list is the right default.

### Speed column visualization

`45 t/s` with a mini bar below the number. The bar is **relative-to-fastest** within the currently visible filtered set — the fastest model in the list fills 100% of the bar width; all others scale proportionally. This is not an absolute scale (which would require defining a maximum). **Consequence:** the bar recalibrates when the Trainable or Reasoning filter is active, since the visible set changes. The bar is decorative-informational — it helps the eye rank relative speed without reading every number; the `t/s` value is the primary data.

Bar width = `model_speed / max_speed_in_visible_set × 100%`.

Lock icon: a model name with a lock icon (e.g. `GPT 5.4 🔒`) indicates gated/restricted access — the model is available on the Gateway but requires additional org-level access grant. Clicking the row navigates to the detail page which shows the access request flow.

### Price/M format

`$3 / $15` = input cost per 1M tokens / output cost per 1M tokens. Convention:
- Format: `$[input] / $[output]` — always both, never one.
- Decimal precision: drop trailing zeros (`$3` not `$3.00`; `$0.15` not `$0.150`). Use 2 decimal places when non-integer (`$2.50`).
- Free tier / open-weight: `Free` in both cells. No `$0 / $0` — "Free" is the clearer signal.
- Unpublished / private models (trained via RL): `—` in the PRICE/M cell. The model runs on HUD's infra and is billed by compute-hour, not per-token; the per-token rate is not meaningful here.

### Gateway running indicator + version

`● Running v2.0.0`

The status indicator is plain text — no link. The `↗` has moved to the "Model Gateway" noun in the subtitle (see §2 page header anatomy), where it deep-links to gateway docs. Load-bearing for trust: Alex submits inference-heavy Jobs; the Model Gateway being down or degraded means jobs will fail. Showing the status inline on the page that IS the gateway means he does not have to navigate away to check.

**Status states (minimum 2, spec both):**

| State | Indicator copy | Dot color |
|---|---|---|
| **Running** | `● Running v2.0.0` | Green (operational) |
| **Degraded** | `● Degraded v2.0.0 — elevated latency` | Amber (warning) |
| **Outage** | `● Outage — requests may fail` | Red (error) |

In Degraded and Outage states, the indicator copy is visually emphasized (amber/red dot, copy weight increases slightly — token-phase decision). No blocking modal — ambient signal only. The Job launch flow itself surfaces a warning if the gateway is degraded at submit time.

Version number format: `v{major}.{minor}.{patch}` — exact, never rounded.

---

## 1. Shared layout note

The `MAIN` region is the content area to the right of AppShell's persistent sidebar. This wireframe does not redraw the sidebar, credits widget, or user chip — those are fully specified in `app-shell.wireframe.md`.

```
┌─────────────────────┬─────────────────────────────────────────────────────────┐
│  SIDEBAR (AppShell) │  MAIN                                                   │
│  [see app-shell     │                                                         │
│   wireframe.md]     │  [MODELS INDEX CONTENT — this file]                     │
│                     │                                                         │
└─────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Page header anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER  (sticky — stays pinned as table scrolls)                           │
│                                                                                  │
│  ┌─────────────────────────────────────────────┐  ┌────────────────────────────┐ │
│  │  Models  [?]                                │  │  (no CTA — read-only index)│ │
│  │  (h1 / page title)  (docs icon)             │  └────────────────────────────┘ │
│  └─────────────────────────────────────────────┘                                 │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │  Models served via the Model Gateway ↗.  ● Running v2.0.0                  │ │
│  │  (page subtitle + gateway docs link + gateway status indicator)             │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- "Models" is the h1 / page title. Platform-canonical noun.
- `[?]` docs icon immediately right of title — same ghost-weight `<a>` pattern as Environments and Tasksets. `aria-label="Models documentation, opens in new tab"`. Deep-links to `docs.hud.ai/concepts/models`.
- **No `+ New Model` button.** Models are not created by users — they are either public (served via the Model Gateway by HUD) or private (produced by a completed RL Training Job). There is no user-initiated "create model" flow from the index. Fine-tuning produces a new private Model as a side-effect of a Training Job, not via a create button here.
- **Gateway status indicator** sits inline with the subtitle row. This is not a full activity bar with live-updating counters (no "X inference calls in last 24h" polling) — it is a static version-and-health indicator. Two reasons: (a) the Models page is the entry point for a routing decision, not a monitoring surface; (b) the sidebar's Credits widget already provides ambient usage signaling.
- **"Model Gateway ↗" link** — the `↗` attaches to "Model Gateway" in the subtitle, deep-linking to gateway docs (`docs.hud.ai/concepts/model-gateway` or equivalent). The version string (`Running v2.0.0`) is plain text with no link — it is a status indicator, not a navigation target. `aria-label="Model Gateway documentation, opens in new tab"` on the link element.

**Scroll behavior — sticky page header:**
- Full page header (title + docs icon + subtitle + gateway status) stays pinned to the top of the content area as the table scrolls.
- Rationale: the gateway status indicator is an ambient trust signal — losing it mid-scroll severs the contextual anchor the user made when landing on the page.
- Subtle visual separator (bottom border or shadow) at the lower edge of the sticky region.

---

## 3. Tab + filter row anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TAB + FILTER ROW                                                                │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  TAB BAR  (sticky, below page header)                                      │  │
│  │                                                                            │  │
│  │  [All models  27]  [My models  4]                                          │  │
│  │  ← tab underline variant; active = underlined; count chip muted            │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Filter row  (below tabs, scrolls with content)                                  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────┐                    │
│  │  [🔍]  Search models…                                   │                    │
│  │  (search input, expands to fill available space)         │                    │
│  └─────────────────────────────────────────────────────────┘                    │
│                                                                                  │
│  [Provider ▾]   ← provider source filter                                        │
│  Multi-select dropdown. Options: Anthropic · OpenAI · Google · xAI · HUD        │
│  "HUD" = org-trained private Models (shown on My models tab too for consistency)│
│                                                                                  │
│  [Trainable]   ← capability chip, toggleable                                    │
│  When active: shows only models with Trainable = ✓. Count badge: (16)           │
│                                                                                  │
│  [Reasoning]   ← capability chip, toggleable                                    │
│  When active: shows only models with Reasoning = ✓. Count badge: (18)           │
│                                                                                  │
│  [Favorites]   ← personal bookmark chip, toggleable                             │
│  When active: shows only models the user has starred                             │
│                                                                                  │
│  [27 models · Most used ▾]   ← result count + sort button                       │
│  Right-justified in the filter row. Count updates as filters apply.              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

**Tab naming:**
- "All models" — every accessible model in the Gateway for this org.
- "My models" — private Models produced by RL Training Jobs in this org. Subset of All models.
- Tab default: "All models" is the default active tab. Alex typically starts here to confirm which base model is best before a Job. He switches to "My models" when he wants to run a Job against a specific fine-tuned checkpoint.
- Tab counts are live: format is `[All models  27]` — integer after label, muted chip.

**Filter chips vs dropdown menus:**
- `Trainable` and `Reasoning` are toggle chips (not dropdowns). One click activates; second click deactivates. Visual distinction: inactive = outline chip; active = filled/highlighted chip with count badge.
- `Favorites` is also a toggle chip.
- `Provider` is a multi-select dropdown (multiple providers can be selected at once).

**Result count + sort — right-justified:**
- `27 models · Most used ▾` — count reflects the currently filtered set. Updates as filters change.
- Sort opens a dropdown. See §7 for sort options.

**Filter chip logic — combined filters:**
- `Trainable` + `Reasoning` applied together use AND logic: only models that are both Trainable AND have Reasoning capability appear. This is the correct choice for Alex's primary use case — he wants a model that can be fine-tuned AND uses chain-of-thought compute.
- `Provider` multi-select uses OR logic within the provider dimension: selecting Anthropic + OpenAI shows models from either provider.
- Capability chips (Trainable, Reasoning) are ANDed with the Provider selection.
- `Favorites` is ANDed with all other active filters (shows only starred models from the filtered set).

**Filter chips on My models tab:**
- All four chips remain visible and apply to the My models subset.
- `Trainable` on My models is almost always all-true (private models are inherently trained), so it will likely show a 100% count when active — still show the chip for consistency and because edge cases exist.
- `Provider` on My models: base model provider of the fine-tuned checkpoint. Useful when an org has RL-trained both an Anthropic-base model and an OpenAI-base model.

**Search scope:** filters within the active tab only. Placeholder: "Search models…" on both tabs (same surface, same label).

**Scroll behavior:** filter row scrolls with content (does not pin). Tab bar stays pinned below the page header. At 27 models, vertical scroll is short — the filter row pinning overhead is not justified.

---

## 4. Table / list anatomy

The Models index is a **table with fixed columns**, not a card grid or card list. Rationale: the primary comparison action (Alex comparing `claude-opus-4-5` vs `gpt-5.4` on Trainable + Price) requires aligned values in the same column across rows. Card layout would require the user to mentally align values across cards — high friction for a comparison-heavy page.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  COLUMN HEADERS  (sticky at top of table, below filter row)                                          │
│                                                                                                      │
│  MODEL                 │ PROVIDER  │ PRICE/M      │ SPEED           │ REASONING │ TRAINABLE │ USAGE     │ ☆ │
│  (name + model-id)     │           │ (in / out)   │ (t/s + bar)     │           │           │ (sparkline│   │
│  (muted, small)        │           │              │                 │           │           │ + total)  │   │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Column proportions (not pixel-precise — screen-spec phase):**

| Column | Width signal | Notes |
|---|---|---|
| MODEL | largest (~30%) | Name + monospace Model ID; provider icon prefix |
| PROVIDER | small (~10%) | Text label only (Anthropic, OpenAI, Google, xAI) |
| PRICE/M | small (~10%) | `$3 / $15` format; right-aligned |
| SPEED | medium (~12%) | `45 t/s` + mini bar below; right-aligned value |
| REASONING | small (~8%) | `✓` or `—`; centered |
| TRAINABLE | small (~8%) | `✓` or `—`; centered |
| USAGE | medium (~12%) | Sparkline + total (e.g. `3.7M`); right-aligned |
| ☆ | narrow (~5%) | Star count; right-aligned |

### 4.1 MODEL cell anatomy

```
┌───────────────────────────────────────────────┐
│  [provider icon]  GPT 5.4  🔒                  │  ← name row (name + optional lock)
│                   gpt-5.4-0614  [⎘]            │  ← model-id row (monospace + copy icon)
└───────────────────────────────────────────────┘
```

- **Provider icon**: small icon (16×16) left of model name. Anthropic flame, OpenAI logo, Google G, xAI mark. Decorative — the PROVIDER column carries the accessible label.
- **Model name**: prominent, regular weight. The human-readable label (e.g. `Claude Opus 4.5`, `GPT 5.4`, `Gemini 2.0`).
- **Lock icon** (`🔒`): inline right of model name. Indicates gated/restricted access — the model is visible in the gateway but requires an access grant to use in Jobs. No lock = available to run immediately. Lock does NOT disable the row — the user can still click to the detail page to request access.
- **Model ID** (`model-id`): monospace, muted weight. The exact string used in the SDK (`claude-opus-4-5`, `gpt-5.4-0614`). One-line, no wrap. Truncate with ellipsis if the column is narrow; full ID in tooltip.
- **Copy icon** (`[⎘]`): inline right of Model ID. Copies the Model ID to clipboard. Always visible (not hover-only) because Alex frequently needs to paste the model ID into his SDK config. `aria-label="Copy model ID"`. On copy: brief feedback ("Copied!") inline or via toast.
- Clicking anywhere in the MODEL cell (except the copy icon) navigates to `/models/[model-id]`.

### 4.2 PRICE/M cell anatomy

```
$3 / $15
```

- Format: `$[input] / $[output]` per million tokens.
- Right-aligned within the column.
- Free-tier models: `Free` (single word).
- Unpublished / private models (My models tab): `—` (em dash).
- No color coding for price tiers — color is reserved for state encoding (personality principle: "Color = state, never decoration").

### 4.3 SPEED cell anatomy

```
45 t/s
[██████░░░░]   ← mini bar below the value
```

- `[value] t/s` — tokens per second, right-aligned.
- Mini bar: horizontal bar below the value, spans ~80% of the cell width. Width = `model_speed / max_speed_in_visible_set`. The bar has no explicit axis labels — it is a relative rank indicator.
- When filter changes the visible set, bar widths recalculate. The fastest model in the new visible set fills 100%. **UX implication:** bar widths jump on filter change because the reference point shifts — the same model that was 38%-wide unfiltered may become 100%-wide when only one model remains. This recalibration must be communicated:
  1. The column header `SPEED` carries a tooltip on hover: `"Bar shows speed relative to fastest model in the current view"`.
  2. The bar width change is animated (motion-designer scope — smooth, not instant).
  Without both, users anchoring on bar widths will be confused by filter-induced jumps.
- "N/A" if speed is not published for the model (rare). Bar omitted.
- My models (fine-tuned): speed is measured empirically at training completion and shown.

### 4.4 REASONING + TRAINABLE cells

```
✓ Yes   (or)   —
```

- `✓` = capability present. Text "Yes" may be included for a11y (screen reader reads "checkmark" without context otherwise). Or use `aria-label="Reasoning: yes"` on the cell.
- `—` = capability absent. `aria-label="Reasoning: no"`.
- Centered in the column.

### 4.5 USAGE cell anatomy

```
[▇▇▆▅▇▆▇▄]    ← sparkline (7 bars, last 7 days)
3.7M           ← total usage (inference calls, lifetime)
```

- Sparkline: 7 bars representing last 7 days of inference calls through this model via the HUD Gateway. Relative height within the cell — highest day fills the bar height. Width of each bar is fixed.
- Total: aggregate inference call count (lifetime or rolling 90-day — flag as open question §9 item 3). Format: abbreviated with SI suffix: `3.7M`, `142K`, `21`. Never `3,700,000`.
- Usage is org-scoped — shows usage for the current org, not platform-wide. This is operationally relevant to Sam and Alex tracking which models they are actually using.
- My models: usage shows inference calls against the fine-tuned model, not against the base model.

### 4.6 Star column

```
☆ 74
```

- Star icon + count.
- Community-wide star count (same semantics as Environments: global, not org-scoped).
- Clickable — toggles the user's personal star for this model. Filled star = starred; outline = not starred.
- Feeds the Favorites filter chip.
- Zero state: `☆ 0`, muted — same convention as Environments.
- On My models: star count = team-member bookmark count (typically 0–5, since private models are not community-visible). Demoted visual weight, same as private Environment convention.

### 4.7 Full table row (example)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [Anthropic]  Claude Opus 4.5      │ Anthropic │  $15 / $75   │  32 t/s    │  ✓ Yes  │  ✓      │ [▄▇▅▇▆▅▆▇]  │ ☆ 142 │
│               claude-opus-4-5 [⎘] │           │              │  [████░░░] │         │         │   9.2M      │       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [OpenAI]     GPT 5.4  🔒          │ OpenAI    │  $3 / $15    │  45 t/s    │  ✓ Yes  │  —      │ [▇▆▇▇▅▆▇▆]  │ ☆ 74  │
│               gpt-5.4-0614  [⎘]   │           │              │  [██████░] │         │         │   3.7M      │       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Google]     Gemini 2.5 Flash     │ Google    │  $0.075 / $0.30 │ 120 t/s │  —      │  —      │ [▅▆▆▇▆▅▆▇]  │ ☆ 31  │
│               gemini-2.5-flash [⎘]│           │              │  [████████] │         │         │  22.1M      │       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Entire row is clickable to `/models/[model-id]`. Star button (`☆`) is independently clickable and does not navigate. Copy icon (`[⎘]`) on Model ID is independently clickable and does not navigate.

**Row hover state:** subtle background highlight. Copy icon transitions from muted to visible on hover (always visible on touch devices — no hover).

---

## 5. Table scroll and sticky behavior

The table column headers are **sticky** within the scroll region — they stay visible as the user scrolls down a long model list.

Sticky layers from top to bottom:
1. Page header (title + subtitle + gateway docs link + gateway status) — stickiest layer
2. Tab bar — sticky below page header
3. Filter row — scrolls with content (27 models does not justify pinning)
4. Table column headers — sticky within the table container, below the tab bar

On scroll:
- Page header + tab bar + column headers all remain in view.
- Filter row scrolls away after a short scroll distance.

---

## 6. Sort menu

Triggered by `[Most used ▾]` in the filter row (right side of the row).

```
┌────────────────────────────┐
│  SORT                      │
│                            │
│  ✓  Most used              │  ← default; by usage (org-scoped, lifetime)
│     Newest first           │  ← by date added to the gateway
│     Oldest first           │
│     Name (A–Z)             │
│     Fastest first          │  ← by speed (t/s descending)
│     Lowest price           │  ← by input price per 1M tokens ascending
│                            │
└────────────────────────────┘
```

- Single-select. Selected option label shown inline in the sort button.
- "Most used" = org-scoped usage (lifetime inference calls through this org for that model). Relevant default: Alex and Sam see the models they actually use most at the top.
- "Newest first" = date the model version was added to the HUD Model Gateway. Useful for discovering new models.
- "Fastest first" / "Lowest price" — explicit comparison sorts for Sam's cost-efficiency analysis.
- Sort persists in URL query param (`?sort=most-used`).

---

## 7. My models tab — special treatments

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  TAB BAR                                                                                             │
│  [All models  27]  [My models  4 ✓]  ← checkmark on My models tab when active, to be distinguished  │
│                                                                                                      │
│  Filter row (same as All models, all 4 chips present)                                                │
│                                                                                                      │
│  TABLE (same columns)                                                                                │
│                                                                                                      │
│  [HUD]  rl-webagent-v2              │  HUD      │  —           │  38 t/s    │  —      │  ✓      │  [▄▅▆▅▄▆▇▅]  │ ☆ 2  │
│         hud-rl-webagent-v2 [⎘]     │           │  (private)   │  [███░░░░] │         │         │  14K         │      │
│                                                                                                      │
│  EMPTY STATE (zero My models):                                                                       │
│  [model icon]                                                                                        │
│  Train your first model                                                                              │
│  hud rl run <taskset> -m <base-model-id>                                                             │
│  (monospace, copyable)                                                                               │
│  Read the docs ↗                                                                                     │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**My models tab — field differences vs All models:**

| Column | All models | My models |
|---|---|---|
| MODEL | Provider icon = base model provider | Provider icon = HUD icon (org-trained) |
| PROVIDER | Anthropic / OpenAI / Google / xAI | HUD (always — these are org-produced) |
| PRICE/M | Published per-token pricing | `—` (billed by compute-hour via Job) |
| USAGE | Inference calls against this model | Same — inference calls against this fine-tuned model |
| ☆ | Community-wide count | Team bookmark count (private — not community visible) |
| Lock icon | Gated public models | Not shown — org owns these models |

**My models row name pattern:** fine-tuned model names follow the convention `[base-model]-[org-slug]-[version]` (e.g. `claude-sonnet-4-6-acme-v3`) or the user-assigned name. If user has not named the model, show the auto-generated ID.

---

## 8. Empty states

### 8a. All models — zero results from filter

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE  (filters active, zero matches)                                     │
│  centered in the table body area                                                 │
│                                                                                  │
│  No models match the active filters.                                             │
│  (prominent, centered)                                                           │
│                                                                                  │
│  [Clear filters]                                                                 │
│  (outline button)                                                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 8b. All models — search no matches

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE  (search query, no matches)                                         │
│                                                                                  │
│  No models match "sonnet"                                                        │
│  (query echoed verbatim in quotes)                                               │
│                                                                                  │
│  [Clear search]                                                                  │
│  (outline button)                                                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 8c. My models — zero trained models

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATE  (My models tab, zero org-trained models)                           │
│  centered in the table body area below the filter row                            │
│                                                                                  │
│  [model icon]                                                                    │
│                                                                                  │
│  Train your first model                                                          │
│  (prominent)                                                                     │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────┐                  │
│  │  hud rl run <taskset> -m <model-id>              [⎘]       │                  │
│  │  (monospace, copyable CLI command)                          │                  │
│  └────────────────────────────────────────────────────────────┘                  │
│                                                                                  │
│  Read the docs ↗                                                                 │
│  (tertiary text link, opens in new tab → docs.hud.ai/rl/training)               │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**
- Directive heading ("Train your first model"), not declarative. Same pattern as Environments empty state.
- CLI command uses `hud rl run` — the established CLI verb. `<taskset>` and `<model-id>` are placeholder argument tokens in angle brackets.
- "Read the docs ↗" links to the RL training docs. Tertiary link, same pattern as Environments.
- No illustration, no marketing copy. Spare + Earnest.

---

## 9. Error state

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  ERROR STATE  (table body, network/fetch failure)                                │
│                                                                                  │
│  [alert icon]                                                                    │
│                                                                                  │
│  Couldn't load models — try again.                                               │
│  (prominent, centered)                                                           │
│                                                                                  │
│  [Retry]                                                                         │
│  (primary button)                                                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Replaces only the table body. Page header, gateway status, tabs, search, and filter chips remain rendered and interactive as recovery actions.

---

## 10. Loading state (skeleton)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SKELETON — table rows  (same column layout as populated table)                  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐   │
│  │  [░░░░░░░░░░░░░░░]  [░░░░░]  [░░░░░]  [░░░░░▓░]  [░░]  [░░]  [░░░▓▓░]  [░]│   │
│  │  [░░░░░░░░░░░░░]                                                            │   │
│  ├───────────────────────────────────────────────────────────────────────────┤   │
│  │  (repeat 8 rows)                                                           │   │
│  └───────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- Two-row skeleton per model: name bar (full width of MODEL column) + Model ID bar (shorter, monospace-weight indicator).
- Speed column skeleton includes the bar shape below the value placeholder.
- Usage column skeleton includes 7 small bar shapes (sparkline) + total bar.
- No spinner. Skeleton prevents layout shift.

---

## 11. Responsive behavior

### Desktop — full table

All 8 columns visible. Table scrolls vertically. Fixed column widths.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  [Models] [?]                                                                  │
│  Models served via the Model Gateway ↗.  ● Running v2.0.0                     │
│                                                                                │
│  [All models  27]  [My models  4]                                              │
│  [Search models…]  [Provider ▾]  [Trainable]  [Reasoning]  [Favorites]        │
│  [27 models · Most used ▾]  (right-justified)                                  │
│                                                                                │
│  MODEL           │ PROVIDER │ PRICE/M  │ SPEED     │ REASON │ TRAIN │ USAGE │☆│
│  ───────────────────────────────────────────────────────────────────────────  │
│  [Anthropic] Claude Opus 4.5    │ Anthropic │ $15/$75 │ 32t/s  │ ✓  │ ✓  │ ▇▆ 9.2M │☆142│
│              claude-opus-4-5⎘  │           │         │ [████] │    │    │        │    │
│  [OpenAI] GPT 5.4 🔒            │ OpenAI   │ $3/$15  │ 45t/s  │ ✓  │ —  │ ▇▆ 3.7M │☆ 74│
│              gpt-5.4-0614⎘     │           │         │ [████] │    │    │        │    │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet — reduced columns

At tablet widths, `PROVIDER` is absorbed into the MODEL cell (shown below the model name as a text label), and `USAGE` sparkline collapses to total-only (no sparkline bars).

Columns visible at tablet: MODEL + Provider inline · PRICE/M · SPEED · REASONING · TRAINABLE · ☆

Usage column hidden at tablet (recoverable from detail page).

### Mobile — essential columns only

At mobile widths: table collapses to a list of model name rows. Each row shows:
- Model name + lock icon (if applicable)
- Provider icon
- Price/M inline right
- Capability badges: `✓ Reasoning` · `✓ Trainable` (when true; omitted when false — space is tight)

Speed, Usage, and Star columns hidden on mobile. Filter row collapses to `[⚙ Filters ▾]` trigger (same pattern as Environments mobile). Tab bar remains full-width.

---

## 12. Keyboard and accessibility

**Page landmark structure:**
- `<main id="main-content">` wraps the Models index MAIN region.
- Page header: `<h1>Models</h1>`.
- Gateway status: adjacent to subtitle, `aria-live="polite"` on the status dot+text span (announces status changes — Degraded or Outage transitions).
- Gateway docs link (`↗` on "Model Gateway"): `aria-label="Model Gateway documentation, opens in new tab"`. Opens `docs.hud.ai/concepts/model-gateway` in a new tab.
- Tab bar: `role="tablist"`, each tab is `role="tab"`, `aria-selected`, `aria-controls`.

**Table structure:**
- `<table role="grid">` or `<table>` with `<thead>` column headers.
- Column headers: `<th scope="col">` with appropriate `aria-sort` attributes on sortable columns.
- Each data row: `<tr>` with clickable link semantics. The entire row links to `/models/[model-id]` — implemented as a `<a>` wrapping each `<td>` content, or via JS row-click with an accessible affordance.
- Model ID copy button: `<button aria-label="Copy model ID claude-opus-4-5">`. Copy icon does not navigate.
- Star button: `<button aria-label="Star Claude Opus 4.5" aria-pressed="false/true">`. Independently focusable.
- Lock icon: `aria-label="Restricted access — requires access grant"` on the icon element. Screen reader announces it inline with the model name.

**REASONING / TRAINABLE cells:**
- `✓` rendered as `<span aria-label="yes">✓</span>` or equivalent.
- `—` rendered as `<span aria-label="no">—</span>`.

**Speed bar:**
- Decorative. `aria-hidden="true"` on the bar element. The `t/s` value is the accessible data point.

**Sparkline:**
- Decorative. `aria-hidden="true"` on the bars. The total count is the accessible data point.

**Filter chips:**
- Each chip: `<button aria-pressed="true/false">`. Active chips have `aria-pressed="true"`. Count badge is inside the button label.
- Provider dropdown: `aria-haspopup="listbox"`, `aria-expanded`.

**Gateway status `aria-live`:**
- Polite live region. Announces status transitions: "Model Gateway status changed to Degraded — elevated latency."

**Tab navigation:**
- `Tab` key: All models tab → My models tab → Search input → Provider filter → Trainable chip → Reasoning chip → Favorites chip → Sort button → then into table rows.
- Arrow keys navigate between tabs.
- Within table: `Tab` moves between rows; within a row: `Tab` moves between the row link → copy button → star button.
- `Enter` on a row (except interactive elements) navigates to the model detail page.

---

## Component summary

| Component | Usage in this screen | Notes |
|---|---|---|
| `PageHeader` | Title + docs icon + subtitle + gateway docs link + gateway status | `h1` with inline docs icon. No CTA button (read-only). Sticky. |
| `GatewayStatus` | Status dot + version + running/degraded/outage copy (plain text, no link) | `aria-live="polite"` on status span. Two states: Running, Degraded/Outage. |
| `DocsIcon` | Adjacent to page title | Same pattern as Tasksets + Environments. |
| `TabBar` | All models / My models tabs with count chips | `role="tablist"`. Sticky below page header. |
| `SearchInput` | Filters within active tab | Debounced. `aria-live` result count. |
| `ProviderFilterMenu` | Multi-select dropdown | Anthropic · OpenAI · Google · xAI · HUD. |
| `CapabilityChip` | Trainable · Reasoning toggle chips | `aria-pressed`. Active = filled chip with count badge. |
| `FavoritesChip` | Favorites toggle chip | Feeds from user star state. |
| `SortMenu` | Sort dropdown — right-justified in filter row | Options: Most used, Newest first, Name A–Z, Fastest first, Lowest price. |
| `ModelTable` | Table with 8 columns | `<table>` with sticky column headers. Sortable columns. |
| `ModelRow` | One row in the table | Entire row links to detail page. Contains: provider icon, name, lock, model-id, copy button, capability cells, speed bar, sparkline, star button. |
| `SpeedCell` | Speed value + relative bar | Bar = relative-to-fastest within visible set. `aria-hidden` on bar. |
| `SparklineCell` | 7-bar sparkline + total | `aria-hidden` on bars. Total is the accessible data point. |
| `StarButton` | Per-row star toggle | Inline in table. Same state machine as Environments `StarButton`. Zero-state: outline + `0`, muted. |
| `ModelIdCopy` | Monospace ID + copy button | Always visible copy affordance. Feedback on copy action. |
| `LockBadge` | Inline lock icon on restricted models | `aria-label` on icon. Does not disable the row. |
| `EmptyState` | Filter no-match, search no-match, My models zero | Three variants. Directive copy. CLI command in My models empty state. |
| `ErrorState` | Fetch failure | "Couldn't load models — try again." + Retry. Same pattern as Environments. |
| `SkeletonRow` | Loading state | 2-bar MODEL column skeleton + speed bar shape + sparkline bar shapes. |
| `MobileFiltersSheet` | Mobile filter overflow | Same pattern as Environments. Provider + capability chips + sort in bottom sheet. |

---

## 13. Persona notes by surface decision

| Decision | Alex (PRIMARY) | Sam (SECONDARY) | Riley (TERTIARY) |
|---|---|---|---|
| Table layout (not card grid) | Correct — comparison is his primary action; aligned columns make Trainable+Price scan instant | Correct — model comparison for deployment decision benefits from aligned values | Acceptable — he visits rarely; table is fine |
| Trainable chip (prominent, with count) | Load-bearing — his first filter when selecting a base model for a Training Job | Useful — he wants to know which models support fine-tuning even if he doesn't do it | Not relevant as a primary concern |
| Speed bar (relative, recalibrates) | Appreciates the relative ranking — he knows the fastest model in his filtered set matters more than absolute t/s across all models | Same — cost-efficiency analysis compares within his evaluated set | Not relevant |
| Price/M `—` for private models | Correct — he knows private model billing is job-level; `—` is honest | Understood | N/A |
| No `+ New Model` button | Correct — he creates models by running Training Jobs, not by clicking a form | Correct | Correct |
| My models tab (count = 4) | Primary user — his fine-tuned checkpoints live here; he switches here to pick a checkpoint for the next eval pass | Secondary — may have 0–1 fine-tuned models; mostly stays on All models | Tertiary — typically 0 |
| Lock icon on gated models | Important — he should know before selecting a model for a Job whether he can run it; navigates to detail page for access request | Same — critical before composing a Job | Not relevant |
| Gateway status (Running/Degraded/Outage) | Load-bearing — submits inference-heavy Jobs; degraded gateway = job cost and latency risk | Relevant at submission time | Ambient |
| Empty state for My models (CLI command) | Perfect — he already knows the CLI; the command is a quick-reference, not instruction | Useful reminder | Not visited |

---

## 14. Open questions (do not block, flag for follow-up)

1. **Gateway version format**: the version shown in "Running v2.0.0" — is this the HUD Model Gateway software version, or the API version exposed to callers? Confirm with platform team. The `↗` on "Model Gateway" in the subtitle links to gateway docs; confirm the canonical docs URL (`docs.hud.ai/concepts/model-gateway` or equivalent).

2. **USAGE column scope + window**: is usage in the USAGE column (a) org-scoped lifetime inference calls, (b) org-scoped last 90 days, or (c) platform-wide? Recommendation: org-scoped (Alex and Sam are interested in their own model usage patterns). Confirm scope with platform team before implementation.

3. **USAGE column for private models**: for My models, what does "usage" mean if the model was only used internally? Confirm: is it inference calls to the fine-tuned model, or training-run invocations, or something else?

4. **Lock icon access request flow**: clicking a locked model navigates to the detail page which shows an access request form. Confirm that this form exists (or is planned) on the detail page — if not, the lock icon's click target needs to be specified (modal inline? external form?). Do not block wireframe on this.

5. **Sort persistence**: does the sort persist in URL query params (`?sort=most-used`) or in localStorage? URL persistence enables sharing a link with sort applied (useful for Sam sharing a model comparison with a colleague). Recommendation: URL params.

6. **Provider icon set**: what are the canonical provider icons and do they require licensing from providers? Flag for brand/legal review before implementation.

7. **Tab default logic**: "All models" is specified as the default tab. Confirm: should the tab default to "My models" if the user has 1+ private models (similar to Environments/Tasksets logic where "My Team" is default when data exists)? Argument for "All models" default: the primary action is picking a model for a Job, which usually starts from the full set, not from the user's private models subset. Argument for "My models" default when private models exist: consistency with Environments/Tasksets convention. Recommendation: "All models" default (model selection is a comparison task, not a personal browse task). Flag for product review.

8. **Speed data for restricted models**: is speed (`t/s`) published for gated/locked models (GPT 5.4 🔒)? If not, show `—` in the SPEED cell.

---

## Out of scope

- **Model detail page** — `/models/[model-id]`. Shows capabilities, pricing detail, usage history, access request form, fine-tuning info, and "Use in Job" CTA. This wireframe ends at row click.
- **Training Job launch** — the flow to start a Training Job (which produces a new private Model) is on the Jobs surface, not here. "My models" tab is consumption-only from this index.
- **Model Gateway configuration** — routing rules, fallback chains, rate-limit config — admin surface, not the model browse index.
- **Access grant request flow** — for locked models. Referenced at lock icon but designed on the detail page.
- **Billing / Credits** — usage cost calculation, per-model cost attribution — billing surface.

---

## Drift log

- **Table layout instead of card/list**: Environments and Tasksets use card + list view toggle. Models uses a table only. Justified by the data shape: Models are compared on multiple numeric dimensions simultaneously (price, speed, capability flags, usage) — tabular alignment is the correct affordance, not the card pattern. This is not deviation from a standard; it is the right choice for this data.

- **No `+ New Model` button**: Environments and Tasksets both have a `+ New` CTA. Models does not — there is no user-initiated model creation from the index. Fine-tuned private models are produced by Training Jobs. This divergence is structural and correct.

- **No activity bar / live-updating counters**: Environments has a live "X active now" activity bar. Models does not have an equivalent — there is no per-model active-session count visible at the index level. The Gateway status indicator (Running/Degraded/Outage) serves the analogous trust function for this page.

- **Riley is TERTIARY (not CO-PRIMARY)**: unlike Environments where Riley was upgraded to CO-PRIMARY, Riley is tertiary on the Models index. Models are not his product; he doesn't need this page to do his job. Design decisions on this page optimize for Alex and Sam, with Riley as a sanity gate only.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md). Visual references: operator-supplied screenshots Image #1 (dark, aspirational) and Image #2 (light, current production) — Jun 2026. Structural anchor: [`docs/design/screens/environments.wireframe.md`](./environments.wireframe.md), [`docs/design/screens/tasksets.wireframe.md`](./tasksets.wireframe.md). AppShell chrome: [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md).*
