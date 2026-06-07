---
phase: screens
artifact: self-review
date: 2025-10-22
reviewer: product-designer
status: frozen-example
source: untolabs/thruscan blockchain browser, 2025-Q4
---

# Self-Review — Screens Phase (Example)

Self-reviews are the gate between a phase's exit artifact and human approval. The agent that produced the artifact runs through this checklist *before* posting "ready for review". Catches drift, missing states, and rationale gaps that would otherwise become rework.

## Scope

- **Phase:** screens
- **Feature:** transaction detail page
- **Artifacts under review:** `docs/design/screens/tx-detail.screen.md`
- **Upstream artifacts referenced:** `docs/design/screens/tx-detail.wireframe.md`, `docs/design/foundations/{color,typography,spacing}.md`, `docs/design/flows/tx-lookup.md`

## Checklist

### Coverage

- [x] Every state in the parity grid is covered in the spec
- [x] Default, empty, loading, error, success, disabled all addressed (or marked N/A with reason)
- [x] Edge cases from the wireframe drift log are reflected
- [ ] ⚠️ Mobile breakpoint not yet specified — see "Open issues" below

### Token discipline

- [x] No raw hex colors — all color references go through `--color-*` tokens
- [x] No raw px values for spacing — all use `--space-*` scale
- [x] No raw font sizes — all use `--font-size-*` scale
- [x] Elevation/shadow uses `--shadow-*` tokens

### Rationale

- [x] Every non-obvious decision has a "Why" line
- [x] Trade-offs against rejected alternatives are documented
- [x] Personality alignment is explicit (which adjective from `personality.md` does this serve?)

### Upstream consistency

- [x] Spec does not contradict the wireframe without a logged drift entry
- [x] Spec does not invent IA the user flow doesn't justify
- [x] Tokens used exist in `foundations/`

### Accessibility (pre-a11y-review pass)

- [x] Color contrast called out for every text/background combo
- [x] Focus order documented for interactive elements
- [x] Touch target sizes ≥ 44px noted
- [ ] ⚠️ Screen reader announcement for loading state not specified

## Findings

### Resolved during self-review

1. **Spec used `#0052CC` directly in error banner.** Replaced with `--color-feedback-error-bg`. Token already existed in `foundations/color.md`.
2. **Empty state had no rationale.** Added "Why" — empty state only reachable via direct link to deleted tx, so copy must explain *why* it's empty, not just *that* it's empty.
3. **Loading skeleton dimensions not specified.** Added explicit skeleton block sizes matching the loaded layout.

### Open issues (blocking human review)

1. **Mobile breakpoint missing.** Spec covers desktop only. Need to decide: defer to a later phase, or add mobile column to parity grid and re-spec? **Recommendation:** add to parity grid now, spec in this same phase — the layout shift is non-trivial and discovering it later will cause rework.
2. **Loading state SR announcement.** Need to specify `aria-live` region copy. **Recommendation:** wait for accessibility-expert pass — they have stronger conventions than I do.

## Decision

**Status: NOT READY for human review.** Two open issues above. Will resolve #1 myself (add mobile to spec), defer #2 to a11y phase with a tracked task.

Next action: spawn `agent:add mobile breakpoint to tx-detail.screen.md` task.

---

## Rules for self-reviews

1. **Run before posting "ready for review".** Self-review is part of producing the artifact, not a separate step.
2. **Be honest about gaps.** A self-review that finds nothing is a self-review that wasn't done.
3. **Distinguish "fixed it" from "open issue".** Resolved findings stay in the doc as a record. Open issues block human review until addressed.
4. **Recommend, don't decide, on open issues.** The human approves the path forward.
5. **One self-review per exit artifact.** Filed at `.intermediate/reviews/{phase}-self-review-{YYYY-MM-DD}.md`.
