#!/bin/bash
# Stop hook: warn the orchestrator (main thread) about leftover agent
# worktrees that should have been torn down after merge.
#
# Per CLAUDE.md → "Parallel Work" → worktree return protocol:
# after `git merge --no-ff worktree-agent-<id>`, the orchestrator must also
#   git worktree remove -f .claude/worktrees/agent-<id>
#   git branch -D worktree-agent-<id>
#
# Reminders/memory don't reliably catch this. This hook does.
#
# Behavior:
#   - Only fires from the main checkout (repo toplevel == MAIN_ROOT).
#     Sub-agent sessions running inside worktrees are silently skipped.
#   - Lists every worktree whose path contains .claude/worktrees/agent-.
#   - Exit 2 with a stderr block that lists each dangling path + branch
#     and the exact cleanup command. Stop-hook exit 2 surfaces stderr
#     back to the model without blocking the user.
#   - Exit 0 silently when nothing is dangling.

set -eo pipefail

MAIN_ROOT="/Users/kate/2026/oak/oak"

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
[ "$REPO_ROOT" = "$MAIN_ROOT" ] || exit 0

# Read hook input JSON from stdin. If stop_hook_active=true, we're already in
# a loop — the model has seen the warning once and can't clean up. Let it stop
# to avoid an infinite block.
input="$(cat 2>/dev/null || true)"
if echo "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# Per-session acknowledgment: once a worktree has been reported in this
# Claude session, don't re-nag on every subsequent turn. The model has
# already seen it — either it's theirs to clean up (and they will) or it
# belongs to a parallel session (and they shouldn't touch it).
session_id="$(printf '%s' "$input" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')"
ack_file=""
if [ -n "$session_id" ]; then
  ack_dir="${MAIN_ROOT}/.claude/worktrees/.ack"
  mkdir -p "$ack_dir" 2>/dev/null || true
  ack_file="${ack_dir}/${session_id}.txt"
  [ -f "$ack_file" ] || : > "$ack_file"
fi

dangling=""
new_paths=""
current_path=""
current_branch=""

while IFS= read -r line; do
  case "$line" in
    "worktree "*)
      current_path="${line#worktree }"
      current_branch=""
      ;;
    "branch "*)
      current_branch="${line#branch refs/heads/}"
      ;;
    "")
      if [[ "$current_path" == *"/.claude/worktrees/agent-"* ]]; then
        already_acked=0
        if [ -n "$ack_file" ] && grep -Fxq "$current_path" "$ack_file" 2>/dev/null; then
          already_acked=1
        fi
        if [ "$already_acked" = "0" ]; then
          short_path="${current_path#${MAIN_ROOT}/}"
          dangling+="  ${short_path}  [${current_branch}]"$'\n'
          new_paths+="$current_path"$'\n'
        fi
      fi
      current_path=""
      current_branch=""
      ;;
  esac
done < <(git worktree list --porcelain; echo "")

[ -z "$dangling" ] && exit 0

# Record newly-reported paths so we don't nag again this session.
if [ -n "$ack_file" ] && [ -n "$new_paths" ]; then
  printf '%s' "$new_paths" >> "$ack_file"
fi

cat >&2 <<EOF
Dangling agent worktree(s):
${dangling}
If this session spawned it: git worktree remove -f <path> && git branch -D <branch>
Otherwise leave it — parallel sessions may still be using it.
EOF
exit 2
