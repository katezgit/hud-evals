---
name: feedback-no-worktrees
description: Work directly in the main checkout — do not create worktrees per topic for this repo
metadata:
  type: feedback
---

For this repo (`/Users/kate/phoenix/projects/hudai.fullstackeng/new`), do all work in the main checkout directly. Do not create per-topic worktrees under `.claude/worktrees/`.

**Why:** Operator stated this is a new repo created on top of an original codebase — the worktree-per-topic discipline in `CLAUDE.md` (Hard rules → Agency → Pick the worktree) is from the inherited convention but does not apply here. Creating worktrees adds friction without isolation benefit.

**How to apply:** When CLAUDE.md says "New topic → `git worktree add ...`", skip that step. Work on the existing branch (or a feature branch in the main checkout if one is needed). When dispatching sub-agents, pass the main repo path, not a worktree path. The palette-canonical-sync branch from this session lives on its own branch but inside the main checkout — that's the pattern.
