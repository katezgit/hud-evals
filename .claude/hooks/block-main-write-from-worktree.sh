#!/bin/bash
# PreToolUse hook: prevent a sub-agent running in a worktree from mutating
# files in the main checkout via absolute paths.
#
# Context: agents with `isolation: worktree` in their frontmatter are placed
# in .claude/worktrees/agent-*/ — isolated at the cwd layer. But Edit/Write
# tools accept absolute paths, and an absolute path like
# /Users/kate/2026/oak/oak/apps/server/foo.ts bypasses the worktree and writes
# to main. This hook blocks that leak at the tool boundary.
#
# Policy:
#   - If caller cwd is inside .claude/worktrees/agent-*/  AND
#   - tool is Edit / Write / MultiEdit / NotebookEdit      AND
#   - target file_path points at the main checkout root (not its worktree),
#   → reject with exit code 2 and a message explaining the fix.
#
# Passes through in all other cases.

set -eo pipefail

MAIN_ROOT="/Users/kate/2026/oak/oak"
WORKTREES_PREFIX="${MAIN_ROOT}/.claude/worktrees/"
LOG="/tmp/claude/worktree-hook.log"

input="$(cat)"

tool_name="$(jq -r '.tool_name // empty' <<<"$input")"
cwd="$(jq -r '.cwd // empty' <<<"$input")"

case "$tool_name" in
  Edit|Write|MultiEdit|NotebookEdit) ;;
  *) exit 0 ;;
esac

# Only enforce when the caller is inside a worktree.
[[ "$cwd" == "$WORKTREES_PREFIX"* ]] || exit 0

file_path="$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")"
[[ -n "$file_path" ]] || exit 0

# Allow: path lives under the caller's own worktree (or any worktree).
# Block: absolute path points at the main checkout outside of worktrees.
if [[ "$file_path" == "$MAIN_ROOT"* && "$file_path" != "$WORKTREES_PREFIX"* ]]; then
  mkdir -p "$(dirname "$LOG")" 2>/dev/null || true
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] BLOCK tool=$tool_name cwd=$cwd target=$file_path" >> "$LOG" 2>/dev/null || true
  cat >&2 <<EOF
worktree leak blocked: $tool_name would write to the main checkout from a worktree cwd.

  cwd:    $cwd
  target: $file_path

Rule: while inside .claude/worktrees/agent-*, never use absolute paths starting with
$MAIN_ROOT — they resolve to the main checkout and bypass your worktree.

Fix: use a path relative to your cwd (e.g. apps/server/foo.ts), or prefix with your
own worktree root:
  $cwd/apps/server/foo.ts
EOF
  exit 2
fi

exit 0
