---
description: Project-specific git conventions
tags: [git, conventions, workflow, commits, pr]
applies_to: All team members (human and AI agents)
status: Active
last_updated: 2026-06-01
---

# Team Git Conventions

Project-specific git conventions. General best practices assumed.

---

## Workflow

- Use a feature branch — see § Branch Naming
- All changes reach `main` via PR — see § Push Strategy, § Merge Strategy
- CI checks enforced before merge
- Release tags and changelogs recommended

---

## Commit Strategy

### Feature vs Atomic Commits

**Feature commits (preferred):**

Group related changes that implement one logical feature/fix together.

- Use when: Changes should be reverted together, implementing one feature, fixing one bug
- Example: Dark mode (CSS + JS + config + tests) = 1 commit

**Atomic commits:**

Split unrelated changes into separate commits.

- Use when: Changes are truly independent, different bugs fixed in one session
- Example: Fixed bug A + Fixed bug B + Updated deps = 3 commits

**Rule:** Prefer feature commits (clearer history, easier review). Use atomic commits only for truly independent changes.

---

## Security Rules (Required)

**NEVER commit secrets or sensitive data:**

- `.env` files (use `.env.example` instead)
- API keys, tokens, credentials
- Passwords or authentication secrets
- Private certificates or keys
- Database connection strings with credentials

**If accidentally committed:** Rotate the secret immediately and use `git filter-branch` or BFG Repo-Cleaner to remove from history.

---

## Branch Naming (Required)

```bash
feature/short-description     # New features (something net-new)
enhancement/short-description # Improvements to existing surfaces — polish, refinements, cross-cutting fixes, copy/design tweaks
bugfix/short-description      # Bug fixes (a specific defect)
hotfix/short-description      # Urgent production fixes
```

**When to choose `enhancement/` over `feature/` or `bugfix/`:**

- The change improves an existing surface rather than adding a new one (e.g., color/copy/alignment polish across one page).
- The session bundles several small related improvements that aren't tied to one specific defect.
- It's not a net-new feature but is more substantive than a single bugfix.

**Examples:**

- `feature/user-authentication`
- `enhancement/models-catalog` (polish across the Models catalog page)
- `bugfix/login-redirect-loop`
- `hotfix/critical-security-patch`

### Branch Lifecycle

- **Cut every new branch from `main` at its current HEAD.** Never branch off another feature branch — it muddles ownership, creates merge ambiguity, and pollutes the PR with another topic's commits.
- **One topic per branch.** Don't add unrelated work to an existing branch — start a new one.
- **Use a worktree per topic** to enforce isolation structurally: `git worktree add -b <prefix>/<topic> .claude/worktrees/<topic> main`. Each topic lives in its own directory; cross-topic file mixing becomes mechanically harder. Prune after merge: `git worktree remove .claude/worktrees/<topic>`.
- **Before opening a PR**, rebase or merge `main` if it has moved (CI will reject stale branches).
- **After merge**, delete both remote (`--delete-branch`) and local (`git branch -D <branch>`), and remove the worktree (`git worktree remove .claude/worktrees/<topic>`). **This applies regardless of who performed the merge** — release-manager, GitHub UI, `gh` CLI directly. The local branch and worktree are stale the moment the PR squashes.
- **Prune stale local state regularly.** Local branches and worktrees whose PRs are already merged are noise that compounds across sessions. `release-manager` ships a "Prune Merged Branches" mode that cross-references local branches against merged PRs on `main` and force-deletes the orphans (plus their worktrees). Run it when the local branch list grows unwieldy, or invoke it as part of the branch-from-main flow.

---

## Commit Message Format (Required)

Use [Conventional Commits](https://www.conventionalcommits.org/) with **required Claude Code footer**.

**Scope is REQUIRED** (except `merge:` type). Use the primary area of change (e.g., `docs`, `auth`, `ui`, `deps`).

```
type(scope): Short description (max 72 chars)

Optional body explaining why (not what).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types (Enforced)

| Type       | When to Use                             | Example                                   |
| ---------- | --------------------------------------- | ----------------------------------------- |
| `feat`     | New feature                             | `feat(auth): add JWT authentication`      |
| `fix`      | Bug fix                                 | `fix(login): resolve redirect loop`       |
| `docs`     | Documentation changes                   | `docs(readme): update setup instructions` |
| `style`    | Code formatting, no logic changes       | `style(components): fix indentation`      |
| `refactor` | Code refactoring                        | `refactor(api): simplify error handling`  |
| `test`     | Adding or updating tests                | `test(auth): add login flow tests`        |
| `chore`    | Maintenance tasks, dependencies, config | `chore(deps): update react to 18.3`       |
| `merge`    | Merging branches                        | `merge: feature/auth into main`           |

---

## Push Strategy (Required)

- **Never push to main directly.** All changes reach `main` via PR (no exceptions). See § Merge Strategy for how merges are performed.
- **Feature branches:** auto-push after commit.
- **CI checks** must pass before a PR is merged.

---

## Reporting to Human (Required)

**All agents performing git operations MUST report actions explicitly:**

**Push actions:**

- **PUSHED:** "PUSHED to [branch]" or "PUSHED to origin/[branch]"
- **NOT PUSHED:** "COMMITTED (not pushed)" or "COMMITTED ONLY (not pushed)"

**Include in report:**

- Files changed (count or list)
- Commit hash (short form)
- Remote impact (pushed to origin or local only)
- Branch name

**Example:**

```
PUSHED to origin/main
- Commit: abc1234
- Files: 3 (auth.ts, login.tsx, README.md)
- Impact: Remote repository updated
```

---

## PR Requirements

- Summary, Why, Test Plan, Screenshots
- Rollback plan documented
- Test coverage checked
- Performance impact assessed
- Deployment notes included

---

## Merge Strategy (Required)

**Squash merge is the default for all PRs to main.** Override only when the caller explicitly says so.

- **Command:** `gh pr merge <number> --squash --delete-branch` — squashes the PR's commits into a single commit on `main` and deletes the remote branch in the same call.
- **Resulting commit message:** GitHub uses the PR title + body as the squash commit message.
- **Post-merge sync:** check out `main`, `git pull origin main`, then force-delete each merged local branch (`git branch -D <branch>`). Force-delete is required because squash merge produces a different SHA, so `git branch -d` reports "not fully merged" and refuses.
- **Why squash:** keeps `main` history one-commit-per-PR — clean to read, easy to revert, no fixup-noise from the feature branch.
- **When to override:** only on explicit operator request (e.g., merge commit to preserve branch history, or rebase to keep individual commits). Never deviate silently.

---

**Note:** This is a living document. Update as conventions evolve.
