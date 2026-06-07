# Parallel Work (multi-session safety)

Two Claude sessions against one checkout race at three layers: filesystem (last-writer-wins, no merge conflict surfaces), build/process (`dist/`, `.next/`, pm2 procs), and runtime data (`private/oak.db`). Worktrees fix the first layer; the rules below fix the other two.

## Core invariants (quoted in CLAUDE.md)

1. **Only the main checkout runs `./reload.sh` and owns pm2.** `reload.sh` hard-refuses from any `.claude/worktrees/` path — do not work around it; merge to main first if you need a live server. For pre-merge live preview, use `./worktree-preview.sh` from inside the worktree — it runs `next dev` on a dedicated port (3810–3899) and shares the main `oak-server:3100` backend.
2. **Second substantive session → worktree.** `claude --worktree <name>` for fresh sessions; heavy-edit sub-agents (`staff-frontend-engineer`, `staff-backend-engineer`, `design-system-architect`, `storybook-documenter`) carry `isolation: worktree` and get a fresh sandbox per `Task()` call. Trivial reads / one-file tweaks stay in main.
3. **Worktrees do NOT solve Oak DB races** from MCP tool calls (`oak_update_*`, `capture`, etc.) — serialize Oak data mutations through one session.

## In-flight registry

[`.state/in-flight-work.md`](../../.state/in-flight-work.md) — a SessionStart hook auto-writes your row (pid, cwd, branch, worktree, started) and sweeps dead rows. A SessionEnd hook removes it on clean exit. On overlap (another live session claims the same cwd+branch), the hook warns — spawn a worktree. Fill the `paths` column on your first substantive turn so other sessions can see your scope.

## Return protocol

Agents MUST `git commit` inside the worktree before returning; main thread MUST use `git merge --no-ff worktree-agent-<id>` (never `git apply` of a diff, never direct writes to main's working tree). Full rules: [`worktree-return-protocol.md`](worktree-return-protocol.md).

Main thread also cleans up on return: `git worktree remove -f <path>` + `git branch -D worktree-agent-<id>` (the Stop hook blocks turn-end if either dangles).
