#!/bin/bash
# PreToolUse hook: block atomic `git merge` of a worktree branch.
#
# Context: the return protocol mandates `git merge --no-commit --no-ff
# worktree-agent-<id>` so the merge can be verified in the browser before the
# commit is sealed. An atomic merge (no --no-commit flag) commits before any
# UI surface loads — if it's broken, the only exit is `git revert` (ugly
# history) instead of `git merge --abort` (clean exit).
#
# Past incident 2026-04-23: debug-content.tsx split merged atomically before
# reload; Kate had to trust reviewer PASS instead of seeing the page render.
#
# Policy (PreToolUse on Bash):
#   - command contains `git merge`  AND
#   - command references a worktree-agent-* branch  AND
#   - command does NOT contain --no-commit
#   → reject with exit 2 + the correct form.
#
# Passes through in all other cases (non-worktree merges, --no-commit present).

set -eo pipefail

LOG="/tmp/claude/atomic-merge-hook.log"

input="$(cat)"

tool_name="$(jq -r '.tool_name // empty' <<<"$input")"
[[ "$tool_name" == "Bash" ]] || exit 0

command="$(jq -r '.tool_input.command // empty' <<<"$input")"
[[ -n "$command" ]] || exit 0

# Must be a git merge targeting a worktree-agent branch.
[[ "$command" == *"git merge"* ]] || exit 0
[[ "$command" == *"worktree-agent-"* ]] || exit 0

# Already safe if --no-commit is present.
[[ "$command" == *"--no-commit"* ]] && exit 0

mkdir -p "$(dirname "$LOG")" 2>/dev/null || true
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] BLOCK command=$command" >> "$LOG" 2>/dev/null || true

cat >&2 <<EOF
atomic worktree merge blocked.

  command: $command

Rule: merging a worktree branch without --no-commit creates the commit before
anything loads in the browser. If the merge breaks the page, the only exit is
git revert (extra commit in history). With --no-commit the staged merge can be
wiped cleanly via git merge --abort if the Operator rejects after browser verify.

Fix — per .claude/workflows/worktree-return-protocol.md:

  git merge --no-commit --no-ff worktree-agent-<id>
  # resolve any conflicts; Next.js fast-refresh picks up staged files automatically
  git commit -m "<merge-message>"    # only after Operator confirms
  git worktree remove -f .claude/worktrees/agent-<id>
  git branch -d worktree-agent-<id>
EOF
exit 2
