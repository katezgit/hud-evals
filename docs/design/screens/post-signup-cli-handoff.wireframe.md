# Post-Signup CLI Handoff — Screen Wireframe

Route: `/` (dashboard Home, first session only)

Cross-links:
- Flow: [`docs/design/flows/onboarding.md`](../flows/onboarding.md)
- Sibling wireframe: [`docs/design/screens/onboarding.wireframe.md`](./onboarding.wireframe.md)

**Purpose:** The dashboard Home surface a new user sees immediately after org + invite onboarding steps complete; hands the user off to the local CLI which then deploys an environment and auto-redirects the browser to the environment detail page. Replaced permanently by the standard Home (Jobs / Traces / Environments) once any Environment, Job, or Trace exists on the org — no user action required.

**Replaces:** The previous `post-signup-quickstart.wireframe.md` (W&B-style quickstart with use-case tab strip, three numbered steps, inline Generate-API-key callout). See "What this replaces" section below.

---

## Layout shell

Standard dashboard sidebar and global header. The CLI-handoff panel occupies the main content area. This is the dashboard, not a wizard overlay — wizard chrome is gone, the sidebar and global header are fully visible.

```
┌──────────────────────────────────────────────────────────────────────┐
│  GLOBAL HEADER                                                       │
├─────────────┬────────────────────────────────────────────────────────┤
│  SIDEBAR    │  MAIN CONTENT — CLI-handoff panel (first session only) │
│             │                                                         │
│  Home       │  ┌─────────────────────────────────────────────────┐  │
│  Tasksets   │  │  CLI-HANDOFF PANEL  bg-surface  border  rounded  │  │
│  Environments│ │  (replaces normal Home content for this session) │  │
│  Models     │  └─────────────────────────────────────────────────┘  │
│  Library    │                                                         │
│  Agents     │  ── ESCAPE HATCHES (small muted text links) ─────────  │
│             │  Or use an Environment template in the browser →  ·    │
│             │  Read the docs →  ·  Skip — go to dashboard →          │
└─────────────┴────────────────────────────────────────────────────────┘
```

The panel reads at a comfortable content width — not full-bleed, not a modal. Same reading width as the standard Home content area.

---

## CLI-handoff panel — detailed layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLI-HANDOFF PANEL                                                   │
│                                                                      │
│  Run HUD locally                                                     │
│  text-display  (verb-led — NOT "Welcome to HUD" or "Get started")   │
│                                                                      │
│  Four commands. When `hud deploy` succeeds, this page will           │
│  redirect to your new environment.                                   │
│  text-body  muted-fg                                                 │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  uv tool install hud-python --python 3.12               │ [⎘]  │
│  └─────────────────────────────────────────────────────────┘      │
│  monospace code block  bg-code  border  rounded                     │
│  copy button: inline right-aligned                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  hud login                                              │ [⎘]  │
│  └─────────────────────────────────────────────────────────┘      │
│  Opens your browser, signs you in, stores the API key in            │
│  `~/.hud/.env`. No key handling on this surface.                    │
│  text-meta  muted-fg                                                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  hud init                                               │ [⎘]  │
│  └─────────────────────────────────────────────────────────┘      │
│  Interactive preset picker (`blank` / `browser` /                   │
│  `deep-research`). Scaffolds a working codebase in your dir.        │
│  text-meta  muted-fg                                                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  hud deploy                                             │ [⎘]  │
│  └─────────────────────────────────────────────────────────┘      │
│  Run from inside the scaffolded directory.                          │
│  text-meta  muted-fg                                                │
│                                                                      │
│  Note: the canonical CLI quickstart includes `hud dev` + `hud eval` │
│  for local iteration between `hud init` and `hud deploy`. This      │
│  first-touch surface compresses to deploy-first; iteration lives in │
│  the docs and in the post-redirect environment detail page.         │
│                                                                      │
│  ── AUTO-REDIRECT PROMISE ───────────────────────────────────────   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  When `hud deploy` completes, this page will redirect to    │   │
│  │  your new environment automatically.                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  muted callout  bg-muted  border  rounded                           │
│  Annotation (design): the redirect is triggered by `hud deploy`    │
│  printing the env detail URL to stdout AND opening it in the        │
│  user's default browser — or by a signal the dashboard tab          │
│  listens for (e.g., polling `/api/orgs/{id}/environments` until     │
│  count > 0 or a WebSocket event fires). Engineering choice on       │
│  mechanism; the user-visible contract is stated above.              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Escape hatches

Below the panel, three muted text links — single row, comma-separated. Not cards. Not primary CTAs.

```
Or fork an Environment template on GitHub →  ·  Read the docs →  ·  Skip — go to dashboard →
text-meta  muted-fg  separator: ·  (interpunct)
```

- **"Or fork an Environment template on GitHub →"** — links to the existing template gallery surface (`/templates` or equivalent), which lists ~8 forkable GitHub repos: `Blank Environment`, `Browser`, `Remote Browser`, `Deep Research`, `Rubrics`, `Coding`, `Data Science`, `Verilog Coding`. The fork mechanic is GitHub-native; the dashboard surface is the index, not a hosted scaffolder. Escape for Sam (prefers a known-good shape over `hud init` blank) and for Riley (starts from `Rubrics` / `Verilog Coding` / `Browser` as the base for vendor tasksets). Note: the **3 CLI presets** (`blank` / `browser` / `deep-research`) are a strict subset — the additional 5 templates are GitHub-only, no `hud init -p <name>` equivalent.
- **"Read the docs →"** — links `docs.hud.ai` in a new tab.
- **"Skip — go to dashboard →"** — drops the user into the empty dashboard. The empty-state Home for Alex (no Jobs / no Traces / no Environments) shows a `hud eval` invocation example and a link to docs.hud.ai — not a setup wizard. *(— alex-user-stories.md:33: "Empty state (no Jobs yet) shows a `hud eval` invocation example and a link to docs.hud.ai — not a setup wizard.")*

---

## What this replaces

This panel replaces the previous `post-signup-quickstart.wireframe.md` (W&B-style quickstart) in full. Dropped elements and their replacements:

| Dropped | Replaced by |
|---|---|
| Use-case tab strip (Eval a prompted agent / Author an Environment / Train an RL agent) | CLI's interactive preset picker (`hud init` prompts the user to choose `blank` / `browser` / `deep-research`). Personalization happens in the terminal, not the browser. |
| Inline Generate-API-key callout (Generate button → key returned on click) | `hud login` browser-auth handoff — CLI opens browser, user signs in, key is written to `~/.hud/.env`. No key display, no Show/Copy on this surface. |
| Three numbered step structure with per-step explanatory headers | Four stacked monospace command blocks. No numbered headers. |
| Completion affordance "Your first Trace will appear in Jobs →" | Auto-redirect promise: `hud deploy` success redirects the browser to the environment detail page at `/environments/<id>`. |
| "Run in browser sandbox" conditional alternative | Removed. CLI-only path; no hosted sandbox affordance on this surface. |
| Dismissible Setup panel from `onboarding.wireframe.md` Step 3 (Install uv / Install HUD Tool / Get and Set API Keys / Create Your First Environment / Explore Documentation accordion) | Folded into this panel. The four CLI commands cover everything the accordion deferred. Not preserved as a secondary surface. |

---

## Persona path traces

**Alex (primary).** Arrives at this surface. Copies the four commands (four clicks), switches to his terminal, runs them in sequence. `hud login` flips back to the browser briefly to sign in, then back to the terminal. At `hud init` he picks a preset — likely `blank`, since he writes his own environments. `hud deploy` succeeds; the browser auto-redirects to the environment detail page at `/environments/<id>`. Total time on the dashboard before redirect: under 30 seconds. He does not interact with a wizard, navigate to a second screen, or touch a form field beyond the copy buttons. He never sees or handles the API key. *(— alex-user-stories.md Phase 0: "when he opens hud.ai he is already 40 minutes into the problem"; alex-workflow.md Phase 2: "`hud init` + `hud deploy` env authoring")*

**Sam (secondary).** May follow the CLI path as written. Alternatively, clicks "Or use an Environment template in the browser →" to reach the existing dashboard-form template picker — his preferred surface when a form is faster than a terminal session. Both paths are available with no forced choice. *(— personas.md: "Sam has no incentive to express composition in Python when a form does it faster")*

**Riley (tertiary).** Perfect fit. `hud init` IS his Phase 2 entry — Environment authoring at scale. Picks a starter preset (likely `browser` or `deep-research`), customizes the scaffolded codebase, deploys. The auto-redirect to `/environments/<id>` puts him directly on the Environment detail page he uses to QA tasksets before delivery to a buying lab. *(— personas.md: "`hud dev` / `hud deploy` for environment authoring at scale without standing up custom infra")*

---

## What the user lands on after `hud deploy`

The canonical Environment detail page at `/environments/<id>` — Overview tab default, with Scenarios + Tools + Builds tabs visible and the Configure panel. This is the standard product surface; it is not an onboarding-specific screen. The user did not click through onboarding to reach it — the CLI delivered them. Cross-reference: Environment detail wireframe (or implicit in the operator's screenshot reference). Do not re-author it here.

---

## Instrumentation

Five funnel events from `docs/design/guidelines/onboarding.md` Rule 7 mapped to surfaces:

| Event | Surface | Notes |
|---|---|---|
| `signup` | Pre-this-surface — OAuth callback / magic-link | Fires upstream in the auth flow, not from this panel. |
| `api_key_issued` | Server-side on org create | The key is provisioned when the org is created. Never shown on this surface; the CLI fetches it via `hud login`. Event fires before the user sees this page. |
| `first_successful_call` | Server-side — fires when `hud deploy` succeeds on the org | This is also the auto-redirect trigger. The event fires on the CLI, not from a browser interaction. |
| `first_call_from_deployed_code` | Post-redirect, downstream surface | Fires when the user runs `hud eval` against the deployed environment (after auto-redirect to `/environments/<id>`). Not from this panel. |
| `cli_command_copied` | This panel — copy button on any of the four command blocks | Payload: `{ command: "uv_install" \| "hud_login" \| "hud_init" \| "hud_deploy", org_id, user_id }`. Feeds drop-off analysis — which command was copied last before the user left the page without `hud deploy` firing. New event, beyond the guideline five. |

`cli_command_copied` is the mechanism for diagnosing where users abandon the CLI path before `first_successful_call` fires. Drop-off between `hud_init` copy and `hud_deploy` copy indicates preset friction; drop-off after `hud_login` copy indicates browser-auth trouble.

---

## Out of scope

Explicitly not on this surface:

- **In-browser code execution / hosted sandbox.** The user's action surface is the terminal.
- **Use-case selector tabs in the browser.** The CLI preset picker (`hud init`) is the personalization mechanism — it produces real files on disk, not a UI configuration.
- **API key display, Show/Copy controls, "Generate API key" button.** The key is provisioned on org creation and fetched by `hud login` directly into `~/.hud/.env`. The user never sees it on this surface.
- **Welcome video block.** Not included. If it exists, it lives in docs.
- **Persona-routing modal or "which persona are you?" survey.** The `hud init` preset prompt handles use-case self-selection in the terminal.
- **Setup-progress accordion (`00d`-style, `SET UP` collapsible).** Folded into this panel. Not preserved as a secondary surface.
- **Forced template picker before CLI.** The template picker is an escape hatch, not the default path.
- **Credit-card / billing entry.** No billing step in onboarding.
- **Compliance chrome / training-curve surfaces.** Not on Alex's first-session surface.
- **Celebration copy.** No "You're all set!", no "Welcome to HUD!" heading. The heading is action-led: "Run HUD locally." *(— personality.md: "Never: encouragement copy, progress celebrations, onboarding coach language")*

---

Derived from: [`docs/design/flows/onboarding.md`](../flows/onboarding.md), [`docs/design/guidelines/onboarding.md`](../guidelines/onboarding.md), [`docs/design/screens/onboarding.wireframe.md`](./onboarding.wireframe.md), [`docs/product/personas.md`](../../product/personas.md), [`docs/product/alex-workflow.md`](../../product/alex-workflow.md), [`docs/product/alex-user-stories.md`](../../product/alex-user-stories.md), [`docs/product/personality.md`](../../product/personality.md), [`docs/product/platform.md`](../../product/platform.md).
