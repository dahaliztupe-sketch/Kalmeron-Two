/**
 * Cash Runway Alarm — pure calculation + recommendation logic.
 * No I/O. Safe to import on both client and server.
 */
import type { RunwayInputs, RunwayRecommendation, RunwayResult } from "./types";

export const DEFAULT_THRESHOLD_MONTHS = 6;

export function computeRunway(inputs: RunwayInputs): RunwayResult {
  const cash = Math.max(0, Number.isFinite(inputs.cashEgp) ? inputs.cashEgp : 0);
  const income = Math.max(0, Number.isFinite(inputs.monthlyIncomeEgp) ? inputs.monthlyIncomeEgp : 0);
  const burn = Math.max(0, Number.isFinite(inputs.monthlyBurnEgp) ? inputs.monthlyBurnEgp : 0);
  const threshold = Math.max(1, Math.round(inputs.thresholdMonths || DEFAULT_THRESHOLD_MONTHS));

  const netBurn = burn - income;

  if (burn === 0 && income === 0 && cash === 0) {
    return { kind: "noBurn", netBurnEgp: 0, months: 0, belowThreshold: false };
  }
  if (netBurn <= 0) {
    return { kind: "infinite", netBurnEgp: netBurn, months: Infinity, belowThreshold: false };
  }
  if (cash <= 0) {
    return { kind: "noCash", netBurnEgp: netBurn, months: 0, belowThreshold: true };
  }

  const months = cash / netBurn;
  const belowThreshold = months < threshold;

  return {
    kind: belowThreshold ? "warning" : "healthy",
    netBurnEgp: netBurn,
    months,
    belowThreshold,
  };
}

/**
 * Generates proactive Arabic recommendations based on the current state.
 * Heuristics only — the deeper "ask CFO agent" path lives in /chat.
 */
export function buildRecommendations(
  inputs: RunwayInputs,
  result: RunwayResult,
): RunwayRecommendation[] {
  const recs: RunwayRecommendation[] = [];
  const { netBurnEgp, months } = result;

  if (result.kind === "warning" || result.kind === "noCash") {
    // Aggressive cuts when runway is short.
    const cutPct = months < 3 ? 0.3 : 0.2;
    const monthsAfterCut =
      netBurnEgp > 0
        ? inputs.cashEgp / Math.max(1, netBurnEgp - inputs.monthlyBurnEgp * cutPct)
        : Infinity;
    recs.push({
      id: "cut-burn",
      title: `قلّل المصروفات بنسبة ${Math.round(cutPct * 100)}٪`,
      rationale:
        "اشطب أكبر بندين غير ضروريين هذا الشهر — إعلانات لم تثبت جدواها أو اشتراكات أدوات لم تُستخدم.",
      monthsGained: Math.round(monthsAfterCut - months),
    });

    recs.push({
      id: "raise-prices",
      title: "ارفع أسعارك ١٠–٢٠٪ على العملاء الجدد",
      rationale:
        "العملاء الجدد لا يقارنون بسعر الأمس. ارفع السعر اليوم وسجّل التحويل في أسبوع.",
    });

    recs.push({
      id: "collect-ar",
      title: "حصّل المستحقات المتأخرة هذا الأسبوع",
      rationale:
        "ابعث رسائل استحقاق لكل فاتورة فات موعدها أسبوعاً. حتى تحصيل ٤٠٪ من المتأخرات يُحدث فرقاً ملموساً.",
    });

    if (months < 4) {
      recs.push({
        id: "bridge-loan",
        title: "ابدأ محادثة تمويل جسر (Bridge) الآن",
        rationale:
          "الـbridge يحتاج ٤–٨ أسابيع. ابدأ المحادثة وأنت في وضع تفاوضي قوي، لا قبل أسبوعين من نفاد النقد.",
      });
    }

    if (months < 2) {
      recs.push({
        id: "freeze-hiring",
        title: "جمّد التوظيف فوراً وراجع الفريق",
        rationale:
          "كل توظيف جديد يقصّر الـ runway. جمّد المسارات المفتوحة وحدّد إن كان أيّ دور غير حرج قابلاً للتأجيل.",
      });
    }
  } else if (result.kind === "healthy") {
    recs.push({
      id: "extend-runway",
      title: "وسّع الـ runway قبل أن تحتاج",
      rationale:
        "أنت في ٦+ أشهر — أفضل وقت للتفاوض على شروط جيدة، سواء عبر تمويل أو شراكات إيرادية.",
    });
    recs.push({
      id: "invest-growth",
      title: "ضخّ ١٠–١٥٪ من الميزانية في القناة الرابحة",
      rationale:
        "حدّد قناة اكتساب أثبتت ROI > ٣x وضاعف عليها بدلاً من توزيع التجارب على ٥ قنوات ضعيفة.",
    });
  } else if (result.kind === "infinite") {
    recs.push({
      id: "reinvest",
      title: "أعد استثمار الفائض الشهري",
      rationale:
        "أنت ربحي. لا تترك النقد خاملاً — استثمر في فريق المبيعات، البحث والتطوير، أو سوق جغرافي جديد.",
    });
  }

  return recs;
}

export function fmtMonths(months: number): string {
  if (!Number.isFinite(months)) return "∞";
  if (months >= 12) {
    const years = months / 12;
    return `${years.toFixed(1)} سنة`;
  }
  return `${months.toFixed(1)} شهر`;
}
