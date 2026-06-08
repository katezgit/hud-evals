# Parallel Work (multi-session safety)

Two Claude sessions against one checkout race at two layers: filesystem (last-writer-wins, no merge conflict surfaces) and build/process (`.next/`, `dist/`, dev-server port). Worktrees fix the first layer; the rules below fix the second.

## Core invariants (quoted in CLAUDE.md)

1. **Pre-merge live preview inside a worktree: run `pnpm dev` in `apps/portal/`.** Next.js auto-retries the next free port when 3000 is busy (verified at `next-dev.js` L192, `portSource === 'default'` enables retry). Main typically holds 3000; worktrees land on 3001, 3002, etc. The chosen URL is printed in the terminal that ran `pnpm dev`. Full mechanism: [`worktree-protocol.md`](worktree-protocol.md) § Portal port.
2. **Second substantive session → worktree.** `claude --worktree <name>` for fresh sessions; heavy-edit sub-agents (`staff-frontend-engineer`, `design-system-architect`, `storybook-documenter`, `library-engineer`) carry `isolation: worktree` and get a fresh sandbox per `Task()` call. Trivial reads / one-file tweaks stay in main.

## In-flight registry

[`.state/in-flight-work.md`](../../.state/in-flight-work.md) — a SessionStart hook auto-writes your row (pid, cwd, branch, worktree, started) and sweeps dead rows. A SessionEnd hook removes it on clean exit. On overlap (another live session claims the same cwd+branch), the hook warns — spawn a worktree. Fill the `paths` column on your first substantive turn so other sessions can see your scope.

## Return protocol

Agents MUST `git commit` inside the worktree before returning; main thread MUST use `git merge --no-ff worktree-agent-<id>` (never `git apply` of a diff, never direct writes to main's working tree). Full rules: [`worktree-return-protocol.md`](worktree-return-protocol.md).

Main thread also cleans up on return: `git worktree remove -f <path>` + `git branch -D worktree-agent-<id>` (the Stop hook blocks turn-end if either dangles).
