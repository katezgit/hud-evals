# Page Inventory

Per-page spec: route, primary persona, primary JTBD, key entities, links in / links out.

---

## Home

**Route:** `/`
**Primary persona:** Aman
**Primary JTBD:** Triage job health on first open — are any jobs crashed, failed, or anomalous?
**Key entities:** Jobs (status: running / failed / errored / scored), Credits balance, Alerts/anomalies

**Sections (priority order):**
1. **Critical alerts** — failed or errored Jobs since last visit. Zero-state = nothing to triage. Populated = failure cards with Job ID, Taskset, error type, timestamp.
2. **Active Jobs** — live-running Jobs (Eval + Training), streaming status. Count + status badges. Link to Jobs → Active.
3. **Recent completions** — last 5–10 completed Jobs (any type), scored/failed status visible.
4. **Credits balance** — today's spend, link to Workspace → Billing.

**Links in:** Nav logo, browser bookmark
**Links out:** Job detail (from any job row), Jobs (fleet view), Workspace → Billing (from credits)

**Persona note:** Aman wakes up and checks Home first. Every element above the fold must be glanceable without a click. Priya may land here too — the job health triage is neutral to persona (she also cares if her eval jobs crashed). No training-specific data on Home; Active Jobs section shows Eval job cards by default and Training job cards only if present.

---

## Jobs

**Route:** `/jobs`
**Primary persona:** Aman
**Primary JTBD:** Monitor, drill into, and manage the full fleet of running and historical Jobs — eval baselines, training runs, reward-hack inspection.

**Tabs:**

### Active tab (default when any job is running)
**Key entities:** Live Job cards (Eval + Training), training curves per card (Reward / Cost-per-rollout / Latency / Tool-turns / Hallucination rate), Reward weights editor (Training Job cards only)
- Each Training Job card: multi-series curves streaming live. Click any curve point → inline Trace panel (Phase 5 one-click drill).
- Each Eval Job card: task grid filling in real-time, per-run scores.
- `+ Run Eval` CTA (Taskset + Model required).
- `+ Start Training` CTA (phase-gated: requires prior scored Eval Job on the same Taskset; blocks with specific message if missing).
- Default when no jobs are running: falls back to History tab.

### History tab
**Key entities:** All Jobs (Eval + Training), filterable by type / Taskset / model / status / date
- Sortable columns: Job ID, Taskset, model ID, type (Eval / Training), status, latest reward score, step count, cost-per-rollout, created.
- Each row: stable URL. Keyboard nav (j/k or arrows, Enter to open).
- Row → Job detail page.
- Aman's fleet view: renders ≥50 rows without pagination page switch.

### Scenarios tab (Phase 3)
**Key entities:** Taskset-scoped Scenarios (two-yield contract: prompt template + Grader logic), Grader Validation sub-view
- Taskset selector scopes the list.
- Scenario list: name, Grader type (computer / filesystem / coding / web), last validated, status.
- Scenario row → Scenario detail: yield 1 (prompt template), yield 2 (Grader logic as Python), Environment it runs against.
- `+ New Scenario` opens Scenario editor (code surface; no LLM-as-judge option).
- Grader Validation sub-view per Scenario: run Grader against sample environment states, diff view (expected vs. actual reward), filter by fired / not-fired / errored.

### QA Agents tab
**Key entities:** Standard QA Agents (Prompt Alignment, Failure, False-Negative, False-Positive, Reward Hacking Analysis), run history
- Each agent card: description, environment it runs on (`trace-explorer:*`), CTA: "Run on Job" → select Job from history.
- Agent run history: Job + trace batch scoped.
- No "Your Automations" here — Automations live in Workspace.

**Links in:** Home (active jobs link), nav, cmd+K
**Links out:** Job detail, Trace, Taskset detail (from Taskset selector in Scenarios), Workspace → Automations (for composition wizards Priya needs)

---

## Job Detail

**Route:** `/jobs/[id]`
**Primary persona:** Aman (and Priya for Eval jobs)
**Primary JTBD:** Inspect a single Job's results, traces, and — for Training jobs — curves with one-click drill.

**Tabs:**

### Overview tab
- Job metadata: ID, type (Eval / Training), Taskset, model ID, seed, timestamps (created, started, completed), status, total cost, CLI command used.
- For Eval Jobs: task grid (scored / failed / errored per Run), per-task score distribution (0–99% / 5–75% / 15–40%), avg/best@3/best@5.
- For Training Jobs: multi-series curves (Reward, Cost-per-rollout, Latency, Tool-turn count, Hallucination rate). Each series on its own y-axis scale. Every curve point is clickable → inline Trace panel.
  - Reward weights editor inline alongside curves (editable fields; saving triggers new Run, not mutation of current).
- Publish toggle (for Eval Jobs with status "scored"): publish results to Taskset Leaderboard. Captures model ID, Taskset ID, score, timestamp, seed.

### Traces tab
- Full Trace grid for the Job. Filterable by status (scored / failed / errored), sortable by reward score.
- Row → Trace detail page.
- Toolbar: filter by "errored only", "scored 0", pattern match.

### Usage tab
- Tool usage distribution (tool name, avg/tr, time, score, empty%, out tokens).
- Common tool call patterns matrix.

**Links in:** Jobs fleet view (History tab), Home (job row), curve-point click (opens inline panel within this page)
**Links out:** Trace detail, Taskset detail (from Taskset ID metadata link)

---

## Trace Detail

**Route:** `/jobs/[id]/runs/[run-id]`
**Primary persona:** Aman (and Priya for dispute resolution)
**Primary JTBD:** Read exactly what the agent did — tool calls, arguments, payloads, prompt, response, reward signal.

**Content:**
- Tool call sequence: name, input arguments as JSON, returned payload as JSON — in call order, verbatim (no truncation without explicit expand).
- Prompt sent + model response in same scroll context.
- Grader reward signal: exact float ("Reward: 1.0000"), labeled. If Grader errored: exception type + message in place of the value.
- Step number, elapsed time, model ID, seed visible.
- Related Traces sidebar: other Runs from the same Job with similar or contrasting scores.
- Stable URL. Copy-link affordance.

**Links in:** Job detail (Traces tab, curve-point drill), Jobs → QA Agents (agent run output)
**Links out:** Job detail (back), Taskset detail (via metadata)

---

## Tasksets

**Route:** `/tasksets`
**Primary persona:** Aman (artifact reference), Priya (model comparison, leaderboard)
**Primary JTBD:** Browse, manage, and fork Tasksets; see per-model leaderboard scores.

**Tabs:**

### My Team tab (default)
- Card grid: Taskset name, task count, last eval date, best score, active/running badge, linked Environments.
- `+ New Taskset` CTA: shows `hud init taskset` CLI command + metadata form only (no authoring wizard).
- Search + sort.

### Public tab
- Redirect prompt: "Looking for public Tasksets? Browse the Marketplace →" with link.
- (Public taskset cards formerly here now live in Marketplace → Tasksets.)

**Links in:** Nav, Marketplace fork action (routes back to My Team after fork)
**Links out:** Taskset detail, Marketplace

---

## Taskset Detail

**Route:** `/tasksets/[id]`
**Primary persona:** Aman + Priya
**Primary JTBD:** Inspect a Taskset's composition, compare model performance on it, trigger Jobs against it.

**Tabs:**

### Overview tab
- Taskset metadata: ID, task count, Scenario count, linked Environments, owner, visibility, created.
- Scenario list summary (names + Grader types).
- Recent Jobs run against this Taskset (last 5, cross-link to Jobs → History filtered by this Taskset).

### Leaderboard tab (canonical per `platform.md`)
- Model rankings: model ID, Avg / Best@3 / Best@5 scores, run timestamp, seed.
- Sortable by score, model, date.
- Publish button (per-row for scored Jobs Aman owns).
- Unpublish action.
- Link each row to the Job detail.
- Public toggle: make Taskset leaderboard public (appears in Marketplace → Tasksets).

### Jobs tab
- All Jobs run against this Taskset, cross-links to `/jobs` fleet view filtered by this Taskset ID.

**Links in:** Tasksets list, Jobs detail (metadata link), Marketplace fork
**Links out:** Jobs fleet view (filtered), Job detail, Environment detail (from linked env)

---

## Environments

**Route:** `/environments`
**Primary persona:** Aman (Phase 2 — env authoring + registration)
**Primary JTBD:** Register, inspect, and fork Environments; preview raw data before wiring into a Taskset.

**Tabs:**

### My Team tab (default)
- Cards: name, description, scenario count, tool count, env var count, data connector status (wired / unwired), last deployed.
- `+ New Environment` CTA: SDK-link registration form (metadata only — no authoring wizard). Empty state shows `hud deploy` CLI command.
- Filter: All types / Starred first.

### Browse tab
- Redirect prompt: "Browse public Environments in the Marketplace →" with link.

**Links in:** Nav, Marketplace fork action
**Links out:** Environment detail, Marketplace

---

## Environment Detail

**Route:** `/environments/[id]`
**Primary persona:** Aman
**Primary JTBD:** Inspect environment configuration and raw data before running Jobs against it.

**Tabs:**

### Overview tab
- Metadata: ID, source (CLI-authored vs. Marketplace fork), data connector status, scenario definitions, tools, env vars, data wiring.
- If forked: provenance label ("forked from [source env ID]").

### Data Preview tab (Phase 2)
- Raw data preview: renders records as-is, no normalization.
- Filter by field value, record count, regex pattern.
- Random-N sample selector.
- Renders first page without full load for ≥10k records.

### Jobs tab
- All Jobs run against this Environment (cross-link to Jobs fleet view filtered by this env ID).

**Links in:** Environments list, Taskset detail (linked env), Marketplace fork
**Links out:** Jobs fleet view (filtered), Taskset detail

---

## Marketplace

**Route:** `/marketplace`
**Primary persona:** Aman (browse + fork community artifacts)
**Primary JTBD:** Find and fork a public Environment or Taskset to benchmark against, with data wiring intact.

**Tabs:**

### Environments tab (default)
- Community environments: name, description, scenario count, tool count, fork count, owner.
- Fork CTA per card: copies env with data wiring intact (not a stripped template).
  - If source env's wiring requires credentials Aman doesn't hold: specific prompt for those credentials only.
  - Forked env appears in Environments → My Team with provenance label.

### Tasksets tab
- Public Tasksets: name, Environment it runs against, Scenario count, Grader primitives used, fork count.
- Fork CTA: copies Scenarios and Graders, not the originating Job results.
- CLI command to use the forked Taskset is shown in the fork confirmation panel.

**No Leaderboards tab.** Leaderboard is per-Taskset (Taskset detail → Leaderboard tab), not a cross-Taskset marketplace surface.

**Links in:** Nav, Tasksets → Public redirect, Environments → Browse redirect
**Links out:** Environments → My Team (post-fork), Tasksets → My Team (post-fork), Environment detail, Taskset detail

---

## Workspace

**Route:** `/workspace` (tabs within)
**Primary persona:** Mixed — Priya for composition; Aman for credentials, billing
**Primary JTBD:** Admin, credentials, billing, and Priya's composition surfaces.

**Tabs:**

### API Keys
- Table: Name, Key (masked), Created, Expires, delete action.
- `Create new key` CTA.

### Team
- Team member list, invite management.

### Billing
- Plan, invoice history, credits top-up.

### Usage
- Two sub-tabs: Environments (env-hours table) / Inference API (call log: input, output, model, cost, created).
  - Inference API sub-tab absorbs current Library → Logs data.

### Models
- Full model table (model name, provider, model ID, usage, reasoning, speed, price/M, trainable, visibility).
- Filters: Private / Trainable / Provider.
- Primary surface for Priya's model-provider comparison.
- Accessible from cmd+K → "models".

### Automations (Priya's composition surfaces)
- `+ New Automation` CTA: CI-triggered scenario runs. Priya's in-scope wizard.
- `+ New QA Agent` CTA: automated regression checks on trace batches. Priya's in-scope wizard.
- Your Automations list (formerly "Your Automations" section on the Agents page).
- Standard QA Agents are NOT listed here (they live in Jobs → QA Agents tab, Aman's operational surface).

### Collections
- Saved/favorited traces and Jobs. Low-frequency access.
- Absorbs Library → Collections.

### Secrets
- Secret management for env vars.

### Settings
- Workspace-level configuration.

**Links in:** Workspace dropdown in utility nav, cmd+K
**Links out:** (admin surfaces; cross-links to Jobs for usage context)

---

## Agents

**Route:** `/agents`
**Primary persona:** Sam (Applied Agent Engineer)
**Primary JTBD:** Browse, configure, and activate the three Agent types (QA Agents, Automations, Chat Agents) — attach QA Agents to Tasksets, run Automations on demand, connect Chat Agents via A2A.

**Sections (type-grouped, in order):**
1. **QA Agents** — Standard HUD-provided presets (always present) + user-created QA Agents. Primary actions: attach to Taskset, view run history.
2. **Automations** — user-created scenario + model pairs, run on demand or from CI. Primary action: run with optional pre-filled args.
3. **Chat Agents** — multi-turn agents served over A2A. Primary action: get A2A endpoint URL.

**Key entities:** Agent (QA Agent / Automation / Chat Agent), Taskset (attach target), Job (run output), Trace (run output detail), Scenario (agent config), Model (agent config)

**Links in:** Nav, `+ New Agent` header CTA, Taskset detail → Traces tab → "Add QA Agent" (reverse path), Job detail → QA Agent panel (consumer surface), deep link `?agent=[id]`
**Links out:** New Agent drawer (`new-agent.wireframe.md`), Taskset detail (from attached taskset rows in slide-over), Job detail (from run history `↗` links), `/jobs?agent=[id]` (full run history overflow)

**Wireframe:** [`docs/design/screens/agents.wireframe.md`](../screens/agents.wireframe.md)

**Persona note:** Sam is PRIMARY — all three agent types are in scope for him. Riley is SECONDARY — QA Agent attach to Tasksets is load-bearing for his delivery workflow. Alex is SANITY GATE ONLY — he may land here via deep link but does not create agents; page must not break his read-only flow.

---

## Notes on removed pages

| Removed | Was | Why |
|---|---|---|
| Library | `/library` (Collections / Jobs / Traces / Logs tabs) | Superset of Jobs with no differentiated lens. Jobs → History + Workspace absorb all data. |
| Workspace → Dashboard | Separate tab showing aggregate training charts | Training curves live in Job detail, not in a Workspace-level aggregate page. Aggregate curves without a drill path were the exact failure mode. |
| Workspace → Progress | Separate tab showing Taskset Scoreboard | Leaderboard belongs on Taskset detail (canonical per `platform.md`), not in a Workspace sub-tab. |
