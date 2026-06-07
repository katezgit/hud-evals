#!/bin/bash
# SessionStart hook: register this Claude session in the in-flight registry.
# Sweeps dead rows (pid no longer alive), then appends a row for this session.
# See CLAUDE.md → "Parallel Work".

set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
FILE="$REPO_ROOT/.state/in-flight-work.md"
START_MARK="<!-- in-flight-rows-start -->"
END_MARK="<!-- in-flight-rows-end -->"

SESSION_PID="${CLAUDE_SESSION_ID:-$PPID}"
CWD="$(pwd)"
BRANCH="$(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo '-')"
WORKTREE="main"
if [[ "$CWD" == *"/.claude/worktrees/"* ]]; then
  WORKTREE="$(echo "$CWD" | sed -E 's|.*/\.claude/worktrees/([^/]+).*|\1|')"
fi
STARTED="$(date -u +%Y-%m-%dT%H:%MZ)"

# Bootstrap if missing
mkdir -p "$(dirname "$FILE")"
if [ ! -f "$FILE" ]; then
  cat > "$FILE" <<EOF
# In-Flight Work (live session registry)

Auto-maintained by \`.claude/hooks/in-flight-{register,unregister}.sh\`.
Gitignored — this is live session state, not project history.

Dead rows (pid no longer alive) are swept on every SessionStart.

$START_MARK
| pid | cwd | branch | worktree | started | paths |
| --- | --- | --- | --- | --- | --- |
$END_MARK

When you start substantive work, edit the \`paths\` column of your row so other sessions can see overlap (e.g. \`apps/server/src/services/schedule/**\`).
EOF
fi

TMP="$FILE.tmp.$$"
trap 'rm -f "$TMP"' EXIT

# Phase 1: sweep dead and self rows (idempotent re-registration)
awk -v start="$START_MARK" -v end="$END_MARK" -v self="$SESSION_PID" '
  BEGIN { in_block = 0; hdr = 0 }
  {
    if ($0 == start) { print; in_block = 1; hdr = 0; next }
    if ($0 == end)   { print; in_block = 0; next }
    if (in_block) {
      if (hdr < 2) { print; hdr++; next }
      split($0, f, "|")
      pid = f[2]; gsub(/^ +| +$/, "", pid)
      if (pid == self) next
      if (system("kill -0 " pid " 2>/dev/null") == 0) print
      next
    }
    print
  }
' "$FILE" > "$TMP"

# Phase 2: insert our row before the end marker
ROW="| $SESSION_PID | $CWD | $BRANCH | $WORKTREE | $STARTED | _tbd_ |"
awk -v end="$END_MARK" -v row="$ROW" '
  $0 == end { print row }
  { print }
' "$TMP" > "$FILE"

# Overlap warning — same cwd+branch already claimed by a different live session
DUPS="$(grep -cF " | $CWD | $BRANCH | " "$FILE" 2>/dev/null || echo 0)"
if [ "${DUPS:-0}" -gt 1 ]; then
  echo "⚠️  Another Claude session is already in $CWD on branch $BRANCH." >&2
  echo "    See .state/in-flight-work.md — consider spawning a worktree." >&2
fi
