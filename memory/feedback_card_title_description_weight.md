---
name: feedback-card-title-description-weight
description: Card titles and their descriptions both sit on text-body — weight (medium vs regular), not size, is the hierarchy signal
metadata:
  type: feedback
---

In HUD catalog cards, the **title** and its **description** both use `text-body` (14px). The hierarchy comes from **weight** — title is `font-medium` (500), description is the default regular (400). Do not drop description to `text-label` (12px) or any smaller size for hierarchy.

**Why:** Operator corrected this directly on the agents page: "the agent description text should use text-body man / the card title should use weight to differentiate it with its content." This aligns with `docs/design/foundations/typography.md` §9 line 178 — "Card titles and panel labels move to `--text-body` at `--weight-medium`. The weight shift delivers the structural signal without a near-invisible size step." The principle generalizes from title-vs-body-text to title-vs-description on the same card surface: 14px + weight delta beats a 14→12 size step that reads as noise.

**How to apply:** When laying out any card (catalog cards, list rows with title + supporting line, drawer entries), default to:
- Title: `text-body font-medium text-foreground`
- Description: `text-body text-muted-foreground` (no weight class → inherits regular)

Reach for `text-label` / `text-caption` only for true micro-content (form labels, metadata strips, identifier slugs), not for the primary description sitting under a card title. Related: [[feedback-no-worktrees]] (same repo).
