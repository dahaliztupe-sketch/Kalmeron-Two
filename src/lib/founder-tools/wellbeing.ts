export type WellbeingAnswer = 1 | 2 | 3 | 4 | 5;

export const BURNOUT_QUESTIONS = [
  { id: "sleep", q: "كم تنام في المتوسّط ليلاً خلال آخر أسبوعين؟", labels: ["أقلّ من 4 ساعات", "4–5", "5–6", "6–7", "أكثر من 7"] },
  { id: "energy", q: "كيف هو مستوى طاقتك صباحاً؟", labels: ["منهك تماماً", "متعب", "عادي", "بخير", "نشط جدّاً"] },
  { id: "joy", q: "هل لا تزال تستمتع بعملك على المشروع؟", labels: ["لا أبداً", "نادراً", "أحياناً", "غالباً", "دائماً"] },
  { id: "focus", q: "قدرتك على التركيز خلال ساعات العمل؟", labels: ["لا أستطيع", "ضعيفة", "متوسّطة", "جيّدة", "ممتازة"] },
  { id: "social", q: "كم مرّة قابلت أصدقاء/عائلة (خارج العمل) آخر أسبوعين؟", labels: ["لم أقابل أحداً", "مرّة", "2-3", "4-6", "أكثر من 6"] },
  { id: "exercise", q: "كم مرّة مارست رياضة آخر أسبوعين؟", labels: ["لا شيء", "1-2", "3-4", "5-7", "أكثر من 7"] },
  { id: "anxiety", q: "كم مرّة شعرت بقلق شديد بشأن المشروع آخر أسبوع؟", labels: ["يوميّاً تقريباً", "غالباً", "أحياناً", "نادراً", "لم أشعر"] },
  { id: "decisions", q: "كيف تقيّم وضوح قراراتك مؤخّراً؟", labels: ["مشوّش جدّاً", "متردّد", "محايد", "واضح", "واضح جدّاً"] },
];

export type WellbeingScore = {
  total: number;
  max: number;
  pct: number;
  level: "burnout" | "stressed" | "okay" | "thriving";
  label: string;
  color: string;
  notes: string[];
  exercises: { title: string; body: string }[];
};

export function scoreWellbeing(answers: Record<string, WellbeingAnswer>): WellbeingScore {
  const total = Object.values(answers).reduce((s, v) => s + Number(v), 0);
  const max = BURNOUT_QUESTIONS.length * 5;
  const pct = (total / max) * 100;

  let level: WellbeingScore["level"];
  let label: string;
  let color: string;
  if (pct < 35) {
    level = "burnout"; label = "احتراق وظيفي مرتفع"; color = "red";
  } else if (pct < 55) {
    level = "stressed"; label = "ضغط مرتفع"; color = "amber";
  } else if (pct < 75) {
    level = "okay"; label = "متوازن نسبيّاً"; color = "cyan";
  } else {
    level = "thriving"; label = "في قمّة الأداء"; color = "emerald";
  }

  return {
    total,
    max,
    pct,
    level,
    label,
    color,
    notes: insightsFor(level, answers),
    exercises: exercisesFor(level),
  };
}

function insightsFor(level: WellbeingScore["level"], a: Record<string, number>): string[] {
  const out: string[] = [];

  if (level === "burnout") {
    out.push("🚨 أنت في منطقة احتراق وظيفي حقيقي. هذا ليس ضعفاً — 88% من رواد الأعمال مرّوا بهذه المرحلة.");
    out.push("الأولويّة الأولى: استرجاع النوم. حدّد ساعة ثابتة للنوم لـ 7 أيّام متتالية وراقب الفرق.");
    out.push("فكّر بجدّيّة في التواصل مع مختصّ نفسي. الستارت أب لن تنتظرك أكثر ممّا ينتظرك جسدك.");
  }
  if (level === "stressed") {
    out.push("⚠️ أنت تحت ضغط مرتفع لكن ما زلت قادراً على التحكّم. الآن وقت اتّخاذ خطوات وقائيّة.");
    out.push("جرّب قاعدة 25-5: 25 دقيقة عمل عميق، 5 راحة كاملة (ابتعد عن الشاشة).");
  }
  if (level === "okay") {
    out.push("✅ أنت في وضع متوازن. المهمّ الآن هو الحفاظ على هذا التوازن، لا السعي للأكثر.");
  }
  if (level === "thriving") {
    out.push("🌟 أداؤك ممتاز. هذا أفضل وقت لاتّخاذ القرارات الكبرى — لكن لا تستهلك هذا الوضع.");
  }

  if ((a.sleep ?? 5) < 3) out.push("💤 نومك أقلّ من 6 ساعات — هذا يخفض IQ القرارات بنسبة 15%.");
  if ((a.exercise ?? 5) < 2) out.push("🏃 الرياضة 3 مرّات/أسبوع تخفّض القلق 40%. ابدأ بـ 15 دقيقة مشي يوميّاً.");
  if ((a.social ?? 5) < 2) out.push("👥 العزلة من أكبر مخاطر رائد الأعمال. خصّص ساعتين أسبوعيّاً للقاء غير-عملي.");
  if ((a.anxiety ?? 5) < 3) out.push("😰 القلق المتكرّر مؤشّر مهم — تمارين التنفّس أدناه تساعد فوراً.");

  return out;
}

function exercisesFor(level: WellbeingScore["level"]): { title: string; body: string }[] {
  const base = [
    {
      title: "تمرين التنفّس 4-7-8 (3 دقايق)",
      body: "اشهق من أنفك 4 ثوانٍ → احتفظ بالنفس 7 ثوانٍ → ازفر من فمك 8 ثوانٍ. كرّر 4 مرّات. يخفّض الكورتيزول فوراً.",
    },
    {
      title: "قاعدة الـ 5 دقايق",
      body: "لو شعرت بأنّ مهمّة كبيرة تثقلك، التزم بـ 5 دقايق فقط. غالباً ستكمل، ولو لم تكمل، استرحت.",
    },
    {
      title: "Founder Brain Dump (10 دقايق مساءً)",
      body: "قبل النوم، اكتب على ورقة: كل ما يقلقك، كل ما تأجّل، كل أفكار الغد. اخرج العقل من رأسك للورقة. تنام أعمق.",
    },
  ];

  if (level === "burnout" || level === "stressed") {
    base.unshift({
      title: "إجازة 24 ساعة فوريّة",
      body: "أغلق Slack/Email لـ 24 ساعة كاملة. نعم، الشركة لن تنهار. هذا يُعيد ضبط نظامك العصبي بأكمله.",
    });
  }

  return base;
}
