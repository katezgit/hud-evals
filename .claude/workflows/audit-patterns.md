# Design audit patterns

Reusable framings distilled from the 2026-05/06 audit corpus. Each pattern names *when* to use it, *what to ask for*, and *where the output lives* before consolidation.

## Index

- [token-spec-derivation](#token-spec-derivation) — translate an approved mockup into an implementable token spec
- [text-token-tier-audit](#text-token-tier-audit) — verify semantic separation and WCAG contrast across a text-token stack
- [palette-harmony-audit](#palette-harmony-audit) — assess hue/saturation/lightness coherence across a status+accent palette
- [multi-perspective-color-review](#multi-perspective-color-review) — same question, three simultaneous auditor lenses, then reconcile
- [system-polish-round](#system-polish-round) — cross-component consistency sweep after a token or theme change
- [wcag-focus-calibration](#wcag-focus-calibration) — verify focus-ring tokens against WCAG 2.4.7/2.4.13 and product identity
- [component-token-conformance](#component-token-conformance) — audit all components against approved token specs
- [sizing-research-benchmark](#sizing-research-benchmark) — benchmark a sizing decision against peer design systems
- [domain-review-against-personas](#domain-review-against-personas) — gate a flow or screen on vocabulary, persona scope, and phase order
- [self-review-iter](#self-review-iter) — designer self-review of a flow or wireframe before human approval
- [checkpoint-lineage-questions](#checkpoint-lineage-questions) — no reusable pattern

---

## token-spec-derivation

**Use when:** A mockup variant has been operator-approved and its token values need extracting into a spec the design-system-architect can implement directly.

**Inputs:** `{mockup_path}`, `{variant_id}` (e.g. `#v1`), `{theme_scope}` (`light`/`dark`/`dual`), `{token_files}` (target CSS files)

**Filename:** `foundations/v{N}-{name}-spec.md`

**Sections:**
```
# {Name} — token spec (derived from mockup {variant_id})
Spec date / Source / Do-not-code note
## Decisions  (numbered, one per key choice)
## Color tokens
  ### Primitive palette additions to `:root`
  ### Semantic token table (`@theme`) — light hex | dark hex | notes
## Typography tokens
## Spec-doc updates  (numbered change list per doc)
## Contrast audit for new tokens  (pair | approx ratio | requirement)
```

**Prompt template:**
> Read `{mockup_path}` variant `{variant_id}`. Produce a token spec at `foundations/v{N}-{name}-spec.md`.
> Theme scope: `{theme_scope}`. Target files: `{token_files}`.
> For every new or changed token: record primitive hex in `:root`, semantic token in `@theme` with both theme values, role, and usage restrictions.
> Close with a contrast-audit table for every new foreground/background pair (AA 4.5:1 text, 3:1 non-text).
> Spec only — no code.

**Disposal:** intermediate; delete after values land in `packages/ui/src/styles/` and spec-doc updates land in `docs/design/foundations/`.

---

## text-token-tier-audit

**Use when:** Two semantic text tokens have converged to the same hex, or a WCAG check reveals a tier failing its declared level.

**Inputs:** `{theme}`, `{tokens}` (names under scrutiny), `{surfaces}` (background hex values to test against), `{tier_intent}` (the intended stack, e.g. primary/secondary/tertiary/disabled)

**Filename:** `foundations/text-tokens-{theme}-audit.md`

**Sections:**
```
# Text Token Audit — {Theme} Mode
## Problem
## Decision  (options A/B/C with rationale; state winner)
## Proposed Token Values
  | Token | Current | Proposed | Notes |
## Contrast Verification
  | Token | Hex | Contrast | WCAG 1.4.3 verdict |
## Raw Palette Additions
## Tier Logic Summary  (one-line per tier: role → target ratio)
## Per-Component Migration  (token name → components using it → action needed)
```

**Prompt template:**
> Audit `{tokens}` (`{theme}` theme) against surfaces `{surfaces}`. Intended tier stack: `{tier_intent}`.
> Compute contrast ratio per surface, state WCAG 1.4.3 verdict, flag shared hex values.
> Propose distinct hex values with ≥1.5 luminance stops between adjacent tiers.
> Include a per-component migration table — flag files using these token names; note whether a class change is required.

**Disposal:** intermediate; delete after values land in `color.css` and decisions are logged in `docs/design/foundations/color.md`.

---

## palette-harmony-audit

**Use when:** A new status+accent palette needs a sanity check on hue distribution, saturation coherence, and adjacency risks before token commit.

**Inputs:** `{palette_tokens}` (names + hex, both themes), `{peer_benchmarks}` (e.g., Carbon, Tableau, Linear)

**Filename:** `foundations/palette-harmony-audit.md` (single file; append dated entry to decisions log on re-run)

**Sections:**
```
# Palette harmony audit — {YYYY-MM-DD}
## Verdict  (one paragraph: coherent or not, key tension)
## Color space analysis
  Dark and light theme tables: Role | Hex | H° | S% | L% | Approx L* | Temperature
  Cross-theme hue fidelity table: Role | Dark H | Light H | Delta
## Tension points  T{N} — {title} (severity: high/medium/low)
## Stack test assessment  (imagined badge row on primary panel)
## Adjacent test assessment  (accent button beside status badge)
## Chart series coexistence
## Reference benchmarks
## Recommended adjustments  R{N} with candidate hex and cost/risk
## What stays unchanged and why
```

**Prompt template:**
> Audit palette `{palette_tokens}` (`{theme}` theme). Analyze in HSL and approximate OKLCH L*.
> Tabulate H/S/L per role. Compute hue gaps; flag adjacency risks (<40° apart in same scan zone). Check saturation uniformity.
> Run a stack test: `[status-a][status-b][status-c]` badge row on primary dark+light panel.
> Benchmark against `{peer_benchmarks}`. Recommend targeted nudges only — candidate hex + one-line cost per recommendation.

**Disposal:** intermediate; delete after recommendations are applied to tokens and rationale is logged in `docs/design/foundations/color.md § Decisions Log`.

---

## multi-perspective-color-review

**Use when:** A color decision is contested enough to need three simultaneous independent auditor lenses before a verdict.

**Inputs:** `{color_question}`, `{token_set}` (names + hex), `{theme}`, `{perspectives}` (three named lenses, e.g. A: WCAG/a11y, B: brand-identity, C: data-viz legibility)

**Filename:** `foundations/color-audit-{YYYY-MM-DD}-round{N}-{A|B|C}.md`
Three parallel files per round — e.g. `round1-A.md`, `round1-B.md`, `round1-C.md`. (The corpus had one round of three parallel runs.)

**Sections (each file):**
```
# Color Audit — {YYYY-MM-DD} Round {N} — Perspective {A|B|C}: {lens name}
## Lens framing
## Verdict
## Per-token findings  | Token | Current | Finding | Proposed |
## Tension points specific to this lens
## Recommendations
```

**Prompt template (dispatch three agents in parallel):**
> **Perspective {A}: {lens name}.** Review `{token_set}` on the question: `{color_question}` (`{theme}` theme).
> Evaluate strictly through the `{lens name}` lens — do not import concerns from other lenses.
> Structure: Lens framing → Verdict → Per-token findings → Tension points → Recommendations.
> Output: `foundations/color-audit-{YYYY-MM-DD}-round{N}-{A}.md`.

After all three return, produce `color-audit-{YYYY-MM-DD}-round{N}-consolidated.md` with a reconciliation table and final verdict per token.

**Disposal:** intermediate; delete all four files (A, B, C, consolidated) after findings land in the token spec or `color.md § Decisions Log`.

---

## system-polish-round

**Use when:** After a major token or theme change, a holistic sweep is needed to catch cross-component inconsistencies that per-component audits miss.

**Inputs:** `{change_scope}` (what changed), `{component_list}` or `all`, `{theme}`

**Filename:** `foundations/audit-{YYYY-MM-DD}-system-polish.md`

**Sections:**
```
# System polish audit — {YYYY-MM-DD}
**Trigger:** {change_scope}
## Summary  | Category | Issues found | Severity |
## Per-category findings
  Spacing/rhythm · Shadow scale · Border-radius · Type-scale · Color-role consistency
## Cross-component patterns  (systemic issues spanning ≥3 components)
## Recommendations (prioritized P1/P2/P3)
## Out of scope
```

**Prompt template:**
> System-polish sweep after `{change_scope}`. Scope: `{component_list}`, `{theme}` theme.
> Audit token *usage* across components (not token values). Categories: spacing rhythm, shadow scale, border-radius, type-scale alignment, color-role consistency.
> Severity: P1 = visible at rest, P2 = visible on interaction, P3 = theoretical.
> Do not re-audit token values — assume token correctness.

**Disposal:** intermediate; delete after P1 fixes land in `packages/ui` and findings are noted in relevant component `spec.md` files.

---

## wcag-focus-calibration

**Use when:** A new focus-ring token set is introduced, or the operator flags the ring as "too loud" or "invisible."

**Inputs:** `{ring_token}` (hex per theme), `{glow_token}`, `{shadow_token}` (spread/offset), `{components}`, `{operator_concern}`

**Filename:** `foundations/focus-ring-audit.md`

**Sections:**
```
# Focus Ring Audit
Date / Branch / Scope: WCAG 2.4.13 / 2.4.7 + product calibration
## Verified Token State (as-built)  | Token | Light | Dark |
## Component Focus Path Audit
  ### On global rule  /  ### Per-component overrides
## Decision 1 — Glow loudness  **Verdict:** (option) + rationale + proposed CSS
## Decision 2 — Ring color desaturation  **Verdict:** ...
## Decision 3 — Per-theme tuning  **Verdict:** ...
## Decision 4 — Width  **Confirmed: {N}px**
## Summary of Proposed Changes  | Token | Current | Proposed | Rationale |
## Secondary Finding — {any inconsistency discovered}
```

**Prompt template:**
> Inspect focus-ring tokens: ring `{ring_token}`, glow `{glow_token}`, shadow `{shadow_token}`.
> For each component in `{components}`: retrieve computed focus styles in both themes. Flag any component not receiving the global `*:focus-visible` rule.
> Evaluate: (1) glow spread/alpha calibrated for dark canvas contrast? (2) ring clears WCAG 2.4.13 3:1 on both backgrounds? (3) width ≥2px?
> Address `{operator_concern}` with the minimum token change. State the lever (spread vs alpha vs color) and why.

**Disposal:** intermediate; delete after token changes land in `packages/ui/src/styles/elevation.css` and `color.css`.

---

## component-token-conformance

**Use when:** After a token system rebuild, all UI components need checking for correct token usage against approved spec files.

**Inputs:** `{package_path}`, `{spec_sources}` (e.g., `color.md`, `interaction-states.md`, per-component `spec.md`), `{exclude}` (stories, tests)

**Filename:** `reviews/color-audit-{YYYY-MM-DD}.md`

**Sections:**
```
# Color Audit — {YYYY-MM-DD}
## Guideline sources used
## Summary
  {N} audited / {F} FAIL / {P} PASS / {X} PARTIAL
  Top systemic issues: (numbered, max 3)
## Per-component findings
  ### {component}.tsx — PASS | FAIL | PARTIAL
  - Tokens used: (list)
  - Deviations: [line N] {rule} → {finding}
  - Notes:
## Out-of-scope observations (max 5)
## Open questions for operator  (blocking only, max 5)
```

**Prompt template:**
> Audit all `.tsx` under `{package_path}` (exclude `{exclude}`) against `{spec_sources}`.
> For each component: list every color/shadow/ring token. Flag violations — state line number, spec rule, FAIL or PARTIAL.
> Rate: PASS / FAIL / PARTIAL (PARTIAL = correct implementation, stale spec).
> Surface the top 3 systemic issues in Summary. End with ≤5 blocking operator questions.

**Disposal:** intermediate; delete after all FAIL items are fixed and confirmed by PR review.

---

## sizing-research-benchmark

**Use when:** A sizing decision needs grounding in peer-system data before committing to tokens.

**Inputs:** `{component}`, `{current_presets}` (names + values), `{peer_systems}`, `{product_context}` (density + viewport profile)

**Filename:** `reviews/{component-kebab}-sizing-research-{YYYY-MM-DD}.md`

**Sections:**
```
# {Component} Sizing Research — {YYYY-MM-DD}
## Frame  ({product_context} + why benchmarking is needed)
## Our Current Presets (before {date})
## Peer Systems Table  | System | Component | Preset names | Values | Notes |
## Findings  (one subsection per dimension)
## Decision ({YYYY-MM-DD})
  **Status: operator-confirmed.**
  | Preset | Before | After |
## Sources  (direct URLs, verified)
```

**Prompt template:**
> Research sizing presets for `{component}` across `{peer_systems}`.
> For each system: documented preset names + values; note px / % / viewport-relative.
> Current presets: `{current_presets}`. Product context: `{product_context}`.
> Assess whether current presets are under/over-scaled vs. the enterprise peer band. Recommend a revised scale with rationale.
> Populate Sources with direct URLs to docs or source code — verify each URL before including.

**Disposal:** intermediate; delete after the decision is committed to `spec.md` and implemented in `packages/ui`.

---

## domain-review-against-personas

**Use when:** A flow doc, wireframe, or mockup needs a domain-expert gate — vocabulary, persona scope, primitive naming, phase order.

**Inputs:** `{artifact_path}`, `{artifact_type}` (`ux-flow`/`wireframe`/`mockup`), `{persona}`, `{phase}`, `{canonical_refs}` (e.g. `platform.md`, `personas.md`, `alex-workflow.md`, `personality.md`)

**Filename:** `reviews/{artifact-slug}-domain-review-{YYYY-MM-DD}.md`

**Sections:**
```
# {Artifact} — Domain Review
**Artifacts / Persona / Phase coverage**
## {Issue slug} — {title}
**Verdict:** valid | partially valid | invalid
**Domain answer:** {reasoning citing ref:line}
**What should change:** (numbered)
---  (repeat per issue)
## Overall verdict: PASS | FAIL
```

**Prompt template:**
> Domain-review `{artifact_path}` (`{artifact_type}`) against `{canonical_refs}`.
> Primary persona: `{persona}`. Phase: `{phase}`.
> For each issue: state verdict (valid/partially valid/invalid), ground answer in `{canonical_refs}` (doc + line), state exactly what should change.
> Apply vocabulary rules from `platform.md § Vocabulary` — flag synonyms, invented primitives, phase-skips.
> Overall verdict: PASS (warnings acceptable) or FAIL (re-submission required).

**Disposal:** intermediate; delete after all FAIL items are resolved in the source artifact and reviewer issues PASS.

---

## self-review-iter

**Use when:** A flow doc or wireframe is ready for structured self-review before requesting human or domain review.

**Inputs:** `{artifact_paths}`, `{prior_decisions}` (decision table the artifact must honor), `{phase}` (`ux-flows`/`wireframes`/`screens`), `{persona}`

**Filename:** `reviews/{artifact-slug}-self-review-{YYYY-MM-DD}.md`
Iteration label in the title when re-run: `(iter 2)`.

**Sections:**
```
# {Artifact} Self-Review — {YYYY-MM-DD} ({iter label})
## Scope  (files produced; files not modified)
## Consistency checks
  - [PASS|FAIL] {check} — {evidence}
  (cover: vocabulary, eval-first constraint, persona scope, decision compliance,
   no placeholder markers, no cross-phase content)
## Drift log  (numbered: what changed from prior version and why)
## Adversarial pass
  **Structural failures:**
  **Internal contradictions:**
  **Missing states/edges:**
  **Hidden hedging:**
  **Verdict from the enemy:** {N} ship-blockers. {summary.}
## Open questions for operator  (blocking only; answerable-from-docs questions excluded)
## Verdict
  `ready-for-human-review` | `needs-revision`
```

**Prompt template:**
> Self-review `{artifact_paths}` (phase: `{phase}`, persona: `{persona}`).
> Run all consistency checks from `.claude/workflows/phase-self-review.md`.
> Adversarial pass: argue as the artifact's worst enemy. Find structural failures, internal contradictions, missing states/edges, hidden hedging. Name every ship-blocker.
> Log every change from the prior version in the Drift log.
> Open questions: only those genuinely blocking — questions answerable by reading existing docs are not open questions.
> Verdict: `ready-for-human-review` or `needs-revision`.

**Disposal:** intermediate; delete after the artifact reaches `ready-for-human-review` and the operator approves the phase gate.

---

## checkpoint-lineage-questions

**No reusable pattern.** This was a one-off canonical disambiguation of three data-model questions (checkpoint scope per-model vs per-branch, fork UI exposure, checkpoint URL identity). The output form — Q + domain reasoning + confidence level + design implications — is useful but the trigger is too product-specific to template. If similar disambiguation is needed, use `domain-review-against-personas` with the lineage questions as issues to resolve.

---

*Distilled from 13 readable files in the 2026-05/06 corpus (4 files were already deleted at read time: `audit-2026-05-30-system-polish.md` and `color-audit-2026-05-30-round1-{A,B,C}.md`; their patterns reconstructed from naming conventions and cross-references).*
