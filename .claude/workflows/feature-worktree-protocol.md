# Feature Worktree Protocol

When multiple agents collaborate on one coherent change — backend + docs, backend + frontend updates after a contract change, component + stories — they share **one** worktree on **one** feature branch and land as **one** merge. This is the default for any multi-agent chain.

## When to use this pattern

**Yes — feature worktree:**

- Component implementation that needs stories — chain is `design-system-architect` → `storybook-documenter`, and **the architect owns the sub-chain**: it spawns the documenter in the shared worktree, reviews the output, loops until clean, then commits the stories. Orchestrator only spawns the architect.
- Any other work where ≥2 agents touch the same feature and the orchestrator coordinates them directly
- (When a backend app exists) backend implementation that requires doc updates, or a backend contract change that breaks frontend consumers

**No — per-spawn auto-isolation:**

- Solo invocation: a single bug fix, a doc sweep, a single component
- Independent parallel work that happens to be running at the same time

## Why

Without a shared worktree, each agent's auto-isolation worktree is seeded by the harness from a base the orchestrator does not control. The downstream agent in a chain may see a stale base that doesn't contain the upstream agent's just-merged work, producing branches that descend from divergent parents and ship as multiple separate merges. The feature loses atomicity — partial chains can ship with the docs lagging the code.

A shared feature branch fixes this: all commits descend from one orchestrator-chosen base, the merge is a single no-ff into `main`, and the feature ships as one thing or not at all.

## Orchestrator (main thread) workflow

1. **Pick a feature name** in kebab-case: `tag-gate`, `dialog-subtitle`, `capture-rebuild`.

2. **Create the feature worktree before spawning the first agent:**

   ```bash
   git worktree add -b feat/<name> .claude/worktrees/feat-<name> main
   ```

3. **Spawn the lead agent in the chain with the directive in the prompt.** For component+stories chains, that is `design-system-architect` only — it spawns `storybook-documenter` itself inside the shared worktree and reviews to yes before returning. For other chains, spawn each agent in turn.

   ```
   FEATURE_WORKTREE: /Users/kate/phoenix/projects/hudai.dashboard/.claude/worktrees/feat-<name>
   FEATURE_BRANCH: feat/<name>

   <regular brief follows>
   ```

   The agent's preflight detects this and works in the feature worktree instead of its auto-isolation worktree (which gets cleaned up empty since no commits land there).

4. **After every agent in the chain has committed, apply the current lifecycle phase's merge gate from [`.state/phases.md`](../../.state/phases.md).** Read `.state/state.md` first to learn the current lifecycle phase; then apply the row.

   **In `production`:** open a PR and stop — Kate merges.

   ```bash
   git push -u origin feat/<name>
   gh pr create --title "<feature>" --body "$(cat <<'EOF'
   <use the PR body template from .state/phases.md>
   EOF
   )"
   # Do NOT merge. Do NOT remove the worktree. Kate merges; orchestrator returns.
   ```

   After Kate merges, run `git pull --ff-only` on `main`, reload the dev server if there's runtime impact, then clean up the worktree and feature branch.

   **In `greenfield`:** orchestrator may auto-merge after gates pass.

   ```bash
   git merge --no-commit --no-ff feat/<name>          # from main
   # reload the dev server if there's runtime impact
   git commit -m "<merge message describing the feature>"
   git worktree remove -f .claude/worktrees/feat-<name>
   git branch -d feat/<name>
   ```

   Single merge commit on `main`; all individual agent commits preserved inside the feature branch's history.

## Agent (sub-agent) workflow

Inside any worktree-isolated agent's preflight:

1. **Check the prompt for `FEATURE_WORKTREE: <path>` and `FEATURE_BRANCH: feat/<name>`.**

2. **If present** — you are part of a chain. Skip the auto-isolation worktree and attach to the shared one:

   ```bash
   cd "<FEATURE_WORKTREE path from prompt>"
   git rev-parse --abbrev-ref HEAD                # verify you are on FEATURE_BRANCH
   git status --short                             # verify clean working tree
   ```

   Do all work and commits here. Do not commit to the auto-isolation worktree — leave it empty so it cleans up automatically.

   The orchestrator owns the base — do **not** run the stale-base self-heal (`git reset --hard main`) in this mode. Doing so would discard prior agents' commits on the feature branch.

3. **If absent** — solo invocation. Run the standard self-heal preflight in your auto-isolation worktree (see your agent definition for the inline check) and continue as normal.

## Cleanup discipline

- The feature worktree exists as long as the chain is in progress. It is **not** removed by individual agents on return.
- Only the orchestrator removes it, and only after the merge into `main` lands.
- If the chain is abandoned mid-flight, the orchestrator removes the feature worktree and deletes the branch — no auto-cleanup hook handles this case (the per-spawn cleanup hook only targets `agent-*` worktrees).

## Interaction with existing protocols

- **`worktree-return-protocol.md`** still governs single-agent return semantics (commit-before-return, no nested worktree spawns, never `git apply` of a worktree diff). The feature-worktree pattern is layered on top: agents in a chain still commit before returning; the orchestrator just merges the feature branch instead of each agent's separate branch.
- **`parallel-work.md`** still governs cross-session safety. A feature worktree IS a worktree — it isolates the chain from main and from other parallel sessions at the filesystem layer.

## Anti-patterns

- **Spawning chained agents without a feature worktree** — produces divergent branches and multiple merges. Caught only at merge time as drift.
- **Running `git reset --hard main` in a feature worktree** with prior agent commits — destroys upstream work. Hard rule: in `FEATURE_WORKTREE` mode, the agent never resets.
- **Committing to `main` directly from the orchestrator** to "fix up" docs after an agent's merge — this is the original problem in disguise. If docs need to come along with code, they go in the feature worktree before the single merge. (In `production` lifecycle phase, direct commits to `main` are forbidden regardless — see `.state/phases.md`.)
