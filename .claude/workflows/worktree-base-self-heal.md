# Worktree base self-heal

Used by worktree-isolated agents (e.g. `staff-frontend-engineer`, `design-system-architect`) when **not** part of a multi-agent feature chain. Skip this entirely if the orchestrator's prompt includes `FEATURE_WORKTREE: <path>` and `FEATURE_BRANCH: feat/<name>` directives — see [`worktree-protocol.md`](worktree-protocol.md). In that case the orchestrator owns the base; running the reset below would discard prior agents' commits on the feature branch.

## Why

The Claude Code harness occasionally seeds an auto-isolation worktree from a stale ancestor of `main`. The agent's branch is fresh with no commits, so it is safe to advance the ref to current `main` before doing any work.

## Procedure

Run at the start of your session, before workflow step 1:

```bash
worktree_head="$(git rev-parse HEAD)"
main_head="$(git rev-parse main)"   # worktrees share .git; this is always current
if [ "$worktree_head" != "$main_head" ]; then
  git reset --hard main             # advance your branch ref to current main
fi
```

If the reset fails, return `BLOCKED — could not advance worktree base from <sha> to main` immediately. Do not try to recover.
