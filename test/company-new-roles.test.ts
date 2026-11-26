import { describe, it, expect } from "vitest";
import { ROLES } from "@/src/lib/company/roles/registry";
import { ROLE_ORDER, DEPENDS_ON, ROLE_LABELS_AR, downstreamOf } from "@/src/lib/company/orchestrator";
import { EngineeringPlanSchema, engineeringChecks, type EngineeringPlan } from "@/src/lib/company/roles/engineering";
import { DataPlanSchema, dataChecks, type DataPlan } from "@/src/lib/company/roles/data";
import { SupportPlanSchema, supportChecks, type SupportPlan } from "@/src/lib/company/roles/support";
import { StrategyPlanSchema, strategyChecks, type StrategyPlan } from "@/src/lib/company/roles/strategy";
import { ENGINEERING_KNOWLEDGE } from "@/src/lib/company/knowledge/engineering";
import { DATA_KNOWLEDGE } from "@/src/lib/company/knowledge/data";
import { SUPPORT_KNOWLEDGE } from "@/src/lib/company/knowledge/support";
import { STRATEGY_KNOWLEDGE } from "@/src/lib/company/knowledge/strategy";
import { knowledgePrompt, staleItems } from "@/src/lib/company/knowledge/types";

const codes = (i: { code: string }[]) => i.map((x) => x.code);
const errs = (i: { level: string; code: string }[]) => i.filter((x) => x.level === "error").map((x) => x.code);
const b = { constraints: { budgetEgp: null as number | null, days: null as number | null } };

describe("registry and orchestrator", () => {
  it("every role is registered, ordered, labelled, and dependencies only point backwards", () => {
    expect(Object.keys(ROLES).sort()).toEqual([...ROLE_ORDER].sort());
    for (const r of ROLE_ORDER) {
      expect(ROLE_LABELS_AR[r]).toBeTruthy();
      for (const d of DEPENDS_ON[r] ?? []) expect(ROLE_ORDER.indexOf(d as never)).toBeLessThan(ROLE_ORDER.indexOf(r));
    }
  });
  it("changing engineering makes data and strategy stale, not support", () => {
    const d = downstreamOf("engineering");
    expect(d).toContain("data");
    expect(d).toContain("strategy");
    expect(d).not.toContain("support");
  });
  it("every new role prompt carries dated sources and the no-action rule", () => {
    for (const id of ["engineering", "data", "support", "strategy"] as const) {
      expect(ROLES[id].systemPrompt).toContain("المصدر:");
      expect(ROLES[id].systemPrompt).toContain("لا تنشر ولا ترسل");
      expect(ROLES[id].outOfScope.length).toBeGreaterThan(0);
    }
  });
  it("knowledge items have https sources, review dates and are not stale today", () => {
    const today = new Date("2026-11-27");
    for (const k of [ENGINEERING_KNOWLEDGE, DATA_KNOWLEDGE, SUPPORT_KNOWLEDGE, STRATEGY_KNOWLEDGE]) {
      for (const i of k.items) {
        expect(i.sourceUrl.startsWith("https://")).toBe(true);
        expect(i.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(i.status).not.toBe("unverified");
      }
      expect(staleItems(k, today)).toEqual([]);
      expect(staleItems(k, new Date("2027-06-01")).length).toBe(k.items.length);
      expect(knowledgePrompt(k, new Date("2027-06-01"))).toContain("قديم أو غير مؤكد");
    }
  });
});

const eng: EngineeringPlan = {
  architectureSummary: "تطبيق ويب واحد مع قاعدة بيانات مُدارة.",
  components: [{ name: "واجهة", purpose: "عرض", basis: "assumption" }],
  stack: [{ layer: "ويب", choice: "Next.js", why: "مألوف للمؤسس", basis: "assumption" }],
  milestones: [{ week: 1, goal: "نموذج أولي", deliverable: "صفحة تعمل" }],
  testPlan: [{ level: "unit", what: "منطق الحساب" }, { level: "integration", what: "واجهة الحفظ" }],
  securityChecklist: ["إدارة الأسرار خارج الشيفرة", "هذه نقطة بداية وليست تدقيقاً أمنياً؛ المنتجات الحساسة تحتاج مراجعة مختص"],
  deployNotes: ["نشر تجريبي أولاً"],
  monthlyCostEgp: { value: 500, basis: "needs_check" },
  handoff: [],
};
describe("engineering", () => {
  it("good plan has no errors", () => {
    expect(EngineeringPlanSchema.safeParse(eng).success).toBe(true);
    expect(errs(engineeringChecks(eng, b))).toEqual([]);
  });
  it("flags secrets, acting, overpromise, budget, late milestone", () => {
    expect(errs(engineeringChecks({ ...eng, deployNotes: ["password: hunter2hunter2"] }, b))).toContain("secret_in_output");
    expect(errs(engineeringChecks({ ...eng, deployNotes: ["سأنشر الموقع الليلة"] }, b))).toContain("acts_outside_role");
    expect(errs(engineeringChecks({ ...eng, architectureSummary: "آمن تماماً ضد الاختراق" }, b))).toContain("overpromise");
    expect(errs(engineeringChecks(eng, { constraints: { budgetEgp: 100, days: 30 } }))).toContain("budget_exceeded");
    expect(errs(engineeringChecks({ ...eng, milestones: [{ week: 9, goal: "g", deliverable: "d" }] }, { constraints: { budgetEgp: null, days: 30 } }))).toContain("milestone_after_duration");
  });
  it("warns on missing tests, secrets coverage and unverified stack", () => {
    const c = codes(engineeringChecks({ ...eng, testPlan: [{ level: "manual", what: "يدوي" }], securityChecklist: ["تحديث التبعيات"] }, b));
    expect(c).toEqual(expect.arrayContaining(["no_automated_tests", "secrets_not_covered", "missing_review_line", "stack_needs_check"]));
  });
});

const data: DataPlan = {
  northStar: { name: "أسابيع نشطة", definition: "عدد المستخدمين الذين أتموا خطة", basis: "assumption" },
  inputMetrics: [{ name: "إكمال التسجيل", definition: "نسبة من أنهى النموذج", basis: "assumption" }],
  events: [{ name: "plan_created", trigger: "عند إنشاء خطة", properties: ["verdict"], personalData: false }],
  dashboards: [{ name: "الأسبوع", questions: ["كم خطة أُنشئت؟"] }],
  experiments: [],
  privacyNote: "تتبع البيانات الشخصية يحتاج مراجعة محامٍ.",
  handoff: [],
};
describe("data", () => {
  it("good plan passes; bad event names fail the schema", () => {
    expect(DataPlanSchema.safeParse(data).success).toBe(true);
    expect(errs(dataChecks(data, b))).toEqual([]);
    expect(DataPlanSchema.safeParse({ ...data, events: [{ ...data.events[0], name: "Plan Created" }] }).success).toBe(false);
  });
  it("flags duplicate events and peeking; warns on personal data", () => {
    expect(errs(dataChecks({ ...data, events: [data.events[0], data.events[0]] }, b))).toContain("duplicate_event");
    const exp = { hypothesis: "h", metric: "m", sampleSizeRule: "نتوقف عند أول نتيجة", decisionRule: "d" };
    expect(errs(dataChecks({ ...data, experiments: [exp] }, b))).toContain("peeking");
    expect(codes(dataChecks({ ...data, events: [{ ...data.events[0], personalData: true }] }, b))).toContain("personal_data_events");
    const ok = { ...exp, sampleSizeRule: "ألف زائر لكل نسخة قبل القرار", decisionRule: "نقرر بعد اكتمال العينة" };
    expect(errs(dataChecks({ ...data, experiments: [ok] }, b))).toEqual([]);
  });
});

const sup: SupportPlan = {
  channels: [{ name: "بريد", why: "بسيط" }],
  knowledgeBaseTopics: ["البدء"],
  faq: [{ question: "كيف أبدأ؟", answerDraft: "أدخل فكرتك ثم راجع الخطة.", basis: "assumption" }],
  replyDrafts: [{ situation: "خطأ تقني", draft: "شكراً لإبلاغنا، نراجع المشكلة ونعود إليك." }],
  escalation: [{ trigger: "شكوى قانونية", to: "legal" }],
  metrics: [],
  feedbackToProduct: [],
  policyGaps: ["سياسة الاسترداد غير مقرّة"],
  privacyNote: "تخزين المراسلات يحتاج مراجعة محامٍ.",
  handoff: [],
};
describe("support", () => {
  it("good plan passes", () => {
    expect(SupportPlanSchema.safeParse(sup).success).toBe(true);
    expect(errs(supportChecks(sup, b))).toEqual([]);
  });
  it("blocks card requests, sending, and refund promises without a policy gap", () => {
    expect(errs(supportChecks({ ...sup, replyDrafts: [{ situation: "s", draft: "أرسل لنا رقم بطاقتك" }] }, b))).toContain("asks_sensitive_credentials");
    expect(errs(supportChecks({ ...sup, replyDrafts: [{ situation: "s", draft: "سأرسل الرد الآن" }] }, b))).toContain("acts_outside_role");
    const refund = { ...sup, faq: [{ ...sup.faq[0], answerDraft: "لك استرداد كامل" }], policyGaps: [] };
    expect(errs(supportChecks(refund, b))).toContain("refund_without_policy_gap");
  });
  it("warns on response-time promises", () => {
    expect(codes(supportChecks({ ...sup, replyDrafts: [{ situation: "s", draft: "نرد خلال 5 دقائق" }] }, b))).toContain("response_time_promise");
  });
});

const strat: StrategyPlan = {
  narrative: { problem: "المؤسس يتعثر في الخطوات الأولى", solution: "مسودات آلية مرتبة", customer: "مؤسس فكرة جديدة", whyNow: { text: "أدوات الذكاء الاصطناعي متاحة", basis: "assumption" } },
  keyPoints: ["مشكلة", "حل", "عميل"],
  deckOutline: [{ slide: "المشكلة", oneIdea: "فكرة واحدة" }, { slide: "الحل", oneIdea: "فكرة واحدة" }, { slide: "العميل", oneIdea: "فكرة واحدة" }],
  dataRoom: ["خطة العمل"],
  hardQuestions: [{ question: "أين العملاء؟", honestAnswerDraft: "لا عملاء بعد.", basis: "user_fact" }],
  readiness: [{ criterion: "عملاء مدفوعون", status: "not_met", evidence: "لا يوجد" }],
  risks: [],
  nonBindingNote: "غير ملزمة وليست استشارة استثمارية؛ شروط الأسهم تُراجَع مع محامٍ.",
  handoff: [],
};
describe("strategy", () => {
  it("good plan passes", () => {
    expect(StrategyPlanSchema.safeParse(strat).success).toBe(true);
    expect(errs(strategyChecks(strat, { verdict: "proceed" }))).toEqual([]);
  });
  it("requires 3-7 key points", () => {
    expect(StrategyPlanSchema.safeParse({ ...strat, keyPoints: ["a", "b"] }).success).toBe(false);
    expect(StrategyPlanSchema.safeParse({ ...strat, keyPoints: Array(8).fill("x") }).success).toBe(false);
  });
  it("blocks amounts, valuations and contacting investors", () => {
    expect(errs(strategyChecks({ ...strat, risks: ["نجمع 500000 دولار"] }, {}))).toContain("amount_or_valuation");
    expect(errs(strategyChecks({ ...strat, dataRoom: ["سأتواصل مع المستثمر غداً"] }, {}))).toContain("acts_outside_role");
  });
  it("warns on named investors, met without evidence, and met under a non-proceed verdict", () => {
    expect(codes(strategyChecks({ ...strat, risks: ["Sequoia تفضل السوق"] }, {}))).toContain("named_investors");
    const met = { ...strat, readiness: [{ criterion: "c", status: "met" as const, evidence: "أظن" }] };
    expect(codes(strategyChecks(met, { verdict: "stop" }))).toEqual(expect.arrayContaining(["met_without_evidence", "readiness_vs_verdict"]));
  });
});
