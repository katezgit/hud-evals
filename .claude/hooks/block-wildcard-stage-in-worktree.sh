#!/bin/bash
# PreToolUse hook: block wildcard `git add` inside a worktree.
#
# Context: the return protocol requires agents to stage only the files their
# task produced. `git add -A`, `git add .`, and `git add --all` pick up
# scratch files, logs, and editor temporaries — anything in the working tree.
# A stray file committed and merged into main then requires a follow-up
# cleanup commit (or silently pollutes history).
#
# Policy (PreToolUse on Bash):
#   - caller cwd is inside .claude/worktrees/agent-*  AND
#   - command matches `git add -A`, `git add .`, or `git add --all`
#   → reject with exit 2 + instructions to stage specific files.
#
# Passes through in all other cases (staging named files, non-worktree cwd).

set -eo pipefail

MAIN_ROOT="/Users/kate/2026/oak/oak"
WORKTREES_PREFIX="${MAIN_ROOT}/.claude/worktrees/"
LOG="/tmp/claude/wildcard-stage-hook.log"

input="$(cat)"

tool_name="$(jq -r '.tool_name // empty' <<<"$input")"
[[ "$tool_name" == "Bash" ]] || exit 0

cwd="$(jq -r '.cwd // empty' <<<"$input")"
[[ "$cwd" == "$WORKTREES_PREFIX"* ]] || exit 0

command="$(jq -r '.tool_input.command // empty' <<<"$input")"
[[ -n "$command" ]] || exit 0

is_wildcard=0
# Match: git add -A | git add . | git add --all
# Allow: git add src/foo.ts (specific file), git add -p (interactive patch)
if [[ "$command" =~ (^|[[:space:]|;])git[[:space:]]+add[[:space:]]+(-A|--all|\.)([[:space:]]|$) ]]; then
  is_wildcard=1
fi

[[ "$is_wildcard" -eq 1 ]] || exit 0

mkdir -p "$(dirname "$LOG")" 2>/dev/null || true
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] BLOCK cwd=$cwd command=$command" >> "$LOG" 2>/dev/null || true

cat >&2 <<EOF
wildcard git add blocked inside worktree.

  cwd:     $cwd
  command: $command

Rule: inside a worktree, stage only the files your task produced.
Wildcard add picks up scratch files, logs, and editor temporaries that must
not enter the merge commit.

Fix: name the files explicitly:

  git add apps/web/app/foo/bar.tsx packages/ui/src/baz.ts

To see what's changed:
  git status
  git diff --stat
EOF
exit 2
