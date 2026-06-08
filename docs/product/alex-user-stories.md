# Alex User Stories

Primary persona: Frontier RL Researcher (Alex, 29). Stories are anchored to [`alex-workflow.md`](./alex-workflow.md) phases and [`personas.md`](./personas.md) scope. HUD vocabulary used verbatim throughout.

> **Conventions used in this doc:**
> - `**[load-bearing]**` marks the stories that define the product's core wedge for this persona. Cuts and trade-offs preserve load-bearing stories first.
> - Every story cites its source in italics — `(— personas.md: "...")` or `(— alex-workflow.md Phase N: "...")`. If a story has no source citation, it is not grounded and should be removed or re-derived.
> - Acceptance criteria are observable behaviors, not implementation notes. Each row is something a reviewer can check against a running build.

---

## Phase 0 — Cross-cutting

Stories that span multiple phases: SDK-as-peer / CLI-first posture, Trace as the load-bearing artifact across phases, Marketplace browsing and forking, Leaderboard publishing, Credits visibility, Library, no-onboarding-friction (the "40 minutes in" rule).

---

**[load-bearing]** As Alex, I want every dashboard surface to augment what my code already expresses — not replicate it in form fields — so that the web UI adds forensic and operational value without making me redo work my Python already did. *(— personas.md: "he uses every dashboard surface that isn't replicating something his code already expresses")*

Acceptance criteria:
- The dashboard Job launch surface does not re-expose model configuration options that are already set via `hud rl run` flags; it shows status, curve, and Traces only.
- No wizard, `+ New → Agent` flow, or `+ New → Automation` flow appears on any surface Alex reaches from the main nav (Tasksets, Environments, Models, Library, Leaderboard).
- CLI commands (`hud eval`, `hud rl run`, `hud dev`, `hud deploy`, `hud analyze`, `hud debug`) produce the same Job, Environment, and Trace artifacts visible in the dashboard — the web surface is a read/inspect layer on top of CLI-authored artifacts, not a parallel authoring path.
- Attempting to navigate to a dashboard composition wizard from Alex's nav path either 404s or is absent from the nav — no dead-end "You don't have access to this" state.

---

As Alex, I want the first meaningful surface I reach after logging in to be the state of my current work — active Jobs, recent Traces, and Environments in progress — so that I spend zero time on onboarding chrome that adds no signal. *(— personas.md: "when he opens hud.ai he is already 40 minutes into the problem — onboarding flows and welcome tours are pure friction")*

Acceptance criteria:
- No welcome tour, setup checklist, or "get started" modal appears on first login for a returning user or for a user who has already used the CLI (`hud init` creates a project record — dashboard treats that as "not new").
- The home state on login shows: active or recently-completed Jobs, Environments the user has deployed or forked, recent Traces, and Credits balance — all without a click.
- Empty state (no Jobs yet) shows a `hud eval` invocation example and a link to docs.hud.ai — not a setup wizard.
- A user who opened hud.ai within 8 hours of the previous session lands directly on the last-viewed Job or Taskset, not on a home dashboard reset.

---

As Alex, I want to browse and fork public Environments from the Marketplace — with Tool wiring preserved intact — so that I can start from a realistic env without reproducing authoring work the community already did. *(— personas.md: "Marketplace browsing / forking public Environments"; alex-workflow.md Phase 2: "The Marketplace must preserve Tool wiring when forking an existing Environment, not just data wiring — a fork that resets the Tools is silently broken")*

Acceptance criteria:
- Each Marketplace Environment card shows: Environment name, author, Tool count, Scenario count, Task count, Taskset count, fork count, and tier visibility (Public / Private).
- Forking an Environment produces a Private copy in the user's org that includes all `@env.tool()` definitions, `@tool.before`/`@tool.after` hook definitions, and data wiring — inspectable in the Environment detail view before the first Run.
- The fork operation completes and the new Environment appears in the user's Environments list within 30 seconds for Environments with ≤500 Tasks.
- The detail view of a forked Environment shows a "Forked from: [source Environment]" link; clicking it opens the source.

---

As Alex, I want my Credits balance visible from every page header so that I can predict Job cost before launching without navigating away. *(— personas.md: "He pays for two things: real infra he can't easily stand up himself… and the ability to see exactly why an agent failed or reward-hacked")*

Acceptance criteria:
- Credits balance is displayed in the top navigation bar on every authenticated page, updating within 5 seconds of any Job completing or any inference call settling.
- Clicking the Credits balance opens a usage breakdown: env-hours consumed (current billing period), Gateway inference calls (by model), total spend, and remaining balance.
- A Cloud-tier user whose balance drops below $2.00 sees a non-modal inline warning in the header (not a blocking dialog) — dismissable, links to the billing page.
- An Enterprise-tier user sees Credits balance only if their org has configured a usage limit; otherwise the header shows "Enterprise" with no dollar figure.

---

As Alex, I want the Library to surface Environments, Tasksets, and Agents I have saved or favorited so that I can return to recurring eval setups across research sprints without searching. *(— personas.md: "Library" listed in-scope; "bursty — hackathon weekends... research sprints... production cost-cutting sprints" implies need to return to prior setups)*

Acceptance criteria:
- The Library page lists saved/favorited items grouped by type: Environments, Tasksets, Agents — each with name, last-used date, and a one-click "Run eval" action.
- Adding an item to Library is available from every Environment card, Taskset card, and Agent card via a bookmark icon — no dedicated "save" flow.
- Removing from Library does not delete the underlying primitive — it only removes it from the Library view.
- Library is paginated; 50 items per page, sorted by last-used descending by default.

---

## Phase 1 — Prompted baseline

Alex runs his V1 agent against the eval set using a prompted frontier model to separate environment bugs from policy weakness — the surface that surfaces problems before RL hides them.

---

**[load-bearing]** As Alex, I want a per-rollout view — tool calls, arguments, returned payloads, prompt, response, and reward signal — available from the moment I run `hud eval`, so that I can confirm Tools are wired correctly before committing to training. *(— alex-workflow.md Phase 1: "The web app needs a per-rollout view from day one (tool calls, arguments, returned payloads, prompt + response) so he can confirm tools are wired correctly before committing to training")*

Acceptance criteria:
- After `hud eval` completes, the Job detail page shows a Trace grid: one square per Run, colored by outcome (passed, failed, errored, not run).
- Clicking any square opens the Trace for that Run — showing, in a single scrollable view: the full prompt sent to the agent, the agent's response, every Tool call (name, arguments as JSON, returned payload), and the Grader reward signal (float + which Grader fired).
- The Trace view is reachable in ≤2 clicks from the Job list page.
- Tool calls with non-zero argument payloads render arguments as formatted JSON (not a raw string), collapsible when the payload exceeds 200 characters.
- Errored Runs show the error message and stack trace from the Tool or Grader that threw — not a generic "Run failed" message.

---

As Alex, I want `hud eval` to be a first-class entry point in the dashboard — not a precursor step buried in an RL wizard — so that the baseline eval is always visible and comparable to future training runs. *(— alex-workflow.md Phase 1: "`hud eval` is a first-class entry point, not a precursor to `hud rl`")*

Acceptance criteria:
- The Jobs list distinguishes Eval Jobs from Training Jobs with a label ("Eval" / "Training") — not a secondary filter the user has to apply.
- An Eval Job launched via `hud eval` appears in the Jobs list within 10 seconds of the command being submitted.
- An Eval Job's detail page shows the same Trace grid, per-rollout drill-down, and Leaderboard-comparison affordances as a Training Job — not a reduced view.
- Navigating from an Eval Job to a Training Job on the same Taskset (or vice versa) is a one-click action from the Job detail page (e.g., "View Training Jobs on this Taskset").

---

As Alex, I want the eval results to immediately populate the Leaderboard for that Taskset so that I can compare my prompted baseline against public or prior runs without a separate submission step. *(— personas.md: "leaderboard publishing" listed in-scope; alex-workflow.md Phase 1: "manually inspects a sample of rollouts" implies comparison context)*

Acceptance criteria:
- An Eval Job's score is visible on the Taskset's Leaderboard tab within 60 seconds of the Job completing.
- The Leaderboard row for the new run shows: Model name, Job type (Eval), date, mean reward, and pass rate — aligned with all other rows.
- A Private Job's Leaderboard entry is visible only within the user's org by default; making it Public requires one explicit toggle action on the Job detail page.
- The Leaderboard supports sorting by mean reward, pass rate, and date — three sort options available without a filter panel.

---

## Phase 2 — Realistic environment + Tool authoring

Alex ingests production-shape data and authors the Tools the agent calls against it — data and Tools are co-authored, and a bug in either silently breaks every subsequent Run.

---

**[load-bearing]** As Alex, I want to inspect and validate the Tool signatures my agent has access to — before the first training Run — so that I catch Tool definition bugs before they propagate through an entire training job. *(— alex-workflow.md Phase 2: "Preview and inspect the Tools the agent has access to; validate signatures before committing to training; surface `@tool.before`/`@tool.after` hook failures inline")*

Acceptance criteria:
- The Environment detail page shows a "Tools" tab listing every `@env.tool()` defined in the Environment: name, docstring, argument names + types, return type.
- Each Tool entry shows whether `@tool.before` and `@tool.after` hooks are defined — and if so, their hook function signature (not the implementation).
- Running a "validate" action against a Tool (available from the Tools tab) fires the Tool with a dry-run payload and returns: whether the Tool invocation succeeded, the returned payload, and any hook failures — all inline in the tab, not in a separate log view.
- A Tool with a validation failure is marked with a visible error state in the Tools tab list; the Environment cannot be used for a new Job while any Tool has an unacknowledged validation failure (the Job launch button is disabled with a tooltip explaining why).

---

As Alex, I want to preview, filter, and sample production-shape data directly within the env authoring surface — without pre-processing it first — so that I can confirm the data wiring before running any Scenarios against it. *(— alex-workflow.md Phase 2: "env authoring must handle large, irregular datasets without forcing him to pre-process. Preview, filter, sample, and inspect work on the raw data — not on a tidied copy")*

Acceptance criteria:
- The Environment detail page shows a "Data" tab that renders the ingested dataset as a paginated table — 50 rows per page, with column headers derived from the data schema.
- The Data tab supports text filter (substring match on any column) and row sampling (random N rows, where N is configurable 10–500).
- Rows with null or malformed fields are visually distinguished (e.g., highlighted cell, not a hidden row) — no silent data sanitization.
- The Data tab loads the first 50 rows within 3 seconds for datasets ≤10,000 rows.

---

As Alex, I want forking a Marketplace Environment to preserve its Tool wiring intact — not just its data — so that a forked Environment is immediately usable without re-authoring every Tool. *(— alex-workflow.md Phase 2: "a fork that resets the Tools is silently broken")*

Acceptance criteria:
- After forking, the new Environment's Tools tab shows the same Tool list as the source Environment, with all `@env.tool()` definitions, docstrings, and hook registrations present.
- A diff view is available between the forked Environment's Tools and the source Environment's Tools — showing any divergence since fork.
- The fork confirmation dialog explicitly states "Tool wiring, data wiring, and Scenario authoring are all preserved" — not a generic "copy created."

---

## Phase 3 — Scenario authoring + Grader validation

Alex authors the two-yield Scenario contract and validates that the Grader fires correctly on known cases before scaling — the Grader is ground truth for every subsequent Run.

---

**[load-bearing]** As Alex, I want to run the Grader against a sample of real Environment states and see whether it fired correctly — before scaling to a full Taskset — so that I can confirm the reward function is not broken before it poisons an entire training run. *(— alex-workflow.md Phase 3: "A 'Grader fired / didn't fire' diff view before full-scale eval is the load-bearing piece of this phase")*

Acceptance criteria:
- The Taskset detail page shows a "Grader validation" panel: select a Scenario, select a sample of Tasks (up to 20), run the Grader against those Tasks, view per-Task results (reward float returned, Grader that fired, whether the expected outcome matched).
- The panel renders a "fired / didn't fire" diff: Tasks where the Grader returned > 0 vs Tasks where it returned 0, with the actual float visible on each row.
- For Tasks where expected vs actual outcome diverge, the panel shows the full Grader output (which Grader, what condition evaluated, what the environment state was at yield 2) — not a binary pass/fail.
- The validation run completes within 60 seconds for a 20-Task sample on a Cloud-tier account.
- A Grader validation with ≥1 unexpected outcome (expected pass but Grader returned 0, or expected fail but Grader returned > 0) produces a visible warning state on the Taskset card in the Tasksets list until the validation is re-run and clears.

---

As Alex, I want to author Scenarios and compose Graders inside a Taskset — not as floating objects — so that the eval logic is always organized around its task context. *(— alex-workflow.md Phase 3: "The Taskset is the organizing unit — Scenarios are authored inside a Taskset, not floating free")*

Acceptance criteria:
- New Scenario creation is always initiated from within a Taskset detail page — there is no standalone "Create Scenario" entry point outside a Taskset context.
- The Taskset detail page lists all Scenarios in that Taskset with: name, Grader type(s) used, Task count, and last-validated date.
- Deleting a Taskset requires explicit confirmation that names the Scenario and Task count — "This will delete N Scenarios and M Tasks. This cannot be undone."
- A Scenario can belong to exactly one Taskset; moving a Scenario to a different Taskset is a copy-then-delete operation, not a reassignment.

---

As Alex, I want to compose code-defined Graders — `BashGrader`, `exact_match`, `contains`, `numeric_match`, `f1_score` — with an editor that validates the Grader signature and shows the expected return type before I run it, so that I don't discover type errors at eval time. *(— alex-workflow.md Phase 3: "Alex's profile tends toward code-defined Graders where the success condition can be expressed in code")*

Acceptance criteria:
- The Scenario editor shows a Grader picker listing all native Graders: `BashGrader`, `LLMJudgeGrader`, `exact_match`, `contains` / `contains_any` / `contains_all`, `numeric_match`, `f1_score`.
- Selecting a Grader shows its required parameters inline (not in a separate docs tab) — each parameter with name, type, and description sourced from the Grader's native docstring.
- Composing multiple Graders (e.g., `exact_match` + `BashGrader`) shows the combined reward formula — how the floats are combined — before saving.
- Saving a Grader configuration with a missing required parameter produces an inline validation error on the parameter field, not a server-side error on submission.

---

As Alex, I want to use `LLMJudgeGrader` when only a rubric is available — with its rubric editable in the same Scenario editor — so that I'm not forced to write a code-defined Grader for subjective success conditions. *(— alex-workflow.md Phase 3: "`LLMJudgeGrader` is the right tool when only a rubric is available")*

Acceptance criteria:
- `LLMJudgeGrader` appears in the Grader picker alongside code-defined Graders — not behind a separate "advanced" toggle.
- Selecting `LLMJudgeGrader` exposes a rubric text field inline in the Scenario editor; the rubric is saved as part of the Scenario definition.
- The Grader validation panel (from the load-bearing story above) runs `LLMJudgeGrader` the same way it runs code-defined Graders — per-Task reward float visible, with the LLM's rubric evaluation output (which criteria passed/failed) shown for each Task.
- `LLMJudgeGrader` runs are billed against the Model Gateway; the estimated Credit cost for a 20-Task validation sample is shown before the user triggers the run.

---

As Alex, I want to bootstrap a candidate Task set by sampling Environment data and using an LLM to propose realistic user questions + verified answers — then review, edit, or reject each candidate before committing to the Taskset — so that I can build a golden eval set on top of unstructured data (emails, scraped pages, real corpora) without hand-authoring every Task. *(— Corbitt, "How to Train Your Agent" (AI Engineer Conference 2025): "fed batches of 20 Enron emails to Gemini 2.5 Pro and asked it to generate realistic user questions along with their verified answers. After filtering out the weird questions, he was left with a golden dataset of a few thousand verified queries"; alex-workflow.md Phase 3 surface implication)*

Acceptance criteria:
- The Taskset detail page exposes a "Generate Tasks from data" action that opens a configuration panel: select source Environment data (a Data tab sample), select a generation Model (any model available in the Model Gateway), specify batch size (default 20 rows per LLM call) and target Task count.
- The generation run produces candidates in a review queue — each candidate showing the source data sample, the LLM-generated question, the LLM-generated verified answer, and the LLM-generated rationale. No candidate is committed to the Taskset until Alex acts on it.
- Per-candidate actions in the queue: Accept, Reject, Edit (modify question/answer inline). Bulk actions: Accept all, Reject filtered.
- The queue persists across sessions — Alex can leave and return without losing curation state. Already-actioned candidates are excluded by default; a toggle shows them.
- Committing accepted candidates writes them as Tasks under the active Scenario in the Taskset; the commit operation is non-destructive (rejected candidates stay in the queue history, accessible for one-click re-review).

---

## Phase 4 — Training loop + multi-objective reward

Alex runs `hud rl`, monitors loss and reward curves, layers in secondary rewards, and adjusts weights across runs — accuracy alone is not the win condition.

---

**[load-bearing]** As Alex, I want the training-curve dashboard to surface cost-per-rollout, latency, tool-turn count, and hallucination rate as first-class series alongside reward — each with a one-click drill to the rollouts driving it — so that I can see when the policy is trading accuracy for the wrong efficiency gain. *(— alex-workflow.md Phase 4: "Cost-per-rollout, average latency, tool-turn count, and hallucination rate are first-class series alongside reward — each with a one-click drill to the rollouts driving it")*

Acceptance criteria:
- The Training Job detail page shows a multi-series chart with at minimum these series selectable: mean reward, cost-per-rollout (USD), mean latency (ms), mean tool-turn count, hallucination rate (float, 0–1). All series are on by default; each is individually toggleable.
- Clicking any data point on any series opens the Runs at that training step — a filtered Trace grid showing only Runs from that step, with per-Run values for all five series visible in the grid header.
- The Trace grid from a clicked data point loads within 3 seconds.
- Series are rendered on a shared x-axis (training step) — no separate axis management required to compare series.

---

As Alex, I want reward weights to be visible and editable next to the training curve — not buried in a config file — so that I can adjust the multi-objective balance while watching the curve, without leaving the dashboard. *(— alex-workflow.md Phase 4: "Reward weights are visible and editable next to the curve, not buried in a config file")*

Acceptance criteria:
- The Training Job detail page shows the reward weight configuration (primary reward weight + any secondary reward weights) in a sidebar panel next to the curve — not in a separate settings page.
- Reward weights are editable inline; saving a new weight configuration creates a new Training Job (not a mutation of the running one) with the new weights applied — the prior Job remains visible for comparison.
- The sidebar shows the current weights as a labeled breakdown (e.g., "Accuracy: 0.6 | Latency: 0.2 | Tool turns: 0.2") with the sum displayed and a validation error shown if the sum ≠ 1.0.
- Creating a new Training Job from the weight editor pre-populates all other configuration (Model, Taskset, Environment) from the current Job — only the weights change.

---

As Alex, I want `hud rl run` to produce a new private Model in my Models list when training completes — and for that Model to be immediately usable as the input to a new Eval Job — so that the Eval → Train → Re-eval loop requires no manual wiring between runs. *(— alex-workflow.md: "Run a baseline Eval Job, submit `hud rl run <taskset> -m <model-id>`, a new private Model lands in the list and feeds the next Eval Job")*

Acceptance criteria:
- A Training Job that completes successfully creates a new Model in the user's Models list with: name derived from the base model + run identifier, visibility set to Private, and a "Trained from: [Job ID]" link.
- The new Model is selectable as the model input for a new Eval Job within 60 seconds of the Training Job completing.
- The Models list distinguishes base Models from trained (fine-tuned) Models with a visible label — not a filter the user has to apply.
- Clicking "Trained from: [Job ID]" on a trained Model opens the Training Job detail page — one click, no search.

---

## Phase 5 — Reward-hack inspection

Alex watches for unnatural curve shapes and reads the actual rollouts behind any suspicious data point — this is where models cheat, and curves alone will not catch it. **This is the load-bearing UX of the entire product for Alex.**

---

**[load-bearing]** As Alex, I want a single click from any data point on any training curve to open the Runs and Traces at that step — tool calls, arguments, returned payloads, prompts, responses, and Grader reward signal — so that I can read what the policy is actually doing when the curve looks wrong. *(— alex-workflow.md Phase 5: "this is the load-bearing UX of the entire product for Alex. From any data point on any training curve, one click opens the rollouts (Traces) at that step — tool calls, arguments, returned payloads, prompts, responses, and the reward signal from the Grader. No modals layered three deep. No re-querying. No 'open in another tab.'")*

Acceptance criteria:
- On the training-curve chart, clicking any data point opens a Trace grid panel — inline on the same page, not a new tab or a modal over the chart — showing all Runs at that training step.
- The Trace grid panel is visible within 3 seconds of the click, without a full page reload.
- Each Run in the Trace grid is expandable inline to show: the full prompt, the agent's response, every Tool call (name, arguments as formatted JSON, returned payload), and the Grader reward signal (float + which Grader fired).
- The expanded Trace view is reachable in ≤2 clicks from the chart data point (1 click = open panel; 2 clicks = expand individual Run).
- Closing the Trace grid panel returns the user to the exact same chart state (zoom level, selected step, active series) — no chart reset.
- The panel persists while the user scrolls the chart — it is not dismissed by scrolling.
- For Training Jobs with >1,000 Runs at a single step, the Trace grid shows the first 100 Runs by default, sorted by reward ascending (lowest reward first — most likely hacks), with a "Load more" control and a filter by outcome (passed, failed, errored).

---

As Alex, I want the Trace viewer to show QA Agent analysis results — Reward Hacking, Prompt Alignment, False Negative, False Positive — alongside the raw rollout so that I can confirm whether a suspicious curve is a genuine hack or a Grader misfire. *(— personas.md: "QA Agent (automatic quality checks on traces — pre-built ones for Prompt Alignment, Failure, False Negative, False Positive, Reward Hacking analysis)"; alex-workflow.md Phase 5: "Is there evidence of reward hacking or gaming the evaluation?")*

Acceptance criteria:
- The Trace detail view shows a "QA Analysis" section — collapsed by default, expandable inline — displaying QA Agent results for: Reward Hacking, Prompt Alignment, False Negative, False Positive.
- Each QA result shows: verdict (flagged / not flagged), the QA Agent's reasoning (≤3 sentences), and the confidence float.
- Triggering a fresh QA Agent run from the Trace detail view is a single-click action; the result replaces the prior result in the same section without a page reload.
- QA Agent runs consume Credits; the estimated Credit cost is shown in a tooltip on the trigger button before the user clicks.

---

As Alex, I want to run the Trace Analysis tab — querying across a batch of Traces for patterns like systematic reward hacking — so that I can find hack patterns that appear only at population scale, not in individual Runs. *(— alex-workflow.md Phase 5: "reward hacking listed as a named analysis query in Trace Analysis at `https://docs.hud.ai/platform/internal/trace-analysis.md`")*

Acceptance criteria:
- The Job detail page has a "Trace Analysis" tab that allows free-text queries against all Traces in the Job (e.g., "Is there evidence of reward hacking or gaming the evaluation?").
- Submitting a query returns results within 30 seconds for Jobs with ≤500 Runs.
- Results are presented as: a summary answer (≤3 sentences), a list of flagged Runs with their reward float and a one-sentence flag reason, and a link to each flagged Run's Trace detail view.
- The Analysis tab preserves query history for the current session — prior queries and their results are accessible via a scrollable history panel, not lost on navigation.

---

As Alex, I want to navigate from a Trace flagged for reward hacking directly to the Grader that fired on that Run — opening the Grader source in the Phase 3 Scenario editor with the flagged Run preloaded as a validation sample — so that patching the loophole and re-validating the Grader is one continuous action, not a context switch across three surfaces. *(— Corbitt, "How to Train Your Agent" (AI Engineer Conference 2025): "When you catch the model reward hacking, the standard debugging fix is to modify your reward function. For the Hacker News title generator, Corbitt fixed the exploit by adding a secondary LLM judge specifically instructed to penalize the model if the title was not supported by the underlying article content"; alex-workflow.md Phase 5 surface implication)*

Acceptance criteria:
- The Trace detail view (any Trace, not only QA-flagged ones) has an "Edit Grader" action in the QA Analysis section header that opens the Scenario editor for the Grader that fired on that Run.
- The Scenario editor, when opened from this action, preloads the flagged Run as one of the Grader validation sample Runs — so the first revalidation after editing the Grader can include the original hack case without manual setup.
- After saving an edited Grader configuration, the editor offers a one-click "Launch revalidation" action that runs the new Grader against the preloaded sample + any other Tasks Alex selects.
- A successful revalidation (the previously-flagged Run now returns a different reward float) shows a diff: prior reward → new reward, with the Grader change responsible for the diff highlighted.

---

## Out of Scope (Alex)

Stories that belong to Sam, Riley, or no current persona. Listed here to prevent "while we're at it" additions to Alex's surfaces during design review.

- **Compliance chrome and audit-export flows**: Regulatory badges, audit-log export buttons, BAA flow language, regulated-workload disclosures — these belong to Sam's path, not Alex's. Alex is measured on paper acceptance and contract renewal, not external defensibility. *(— personas.md: "Out of scope [for Alex]: compliance chrome, audit-export flows")*
- **No-code domain-expert collaboration UI**: Any surface designed so that a non-engineer domain expert can configure Scenarios, review Traces, or approve Tasksets without reading code. Alex authors in Python; his collaboration surfaces are SDK docs and Discord, not dashboard collaboration flows. *(— personas.md: "Out of scope [for Alex]: no-code domain-expert collaboration UI")*
- **Dashboard composition wizards (`+ New → Agent`, `+ New → Automation`, `+ New → Chat`)**: Form-based flows that re-author what Alex's Python already expresses. These are Sam's surfaces — Sam has no incentive to express composition in Python when a form does it faster. Putting these on Alex's nav path is pure friction. *(— personas.md: "Out of scope [for Alex]: dashboard composition wizards (`+ New → Agent` / `Chat` / `Automation` flows) that re-author what his Python already expresses. His composition lives in code, not form fields.")*
- **Bulk task authoring, QA deliverable packaging, and per-taskset quality exports**: Riley's primary surfaces. Riley authors RL environments as a commercial deliverable sold to frontier labs; these surfaces serve a buying-lab audience. Alex authors for himself. Designing Riley's QA surfaces to Alex's raw-output tolerance is the "Riley collapsed into Alex" anti-pattern. *(— personas.md anti-pattern: "Riley collapsed into Alex — designing Riley's QA and delivery surfaces to Alex's CLI-first, raw-output tolerance. Alex ships to himself; Riley ships to a paying lab with a contractual quality bar.")*
- **Training-curve surfaces on Sam's path**: Reward-function editors, training-curve dashboards, step counters, and training-cost dashboards must not appear on Sam's surfaces. Sam does prompt + RAG + eval, not RL fine-tuning. If a flow only makes sense when training a model, it belongs to Alex, not Sam. *(— personas.md anti-pattern: "Sam RL creep — picturing Sam as the agent engineer who does it all, including RL fine-tuning, reward-function design, and watching training curves at 2 AM.")*
- **Frontier-lab enterprise admin flows on Alex's path**: SSO provisioning, org-level user management, multi-seat billing management — these are procurement and IT surfaces for enterprise account admins, not surfaces Alex reaches. Placing them on Alex's nav path is compliance-creep in a different form. *(— personas.md: "Alex compliance creep — adding compliance affordances to Alex's path because 'it doesn't hurt to have them.'")*
