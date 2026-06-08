# Worktree Return Protocol

How a worktree-isolated agent (`staff-frontend-engineer`, `design-system-architect`, `storybook-documenter`) hands work back to the main thread.

## Agent side (inside the worktree)

For any change with a UI surface, run a live preview **before** committing so the Operator can review the rendered result prior to merge:

```bash
pnpm --filter portal dev          # Next.js auto-retries to the next free port
                                  # (main usually holds 3000, worktrees land on 3001+)
                                  # URL is printed in this terminal
```

Mechanism: see [`worktree-protocol.md`](worktree-protocol.md) § Portal port. No port flags, no env files — just run the script and report the URL.

Then, after the Operator approves the preview:

1. `git add <specific files you intended to change>` — do NOT `git add -A` blindly; stage only the files your task produced. `node_modules/` is gitignored, but other stray files (logs, scratch notes) are not.
2. `git commit -m "<conventional-commit-message>"` — same format as regular commits (`feat(scope): …`, `fix(scope): …`).
3. Stop the dev server (Ctrl-C) before returning.
4. In the return summary, include:
   - Worktree branch name (e.g. `worktree-agent-a15bdd58`)
   - Commit SHA
   - One-line commit subject
   - Preview verdict ("Operator approved at http://localhost:PORT")

## Hard prohibitions for the agent

- **Never write to main's working tree.** All edits stay inside your worktree directory. Do not `cd` out of it. Do not use absolute paths that resolve to the main checkout. Enforced by [`block-main-write-from-worktree.sh`](../hooks/block-main-write-from-worktree.sh).
- **Never return with uncommitted changes.** An uncommitted worktree looks identical to a finished one from the outside — the main thread cannot tell whether to merge or discard. Commit is the signal.
- **Never pass `-p` or `PORT` to `pnpm dev`.** That disables Next.js's auto-retry and forces a collision with whichever instance already holds the port.

## Main thread side (orchestrator)

On agent return:

1. `git merge --no-commit --no-ff worktree-agent-<id>` — stage the merge without creating the commit. If main's `pnpm dev` is running, Next.js fast-refresh picks up the staged files automatically; the Operator can verify in the browser on main's URL.
2. **If git reports conflicts:** resolve them, then **flag the Operator** — the merged result now differs from the previewed result, so they need to re-verify. Post "conflicts resolved, please re-verify" and wait for confirmation before committing.
3. **If clean merge (no conflicts):** the Operator already approved the preview — `git commit -m "<merge-message>"` immediately, no second verification needed.
   - If the Operator rejects at this stage anyway: `git merge --abort` — staged merge discarded, worktree still intact for re-work.
4. **Only after the merge commit lands**, cleanup:
   ```bash
   git worktree remove .claude/worktrees/agent-<id>
   git branch -d worktree-agent-<id>
   ```
   If the Operator aborted, the worktree is the recovery source — leave it intact for re-work.

**Why `--no-commit`:** the atomic `git merge --no-ff … -m "<msg>"` form commits before the dev server has fast-refreshed. A broken change then requires `git revert` (ugly history) instead of `git merge --abort` (clean exit).

## Hard prohibitions for the orchestrator

- **Never `git merge --no-ff … -m "<msg>"`** (atomic commit-merge). Always split into `--no-commit --no-ff` → Operator verifies in browser → `git commit`. Enforced by [`block-atomic-worktree-merge.sh`](../hooks/block-atomic-worktree-merge.sh).
- **Never `git -C <worktree> diff | git apply`** to bring changes into main. That bypasses git's 3-way merge — if another session has also merged to the same file, the apply silently overwrites those edits with no conflict surface.
- **Never `cp` / `mv` / `rsync`** files from a worktree into main's working tree for the same reason. Enforced by [`block-worktree-transfer.sh`](../hooks/block-worktree-transfer.sh) (PreToolUse on Bash).
- **Never edit main's working tree based on the agent's summary** instead of merging the branch. The branch is the source of truth; re-typing the diff loses provenance and is a second chance to diverge.
- **Never delegate the `--no-commit` merge to `release-manager` without spelling out the flag.** Its default flow is commit-merge-cleanup atomic; if you say "merge it," it will. Tell it explicitly: `git merge --no-commit --no-ff`, stop before the commit, return to main for Operator verify.

## No nested worktree agents (HARD RULE)

**A worktree-isolated agent MUST NOT spawn another worktree-isolated agent.** The worktree-isolated agents are `staff-frontend-engineer`, `design-system-architect`, `storybook-documenter`, `library-engineer`.

If you are one of these agents and you hit a cross-scope dependency (frontend needs a design-system component, UI needs a shared lib, design-system-architect finished a component and needs stories, etc.), **return to main with a dependency request.** The main thread will:

1. Spawn the dependency agent (fresh worktree from main).
2. Wait for its commit + merge.
3. Re-spawn you with a fresh worktree that contains the merged dependency.

**Return format when requesting a dependency:**
- State plainly: "I need <agent-name> to do <task> before I can continue."
- List the exact thing you need (component name + spec path, lib function + signature, etc.).
- Commit whatever partial work is reusable and report the branch — OR report "nothing committed, stopped at spec gate."

**Why this rule exists.** Nested worktrees create stacked merges with mismatched bases: the inner agent starts from main, not from the outer agent's worktree, so it can't see the outer agent's in-progress edits. Merging the inner branch into the outer worktree then merging the outer branch into main is two merge points where conflicts can silently diverge. Returning to main flattens the graph: every merge is a single hop from a worktree to main, with a clean base.

You MAY still spawn non-worktree agents (reviewers) from inside your worktree — they read files from your worktree directly, no isolation needed.

## Why this exists

Two agents touching the same file is safe if and only if both commit through git. Git's 3-way merge preserves non-overlapping edits automatically and raises a conflict for overlapping edits — either way, no changes are lost. Skipping the commit (direct write to main, or `git apply` of a worktree diff) removes git from the loop: last writer wins silently, no conflict surface, no history.
