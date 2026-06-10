# New Agent — Creation Flow Wireframe

> Wireframe convention: structure, hierarchy, copy, and flow only. No pixel sizes, no Tailwind class hints, no color tokens. Derives from `models.wireframe.md` in rigor, decision-log format, persona-notes table, and drift log. This is a multi-step **flow**, not a page — the state machine and per-step anatomy are the load-bearing deliverable.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome (sidebar, credits widget, user chip). The drawer renders over the AppShell.
- [`docs/design/screens/models.wireframe.md`](./models.wireframe.md) — Model field pattern (combobox, defaulting behavior, cost language).
- [`docs/design/screens/agents.wireframe.md`](./agents.wireframe.md) — The `/agents` index page; defines the `+ New Agent` CTA that triggers this flow. The post-create index routing and agent card layout are specified there, not here.
- [`docs/design/screens/environments.wireframe.md`](./environments.wireframe.md) — Environment combobox patterns and naming conventions.
- [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md) — Taskset attachment combobox and QA Agent column-attach context.

Visual references: operator-supplied screenshots Image #10 (current New Agent type-picker drawer) and Image #11 (current New Automation form) — Jun 2026. Audit baseline per drift log §19.

---

## HUD-side question answered

### 1. State machine of the flow

**Trigger → type pick → per-type form → submit → outcome.**

```
TRIGGER (+ New Agent clicked)
  │
  ▼
STEP 1: Type Picker drawer
  │
  ├── Click "Automation"  ──────────────────────────────────────────────┐
  │                                                                      ▼
  │                                                            STEP 2A: New Automation form
  │                                                              │
  │                                                              ├── [Back] → STEP 1
  │                                                              ├── [Cancel] → close drawer, /agents
  │                                                              └── [+ Create] (form valid) → Submit
  │                                                                    │
  │                                                                    ├── Success → close drawer, /agents
  │                                                                    │   scroll-to + highlight new Automation card
  │                                                                    └── Error → inline error, stay in drawer
  │
  ├── Click "QA Agent" ─────────────────────────────────────────────────┐
  │                                                                      ▼
  │                                                            STEP 2B: New QA Agent form
  │                                                              │
  │                                                              ├── [Back] → STEP 1
  │                                                              ├── [Cancel] → close drawer, /agents
  │                                                              └── [+ Create] (form valid) → Submit
  │                                                                    │
  │                                                                    ├── No taskset attached:
  │                                                                    │   close drawer, /agents,
  │                                                                    │   scroll-to + highlight new QA Agent card
  │                                                                    └── Taskset attached at create-time:
  │                                                                        navigate to that Taskset detail,
  │                                                                        column view (QA Agent column visible)
  │
  └── Click "Chat Agent" ──────────────────────────────────────────────┐
                                                                        ▼
                                                              STEP 2C: New Chat Agent form
                                                                │
                                                                ├── [Back] → STEP 1
                                                                ├── [Cancel] → close drawer, /agents
                                                                └── [+ Create] (form valid) → Submit
                                                                      │
                                                                      └── Success → close drawer, /agents,
                                                                          scroll-to + highlight new Chat Agent card

CANCEL PATHS:
  - Escape key at any step → close drawer (same as Cancel button)
  - Clicking overlay scrim → close drawer
  - [Back] at STEP 2 → returns to STEP 1 (preserves type-picker state; clears form data)

VALIDATION GATES (STEP 2):
  - [+ Create] is always visible and always enabled (form-actions.md pattern)
  - Required-field errors fire on submit attempt; inline errors appear adjacent to fields
  - Server error (create fails) → inline error banner inside drawer, form remains open
```

Cancel and Back paths are distinct: Cancel closes the drawer; Back returns to the type picker. Neither fires a confirmation dialog (no data is persisted until + Create succeeds).

---

### 2. Drawer vs full-page vs modal

**Drawer. Confirmed.**

The form fields for all three Agent types are shallow: 3–5 fields each, no multi-step branching within a single type. A drawer keeps the `/agents` index list visible behind it, which is valuable because:

- Sam needs to scan existing Agents to avoid naming collisions.
- Riley needs to confirm how many QA Agents a Taskset already has before adding another.

The QA Agent form's "Attach to Taskset" field would mildly benefit from seeing the Taskset list, but the Taskset combobox is searchable and that partially substitutes.

Full-page focus is not justified: the forms are short and do not require the user to reference detailed parallel content. The "environment then scenario" dependency chain in the Automation form (scenario unlocks after environment is selected) is manageable in drawer width.

---

### 3. One-form-per-type vs conditional fields

**One form per type (current production pattern). Confirmed.**

The three Agent types have structurally different field sets:
- Automation: Environment → Scenario dependency chain + Arguments
- QA Agent: Standard vs Custom path, `trace_id` / `task_id` binding, Attach to Taskset
- Chat Agent: Scenario (chat=True), Model, A2A config

Shared fields (Name, Model) do not justify a single-form architecture when the non-shared sections are semantically incompatible. The conditional-fields alternative would require hiding and showing large blocks of the form based on type selection, producing the "configuration over composition" anti-pattern from CLAUDE.md.

Per-type forms with distinct titles ("New Automation", "New QA Agent", "New Chat Agent") are cleaner and faster to scan.

---

### 4. Type picker card design — card audit and affordance

**Three equal-size selection cards. Single click advances — no Continue button.**

The type picker is a "choose one of three peers" interface. This is exactly the selection-grid green-light case from card-usage.md (§3): a pick-one interface where each card represents one of N peer choices. Cards are warranted here — this is the only place in the new-agent flow where cards are used.

**Description audit — Image #10 vs canonical docs:**

| Card | Image #10 description (current production) | Canonical docs description | Verdict |
|---|---|---|---|
| Automation | "Save a scenario config to run on demand or from CI." | "Run scenarios repeatably with pre-filled arguments — configure once, execute on demand." | **Drift.** Current text mentions CI (correct) but omits pre-filled arguments, which is the defining feature of an Automation vs a raw Job. Fix. |
| QA Agent | "Automatic quality checks on taskset traces." | "Automated trace and task analysis — detect false negatives, false positives, reward hacking, and classify failures." | **Drift.** Current text is too vague: "quality checks" doesn't communicate the specific analysis types that distinguish a QA Agent from generic inspection. Fix. |
| Chat Agent | "Multi-turn conversation with environment tools." | "Multi-turn conversational agents served over A2A — pair a scenario's tools with a model." | **Minor drift.** "Served over A2A" is a technical detail that helps Sam understand the integration shape. Add. |

**Revised card descriptions:**
- **Automation** — "Configure once, run on demand — scenario + model + pre-filled arguments, repeatable."
- **QA Agent** — "Automated trace analysis — detect false negatives, false positives, reward hacking, and classify failures."
- **Chat Agent** — "Multi-turn conversation over A2A — pair a scenario's tools with a model."

**Equal visual weight for all three.** No type is visually prioritized. The canonical use-case distribution is unknown (no data on which type Sam most frequently creates), and forcing a visual hierarchy onto an equal choice set would require product-level evidence we don't have. All three cards are the same size, same weight.

**Click affordance:** single click advances to Step 2 — no intermediate Continue button. The type selection is deterministic and reversible via Back. Requiring a Continue after a clear type selection adds a tap/click with no additional confirmation value.

---

### 5. Step 2A — Automation form — Arguments field

**Arguments field: rendered as dynamic parameter blocks populated from Scenario's signature. Currently absent from Image #11 — added.**

The Automation docs state: "pre-filled arguments." This is the defining feature. Partial automations prompt for unfilled required arguments at runtime. Arguments must be specifiable at create time.

**UX decision:** Arguments become visible as individually labeled input fields after a Scenario is selected. The selected Scenario's parameter signature (e.g. `count(word=…, letter=…)`) drives the field list — one labeled text input per parameter. Placeholder text is the parameter name in angle brackets (e.g. `<word>`, `<letter>`). Empty at create time = unfilled required argument; the Automation will prompt at runtime for that argument. Prefilled at create time = locked value for every run.

This is not a freeform key-value editor. The Scenario signature is the schema; the dashboard renders it as a typed form.

**Redundant helper fix:** Image #11 shows "Select an environment first" as both the Scenario combobox placeholder text AND a helper text below the combobox. That is redundant. Fix: placeholder text only; no helper text below. The Scenario combobox's disabled state communicates the dependency. When an Environment is selected and the Scenario combobox becomes enabled, placeholder changes to "Choose a scenario…" with no helper text needed.

**Model default:** currently defaults to `claude-sonnet-4-5`. Updated to `claude-sonnet-4-6` (current Sonnet version). The cost language "Per-run cost varies by model" is vague. Replacement: when a Model is selected, show the exact input/output price per 1M tokens inline below the Model combobox, pulled from the Model's published pricing data (same format as the Models index: `$3 / $15 per 1M tokens`). If the model has unpublished pricing (private model), show `—`. This gives Sam the concrete cost signal he needs for a deployment decision, rather than a vague disclaimer.

---

### 6. Step 2B — QA Agent form — Standard vs Custom paths

**Two paths in a single form, toggled by a "Standard / Custom" segmented control at the top.**

Standard path: user selects a pre-built QA standard. The form pre-fills Scenario and Grader accordingly. User confirms Model and optionally attaches to a Taskset.

Custom path: user provides a Scenario they have authored that takes `trace_id` (per-trace) or `task_id` (per-task) as arguments. The binding type (trace-level vs task-level) is auto-detected from the Scenario's parameter signature when the Scenario is selected; a read-only indicator confirms the binding.

**Four pre-built standards:**
- False Negative — scenario uses `trace_id`; flags correct agent outputs the Grader penalizes
- False Positive — scenario uses `trace_id`; flags incorrect agent outputs the Grader rewards
- Failure Analysis — scenario uses `task_id`; classifies failure modes across a Task
- Reward Hacking — scenario uses `trace_id`; detects policy exploiting reward signal

**Attach to Taskset (create-time):** Optional combobox. Saves the post-create step of navigating to the Taskset and adding from there. When filled, post-create routing navigates to the attached Taskset's detail page (column view) rather than staying on /agents. When blank, routing stays on /agents.

---

### 7. Step 2C — Chat Agent form

**Fields needed: Name, Scenario (chat=True filtered), Model, A2A endpoint alias (optional).**

Per the docs: "Platform manages conversation history; tools come from the scenario's `@env.scenario(chat=True, tools=[…])`." The user must select a Scenario that declares `chat=True`. The Scenario combobox on this form filters to chat-capable Scenarios only (those with `chat=True` in their definition). A scenario without `chat=True` should not be selectable; the combobox placeholder makes this filter explicit.

**A2A endpoint alias:** optional field. The A2A protocol address is auto-generated by the platform when the Chat Agent is created. An optional "Alias" field lets Sam set a human-readable endpoint slug (e.g. `support-agent-v2`) rather than the auto-generated UUID-based address. If left blank, the auto-generated slug is used and shown post-create. This is the only A2A config needed at create time — routing rules and authentication are post-create configuration.

**Conversation context length:** not a create-time field. Platform manages history; any context-length cap is a property of the selected Scenario's Environment, not the Agent configuration.

---

### 8. Model defaulting

**Default: `claude-sonnet-4-6` (current Claude Sonnet). Applies to all three Agent types.**

The current production default of `claude-sonnet-4-5` reflects a stale version. Design specifies the pattern (default to current Sonnet), not the literal version string — implementation should resolve to the current Sonnet model at time of build.

Cost language replacement: inline per-model pricing below the Model combobox, same `$X / $Y per 1M tokens` format as the Models index. Format: `$3 / $15 per 1M tokens · in / out`. Resolves from Model Gateway pricing data. For private (RL-trained) models: `—`. No vague disclaimer.

This gives Sam what he actually needs: a concrete cost signal before committing to a Model, not a warning that cost "varies."

---

### 9. Validation and error states

**Required-field markers:** asterisk (`*`) on required field labels. All Agent types: Name required. Automation: Environment and Scenario required (Model defaults so is valid). QA Agent Standard path: Standard selection required; Attach to Taskset optional. QA Agent Custom path: Scenario required. Chat Agent: Scenario required.

**Inline errors on submit attempt:** appear directly below the offending field. Copy follows the HUD error voice (direct cause, not apology):
- Name empty: "Name is required."
- Environment not selected (Automation): "Select an environment."
- Scenario not selected (all types): "Select a scenario."
- Standard not selected (QA Agent Standard path): "Select a QA standard."

**Submit failure (server error):** inline error banner at the top of the drawer body, above all fields. Copy: "Couldn't create [Agent type] — [brief reason if known, e.g. 'Scenario not found']. Try again." Form remains open with all field values intact.

**[+ Create] is always visible and always enabled** per form-actions.md. Errors surface on submit, not as a pre-disabled button state.

---

### 10. Post-create routing — decision per type

| Agent Type | Condition | Routing |
|---|---|---|
| **Automation** | Always | Close drawer → stay on `/agents` → scroll to + briefly highlight new Automation in the list |
| **QA Agent** | No Taskset attached at create time | Close drawer → stay on `/agents` → scroll to + briefly highlight new QA Agent |
| **QA Agent** | Taskset attached at create time | Close drawer → navigate to attached Taskset detail, column view (QA Agent column visible) |
| **Chat Agent** | Always | Close drawer → stay on `/agents` → scroll to + briefly highlight new Chat Agent |

**Rationale for QA Agent Taskset routing:** When Sam or Riley attached a Taskset during create, the immediate next action is almost certainly to inspect or use the QA Agent in that Taskset column. Routing there saves a step. When no Taskset is attached, there is no more-specific destination than the /agents list.

The "scroll to + briefly highlight" behavior on /agents is defined in `agents.wireframe.md` — this spec delegates its visual definition there. The requirement: the newly created Agent must be visually locatable without manual scrolling.

---

### 11. Contextual entry points

**Primary entry point:** `+ New Agent` button, top-right of `/agents` index page. Defined in `agents.wireframe.md`.

**Secondary entry point: Job detail — QA Agent tab.** When viewing a Job's detail page, a user may realize mid-job that they need a custom QA Agent they haven't created yet. A `+ New QA Agent` trigger from that context opens the same drawer in a pre-routed state: Step 2B opens directly (type picker is skipped), and the "Attach to Taskset" combobox is pre-filled with the Taskset of the current Job. Post-create routing from this context: navigates back to the Job detail QA tab, not to /agents.

**Secondary entry point: Taskset detail — "Add QA Agent" (Traces tab).** Per the task brief (attachment route (a)). Behavior: opens Step 2B directly (type picker skipped), no Taskset pre-fill (the Taskset is implied by the surface; "Attach to Taskset" defaults to the current Taskset). Post-create routing: stays on the Taskset detail Traces tab.

**Entry-point routing table:**

| Trigger location | Step opened | Pre-fills | Post-create routing |
|---|---|---|---|
| `/agents` → `+ New Agent` | Step 1 (type picker) | None | `/agents`, scroll-to highlight |
| Job detail → QA tab → `+ New QA Agent` | Step 2B directly | Attach to Taskset = Job's Taskset | Job detail QA tab |
| Taskset detail → Traces tab → `Add QA Agent` | Step 2B directly | Attach to Taskset = current Taskset | Taskset detail Traces tab |

---

## 1. Flow state machine

```
╔════════════════════════════════════════════════════════════════════════╗
║  TRIGGER                                                               ║
║  User clicks "+ New Agent" (or contextual entry point)                 ║
╚════════════════════╦═══════════════════════════════════════════════════╝
                     │ drawer opens, focus to first card
                     ▼
╔════════════════════════════════════════════════════════════════════════╗
║  STEP 1: TYPE PICKER                                                   ║
║  Three selection cards: Automation · QA Agent · Chat Agent             ║
║  (Skipped when contextual entry pre-selects a type)                    ║
╚══════╦═════════════╦════════════════════════╦═══════════════════════════╝
       │ click       │ click                  │ click
       ▼             ▼                        ▼
 ┌─────────┐   ┌──────────┐            ┌──────────────┐
 │ STEP 2A │   │ STEP 2B  │            │   STEP 2C    │
 │Automation│  │ QA Agent │            │  Chat Agent  │
 └────┬────┘   └────┬─────┘            └──────┬───────┘
      │              │                         │
      ├─ [Back] ─────┤─────────────────────────┤
      │  (→ Step 1)  │                         │
      │              │                         │
      ├─ [Cancel] ───┤─────────────────────────┤
      │  (→ close)   │                         │
      │              │                         │
      └─ [+ Create] ─┘─────────────────────────┘
             │
             ├── VALIDATION GATE: required fields pass?
             │     NO → inline errors; stay in form
             │
             └── SUBMIT
                   │
                   ├── SUCCESS → close drawer → route (see §9)
                   │
                   └── SERVER ERROR → error banner; stay in form
```

**Step transition summary:**

| From | Event | To |
|---|---|---|
| Closed | `+ New Agent` click | Step 1 open (focus → first card) |
| Closed | Contextual entry (QA) | Step 2B open (focus → first field) |
| Step 1 | Card click | Step 2 for that type (focus → Name field) |
| Step 2 | `[Back]` | Step 1 (card states preserved, form cleared) |
| Step 2 | `[Cancel]` or Escape or scrim click | Closed |
| Step 2 | `[+ Create]` + validation fail | Step 2 (inline errors shown) |
| Step 2 | `[+ Create]` + server error | Step 2 (error banner shown) |
| Step 2 | `[+ Create]` + success | Closed → route per §9 |

---

## 2. Entry points

```
Entry point 1 (primary):
  /agents page → [+ New Agent] button (top-right CTA)
  → Opens Step 1 (type picker)

Entry point 2 (contextual — QA Agent from Job detail):
  Job detail → QA tab → [+ New QA Agent]
  → Opens Step 2B directly
  → Pre-fills: Attach to Taskset = Job's Taskset
  → Post-create: returns to Job detail QA tab

Entry point 3 (contextual — QA Agent from Taskset detail):
  Taskset detail → Traces tab → [Add QA Agent]
  → Opens Step 2B directly
  → Pre-fills: Attach to Taskset = current Taskset
  → Post-create: stays on Taskset detail Traces tab
```

All three entry points use the same drawer component and the same per-step form specs. The pre-fill and post-create routing are the only variables per entry point.

---

## 3. Surface anatomy (drawer)

The create surface is a **right-anchored drawer** overlaying the current page. Not a modal (no centering, no scrim-blocking horizontal scroll), not a full-page route change.

```
┌─────────────────────────────────────────┐
│  DRAWER                                 │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  HEADER                         │    │
│  │  Title                    [✕]   │    │
│  │  Subtitle                        │    │
│  └─────────────────────────────────┘    │
│  ─────────────────────────────────────  │
│  │                                 │    │
│  │  BODY (scrollable if overflow)  │    │
│  │  Step content here              │    │
│  │                                 │    │
│  │                                 │    │
│  │                                 │    │
│  ─────────────────────────────────────  │
│  │  FOOTER                         │    │
│  │  [← Back]       [Cancel] [+ Create] │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Drawer width:** roughly 480px equivalent (screen-spec phase sets the exact token). Wide enough to show two side-by-side form columns on the Automation form if needed; narrow enough to leave the `/agents` list visible at 1280px+ viewport.

**Header:**
- Title: "New Agent" (Step 1) | "New Automation" | "New QA Agent" | "New Chat Agent" (Step 2 — updates on transition)
- Subtitle: Step 1: "Choose the type of agent you want to create." | Step 2: one-line description of what this Agent type does (mirrors the card description from Step 1)
- Close (`[✕]`) button: top-right; same as Escape — closes drawer

**Body:**
- Scrollable vertically if content overflows
- Step 1: type-picker cards
- Step 2: form fields

**Footer:**
- `[← Back]` — left-aligned — visible on Step 2 only (absent on Step 1; no "back from type picker")
- `[Cancel]` — right group, secondary
- `[+ Create]` — right group, primary — visible on Step 2 only (absent on Step 1; user picks type by clicking a card, not submitting)
- On Step 1, footer renders: only `[Cancel]` right-aligned (no Back, no Create). Minimal footer signal that nothing has been committed yet.

**Overlay scrim:** semi-transparent scrim behind the drawer. Clicking the scrim is equivalent to Cancel.

**Transition:** standard right-to-left drawer enter animation (motion-designer scope — not specified here).

---

## 4. Step 1 — type picker

```
┌────────────────────────────────────────────────────────┐
│  DRAWER HEADER                                          │
│  New Agent                              [✕]             │
│  Choose the type of agent you want to create.           │
├────────────────────────────────────────────────────────┤
│  DRAWER BODY                                            │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │   [⚡]       │ │   [🛡]       │ │   [💬]       │   │
│  │              │ │              │ │              │   │
│  │  Automation  │ │   QA Agent   │ │  Chat Agent  │   │
│  │              │ │              │ │              │   │
│  │ Configure    │ │ Automated    │ │ Multi-turn   │   │
│  │ once, run on │ │ trace        │ │ conversation │   │
│  │ demand —     │ │ analysis —   │ │ over A2A —   │   │
│  │ scenario +   │ │ detect false │ │ pair a       │   │
│  │ model +      │ │ negatives,   │ │ scenario's   │   │
│  │ pre-filled   │ │ false        │ │ tools with   │   │
│  │ arguments,   │ │ positives,   │ │ a model.     │   │
│  │ repeatable.  │ │ reward       │ │              │   │
│  │              │ │ hacking, and │ │              │   │
│  │              │ │ classify     │ │              │   │
│  │              │ │ failures.    │ │              │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                         │
├────────────────────────────────────────────────────────┤
│  DRAWER FOOTER                                          │
│                                         [Cancel]        │
└────────────────────────────────────────────────────────┘
```

**Card annotations:**
- Each card: icon (decorative) + type name (heading weight) + description (body text, 2–3 lines)
- Icon set: bolt/lightning for Automation, shield for QA Agent, speech bubble for Chat Agent (matching current production Image #10 — icons are acceptable, no drift)
- Card click = immediate transition to Step 2 for that type. No hover-then-click required, no Continue button.
- Hover state: cards show a subtle highlight ring to signal interactivity
- All three cards equal width, equal visual weight
- Cards are the only use of Card component in this flow; justified per card-usage.md §3 selection-grid criterion

**Card copy (revised from Image #10 audit):**
- Automation: "Configure once, run on demand — scenario + model + pre-filled arguments, repeatable."
- QA Agent: "Automated trace analysis — detect false negatives, false positives, reward hacking, and classify failures."
- Chat Agent: "Multi-turn conversation over A2A — pair a scenario's tools with a model."

---

## 5. Step 2A — New Automation form

```
┌────────────────────────────────────────────────────────┐
│  DRAWER HEADER                                          │
│  New Automation                         [✕]             │
│  Configure once, run on demand.                         │
├────────────────────────────────────────────────────────┤
│  DRAWER BODY                                            │
│                                                         │
│  Name *                                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  My automation…                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Environment *                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  [🌐] Choose an environment…               [▾]   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Scenario *                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Choose a scenario…                         [▾]  │  │
│  └──────────────────────────────────────────────────┘  │
│  (combobox disabled until Environment is selected;      │
│   placeholder reads "Select an environment first"       │
│   only while disabled — no repeated helper text below) │
│                                                         │
│  Arguments                                              │
│  (section visible only after a Scenario is selected;    │
│   renders one labeled input per Scenario parameter)     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  word                                            │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  <word>                                    │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  letter                                           │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  <letter>                                  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│  (above shows example for scenario count(word, letter)) │
│  If blank → argument is unfilled; prompted at runtime.  │
│  Below the section, muted helper text:                  │
│  "Leave blank to prompt at run time."                   │
│                                                         │
│  Model                                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  claude-sonnet-4-6 (default)                [▾]  │  │
│  └──────────────────────────────────────────────────┘  │
│  $3 / $15 per 1M tokens · in / out                      │
│  (inline pricing below combobox; updates on selection;  │
│   shows — for private models)                           │
│                                                         │
│                                                         │
├────────────────────────────────────────────────────────┤
│  DRAWER FOOTER                                          │
│  [← Back]                       [Cancel]  [+ Create]   │
└────────────────────────────────────────────────────────┘
```

**Field spec:**

| Field | Type | Required | Default | Behavior notes |
|---|---|---|---|---|
| Name | Text input | Yes | Empty; placeholder "My automation…" | Free text; no uniqueness constraint at create time |
| Environment | Combobox | Yes | Empty; placeholder "Choose an environment…" | Filters to org-accessible Environments. Globe icon prefix. Selecting unlocks Scenario combobox. |
| Scenario | Combobox | Yes | Disabled until Environment selected | Placeholder: "Select an environment first" (disabled state) → "Choose a scenario…" (enabled). No helper text below. After selection, Arguments section renders. |
| Arguments | Dynamic inputs | No | One input per Scenario parameter, all blank | Labels = parameter names. Placeholders = `<param-name>` in angle brackets. Empty = unfilled, prompted at runtime. |
| Model | Combobox | No (has default) | `claude-sonnet-4-6` | Inline pricing below. Updates on selection. |

**Arguments section behavior:**
- Absent before Scenario selection (no empty container; no "select a scenario to see arguments" placeholder section)
- Appears after Scenario is selected, below Scenario combobox, above Model field
- Uses section heading "Arguments" (plain text heading, not a card)
- If the selected Scenario has no parameters, Arguments section does not render (zero parameters = no form surface for arguments)

---

## 6. Step 2B — New QA Agent form

```
┌────────────────────────────────────────────────────────┐
│  DRAWER HEADER                                          │
│  New QA Agent                           [✕]             │
│  Automated trace and task analysis.                     │
├────────────────────────────────────────────────────────┤
│  DRAWER BODY                                            │
│                                                         │
│  Name *                                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  My QA agent…                                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │   [Standard]       [Custom]                       │  │
│  └───────────────────────────────────────────────────┘  │
│  (segmented control; Standard is default active)         │
│                                                         │
│  ─ ─ ─ Standard path (active when Standard selected) ─ │
│                                                         │
│  Standard *                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Choose a standard…                         [▾]  │  │
│  └──────────────────────────────────────────────────┘  │
│  Options:                                               │
│  · False Negative — flags correct outputs penalized      │
│  · False Positive — flags incorrect outputs rewarded     │
│  · Failure Analysis — classifies failure modes per task  │
│  · Reward Hacking — detects policy exploiting reward     │
│                                                         │
│  (After standard selected, read-only detail row:)        │
│  Scenario  [standard-false-negative]   (muted, locked)  │
│  Binding   trace_id                    (muted, locked)   │
│  (these are platform-pre-filled; not user-editable)      │
│                                                         │
│  Model                                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  claude-sonnet-4-6 (default)                [▾]  │  │
│  └──────────────────────────────────────────────────┘  │
│  $3 / $15 per 1M tokens · in / out                      │
│                                                         │
│  Attach to Taskset  (optional)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Search tasksets…                           [▾]  │  │
│  └──────────────────────────────────────────────────┘  │
│  (When contextual entry pre-fills this, shown as        │
│   selected + read-only with a clear [✕] option)         │
│                                                         │
│  ─ ─ ─ Custom path (active when Custom selected) ─ ─ ─ │
│                                                         │
│  Scenario *                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Choose a scenario…                         [▾]  │  │
│  └──────────────────────────────────────────────────┘  │
│  (filters to Scenarios with trace_id or task_id param)  │
│                                                         │
│  (After Scenario selected, read-only binding indicator:)│
│  Binding   trace_id                    (muted, locked)  │
│  (auto-detected from Scenario param signature)          │
│                                                         │
│  Model                                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  claude-sonnet-4-6 (default)                [▾]  │  │
│  └──────────────────────────────────────────────────┘  │
│  $3 / $15 per 1M tokens · in / out                      │
│                                                         │
│  Attach to Taskset  (optional)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Search tasksets…                           [▾]  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
├────────────────────────────────────────────────────────┤
│  DRAWER FOOTER                                          │
│  [← Back]                       [Cancel]  [+ Create]   │
└────────────────────────────────────────────────────────┘
```

**Field spec — Standard path:**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| Name | Text input | Yes | Empty; placeholder "My QA agent…" | |
| Standard | Combobox | Yes | Empty; placeholder "Choose a standard…" | 4 options (False Negative, False Positive, Failure Analysis, Reward Hacking). Selecting auto-fills Scenario and Binding (read-only). |
| Scenario | Read-only | — | Auto-filled from Standard | Platform-assigned. Not editable in Standard path. |
| Binding | Read-only indicator | — | Auto-set from Standard | `trace_id` or `task_id`. Not editable. |
| Model | Combobox | No (default) | `claude-sonnet-4-6` | Inline pricing. |
| Attach to Taskset | Combobox | No | Empty (optional) | Searchable; single-select. Pre-filled from contextual entry. |

**Field spec — Custom path:**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| Name | Text input | Yes | Persists from Standard path entry if toggled | |
| Scenario | Combobox | Yes | Empty; placeholder "Choose a scenario…" | Filtered to Scenarios with `trace_id` or `task_id` param. |
| Binding | Read-only indicator | — | Auto-detected from selected Scenario | Appears after Scenario selected. |
| Model | Combobox | No (default) | `claude-sonnet-4-6` | Inline pricing. |
| Attach to Taskset | Combobox | No | Empty (optional) | Same as Standard path. |

**Segmented control behavior:**
- Switching Standard ↔ Custom clears path-specific fields (Standard selection, or Scenario selection respectively) but preserves Name and Model
- Name persists across path toggles because the user likely typed it before choosing a path

**Scenario combobox filter on Custom path:**
- Filters to Scenarios in the user's accessible Environments that declare `trace_id` or `task_id` as a parameter
- Helper text below combobox: "Scenarios must accept trace_id or task_id."
- If the user has no qualifying Scenarios, shows a no-results empty state: "No qualifying scenarios. A QA Agent scenario must accept trace_id or task_id." with a link to the docs.

---

## 7. Step 2C — New Chat Agent form

```
┌────────────────────────────────────────────────────────┐
│  DRAWER HEADER                                          │
│  New Chat Agent                         [✕]             │
│  Multi-turn conversation over A2A.                      │
├────────────────────────────────────────────────────────┤
│  DRAWER BODY                                            │
│                                                         │
│  Name *                                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  My chat agent…                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Scenario *                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Choose a chat scenario…                    [▾]  │  │
│  └──────────────────────────────────────────────────┘  │
│  Helper: "Scenario must declare chat=True."             │
│  (combobox filters to chat=True Scenarios only)         │
│                                                         │
│  Model                                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  claude-sonnet-4-6 (default)                [▾]  │  │
│  └──────────────────────────────────────────────────┘  │
│  $3 / $15 per 1M tokens · in / out                      │
│                                                         │
│  Endpoint alias  (optional)                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  support-agent-v2                                │  │
│  └──────────────────────────────────────────────────┘  │
│  Helper: "Slug for your A2A endpoint. Auto-generated    │
│  if blank. Lowercase letters, numbers, and hyphens."    │
│                                                         │
├────────────────────────────────────────────────────────┤
│  DRAWER FOOTER                                          │
│  [← Back]                       [Cancel]  [+ Create]   │
└────────────────────────────────────────────────────────┘
```

**Field spec:**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| Name | Text input | Yes | Empty; placeholder "My chat agent…" | |
| Scenario | Combobox | Yes | Empty; placeholder "Choose a chat scenario…" | Filtered to Scenarios with `chat=True`. Helper text: "Scenario must declare chat=True." |
| Model | Combobox | No (default) | `claude-sonnet-4-6` | Inline pricing. |
| Endpoint alias | Text input | No | Empty; auto-generated if blank | Slug format. Helper text states format constraint. Shown post-create as the canonical A2A address. |

**No-qualifying-scenarios empty state (Scenario combobox):**
- "No chat scenarios found. A chat scenario must declare @env.scenario(chat=True)." with docs link.

---

## 8. Validation states

### Required field markers

```
Name *
Environment *
Scenario *
Standard *  (QA Agent Standard path only)
```

`*` suffix on label. No marker on optional fields.

### Inline error anatomy (per field, on submit attempt)

```
  Name *
  ┌───────────────────────────────────┐
  │                                   │  ← empty, attempted submit
  └───────────────────────────────────┘
  Name is required.                      ← inline error, below field, error color
```

### Per-field error copy

| Field | Error copy |
|---|---|
| Name (empty) | "Name is required." |
| Environment (empty, Automation) | "Select an environment." |
| Scenario (empty) | "Select a scenario." |
| Standard (empty, QA Agent Standard path) | "Select a QA standard." |
| Endpoint alias (invalid format) | "Use lowercase letters, numbers, and hyphens only." |

### Submit-blocked conditions

`[+ Create]` is always enabled (never pre-disabled). Errors fire on submit attempt, not on focus-out. This follows form-actions.md — validation errors surface inline on submit; Save (Create) does not pre-disable based on validity.

### Server error banner (submit failure)

Appears at the top of the drawer body, above all fields:

```
┌────────────────────────────────────────────────────────┐
│ [⚠]  Couldn't create Automation — Scenario not found.  │
│       Try again.                                        │
└────────────────────────────────────────────────────────┘
```

Copy form: "Couldn't create [Agent type] — [brief reason if available]. Try again."
- If server returns no reason: "Couldn't create [Agent type]. Try again."
- Uses `<Alert>` component (per empty-and-error-states.md §1 — persistent action-required feedback).
- Form remains open, field values intact, footer buttons re-enabled.

---

## 9. Submit and post-create routing

```
Submit → Success → close drawer

  Automation → /agents (stay) → scroll to new card → brief highlight
  QA Agent (no Taskset) → /agents (stay) → scroll to new card → brief highlight
  QA Agent (Taskset attached) → /tasksets/[taskset-id] column view
  Chat Agent → /agents (stay) → scroll to new card → brief highlight

  (From Job detail entry point — QA Agent) → Job detail QA tab
  (From Taskset detail entry point — QA Agent) → Taskset detail Traces tab
```

**Brief highlight:** a visible temporal affordance on the newly created Agent card in the /agents list — draws the eye to the new item without requiring the user to scan the full list. Duration and visual treatment are motion-designer scope. Functionally required: the user must be able to locate the new Agent without manually searching.

**Scroll behavior:** the /agents list scrolls to make the newly created card visible if it is below the current viewport. The list sort order determines position; newly created Agents are most likely at the top if the default sort is "newest first" (confirm with `agents.wireframe.md`).

---

## 10. Cancel / back behavior

| Action | Behavior |
|---|---|
| `[Cancel]` button (any step) | Close drawer; return to the page the drawer was opened from. No unsaved-changes confirmation — no data is persisted until + Create succeeds. |
| `[✕]` close button (header) | Same as Cancel. |
| Escape key | Same as Cancel. Applies at any focus position inside the drawer. |
| Overlay scrim click | Same as Cancel. |
| `[← Back]` button (Step 2) | Return to Step 1 (type picker). Type card states are restored (the card the user clicked is de-selected). Form data in Step 2 is cleared (not persisted between Back → re-select). |

**No unsaved-changes guard:** the drawer creates an Agent on `[+ Create]` only. Nothing is persisted during Step 1 or Step 2 field-filling. Cancel at any point before submit has no side effects. No `beforeunload` prompt is needed.

**Back from Step 2 → Step 1:** The type cards return to their unselected state. If the user re-selects the same type, the form fields are empty (not restored). This is intentional — the form data in Step 2 is ephemeral and the cost of re-filling 3–5 fields is lower than the complexity of persisting draft state across type-switches.

---

## 11. Responsive behavior

### Desktop (≥1280px)

Drawer anchored right. Width ~480px. The `/agents` index list is visible to the left behind the scrim. All form fields render at full width within the drawer. Three type cards in Step 1 render in a row (three columns).

```
┌──────────────────────────┬────────────────────────────┐
│  /agents list (visible)  │  DRAWER (480px)            │
│  (behind scrim)          │  New Agent / form          │
│                          │                            │
└──────────────────────────┴────────────────────────────┘
```

### Tablet (768px–1279px)

Drawer anchors right at full drawer width. The `/agents` list behind the scrim may be partially obscured — acceptable because the combobox fields are searchable and the user does not need to read the list to fill the form. Type cards in Step 1 remain in a row (three equal columns, narrower cards).

### Mobile (<768px)

Drawer expands to full-screen (bottom sheet or full viewport right drawer that becomes a full overlay). Three type cards in Step 1 stack vertically (one per row). Form fields are full-width. Footer buttons remain at the bottom. No functional difference from desktop.

```
┌────────────────────────────┐
│  FULL SCREEN DRAWER        │
│  New Agent                 │
│                            │
│  [Automation card]         │
│  [QA Agent card]           │
│  [Chat Agent card]         │
│                            │
│  [Cancel]                  │
└────────────────────────────┘
```

---

## 12. Keyboard and accessibility

### Focus management

**Drawer open:**
- Focus moves to the drawer when it opens
- Step 1: focus lands on the first type card ("Automation")
- Step 2 (including contextual entry): focus lands on the Name text input
- Step 2B Standard path, when Standard combobox is the first required unfilled field after name: focus lands on Name on initial open; does not pre-focus Standard

**Drawer close (Cancel, Escape, success):**
- Focus returns to the element that triggered the drawer open (`+ New Agent` button, or contextual entry trigger)
- Exception: success close with Taskset routing navigates to a new page; focus management is that page's responsibility

**Transition Step 1 → Step 2:**
- Focus moves to the Name field immediately on transition

**Transition Step 2 → Step 1 (Back):**
- Focus moves to the type card that was previously selected (or the first card if state is reset)

**Inline error display:**
- When submit-attempt validation fails, focus moves to the first field with an error
- `aria-describedby` links each input to its inline error message element
- Error elements use `role="alert"` to announce to screen readers without `aria-live` polling

### Tab order (Step 2A Automation example)

```
[✕ close] → Name input → Environment combobox → Scenario combobox
  → (Arguments fields, in parameter order) → Model combobox
  → [← Back] → [Cancel] → [+ Create]
```

**Keyboard navigation rules:**
- `Tab` / `Shift+Tab`: moves through form controls in document order
- `Enter` on a type card (Step 1): selects it and advances to Step 2
- `Space` on a type card: same as Enter (card is a `<button>`)
- Combobox keyboard: `↑/↓` to navigate options, `Enter` to select, `Escape` to close without selecting
- Segmented control (QA Agent Standard/Custom): `←/→` arrows switch between options; `Tab` moves out of the control
- `Escape` anywhere in the drawer: closes drawer (bound at drawer root, not per-field)

### ARIA

```html
<!-- Drawer root -->
<div role="dialog" aria-modal="true" aria-labelledby="drawer-title">

  <!-- Header -->
  <h2 id="drawer-title">New Automation</h2>

  <!-- Form -->
  <form>
    <label for="name">Name <span aria-label="required">*</span></label>
    <input id="name" type="text" aria-required="true"
           aria-describedby="name-error" />
    <span id="name-error" role="alert">Name is required.</span>

    <!-- Combobox pattern -->
    <label for="environment">Environment <span aria-label="required">*</span></label>
    <div role="combobox" aria-expanded="false" aria-haspopup="listbox"
         aria-labelledby="environment-label">…</div>
  </form>

  <!-- Footer -->
  <button>← Back</button>
  <button>Cancel</button>
  <button type="submit">+ Create</button>
</div>
```

- `role="dialog"` + `aria-modal="true"`: drawer is a modal dialog; screen readers restrict virtual cursor to drawer content while open
- `aria-labelledby="drawer-title"`: dialog label is the `<h2>` title (updates per step)
- `aria-required="true"` on required inputs
- `aria-describedby` links each input to its error span
- Error spans: `role="alert"` — announced on inject; not on initial render (empty span present but empty)
- Server error banner: `role="alert"` + `aria-live="assertive"` — announced immediately on server failure
- Type cards (Step 1): `role="button"` (if rendered as `<div>`) or `<button>` elements. `aria-label="Select Automation"` etc.
- Segmented control: `role="group"` with `aria-label="QA Agent type"`. Each option: `role="radio"` + `aria-checked`.
- Read-only binding indicator (QA Agent): `aria-label="Binding: trace_id"` — announces the value without interactive affordance

---

## Component summary

| Component | Usage in this flow | Notes |
|---|---|---|
| `Drawer` | Root overlay surface, right-anchored | `role="dialog"` + `aria-modal`. Header, body, footer slots. Focus trap while open. |
| `DrawerHeader` | Title (updates per step) + subtitle + close button | h2 element. `aria-labelledby` target. |
| `DrawerFooter` | Back + Cancel + Create buttons | Back: left-aligned; Cancel + Create: right-aligned group. Footer pattern from form-actions.md. |
| `SelectionCard` | Type picker cards (Step 1 only) | Three peer cards. Icon + name + description. `<button>` semantics. Hover ring. Equal weight. |
| `TextInput` | Name fields; Endpoint alias (Chat Agent) | Full-width in drawer. `aria-required`, `aria-describedby` for errors. |
| `Combobox` | Environment, Scenario, Model, Attach to Taskset, Standard (QA Agent) | Searchable. Disabled state for Scenario before Environment selected. Filtered sets for QA Agent and Chat Agent Scenario pickers. |
| `SegmentedControl` | Standard / Custom toggle (Step 2B) | `role="group"`. `←/→` key navigation. |
| `DynamicParamInputs` | Arguments section (Step 2A) | Rendered from Scenario parameter signature. One input per parameter. Appears after Scenario selected. |
| `ReadOnlyFieldRow` | Scenario + Binding (QA Agent standard path and post-Scenario-select on custom path) | Non-interactive. Label + value. `aria-label` for screen reader. |
| `InlinePricing` | Below Model combobox | `$X / $Y per 1M tokens · in / out`. Updates on Model selection. |
| `Alert` | Server error banner (top of body) | `role="alert"` + `aria-live="assertive"`. Persistent until dismissed or submit retry clears it. |
| `InlineFieldError` | Per-field validation error below input | Empty span present but hidden until error fires; `role="alert"`. |
| `EmptyState` | No-qualifying-scenarios states (QA Custom, Chat Agent Scenario pickers) | Compact variant. Text + docs link. |

---

## Persona notes by surface decision

| Decision | Sam (PRIMARY) | Riley (SECONDARY) | Alex (SANITY GATE) |
|---|---|---|---|
| Drawer surface (not full-page) | Correct — Sam opens this from the agents list, fills 3–5 fields, and returns. He does not need a dedicated composition page; he needs a focused, fast form that keeps the list behind it. | Correct — Riley opens this for bulk QA Agent creation across many Tasksets. Speed and repeatability matter; a drawer with a pre-fill + quick submit loop is the right affordance. | Acceptable — Alex rarely uses this flow (composition is in his Python), but when he arrives via a deep link it shouldn't repel him. Drawer is neutral. |
| Three equal-weight cards (no QA prioritization) | Correct — Sam uses all three. Automation for CI regression, QA Agent for trace analysis, Chat Agent for conversational product features. No single type dominates his use. | Slight mis-fit — Riley primarily creates QA Agents. However, we have no data to justify a visual hierarchy, and promoting one card introduces confusion if usage patterns shift. Keep equal weight; this is a future optimization with data. | Not relevant. |
| Arguments field (Automation) | Load-bearing — Sam configures Automations for report generation and recurring evals with pre-defined scenarios. Pre-filled arguments are exactly the "configure once, run on demand" value. | Relevant — Riley creates Automations for batch task validation scenarios. Pre-filled arguments enable targeting specific task parameter subsets. | Not relevant. |
| Attach to Taskset at QA Agent create-time | Moderate value — Sam creates QA Agents to attach to existing Tasksets for regression tracking. Attach-at-create saves a navigation step. | High value — Riley manages many Tasksets. The attach-at-create combobox is the primary efficiency gain in this flow for Riley, who would otherwise create a QA Agent and then navigate to each target Taskset to attach it. | Not relevant. |
| Standard vs Custom segmented control (QA Agent) | Correct — Sam starts with a pre-built standard and adapts as needed. The Standard path lets him create a functional QA Agent in under 30 seconds. Custom path is available when he needs task-specific analysis. | Correct — Riley uses pre-built standards for delivery QA (False Negative, False Positive are the most relevant). Custom path is rarely needed. | Sanity pass — Alex who writes his own reward functions would use the Custom path. The form is correctly designed to not hide custom capability. |
| Scenario filter (Chat Agent: chat=True only) | Correct — Sam has authored chat Scenarios for conversational product testing. The filter removes noise. | Not relevant. | Not relevant (Alex authors chat Scenarios in code). |
| Inline pricing below Model combobox | Load-bearing for Sam — he is making a model selection for production CI runs with a cost efficiency argument. Inline pricing in the form eliminates the need to navigate to /models to check pricing before picking. | Not relevant — Riley's QA Agents run on a defined volume; model cost is not his primary concern at create time. | Not relevant — Alex selects models in SDK config, not in this form. |
| Post-create routing (QA Agent + Taskset → Taskset detail) | High value — Sam's immediate next action after creating a QA Agent with a Taskset attached is to see it running in that Taskset column. Direct routing saves a navigation step. | High value — same reasoning. Riley's next action is taskset inspection. | Not relevant. |
| Single click on type card (no Continue) | Correct — reduces clicks with no information loss. Sam is not uncertain about his type choice; he is choosing from three distinct options he understands. | Same. | Same. |
| [+ Create] always enabled | Correct — Sam uses this flow frequently. Pre-disabling the button based on validation would require him to check the button state before acting. Always-enabled with on-submit errors is faster for expert users. | Same. | Same. |

---

## Open questions

1. **Arguments field type-coercion:** Scenario parameters may have typed arguments (string, int, bool). Does the Arguments section render typed inputs (a number input for an int parameter), or always plain text inputs with runtime coercion? The draft spec uses plain text inputs for simplicity. Confirm with platform team whether parameter types are available in the Scenario's introspection API.

2. **Scenario combobox filtering for QA Agent (Custom path):** The combobox filters to Scenarios that declare `trace_id` or `task_id` as a parameter. Is this filter available from the Scenario list API, or does it require client-side filtering of the full Scenario set? If client-side, performance risk on orgs with 500+ Scenarios.

3. **Chat Agent Scenario filter (chat=True):** Same question — is `chat=True` a server-filterable attribute on the Scenario API, or a client-side filter?

4. **Endpoint alias format validation:** The A2A endpoint alias "lowercase letters, numbers, hyphens" is assumed. Confirm the actual allowed character set and uniqueness scope (org-scoped or global slug?) with platform team.

5. **Inline pricing data source:** Inline pricing below the Model combobox is pulled from Model Gateway pricing data. Confirm: is per-model pricing available as a structured API response (not just rendered on the /models page), so the drawer can resolve it on model selection?

6. **"Briefly highlight" post-create:** the `agents.wireframe.md` parallel spec defines the highlight affordance. If that spec does not define it, an open question exists there. The behavior is required; the visual treatment is delegated.

7. **Sort order on /agents after create:** if the agents list is sorted by "newest first" (assumed default), the new Agent appears at the top of the list — making "scroll to" a no-op. Confirm the default sort order with `agents.wireframe.md`.

8. **Standard QA Agent Scenario naming:** what are the canonical Scenario names for the four pre-built QA standards (False Negative, False Positive, Failure Analysis, Reward Hacking)? The read-only Scenario field in the Standard path must show the real identifier, not a placeholder like `[standard-false-negative]`. Confirm with platform team.

9. **Contextual entry from Job detail (QA tab):** the `+ New QA Agent` trigger from Job detail is specified here as a secondary entry point. Confirm this entry point is in scope for `job-detail.wireframe.md` and that the pre-fill behavior (Attach to Taskset = Job's Taskset) matches the data model (a Job has exactly one Taskset).

10. **QA Agent re-attach flow:** the task brief references Image #5 (Agents page → "Add as Column" to attach a QA Agent to a taskset post-create). This is a separate action after agent creation. It is not part of this flow but should be confirmed as designed in `agents.wireframe.md`.

---

## Out of scope

- **`/agents` index page** — the `agents.wireframe.md` parallel spec owns the list layout, type filtering, post-create highlight affordance, and "Add as Column" attach interaction. Do not duplicate here.
- **Agent detail surface** — the detail page for a created Agent (configuration view, run history, edit form) is out of scope for this flow spec. The flow ends at successful create.
- **Post-create edit flow** — editing an existing Agent's name, model, scenario, or arguments is a separate surface owned by the Agent detail page.
- **Automation run-time argument prompting** — when an Automation with unfilled arguments is triggered, the platform prompts for those arguments. That prompt UI is not part of the create flow.
- **A2A protocol configuration** — routing rules, authentication tokens, conversation history persistence config for Chat Agents — post-create configuration on the Agent detail page.
- **Bulk Agent creation** — creating multiple Agents in a single session is not addressed. Riley creates one QA Agent per session (fast path via Attach to Taskset), not a batch create wizard.
- **Agent duplication / fork** — "Create another like this" or cloning an existing Agent into a new one — not in this flow.

---

## Drift log

Divergences from current production baseline (Image #10 and Image #11), with justifications.

| Item | Current production | This spec | Reason |
|---|---|---|---|
| Automation card description | "Save a scenario config to run on demand or from CI." | "Configure once, run on demand — scenario + model + pre-filled arguments, repeatable." | Current omits pre-filled arguments, which is the defining differentiator from a raw Job. Copy updated to match canonical docs. |
| QA Agent card description | "Automatic quality checks on taskset traces." | "Automated trace analysis — detect false negatives, false positives, reward hacking, and classify failures." | Current is too vague; "quality checks" does not communicate the four specific analysis types. Sam needs to know what a QA Agent does before creating one. Updated to match canonical docs. |
| Chat Agent card description | "Multi-turn conversation with environment tools." | "Multi-turn conversation over A2A — pair a scenario's tools with a model." | Minor: "served over A2A" is the integration-relevant detail Sam needs to know. Added. |
| Arguments field (Automation form) | Absent — not in Image #11 | Present — dynamic inputs from Scenario parameter signature | Missing required feature. Automations are defined by pre-filled arguments; their absence from the create form makes the form functionally incomplete. Added. |
| "Select an environment first" redundancy (Automation form) | Appears as placeholder AND helper text below Scenario combobox | Placeholder only (in disabled state) | Redundant helper text removed. Disabled combobox state + placeholder communicates the dependency. |
| Model default | `claude-sonnet-4-5` | `claude-sonnet-4-6` | Stale version. Updated to current. |
| Model cost language | "Per-run cost varies by model." (static disclaimer) | Inline `$X / $Y per 1M tokens · in / out` (live, per selected model) | The vague disclaimer does not give Sam the signal he needs to make a cost-informed model selection. Inline pricing resolves on model pick from Gateway data. |
| QA Agent form | Not visible in Image #10–11 (not shown) | Full form spec added: Standard/Custom segmented control, four pre-built standards, binding indicator, Attach to Taskset | Current production shows no QA Agent form baseline. This is a net-new spec. |
| Chat Agent form | Not visible in Image #10–11 (not shown) | Full form spec added: Scenario (chat=True filtered), Model, Endpoint alias | Net-new spec. |
| Post-create routing | Not specified in current production | Per-type routing: /agents + highlight (Automation, Chat Agent), Taskset detail (QA Agent with Taskset attached) | The return-to-list behavior is assumed from current production but unspecified. Made explicit and differentiated by type + condition. |
| No contextual entry points | Only /agents CTA visible | Three entry points: /agents, Job detail QA tab, Taskset detail Traces tab | Current production shows a single trigger. The Job detail and Taskset detail entry points follow from the QA Agent attachment routes described in canonical docs. |
| Footer on Step 1 | Not specified in Image #10 | Cancel only (no Back, no Create) | Step 1 has no form data to submit or back-navigate from. Minimal footer signal. |

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md). Visual references: operator-supplied screenshots Image #10 (current New Agent type picker) and Image #11 (current New Automation form) — Jun 2026. Structural anchor: [`docs/design/screens/models.wireframe.md`](./models.wireframe.md), [`docs/design/screens/environments.wireframe.md`](./environments.wireframe.md). AppShell chrome: [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md). Parallel index: [`docs/design/screens/agents.wireframe.md`](./agents.wireframe.md) (in progress).*
