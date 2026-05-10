#!/usr/bin/env bash
# scripts/setup-gnhf.sh
# إعداد بيئة gnhf لمشروع Kalmeron
# يُنشئ ~/.gnhf/config.yml ويتحقق من تثبيت gnhf
# الاستخدام: bash scripts/setup-gnhf.sh

set -euo pipefail

echo "🔧 إعداد gnhf لمشروع Kalmeron..."
echo "────────────────────────────────────"

# ── الخطوة 1: تثبيت gnhf عالمياً إن لم يكن مثبتاً ──────────────────────
if command -v gnhf &>/dev/null; then
  CURRENT_VERSION="$(gnhf --version 2>&1)"
  echo "✅ gnhf مثبت بالفعل: $CURRENT_VERSION"
else
  echo "📦 تثبيت gnhf عالمياً..."
  if npm install -g gnhf 2>/dev/null; then
    echo "✅ تم تثبيت gnhf: $(gnhf --version)"
  else
    echo "⚠️  فشل التثبيت العالمي — سيُستخدم npx كبديل"
    echo "   يمكنك تشغيل gnhf مباشرةً عبر: npx gnhf --help"
    # استبدال أوامر gnhf بـ npx gnhf في الجلسة الحالية
    gnhf() { npx gnhf "$@"; }
    export -f gnhf 2>/dev/null || true
  fi
fi

# ── الخطوة 2: إنشاء مجلد الإعداد ────────────────────────────────────────
CONFIG_DIR="$HOME/.gnhf"
CONFIG_FILE="$CONFIG_DIR/config.yml"

mkdir -p "$CONFIG_DIR"

# ── الخطوة 3: كتابة ملف الإعداد (لا يُستبدل إذا كان موجوداً بالفعل) ─────
if [ -f "$CONFIG_FILE" ]; then
  echo "✅ ملف الإعداد موجود بالفعل: $CONFIG_FILE"
  echo "   (لإعادة الإنشاء: احذف الملف ثم شغّل هذا السكريبت مجدداً)"
else
  echo "📝 إنشاء ملف الإعداد: $CONFIG_FILE"
  cat > "$CONFIG_FILE" << 'YAML'
# ~/.gnhf/config.yml
# إعدادات gnhf لمشروع Kalmeron
# آخر تحديث: 2026-05-10
#
# لتجاوز أي إعداد مؤقتاً، مرّر الخيار مباشرةً عند التشغيل:
#   gnhf --agent codex --max-iterations 10 "..."

# الوكيل الافتراضي المستخدم عند عدم تحديد --agent
# القيم المتاحة: claude, codex, rovodev, opencode, copilot, pi
defaultAgent: claude

# منع النوم أثناء التشغيل الليلي (مهم جداً للتشغيل المتواصل)
# يمنع نظام التشغيل من الدخول في وضع السكون أثناء gnhf
preventSleep: true

# الحد الأقصى للفشل المتتالي قبل إيقاف gnhf تلقائياً
# يمنع الحلقات اللانهائية في حالة الأخطاء المتكررة
# القيمة المناسبة لـ Kalmeron: 3 (توازن بين المثابرة والأمان)
maxConsecutiveFailures: 3

# الحد الافتراضي للتكرارات إذا لم يُحدَّد --max-iterations
# يمكن تجاوزه بـ --max-iterations عند التشغيل
defaultMaxIterations: 20

# تكرار Meteor (الإشعارات المرئية أثناء التشغيل) من 0 إلى 5
# 0 = معطّل، 3 = افتراضي، 5 = أقصى تكرار
meteorFrequency: 3
YAML
  echo "✅ تم إنشاء ملف الإعداد"
fi

# ── الخطوة 4: التحقق النهائي ─────────────────────────────────────────────
echo ""
echo "────────────────────────────────────"
echo "✅ الإعداد مكتمل!"
echo ""
echo "الملفات:"
echo "  - gnhf binary:  $(command -v gnhf)"
echo "  - gnhf config:  $CONFIG_FILE"
echo ""
echo "للبدء:"
echo "  bash scripts/gnhf-kalmeron.sh --help"
echo ""
