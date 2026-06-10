# Agents Index — Screen Wireframe (`/agents`)

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome (sidebar, credits widget, user chip). This wireframe covers the `MAIN` region only.
- [`docs/design/screens/models.wireframe.md`](./models.wireframe.md) — structural peer; card vs table decision comparison; persona notes pattern.
- [`docs/design/screens/tasksets.wireframe.md`](./tasksets.wireframe.md) — tab/filter/section conventions; QA Agent attach-to-taskset relationship.
- [`docs/design/screens/new-agent.wireframe.md`](./new-agent.wireframe.md) — New Agent drawer (being designed in parallel). This wireframe cross-links to it without defining its content.
- Job detail Overview tab — consumer surface where Agents are configured and triggered. Image #7 (current production): `QA Agent: Run on this job's traces` + `[Select a QA agent…]` dropdown. Referenced in §9 "Use Agent" action spec.

Visual references: operator-supplied screenshots (Image #1 current `/agents` production index; Images #2–#6 card and modal detail; Images #7–#8 Job detail QA consumer surface) — Jun 2026.

---

## HUD-side question answered

### 1. What does each persona DO on this page?

**Sam (Applied Agent Engineer — PRIMARY):** Three jobs:

1. **Browse and configure QA Agents.** Sam lands here when he wants to attach a standard QA Agent to a new Taskset — specifically after running a baseline eval and wanting automated False Negative / False Positive / Failure Analysis detection before disputing outputs with an ops lead. He also creates custom QA Agents when he has authored his own Scenario and wants to run it automatically against trace batches.

2. **Manage Automations.** Sam's CI loop triggers Automation runs against a frozen Taskset. He creates and manages Automations here — configure once, trigger from CI or manually on demand. He may also check recent Automation run history when a CI-triggered run produces unexpected results.

3. **Create and manage Chat Agents.** Sam builds conversational systems against real production workflows. He comes here to configure a Chat Agent (pair a scenario's tools with a model), see its A2A endpoint, and check that conversation history is being managed by the platform.

**Riley (RL Environment Vendor — SECONDARY):** One primary job: **attach QA Agents to every task in a taskset delivery.** For Riley, `/agents` is the surface where he selects which standard QA Agents to attach to a 500-task Taskset in bulk. The "Add as Column" path (Image #5) is load-bearing for his delivery SLA. He also wants to see per-agent run history across his tasksets to confirm QA coverage before shipping to a buying lab. He does not create Automations or Chat Agents (those are Sam's patterns).

**Alex (Frontier RL Researcher — SANITY GATE ONLY):** Alex is explicitly out of scope for Agent composition wizards per `personas.md` — "his composition lives in code, not form fields." He may land here via a deep link from a Trace detail page (e.g., a trace that has a linked QA Agent result). When he does land here, the surface must not break his flow: he should be able to read agent configuration (scenario slug, model), see run history, and exit without being invited to compose something. No design decision on this page should degrade his ability to read existing agent state. He does not create agents from this surface.

---

### 2. What are the right top-level sections?

**Decision: group by type (Automations / QA Agents / Chat Agents). QA Agents section contains Standard presets and user-created agents together, visually distinguished.**

Rationale: the three agent types are fundamentally different in what the user does with them — QA Agents auto-run on traces, Automations are on-demand scenario runs, Chat Agents serve A2A. A user creating an Automation and a user attaching a QA Agent are in different mental contexts. If they land in the same section and must apply a type filter, they pay cognitive overhead that type-based grouping eliminates for free.

The alternative (group by ownership — Standards / Your agents) fails because it groups Standard QA Agents with nothing (there are no Standard Automations or Standard Chat Agents — see §3 below), putting all user-created Automations and QA Agents and Chat Agents in "Your agents" regardless of type. That conflation makes "Your agents" a heterogeneous list that requires type-reading on every row before the user can act.

The current production model (Standard QA Agents / Your Automations) is a partial version of type-grouping that omits Chat Agent entirely and forces the user to understand that "Standard" ≠ "all QA Agents" because they may have created custom QA Agents that would also appear in a type-grouped surface. The production model is an incomplete type-grouping, not a valid ownership-grouping.

---

### 3. Where does Standard vs Custom live?

**Standard QA Agents are HUD-shipped presets.** Evidence: Image #1 shows five preset cards (Prompt Alignment, Failure Analysis, False Negative, False Positive, Reward Hacking). `platform.md` describes QA Agents as "pre-built ones for Prompt Alignment, Failure, False Negative, False Positive, Reward Hacking analysis."

**Standard Automations and Standard Chat Agents do not exist.** There is no evidence in `platform.md`, `docs.hud.ai/platform/agents`, or the operator screenshots of HUD-shipped Automation or Chat Agent presets. Automation and Chat Agent are user-configured by design — they require a user-supplied Scenario, Model, and optional args. Confirming: "Standard" is QA-only.

**Placement:** Within the QA Agents section, Standard presets are listed first (they always exist, never empty), then user-created QA Agents follow. Visual distinction: Standard cards carry a `HUD` origin badge; user-created carry no badge. No separate subsection heading needed — the origin badge is sufficient. This avoids the section-inside-a-section nesting that would violate card-usage anti-pattern §4.3.

---

### 4. Is the card the right primitive vs a table?

**Cards win for Agents.** Per `card-usage.md` §3: cards are valid when content is a discrete object with stable identity, actionable as a unit, and sitting alongside peers of the same shape. All three hold:

1. Each Agent has a stable identity (name, type, scenario, model, run history).
2. Each Agent is actionable as a unit: attach-to-taskset (QA), run on demand (Automation), get A2A endpoint (Chat).
3. Each Agent sits alongside peers of the same shape.

The Models index chose a table because comparison across numeric dimensions (price, speed, capability flags) dominates and requires column alignment across rows. Agents are **categorical + descriptive** — the user is not comparing agents on the same numeric scale; they are selecting one and acting on it. The relevant signals (name, type, scenario slug, model, task-attach count) do not gain from column alignment; they gain from being scannable as a unit within a card boundary. Additionally, agent count per org is expected to be 5–30, which is a short enough list that vertical scroll cost is negligible.

**Two-column card grid at desktop. Single-column at tablet/mobile.** Not a masonry grid — consistent card heights per type section aid scan.

---

### 5. What is the card-click destination?

**Decision: slide-over panel (not full detail page, not full-page modal).** Rationale:

- Agents are Tier 4 configuration per `platform.md` — not first-class entities, not forkable, not URL-addressable in the way that Environments or Models are. A full detail page implies Tier 1 standing the primitive does not have.
- A slide-over (slide from the right, covers ~40% of the viewport, pushes the index list left) keeps spatial context — the user sees where they came from. A full-page modal (Image #3 current production) blocks the index, loses context, and has a small dismiss target.
- Deep-linking requirement: the slide-over URL is parameterized (`/agents?agent=[id]`) so the user can share a direct link to an agent configuration. This satisfies deep-link requirements without a full detail page.
- Run history depth (§10 below): up to 50 entries fits in a scrollable run history section inside the panel without needing a separate page.

Divergence from current production (full-page modal): the slide-over retains more spatial context and supports deeper run history without implying full Tier 1 entity status. Justified. See Drift log.

---

### 6. Where does "Use this Agent" route?

**Decision: "Use" is a direct action on the card, not a modal-gate.**

Current production routes: `"Use QA Agent →"` → modal → `+` → taskset combobox. This is two layers of navigation for a single selection action. For Sam (PRIMARY), attaching a QA Agent to a taskset is a routine operational step — it should be reachable in one action from the index card.

**Per-type routing for "Use":**
- **QA Agent:** `Use →` on the card opens a single combobox popover (same taskset picker from Image #5) directly from the card, without opening the slide-over panel first. Selection attaches the QA Agent to the selected Taskset as a column. Confirmation: inline success toast `"False Negative attached to [taskset-name]"`. No intermediate modal.
- **Automation:** `Run →` on the card opens a compact run-args inline form as a popover from the card. Pre-filled args are shown; editable. `[Run]` button submits. Confirmation: toast `"Automation queued — Job [id]"` with link to Job detail.
- **Chat Agent:** `Connect →` on the card shows the A2A endpoint URL in a popover (copy-to-clipboard + `curl` snippet). No navigation.

The slide-over panel (card click destination, §5) gives access to deeper config: output schema, run history, attached tasksets list. The card CTA bypasses the panel for the primary action — expert users (Sam, Riley) will never need the panel for the routine attach/run flow.

---

### 7. Where does the user MANAGE attached agents?

**Decision: attached tasksets list lives in the agent slide-over panel, with per-taskset run health summary.**

Image #3 (current production slide-over/modal) shows a "Tasksets" section with a `+` button and a simple list of attached tasksets. This is the right concept; the right implementation expands it:

- Per attached Taskset: taskset name (link to Taskset detail) + last-run timestamp + run count + failure rate (e.g., `3 flagged / 22 runs`).
- Failure rate is not a deep dive — it is the glance-altitude signal Riley needs to confirm QA coverage before delivery.
- `+` opens the same taskset combobox as the "Use" card CTA.
- `×` detaches the agent from a taskset (with confirmation: `"Detach [agent-name] from [taskset-name]?"` — inline, not modal).
- No separate "attached agents management" surface — the slide-over panel is sufficient at Tier 4.

---

### 8. Run History — what altitude?

**Decision: glanceable summary in the slide-over panel, capped at 50 entries, with link-to-Job for each entry.**

Image #3 shows 15 entries. 15 is too low for Riley operating on 500-task batches across multiple deliveries — he may have 50+ recent runs for a single QA Agent. 50 is the right cap for a panel view; beyond 50, a `"Show all in Jobs →"` link sends to `/jobs` filtered by this agent.

Each run history row: `[scenario badge] · [taskset slug] · [status: Completed / Errored] · [timestamp] · [link-to-Job]`. Link-to-Job satisfies the "every aggregate has a drill path" personality principle — Riley can click through to the Job detail and then the Trace detail for any specific run.

Run history is sorted descending (newest first). No pagination in the panel — virtual scroll or truncation at 50 with the "Show all" overflow link.

---

### 9. `+ New Agent` CTA placement

**Decision: single `+ New Agent` button in the page header, top-right, same pattern as Tasksets and Environments.**

Per-section CTAs (`+ New Automation`, `+ New QA Agent`, `+ New Chat Agent`) would scatter three buttons across the page and require the user to locate the right section before acting. The `+ New Agent` CTA opens the New Agent drawer (specified in `new-agent.wireframe.md` in parallel) which begins with type selection. This keeps the page header clean and consistent with peer surfaces.

The drawer handles type disambiguation — the index page does not need to split the entry point.

---

### 10. Are agents publishable / forkable?

**Decision: no. Agents are not publishable or forkable.**

`platform.md` is explicit: Agents are Tier 4 configuration — not ownable, not forkable, not Public/Private flagged, not Marketplace-listable. Standard QA Agents are HUD-shipped (not user-published). User-created Agents are org-scoped only. No sharing mechanic for Agents. No star count, no fork count, no visibility toggle on this surface.

---

## 1. Shared layout note

The `MAIN` region is the content area to the right of AppShell's persistent sidebar. This wireframe does not redraw the sidebar, credits widget, or user chip — those are fully specified in `app-shell.wireframe.md`.

```
┌─────────────────────┬─────────────────────────────────────────────────────────┐
│  SIDEBAR (AppShell) │  MAIN                                                   │
│  [see app-shell     │                                                         │
│   wireframe.md]     │  [AGENTS INDEX CONTENT — this file]                     │
│                     │                                                         │
└─────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Page header anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER  (sticky — stays pinned as content scrolls)                         │
│                                                                                  │
│  ┌─────────────────────────────────────────────┐  ┌────────────────────────────┐ │
│  │  Agents  [?]                                │  │  [+ New Agent]             │ │
│  │  (h1 / page title)  (docs icon)             │  └────────────────────────────┘ │
│  └─────────────────────────────────────────────┘                                 │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │  Pair a Model with a Scenario to run automated checks, on-demand tasks,    │ │
│  │  or multi-turn conversations.                                               │ │
│  │  (page subtitle — one line at desktop)                                     │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- `"Agents"` is the h1 / page title. Platform-canonical noun per `platform.md`.
- `[?]` docs icon immediately right of title — ghost-weight `<a>`, same pattern as Models, Environments, Tasksets. `aria-label="Agents documentation, opens in new tab"`. Deep-links to `docs.hud.ai/platform/agents`.
- **Subtitle:** `"Pair a Model with a Scenario to run automated checks, on-demand tasks, or multi-turn conversations."` — one sentence, platform vocabulary throughout. Audit of current production subtitle (`"Agents connect a model to an environment scenario. Create automations for CI, QA agents for taskset analysis, or chat agents for interactive conversations."`): two sentences where one suffices; "environment scenario" is not platform-canonical (it's "Scenario"); the word "interactive" is unnecessary adjective padding. Revised subtitle is tighter and uses exact vocabulary.
- `[+ New Agent]` CTA: primary button, top-right of page header. Opens the New Agent drawer (`new-agent.wireframe.md`). Single entry point for all three agent types — type selection is the first step inside the drawer.

**Scroll behavior — sticky page header:**
- Page header (title + docs icon + subtitle + CTA) stays pinned to top of content area as sections scroll.
- The `+ New Agent` CTA remaining visible during scroll is a feature — Sam and Riley may decide to create an agent mid-browse.
- Subtle visual separator (bottom border or shadow) at the lower edge of the sticky region.

---

## 3. Section anatomy (type-grouped)

No tabs. Three labelled sections with section headings, rendered sequentially on the page. No type filter chips needed at 5–30 agents — the sections themselves provide the type filter structure.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SECTION STRUCTURE  (scrolls below sticky header)                                │
│                                                                                  │
│  QA AGENTS  (N)                                                                  │
│  ── section heading + count ──────────────────────────────────────────────────── │
│  [card grid — Standard presets first, then user-created]                         │
│                                                                                  │
│  AUTOMATIONS  (N)                                                                │
│  ── section heading + count ──────────────────────────────────────────────────── │
│  [card grid — user-created only]                                                 │
│                                                                                  │
│  CHAT AGENTS  (N)                                                                │
│  ── section heading + count ──────────────────────────────────────────────────── │
│  [card grid — user-created only]                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Section ordering rationale:**

QA Agents are listed first because: (a) Standard presets are the most common entry point for new users and for Riley's onboarding; (b) Sam's most frequent use case on this surface is QA Agent attachment; (c) placing the "pre-loaded" content at top reduces the chance a new user sees only empty states on the page.

Automations second: Sam's CI-triggered runs are a routine operational step, checked frequently.

Chat Agents third: specialized, less frequent, and the most complex to configure. Placing it last follows the usage-frequency ordering without burying it.

**Section heading anatomy:**

```
QA Agents  (8)   [+ New QA Agent]   ← secondary affordance, ghost/tertiary weight
```

- Section heading: label + count in muted chip, e.g. `QA Agents (8)`.
- Secondary add CTA per section (`+ New QA Agent`, `+ New Automation`, `+ New Chat Agent`): ghost/tertiary weight button, inline right of heading. This is a convenience shortcut that bypasses the type-selection step in the drawer and pre-selects the type. It does not replace the primary `+ New Agent` CTA in the page header — it is a secondary entry point for experienced users who know which type they want.
- The section heading is not itself a navigational target (no expand/collapse — all agents are visible by default at 5–30 total count).

---

## 4. Card anatomy

Each Agent card is a discrete object with stable identity, actionable as a unit, sitting alongside peer cards of the same shape — all three card-usage criteria met.

### 4.1 QA Agent card

```
┌──────────────────────────────────────────────────────┐
│  Failure Analysis                       [QA]  [HUD]  │
│                                                      │
│  Classify why a trace failed — find all problems,    │
│  not just a single category.                         │
│                                                      │
│  trace-explorer:failure_analysis                     │  ← scenario slug (monospace)
│  Claude Sonnet 4.5                                   │  ← model
│                                                      │
│  ─────────────────────────────────────────────────  │
│  ↗ 3 tasksets · 42 runs · 2h ago           [Use →]   │
└──────────────────────────────────────────────────────┘
```

**Field annotations:**

- **Type badge:** `[QA]` — shield icon + "QA" label. Positioned top-right of the card header row, anchored to the right edge. Matches the meta-corner convention from the Taskset peer card (star + count sits in the same slot) and current production Image #2.
- **Name:** Agent name. Standard: `"Failure Analysis"`, `"False Negative"`, `"False Positive"`, `"Prompt Alignment"`, `"Reward Hacking"`. User-created: user-assigned name.
- **Origin badge:** `[HUD]` — top-right, immediately following the type badge (composes visually as 'QA Agent shipped by HUD'). Present on Standard presets only; absent on user-created QA Agents.
- **Description:** one to two lines, truncated with ellipsis if longer (full text shown in slide-over panel). Standard agent descriptions are platform-authored (see Image #2: `"Analyze why a trace failed — find all problems, not just a single category."`). User-created: user-supplied description or `"No description"` muted placeholder.
- **Scenario slug:** monospace, muted. The exact scenario identifier used to run the agent (e.g. `trace-explorer:failure_analysis`, `trace-explorer:false_negative`). This is Alex's anchor if he lands here — he reads the slug, not the name.
- **Model:** model name (human-readable, not model ID). e.g. `Claude Sonnet 4.5`.
- **Metadata row:** `↗ [N] tasksets · [N] runs · [last-run timestamp]`. `↗ tasksets` count links to the slide-over panel's Tasksets section. `runs` count links to the slide-over panel's Run history section. Timestamp: human-relative (`2h ago`, `yesterday`, `Jun 3`) — not ISO timestamp at this altitude. **Zero-run state:** `"Not yet run"` replaces the run count and timestamp when the agent has never been triggered. Zero-tasksets state: `↗ 0 tasksets` is shown muted (not a link, since there is nothing to navigate to). Full zero state: `↗ 0 tasksets · Not yet run`.
- **Primary CTA:** `[Use →]` button — bottom-right of the card, on the same row as the metadata signal. Mirrors the Taskset peer card's bottom-row meta-left, publisher-right anatomy, with the action replacing the publisher slot. Opens the taskset combobox popover directly (see §9). No navigation to slide-over panel.
- **Card click target (non-CTA area):** opens the agent slide-over panel (§8). The CTA has its own independent click target.

### 4.2 Automation card

```
┌──────────────────────────────────────────────────────┐
│  Kate Automation                              [Auto] │
│                                                      │
│  Start with a near-winning board and finish the      │
│  game.                                               │
│                                                      │
│  browser:2048-near-win                               │  ← scenario slug (monospace)
│  Gemini 3 Flash Preview                              │  ← model
│                                                      │
│  ─────────────────────────────────────────────────  │
│  12 runs · 3h ago                          [Run →]   │
└──────────────────────────────────────────────────────┘
```

- **Type badge:** `[Auto]` — bolt icon + "Auto" label. Positioned top-right of the card header row (peer-consistent with QA Agent card and Taskset star slot). Image #6 production confirms bolt icon.
- **No `[HUD]` origin badge** — no Standard Automations exist.
- **Metadata row:** `[N] runs · [last-run timestamp]`. No tasksets count (Automations do not attach to tasksets as a column; they run against a Scenario).
- **Primary CTA:** `[Run →]`. Opens run-args popover from the card (see §9).

### 4.3 Chat Agent card

```
┌──────────────────────────────────────────────────────┐
│  Support Chat                                 [Chat] │
│                                                      │
│  Multi-turn support flow using production workflow   │
│  tools.                                              │
│                                                      │
│  support:triage-v2                                   │  ← scenario slug (monospace)
│  Claude Sonnet 4.5                                   │  ← model
│                                                      │
│  ─────────────────────────────────────────────────  │
│  A2A endpoint active · started 4d ago     [Connect →]│
└──────────────────────────────────────────────────────┘
```

- **Type badge:** `[Chat]` — speech-bubble icon + "Chat" label. Positioned top-right of the card header row (peer-consistent).
- **Metadata row:** `A2A endpoint active · started [timestamp]`. If not yet activated: `A2A endpoint not configured`. The A2A endpoint status is the operationally relevant signal for Sam — it tells him the agent is live and connectable.
- **Primary CTA:** `[Connect →]`. Opens A2A endpoint popover with URL + curl snippet (see §9).

### 4.4 Two-column card grid layout

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  QA AGENTS  (8)                                                    [+ New QA Agent] │
│  ─────────────────────────────────────────────────────────────────────────────── │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐            │
│  │  Failure Analysis card         │  │  False Negative card           │            │
│  └───────────────────────────────┘  └───────────────────────────────┘            │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐            │
│  │  False Positive card           │  │  Prompt Alignment card         │            │
│  └───────────────────────────────┘  └───────────────────────────────┘            │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐            │
│  │  Reward Hacking card           │  │  My Custom QA Agent card       │            │
│  └───────────────────────────────┘  └───────────────────────────────┘            │
│                                                                                  │
│  AUTOMATIONS  (1)                                              [+ New Automation] │
│  ─────────────────────────────────────────────────────────────────────────────── │
│  ┌───────────────────────────────┐                                                │
│  │  Kate Automation card          │                                                │
│  └───────────────────────────────┘                                                │
│                                                                                  │
│  CHAT AGENTS  (0)                                            [+ New Chat Agent]  │
│  ─────────────────────────────────────────────────────────────────────────────── │
│  [empty state — see §6]                                                          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Card grid is 2 columns at desktop. Cards in a row match height (equal-height per row). Standard presets always appear before user-created agents within the QA Agents section — no explicit sub-heading, ordering is the signal.

---

## 5. Sticky scroll behavior

Sticky layers from top to bottom:
1. Page header (title + docs icon + subtitle + `+ New Agent` CTA) — stickiest layer
2. Section headings are **not** sticky — they scroll with content

Rationale for non-sticky section headings: at 5–30 total agents, the page is short enough that section headings remain visible without sticking. Sticky headings add implementation cost with no scan benefit at this content volume. If agent count grows to 50+, section heading stickiness can be revisited as a screen-spec decision.

---

## 6. Empty states

### 6a. Zero custom QA Agents (Standard presets still visible)

Standard QA Agents are always present (HUD ships them). When the user has not created any custom QA Agents, no empty state is shown inside the QA Agents section — the Standard presets fill it. No "you have no custom QA Agents" message is needed or appropriate.

### 6b. Zero Automations

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  AUTOMATIONS  (0)                                              [+ New Automation] │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  No Automations yet.                                                             │
│                                                                                  │
│  hud agent automation create --scenario <scenario> --model <model-id>  [⎘]      │
│  (monospace, copyable CLI command)                                               │
│                                                                                  │
│  Read the docs ↗                                                                 │
│  (tertiary text link → docs.hud.ai/platform/agents)                             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 6c. Zero Chat Agents

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  CHAT AGENTS  (0)                                            [+ New Chat Agent]  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  No Chat Agents yet.                                                             │
│                                                                                  │
│  Add chat=True to your scenario and select a model to start.  [?]               │
│  (inline docs link → docs.hud.ai/platform/agents#chat)                          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Note: Chat Agents are created via the dashboard `+ New Chat Agent` wizard (not CLI), so the CLI command empty state pattern is not appropriate here. The prompt surfaces the key prerequisite (`chat=True` in the scenario decorator) — platform vocabulary, no explanatory padding.

### 6d. Zero agents of any type (brand-new org)

When an org has never created any agent (zero of all three types), the page shows Standard QA Agent cards (always present) plus empty states for Automations and Chat Agents. The page is never fully empty — Standard presets ensure the page always has content.

---

## 7. Error and loading states

### 7a. Loading skeleton

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SKELETON  (one section visible, loading)                                        │
│                                                                                  │
│  QA AGENTS                                                                       │
│  ─────────────────────────────────────────────────────────────────────────────── │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐            │
│  │  [░░░░░░░░░░░░]               │  │  [░░░░░░░░░░]                 │            │
│  │  [░░░░░░░░░░░░░░░░░░░░░░░░░░] │  │  [░░░░░░░░░░░░░░░░░░░░░░░░░░] │            │
│  │  [░░░░░]  [░░░░░░░░░░░]       │  │  [░░░░░]  [░░░░░░░░░░░]       │            │
│  │  [░░░░░░░░]                   │  │  [░░░░░░░░]                   │            │
│  └───────────────────────────────┘  └───────────────────────────────┘            │
│  (repeat 4 cards, two columns)                                                   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- No spinner. Skeleton cards in the 2-column grid layout match the final card height shape.
- Skeleton renders Standard QA Agent shape first (most likely to load); shows 4 placeholder cards while fetching.
- Section headings render immediately (static markup); cards skeleton within sections.

### 7b. Fetch error

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  ERROR STATE  (within section body, network/fetch failure)                       │
│                                                                                  │
│  [alert icon]                                                                    │
│                                                                                  │
│  Couldn't load agents — try again.                                               │
│  (prominent, centered in section body)                                           │
│                                                                                  │
│  [Retry]                                                                         │
│  (primary button)                                                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- Error replaces only the card grid body. Page header, section headings, and the `+ New Agent` CTA remain rendered and interactive.
- Error copy: direct cause ("Couldn't load") + action ("try again") — no apology.
- Same pattern as Models and Environments error states.

---

## 8. Card click destination spec

**Slide-over panel** opens from the right, triggered by clicking any non-CTA area of a card. Panel width is specified in the screen-spec phase — at desktop it occupies a substantial portion of the right side of the viewport; the index list scales down proportionally.

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  [INDEX — narrowed]                     │  SLIDE-OVER PANEL (right portion)              │
│                                         │                                                │
│  [faded / scaled cards]                 │  [×] close                                    │
│                                         │                                                │
│                                         │  [QA badge]  Failure Analysis    [HUD]        │
│                                         │  (h2)                                          │
│                                         │                                                │
│                                         │  Classify why a trace failed — find all        │
│                                         │  problems, not just a single category.         │
│                                         │                                                │
│                                         │  ────────────────────────────────────────      │
│                                         │  Scenario     trace-explorer:failure_analysis  │
│                                         │  Model        Claude Sonnet 4.5               │
│                                         │                                                │
│                                         │  ────────────────────────────────────────      │
│                                         │  Output schema                                │
│                                         │  confidence  enum [high / medium / low]        │
│                                         │  problems    array                             │
│                                         │  summary     string                            │
│                                         │                                                │
│                                         │  ────────────────────────────────────────      │
│                                         │  Tasksets (3)                     [+]          │
│                                         │  ▸ browser-tasks                              │
│                                         │    38 runs · 2 flagged · last run 2h ago      │
│                                         │  ▸ support-evals                              │
│                                         │    12 runs · 0 flagged · last run 1d ago      │
│                                         │  ▸ coding-bench                               │
│                                         │    8 runs · 1 flagged · last run 3d ago       │
│                                         │                                                │
│                                         │  ────────────────────────────────────────      │
│                                         │  Run history  (42)          [Show all in Jobs →] │
│                                         │  [shield] browser-tasks  Completed  2h ago ↗  │
│                                         │  [shield] support-evals  Completed  1d ago ↗  │
│                                         │  [shield] coding-bench   Errored    2d ago ↗  │
│                                         │  … (up to 50 rows, virtual scroll)            │
│                                         │                                                │
│                                         │  ────────────────────────────────────────      │
│                                         │  [Use →]  (primary CTA, same as card)         │
│                                         │                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**Panel anatomy:**

- **Header:** type badge + name + `[HUD]` origin badge (if Standard) + `[×]` close. The `×` close dismisses the panel and returns focus to the originating card.
- **Description** (full text — not truncated as on the card).
- **Config row:** Scenario slug (monospace) + Model.
- **Output schema section** (QA Agents only): field names + types, verbatim. Not collapsible — relevant for Sam configuring downstream schema consumers and for Alex reading what the agent emits.
- **Tasksets section:** per-taskset summary (name + run count + flagged count + last-run timestamp) + `+` to attach + `×` per row to detach.
- **Run history section:** up to 50 rows (virtual scroll). Per row: scenario badge + taskset slug + status + timestamp + link-to-Job (`↗`). `[Show all in Jobs →]` link at section top-right sends to `/jobs` filtered by this agent.
- **Panel-level CTA:** `[Use →]` / `[Run →]` / `[Connect →]` (type-specific, same as card CTA) — repeated at panel bottom for convenience.

**URL:** panel open state encoded as query param (`/agents?agent=[agent-id]`). Navigating directly to the URL opens the page with the panel pre-opened. Closing the panel removes the query param without page reload. (Implementation note: whether the panel initial state is resolved server-side or client-side is an implementation decision — not specified at wireframe altitude.)

**User-created agent panel — edit action:** user-created agents (Automations, custom QA Agents, Chat Agents) show an `[Edit]` button in the panel header row, adjacent to the `[×]` close. Standard QA Agent presets do not show `[Edit]` — they are HUD-provided and read-only. `[Edit]` opens the New Agent drawer pre-populated with the agent's current configuration. Saving from the drawer updates the agent in place; closing without saving discards changes.

**Automation panel:** same anatomy minus Output schema section. Adds: pre-filled args (if any) with edit affordance, and a `[Run]` button in the panel footer in addition to the `[Run →]` card CTA.

**Chat Agent panel:** same anatomy minus Output schema section. Adds: A2A endpoint URL (copy-to-clipboard) + example `curl` snippet. Run history section in the Chat Agent panel is present only if the platform generates Job-based run history for Chat Agent invocations — see Open Question §OQ4.

---

## 9. "Use Agent" action spec

### 9a. QA Agent — `[Use →]`

Opens a taskset selection popover anchored to the card. Popover renders the same combobox from Image #5.

```
┌─────────────────────────────────────────┐
│  Attach to Taskset                       │
│                                         │
│  [Search tasksets…]                     │
│                                         │
│  ▸ browser-tasks           32 tasks     │
│  ▸ support-evals           14 tasks     │
│  ▸ coding-bench            54 tasks     │
│                                         │
│  (already-attached tasksets are shown   │
│   with a checkmark, not grayed out)     │
│                                         │
│  [Attach]   [Cancel]                    │
└─────────────────────────────────────────┘
```

- Already-attached Tasksets shown with `✓` checkmark, still selectable. Selecting an already-attached Taskset shows toast: `"Failure Analysis is already attached to browser-tasks"` (names substituted). No re-attachment action taken.
- `[Attach]` confirms. Closes popover. Toast: `"Failure Analysis attached to browser-tasks"`.
- Already-attached via another path (e.g. Taskset detail → Traces tab → "Add QA Agent"): agent appears here with `✓`.
- No "Add as Column" label (current production): simplified to `[Attach]` — the column implication is implicit in what QA Agents do on a Taskset.

### 9b. Automation — `[Run →]`

Opens a run-args popover anchored to the card.

```
┌─────────────────────────────────────────┐
│  Run Automation                          │
│                                         │
│  Kate Automation                        │
│  browser:2048-near-win                  │
│                                         │
│  Arguments                              │
│  (pre-filled args editable inline)      │
│  seed   [42        ]                    │
│  board  [(default) ]                    │
│                                         │
│  [Run]   [Cancel]                       │
└─────────────────────────────────────────┘
```

- `[Run]` submits. Closes popover. Toast: `"Automation queued — Job abc123 ↗"` (link to Job detail).
- If the Automation has no configurable args: popover is minimal (`"Run Kate Automation against browser:2048-near-win? [Run] [Cancel]"`).

### 9c. Chat Agent — `[Connect →]`

Opens an endpoint popover anchored to the card.

```
┌─────────────────────────────────────────┐
│  A2A Endpoint                            │
│                                         │
│  https://a2a.hud.ai/agents/[id]  [⎘]   │
│                                         │
│  curl https://a2a.hud.ai/agents/[id] \  │
│    -H "Authorization: Bearer $HUD_KEY" \│
│    -d '{"message": "Hello"}'           │
│                                         │
│  [Copy endpoint]   [Close]              │
└─────────────────────────────────────────┘
```

- `[Copy endpoint]` copies the URL. Inline feedback: `"Copied"`. Popover stays open.
- No navigation — the user stays on `/agents`.

### 9d. Slide-over panel — `[Use →]` / `[Run →]` / `[Connect →]`

Identical behavior to the card CTA. The panel CTA is a convenience duplication — it exists so the user does not have to close the panel before taking the primary action.

---

## 10. Run history surface

Run history is a section within the agent slide-over panel (§8). Not on the card face (card shows only the `last run` timestamp and total run count in the metadata row).

**Run history row anatomy:**
```
[QA badge]  browser-tasks  ·  Completed  ·  2h ago  ↗
```

- `[badge]`: type badge (QA shield / Auto bolt / Chat speech-bubble).
- `taskset slug` (QA and Automation) or `conversation ID` (Chat).
- `status`: `Completed` or `Errored` (uses Job Outcome vocabulary per `platform.md`, not "Passed" / "Failed").
- `timestamp`: human-relative.
- `↗`: direct link to the Job detail page for that run. Satisfies the "every aggregate has a drill path" personality principle.

**Cap and overflow:**
- Panel shows up to 50 rows.
- `[Show all in Jobs →]` link at the top-right of the Run history section sends to `/jobs?agent=[id]` — Jobs fleet view filtered by this agent. This is where unlimited run history is available.

**Sort:** descending by timestamp (newest first). No sort controls in the panel — the panel is a glanceable summary.

---

## 11. Responsive behavior

### Desktop — two-column card grid

Full layout as specified in §4. Slide-over panel at 40% viewport width. Page header sticky.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  [Agents] [?]                              [+ New Agent]                       │
│  Pair a Model with a Scenario to run automated checks, on-demand tasks,        │
│  or multi-turn conversations.                                                  │
│                                                                                │
│  QA AGENTS  (8)                                          [+ New QA Agent]      │
│  ─────────────────────────────────────────────────────────────────────         │
│  [Failure Analysis card]     [False Negative card]                             │
│  [False Positive card]       [Prompt Alignment card]                           │
│  [Reward Hacking card]       [My Custom QA card]                               │
│                                                                                │
│  AUTOMATIONS  (1)                                       [+ New Automation]     │
│  ─────────────────────────────────────────────────────────────────────         │
│  [Kate Automation card]                                                        │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet — single-column card grid

Two-column grid collapses to single-column. Slide-over panel takes ~60% viewport width, covers more of the index. Card CTAs remain on the card face (not moved to overflow menu).

```
┌────────────────────────────────────────┐
│  [Agents] [?]        [+ New Agent]     │
│  Pair a Model with a Scenario…         │
│                                        │
│  QA AGENTS  (8)      [+ New QA Agent]  │
│  ─────────────────────────────────     │
│  [Failure Analysis card — full width]  │
│  [False Negative card — full width]    │
└────────────────────────────────────────┘
```

### Mobile — single-column, condensed cards

Single-column. Slide-over panel becomes a full-height bottom sheet (covers full width, slides up). Card metadata row condenses: only `last run` timestamp shown (run count and taskset count hidden). CTA remains visible.

Filter/sort at mobile: not applicable at this agent count — no overflow controls needed. If agent count grows to 30+, a `[⚙ Sort/filter ▾]` control would be added per the Environments mobile pattern.

---

## 12. Keyboard and accessibility

**Page landmark structure:**
- `<main id="main-content">` wraps the Agents index MAIN region.
- Page header: `<h1>Agents</h1>`.
- `[?]` docs link: `aria-label="Agents documentation, opens in new tab"`.
- `[+ New Agent]` button: `aria-label="Create a new agent"`.

**Section structure:**
- Each section (`QA Agents`, `Automations`, `Chat Agents`) is a `<section>` with `<h2>` heading.
- Section heading count chip: `aria-label="[N] agents"` (e.g., `aria-label="8 agents"`).

**Card structure:**
- Cards are `<article>` elements within the grid (discrete object semantics).
- Card heading: `<h3>` for the agent name within each `<article>`.
- Type badge: `aria-label="QA agent"` / `aria-label="Automation"` / `aria-label="Chat agent"`.
- `[HUD]` origin badge: `aria-label="Standard — HUD-provided"`.
- Scenario slug: `<code>` element, monospace, `aria-label="Scenario: trace-explorer:failure_analysis"`.
- Metadata row: plain text, no additional roles.
- Card CTA (`[Use →]`, `[Run →]`, `[Connect →]`): `<button>` with `aria-label="Use Failure Analysis"` / `"Run Kate Automation"` / `"Connect to Support Chat"`. Button is independently focusable within the card.
- Card click target (non-CTA area): `<a href="/agents?agent=[id]">` wrapping the non-interactive card content, `aria-label="View Failure Analysis details"`.

**Popovers:**
- Taskset combobox, run-args form, endpoint popover: `role="dialog"`, `aria-modal="true"`, focus trapped while open. `[Attach]` / `[Run]` / `[Close]` are focusable buttons. `Escape` closes and returns focus to the originating CTA.

**Slide-over panel:**
- `role="complementary"` or `role="dialog"` with `aria-labelledby` pointing to the agent name `<h2>`.
- Focus moves to the `[×]` close button on panel open.
- `Escape` closes the panel, returns focus to the originating card.
- Run history `↗` links: `aria-label="View Job [id] for [taskset-name]"`.

**Tab navigation:**
- `Tab`: page header CTA → section headings (read-only) → first card → within card: card link → card CTA → next card.
- Arrow keys do not navigate between cards (arrow navigation is reserved for tab bars and menus — not grid layouts at this density).
- `Enter` on card link opens the slide-over panel.
- Within the slide-over panel: `Tab` moves through panel interactive elements (close button, taskset links, run history links, panel CTA).

---

## Component summary

| Component | Usage in this screen | Notes |
|---|---|---|
| `PageHeader` | Title + docs icon + subtitle + `+ New Agent` CTA | `h1`. Sticky. CTA opens New Agent drawer. |
| `DocsIcon` | Adjacent to page title | Same ghost-weight `<a>` pattern as Models, Environments, Tasksets. |
| `AgentSectionHeading` | Per-section label + count chip + secondary add CTA | `h2`. Not sticky. Count chip: `aria-label`. |
| `AgentCard` | One card per agent in the 2-column grid | `<article>`. Three type variants: `QAAgentCard`, `AutomationCard`, `ChatAgentCard`. |
| `AgentTypeBadge` | Type indicator on card and in slide-over | Three variants: QA shield, Auto bolt, Chat speech-bubble. `aria-label` for each. |
| `OriginBadge` | `[HUD]` marker on Standard QA presets | Present on Standard only. Absent on user-created. |
| `AgentCardCTA` | `[Use →]` / `[Run →]` / `[Connect →]` | Independently focusable within card. Opens popover — does not navigate. |
| `TasksetCombobox` | QA Agent attach popover | Popover from card CTA. Same combobox as Image #5 production. `role="dialog"`, focus trapped. |
| `RunArgsPopover` | Automation run popover | Pre-filled editable args. `role="dialog"`, focus trapped. |
| `EndpointPopover` | Chat Agent A2A endpoint + curl snippet | Copy-to-clipboard affordance. `role="dialog"`, focus trapped. |
| `AgentSlideOverPanel` | Slide-over from card click | `role="dialog"` or `role="complementary"`. URL param: `?agent=[id]`. Sections: config, output schema, tasksets, run history, panel CTA. |
| `RunHistoryList` | Run history in slide-over | Up to 50 rows, virtual scroll. Each row: type badge, taskset slug, status, timestamp, Job link. `[Show all in Jobs →]` overflow. |
| `TasksetAttachList` | Attached tasksets in slide-over | Per-row: name, run count, flagged count, timestamp, detach `×`. `[+]` opens `TasksetCombobox`. |
| `EmptyState` | Per-section zero state | Three variants: zero Automations, zero Chat Agents. QA section never shows empty state (Standard presets always present). |
| `ErrorState` | Fetch failure within section | "Couldn't load agents — try again." + Retry. Same pattern as Models, Environments. |
| `SkeletonCard` | Loading state | 2-column grid of card-shaped skeletons. Section headings render immediately. |
| `MobileBottomSheet` | Mobile slide-over variant | Full-width, slides up from bottom. Same panel content as desktop slide-over. |

---

## Persona notes by surface decision

| Decision | Sam (PRIMARY) | Riley (SECONDARY) | Alex (SANITY) |
|---|---|---|---|
| Type-grouped sections (not ownership-grouped) | Correct — he navigates to the right section by intent; mixing types would require type-reading on every row | Correct — he primarily cares about QA Agents; their dedicated section is immediately locatable | Acceptable — he reads the scenario slug and model; the type grouping is legible without explanation |
| Cards (not table) | Correct — his comparison is type-and-purpose, not numeric alignment across rows; card gives him a unit he can act on | Correct — bulk attach is card-CTA triggered; table rows would require a different action affordance | Acceptable — he reads the slug and model; card format supports this without friction |
| Slide-over panel (not full page) | Correct — he wants config and run history without losing the index context; full page navigation for Tier 4 config would feel heavyweight | Correct — he checks run history per agent to confirm QA coverage; panel depth (50 rows + drill) satisfies his needs without a page transition | Acceptable — if he lands here via deep link, the panel gives him config visibility; he can dismiss and leave |
| Standard QA presets always visible | Correct — he can attach a standard preset before creating custom agents; zero-friction onboarding for QA Agent workflows | Load-bearing — Standard presets are his primary attachment targets for a new taskset delivery; they must always be present and immediately actionable | Neutral — he may use standard presets or his own QA scenario; either is equally accessible |
| `[Use →]` as direct-to-combobox on card (bypasses panel) | Correct — routine attach action is one click from the card; he should not need the panel for the common path | Correct — bulk-attaching standard presets to multiple tasksets is faster without an intermediate panel | N/A — he does not create or attach agents from this surface |
| Per-taskset run health in slide-over (flagged count) | Correct — he uses this to confirm which tasksets have QA issues before an ops triage | Load-bearing — Riley's pre-delivery status check requires per-taskset pass/fail at a glance | Not relevant at this altitude |
| Origin badge `[HUD]` as sole Standard/custom distinction | Correct — badge is quiet; it does not disrupt scan but answers "is this one I created or one HUD ships?" | Correct — he needs to know Standard vs custom to know which ones have locked schemas | Useful — he reads the origin badge before reading further; confirms provenance quickly |
| No star/fork/publish mechanics | Correct — Agents are Tier 4; Sam does not expect to share agents the way he shares Tasksets or Environments | Correct — Riley does not share agents across vendor contracts | Correct — Alex does not interact with Agent sharing |
| Secondary per-section add CTAs | Useful shortcut — he knows which type he wants; saves the type-selection step in the drawer | Useful for QA Agent creation (he may occasionally create a custom QA Agent) | Neutral |
| `Show all in Jobs →` from run history | Correct — he can drill to full audit log without the panel becoming a full Jobs surface | Correct — he can confirm QA coverage and then escalate to Jobs for deeper inspection | Correct — the drill path satisfies the "every aggregate has a drill path" principle |

---

## Open questions

1. **Standard QA Agent count.** Production shows 5 standard presets (Prompt Alignment, Failure Analysis, False Negative, False Positive, Reward Hacking). `docs.hud.ai/platform/agents` also lists these five. Confirm with platform team: are any additional Standard QA Agents planned? If so, the section will be >5 cards and the two-column grid will be taller than shown.

2. **Custom QA Agent output schema.** Standard QA Agents have a fixed output schema (Image #3: confidence enum + problems array + summary string). User-created QA Agents may have user-defined output schemas. Does the output schema section in the slide-over panel display the user-defined schema, or is it QA-type-standard-only? If user-defined schemas vary widely, the output schema section may need an "output schema not available" fallback.

3. **Automation — pre-filled args format.** The run-args popover shows pre-filled args as editable fields. What is the data format for stored args — JSON object, key-value pairs, or structured form? Confirm with platform team before implementation. This affects the popover form design.

4. **Chat Agent — conversation history management.** `platform.md` says "Platform manages conversation history." Does this mean: (a) history is stored per-agent-instance and visible in the slide-over panel under a "Conversation history" section, (b) history is exposed only via the A2A endpoint itself, or (c) history is entirely managed platform-side with no user-visible surface? If (a), a "Conversation history" section is needed in the Chat Agent panel. Flag for product team.

5. **A2A endpoint activation.** Chat Agent card metadata row shows `"A2A endpoint active"` when live. Does the endpoint auto-activate on agent creation, or does it require a separate activation step? If a separate step is required, the card CTA changes from `[Connect →]` to `[Activate →]` for a newly created Chat Agent.

6. **`[+ New QA Agent]` secondary CTA scope.** Does "New QA Agent" create a standard QA Agent using one of the five pre-built scenarios, or does it create a custom QA Agent using a user-authored scenario? If it creates standard agents, the CTA is only relevant when the user wants to re-add a standard preset they may have deleted (if deletion is possible). If custom-only, the CTA should more precisely read `[+ Custom QA Agent]`. Confirm with product team.

7. **Agent deletion.** Can users delete user-created Agents? Standard QA Agents presumably cannot be deleted. If user-created agents can be deleted, where does the delete action live — on the card (hover action or `…` overflow menu) or in the slide-over panel only? Flag for product review.

8. **Taskset combobox at scale.** The attach-to-taskset combobox (Image #5) does not show a count. For Riley with 20+ active tasksets, the combobox must support search filtering. Confirm: does the combobox support keyboard-driven search? Appears so from Image #5 but confirm before specifying the popover final structure.

9. **Run history — org-scoped or agent-instance-scoped?** When the same Standard QA Agent (Failure Analysis) is used by multiple team members, does the run history show all runs across the org, or only runs initiated by the current user? Recommendation: org-scoped (consistent with Models USAGE column decision), but flag for confirmation.

10. **`/agents?agent=[id]` URL param — deep link to a specific agent.** When someone navigates directly to this URL, does the page open with the slide-over panel pre-expanded showing that agent? Confirm this is the intended behavior. If yes, the server-side render must support the query param as an initial panel state.

11. **Chat Agent run history — does it exist?** Chat Agents are served via A2A protocol, not launched as Jobs. It is unclear whether the platform generates Job-based run history for Chat Agent invocations. If yes: run history section in the Chat Agent slide-over panel is identical to QA/Automation run history (per §10). If no: the Chat Agent panel omits the run history section and shows only config + A2A endpoint. Confirm with platform team. This decision affects the Chat Agent panel anatomy spec (§8).

12. **Automation in-progress state.** If an Automation is currently running (a Job is in flight), what state should the `[Run →]` card CTA show? Options: (a) CTA stays enabled — user can queue another run; (b) CTA changes to `[Running…]` with a spinner indicator and is disabled until the current run completes; (c) CTA stays enabled but the run-args popover shows an `"Already running — queue another?"` inline message. Confirm with product team. Current spec assumes option (a) but does not specify it.

13. **Edit action trigger.** §8 specifies that `[Edit]` in the slide-over panel opens the New Agent drawer pre-populated. Confirm: is there a direct edit path from the card face itself (e.g., hover-reveal `[Edit]` icon on the card)? Or is the panel the only edit entry point? Recommendation: panel-only for Standard presets (no edit), card-hover `[···]` overflow menu for user-created agents with "Edit" and "Delete" options. Flag for product review.

---

## Out of scope

- **New Agent drawer** — the `+ New Agent` flow (type selection + configuration form) lives in `new-agent.wireframe.md`, being designed in parallel. This wireframe cross-links to it by name only.
- **Agent detail page** — this wireframe specifies a slide-over panel for agent detail. If a future decision elevates Agents to Tier 1 and a full detail page is warranted, that is a separate wireframe.
- **Taskset detail → Traces tab → "Add QA Agent" flow** — the entry point from Taskset detail for attaching a QA Agent to a trace batch. That path is specified in the Taskset detail wireframe. This wireframe specifies the reverse path (from the agent, attach to a taskset).
- **Job detail Overview tab — QA Agent configuration** — Image #7 shows QA Agent configuration on the Job detail page. That surface is specified in the Job detail wireframe. This wireframe specifies the Agent index only.
- **QA Agent run results / output** — the per-trace output of a QA Agent run (confidence score, problems array, summary) is visible in the Trace detail page, not on the Agent index. This wireframe does not specify Trace detail.
- **A2A protocol configuration** — Chat Agent A2A protocol details (authentication, message format, webhook config) are documented at `docs.hud.ai` and are not surface-designed here beyond the endpoint URL display.
- **Agent versioning** — if agents support versioning (multiple configurations over time), that is a future feature. No version history surface is specified here.

---

## Drift log

- **Slide-over panel instead of full-page modal (Image #3).** Production uses a full-page modal (Image #3). Replaced with a slide-over panel that: (a) retains index spatial context, (b) encodes state in URL (`?agent=[id]`) for deep-linking, (c) supports deeper run history (50 rows vs 15) without a separate page. Justified by Tier 4 status and the "composed complexity" personality principle — the panel achieves the same information depth without implying Tier 1 entity standing.

- **"Add as Column" CTA renamed to `[Attach]` in taskset combobox.** "Add as Column" (production Image #5) is an implementation metaphor, not a user-facing concept. `[Attach]` is more direct. The column semantics (QA Agent results appear as a column in the Taskset view) are preserved in the underlying behavior, not in the label.

- **"Use QA Agent →" renamed to `[Use →]`.** The production label is redundant — the QA badge already identifies the type. `[Use →]` is more direct and consistent with the action-verb pattern used across the dashboard.

- **Chat Agent section added.** Production `/agents` page (Image #1) omits Chat Agent entirely. This wireframe adds a Chat Agents section as a type-grouped section because Chat Agent is a defined subtype per `platform.md` and `docs.hud.ai/platform/agents`. The omission in production is a product gap, not a design decision.

- **"Your Automations" section renamed to "Automations."** The possessive "Your" in production is unnecessary — all sections on this page are the user's org's agents. Dropped for consistency with "QA Agents" and "Chat Agents" section labels (which do not use "Your").

- **Standard presets within QA section (not a separate section).** Production uses two sections: "Standard QA Agents" and "Your Automations" — separating Standards from user-created at the section level. This wireframe places Standard presets first within the QA Agents section, distinguished only by the `[HUD]` origin badge. Justified: Standard QA Agents are still QA Agents — the type grouping is the primary organizing principle; ownership (HUD vs user) is secondary and is signaled by the badge rather than a separate section heading.

- **Secondary per-section add CTAs added.** Production has a single `+ New Agent` (or equivalent) CTA. This wireframe adds lightweight secondary per-section CTAs (`+ New QA Agent`, `+ New Automation`, `+ New Chat Agent`) at the section heading level for experienced users who know which type they want. These are tertiary-weight shortcuts, not replacements for the primary `+ New Agent` CTA.

- **Type badge moved top-left → top-right (2026-06-09):** Peer consistency with Taskset cards (which place star + count meta-signal top-right) and re-alignment with current production Image #2. The `[HUD]` origin badge moves with the type badge to compose "[QA] [HUD]" as a meta-corner. Bottom row reorganizes: metadata signal left, primary CTA right — mirroring the Taskset bottom row (count-left, publisher-right) with the CTA replacing the publisher slot.

- **`/agents` page revived from IA removal.** Prior IA decision (page-inventory.md, "Notes on removed pages") dissolved `/agents` into Jobs → QA Agents tab and Workspace → Automations. This reversal is operator-directed (Jun 2026) based on the recognition that: (a) Chat Agent has no home in the prior IA; (b) QA Agent attach-to-taskset flows and Automation management are Sam and Riley's primary jobs that benefit from a dedicated surface rather than being split across Jobs and Workspace; (c) all three Agent types share enough common structure (Model + Scenario pair + run history) to merit a shared home.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md). Visual references: operator-supplied screenshots Images #1–#8 — Jun 2026. Structural anchor: [`docs/design/screens/models.wireframe.md`](./models.wireframe.md). AppShell chrome: [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md).*
