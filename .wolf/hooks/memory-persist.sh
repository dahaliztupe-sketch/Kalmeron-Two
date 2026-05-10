#!/usr/bin/env bash
# OpenWolf Memory Persistence Hook
# Updates cerebrum.md with a new learning entry.
# Usage: bash .wolf/hooks/memory-persist.sh "Learning title" "Learning body"
#
# Called by the agent at the end of a significant work session.

set -euo pipefail

WOLF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CEREBRUM="$WOLF_DIR/cerebrum.md"

TITLE="${1:-New Learning}"
BODY="${2:-Add details here}"
DATE=$(date -u +%Y-%m-%d)

# Count existing learnings
COUNT=$(grep -c "^### [0-9]" "$CEREBRUM" 2>/dev/null || echo "0")
NEXT=$((COUNT + 1))

cat >> "$CEREBRUM" << EOF

---

### $NEXT. $TITLE
**القرار/الاكتشاف**: $BODY
**مكتشَف في**: $DATE
EOF

echo "✅ Learning #$NEXT appended to cerebrum.md"
echo "   Title: $TITLE"
echo "   File: $CEREBRUM"
