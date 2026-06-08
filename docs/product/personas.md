# Personas

Two personas, one primary, one secondary. The product is designed around the primary; the secondary is checked as a sanity gate, not optimized for.

## {{Primary Persona Title}} (Alex, {{age}}) — PRIMARY

- **What**: {{Role(s) and the unifying thread — what Alex actually *does* day to day, what tools / surfaces Alex lives in, what kind of work Alex considers "theirs" vs. delegated. If there are multiple visible variants on the same toolchain, describe each and what unifies them. Be specific about which product surfaces Alex uses (CLI vs. web UI vs. SDK) and which Alex skips — name the wizards / flows bypassed and why}}.
- **When**: {{Usage cadence — bursty vs. steady-state, what triggers a session, what time of day, parallel to what other work, what state Alex is in when opening the product. Call out onboarding implications (e.g. "already 40 minutes into the problem — welcome tours are pure friction")}}.
- **Why**: {{What Alex is measured on, what Alex trusts / distrusts, what the product's core wedge is for *Alex* specifically. Name the recurring hard problems that eat Alex's week. State what Alex pays for and what makes Alex leave for a competitor. Be concrete about the failure mode Alex has seen before and won't tolerate again}}.
- **In scope for Alex**: {{Surfaces, flows, and capabilities this persona uses — list the actual command names, dashboard sections, and SDK areas}}. **Out of scope**: {{Surfaces Alex does *not* use, and why. Be explicit about composition / authoring boundaries (e.g. "Alex's composition lives in code, not form fields") — these constraints drive design decisions}}.
- **Workflow**: see [`alex-workflow.md`](./alex-workflow.md) for the {{N}}-phase journey — {{phase 1}} → {{phase 2}} → {{phase 3}} → … — with design implications per phase.

## {{Secondary Persona Title}} (Sam, {{age}}) — SECONDARY

{{Optional one-line framing — e.g. "Worked example below is {{domain}}. The same {{shape}} applies to other {{adjacent domains}} the product serves, so design for the shape, not the {{domain}}-specific specifics."}}

- **What**: {{Role, company shape, what Sam is building, what makes Sam's failure mode different from Alex's (e.g. compliance vs. accuracy, regulated vs. research). What Sam is comfortable with, what Sam is skeptical of, who Sam reports to}}.
- **When**: {{Build-phase activity vs. steady-state, what triggers a session, what cadence of regression / re-evaluation work Sam does}}.
- **Why**: {{What Sam's job depends on, what defensibility / accuracy / cost looks like for Sam, who the audience for Sam's output is (compliance, board, regulator, customer). State the three concrete things Sam needs from the product and what makes Sam write their own tooling instead}}.
- **In scope for Sam**: {{Surfaces Sam uses — explicitly call out anywhere the in-scope set *differs* from Alex's, e.g. wizards that Alex skips but Sam embraces, and why}}. **Out of scope**: {{Surfaces Sam does not use — name the Alex-only surfaces explicitly. State the assumption you're making about Sam's team composition (e.g. "no ML researcher on staff — assume Sam ships prompt + RAG + eval, not RL")}}.

---

## Anti-patterns

Persona mismatches caught in review. Re-check designs against this list before shipping.

### Sam {{capability}} creep
- **Misread**: {{The tempting-but-wrong mental model — "picturing Sam as the X who does it all, including Alex's capabilities"}}.
- **Reality**: {{What real teams in this space actually do, with concrete prior-art examples ({{competitor / peer companies}}). Name why the misread archetype is fictional — what constraint (regulatory, staffing, market) keeps real teams away from it}}.
- **Design implication**: {{What surfaces / controls must NOT appear on Sam's path. State the rule: "if a flow only makes sense when {{Alex capability}}, it belongs to Alex, not Sam"}}.

### Alex {{capability}} creep
- **Misread**: {{The tempting-but-wrong mental model — adding Sam-style affordances to Alex's path because "it doesn't hurt to have them"}}.
- **Reality**: {{What Alex is actually measured on, why the added affordances are friction not safety. Re-state Alex's context (e.g. "already 40 minutes into the problem when opening the UI")}}.
- **Design implication**: {{Keep Alex's surfaces free of Sam-style UI. {{Affordance}} ships on Sam's path only}}.

{{Add additional anti-patterns as they're caught in review. One per misread. Each entry: misread → reality (with evidence) → design implication}}.

---

*Decisions that optimize for Sam at Alex's expense are wrong. Sam is the sanity check, not the target.*
