#!/bin/bash
# Stop hook: remove this session's row from the in-flight registry.
# See CLAUDE.md → "Parallel Work".

set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
FILE="$REPO_ROOT/.state/in-flight-work.md"
[ -f "$FILE" ] || exit 0

SESSION_PID="${CLAUDE_SESSION_ID:-$PPID}"
START_MARK="<!-- in-flight-rows-start -->"
END_MARK="<!-- in-flight-rows-end -->"

TMP="$FILE.tmp.$$"
trap 'rm -f "$TMP"' EXIT
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
      print
      next
    }
    print
  }
' "$FILE" > "$TMP"
mv "$TMP" "$FILE"
