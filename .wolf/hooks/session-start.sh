#!/usr/bin/env bash
# OpenWolf Session Start Hook
# Run at the beginning of every Claude Code session to orient quickly.
# Usage: bash .wolf/hooks/session-start.sh
#
# This hook saves ~30K tokens per session by surfacing the project map
# and accumulated knowledge before any file exploration.

set -euo pipefail

WOLF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ROOT="$(cd "$WOLF_DIR/.." && pwd)"
LEDGER="$WOLF_DIR/token-ledger.json"

echo "╔══════════════════════════════════════════════════╗"
echo "║     OpenWolf Session Start — Kalmeron AI         ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "📅 Session: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# ── Step 1: Show quick project orientation ────────────────────────────────
echo "▶ QUICK ORIENTATION (from anatomy.md):"
echo "  App: Next.js 16 + Firebase + Gemini AI | Port: 5000"
echo "  Routes: app/(dashboard)/* + app/operations/, market-lab/, investor-deck/"
echo "  Skills: $(find "$PROJECT_ROOT/.agents/skills" -name "SKILL.md" 2>/dev/null | wc -l) installed"
echo "  Agents: 34 (registry: src/lib/agent-skills/registry.ts)"
echo ""

# ── Step 2: Surface recent bugs to prevent repetition ─────────────────────
echo "▶ RECENT BUGS (from buglog.json — don't repeat these):"
if [ -f "$WOLF_DIR/buglog.json" ]; then
  # Show last 3 unresolved or pattern bugs
  python3 -c "
import json, sys
with open('$WOLF_DIR/buglog.json') as f:
    data = json.load(f)
bugs = [b for b in data.get('bugs', []) if b.get('status') in ('open', 'pattern')]
for b in bugs[-3:]:
    print(f'  [{b[\"severity\"].upper()}] {b[\"id\"]}: {b[\"title\"]}')
    print(f'    → Lesson: {b.get(\"lesson\", \"see buglog.json\")}')
" 2>/dev/null || echo "  (install python3 or check .wolf/buglog.json manually)"
fi
echo ""

# ── Step 3: Token budget status ────────────────────────────────────────────
echo "▶ TOKEN BUDGET:"
SKILL_COUNT=$(find "$PROJECT_ROOT/.agents/skills" -name "SKILL.md" 2>/dev/null | wc -l)
SRC_FILES=$(find "$PROJECT_ROOT/app" "$PROJECT_ROOT/components" "$PROJECT_ROOT/src" \
  -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
echo "  Skills: $SKILL_COUNT SKILL.md files"
echo "  Source: $SRC_FILES TypeScript files"
echo "  Tip: Read CLAUDE.md + anatomy.md FIRST to save ~30K tokens"
echo ""

# ── Step 4: Critical rules reminder ───────────────────────────────────────
echo "▶ CRITICAL RULES (never violate):"
echo "  1. All visible text via t() from useTranslations() — never hardcode Arabic"
echo "  2. Firestore queries: always .where('userId','==',session.user.id) + .limit()"
echo "  3. npx tsc --noEmit must exit 0 before any commit"
echo "  4. Duplicate routes: check if page exists in app/ before creating in app/(dashboard)/"
echo "  5. npm install for sandbox deps: inside artifacts/mockup-sandbox/ ONLY"
echo ""

# ── Step 5: Update session ledger ─────────────────────────────────────────
if [ -f "$LEDGER" ]; then
  SESSION_DATE=$(date -u +%Y-%m-%d)
  python3 -c "
import json
with open('$LEDGER') as f:
    data = json.load(f)
data.setdefault('sessions', []).append({
  'date': '$SESSION_DATE',
  'sessionId': 'session-$(date +%s)',
  'tokensEstimated': 0,
  'tokensActual': None,
  'note': 'Session started via hook'
})
with open('$LEDGER', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
" 2>/dev/null || true
fi

echo "╔══════════════════════════════════════════════════╗"
echo "║  Read CLAUDE.md → anatomy.md → cerebrum.md now  ║"
echo "╚══════════════════════════════════════════════════╝"
