// @ts-nocheck
export type RunwayInput = {
  cashOnHand: number;
  monthlyRevenue: number;
  monthlyBurn: number;
  growthRatePct: number;
};

export type RunwayResult = {
  netBurn: number;
  runwayMonths: number;
  runwayLabel: string;
  status: "critical" | "warning" | "healthy" | "profitable";
  projection: { month: number; cash: number; revenue: number; burn: number }[];
  recommendations: string[];
  zeroDate: Date | null;
};

export function calculateRunway(input: RunwayInput): RunwayResult {
  const { cashOnHand, monthlyRevenue, monthlyBurn, growthRatePct } = input;
  const netBurn = monthlyBurn - monthlyRevenue;

  if (netBurn <= 0) {
    return {
      netBurn,
      runwayMonths: Infinity,
      runwayLabel: "ربحي / لا حدود",
      status: "profitable",
      projection: buildProjection(cashOnHand, monthlyRevenue, monthlyBurn, growthRatePct, 24),
      recommendations: profitableRecommendations(),
      zeroDate: null,
    };
  }

  const runwayMonths = cashOnHand / netBurn;
  const status = runwayMonths < 3 ? "critical" : runwayMonths < 6 ? "warning" : "healthy";
  const zeroDate = new Date();
  zeroDate.setMonth(zeroDate.getMonth() + Math.floor(runwayMonths));

  return {
    netBurn,
    runwayMonths,
    runwayLabel: `${runwayMonths.toFixed(1)} شهراً`,
    status,
    projection: buildProjection(cashOnHand, monthlyRevenue, monthlyBurn, growthRatePct, Math.min(24, Math.ceil(runwayMonths) + 3)),
    recommendations: buildRecommendations(status, netBurn, monthlyBurn, monthlyRevenue),
    zeroDate,
  };
}

function buildProjection(
  cash: number,
  revenue: number,
  burn: number,
  growthPct: number,
  months: number,
) {
  const out = [];
  let current = cash;
  let rev = revenue;
  for (let i = 1; i <= months; i++) {
    const net = burn - rev;
    current = current - net;
    out.push({ month: i, cash: Math.round(current), revenue: Math.round(rev), burn: Math.round(burn) });
    rev = rev * (1 + growthPct / 100);
    if (current < -burn * 2) break;
  }
  return out;
}

function buildRecommendations(
  status: "critical" | "warning" | "healthy",
  netBurn: number,
  burn: number,
  revenue: number,
): string[] {
  if (status === "critical") {
    return [
      "🚨 وضع حرج — أوقف فوراً أي مصروف غير ضروري (إعلانات، اشتراكات، توظيفات).",
      `جرّب رفع أسعارك بنسبة ١٠–٢٠٪ — لو خسرت ٢٠٪ من العملاء، إيرادك يبقى ثابت لكن burn ينخفض.`,
      `ابحث عن bridge financing أو revenue-based financing — مدّة معالجة أقصر من VC.`,
      `قلّص دورة التحصيل — حوّل العملاء من شهري إلى ربع سنوي مدفوع مقدّماً مع خصم ٥٪.`,
      `أوقف أي توظيف جديد، وفكّر بصراحة في تخفيض رواتب القيادة (بما فيها راتبك).`,
      `ركّز على ٢٠٪ من المنتجات/العملاء التي تحقّق ٨٠٪ من الإيراد. اقطع الباقي.`,
    ];
  }
  if (status === "warning") {
    return [
      "⚠️ تنبيه — تبقّى لك أقلّ من ٦ أشهر. ابدأ التحرّك الآن قبل أن يتحوّل الوضع لحرج.",
      `راجع كل اشتراك SaaS — احذف أي اشتراك لم يُستخدم في آخر ٣٠ يوماً.`,
      `ابدأ محادثات تمويل الآن — جولة pre-seed تأخذ ٣–٦ أشهر للإغلاق.`,
      `جرّب رفع أسعارك للعملاء الجدد فقط (احتفظ بالقدامى) — اختبار آمن.`,
      `حوّل أيّ توظيف full-time مخطّط له إلى عقد contractor مرحلي.`,
      `راجع تكلفة كل ${burn > revenue * 3 ? "موظّف" : "قناة تسويق"} — احسب ROI لكل واحد.`,
    ];
  }
  return [
    "✅ وضعك صحّي — استثمر هذا الوقت في النموّ، لا في القلق.",
    `معدّل الاحتراق ${burn.toLocaleString("ar-EG")} ج/شهر مقبول — ركّز على رفع الإيراد.`,
    `جرّب زيادة الإنفاق التسويقي بنسبة ٢٠٪ على أنجح قناة — لو CAC < LTV/3، ضاعف.`,
    `هذا أفضل توقيت لمحادثات تمويل — تتفاوض من موقف قوّة، لا ضعف.`,
    `ابدأ بناء فريق finance/ops قبل ما يصبح الـ burn معقّد لتُديره وحدك.`,
  ];
}

function profitableRecommendations(): string[] {
  return [
    "🎉 شركتك ربحيّة — أنت في وضع نادر بين الستارت أبس.",
    "فكّر استراتيجيّاً: هل تستثمر الأرباح في النموّ، أم توزّعها كأرباح؟",
    "هذا التوقيت الأفضل لمفاوضات تمويل بأقلّ تخفيف (dilution).",
    "ابدأ بناء احتياطي نقدي يعادل ٦ أشهر تشغيل قبل أيّ توسّع كبير.",
    "ادرس فرص الاستحواذ الصغيرة — قد تحصل على عميل/فريق/تقنيّة بسعر معقول.",
  ];
}
