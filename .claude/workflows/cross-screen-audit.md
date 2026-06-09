# Cross-screen consistency audit

A process the Operator triggers — not a phase. Catches drift across sibling screens (e.g., all detail pages, all index pages) when shared component primitives haven't yet absorbed the structural consistency.

## Why this is a process, not a phase

Phases are mandatory and gate sequencing. This audit runs on-demand. Most structural consistency (heading hierarchy, layout split, sticky behavior) should be enforced by shared primitives in `packages/ui/`, surfaced through the `components` phase. Audit findings often *become* component tickets — the audit is a discovery tool for missing primitives as much as a drift catcher.

## When to run

- Operator says "audit the {category}" — e.g., "audit the detail pages".
- Natural triggers: 3+ sibling `.screen.md` files exist for a category, OR Operator notices drift, OR before promoting a category's patterns into `components` phase.

## Process

1. Operator names the category (e.g., "detail pages") and the sibling list (orchestrator may infer from `docs/design/screens/*.screen.md`).
2. Orchestrator dispatches `product-designer` with:
   - The full list of `.screen.md` files in the category
   - The audit checklist (below)
   - Output target: `docs/design/audits/{category}-{YYYY-MM-DD}.md`
3. Designer reads all sibling specs in one pass and writes the audit doc.
4. Each finding is classified:
   - **Revise spec** — drift is local; one or more `.screen.md` files need updates. Designer queues the revisions in the audit doc, then runs them in a follow-up dispatch.
   - **Component ticket** — the right fix is a shared primitive. File an `agent:components` task linking back to the audit doc.
   - **Accept** — variation is intentional and tied to a screen-specific constraint. Note the reason inline.

## Checklist

1. **Heading hierarchy.** H1/H2/H3 sizes, weights, line-height, vertical rhythm match across siblings.
2. **Major layout.** Sidebar/main split, header behavior (sticky vs not), breadcrumb placement, primary-action position.
3. **Section order.** "What comes first" is consistent — metadata → tabs → body, or whatever the established convention is.
4. **Density tier.** All siblings on the same calibrated density tier; no one-off compact/comfortable choices.
5. **State styling.** Empty / loading / error / skeleton patterns match across siblings.
6. **Page-title treatment.** Icon, label, breadcrumb relationship consistent.

## Output

`docs/design/audits/{category}-{YYYY-MM-DD}.md`, structured as:

- **Category** + sibling list (linked)
- **Findings** — one entry per inconsistency: *what*, *where* (file + section), *classification* (revise / component / accept), *reason*
- **Actions** — bulleted follow-ups: spec revisions queued, component tickets filed, accepted variations

The audit is a process artifact and reference, not a phase exit gate. It does not block `components`, `motion`, or `implementation` — but findings filed as component tickets become inputs to the `components` phase.

## Designer artifact rule

The audit doc is a designer artifact. The dispatched `product-designer` MUST run the [Designer Artifact Rule](design-phases.md#designer-artifact-rule) in the same turn — oak note + project link, with the audit doc and every revised `.screen.md` as clickable links.
