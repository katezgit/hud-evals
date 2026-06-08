# Alex's workflow

{{N}} phases Alex moves through when {{he/she/they}} {{ships the primary outcome of the product — e.g. "ships an agent", "closes a deal", "files a claim"}}. [`personas.md`](personas.md) tells you who {{he/she/they}} is; this file tells you what {{he/she/they}} is doing at each step and what {{Product}} must give {{him/her/them}} to keep {{him/her/them}} on the platform. Earlier phases gate later ones — {{state the gating rule in domain terms: you cannot do X to a Y whose Z is broken}}.

> **Conventions used in this doc:**
> - Phases are ordered. Skipping a phase is the failure mode the closing rule names.
> - Each phase has three fields: **Does** (concrete actions in product vocabulary), **Why** (the failure mode this phase prevents or the win it enables), **Surface implication** (what the product surface must do to support this phase).
> - Exactly one phase is the **load-bearing UX of the entire product** for this persona — call it out in its Surface implication. Cuts preserve that phase first.
> - Cite external sources inline when a phase's contract comes from docs outside this repo: `[Source: ...]`.

## Phase 1 — {{Phase 1 Name}}

- **Does**: {{What Alex concretely does in this phase — name the commands, surfaces, artifacts, and inputs in product vocabulary}}.
- **Why**: {{What failure mode this phase prevents or what win it enables. Tie back to what Alex is measured on (from personas.md). If this phase is a gate on a later phase, say which one and what skipping it costs}}.
- **Surface implication**: {{What the product surface must do to support this phase. Be specific about which entry points are first-class, what views are required from day one, and what the failure case is if the surface forces a workaround}}.

## Phase 2 — {{Phase 2 Name}}

- **Does**: {{...}}.
- **Why**: {{...}}.
- **Surface implication**: {{...}}.

## Phase 3 — {{Phase 3 Name}}

- **Does**: {{...}}. {{If this phase's contract is documented externally, cite it: `[Source: ...]`}}
- **Why**: {{...}}. {{If a prior framing of this phase was wrong, name the correction here — e.g. "Unlike the prior (incorrect) framing, ground truth is X, not Y"}}
- **Surface implication**: {{...}}. {{Name the load-bearing piece of this phase's surface — the one view / diff / drill that, if missing, makes the persona write their own tool}}.

## Phase 4 — {{Phase 4 Name}}

- **Does**: {{...}}.
- **Why**: {{...}}.
- **Surface implication**: {{...}}.

## Phase {{N}} — {{Final Phase Name}}

- **Does**: {{...}}.
- **Why**: {{...}}.
- **Surface implication**: **this is the load-bearing UX of the entire product for Alex.** {{Describe the one-click / one-surface contract that defines the product's wedge for this persona. Name the anti-pattern explicitly — what taking more than one click / opening a modal / re-querying costs the product}}.

---

*Designing flows that skip a phase — e.g., a "{{shortcut wizard name}}" that doesn't run through {{required prior phase}} first — breaks the workflow Alex trusts. Phase order is the workflow.*
