# Worktree Return Protocol

How a worktree-isolated agent (`staff-frontend-engineer`, `staff-backend-engineer`, `design-system-architect`, `storybook-documenter`) hands work back to the main thread.

## Agent side (inside the worktree)

For any change with a UI surface, run a live preview **before** committing so Kate can review the rendered result prior to merge:

```bash
./worktree-preview.sh          # starts next dev on a dedicated port (3810–3899)
                                # opens a new Chrome tab automatically
                                # shares the main oak-server backend (port 3100)
```

Then, after Kate approves the preview:

1. `git add <specific files you intended to change>` — do NOT `git add -A` blindly; stage only the files your task produced. `node_modules/` is gitignored, but other stray files (logs, scratch notes) are not.
2. `git commit -m "<conventional-commit-message>"` — same format as regular commits (`feat(scope): …`, `fix(scope): …`).
3. `./worktree-preview.sh stop` — kill the dev server before returning.
4. In the return summary, include:
   - Worktree branch name (e.g. `worktree-agent-a15bdd58`)
   - Commit SHA
   - One-line commit subject
   - Preview verdict ("Kate approved at http://localhost:PORT")

**Backend note:** `worktree-preview.sh` never starts a second `oak-server`. The preview frontend talks to the same `oak-server:3100` owned by the main checkout. Do not start your own backend instance — that creates a second SQLite writer against `private/oak.db`.

## Hard prohibitions for the agent

- **Never write to main's working tree.** All edits stay inside your worktree directory. Do not `cd` out of it. Do not use absolute paths that resolve to the main checkout.
- **Never return with uncommitted changes.** An uncommitted worktree looks identical to a finished one from the outside — the main thread cannot tell whether to merge or discard. Commit is the signal.
- **Never run `./reload.sh` from the worktree.** It hard-refuses from worktree paths. Use `./worktree-preview.sh` for live preview; `./reload.sh` is for main only.

## Main thread side (orchestrator)

On agent return:

1. `git merge --no-commit --no-ff worktree-agent-<id>` — stage the merge without creating the commit.
2. **If git reports conflicts:** resolve them, then **flag Kate** — the merged result now differs from the previewed result, so she needs to re-verify. Post "conflicts resolved, reloaded, please re-verify" and wait for her confirm before committing.
3. `./reload.sh` from main — loads the staged change into the live server.
4. **If clean merge (no conflicts):** Kate already approved the preview — `git commit -m "<merge-message>"` immediately, no second verification needed.
   - If Kate rejects at this stage anyway: `git merge --abort` — staged merge discarded, worktree still intact for re-work.
5. **Only after the merge commit lands**, cleanup:
   ```bash
   # Stop any lingering preview server for this worktree
   .claude/worktrees/agent-<id>/worktree-preview.sh stop 2>/dev/null || true
   git worktree remove .claude/worktrees/agent-<id>
   git branch -d worktree-agent-<id>
   ```
   If Kate aborted, the worktree is the recovery source — leave it (and leave the preview running so Kate can re-inspect).

**Why `--no-commit`:** the atomic `git merge --no-ff … -m "<msg>"` form commits before anything has loaded in the browser. A broken change then requires `git revert` (ugly history) instead of `git merge --abort` (clean exit). Past incident 2026-04-23: debug-content.tsx split merged atomically before reload; Kate had to trust reviewer PASS instead of seeing the page render.

## Hard prohibitions for the orchestrator

- **Never `git merge --no-ff … -m "<msg>"`** (atomic commit-merge). Always split into `--no-commit --no-ff` → reload → Kate verify → `git commit`. The atomic form ships the merge commit before any UI surface loads.
- **Never `git -C <worktree> diff | git apply`** to bring changes into main. That bypasses git's 3-way merge — if another session has also merged to the same file, the apply silently overwrites those edits with no conflict surface.
- **Never `cp` / `mv` / `rsync`** files from a worktree into main's working tree for the same reason. Enforced by `.claude/hooks/block-worktree-transfer.sh` (PreToolUse on Bash). Past incident 2026-04-23: a parallel session cp'd a stale `log-time-dialog.tsx` over a just-committed token fix, reverting the fix silently.
- **Never edit main's working tree based on the agent's summary** instead of merging the branch. The branch is the source of truth; re-typing the diff loses provenance and is a second chance to diverge.
- **Never delegate the `--no-commit` merge to `release-manager` without spelling out the flag.** Its default flow is commit-merge-cleanup atomic; if you say "merge it," it will. Tell it explicitly: `git merge --no-commit --no-ff`, stop before the commit, return to main for reload + Kate verify.

## No nested worktree agents (HARD RULE)

**A worktree-isolated agent MUST NOT spawn another worktree-isolated agent.** The four worktree-isolated agents are `staff-frontend-engineer`, `staff-backend-engineer`, `design-system-architect`, `storybook-documenter`.

If you are one of these agents and you hit a cross-scope dependency (frontend needs a design-system component, backend needs a shared lib, design-system-architect finished a component and needs stories, etc.), **return to main with a dependency request.** The main thread will:

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

Past incident: one worktree agent patched main's working tree directly while a second worktree agent merged its branch in. No overlap that time, but the two flows are incompatible — a same-file collision would have silently dropped work.
