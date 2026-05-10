#!/usr/bin/env bash
# scripts/gnhf-kalmeron.sh
# سكريبت مساعد لتشغيل مهام gnhf الليلية الشائعة في مشروع Kalmeron
# الاستخدام: bash scripts/gnhf-kalmeron.sh <اسم_المهمة>
# مثال:     bash scripts/gnhf-kalmeron.sh fix-typescript

set -euo pipefail

# ── التحقق من تثبيت gnhf ──────────────────────────────────────────────────
if ! command -v gnhf &>/dev/null; then
  if npx --yes gnhf --version &>/dev/null 2>&1; then
    echo "⚠️  gnhf غير مثبت عالمياً — سيُستخدم npx كبديل"
    gnhf() { npx gnhf "$@"; }
  else
    echo "❌ gnhf غير متاح. شغّل: npm run gnhf:setup"
    exit 1
  fi
fi

# ── المتغيرات المشتركة ────────────────────────────────────────────────────
AGENT="${GNHF_AGENT:-claude}"
PREVENT_SLEEP="on"

echo "🌙 Kalmeron GNHF Runner — الوكيل: $AGENT"
echo "──────────────────────────────────────────"

# ════════════════════════════════════════════════════════════════════════════
# المهمة 1: إصلاح أخطاء TypeScript
# ════════════════════════════════════════════════════════════════════════════
task_fix_typescript() {
  echo "▶ تشغيل: إصلاح أخطاء TypeScript"
  gnhf \
    --agent "$AGENT" \
    --max-iterations 15 \
    --stop-when "npx tsc --noEmit exits with 0 errors" \
    --prevent-sleep "$PREVENT_SLEEP" \
    "Fix all TypeScript errors in this Kalmeron Next.js 16 project.

Rules:
- Run: npm run typecheck after each fix batch to measure progress.
- Do NOT change business logic, UI behavior, or API contracts.
- Do NOT add 'any' casts as a shortcut — fix the types properly.
- Prioritize errors in app/ and components/ first, then src/lib/ and src/ai/.
- Commit after each file or logical group of fixes.

Stop only when: npm run typecheck exits with zero errors and zero warnings."
}

# ════════════════════════════════════════════════════════════════════════════
# المهمة 2: إصلاح تحذيرات ESLint
# ════════════════════════════════════════════════════════════════════════════
task_fix_lint() {
  echo "▶ تشغيل: إصلاح تحذيرات ESLint"
  gnhf \
    --agent "$AGENT" \
    --max-iterations 12 \
    --stop-when "npm run lint exits with 0 errors and 0 warnings" \
    --prevent-sleep "$PREVENT_SLEEP" \
    "Fix all ESLint errors and warnings in this Kalmeron project.

Rules:
- Run: npm run lint after each fix to measure progress.
- The lint script uses --max-warnings=0, so ALL warnings must be fixed.
- Do NOT disable rules with eslint-disable comments unless absolutely necessary.
- Prefer fixing the root cause over suppression.
- Commit after each logical group of fixes.

Stop only when: npm run lint exits with 0 errors and 0 warnings."
}

# ════════════════════════════════════════════════════════════════════════════
# المهمة 3: إضافة مفاتيح i18n المفقودة
# ════════════════════════════════════════════════════════════════════════════
task_i18n_sync() {
  echo "▶ تشغيل: مزامنة مفاتيح i18n"
  gnhf \
    --agent "$AGENT" \
    --max-iterations 20 \
    --stop-when "messages/ar.json and messages/en.json have identical key sets with no missing translations" \
    --prevent-sleep "$PREVENT_SLEEP" \
    "Sync i18n translation keys between messages/ar.json and messages/en.json in this Kalmeron project.

Rules:
- Find all keys present in ar.json but missing from en.json and vice versa.
- Add the missing keys with accurate translations (Arabic↔English).
- Do NOT remove existing keys.
- Do NOT add placeholder or empty strings — provide real translations.
- Maintain the same JSON structure and nesting in both files.
- Run: node scripts/i18n-diff.mjs (if it exists) to verify sync after each batch.
- Commit after each namespace is fully synced.

Stop only when: both files have identical key sets with zero missing translations."
}

# ════════════════════════════════════════════════════════════════════════════
# المهمة 4: إضافة اختبارات Vitest
# ════════════════════════════════════════════════════════════════════════════
task_add_tests() {
  local TARGET="${1:-src/lib}"
  echo "▶ تشغيل: إضافة اختبارات Vitest لـ $TARGET"
  gnhf \
    --agent "$AGENT" \
    --max-iterations 25 \
    --stop-when "npm run test exits with all tests passing" \
    --prevent-sleep "$PREVENT_SLEEP" \
    "Add Vitest unit tests for the functions in $TARGET in this Kalmeron Next.js 16 project.

Project structure notes:
- AI agents are in src/ai/agents/ (each agent is a subdirectory with an index.ts)
- Utility functions are in src/lib/utils.ts
- Shared lib modules are in src/lib/ (billing, cache, embeddings, etc.)

Rules:
- Create test files alongside source files (e.g., foo.ts → foo.test.ts).
- Test all exported functions, covering happy path, edge cases, and error cases.
- Run: npm run test after each test file to ensure it passes.
- Do NOT modify the source files being tested.
- Use descriptive test names in Arabic or English.
- Mock external dependencies (Firestore, API calls, Gemini) using vi.mock().

Stop only when: npm run test exits with all tests passing and no test failures."
}

# ════════════════════════════════════════════════════════════════════════════
# المهمة 5: تحسين مؤشرات أداء وكلاء Kalmeron
# ════════════════════════════════════════════════════════════════════════════
task_improve_agents() {
  echo "▶ تشغيل: تحسين وكلاء Kalmeron"
  echo "   ملاحظة: وكلاء Kalmeron موجودون في src/ai/agents/"
  gnhf \
    --agent "$AGENT" \
    --max-iterations 20 \
    --stop-when "all agent system prompts in src/ai/agents/ are reviewed and improved with clear Arabic instructions" \
    --prevent-sleep "$PREVENT_SLEEP" \
    "Improve the AI agent prompts and configurations in src/ai/agents/ for this Kalmeron project.

Project structure:
- Each agent lives in src/ai/agents/<agent-name>/index.ts (or similar)
- The agent registry is at src/ai/agents/registry.ts
- Agents are built with @mastra/core or Vercel AI SDK

Rules:
- Review each agent's system prompt for clarity, specificity, and Arabic quality.
- Ensure each agent has: a clear role definition, specific instructions, output format guidance.
- Improve vague instructions to be concrete and measurable.
- Keep all prompts in Arabic (or bilingual Arabic/English where appropriate).
- Run: npm run lint after changes to ensure no syntax errors.
- Commit after each agent is improved.

Stop only when: all agent files in src/ai/agents/ have been reviewed and improved with quality Arabic prompts."
}

# ════════════════════════════════════════════════════════════════════════════
# المهمة 6: تحسين الأداء (Core Web Vitals)
# ════════════════════════════════════════════════════════════════════════════
task_performance() {
  echo "▶ تشغيل: تحسين الأداء"
  gnhf \
    --agent "$AGENT" \
    --max-iterations 18 \
    --stop-when "no obvious performance anti-patterns remain in app/ and components/ and npm run build completes without warnings" \
    --prevent-sleep "$PREVENT_SLEEP" \
    "Improve performance of this Kalmeron Next.js 16 app.

Rules:
- Identify and fix common Next.js performance issues: missing lazy loading, large bundle imports, unoptimized images, missing Suspense boundaries.
- Add dynamic imports for heavy components not needed on initial load.
- Ensure Server Components are used where possible (no unnecessary 'use client').
- Run: npm run build after major changes to check bundle size.
- Do NOT change business logic or UI behavior.
- Commit after each meaningful optimization.

Stop only when: npm run build completes without warnings and no obvious performance anti-patterns remain in app/ and components/."
}

# ════════════════════════════════════════════════════════════════════════════
# المهمة 7: تحسين إمكانية الوصول (a11y)
# ════════════════════════════════════════════════════════════════════════════
task_accessibility() {
  echo "▶ تشغيل: تحسين إمكانية الوصول"
  gnhf \
    --agent "$AGENT" \
    --max-iterations 15 \
    --stop-when "all interactive elements have proper ARIA labels and keyboard navigation works" \
    --prevent-sleep "$PREVENT_SLEEP" \
    "Improve accessibility (a11y) in this Kalmeron Next.js app.

Rules:
- Add missing aria-label, aria-describedby, role attributes to interactive elements.
- Ensure all buttons and links have descriptive text (not just icons).
- Fix missing alt text on images.
- Ensure form fields have associated labels.
- Support RTL layout for Arabic content (dir='rtl').
- Run: npm run lint after changes.
- Commit after each page or component is fixed.

Stop only when: all interactive elements in app/ and components/ have proper ARIA attributes and forms have labels."
}

# ════════════════════════════════════════════════════════════════════════════
# نقطة الدخول الرئيسية
# ════════════════════════════════════════════════════════════════════════════
TASK="${1:-help}"

case "$TASK" in
  fix-typescript)     task_fix_typescript ;;
  fix-lint)           task_fix_lint ;;
  i18n-sync)          task_i18n_sync ;;
  add-tests)          task_add_tests "${2:-src/lib}" ;;
  improve-agents)     task_improve_agents ;;
  performance)        task_performance ;;
  accessibility)      task_accessibility ;;
  help|--help|-h|*)
    echo ""
    echo "الاستخدام: bash scripts/gnhf-kalmeron.sh <مهمة> [خيارات]"
    echo ""
    echo "المهام المتاحة:"
    echo "  fix-typescript    إصلاح جميع أخطاء TypeScript ليلاً"
    echo "  fix-lint          إصلاح جميع تحذيرات ESLint"
    echo "  i18n-sync         مزامنة مفاتيح الترجمة ar.json ↔ en.json"
    echo "  add-tests [مسار]  إضافة اختبارات Vitest لمجلد محدد (افتراضي: src/lib)"
    echo "  improve-agents    تحسين prompts وكلاء Kalmeron في src/ai/agents/"
    echo "  performance       تحسين أداء التطبيق (Core Web Vitals)"
    echo "  accessibility     تحسين إمكانية الوصول (ARIA, RTL)"
    echo ""
    echo "أمثلة حقيقية من بنية Kalmeron:"
    echo "  bash scripts/gnhf-kalmeron.sh fix-typescript"
    echo "  bash scripts/gnhf-kalmeron.sh add-tests src/ai/agents"
    echo "  bash scripts/gnhf-kalmeron.sh add-tests src/lib"
    echo "  GNHF_AGENT=codex bash scripts/gnhf-kalmeron.sh fix-lint"
    echo ""
    echo "متغيرات البيئة:"
    echo "  GNHF_AGENT=claude   تغيير الوكيل الافتراضي (claude|codex|copilot)"
    echo ""
    ;;
esac
