#!/usr/bin/env bash
# OpenWolf Anatomy Scanner
# Regenerates token estimates in anatomy.md based on current codebase.
# Usage: bash .wolf/hooks/scan-anatomy.sh
#
# Run after significant structural changes to keep anatomy.md accurate.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ANATOMY="$(dirname "${BASH_SOURCE[0]}")/../anatomy.md"

echo "▶ OpenWolf Anatomy Scanner — Kalmeron AI"
echo "  Project root: $PROJECT_ROOT"
echo ""

# Count files and estimate tokens by directory
count_and_estimate() {
  local dir="$1"
  local label="$2"
  if [ -d "$PROJECT_ROOT/$dir" ]; then
    local files=$(find "$PROJECT_ROOT/$dir" -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" 2>/dev/null | wc -l)
    local bytes=$(find "$PROJECT_ROOT/$dir" -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" 2>/dev/null \
      -exec cat {} \; 2>/dev/null | wc -c)
    local tokens=$((bytes / 4))
    echo "  $label: $files files, ~${tokens} tokens"
  fi
}

echo "▶ Current estimates:"
count_and_estimate "app" "app/"
count_and_estimate "components" "components/"
count_and_estimate "src" "src/"
count_and_estimate "messages" "messages/"
count_and_estimate ".agents/skills" ".agents/skills/"
count_and_estimate ".github/workflows" ".github/workflows/"

TOTAL_FILES=$(find "$PROJECT_ROOT" \
  -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) \
  2>/dev/null | wc -l)
SKILL_COUNT=$(find "$PROJECT_ROOT/.agents/skills" -name "SKILL.md" 2>/dev/null | wc -l)

echo ""
echo "  Total tracked files: $TOTAL_FILES"
echo "  Skills installed: $SKILL_COUNT"
echo ""
echo "▶ Update .wolf/anatomy.md manually with above numbers if significantly changed."
echo "  The anatomy file is a curated map — not auto-generated."
echo ""
echo "✅ Scan complete. Review numbers above and update anatomy.md if needed."
