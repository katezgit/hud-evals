# {{Product Name}} — platform overview

> **What this file is.** The structural and lexical anchor for the product. Every persona, workflow, design artifact, screen spec, component label, and error message derives from here. Fill before `personas.md` — it's step 1 of the derivation order in [`index.md`](./index.md).

## What {{Product Name}} is

{{Product Name}} is **{{one-line positioning — what category, what wedge}}** — {{the layer/seam/gap it fills, stated in user terms}}. It bundles {{N}} things every {{target customer}} otherwise builds themselves: **{{capability 1}}**, **{{capability 2}}**, **{{capability 3}}**{{, **{{capability 4}}**}}.

## Surfaces of the {{Product Name}} platform

| Surface | Where | What users do there |
|---|---|---|
| **{{Surface 1}}** ({{tech / package name}}) | {{location — local terminal / hosted URL / extension}} | {{What users author / browse / manage on this surface, in product vocabulary}} |
| **{{Surface 2}}** | {{location}} | {{...}} |

{{Optional: cross-cutting flag rule. e.g. "Any primitive can be **Private** or **Public**. Visibility is a flag on the primitive, not a separate surface." State this only if it's a real platform invariant the design must respect}}.

## Who it's for

{{Sales motion in one line — enterprise sale / B2B SMB / B2C / OSS / internal tool — and the target customer}}.

Primary user types: **{{Primary persona title}}** and **{{Secondary persona title}}**. See [`personas.md`](./personas.md) for the full profiles.

## Platform primitives

The nouns that make up the product. Every UI label, every error message, every doc references these terms verbatim — see "Terminology" below.

| Name | What it is |
|---|---|
| **{{Primitive 1}}** | {{One-line definition — what it is, what it does, what produces or consumes it}}. |
| **{{Primitive 2}}** | {{Definition. Include any sub-kinds — e.g. "Two kinds: **X** and **Y**"}}. |
| **{{Primitive 3}}** | {{Definition. Call out load-bearing primitives explicitly — e.g. "The platform's load-bearing artifact"}}. |
| **{{Primitive 4}}** | {{Definition}}. |
| ... | ... |

## Canonical user loops

The 2–4 dominant journeys that combine the primitives above. Every screen exists to serve one of these. Workflows in `alex-workflow.md` are persona-specific *executions* of these loops.

1. **{{Loop 1 name}}.** {{One sentence describing the loop in product vocabulary — e.g. "Pick a Model, point it at a Taskset, launch a Job, drill into failures"}}.
2. **{{Loop 2 name}}.** {{...}}
3. **{{Loop 3 name}}.** {{...}}

---

## Terminology — canonical vocabulary

> **Rule.** Every label, error message, empty state, doc, spec, component name, and code identifier uses these terms **verbatim**. Synonyms drift across pages and break user trust. When in doubt, copy from this table.
>
> **Enforced by:** `product-domain-reviewer` on UX flows + wireframes — any synonym = FAIL, quote the offending term + the correct one. Engineering-surface enforcement (screen specs, component labels, code identifiers, Storybook stories) is **not yet automated** — `frontend-reviewer` and `storybook-documenter` should be extended to apply this same rule. Until then, the human review gate.

| Canonical term | Means | Banned synonyms (do not use) |
|---|---|---|
| **{{Term 1}}** | {{One-line meaning — usually mirrors the primitive's definition above}} | `{{synonym a}}`, `{{synonym b}}`, `{{synonym c}}` |
| **{{Term 2}}** | {{Meaning}} | `{{synonym a}}`, `{{synonym b}}` |
| **{{Term 3}}** | {{Meaning}} | `{{synonym a}}` |
| ... | ... | ... |

**Disambiguation rules** — call out pairs that are easy to confuse:

- **{{Term A}} vs {{Term B}}.** {{Term A}} is {{one-line distinction}}; {{Term B}} is {{one-line distinction}}. Using one for the other = FAIL.
- {{Add more pairs as the product grows. Common pitfall: a parent primitive (e.g. Job) being conflated with one of its children (e.g. Run)}}.

**Voice / tone** lives in [`personality.md`](./personality.md) — this file is nouns only. Apologies, encouragement, hedges, and tone rules are guarded there.

> **No top nav / IA here.** Nav structure and labels are derived in `wireframes`/`screens` from the canonical user loops above + the persona's workflow. Pre-committing nav at brief-time forces IA decisions before the jobs are mapped — see [`index.md`](./index.md).

---

Canonical product reference: [{{canonical docs URL}}]({{canonical docs URL}}).
