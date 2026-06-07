#!/bin/bash
# PreToolUse hook: block bash commands that move files from a worktree into
# main without going through `git merge`.
#
# Context: the return protocol (.claude/workflows/worktree-return-protocol.md)
# mandates `git merge --no-commit --no-ff worktree-agent-<id>` to land work.
# Direct transfer (cp / mv / rsync / git apply on a worktree diff) bypasses
# git's 3-way merge — if a parallel session has touched the same file, the
# transfer silently overwrites their edits with no conflict surface.
#
# Past incident 2026-04-23: a parallel session cp'd a stale log-time-dialog.tsx
# from its worktree over a just-committed token fix in main, reverting the fix
# silently. The return protocol was already in place; enforcement was not.
#
# Policy (PreToolUse on Bash):
#   - First word of command is cp / mv / rsync / install (optionally behind
#     `sudo`), OR command opens with `git apply`, AND
#   - command references ".claude/worktrees/",
#   → reject with exit 2 + instructions to use `git merge --no-commit --no-ff`.
#
# Matching the first word only (not anywhere in the string) avoids false
# positives when the worktree path or the word "cp" appears inside a quoted
# string — e.g. `git commit -m "don't cp from .claude/worktrees/"`.
#
# Passes through in all other cases (ls, cat for display, git log/diff, etc.).

set -eo pipefail

LOG="/tmp/claude/worktree-transfer-hook.log"

input="$(cat)"

tool_name="$(jq -r '.tool_name // empty' <<<"$input")"
[[ "$tool_name" == "Bash" ]] || exit 0

command="$(jq -r '.tool_input.command // empty' <<<"$input")"
[[ -n "$command" ]] || exit 0

# Must reference a worktree path somewhere.
[[ "$command" == *".claude/worktrees/"* ]] || exit 0

# Extract the invoked command name (skip a leading `sudo`).
read -r first second _rest <<<"$command"
if [[ "$first" == "sudo" ]]; then
  first="$second"
  second="$(echo "$command" | awk '{print $3}')"
fi

is_transfer=0
case "$first" in
  cp|mv|rsync|install) is_transfer=1 ;;
  git) [[ "$second" == "apply" ]] && is_transfer=1 ;;
esac

if [[ "$is_transfer" -eq 1 ]]; then
  mkdir -p "$(dirname "$LOG")" 2>/dev/null || true
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] BLOCK command=$command" >> "$LOG" 2>/dev/null || true
  cat >&2 <<EOF
worktree-to-main transfer blocked.

  command: $command

Rule: direct file transfer from a worktree to main bypasses git's 3-way merge.
If another session has also edited the same file, the transfer silently
overwrites their edits — no conflict, no warning.

Fix: land worktree work via git merge, per
.claude/workflows/worktree-return-protocol.md:

  git merge --no-commit --no-ff worktree-agent-<id>
  # resolve any conflicts
  ./reload.sh                        # load for Kate's browser verify
  git commit -m "<merge-message>"    # only after Kate confirms
  git worktree remove -f .claude/worktrees/agent-<id>
  git branch -d worktree-agent-<id>
EOF
  exit 2
fi

exit 0
