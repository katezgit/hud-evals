# Worktree Protocol

Single source of truth for every worktree decision the orchestrator makes — when to spawn, where to spawn from, how multiple agents share a worktree, how portal ports are handled, and how teardown runs. CLAUDE.md L67 points here as a hard stop before any worktree spawn.

## When to spawn — topic state machine

State the decision in one line before acting.

- **New topic, no existing worktree** → `git worktree add -b <prefix>/<topic> .claude/worktrees/<topic> main`. Cut from `main`; prefix per [`docs/conventions/git.md`](../../docs/conventions/git.md) § Branch Naming. `cd` into it before editing. Sub-agents inherit the worktree by being told the path in their prompt.
- **Worktree for the topic already exists at `.claude/worktrees/<topic>`** → `cd` into it. If its branch matches the topic, continue; if not, ask the operator.
- **Currently in a worktree matching the topic** → continue in it.
- **In a worktree NOT matching the work** → stop and ask: continue here, or spawn a new worktree from `main`?
- **Never branch off another feature branch.** Worktree-per-topic enforces this structurally — see [`docs/conventions/git.md`](../../docs/conventions/git.md) § Branch Lifecycle.

Operator weak-verb authorization ("go", "yes", "ship it") applies to the most recent proposed worktree/branch decision the same way it applies to commit/push.

## Solo vs chain — single shared worktree for collaborating agents

**Solo invocation** (single bug fix, single component, doc sweep, independent parallel work) → the agent's auto-isolation worktree handles it. Orchestrator only chooses the topic name and spawns the agent.

**Multi-agent chain** (≥2 agents touch the same feature and the orchestrator coordinates them) → all agents share **one** worktree on **one** feature branch and land as **one** merge. This is the default for any multi-agent chain. Examples:

- Component implementation that needs stories — `design-system-architect` → `storybook-documenter`. The architect owns the sub-chain: spawns the documenter in the shared worktree, reviews, loops until clean, then commits the stories. Orchestrator only spawns the architect.
- Backend implementation that requires doc updates, or a backend contract change that breaks frontend consumers.

### Why a shared feature worktree

Without one, each agent's auto-isolation worktree is seeded from a base the orchestrator does not control. The downstream agent may see a stale base that doesn't contain the upstream agent's just-merged work — branches descend from divergent parents and ship as multiple separate merges. The feature loses atomicity.

A shared feature branch fixes this: all commits descend from one orchestrator-chosen base, the merge is a single no-ff into `main`, and the feature ships as one thing or not at all.

### Orchestrator workflow for chains

1. **Pick a feature name** in kebab-case: `tag-gate`, `dialog-subtitle`, `capture-rebuild`.

2. **Create the feature worktree before spawning the first agent:**

   ```bash
   git worktree add -b feat/<name> .claude/worktrees/feat-<name> main
   ```

3. **Spawn the lead agent with the directive in the prompt.** For component+stories chains, that is `design-system-architect` only — it spawns `storybook-documenter` itself inside the shared worktree and reviews to yes before returning. For other chains, spawn each agent in turn.

   ```
   FEATURE_WORKTREE: <absolute path to .claude/worktrees/feat-<name>>
   FEATURE_BRANCH: feat/<name>

   <regular brief follows>
   ```

   The agent's preflight detects this and works in the feature worktree instead of its auto-isolation worktree (which gets cleaned up empty since no commits land there).

4. **After every agent in the chain has committed, apply the current lifecycle phase's merge gate** from [`.state/phases.md`](../../.state/phases.md). Read `.state/state.md` first to learn the current lifecycle phase; then apply the row.

   **In `production`:** open a PR and stop — Operator merges.

   ```bash
   git push -u origin feat/<name>
   gh pr create --title "<feature>" --body "$(cat <<'EOF'
   <use the PR body template from .state/phases.md>
   EOF
   )"
   # Do NOT merge. Do NOT remove the worktree. Operator merges; orchestrator returns.
   ```

   After Operator merges, run `git pull --ff-only` on `main`, reload the dev server if there's runtime impact, then clean up the worktree and feature branch.

   **In `greenfield`:** orchestrator may auto-merge after gates pass.

   ```bash
   git merge --no-commit --no-ff feat/<name>          # from main
   # reload the dev server if there's runtime impact
   git commit -m "<merge message describing the feature>"
   git worktree remove -f .claude/worktrees/feat-<name>
   git branch -d feat/<name>
   ```

   Single merge commit on `main`; all individual agent commits preserved inside the feature branch's history.

### Sub-agent workflow inside a chain

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

3. **If absent** — solo invocation. Run the standard self-heal preflight in your auto-isolation worktree (see [`worktree-base-self-heal.md`](worktree-base-self-heal.md)) and continue as normal.

## Portal port — Next.js auto-retries, zero per-worktree config

Every worktree can run `pnpm dev` inside `apps/portal/` and get a unique URL automatically. No env files, no scripts, no orchestrator-side port assignment.

**How it works.** `apps/portal/package.json`'s `dev` script omits `-p` and `PORT` is not set, so Next.js's commander reads its default port (3000) with `portSource === 'default'`. When that port is busy, Next.js auto-retries the next free port (3001, 3002, …) — verified at `apps/portal/node_modules/next/dist/cli/next-dev.js` L192. The chosen URL is printed to the terminal that ran `pnpm dev`.

**Resulting behavior:**

- Main checkout: first to start → port 3000.
- Worktree A starting next → Next.js sees 3000 busy, retries to 3001.
- Worktree B starting next → retries to 3002. Etc.

**Orchestrator's job on spawn: nothing port-related.** Just `git worktree add` and `cd`. The port is resolved at `pnpm dev` time by Next.js, not at spawn time by the orchestrator.

**If the Operator asks "what port is the X worktree on":** check the terminal that ran `pnpm dev` in that worktree — the URL is in the startup banner. If dev isn't running there, the answer is "not running, start `pnpm dev` and Next.js will pick the next free port".

## Return protocol

A worktree-isolated agent (`staff-frontend-engineer`, `staff-backend-engineer`, `design-system-architect`, `storybook-documenter`) MUST `git commit` inside the worktree before returning; the main thread MUST use `git merge --no-ff worktree-agent-<id>` (never `git apply` of a diff, never direct writes to main's working tree). Full rules: [`worktree-return-protocol.md`](worktree-return-protocol.md).

## Cleanup

- **Chain feature worktree** exists as long as the chain is in progress. Only the orchestrator removes it, and only after the merge into `main` lands. If the chain is abandoned mid-flight, the orchestrator removes the feature worktree and deletes the branch (no auto-cleanup hook handles this case).
- **Solo agent's auto-isolation worktree** is removed by the per-spawn cleanup hook after the agent's commit is merged.
- **Cross-session prune** (deletes any local branch whose PR has merged) → invoke `release-manager` in "Prune Merged Branches" mode **only on explicit operator request** (phrases: "prune", "clean branches", "tidy worktrees"). Never auto-fire — prune scans across all local branches regardless of session, which breaches the "commit scope = this session only" principle when invoked implicitly.

## Anti-patterns

- **Spawning chained agents without a feature worktree** — produces divergent branches and multiple merges. Caught only at merge time as drift.
- **Running `git reset --hard main` in a feature worktree** with prior agent commits — destroys upstream work. Hard rule: in `FEATURE_WORKTREE` mode, the agent never resets.
- **Committing to `main` directly from the orchestrator** to "fix up" docs after an agent's merge — this is the original divergent-merge problem in disguise. If docs need to come along with code, they go in the feature worktree before the single merge. (In `production` lifecycle phase, direct commits to `main` are forbidden regardless — see `.state/phases.md`.)
- **Manually setting `PORT` env var or `-p` flag** when running `pnpm dev` — disables Next.js's auto-retry and forces a port collision.

## Interaction with existing protocols

- [`worktree-return-protocol.md`](worktree-return-protocol.md) governs single-agent return semantics (commit-before-return, no nested worktree spawns, never `git apply` of a worktree diff). The chain pattern layers on top: agents in a chain still commit before returning; the orchestrator just merges the feature branch instead of each agent's separate branch.
- [`parallel-work.md`](parallel-work.md) governs cross-session safety. A feature worktree IS a worktree — it isolates the chain from main and from other parallel sessions at the filesystem layer.
