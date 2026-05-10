#!/usr/bin/env bash
# OpenWolf Learn-From-Error Hook
# Adds a new bug/learning to buglog.json
# Usage: bash .wolf/hooks/learn-from-error.sh
#
# Interactive: prompts for bug details and appends to buglog.json

set -euo pipefail

WOLF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUGLOG="$WOLF_DIR/buglog.json"

if [ ! -f "$BUGLOG" ]; then
  echo '{"version":"1.0","project":"kalmeron-ai","bugs":[]}' > "$BUGLOG"
fi

echo "╔══════════════════════════════════════════════════╗"
echo "║   OpenWolf — Log New Bug/Learning               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Get current bug count for ID
COUNT=$(python3 -c "
import json
with open('$BUGLOG') as f:
    d = json.load(f)
print(len(d.get('bugs', [])) + 1)
" 2>/dev/null || echo "99")

read -p "Bug ID (default: BUG-$(printf '%03d' $COUNT)): " BUG_ID
BUG_ID="${BUG_ID:-BUG-$(printf '%03d' $COUNT)}"

read -p "Title (short description): " TITLE
read -p "Severity (critical/high/medium/low): " SEVERITY
read -p "Status (open/resolved/pattern): " STATUS
read -p "File(s) affected: " FILE
read -p "One-sentence lesson learned: " LESSON

DATE=$(date -u +%Y-%m-%d)

python3 << PYEOF
import json

with open('$BUGLOG') as f:
    data = json.load(f)

data['bugs'].append({
    'id': '$BUG_ID',
    'title': '$TITLE',
    'severity': '$SEVERITY',
    'status': '$STATUS',
    'discoveredAt': '$DATE',
    'file': '$FILE',
    'lesson': '$LESSON'
})

data['lastUpdated'] = '$DATE'

with open('$BUGLOG', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF

echo ""
echo "✅ Bug logged to: $BUGLOG"
echo ""
echo "Next steps:"
echo "  - git add .wolf/buglog.json"
echo "  - If this is a pattern, also update .wolf/cerebrum.md"
