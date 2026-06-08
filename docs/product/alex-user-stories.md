# Alex User Stories

Primary persona: {{Persona Title}} (Alex, {{age}}). Stories are anchored to [`alex-workflow.md`](./alex-workflow.md) phases and [`personas.md`](./personas.md) scope. {{Product}} vocabulary used verbatim throughout.

> **Conventions used in this doc:**
> - `**[load-bearing]**` marks the stories that define the product's core wedge for this persona. Cuts and trade-offs preserve load-bearing stories first.
> - Every story cites its source in italics — `(— personas.md: "...")` or `(— alex-workflow.md Phase N: "...")`. If a story has no source citation, it is not grounded and should be removed or re-derived.
> - Acceptance criteria are observable behaviors, not implementation notes. Each row is something a reviewer can check against a running build.

---

## Phase 0 — Cross-cutting

Stories that span multiple phases: {{list the cross-cutting themes — e.g. fleet operations, marketplace, leaderboards, CLI-first posture, dashboard entry behavior}}.

---

**[load-bearing]** As Alex, I want {{capability}} so that {{outcome tied to a measurable persona goal}}. *(— personas.md: "{{exact quote from personas.md that anchors this story}}")*

Acceptance criteria:
- {{Observable behavior 1}}
- {{Observable behavior 2}}
- {{Observable behavior 3 — include concrete numbers, thresholds, or state names where applicable}}
- {{Observable behavior 4 — keyboard / accessibility behavior if relevant}}

---

As Alex, I want {{capability}} so that {{outcome}}. *(— alex-workflow.md Phase {{N}}; personas.md: "{{quote}}")*

Acceptance criteria:
- {{Observable behavior}}
- {{Observable behavior}}
- {{Observable behavior}}

---

{{Add additional cross-cutting stories here. Each story follows the same shape: role-want-so-that → source citation → acceptance criteria. Mark `[load-bearing]` only for stories that define the product's core wedge for this persona.}}

---

## Phase 1 — {{Phase 1 Name}}

{{One-sentence framing of what Alex is doing in this phase and what design problem it surfaces. Mirror the phase summary from `alex-workflow.md`.}}

---

**[load-bearing]** As Alex, I want {{capability}} so that {{outcome}}. *(— alex-workflow.md Phase 1: "{{quote}}")*

Acceptance criteria:
- {{Observable behavior}}
- {{Observable behavior}}
- {{Observable behavior}}

---

As Alex, I want {{capability}} so that {{outcome}}. *(— alex-workflow.md Phase 1: "{{quote}}")*

Acceptance criteria:
- {{Observable behavior}}
- {{Observable behavior}}

---

{{Add more Phase 1 stories. Each phase typically has 1 load-bearing story + 2–4 supporting stories.}}

---

## Phase 2 — {{Phase 2 Name}}

{{One-sentence framing.}}

---

**[load-bearing]** As Alex, I want {{capability}} so that {{outcome}}. *(— alex-workflow.md Phase 2: "{{quote}}")*

Acceptance criteria:
- {{Observable behavior}}
- {{Observable behavior}}
- {{Observable behavior}}

---

As Alex, I want {{capability}} so that {{outcome}}. *(— alex-workflow.md Phase 2; personas.md: "{{quote}}")*

Acceptance criteria:
- {{Observable behavior}}
- {{Observable behavior}}

---

## Phase 3 — {{Phase 3 Name}}

{{One-sentence framing.}}

---

**[load-bearing]** As Alex, I want {{capability}} so that {{outcome}}. *(— alex-workflow.md Phase 3: "{{quote}}")*

Acceptance criteria:
- {{Observable behavior}}
- {{Observable behavior}}
- {{Observable behavior}}

---

{{Add Phase 3 supporting stories.}}

---

## Phase N — {{Final Phase Name}}

{{One-sentence framing. The final phase is typically the load-bearing UX of the entire product — call that out explicitly if it is.}}

---

**[load-bearing]** As Alex, I want {{capability}} so that {{outcome}}. *(— alex-workflow.md Phase N: "{{quote — often "this is the load-bearing UX of the entire product for Alex"}}")*

Acceptance criteria:
- {{Observable behavior — be explicit about latency, click count, or state transitions}}
- {{Observable behavior}}
- {{Observable behavior}}
- {{Observable behavior — call out live vs. historical, edge states, error states}}

---

{{Add remaining phases following the same shape. Phase count should match `alex-workflow.md`.}}

---

## Out of Scope (Alex)

Stories that belong to {{secondary persona / no current persona}}. List here to prevent "while we're at it" additions to Alex's surfaces during design review.

- **{{Out-of-scope category 1}}**: {{What it is, who it belongs to, why it does not go on Alex's path}}. *(— personas.md: "{{exact quote from out-of-scope section in personas.md}}")*
- **{{Out-of-scope category 2}}**: {{What it is and why it is excluded — restate the principle from personality.md or personas.md that drives the exclusion}}. *(— personas.md: "{{quote}}")*
- **{{Out-of-scope category 3}}**: {{...}} *(— alex-workflow.md Phase {{N}}: "{{quote}}")*
- **{{Out-of-scope category 4}}**: {{...}} *(— personality.md: "{{quote}}")*
- **{{Anti-pattern reminder}}**: {{If the secondary persona has surfaces that look superficially similar to Alex's, name the rule that keeps them on the secondary path — e.g. "if a flow only makes sense when training a model, it belongs to {{Primary}}, not {{Secondary}}"}}. *(— personas.md anti-pattern: "{{anti-pattern title}}")*

{{Add more out-of-scope items as design review surfaces them. Every item must cite a source — personas.md, personality.md, or alex-workflow.md. Unsourced exclusions are not enforceable.}}
