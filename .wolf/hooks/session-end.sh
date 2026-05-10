#!/usr/bin/env bash
# OpenWolf Session End Hook
# Run at the end of a session to capture learnings.
# Usage: bash .wolf/hooks/session-end.sh "What was accomplished"
#
# Prompts for new learnings and appends them to cerebrum.md.

set -euo pipefail

WOLF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CEREBRUM="$WOLF_DIR/cerebrum.md"
BUGLOG="$WOLF_DIR/buglog.json"

echo "╔══════════════════════════════════════════════════╗"
echo "║     OpenWolf Session End — Capture Learnings     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

SESSION_DATE=$(date -u +%Y-%m-%d)
SUMMARY="${1:-No summary provided}"

echo "▶ Session summary: $SUMMARY"
echo ""
echo "▶ Updating cerebrum.md with session metadata..."

# Append session log to cerebrum.md
cat >> "$CEREBRUM" << EOF

---
## Session Log — $SESSION_DATE
**Summary**: $SUMMARY
**Files modified**: (add manually if significant structural changes made)
**New learnings**: (add manually if new patterns discovered)
EOF

echo "✅ Cerebrum updated at: $CEREBRUM"
echo ""
echo "▶ Reminders for next session:"
echo "  - If you found a new bug pattern, add it to: $BUGLOG"
echo "  - If you changed project structure, update: $WOLF_DIR/anatomy.md"
echo "  - If you established a new code pattern, add it to: $CEREBRUM"
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Commit .wolf/anatomy.md + cerebrum.md + buglog  ║"
echo "╚══════════════════════════════════════════════════╝"
