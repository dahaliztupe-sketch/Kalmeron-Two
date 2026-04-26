import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_FLAG_FIELD = "_demoSeed";
const DEMO_TAG = "investor-demo-2026";

async function authedUid(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const dec = await adminAuth.verifyIdToken(auth.split(" ")[1]!);
    return dec.uid;
  } catch {
    return null;
  }
}

const DEMO_BRAND_VOICE = {
  name: "أكلة بيتنا",
  tagline: "وجبات بيتية صحية للمكاتب — توصيل يومي قبل الساعة 12 ظهرًا",
  tone: ["friendly", "professional", "concise"],
  audience:
    "موظّفو الشركات الصغيرة والمتوسطة في القاهرة الكبرى الذين يبحثون عن وجبات صحية بأسعار معقولة دون مغادرة المكتب.",
  values:
    "الشفافية في المكوّنات، الالتزام بالمواعيد، تنوّع المنيو الأسبوعي، تغليف صديق للبيئة.",
  avoid:
    "اللغة المتكلّفة، الوعود المبالغ فيها عن خسارة الوزن، الإشارة لمنافسين بالاسم.",
  sampleMessage:
    "صباح الخير 🌞 منيو اليوم: ملوخية بفراخ، مكرونة بيستو، أو سلطة سيزر. اطلب قبل 11 الصبح يصلك قبل 12.",
  [DEMO_FLAG_FIELD]: DEMO_TAG,
  updatedAt: new Date(),
};

const DEMO_PLAN = {
  title: "خطة عمل — أكلة بيتنا",
  industry: "FoodTech / B2B Catering",
  stage: "validation",
  problem:
    "موظّفو المكاتب في القاهرة يعانون من 3 خيارات سيئة وقت الغداء: وجبات سريعة غير صحية، تأخير توصيل، أو غلاء التوصيل من المطاعم البعيدة.",
  solution:
    "نموذج اشتراك أسبوعي يقدّم 5 وجبات بيتية صحية يوميًا للمكاتب، يصل قبل الـ 12 ظهرًا، بسعر ثابت يقلّ 30% عن المنافسين.",
  market: {
    tam: "12 مليار جنيه (سوق الغذاء B2B في مصر 2026)",
    sam: "1.6 مليار جنيه (المكاتب في القاهرة الكبرى)",
    som: "85 مليون جنيه (1500 مكتب × 50 موظف × 1100 جنيه/شهر)",
  },
  goToMarket: [
    "حضانة في 3 أحياء أعمال (التجمع، السادس من أكتوبر، المعادي)",
    "شراكات مع 50 مكتب في الشهر الأول",
    "بناء قائمة انتظار عبر LinkedIn و WhatsApp Business",
  ],
  team: [
    { role: "المؤسّس / CEO", strength: "خبرة 8 سنوات في إدارة مطاعم" },
    { role: "Head of Operations", strength: "خبرة سلسلة إمداد" },
    { role: "Head Chef", strength: "تخصّص أكل بيتي صحي" },
  ],
  milestones: [
    { month: 3, target: "20 عميل (مكتب) و إيراد شهري 80 ألف جنيه" },
    { month: 6, target: "60 عميل و إيراد شهري 240 ألف جنيه + كسر التعادل" },
    { month: 12, target: "150 عميل و إيراد شهري 600 ألف جنيه + توسّع للإسكندرية" },
  ],
  [DEMO_FLAG_FIELD]: DEMO_TAG,
  updatedAt: new Date(),
};

const DEMO_FINANCIAL_SCENARIO = {
  name: "السيناريو الأساسي — السنة الأولى",
  assumptions: {
    avgPricePerMealEgp: 65,
    mealsPerEmployeePerMonth: 18,
    avgEmployeesPerOffice: 35,
    grossMarginPct: 42,
    cac_egp: 1800,
    monthlyChurnPct: 4,
  },
  monthlyForecast: [
    { month: "Jan", revenue: 35000, costs: 48000, net: -13000, customers: 8 },
    { month: "Feb", revenue: 62000, costs: 71000, net: -9000, customers: 14 },
    { month: "Mar", revenue: 95000, costs: 96000, net: -1000, customers: 21 },
    { month: "Apr", revenue: 138000, costs: 121000, net: 17000, customers: 30 },
    { month: "May", revenue: 184000, costs: 145000, net: 39000, customers: 40 },
    { month: "Jun", revenue: 233000, costs: 168000, net: 65000, customers: 51 },
  ],
  egyptTaxes: {
    vat14Pct: 32620,
    socialInsurance: 18900,
    corporateIncomeTax22_5Pct: 27450,
    note: "محسوبة عبر خدمة Egypt Calc الحتمية، ليست تقدير LLM.",
  },
  [DEMO_FLAG_FIELD]: DEMO_TAG,
  updatedAt: new Date(),
};

const DEMO_OPPORTUNITIES = [
  {
    title: "حاضنة Falak Startups — برنامج FoodTech 2026",
    type: "incubator",
    organizer: "Falak Startups",
    deadline: "2026-06-15",
    link: "https://example.com/falak-foodtech",
    matchScore: 92,
    rationale: "قطاع FoodTech في مصر — مرحلة Validation — تتناسب مع معاييرهم.",
  },
  {
    title: "مسابقة EFG-Hermes ONE Million Egyptians",
    type: "competition",
    organizer: "EFG Hermes",
    deadline: "2026-05-30",
    link: "https://example.com/efg-omec",
    matchScore: 78,
    rationale: "تركز على المشاريع التي تخلق وظائف — يتناسب مع توسّعكم المخطّط.",
  },
  {
    title: "صندوق Sawari Ventures — Seed Round Q3",
    type: "vc",
    organizer: "Sawari Ventures",
    deadline: "2026-09-01",
    link: "https://example.com/sawari-seed",
    matchScore: 71,
    rationale: "يستثمرون في B2B SMB plays في مصر — حجم الجولة المستهدف يتناسب.",
  },
];

export async function POST(req: NextRequest) {
  const uid = await authedUid(req);
  if (!uid) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!adminDb?.collection) {
    return NextResponse.json(
      { ok: false, error: "firestore_not_configured" },
      { status: 503 },
    );
  }

  const userRef = adminDb.collection("users").doc(uid);
  const settingsRef = userRef.collection("settings");
  const plansRef = userRef.collection("plans");
  const scenariosRef = userRef.collection("financial_scenarios");
  const oppsRef = userRef.collection("saved_opportunities");

  try {
    const batch = adminDb.batch();

    batch.set(settingsRef.doc("brand_voice"), DEMO_BRAND_VOICE, { merge: true });
    batch.set(plansRef.doc("demo-plan-2026"), DEMO_PLAN, { merge: true });
    batch.set(
      scenariosRef.doc("demo-base-scenario"),
      DEMO_FINANCIAL_SCENARIO,
      { merge: true },
    );
    DEMO_OPPORTUNITIES.forEach((opp, i) => {
      batch.set(
        oppsRef.doc(`demo-opp-${i + 1}`),
        { ...opp, [DEMO_FLAG_FIELD]: DEMO_TAG, savedAt: new Date() },
        { merge: true },
      );
    });

    batch.set(
      userRef,
      {
        demoSeed: {
          tag: DEMO_TAG,
          seededAt: new Date(),
          collections: {
            brand_voice: 1,
            plans: 1,
            financial_scenarios: 1,
            saved_opportunities: DEMO_OPPORTUNITIES.length,
          },
        },
      },
      { merge: true },
    );

    await batch.commit();

    return NextResponse.json({
      ok: true,
      seeded: {
        brand_voice: 1,
        plans: 1,
        financial_scenarios: 1,
        saved_opportunities: DEMO_OPPORTUNITIES.length,
      },
      tag: DEMO_TAG,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "seed_failed",
        detail: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const uid = await authedUid(req);
  if (!uid) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!adminDb?.collection) {
    return NextResponse.json(
      { ok: false, error: "firestore_not_configured" },
      { status: 503 },
    );
  }

  const userRef = adminDb.collection("users").doc(uid);
  let deleted = 0;
  try {
    for (const col of ["plans", "financial_scenarios", "saved_opportunities"]) {
      const snap = await userRef
        .collection(col)
        .where(DEMO_FLAG_FIELD, "==", DEMO_TAG)
        .get();
      const batch = adminDb.batch();
      snap.docs.forEach((d) => {
        batch.delete(d.ref);
        deleted++;
      });
      if (!snap.empty) await batch.commit();
    }
    // brand_voice is shared, so just clear the demo flag
    await userRef
      .collection("settings")
      .doc("brand_voice")
      .set({ [DEMO_FLAG_FIELD]: null }, { merge: true });
    await userRef.set({ demoSeed: null }, { merge: true });

    return NextResponse.json({ ok: true, deleted });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "delete_failed",
        detail: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const uid = await authedUid(req);
  if (!uid) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!adminDb?.collection) {
    return NextResponse.json({ ok: false, seeded: false });
  }
  const doc = await adminDb.collection("users").doc(uid).get();
  const seed = (doc.data() as { demoSeed?: { tag?: string; seededAt?: unknown } } | undefined)
    ?.demoSeed;
  return NextResponse.json({
    ok: true,
    seeded: Boolean(seed?.tag === DEMO_TAG),
    seededAt: seed?.seededAt ?? null,
  });
}
