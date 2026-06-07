#!/usr/bin/env bash
# Remove agent worktrees locked by THIS session's claude process.
# Walks up the caller's process tree to find the top-level `claude` PID,
# then force-removes any `.claude/worktrees/agent-*` whose lock-file
# names that PID. Fail-safe: if the PID can't be resolved, exits 0
# without touching anything.
set -u

pid=$PPID
claude_pid=""
while [ -n "$pid" ] && [ "$pid" != "1" ]; do
  if [ "$(ps -o comm= -p "$pid" 2>/dev/null | tr -d ' ')" = "claude" ]; then
    claude_pid="$pid"
    break
  fi
  pid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')
done

[ -z "$claude_pid" ] && exit 0

removed=0
for wt in .claude/worktrees/agent-*; do
  [ -d "$wt" ] || continue
  lock=".git/worktrees/$(basename "$wt")/locked"
  if [ -f "$lock" ] && grep -q "pid $claude_pid\b" "$lock"; then
    branch="worktree-$(basename "$wt")"
    if git worktree remove -f -f "$wt" >/dev/null 2>&1; then
      git branch -D "$branch" >/dev/null 2>&1 || true
      removed=$((removed + 1))
    fi
  fi
done

[ "$removed" -gt 0 ] && echo "Cleaned $removed session worktree(s)"
exit 0
