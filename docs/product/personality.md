# Product Personality — North Star

Owned by the product-designer. Drives every visual, interaction, and copy decision downstream — design tokens, wireframes, screen specs, component anatomy, copy.

---

## North star paragraph

Alex is 40 minutes into a problem when he opens hud.ai. He ran 50 Jobs over the weekend; the reward curve spiked at step 4,096 and the Trace shows the policy gaming the same phrase on every rollout. He came to verify that suspicion, not to be guided through it. Sam opened the dashboard at 9 AM because an ops lead flagged a disputed output and needs the exact Trace before the 11 AM call. Riley is mid-batch on a 500-task QA run for a Friday delivery and needs fail counts before filing a status update. Three people, three clocks, one platform. The dashboard earns trust by being exact, traceable to code, and entirely out of the way.

---

## Personality adjectives

**Traceable · Exact · Spare · Composed · Earnest**

- **Traceable** — every aggregated metric has a drill path to the raw artifact behind it. The user-facing promise: "show me the thing behind this number."
- **Exact** — `0.7341` not `70%`. `step 4,096` not `~4k`. `$0.0043/run` not `~$0`. Rounded or hedged values are the product lying.
- **Spare** — no wizard flows, no encouragement copy, no onboarding chrome on the steady-state surface. Restraint is deliberate for an audience already deep in the problem.
- **Composed** — three personas, five phases, a four-tier primitive set — none of this structural complexity is exposed as navigation overhead. The surface composes it into a coherent reading altitude.
- **Earnest** — error copy states cause, not apology. Empty states show the CLI command. The dashboard does not perform confidence it doesn't have.

---

## Personality statement

HUD shows you the Trace behind every number — step, tool call, reward signal, hack — and stays out of the way while you decide what to do about it.

---

## Primary surface

One click from any data point on any training curve to the Runs (Traces) at that step: tool calls, arguments, payloads, prompts, responses, and the Grader reward signal. No modals layered three deep. No re-querying. No "open in another tab." This is the load-bearing UX of the entire product for Alex.

---

## Two-altitude rule

Same page, two reading depths — switching altitudes is one gesture (one click), not a navigation change.

- **Glance altitude** — training curve, Trace grid summary, Leaderboard row. Orient in seconds without a click.
- **Deep altitude** — per-Run Trace: every Tool call, argument payload, prompt, response, and Grader reward float.

The curve never loses its drill path; the Trace viewer always has a return-to-curve affordance. Breaking the drill or removing the return violates the primary surface contract.

---

## Sacrificial choices

1. **One-click drill over navigation depth.** We lose a "full" dedicated Trace page reachable in one step. We accept that cost because inspection latency is the product's only existential risk for Alex.

2. **Phase order over shortcut flows.** We don't build a "start training" quick-launch that bypasses the prompted baseline. We lose new-user convenience; we keep the phase sequence that prevents training on a broken environment.

3. **Operator fluency over first-session ease.** Steady-state dashboard carries no onboarding chrome; empty state shows a CLI command, not a setup wizard. We lose new-user hand-holding; we gain a surface that doesn't insult Alex at Job 51.

4. **Code-defined Graders as default; `LLMJudgeGrader` as equal-status fallback.** Authoring leads with `BashGrader`, `exact_match`, `contains`, `numeric_match`, `f1_score`. `LLMJudgeGrader` is in the same picker, not behind an "advanced" gate, but not presented as an equivalent default. We trade rubric-first new-user convenience for alignment with the product's auditable-reward differentiator.

5. **Alex's path is not softened for Sam; Sam's path is not RL-ified for Alex.** Composition wizards are Sam's surfaces; training-curve dashboards and reward-function editors are Alex's. We lose a unified nav; we keep correctness for both personas.

6. **Riley's delivery surfaces are separate from Alex's forensic surfaces.** Pass/fail counts and exportable quality reports are designed for the buying lab as a secondary reader. Alex's raw-output posture does not substitute. We lose surface consolidation; we keep correctness for both personas.

7. **Free tier includes authoring; paid infra is the wedge.** Authoring Environments, Tools, Scenarios, and Graders is free. The paywall is cloud execution and RL training. Copy and empty states must encode this: the thing the user is doing is not paywalled; the infra they cannot self-host is.

---

## Voice & copy

**Peer, not guide.** Talking to someone who has already read the docs and is diagnosing a problem. Not explaining itself.

**Exact values.** `0.7341` not `70%`. `step 4,096` not `~4k`. `$0.0043/run` not `~$0`.

**Error voice.** Direct cause, not apology. "Job failed — CUDA OOM on step 312. See Run logs." Not "Something went wrong — please try again."

**Empty states.** Show the CLI command. "No Jobs yet. Run `hud eval <taskset>` to start." Not an illustration, not a CTA paragraph.

**Provenance.** Every result surface exposes primitive IDs (Job ID, Run ID, Taskset ID, model version) — not just a human label. Every first-class entity has a stable deep-linkable URL.

**Never:** encouragement copy, progress celebrations, onboarding coach language in steady state, passive hedges ("It seems like…"), marketing-speak in product copy.

**HUD vocabulary is non-negotiable.** Use these verbatim in every label, empty state, error, and tooltip — never a synonym:

| Say | Never say |
|---|---|
| Environment | benchmark, sandbox (as a standalone noun), env (in UI labels) |
| Tool | function, action, capability, skill |
| Task | test case, test, example, sample |
| Taskset | dataset, test suite, eval set, benchmark set |
| Job | experiment, run (Run is the sub-unit) |
| Run | trial, episode, rollout (in labels — ML prose is fine) |
| Trace | log, recording, replay, history |
| Agent | bot, assistant, model (Model is the LLM) |
| Credits | tokens, usage units, compute credits |
| Model Gateway | proxy, API gateway, router |
| Grader | judge (standalone label), evaluator, scorer (noun forms) |
| LLMJudgeGrader | LLM judge, judge grader (when naming the specific class — use the class name verbatim) |

---

## Interaction principles

1. **Status is ambient, not requested.** Job progress, streaming trace updates, and run counts update in view without the user polling or navigating.
2. **Color = state, never decoration.** Run outcome states each own a hue assignment. No color carries decoration-only weight. Hue assignments are set in the design-token phase; this rule is set here.
3. **Training curve → Trace is one click, inline.** Clicking any data point opens the Trace grid panel on the same page — one click from any series (reward, cost-per-run, latency, tool-turn count, hallucination rate).
4. **Efficiency metrics are first-class series alongside reward.** Cost-per-rollout, mean latency, Tool-turn count, and hallucination rate appear on the training curve — not buried in a sub-tab. Each has the same drill path to its Runs as reward does.
5. **Tool authoring is a co-activity with data ingestion in Phase 2.** The Environment detail page shows Tool signatures, hook definitions, and validation affordances alongside the data tab — not CLI-only. A Tool with a validation failure blocks Job launch.
6. **Code-defined Grader composition is the default surface; `LLMJudgeGrader` is an equal-status picker option.** The Scenario editor leads with `BashGrader`, `exact_match`, `contains`, `numeric_match`, `f1_score`. The Grader validation panel runs both types the same way.
7. **Fork preserves wiring.** Tool definitions and hook registrations are part of the fork, not just data. A forked Environment that resets its Tool wiring is silently broken.
8. **Failure is first-class.** Errored Runs surface the error message and stack trace from the Tool or Grader that threw — not a generic "Run failed."
9. **Provenance on every aggregate.** Every score, mean, rate, and leaderboard entry links to the primitives it was computed from. A mean reward percentage without a Job ID and Taskset link is not a HUD surface.
10. **Anchoring is a primitive.** Every Run, span, curve data point, and Trace step has a stable shareable URL. Sharing a suspicious curve point is a copy-link action, not a screenshot.
11. **Keyboard-first, but pointable.** Command palette as a primary navigation path. Every drill action (curve click, Trace grid expand, Grader picker) is reachable by keyboard without requiring mouse.
12. **Leaderboard is comparison, not diff-against-prior.** The Leaderboard shows model rankings and cross-run comparisons on a Taskset — not a "what changed since the last run" diff.
13. **Free-tier affordance visibility.** Authoring affordances are visible and functional on the free tier. Cloud-gated actions show their tier requirement inline and non-blockingly — not hidden until the user hits a paywall.

---

## Anti-personality drift map

- **Traceable → undifferentiated provenance noise.** Showing every ID and lineage pointer at equal prominence buries the signal. Provenance is surfaced on demand or anchored to a natural reading path — not ambient.
- **Exact → precision theater.** Six decimal places on a value the user cannot act on at that precision is performance. Exact means canonical value at the level of the user's decision granularity.
- **Spare → prototype-grade.** Removing chrome to feel expert crosses into feeling unfinished. Restraint must be intentional: nothing on screen has no function; not nothing on screen.
- **Composed → implicit phase order.** Composing complexity away does not mean hiding the phase structure. Phase progress must be legible without being a wizard.
- **Earnest → over-literal.** Honest, not verbose. Empty state copy is the minimum true thing — one command, one doc link. Not a tutorial.

---

## Moodboard

| System | Steal | Don't steal |
|---|---|---|
| Weights & Biases | Run table as homepage; metric series individually toggleable | "Experiment" as top-level concept; equal-weight-all-runs default |
| Bloomberg Terminal | Density without apology; color as pure state encoding; no wasted real estate | Fixed-layout assumption; terminal-era IA |
| Vercel deploy logs | Log lines as readable artifact; streaming without spinners; precise actionable errors | Deployment-action framing (HUD is analysis-first) |
| Linear | Command palette as primary entry; zero encouragement copy; ambient status color | Issue-list as primary surface |
| F1 pit wall telemetry | Streams that update without prompting; design for parallel data sources | Physical-hardware constraint |
| Cursor / Zed | User knows what they're doing; tool is fast and honest, not guiding | Editor-as-canvas metaphor |

---

## Counterexample

Current hud.ai: composition wizards that re-author what Alex's Python already expresses; empty states with search-bar chrome and no CLI command; no curve-to-Trace inline drill; efficiency metrics absent from training views; no Scenario authoring, Grader validation, or Tool authoring in the dashboard. Prototype-minimal posture mistaken for operator-minimal posture. This is explicitly what is being replaced.

---

## Domain states the product must express

**Run / Trace outcome states:** scored · failed · errored · not run · running

**Interaction states:** hovered · focused-selected · pinned-anchored

---

## Out of scope (deliberately)

- **Motion** — durations, easings, reduced-motion — motion-designer's layer.
- **Hue assignments** — which specific color values carry which state — design-token phase.
- **Async collaboration** — roles, permissions, comment threads, presence indicators — different product.
- **Compliance chrome on Alex's path** — audit-log export, regulatory badges, BAA language — Sam's path only.
- **Composition wizards on Alex's path** — `+ New → Agent`, `+ New → Automation`, `+ New → Chat` — Sam's surfaces.
- **RL training surfaces on Sam's path** — training-curve dashboards, reward-function editors, step counters — Alex's surfaces only.
- **Riley's delivery-packaging and buying-lab export flows** — bulk triage UI, exportable quality reports — Riley's separate path.

---

Derived from: platform.md, personas.md, alex-workflow.md, alex-user-stories.md.
