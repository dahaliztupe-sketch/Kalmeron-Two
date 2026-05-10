#!/usr/bin/env bash
# OpenWolf Pre-Commit Hook
# Runs quality gates before allowing a commit.
# Install: cp .wolf/hooks/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

set -euo pipefail

echo "▶ OpenWolf pre-commit checks..."

# ── TypeScript check ───────────────────────────────────────────────────────
echo "  Running TypeScript check..."
if ! npx tsc --noEmit --quiet 2>/dev/null; then
  echo "❌ TypeScript errors detected. Run: npx tsc --noEmit"
  exit 1
fi
echo "  ✅ TypeScript: OK"

# ── Check for hardcoded Arabic text in JSX ────────────────────────────────
echo "  Checking for hardcoded Arabic text..."
ARABIC_IN_JSX=$(grep -rn --include="*.tsx" '[أ-يءؤإآ]' \
  app/ components/ 2>/dev/null \
  | grep -v "node_modules" \
  | grep -v ".test." \
  | grep -v "useTranslations\|getTranslations\|t(\|// " \
  | head -5 || true)

if [ -n "$ARABIC_IN_JSX" ]; then
  echo "  ⚠️  WARNING: Hardcoded Arabic text found in JSX (first 5):"
  echo "$ARABIC_IN_JSX"
  echo "  Use t('key') from useTranslations() instead. Blocking commit."
  exit 1
fi
echo "  ✅ i18n: No hardcoded Arabic text in JSX"

# ── Check for duplicate route risk ────────────────────────────────────────
echo "  Checking for route conflicts..."
CONFLICT_ROUTES=$(find app -name "page.tsx" -path "*dashboard*" | while read f; do
  ROUTE=$(dirname "$f" | sed 's|app/(dashboard)||g' | sed 's|app||g')
  ROOT_PAGE="app$ROUTE/page.tsx"
  if [ -f "$ROOT_PAGE" ] && [ "$f" != "$ROOT_PAGE" ]; then
    echo "CONFLICT: $f <-> $ROOT_PAGE"
  fi
done)
if [ -n "$CONFLICT_ROUTES" ]; then
  echo "  ❌ Route conflict detected:"
  echo "$CONFLICT_ROUTES"
  exit 1
fi
echo "  ✅ Routes: No conflicts"

echo "▶ All pre-commit checks passed ✅"
