# Environment Detail Page — Screen Wireframe (`/environments/[slug]`)

> Wireframe convention: structure, hierarchy, copy, and flow only. Pixel sizes, Tailwind class hints, and color tokens belong to the screen-spec and design-tokens phases.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — AppShell outer chrome. This wireframe covers the `MAIN` region only.
- [`docs/design/screens/environments.wireframe.md`](./environments.wireframe.md) — index page that links into this detail page. URL-linkified description, "No description" muted-italic state, tri-metric vocabulary (scenarios / tools / env vars), star semantics, and Riley-as-CO-PRIMARY weight are all inherited here. Status-dot semantics from the index wireframe §4.6 were not carried forward — dots have been removed from the detail page title row (see Decision 10 and Drift log).
- [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md) — structural anchor. Two-altitude header pattern, tab bar shape, decision-log format, variant matrix, and states coverage table are all inherited from this file.
- [`docs/design/screens/taskset-detail.wireframe.md`](./taskset-detail.wireframe.md) — sister detail page for additional precedent on header altitude, descriptor strip field-set conventions, and Settings tab anatomy.

Visual reference: operator-supplied production screenshots of hud.ai Environment detail page — Jun 2026. Structural anchor: model-detail.wireframe.md.

## Drift log

- 2026-06-09 — Removed body Info block from Overview tab. Source/Visibility/Created are surfaced in the page header (meta row + title-adjacent chip). The body section was redundant and pushed Scenarios further from the fold.
- 2026-06-09 — Status dot removed from title row (see Decision 10). Dots remain on index-page cards.

---

## HUD-side question answered

### What does each persona DO on this page, and why?

**Alex (Frontier RL Researcher — PRIMARY, private-env-owner variant)** arrives here primarily as the owner of his own Environment (`hud-browser`, `trading-rl-env`). His jobs:

1. **From My Team → env card** — operational check. Post-`hud deploy`, he arrives to confirm the new Build succeeded, check that Scenarios propagated correctly, and run a scenario against his current agent. Sub-30-second landing scan: does the Build tab show SUCCEEDED? Are the Scenarios I authored present?
2. **From a failed Instance notification or CLI** — debugging. He wants to find the specific Instance that failed, read its status, drill to its Trace. Jobs → Instances → failed row → Trace.
3. **From the Models index (picking a model for a run)** — he already picked a model; now he's configuring the environment variables and selecting a scenario to Run. Configure panel is the destination.
4. **From the Explore tab (discovery)** — Alex rarely appears as a visitor because he builds his own environments. When he does visit a public env, it's to confirm whether it's worth forking, not to run it directly. He reads scenarios + source, then leaves to `hud init <name>` locally.

**Alex (PRIMARY persona — visitor path, less-frequent for him)** — variant A. His one job: "Is this Environment worth running my RL agent against, or worth basing my own env on?" He reads Scenarios + Tools count + env vars list, possibly tries a scenario via Load → Run Evaluation to see the latency and output, then leaves to fork on GitHub and `hud deploy`. He never opens Settings.

**Sam (Applied Agent Engineer — SECONDARY)** arrives as a visitor (public env) or owner. As a visitor: "Will this env benchmark my agent?" — Configure API keys → Load scenario → pick model → Run Evaluation. Lower fork rate than Alex. As an owner: same operational ops as Alex owner variant.

**Riley (RL Environment Vendor — CO-PRIMARY)** arrives as the owner of a public Environment he authored and sold. This page is his vendor dashboard for that deliverable. His jobs:
1. **Builds tab** — confirm each `hud deploy` landed correctly (SUCCEEDED). A FAILED build means delivery may be broken.
2. **Instances tab** — monitor client-side runtime usage. FAILED instances signal a broken delivery the client will escalate.
3. **Overview tab** — read the public-facing description and scenario list for clarity (his commercial signal).
4. **Settings tab** — manage env-var schema, Resource Tier, File Tracking config.

Riley is CO-PRIMARY for this page, inheriting the same persona-weight elevation established in the environments index wireframe.

---

## Decision log — 10 required decisions

### Decision 1: Right-panel layout — persistent column vs modal vs drawer

> Decision history: Initially specified as persistent right column; overturned 2026-06-09 per operator — drawer chosen to prioritize browse-surface clarity and desktop/mobile parity.

**HUD-side question:** When a visitor or owner clicks "Load this scenario →" on a scenario card, does the Configure/Load Scenario panel (a) live as a persistent right column always visible, (b) open as a full-page modal overlaid on the scenario list, or (c) open as a right-side drawer triggered from the chosen scenario card?

**Choice: Right-side drawer, triggered from each scenario card's `Load this scenario →` action. Dismissable.**

The drawer keeps the browse surface — the scenario list — at full Overview content width. The Configure context surfaces at the moment the user has chosen a target scenario, not before. This removes the ambient right-column presence that was occupying screen real estate before the user had made any selection. Desktop now matches the mobile pattern already established in §11 (bottom sheet on tap), removing a desktop/mobile mental-model seam that previously required separate reasoning for the two breakpoints.

The trade-off acknowledged: a visitor who wants to preview env-var requirements before selecting a scenario must now look at the card-level "Missing: KEY" warning inline on each card, rather than reading the full var form in a persistent panel. The card-level warning is sufficient for the pre-selection check (it names each missing var); the full input form only appears after the user has committed to a target scenario, at which point the drawer's focused context is strictly more useful than a persistent ambient form.

**Drawer dismiss behavior:** Per-scenario, per-session persistence is recommended — re-opening the drawer for the same scenario within the same session restores any values the user had already entered. Switching to a different scenario's drawer discards prior in-progress values for the previous scenario (each scenario has distinct required vars; pre-filled values from a different scenario context would mislead). This persistence behavior should be confirmed with engineering at implementation phase.

**Responsive behavior:** Tablet and mobile behave identically — drawer/sheet overlay, scrim behind, close affordance at top. Only drawer width and overlay treatment may differ at narrow widths (drawer may go full-width on small viewports). See §11.

**Persona reason:** Alex and Sam, as visitors doing a try-it run, benefit from a full-width scenario list that lets them read names, descriptions, and card-level missing-var warnings without a fixed-width right column compressing the browse surface. Configure context is a focused action triggered from a chosen scenario — making it a drawer makes the intent explicit: "I have selected this scenario, now I am configuring it."

### Decision 2: Header CTA copy for Variant A (public, visitor)

**HUD-side question:** What is the right affordance for a visitor who wants to build on or deploy this environment? The production path is: fork the GitHub repo → `hud deploy` locally. HUD has no dashboard Fork button. What is the honest CTA?

**Choice: `[Use as template]` when GitHub source is known; no header CTA when source is "Deployed via CLI" only (CLI snippet in Overview body instead).**

"Use as template" accurately describes the action (this env becomes the starting point for your own) without implying a one-click dashboard operation. It links to the GitHub repo if available. When the source is only "Deployed via CLI" (no public GitHub link), the header CTA is absent — instead, a prominent CLI block appears in the Overview body below the description:

```
hud init <slug>   [⎘]
```

with a doc link: "Read the docs ↗". This is honest: the user must go to the CLI. No fake button.

**Persona reason:** Alex reads `hud init <name>` as the correct next step — he recognizes it instantly. Sam is slightly less CLI-first but similarly expects a real command, not a wizard. Presenting a dead-end "Fork" button that opens a form with no backend support would be worse than a CLI snippet.

### Decision 3: Scenarios tab — card progressive disclosure

**HUD-side question:** Production shows three states for a scenario card: (1) default with name + description + "Load this scenario →" + "Missing: KEY" warning, (2) expanded with parameter schema rows, (3) expanded further with Python source code via `</>` toggle. Are these three view modes or progressive disclosure on a single card?

**Choice: Progressive disclosure on the single card, with two independent toggles — `[Show schema]` and `[</>]`.**

Both toggles start collapsed. `[Show schema]` expands the parameter schema block (field names + types); `[</>]` toggles Python source code (the `@env.scenario` decorator + function body). The two can be open simultaneously. The source-code toggle uses the `</>` glyph with a tooltip: "Show source code" / "Hide source code" (matching image 3).

This is not three view modes with a control — it is one card with two additive disclosure layers. The default card state (name + description + Load CTA + Missing warning if applicable) is the browsing state. The schema and source disclosures are for deeper inspection without leaving the Scenarios tab.

**Persona reason:** Alex (as both visitor and owner) reads the schema before loading a scenario to understand what arguments the Run Evaluation form will ask for. He reads the source code to verify the Grader logic before committing to this env as an RL benchmark. These are distinct jobs with different frequencies — schema is read more often than source.

### Decision 4: Builds tab — column set

**HUD-side question:** Beyond the production-visible columns (version + LATEST badge, status, source label, artifact counts, duration, timestamp, kebab), should commit SHA and a "View logs" link surface inline?

**Choice: Add commit SHA (GitHub-sourced builds only) as a sub-row beneath the version. View logs is an inline link in each row, NOT in the kebab.**

Columns: `VERSION` · `STATUS` · `SOURCE` · `ARTIFACTS` (tools / scenarios / files counts, icon + count) · `DURATION` · `WHEN` · `LOGS` · `[⋮]`

The `LOGS` column contains a small "View logs" text link per row. Moving it to the kebab adds a click to Alex's most-common debugging action (failed build → read the build log). The kebab retains: Redeploy (trigger a new build), Delete build record.

For GitHub-sourced builds: a sub-row below the version shows `SHA: abc1234 [⎘]` + commit message truncated to 60 chars. For CLI-sourced builds: the sub-row is absent.

**Persona reason:** Alex's post-`hud deploy` job is: did it succeed, how long did it take, and if not — what failed? "View logs" inline eliminates a kebab click in the failure path. Riley (vendor) cares most about SUCCEEDED/FAILED status at a glance; the column ordering puts STATUS second (after version), which is his primary scan signal.

### Decision 5: Instances tab grouping and view toggle

**HUD-side question:** Production groups Instances by date (image 9). When is this grouping more helpful than a flat list? Should the view toggle (grid / list / density icons in image 9) be kept?

**Choice: Group by date by default; flat list when "Running (N)" filter chip is active. View toggle: keep rows only (drop grid option).**

Date grouping helps Alex and Riley find "the run I kicked off this afternoon." When the "Running" filter is active, temporal grouping is irrelevant — every row is live, and a flat list sorted by most-recently-started is more useful.

The production view toggle has three icons (image 9): grid, list, density. The density distinction (compact vs comfortable row height) is a valid preference; the full grid option for Instances is not — Instance rows have too many fields (status, timestamp, duration, cost, tier, user, ID) to compress into a card without losing readability. Retain: `[☰ Comfortable] [☰ Compact]` toggle. Drop the grid card view.

**Persona reason:** Alex owner variant: he looks at Instances to find a specific failed run from this week. Date-grouped rows satisfy "today's runs" vs "last Tuesday's batch." Riley: same job, but he monitors client-side runs, so date grouping helps him confirm "yes, the client ran the job on delivery day."

### Decision 6: "Make Automation" affordance in the right panel

**HUD-side question:** The brief confirms that Automation is a subtype of Agent. The "Go to Automations →" link in the loaded-scenario panel navigates to the Agents flow with env + scenario prefilled. What exactly does this link do, and should the panel spec it further?

**Choice: "Go to Automations →" navigates to `/agents?type=automation&new=1&env=<slug>&scenario=<name>`. The Agents creation flow is out of scope for this wireframe. The contract stops here.**

The panel labels this section "1. Make Automation" and the link reads "Go to Automations →". No modal, no inline wizard. The link is a navigating anchor — it leaves this page. On the Agents page (per image 7), the New Automation form pre-populates the selected Environment and Scenario. This wireframe does not design that form.

**Persona reason:** Alex does not use Automations in his RL loop — he runs via CLI. Sam uses Automations for CI-triggered scenario runs — the "Go to Automations →" link is his path. The panel spec does not need to solve the Agents flow; it only needs to surface the entry point cleanly.

### Decision 7: Settings — File Tracking as a sub-section

**HUD-side question:** Public docs mention a "Files" tab. Production uses File Tracking inside Settings (images 10–11). Which is canonical?

**Choice: File Tracking is a sub-section of the Settings tab, NOT a separate tab. Honor production.**

The five-tab shell is: Overview · Scenarios · Builds · Instances · Settings. File Tracking lives inside Settings as a collapsible sub-section with an enable/disable toggle. When enabled, it expands to show Tracked Paths list (with × per row + add-path input at bottom) and Exclude Patterns list (same pattern). See §8 (Settings tab anatomy) for the full spec.

**Persona reason:** Riley configures File Tracking once during environment setup, not on a recurring basis. It does not earn its own tab. Alex may never configure it. Burying it in Settings is appropriate — Settings is the admin surface for infrequently-changed configuration.

### Decision 8: Variant A Settings visibility

**HUD-side question:** A public env visitor sees the Settings tab. Which sub-sections are visible, read-only, or hidden?

**Choice:**
- **Environment Info** (Display Name, Environment ID + `hud link --id <id>` hint): visible, fully read-only. The env ID is useful metadata for any user integrating this env.
- **Pod Configuration** (Resource Tier, Request Timeout, Session Duration): visible, read-only. Useful signal: a visitor knows the resource profile they'll get if they run a scenario.
- **File Tracking**: hidden entirely for visitors. No "Owner only" label — just absent.
- **Environment Variables**: keys shown (so the visitor can see what variables exist), values fully masked and non-interactive (no reveal eye for visitors). Section header carries: "Values are visible to the environment owner only."
- **Build Arguments**: hidden entirely for visitors.

The Settings tab for Variant A is titled "Info" in the tab label (not "Settings") to signal its read-only nature. Alternate: keep "Settings" label but render a prominent note at the top: "You are viewing as a visitor. Configuration is read-only." — this is the choice made here, for consistency with the tab shell.

**Persona reason:** A visitor reading pod configuration before deciding to run a scenario is making a cost/performance assessment — that is a legitimate info need. The env ID is a copy-able reference for linking and CLI invocations. Hiding all of Settings entirely from visitors is overcautious; hiding writable sections is correct.

### Decision 9: Empty states per tab

**HUD-side question:** What do empty states look like for Scenarios (none authored), Builds (never deployed), and Instances (no runs yet)?

**Choice:** Each empty state uses the Earnest + Spare pattern — directive heading, CLI command, doc link. No illustrations, no wizard CTAs.

- **Scenarios — empty:** "No Scenarios yet. Add Scenarios to this Environment using the `@env.scenario` decorator." + `hud deploy` CLI block + "Read the docs ↗"
- **Builds — empty:** "No Builds yet. To build this Environment, run `hud deploy` from your project directory." + `hud deploy` [⎘] CLI block + "Read the docs ↗"
- **Instances — empty (all filter):** "No Instances yet. Load a Scenario and run it, or trigger a run via the SDK." + "Read the docs ↗"
- **Instances — empty (Running filter):** "No running Instances." (single line — terse is right here; user just filtered to Running)
- **Instances — empty (Terminated filter):** "No terminated Instances."

CLI commands used: only `hud deploy` (confirmed verb). NOT `hud build` as a standalone (docs use `hud deploy` for the full build+push cycle). NOT `hud env new` (does not exist — banned per brief).

**Persona reason:** Alex owner: the empty Builds state after a fresh `hud init` is the first thing he sees. Showing the exact deploy command removes any ambiguity. Riley vendor: same. Empty Instances for a visitor signals "no one has run anything publicly visible here" — a doc link is the correct next step, not a CLI command (visitor doesn't have the env source).

### Decision 10: Index-wireframe open question §15 item 3 — status dot semantics (retired)

The environments index wireframe flags status dot semantics as an open question (§15 item 3). This wireframe carried those dots forward in an earlier draft. They have since been removed from the detail page title row entirely (Jun 2026) — see Drift log.

**Rationale:** Dot 1 (visibility) was redundant with the explicit `🌐 Public` / `🔒 Private` pill in the same title row. Dot 2 (health/activity) had no confirmed semantics. "Spare" personality argues against rendering ink with no function. If operational status is needed it will surface on the Builds or Instances tab, not the header.

**Carry-over:** The index wireframe (environments.wireframe.md) still uses dots on cards — that is out of scope here and is unchanged.

### Decision 11: State 2b missing-var fix — inline editable block vs. round-trip to State 1

**HUD-side question:** When a scenario is loaded but one or more required env vars are unset, how does the user fix the gap? Options: (a) a read-only warning banner with a "Configure ↑" link that sends the user back to State 1 to locate and fill the var, then return to State 2; (b) an editable inline-fix block inside the warning area — monospace var name + masked input + reveal-eye per missing var, resolved reactively as each is filled.

**Choice: inline editable block (option b).** The "Configure ↑" link and round-trip are removed. The inline-fix block accepts values directly at the point of friction. Each filled row disappears. When all rows clear, the block disappears and the CTA enables. No navigation, no reload.

**Persona reason:** Sam is the load-bearing persona here (first-time visitor to a public env). The round-trip (back → scan full var list → fill → return to State 2) is the primary friction source for his "get to first run" job. Inline fix removes all intermediate steps. For Alex visitor: same benefit — the named input at the point of friction is strictly faster than finding the var in State 1's full list. The "Configure ↑" link was also structurally misleading: State 2 *replaces* State 1 in the right column — there is no State 1 "above" to scroll to. The link pointed nowhere meaningful and was a band-aid for the round-trip this decision eliminates.

---

## §1 Shared layout note

The `MAIN` region is the content area to the right of AppShell's persistent sidebar. This wireframe does not redraw the sidebar, credits widget, or user chip.

```
┌─────────────────────┬─────────────────────────────────────────────────────────┐
│  SIDEBAR (AppShell) │  MAIN                                                   │
│  [see app-shell     │                                                         │
│   wireframe.md]     │  [ENVIRONMENT DETAIL CONTENT — this file]               │
│                     │                                                         │
└─────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## §2 Page header anatomy

Two-altitude header pattern inherited from model-detail.wireframe.md §2 and taskset-detail.wireframe.md §2. Breadcrumb + title row + descriptor strip. Environment-specific field set only is specified here.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER  (sticky)                                                           │
│                                                                                  │
│  ← Environments  /  browserbase                                                  │
│  (breadcrumb — "← Environments" links back to /environments; current env name   │
│   is plain text, not a link)                                                    │
│                                                                                  │
│  TITLE ROW                                                                       │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  [env type icon]  browserbase   [🌐 Public]                               │  │
│  │  (h1 / env name)  (h1)          (vis. pill)                               │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│  (right slot — Variant A, GitHub source known):  [Use as template]               │
│  (right slot — Variant A, CLI source only):      (no CTA — CLI snippet in body) │
│  (right slot — Variant B, public owner):         (no CTA)                       │
│  (right slot — Variant C, private owner):        (no CTA)                       │
│                                                                                  │
│  DESCRIPTOR STRIP (one line, below title row)                                    │
│  [env type chip]  ·  <slug> [⎘]  ·  Deployed via CLI  ·  Created 16 days ago   │
│                                                                                  │
│  Variant B/C (GitHub-sourced):                                                   │
│  [env type chip]  ·  <slug> [⎘]  ·  GitHub: kv/trading-rl-env [↗]  ·  Created 16 days ago  │
│                                                                                  │
│  ☆ <star count>  (star toggle — public envs only, rightmost of strip)           │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Breadcrumb:** `← Environments` links to `/environments`. Current page name is plain text. Identical altitude to model-detail and taskset-detail breadcrumbs.
- **Environment type icon:** small icon left of the env name. Represents the environment type (Browser, Code/SWE, etc.). Same 14×16 chip pattern as the index cards. Decorative at this altitude; label is the primary affordance.
- **Environment name h1:** human-readable name. Not the slug.
- **Visibility pill:** `🌐 Public` (Variant A/B) or `🔒 Private` (Variant C). Present on all variants — entry path is agnostic, the signal must be present regardless of where the user came from. Same register as model-detail `🔒 Private` pill.
- **Right-slot CTA:**
  - Variant A + GitHub source: `[Use as template]` — links to the GitHub repo URL. Clicking opens the GitHub repo page in a new tab. Does NOT open a dashboard fork modal — no such flow exists.
  - Variant A + CLI-only source: no header CTA. A CLI block appears in the Overview body (see §3).
  - Variant B (public owner): no CTA. Owner does not fork their own env.
  - Variant C (private owner): no CTA.
- **Descriptor strip:** single line below the title row. Fields separated by `·` (middle dot):
  - `[env type chip]` — env type label chip (Browser, Code/SWE, etc.).
  - `<slug> [⎘]` — environment slug in monospace + copy button. High-frequency: Alex pastes the slug into SDK calls and `hud link --id` references.
  - Source label — either `Deployed via CLI` (terminal glyph icon) or `GitHub: <org>/<repo>` (GitHub glyph + link, opens in new tab).
  - `Created <relative date>` — e.g., "Created 16 days ago".
  - `☆ <count>` (star toggle) — rightmost of strip, public envs only. Community adoption signal. Interactve: click to toggle bookmark. Semantics per environments.wireframe.md §9.
- **Sticky behavior:** Full page header (breadcrumb + title row + strip) stays pinned to the top of the MAIN region as tab content scrolls.

---

## §3 Tab bar anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TAB BAR  (sticky, below page header)                                            │
│                                                                                  │
│  Variant B/C (owner, private or public):                                         │
│  [Overview]  [Scenarios  N]  [Builds  N]  [Instances  N]  [Settings]            │
│                                                                                  │
│  Variant A (public, visitor):                                                    │
│  [Overview]  [Scenarios  N]  [Builds]  [Instances]  [Settings]                  │
│  ← Builds and Instances show reduced content for visitors (see §6, §7)           │
│                                                                                  │
│  ← underline variant; active tab underlined; default active = Overview           │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Overview** — no count badge. The Overview carries the persistent Configure/Load/Run panel, not a countable list.
- **Scenarios** — count badge = total Scenario count in this Environment (e.g., `Scenarios 6`). Load-bearing: Alex and Riley assess coverage at a glance. Always shown with count for owners. For visitors on public envs: same count.
- **Builds** — count badge for owners (Variant B/C): total Build count. No count badge for Variant A visitors (content is restricted — see §6).
- **Instances** — count badge for owners (B/C): total Instance count. For Variant A visitors: no count badge or "(your N)" suffix indicating only their own test instances are visible (see §7). Omit the badge from the tab label for visitors to avoid misleading counts.
- **Settings** — no count badge. Admin tab. Present on all variants — visitors see it in read-only mode per Decision 8.
- **Default active tab: Overview.** Alex's and Riley's primary landing jobs both start on Overview — Alex to check env state and start the Configure → Run flow; Riley to verify the public-facing description and scenario list.
- **Tab bar sticky:** pins just below the sticky page header as tab content scrolls.

---

## §4 Overview tab

### Overview tab state machine

The Overview tab has three states driven by drawer open/close and scenario selection:

- **State 1** — Drawer closed. Scenario list occupies the full Overview content width. No Configure form is visible. The user is browsing scenarios. Card-level "Missing: KEY" warnings surface which scenarios require additional keys.
- **State 2** — User clicks `Load this scenario →` on scenario X. Drawer slides in from the right edge with that scenario's Configure form (env-var inputs) + model picker + Make Automation section + Run Evaluation CTA. All required vars for this scenario are already configured; CTA is enabled. When the user clicks **Run Evaluation**, the button enters an inline "Submitting…" state (spinner, disabled) while the create-job request is in-flight. On success, the browser navigates to `/jobs/[id]` — the newly-created job's detail page. The drawer does not show a result panel; the navigation is the exit. If the create-job request fails, the drawer stays open and surfaces the error inline above the CTA; no navigation occurs. Error treatment is a screen-spec deliverable.
- **State 2b** — Same drawer-open entry path as State 2, but one or more required env vars for the selected scenario are missing. The inline-fix block (Decision 11) surfaces inside the drawer at the point of friction. CTA is disabled until all missing vars are filled. On Run click, same submit-then-navigate behavior as State 2.

**Exit: Run click navigates to `/jobs/[id]`.** The navigation target is the newly-created job identified by the `id` returned from the create-job API response. The Job detail page is where the run's artifact (trace + reward) lives; landing the user there matches their next action without requiring an extra click inside a dismissable drawer.

**Return path (Job detail page — deliverable for that wireframe):** The Job detail page should provide a breadcrumb / back affordance to `/environments/[slug]/overview` and a "Run another scenario on [env-name] →" link that returns the user to the Overview tab. These are deliverables for the Job detail wireframe; this spec only states the expectation.

**Scenario card `Loaded →` state on navigation return:** When the user navigates back to the Overview tab after a run, the previously-loaded scenario card reverts to `Load this scenario →` CTA. The `Loaded →` state tracks drawer-open, not lifetime. Re-opening the same scenario's drawer starts from State 1 unless the user has not yet navigated away in the current session.

**Dismiss behavior:** The drawer has an explicit close/dismiss affordance (× button at top-right of drawer). Clicking any scenario card's `Load this scenario →` while the drawer is open replaces the current drawer content with the newly selected scenario's Configure form (drawer does not close and reopen; content transitions in place). Clicking the backdrop scrim dismisses the drawer (returns to State 1).

**Config persistence:** Per-scenario, per-session — re-opening the same scenario's drawer within the session restores entered values. Switching to a different scenario discards the previous scenario's in-progress values. Persistence survives the navigation round-trip: when the user returns to Overview and re-opens the same scenario's drawer, previously entered values are restored. This behavior should be confirmed with engineering at implementation.

### §4a State 1 — full-width Overview (drawer closed)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  OVERVIEW TAB — State 1 (drawer closed, full content width)                     │
│                                                                                 │
│  DESCRIPTION                                                                    │
│  This is a hud implementation of https://www.browserbase.com/                  │
│  (URL linkified — opens new tab; click ≠ card-nav)                             │
│                                                                                 │
│  "Add a description for this environment…" (muted placeholder when no          │
│   description — private owner only; non-owners see "No description" italic)    │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  SCENARIOS  (6)                                                                 │
│  Each scenario represents a specialized skill or task you can perform with     │
│  this environment. Select one to configure and run it.                         │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ 2048-near-win   │  │ todo-complete   │  │ todo-create     │  (…3 more)     │
│  │  [11 runs]      │  │                 │  │  [Loaded →]     │                │
│  │ description     │  │ description     │  │ description     │                │
│  │                 │  │                 │  │                 │                │
│  │ Load this       │  │ Load this       │  │ ← loaded state: │                │
│  │ scenario →      │  │ scenario →      │  │   darker border │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  TOOLS                                                                          │
│  These are the tools the agent will have access to when running scenarios.     │
│                                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │ playwright     │  │ updown_compute │  │ open_computer  │  │ bash_comp.  │  │
│  │ one-line desc  │  │ one-line desc  │  │ one-line desc  │  │ one-line    │  │
│  │ ─────────────  │  │ ─────────────  │  │ ─────────────  │  │ ─────────── │  │
│  │ action  req    │  │ action  req    │  │ action  req    │  │ action  req │  │
│  │ string         │  │ string         │  │ string         │  │ string      │  │
│  │ (field desc)   │  │ (field desc)   │  │ (field desc)   │  │ (field desc)│  │
│  └────────────────┘  └────────────────┘  └────────────────┘  └─────────────┘  │
│  (horizontally scrollable; overflows at narrow widths)                         │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  USE ENVIRONMENT DIRECTLY                                                       │
│  Connect to this environment directly from your code or MCP-compatible tools.  │
│                                                                                 │
│  [MCP]  [Python]  ← tab toggle                                                 │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  {                                                                      │   │
│  │    "mcpServers": {                                                      │   │
│  │      "hud-browser": { ... }                                             │   │
│  │    }                                                                    │   │
│  │  }                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  (dark-theme code block; Python tab shows SDK init snippet)                    │
│                                                                                 │
│  Learn more about MCP integrations →                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Content annotations:**

- **Description block:** full description text as authored, with URLs linkified. "No description" italic muted when empty (non-owner). Owner sees "Add a description for this environment…" muted placeholder with `[✏ Edit]` affordance.
- **Metadata (Source, Visibility, Created) — page header only:** these three fields are intentionally absent from the Overview body. Source and Created live in the descriptor strip (the meta row below the title); Visibility lives as the `🌐 Public` / `🔒 Private` chip adjacent to the env name in the title row. The header is sticky — the fields remain visible while the user scrolls. Do not re-introduce an Info section or equivalent block in the Overview body.
- **Scenarios section:** h2 "Scenarios" with count badge `(N)`. Helper copy: "Each scenario represents a specialized skill or task you can perform with this environment. Select one to configure and run it." Three-column card grid. Each card shows: scenario name, optional run-count chip top-right (e.g., "11 runs"), one-line description, `Load this scenario →` CTA bottom-right. Clicking `Load this scenario →` opens the drawer. **Loaded state:** when a scenario's drawer is currently open, the triggering card shows a darker outline border and `Loaded →` CTA replacing the default CTA. The `Loaded →` state persists until the drawer is dismissed. When the user navigates away via Run click and then returns to Overview, the previously-loaded scenario card reverts to `Load this scenario →` — the `Loaded →` state tracks drawer-open, not lifetime.
- **Variant A (GitHub source, no CTA in header):** CLI template block appears between Description and Scenarios:
  ```
  hud init browserbase   [⎘]
  Read the docs ↗
  ```
- **Tools section:** h2 "Tools". Helper copy: "These are the tools the agent will have access to when running scenarios." Horizontally scrollable row of tool cards. Each card: tool name (e.g., `playwright`), one-line description, then schema rows. Each schema row: field name + required marker + type (e.g., `string`, `string | null`, `array | null`), field description, default value if any. Horizontal scroll affordance is implicit (no scroll button); at narrow widths Tools stacks vertically (see §11).
- **Use Environment Directly section:** h2 "Use Environment Directly". Helper copy: "Connect to this environment directly from your code or MCP-compatible tools." Tab toggle: `[MCP]` / `[Python]`. Active tab shows a dark-theme code block with the relevant snippet (MCP shows `mcpServers` JSON config; Python shows SDK init). "Learn more about MCP integrations →" link at bottom.

**Configure panel mental model (canonical — applies to all variants):** The Configure panel lives inside the drawer, not on the Overview surface. It holds the vars, model, and scenario arguments needed to execute a specific run right now. Settings → Environment Variables is the env's variable schema and org-shared default values. These are two distinct surfaces with different owners and scopes.

**Per-variant Configure panel behavior (inside the drawer — States 2/2b):**

- **Variant A (public, visitor):** Required var fields start empty — visitor enters their own keys. Values are session-scoped: never persisted to the env owner's org settings. "Session-only — not saved to this env." caption inside the drawer.
- **Variant B (public, owner):** Required and optional var fields are pre-filled with org-shared defaults from Settings → Environment Variables. "Inherited from Settings" badge per pre-filled var. "Edit defaults in [Settings →]" link inside the drawer header.
- **Variant C (private, owner):** Same as Variant B.

### §4b Configure panel — State 2 (Scenario loaded, all required vars set)

```
┌───────────────────────────────────────┐
│  DRAWER — Configure panel             │
│  State 2: Scenario loaded             │
│  (all required env vars configured)   │
│                                       │
│  ← back        2048-near-win          │
│  (back arrow)  (scenario name, h3)    │
│                        Model: [▾]     │
│                    Claude Opus 4.5    │
│                                       │
│  1.  Make Automation                  │
│  ─────────────────────────────────    │
│  Create an automation to run this    │
│  scenario with pre-filled arguments. │
│  Go to Automations →                  │
│  (links to /agents?type=automation   │
│   &new=1&env=<slug>&scenario=<name>) │
│                                       │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                       │
│  2.  Run directly on the platform    │
│  ─────────────────────────────────    │
│                                       │
│  * target                             │
│  [  2048                          ]   │
│                                       │
│  (Additional parameter fields per    │
│   the scenario's schema. Required    │
│   fields marked *.  Types enforced   │
│   per schema — string / int / etc.)  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  ▶ Run Evaluation               │  │
│  └─────────────────────────────────┘  │
│  (primary CTA — enabled; all         │
│   required vars are configured)       │
│                                       │
└───────────────────────────────────────┘
```

**State 2 annotations:**

- **Close affordance `×`:** top-right of the drawer. Dismisses the drawer; returns to State 1 (drawer closed). The triggering scenario card reverts from `Loaded →` badge to `Load this scenario →` CTA.
- **Back arrow `←`:** same dismiss behavior as the × close — included as a secondary navigation affordance inside the drawer header.
- **Run Evaluation CTA — submit flow:** on click, the button shows an inline "Submitting…" state (spinner replaces the ▶ icon, button disabled) while the create-job request is in-flight. On success, the URL changes to `/jobs/[id]`. On failure, the button resets to enabled and an error message surfaces inline above the CTA. Error copy and styling are screen-spec deliverables.
- **Model picker `[▾]`:** top-right of the panel. Dropdown of available models. Default: Claude Opus 4.5 (or last-used, persisted to localStorage). Selection determines which model runs the evaluation. The model picker is a lightweight dropdown — it does not open a full model-picker surface.
- **Per-variant panel header (alongside model picker row):**
  - **Variants B/C (owner):** `Edit defaults in Settings →` — small text link in the panel header row (right of the scenario name, below or alongside the model picker). Links to Settings tab anchored to Environment Variables sub-section. Signals to the owner that pre-filled values come from Settings and are editable there.
  - **Variant A (visitor):** `Session-only — not saved` — muted caption in the panel header row. No link; not editable in Settings (visitor has no write access). Confirms that values the visitor entered in State 1 are ephemeral.
- **No warning banner in State 2:** warning banner is absent because all required env vars are configured. State 2b (below) handles the case where vars are still missing.
- **Section 1 — Make Automation:** numbered "1". Heading "Make Automation". Body: "Create an automation to run this scenario with pre-filled arguments." CTA: "Go to Automations →" — navigating link (not a button). Click navigates to `/agents?type=automation&new=1&env=<slug>&scenario=<name>`. This is the Sam path — he builds CI automation from this.
- **Divider between sections:** horizontal rule with reduced visual weight.
- **Section 2 — Run directly on the platform:** numbered "2". Heading "Run directly on the platform". Fields are generated from the scenario's parameter schema — one input per parameter. Required parameters marked with `*`. Parameter names displayed as labels above each input, in monospace. Types are enforced in the input (string shows a text input; int shows a numeric input; null parameters are shown as `expected: null` in read-only text, not an input). Pre-populated defaults where the schema specifies them.
- **Loaded badge on scenario card:** while State 2 is active, the corresponding scenario card on the left shows a "Loaded" badge replacing the "Load this scenario →" CTA (per image 6 production reference).

### §4b-2 Configure panel — State 2b (Scenario loaded, missing required env vars)

This is a distinct named state, not a conditional variant of State 2. Entry condition: the user clicked "Load this scenario →" on a scenario card that requires one or more env vars that are not yet configured in the drawer.

The inline-fix block (Decision 11) lives inside the drawer when a required var is missing or invalid. It is an **editable block** — not a read-only label with a navigation link. Each missing var renders inside the block as an input row: monospace var name + masked value input + reveal-eye icon button. The user fills values directly inside the block; each filled row disappears reactively. When all vars are filled, the block disappears and the CTA enables. No page navigation, no round-trip to State 1.

```
┌───────────────────────────────────────┐
│  DRAWER — Configure panel             │
│  State 2b: Scenario loaded —          │
│  blocked by missing env vars          │
│                                       │
│  ← back        2048-near-win          │
│  (back arrow)  (scenario name, h3)    │
│                        Model: [▾]     │
│                    Claude Opus 4.5    │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  ⚠ Required vars missing        │  │
│  │                                 │  │
│  │  BROWSERBASE_PROJECT_ID         │  │
│  │  [•••••••••••••••••••••]  [👁]  │  │
│  │                                 │  │
│  │  TARGET_URL                     │  │
│  │  [•••••••••••••••••••••]  [👁]  │  │
│  │                                 │  │
│  │  (Variant A only, muted below   │  │
│  │   inputs: "Session-only —       │  │
│  │   not saved to this env")       │  │
│  └─────────────────────────────────┘  │
│  (Inline-fix block: each missing var  │
│   has a monospace name label, masked  │
│   input, and reveal-eye button.       │
│   Filling a row removes it. When all  │
│   rows clear, block disappears and    │
│   CTA enables. No reload.)            │
│                                       │
│  1.  Make Automation                  │
│  ─────────────────────────────────    │
│  Create an automation to run this    │
│  scenario with pre-filled arguments. │
│  Go to Automations →                  │
│                                       │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                       │
│  2.  Run directly on the platform    │
│  ─────────────────────────────────    │
│                                       │
│  * target                             │
│  [  2048                          ]   │
│                                       │
│  (parameter fields render normally;  │
│   user may still fill form fields    │
│   — only the CTA is gated)           │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  ▶ Run Evaluation               │  │
│  └─────────────────────────────────┘  │
│  (CTA is disabled — aria-disabled.   │
│   Caption beneath reads: "Configure  │
│   required env vars to run")         │
│                                       │
└───────────────────────────────────────┘
```

**State 2b annotations:**

- **Entry condition — per variant:**
  - **Variant A (visitor):** triggers when the visitor has not yet entered their session secrets for one or more required vars. The expected first-visit state for a new visitor to any public env that requires API keys. The inline-fix block names each missing var directly at the point of friction.
  - **Variants B/C (owner):** triggers when the owner has not set a default value in Settings → Environment Variables AND has not entered a one-off override in the panel for a required var. Rarer — most likely immediately after env creation before defaults are configured. The inline-fix block names the specific gap.
- **Entry from State 1:** the panel enters State 2b when, upon loading a scenario, one or more of the scenario's required env vars are absent from the Configure panel inputs. This is checked at load time (when the user clicks "Load this scenario →") — not on every keystroke.
- **Inline-fix block (replaces read-only warning banner):** pinned directly below the scenario name / model picker row. Amber/warning register. Heading: "⚠ Required vars missing". For each missing var: a monospace var name label, a masked value input (type=password behavior — value hidden by default), and a reveal-eye icon button. Only the var(s) THIS scenario requires surface here — the full env-var list remains in State 1 and Settings. Input styling matches the existing right-panel env-var inputs from State 1 (same border, bg, height, reveal-eye treatment). The block is not dismissable; it clears reactively as vars are filled.
- **Per-var resolution:** when the user fills a var's input and tabs/blurs, that var's row is removed from the inline-fix block. The block shrinks row by row. When the last row is cleared, the entire block disappears and the CTA enables. No page reload; no explicit "Save" button inside the block.
- **Persistence semantics (annotated here; not rendered in the mockup):**
  - **Variants B/C (owner):** values typed into the inline-fix block ARE persisted to the env's Environment Variables store — same store as Settings → Environment Variables and State 1. Filling here is equivalent to filling in State 1 or in Settings.
  - **Variant A (visitor):** values typed are session-scoped. The inline-fix block renders a muted caption beneath the inputs: "Session-only — not saved to this environment." Same rule as Variant A's State 1 Configure panel.
- **Make Automation section:** visible in State 2b. "Go to Automations →" link remains active — Sam may still want to set up an Automation even before configuring env vars for a direct run. The Automations flow handles env var configuration separately.
- **Run Evaluation CTA:** `aria-disabled="true"`. The CTA renders visually disabled (not hidden). A visible caption below the button reads "Configure required env vars to run." No other copy on the disabled CTA — one phrase, not two.
- **State 2b → State 2 transition:** reactive — as the last missing var is filled in the inline-fix block, the block clears and the CTA enables. No page reload, no explicit user action beyond filling the inputs.
- **State 2b → State 1 transition:** back arrow `←` returns to State 1 exactly as in State 2.
- **Persona load-bearing (Sam):** Sam is the persona most likely to hit State 2b on first visit to a public env. He arrives at `browserbase`, loads a scenario, and discovers `BROWSERBASE_PROJECT_ID` is required. The inline-fix block names the variable and provides the input at the point of friction — eliminating the round-trip back to State 1 to locate and fill the var.

### §4c Exit — Run click navigates to `/jobs/[id]`

State 3 (drawer result panel) no longer exists. Run click is the exit from the drawer.

**Navigation target:** `/jobs/[id]` where `[id]` is the newly-created job's identifier, returned by the create-job API response. The Job detail page is the canonical destination for a run's artifact (trace, reward, instance state).

**Transition:** the Run CTA shows a brief "Submitting…" inline state (see §4b State 2 annotations) while the create-job request is in-flight. On success the URL changes to `/jobs/[id]`. The drawer is not involved in the post-success state — navigation replaces it.

**Failure path:** if the create-job request fails, the drawer stays open, the button resets to enabled, and an error surfaces inline above the CTA. No navigation. Error treatment is a screen-spec deliverable.

**Mobile bottom sheet:** on Run click, same behavior — submit → navigate to `/jobs/[id]`. No result sheet state.

**Return path (deliverable for the Job detail wireframe):** The Job detail page should provide a breadcrumb / back affordance to `/environments/[slug]/overview` and a "Run another scenario on [env-name] →" link returning the user to the Overview tab. These are not specified here; they are noted as inputs to the Job detail wireframe.

### §4d Overview tab — loading state

Skeleton layout: description skeleton (3 bars) + 3 scenario card skeletons in a 3-column grid + Tools section skeleton (4 card outlines) + Use Environment Directly skeleton (toggle placeholder + code block outline). No spinner. Drawer is always closed during loading.

### §4e Overview tab — Variant A (public, visitor, no header CTA)

All content identical to §4a except:
1. CLI block appears between Description and Scenarios: `hud init browserbase [⎘]` + "Read the docs ↗"
2. When the visitor opens the drawer via `Load this scenario →`, the drawer's Configure form is the session secret-entry surface — required var fields start empty; visitor enters their own keys; "Session-only — not saved to this env." caption inside the drawer.
3. No "Edit defaults in Settings →" link in drawer header (visitor Settings is read-only). Drawer header shows "Session-only — not saved" caption instead.
4. Tools section and Use Environment Directly section are fully visible to visitors — these are informational surfaces with no auth gate.

---

## §5 Scenarios tab

### §5a Default state (scenarios exist)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SCENARIOS TAB                                                                   │
│                                                                                  │
│  HEADER ROW                                                                      │
│  Scenarios  (6)                       [+ Create Scenario]  (owner only)          │
│  (section h2 + count)                 (outline button)                           │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  SCENARIO CARDS (gallery — 2 columns at desktop, 1 column at mobile)             │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  SCENARIO CARD — one card (default / collapsed state)                     │  │
│  │                                                                            │  │
│  │  remote-browser:answer                              [</>]  (source toggle) │  │
│  │  (scenario name, monospace or prominent)                                   │  │
│  │                                                                            │  │
│  │  Answer a question using a remote browser session.                         │  │
│  │  (description — 2 lines max, truncated with ellipsis)                      │  │
│  │                                                                            │  │
│  │  ⚠ Missing: BROWSERBASE_PROJECT_ID                                        │  │
│  │  (amber warning — shown if a required env var for this scenario is not     │  │
│  │   configured in the panel. Absent when all vars are set.)                  │  │
│  │                                                                            │  │
│  │  [Show schema]          [Load this scenario →]                             │  │
│  │  (outline button)       (primary CTA — loads scenario into right panel)    │  │
│  │                                                                            │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  SCENARIO CARD — schema expanded (after [Show schema] click)              │  │
│  │                                                                            │  │
│  │  remote-browser:answer                              [</>]                  │  │
│  │  Answer a question using a remote browser session.                         │  │
│  │  ⚠ Missing: BROWSERBASE_PROJECT_ID                                        │  │
│  │                                                                            │  │
│  │  SCHEMA                                                                    │  │
│  │  ─────────────────────────────────────────────────────────────────────    │  │
│  │  * url          string                                                     │  │
│  │  * prompt       string                                                     │  │
│  │    expected     null                                                       │  │
│  │    compare_mode string                                                     │  │
│  │  (* = required parameter)                                                  │  │
│  │                                                                            │  │
│  │  [Hide schema]          [Load this scenario →]                             │  │
│  │                                                                            │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │  SCENARIO CARD — source code expanded (after [</>] click)                 │  │
│  │  (can coexist with schema expanded — both open simultaneously)             │  │
│  │                                                                            │  │
│  │  remote-browser:answer                            [</>] Hide source code   │  │
│  │  (tooltip on [</>]: "Hide source code" — toggles with "Show source code") │  │
│  │                                                                            │  │
│  │  @env.scenario("answer")                                                   │  │
│  │  async def answer(url: str, prompt: str,                                   │  │
│  │                   expected: Optional[Any] = None,                          │  │
│  │                   compare_mode: str = "exact") -> Any:                     │  │
│  │      """Answer a question using a remote browser session."""               │  │
│  │      ...                                                                   │  │
│  │  (scrollable monospace code block — max-height constrained; scrollable)    │  │
│  │                                                                            │  │
│  │  [Show schema]          [Load this scenario →]                             │  │
│  │                                                                            │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  [+ Create Task]   (owner only — outline button at bottom of list)               │
│  (adds a Task to a Taskset using this scenario's args — out of scope here)       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Annotations:**

- **Card layout:** 2 columns at desktop. Cards expand in height as schema/source are disclosed; neighboring columns adjust row height independently (masonry NOT used — cards within a row are equal height per row; expanding one card in a row will not reflow the other).
- **`[</>]` toggle:** top-right of each card. Tooltip: "Show source code" / "Hide source code". Toggle state is per-card (expanding one card's source does not affect others).
- **`[Show schema]` / `[Hide schema]` toggle:** bottom-left of each card. Clicking once expands schema block; clicking again collapses. Label switches accordingly.
- **"Missing: KEY" warning:** shown for each scenario card where the named env var is not yet configured in the panel. Alex and Sam use this to know whether they can run a given scenario without additional setup. Warning is amber, non-blocking (they can still click Load and configure afterward).
- **`[Load this scenario →]` CTA:** present on all cards always. Clicking loads the scenario into the right Configure panel (State 1 → State 2 transition). On the Scenarios tab, there is no right panel visible — clicking "Load this scenario →" from the Scenarios tab navigates the user back to the Overview tab with the panel in State 2. This is the canonical load path regardless of which tab the user is on.
- **Visitor (Variant A):** all cards visible. `[Load this scenario →]` CTA works — load navigates to Overview with panel in State 2. `[+ Create Scenario]` button absent (owner only). `[+ Create Task]` button absent.
- **Owner (Variant B/C):** `[+ Create Scenario]` header button present. `[+ Create Task]` bottom-of-list button present.

### §5b Empty state — no Scenarios

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SCENARIOS TAB — empty state                                                     │
│                                                                                  │
│  No Scenarios yet.                                                               │
│  Add Scenarios using the @env.scenario decorator, then redeploy.                 │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐            │
│  │  hud deploy                                                [⎘]  │            │
│  └──────────────────────────────────────────────────────────────────┘            │
│                                                                                  │
│  Read the docs ↗                                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## §6 Builds tab

### §6a Default state — owner (Variant B/C)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  BUILDS TAB — owner                                                              │
│                                                                                  │
│  To rebuild, run `hud deploy` from your project directory.                       │
│  (muted instruction line above the table — persistent, not empty-state copy)    │
│                                                                                  │
│  TABLE                                                                           │
│  VERSION   │ STATUS        │ SOURCE │ ARTIFACTS     │ DURATION │ WHEN         │ LOGS  │ [⋮] │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  0.1.0     │ ✓ SUCCEEDED   │ CLI    │ 🔧 +7  </> +1 │ 3m 41s   │ 16 days ago  │ View  │  ⋮  │
│  LATEST    │ (green)       │        │ 📄 +6          │          │              │ logs  │     │
│            │               │        │               │          │              │       │     │
│  0.0.9     │ ✗ FAILED      │ GitHub │ 🔧 +5  </> +0 │ 1m 12s   │ 17 days ago  │ View  │  ⋮  │
│            │ (red)         │ SHA:   │ 📄 +4          │          │              │ logs  │     │
│            │               │abc1234 │               │          │              │       │     │
│            │               │ [⎘]    │               │          │              │       │     │
│  ...                                                                             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Column definitions:**

| Column | Content | Notes |
|---|---|---|
| VERSION | Version string (semver or sequential) + `LATEST` badge on the most recent SUCCEEDED build | Version is plain text; LATEST is a small badge, only one row at a time |
| STATUS | `✓ SUCCEEDED` (green) / `✗ FAILED` (red) / `⟳ IN PROGRESS` (neutral) | Status pill — icon + text |
| SOURCE | `CLI` chip or `GitHub` chip | Source of the build trigger |
| ARTIFACTS | Icon + count per artifact type: 🔧 = tools, `</>` = scenarios, 📄 = files. Format: `+N` indicating incremental change | Three compact icon+count groups |
| DURATION | Build duration (`3m 41s`) | Right-aligned |
| WHEN | Relative timestamp (`16 days ago`). Full ISO date on hover tooltip | |
| LOGS | "View logs" text link — opens the build log (inline expand or modal — engineering decision) | Inline, not in kebab |
| `[⋮]` | Kebab: Redeploy (trigger a new build), Delete build record | Destructive (Delete) is last in the kebab list |

**GitHub-sourced build sub-row:** when SOURCE = GitHub, a sub-row below the version shows:
```
SHA: abc1234f  [⎘]   Fix environment variable handling  (commit message, truncated)
```
Sub-row is visually indented / lighter weight. CLI-sourced builds have no sub-row.

### §6b Variant A (public, visitor) — restricted content

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  BUILDS TAB — visitor                                                            │
│                                                                                  │
│  Latest build: ✓ v0.1.0 · 16 days ago                                           │
│  (read-only one-line summary — status icon + version + relative age.             │
│   Signals env health without exposing the full build table.                      │
│   Absent if there are no successful builds.)                                     │
│                                                                                  │
│  Build history is available to the environment owner.                            │
│  To deploy your own copy of this environment:                                    │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐            │
│  │  hud init browserbase                                      [⎘]  │            │
│  └──────────────────────────────────────────────────────────────────┘            │
│                                                                                  │
│  Read the docs ↗                                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

The read-only summary line ("Latest build: ✓ v0.1.0 · 16 days ago") gives visitors a credibility signal — env health at a glance — without exposing the full build table or any operational metadata. The full table remains owner-only. See drift log entry below for the design rationale.

### §6c Empty state — owner, no builds yet

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  BUILDS TAB — empty state (owner)                                                │
│                                                                                  │
│  No Builds yet.                                                                  │
│  To build this Environment, run `hud deploy` from your project directory.        │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐            │
│  │  hud deploy                                                [⎘]  │            │
│  └──────────────────────────────────────────────────────────────────┘            │
│                                                                                  │
│  Read the docs ↗                                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## §7 Instances tab

### §7a Default state — owner (Variant B/C)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  INSTANCES TAB — owner                                                           │
│                                                                                  │
│  FILTER CHIPS + VIEW TOGGLE                                                      │
│  [All (22) ✓]  [Running (0)]  [Terminated (22)]       [☰ Comfortable] [☰ Compact] │
│  (filter chips left; view-density toggle right)                                  │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  DATE GROUP: May 28 (4)                                                          │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  >  [COMPLETED]  May 28, 2026 05:49:37 PM  2m  $0.04                    │   │
│  │     [1 vCPU / 4GB]  [10m]  [Kate Im ○]  41e1826b  [⎘]                   │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  >  [FAILED]     May 28, 2026 03:22:11 PM  1m  $0.02                    │   │
│  │     [1 vCPU / 4GB]  [10m]  [Kate Im ○]  b3f49a12  [⎘]                   │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  (2 more rows in this group)                                                     │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  DATE GROUP: May 26 (12)                                                         │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  (12 rows — FAILED majority)                                                     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Row anatomy (per Instance row):**

| Field | Content | Notes |
|---|---|---|
| Expand chevron `>` | Collapses / expands Instance detail inline | `aria-expanded` |
| Status pill | `COMPLETED` (green) / `FAILED` (red) / `RUNNING` (neutral/animated) | Pill + icon |
| Timestamp | `May 28, 2026 05:49:37 PM` | Full timestamp in row; relative time on hover |
| Duration | `2m` | Elapsed time of the Instance |
| Cost | `$0.04` | Credit cost for the Instance |
| Resource tier | `[1 vCPU / 4GB]` chip + `[10m]` session-duration chip | Two small chips |
| User | Avatar circle + name (`Kate Im`) | Who triggered this Instance |
| Instance ID | Hex short ID (`41e1826b`) + copy button `[⎘]` | Copy button for sharing / referencing |

**Group headers:** collapsible. `▼ May 28 (4)` expanded; `▶ May 26 (12)` collapsed. Toggle per group. Expanding a group shows its rows.

**Filter chip behavior:**
- `All (N)` — all instances regardless of status. Default active.
- `Running (N)` — only running instances. When this chip is active, date grouping is replaced by a flat list sorted by most-recently-started (newest at top). Date grouping is irrelevant when all results are live.
- `Terminated (N)` — only terminated (COMPLETED or FAILED) instances. Date grouping applies.

**Row expand (inline):** clicking the `>` chevron expands the row to show Instance detail: Scenario used, model used, Grader score (if available), link to Trace ("View Trace →"). The expanded row does not navigate away. Collapse by clicking `>` again.

### §7b Variant A (public, visitor) — own instances only

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  INSTANCES TAB — visitor                                                         │
│                                                                                  │
│  Your test runs on this environment                                              │
│  (subtitle — clarifies scope)                                                    │
│                                                                                  │
│  [All (N) ✓]  [Running (N)]  [Terminated (N)]    [☰ Comfortable] [☰ Compact]   │
│                                                                                  │
│  (rows — same anatomy as owner view, but scoped to current user's instances)     │
│                                                                                  │
│  ── empty state when visitor has no runs ──────────────────────────────────────  │
│                                                                                  │
│  No Instances yet.                                                               │
│  Load a Scenario and run it to see your test runs here.                          │
│                                                                                  │
│  [← Go to Overview]                                                              │
│  (outline button — navigates to Overview tab where the Configure panel lives)   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

The subtitle "Your test runs on this environment" is always present for Variant A — it makes clear that the visitor is not seeing the owner's instances.

### §7c Empty states — owner

- **All filter:** "No Instances yet. Load a Scenario and run it, or trigger a run via the SDK." + "Read the docs ↗"
- **Running filter:** "No running Instances."
- **Terminated filter:** "No terminated Instances."

---

## §8 Settings tab

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SETTINGS TAB — owner (full edit access; Variant B and C)                        │
│                                                                                  │
│  ENVIRONMENT INFO                                                                │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Display Name                                                                    │
│  ┌──────────────────────────────────────────────┐                               │
│  │  hud-browser                                 │                               │
│  └──────────────────────────────────────────────┘                               │
│  [Save]                                                                          │
│                                                                                  │
│  Environment ID   24176be5-ceea-4b18-aca4-42851795b672   [⎘]                    │
│  Link via:  hud link --id 24176be5-ceea-4b18-aca4-42851795b672  [⎘]             │
│  (muted copy hint — monospace CLI command, copyable)                             │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  POD CONFIGURATION                                                               │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Resource Tier                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  Default — 1 vCPU · 4 GB · $0.50/hr                                  ▾  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  Request Timeout                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  10 minutes (default)                                                 ▾  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  Session Duration Limit                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  3 hours (default)                                                    ▾  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  [Save Pod Configuration]                                                        │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  FILE TRACKING                                                                   │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  [○ Disabled]   ← toggle. When disabled, section below is collapsed.            │
│  File changes in the container will appear as diffs on the Trace.               │
│                                                                                  │
│  ── When toggle = Enabled: ────────────────────────────────────────────────────  │
│                                                                                  │
│  [● Enabled]                                                                     │
│  File changes in the container will appear as diffs on the Trace.               │
│                                                                                  │
│  Tracked Paths                                                                   │
│  /home                                                           [×]            │
│  /root                                                           [×]            │
│  /workspace                                                      [×]            │
│  /app                                                            [×]            │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  /path/to/track                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  [+ Add path]  (or press Enter in the input)                                    │
│                                                                                  │
│  Exclude Patterns                                                                │
│  node_modules/                                                   [×]            │
│  .venv/                                                          [×]            │
│  __pycache__/                                                    [×]            │
│  *.pyc                                                           [×]            │
│  .cache/                                                         [×]            │
│  .npm/                                                           [×]            │
│  .git/objects/                                                   [×]            │
│  .git/logs/                                                      [×]            │
│  *.so                                                            [×]            │
│  *.o                                                             [×]            │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  pattern                                                                 │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  [+ Add pattern]                                                                 │
│                                                                                  │
│  [Save File Tracking]                                                            │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  ENVIRONMENT VARIABLES                                                           │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Variable schema and org-shared default values.                                  │
│  Per-run values are entered in the Configure panel on Overview.                  │
│  (cross-link: "Configure panel on Overview" → links to Overview tab, anchors    │
│   the Configure panel)                                                           │
│                                                                                  │
│  NAME                    REQUIRED   TYPE     DEFAULT VALUE                       │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  HUD_API_KEY             * required  string  ••••••••••••••••  [👁 Reveal]  [⋮]  │
│  BROWSERBASE_API_KEY     * required  string  ••••••••          [👁 Reveal]  [⋮]  │
│  BROWSERBASE_PROJECT_ID  * required  string  ••••••••          [👁 Reveal]  [⋮]  │
│  DISPLAY_HEIGHT            optional  int     (not set)                      [⋮]  │
│  DISPLAY_WIDTH             optional  int     (not set)                      [⋮]  │
│  (additional vars listed with same schema row format)                            │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  Variable name         │  Required?  │  Type  │  Default value            │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  [+ Add variable]                                                                │
│                                                                                  │
│  Kebab options per var: Reveal value / Copy value / Edit / Delete                │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  BUILD ARGUMENTS                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  One per line: KEY=value                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  No build arguments configured                                           │   │
│  │  (monospace textarea — placeholder text; editable)                       │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  [Save Build Arguments]                                                          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Settings layout annotation:**

The Settings tab renders as a single scrollable column at all widths (not the 3-column layout observed in the production screenshot for image 10 — the single-column layout is more responsive-safe and consistent with the Settings tabs on model-detail and taskset-detail wireframes). The 3-column production layout is preserved as a design decision to revisit at screen-spec phase.

**Environment Variables — schema vs values, and cross-link to Configure panel:**
Settings → Environment Variables is the **schema + org-shared default values** surface. It defines which vars are required vs optional, their type, and what the org-wide default value is (masked, revealable by the owner). This is the owner's management surface: add, delete, reveal, rotate defaults.

The Configure panel on Overview is the **per-run form**. It pre-fills from these Settings defaults ("Inherited from Settings" badge) and allows per-run override. The "Per-run values are entered in the Configure panel on Overview" cross-link makes this relationship explicit without duplicating the form.

**Variant A (public, visitor) Settings → Environment Variables:** The NAME and REQUIRED/TYPE columns are visible (so the visitor knows which vars they will need to supply). The DEFAULT VALUE column renders "—" for all rows — values are private to the owner's org. The section header reads: "Values are visible to the environment owner only." No reveal eye, no add/edit/delete controls. This schema view is the visitor's reference for what to enter in the Configure panel.

**File Tracking — add/remove pattern:**
- Each tracked path and exclude pattern row shows the value as plain text + `[×]` delete button at the right.
- The add-row input at the bottom of each list has a placeholder (`/path/to/track` or `pattern`) and confirms on Enter or `[+ Add path]` / `[+ Add pattern]` button click.
- Toast confirmation on save: "✓ File tracking configuration updated" (per image 11 production reference).

### §8b Settings — Variant A (public, visitor) — read-only

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SETTINGS TAB — visitor (Variant A, read-only)                                   │
│                                                                                  │
│  You are viewing as a visitor. Configuration is read-only.                       │
│  (muted note at top of Settings; always present for Variant A)                  │
│                                                                                  │
│  ENVIRONMENT INFO  (visible, read-only)                                          │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Display Name   browserbase   (plain text — not an input)                       │
│  Environment ID   24176be5-ceea-4b18-aca4-42851795b672   [⎘]                    │
│  (hud link --id hint: present and copyable — useful for CLI reference)           │
│                                                                                  │
│  POD CONFIGURATION  (visible, read-only)                                         │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Resource Tier       Default — 1 vCPU · 4 GB · $0.50/hr   (plain text)          │
│  Request Timeout     10 minutes   (plain text)                                   │
│  Session Duration    3 hours      (plain text)                                   │
│                                                                                  │
│  FILE TRACKING  (hidden — not shown for visitors)                                │
│                                                                                  │
│  ENVIRONMENT VARIABLES  (schema view — keys + required/type; values hidden)     │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Values are visible to the environment owner only.                               │
│  Per-run values are entered in the Configure panel on Overview.                  │
│                                                                                  │
│  NAME                    REQUIRED   TYPE     DEFAULT VALUE                       │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  HUD_API_KEY             * required  string  —                                   │
│  BROWSERBASE_API_KEY     * required  string  —                                   │
│  BROWSERBASE_PROJECT_ID  * required  string  —                                   │
│  DISPLAY_HEIGHT            optional  int     —                                   │
│  DISPLAY_WIDTH             optional  int     —                                   │
│  (additional vars listed; values column always "—" for visitors)                │
│                                                                                  │
│  BUILD ARGUMENTS  (hidden — not shown for visitors)                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## §9 Variant cross-cuts (structural summary)

| Variant | Visibility | Title row | Strip | Header CTA | Tab bar | Drawer (Configure) | Settings |
|---|---|---|---|---|---|---|---|
| **A — Public, visitor** | `🌐 Public` | Env name · `🌐 Public` | Type chip · slug [⎘] · source · created · ☆ N | `[Use as template]` (GitHub source known) OR none (CLI source only) | Overview / Scenarios N / Builds / Instances / Settings | Visitor enters own keys in drawer (session-only, not persisted); "Session-only — not saved" caption inside drawer | Read-only; Env Info + Pod Config visible; File Tracking + Build Args hidden; Env Vars schema (keys + required/optional flag), values "—" (owner only) |
| **B — Public, owner** | `🌐 Public` | Env name · `🌐 Public` | Type chip · slug [⎘] · source · created · ☆ N | (none) | Overview / Scenarios N / Builds N / Instances N / Settings | Pre-filled from Settings defaults in drawer; "Inherited from Settings" badge; `Edit defaults in Settings →` link inside drawer header | Full edit; Env Vars = schema + org-shared default values, masked/reveal |
| **C — Private, owner** | `🔒 Private` | Env name · `🔒 Private` | Type chip · slug [⎘] · source · created | (none) | Overview / Scenarios N / Builds N / Instances N / Settings | Same as B | Same as B |
| **D — Private, not owner** | N/A | Route returns 404 / "Not found" — page does not render | — | — | — | — | — |

**Variant A — content differences across tabs:**

| Tab | Variant A content |
|---|---|
| Overview (State 1) | Full description + CLI template block if source = CLI only + Scenarios grid + Tools + Use Environment Directly. All sections at full content width. Source/Visibility/Created are in the page header (descriptor strip + title-adjacent chip), not the body. |
| Overview (Drawer) | Drawer session secret-entry surface. Var fields start empty; visitor enters own keys. "Session-only — not saved" caption inside drawer. No "Inherited from Settings" badge. States 2/2b function identically to owner variants except session-scoped persistence. Run click navigates to `/jobs/[id]` same as owner variants. |
| Scenarios | Full scenario gallery visible. `[+ Create Scenario]` and `[+ Create Task]` absent. |
| Builds | Read-only one-line build summary ("Latest build: ✓ v0.1.0 · 16 days ago") at top. Then: "Build history is available to the environment owner." + `hud init <slug>` CLI block. No table. |
| Instances | Visitor's own instances only. "Your test runs on this environment" subtitle. Empty state has `[← Go to Overview]` link. |
| Settings | Read-only. Env Info + Pod Config visible. File Tracking + Build Args hidden. Env Vars: schema view — NAME + REQUIRED + TYPE columns visible; DEFAULT VALUE column = "—" for all rows. Cross-link to Configure panel present. |

---

## §10 States coverage

| Surface | Default (data) | Empty (no data) | Loading |
|---|---|---|---|
| Overview — State 1 (drawer closed) | Description + Scenario card grid (3-col) + Tools section + Use Environment Directly | "Add a description…" placeholder (owner) / "No description" muted (visitor); Scenarios section shows empty state per §9 if no scenarios | Skeleton bars + 3 card skeletons + Tools skeleton + code block skeleton |
| Overview — drawer (States 2/2b) | Drawer overlays Overview; Overview content visible behind scrim | N/A | N/A |
| Drawer State 2 | Scenario name + × close + model picker + Make Automation + Run form + enabled CTA → Run click → "Submitting…" inline state → navigate to `/jobs/[id]` on success; inline error above CTA on failure | N/A (State 2 requires a loaded scenario) | N/A |
| Drawer State 2b | Scenario name + × close + model picker + amber inline-fix block (each missing var: monospace name + masked input + reveal-eye; filled rows disappear reactively) + Make Automation + Run form + disabled CTA → enables on all vars filled → same submit-navigate as State 2 | N/A | N/A |
| Scenarios tab | Scenario card gallery (schema + source collapsed by default) | "No Scenarios yet" + `hud deploy` CLI block | 4 card skeletons |
| Builds tab (owner) | Version table with artifact counts + logs links | "No Builds yet" + `hud deploy` CLI block | Skeleton table rows |
| Builds tab (visitor) | Read-only build summary line ("Latest build: ✓ v0.1.0 · 16 days ago") + restricted-content notice + `hud init` CLI block | N/A (restricted notice always renders; summary line absent if no successful builds) | N/A |
| Instances tab (owner) | Date-grouped rows with status + filter chips | "No Instances yet" (All filter) / "No running Instances" / "No terminated Instances" | Skeleton rows with group header shimmer |
| Instances tab (visitor) | Visitor's own instances, date-grouped | "No Instances yet." + `[← Go to Overview]` | Skeleton rows |
| Settings (owner) | Full editable form — all sub-sections | N/A (settings always render) | Field skeletons |
| Settings (visitor) | Read-only view — Env Info + Pod Config | N/A | Field skeletons |

---

## §11 Responsive behavior

### Desktop — full layout

Single-column Overview tab: Description + Scenarios (3-column card grid) + Tools (horizontal scroll row) + Use Environment Directly. No persistent right column — the Configure panel lives exclusively in the right-side drawer, triggered from each scenario card's `Load this scenario →` action. The drawer overlays the Overview content with a scrim behind. Drawer width is a screen-spec deliverable. Full Builds table with all columns. Instances rows full width. Settings single-column scroll. Tab bar all five tabs inline.

### Tablet — adaptations

- **Overview:** same single-column layout as desktop; the drawer pattern is identical. Drawer may go full-width at narrow tablet widths — screen-spec deliverable.
- **Scenarios grid:** 3-column → 2-column at narrow tablet.
- **Tools section:** horizontal scroll row remains; at narrow tablet may begin to clip — scrollable.
- **Builds table:** `ARTIFACTS` column collapses to a single "3 artifacts" count (icon + total count, no breakdown). `DURATION` and `WHEN` stay. `LOGS` link stays inline. SHA sub-row preserved.
- **Instances rows:** Resource tier chips collapse to a single `[1 vCPU/4GB · 10m]` chip. Cost stays. User avatar only (no name text). Instance ID truncated to 8 chars + copy.
- **Header strip:** wraps to two lines if the slug + source + date do not fit on one. Slug + copy button always on first line.
- **Tab bar:** all five tabs inline at tablet; if they overflow, scroll horizontally within the tab bar.

### Mobile — adaptations

- **Header:** visibility pill may wrap below env name.
- **Descriptor strip:** vertical stack. Type chip, slug [⎘], source, created each on separate lines.
- **Tab bar:** scrollable horizontal strip. All five tab labels remain; truncation is avoided — abbreviated only if absolutely necessary.
- **Overview:** single column. Tapping `Load this scenario →` opens the Configure panel as a bottom sheet (slides up from the bottom), covering ~70% of the viewport. Close button at the top of the sheet. Drawer and mobile bottom-sheet are the same pattern at different breakpoints — identical state machine (States 1/2/2b), same dismiss behavior, same config persistence, same Run-click-navigates-to-`/jobs/[id]` exit. The scrim behind the drawer may be lighter at mobile to keep the scenario list dimly visible.
- **Scenarios grid:** 3-column → 1-column at mobile. Cards full width.
- **Tools section:** at mobile, Tools stacks vertically (cards in a single column) rather than horizontal scroll — horizontal scroll is disorienting on small viewports.
- **Scenarios tab:** single column. Card source-code expand is full-width; code block is scrollable horizontally.
- **Builds table:** collapses to card stack. Each card shows: version + LATEST badge, status, source, artifact count (total), duration, when. View logs link at bottom of card. SHA sub-row preserved below version.
- **Instances tab:** single column. Resource tier and user hidden from row; visible in row expand. Date group headers remain.
- **Settings:** single column, same as desktop. Inputs full width.

---

## §12 Keyboard and accessibility

- `<main>` wraps the detail MAIN region.
- `<h1>` = Environment name (not "Environment Detail").
- **Breadcrumb:** `<nav aria-label="Breadcrumb">` wrapping `<ol>`. "← Environments" is an `<a>`; current page name is plain `<li>` text.
- **Descriptor strip:** `<dl>` with `<dt>`/`<dd>` pairs (Type, Slug, Source, Created). Copy button on slug: `<button aria-label="Copy environment slug browserbase">`. Source GitHub link: `<a aria-label="View source on GitHub: kv/trading-rl-env, opens in new tab" rel="noopener">`.
- **Visibility pill:** `<span role="img" aria-label="Public environment">` or `"Private environment"`.
- **Star toggle:** `<button aria-label="Star browserbase" aria-pressed="false/true">`. Updates to `aria-pressed="true"` and label "Unstar browserbase" when starred.
- **Tab bar:** `role="tablist"`, each tab `role="tab"`, `aria-selected`, `aria-controls`. Arrow keys navigate between tabs. Count badges: `aria-label="Scenarios, 6"`.
- **Configure panel inputs:** `<label>` per env-var input. Masked input: `<input type="password">` with an adjacent `<button aria-label="Reveal BROWSERBASE_API_KEY">`. Required marker `*` is `<abbr title="Required">*</abbr>`.
- **`[▶ Run Evaluation]` button:** `aria-disabled="true"` when disabled. Descriptive `aria-describedby` pointing to the missing-var warning banner. Accessible label: "Run Evaluation".
- **"Go to Automations →" link:** `<a aria-label="Create an automation for scenario answer, opens Automations page">`.
- **Scenario card `[</>]` toggle:** `<button aria-label="Show source code for scenario answer" aria-expanded="false/true">`. Updates to "Hide source code for scenario answer" when expanded.
- **Scenario card `[Show schema]` toggle:** `<button aria-label="Show schema for scenario answer" aria-expanded="false/true">`.
- **`[Load this scenario →]` CTA:** `<button aria-label="Load scenario answer, opens configure drawer">`. Triggers drawer open; sets `aria-expanded="true"` on the drawer region.
- **Drawer container:** `role="dialog" aria-modal="true" aria-label="Configure scenario [name]"`. Focus moves to the drawer's close button on open. Escape key dismisses the drawer.
- **Drawer close button:** `<button aria-label="Close configure drawer">` at the top-right of the drawer.
- **Builds table:** `<table>` with `<thead>`. "View logs" link per row: `<a aria-label="View build logs for version 0.1.0">`. Kebab: `<button aria-label="More actions for build 0.1.0">`.
- **Instances expand chevron:** `<button aria-expanded="false/true" aria-controls="instance-row-41e1826b">`. Instance ID copy: `<button aria-label="Copy instance ID 41e1826b">`.
- **Filter chips (Instances):** `role="group" aria-label="Filter instances by status"`. Each chip: `<button role="radio" aria-checked="true/false">` within the group.
- **Settings file tracking toggle:** `<button role="switch" aria-checked="false/true" aria-label="Enable file tracking">`.
- **File tracking × delete buttons:** `<button aria-label="Remove tracked path /home">`.
- **Settings env-var kebab:** `<button aria-label="More actions for variable HUD_API_KEY">`.
- **Empty state CLI commands:** `<pre><code>` with a `<button aria-label="Copy command to clipboard">` adjacent.

---

## §13 Persona notes by surface decision

| Decision | Alex owner (PRIMARY) | Alex visitor (PRIMARY — visitor path) | Sam | Riley (CO-PRIMARY) |
|---|---|---|---|---|
| Drawer Configure panel (Decision 1) | He browses scenarios full-width, then clicks Load on the one he wants — the drawer's focused context matches his intent. Card-level "Missing: KEY" warnings let him pre-screen before committing. | Same — full-width scenario list lets him read all cards before picking one. Drawer opens only when he has chosen a target. | Same as Alex visitor — Sam's "get to first run" job benefits from a focused drawer over an ambient panel that was always visible but only useful post-commitment. | He monitors, not runs. Full-width scenario list is better for his QA scan — he reads all scenario names without a compressed left column. |
| Header CTA `[Use as template]` for visitor with GitHub source (Decision 2) | Correct — sends him to GitHub, which is where he forks anyway | Correct — honest path to the actual fork mechanic | Acceptable — Sam may clone the repo | Not relevant (Riley is the owner, not a visitor) |
| Scenarios — progressive disclosure with two independent toggles (Decision 3) | Load-bearing — he reads schema before loading (knows what args the Run form will ask); reads source to verify Grader logic | Same — schema check is pre-load orientation | Schema check is useful for integration planning | He reads both for delivery QA — schema confirms the parameter contract; source confirms Grader correctness |
| Builds table — "View logs" inline + commit SHA (Decision 4) | Load-bearing — post-`hud deploy` failure path is: Builds tab → FAILED status → View logs. One click matters. | Variant A sees restricted content; not relevant | Not relevant | Load-bearing for Riley — a FAILED build is a delivery risk. View logs immediately is critical. |
| Instances date grouping; flat list on Running filter (Decision 5) | Correct — "find today's failed run" is his primary Instances job; date grouping serves it | Visitor sees only own instances; grouping applies | Sam owner: date grouping helps find the specific session tied to a disputed output | Correct — Riley finds "Friday delivery run" by date group. Running-filter flat list is useful for live monitoring. |
| Configure panel State 2b — inline-fix pattern (§4b-2, Decision 11) | Alex owner: rarely hits this state — he set up his own env vars. Alex visitor: may hit it when trying a public env that requires keys he does not hold; the inline-fix block names each var and accepts the value without a round-trip. | Same as Alex visitor — State 2b is the expected first-visit state for any visitor who has not pre-configured vars. The inline input at the point of friction directly serves his "get to first run" job. | **Load-bearing for Sam.** Sam is the primary State 2b persona: first-time visitor to a public env like `browserbase`, loads a scenario, hits the block. The inline-fix block naming `BROWSERBASE_PROJECT_ID` with an input field eliminates the "back → fix → reload" round-trip that is his primary friction source. | Riley is the owner — he should not hit State 2b on his own env. If he does, it signals a schema misconfiguration he needs to fix in Settings. The inline-fix block naming the missing var is useful signal for his QA pass. |
| "Make Automation" link in panel (Decision 6) | Not relevant — Alex runs via CLI, not Automations | Not relevant | Load-bearing — Sam's CI integration path starts here. "Go to Automations →" is his primary action after confirming the scenario runs correctly. | Relevant for Riley's QA automation pattern |
| Settings — File Tracking as sub-section (Decision 7) | Acceptable — configures once, rarely revisits | Not visible (visitor Settings is read-only) | Not primary | Riley configures File Tracking during env setup; Settings is the right location |
| Settings Variant A — Env Info + Pod Config visible read-only (Decision 8) | Useful — Alex visitor reads pod configuration to assess Instance cost before running | Same | Same | N/A (Riley is owner) |
| Empty states — CLI commands (Decision 9) | Load-bearing — `hud deploy` in an empty Builds tab is the exact next action | Visitor sees `hud init <slug>` — honest fork path | Sam owner: `hud deploy` on empty Builds; Sam visitor: restricted notice | Riley owner: `hud deploy` — correct next action after authoring Scenarios |
| Configure drawer vs Settings env vars (Refinement 3, Jun 2026 — updated for drawer) | Alex owner: sets org defaults once in Settings, never touches them again — the drawer's Configure form pre-fills silently. The "Inherited from Settings" badge confirms the inheritance without requiring him to re-enter values. | Alex visitor: the drawer is the sole secret-entry surface. "Session-only — not saved" caption sets expectation correctly — he understands his key is not stored on HUD infrastructure. | Sam visitor: primary State 2b persona — enters `BROWSERBASE_API_KEY` in the drawer's session-secret form. The clear copy "Your keys, only used for this run" matches his security sensitivity. Sam owner: same pre-fill + badge flow as Alex owner. | Riley owner: Settings → Env Vars is where he controls the public-facing schema (required/optional/type) for his clients. The drawer pre-fills from those defaults; the schema visible in Variant A Settings lets clients preview what they will need to supply. Schema clarity is a commercial signal for Riley's clients. |

---

## §14 Open questions (do not block, flag for follow-up)

1. **Variant A — Settings sub-section default-collapse:** Decision 8 commits to the "Settings" tab label for visitors with a read-only note at the top — that is settled. The open question is narrower: for Variant A, should Environment Variables (schema-only) and Pod Configuration be collapsed by default to reduce visual noise for visitors who cannot edit them, expanding only on explicit click? Recommendation: leave them expanded by default — a visitor assessing this env needs pod specs and var names visible immediately, not behind a click. Flag for product confirmation if collapsed-by-default is preferred for any sub-section.

2. **Scenarios tab — "Load this scenario →" from Scenarios tab navigation target:** When the user clicks "Load this scenario →" while on the Scenarios tab (not on Overview), does it: (a) switch the active tab to Overview and open the panel in State 2, or (b) open the panel inline in the Scenarios tab without tab switching? This wireframe specifies option (a) — Overview tab switch. Confirm with engineering before implementation; tab switch may feel jarring.

3. **Builds table — LATEST badge logic:** The LATEST badge marks the most recent SUCCEEDED build. If the most recent build FAILED, does the badge move to the previous SUCCEEDED build, or does LATEST always mark the most recent build regardless of status? Recommendation: LATEST = most recent SUCCEEDED build (the version the environment is currently running). Flag for product confirmation.

4. **Instances tab — row expand content:** When the user expands an Instance row inline, what fields are shown? This wireframe specifies: Scenario used, model used, Grader score (if available), link to Trace. Confirm the complete field set with platform team — particularly whether the Scenario name and model are available on the Instance record.

5. **`[+ Create Scenario]` CTA in Scenarios tab (owner):** This button is specced as an owner-only control that opens the Scenario authoring flow. The authoring flow itself is out of scope. Confirm: does clicking `[+ Create Scenario]` navigate to an authoring page, or open an inline editor within the Scenarios tab? Flag for the Scenario authoring wireframe.

6. **Multi-column Settings layout:** Production image 10 shows a 3-column Settings layout (Environment Info + Pod Configuration + File Tracking side by side). This wireframe uses a single-column scroll layout for responsiveness. Confirm which layout is canonical for desktop at screen-spec phase.

7. **Riley's Builds monitoring at scale:** Riley may have multiple clients running against the same public env, each potentially triggering their own builds. Should the Builds tab for Variant B (public owner) show all client-triggered builds, or only owner-triggered builds? If all, the table may need an "Initiated by" column. Flag for product clarification.

8. **`hud init` vs `hud init <slug>` exact command:** The brief confirms `hud init` exists as a CLI verb. Does `hud init <slug>` clone a remote env by slug, or is the command `hud init <name>` with a local project name? Confirm exact syntax against `docs.hud.ai/reference/cli` before implementation.

9. **Configure panel — visitor secret persistence:** When a visitor (Variant A) enters keys in the Configure panel and runs a scenario, are those values persisted to the visitor's account for this environment (so they do not have to re-enter them on next visit), or are they always session-only? This affects the copy: "Session-only — not saved" vs "Saved to your account, scoped to this env." Confirm with platform team before implementation. Flag without blocking.

---

## Out of scope

- **Scenario authoring flow** — `[+ Create Scenario]` navigates to an authoring surface not designed here.
- **Task creation from scenario args** — `[+ Create Task]` links to Taskset authoring. Out of scope.
- **Agents/Automation creation flow** — "Go to Automations →" navigates to `/agents`. The Agents new-flow page is a separate wireframe. This wireframe specifies only the link target and query params.
- **Job detail page** — Run click in States 2/2b navigates to `/jobs/[id]`. The Job detail page carries the trace, reward, and instance state for that run. That page is a separate wireframe; this spec only states the navigation target and the expected return affordances (breadcrumb back to `/environments/[slug]/overview` + "Run another scenario on [env-name] →" link).
- **Trace viewer** — out of scope for this wireframe.
- **Environment publish/unpublish flow** — transitioning a Private env to Public (or vice versa) may be in Settings; if so, it is a separate design decision not specced here. The visibility pill on the detail page is read-display only.
- **QA Agent flow** — Riley's per-task QA runs from Scenario cards are a separate surface.
- **Credit exhaustion gating** — the credit-exhausted state for "Run Evaluation" (visitor or owner) follows the AppShell shell pattern; billing flow is out of scope.
- **Variant D (private, not owner)** — route returns 404 / "Not found," handled outside this wireframe. Not designed here.

---

## Drift log

- **2026-06-09 — State 3 collapsed to a navigation transition: Run click → /jobs/[id].** Per operator: the job page is where the run's artifact lives; landing the user there matches their next action. The drawer no longer shows a post-run result panel.

- **Configure panel → right-side drawer (Jun 2026 overturn):** Initially specified as a persistent right column matching the production layout. Overturned 2026-06-09 per operator — drawer chosen to prioritize browse-surface clarity and desktop/mobile parity. The browse surface (scenario list, Tools, Use Environment Directly) now occupies full Overview content width. The drawer surfaces only when the user has actively selected a scenario. Mobile bottom-sheet is unchanged; desktop now matches that pattern.

- **"Use as template" vs "Fork" in header:** The brief explicitly bans a dashboard Fork button. This wireframe uses "Use as template" for Variant A + GitHub source, and falls back to a CLI block in the Overview body for CLI-only source. This is a drift from what users might expect (a "Fork" button), justified by honesty: HUD has no dashboard fork flow for Environments.

- **Builds tab — "View logs" inline (vs kebab):** Production image 8 shows a kebab at the end of each Builds row with no inline "View logs" link. This wireframe moves "View logs" to an inline column because Alex's and Riley's post-failure path is: see FAILED → read logs. One fewer click in the failure path is load-bearing. Justified divergence from production.

- **Settings — single-column layout (vs production 3-column):** Production image 10 shows a 3-column Settings layout. This wireframe specifies single-column scroll for responsive safety. The 3-column production layout is noted as a screen-spec phase decision; the wireframe does not lock it.

- **Instances — density toggle (Comfortable / Compact) replacing grid/list/density icons:** Production image 9 shows three icons for the view toggle. This wireframe collapses to two meaningful options (Comfortable / Compact row density) and drops the grid option. Justified: Instance rows have too many fields to compress into a card layout without losing readability. Comfortable/Compact is the honest toggle.

- **Star in descriptor strip (not title row):** The index wireframe shows stars on cards in the card header. This detail wireframe places the star at the rightmost position in the descriptor strip (not in the title row alongside the visibility pill) to avoid crowding the title row — which already carries env name and visibility pill. This is a layout decision that may be revisited at screen-spec phase.

- **No `hud env new` anywhere in this wireframe:** Per brief — this command does not exist. Not used in any empty state or CLI reference.

- **No dashboard Fork button anywhere in this wireframe:** Per brief and product reality — HUD has no dashboard fork flow for Environments. "Use as template" in the header and `hud init <slug>` in the Overview body are the honest alternatives.

- **No publish-to-Explore button in Settings:** Per brief — no such surface documented in product docs. Settings does not include a publish-to-Explore control.

- **Title-row status dots removed (Jun 2026):** Inherited from index wireframe §4.6 open question and Decision 10 in an earlier draft of this file. Visibility dot was redundant with the explicit `🌐 Public` / `🔒 Private` pill in the same row; health/activity dot's semantics were never confirmed, and "Spare" personality argues against rendering unfunctional ink. Operational status, if needed, surfaces on the Builds / Instances tabs. The index wireframe still uses dots on cards — out of scope for this file; unchanged.

- **Overview body INFO section — removed (2026-06-09 operator decision):** Source / Visibility / Created were first removed (descriptor strip duplication), then reinstated after production review. Subsequently removed again on 2026-06-09 per operator decision: the page header is sticky (fields always visible), and the body block pushed Scenarios below the fold without adding scan value. Source and Created are canonical in the descriptor strip; Visibility is canonical in the title-row chip. The body Info block is permanently removed — do not re-introduce it.

- **Tools section and Use Environment Directly section added to Overview (Jun 2026 content sync):** Production overview tab contains a Tools section (horizontal scroll row of tool cards with schema rows) and a Use Environment Directly section (MCP/Python tab toggle + dark code block + learn-more link). Both were absent from the wireframe's Overview tab spec. Confirmed against production screenshot 2026-06-09 and added to §4a.

- **Configure panel ↔ Settings env vars relationship clarified (Jun 2026):** Prior version noted they share data but did not surface the schema-vs-values mental model. Now: Settings → Environment Variables = schema + org-shared default values (owner-managed; defines required/optional/type per var). Configure panel = per-run form (vars inherited from Settings defaults or supplied fresh by the visitor). Variant A visitor surface canonicalized: Configure panel is the secret-entry surface; Settings is a read-only schema view (keys + required/optional flags; values show "—" since they are private to the owner's org). Variants B/C: Configure panel pre-fills from Settings defaults with an "Inherited from Settings" badge and an `Edit defaults in Settings →` link in the panel header.

- **Builds tab (visitor) — read-only summary line added:** Domain review (Jun 2026) observed that hiding the entire Builds tab from visitors removed a credibility signal useful to Alex and Sam when assessing whether an environment is actively maintained. Resolution: add a single read-only "Latest build: ✓ v0.1.0 · 16 days ago" summary (status + version + age) above the restricted-content notice. The full build table remains owner-only. This is a deliberate drift from the original "owner-only notice, no table" spec — justified by persona value (env health at a glance) without exposing operational metadata.

---

*Derived from: [`docs/product/personas.md`](../../product/personas.md), [`docs/product/platform.md`](../../product/platform.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md), [`docs/product/alex-user-stories.md`](../../product/alex-user-stories.md). Visual reference: operator-supplied production screenshots of hud.ai env detail page — Jun 2026. Structural anchor: [`docs/design/screens/model-detail.wireframe.md`](./model-detail.wireframe.md). Sister: [`docs/design/screens/environments.wireframe.md`](./environments.wireframe.md). AppShell chrome: [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md).*
