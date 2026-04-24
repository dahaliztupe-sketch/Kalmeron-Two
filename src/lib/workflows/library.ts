/**
 * Kalmeron Workflows — seed library
 * ---------------------------------
 * Five hand-tuned starter workflows that exercise the runner end-to-end.
 * Authored as plain JSON specs so they can be edited in the UI, persisted
 * in Firestore, and audited.
 *
 * Token syntax in `prompt`:
 *   - `{{input.<name>}}`              — value from the trigger form
 *   - `{{steps.<stepId>.<output>}}`   — value from a previous step
 */

import type { Workflow } from "./runner";

export const WORKFLOW_LIBRARY: Workflow[] = [
  {
    id: "idea-to-mvp",
    title: "من الفكرة إلى النموذج الأوّلي",
    description: "تحلّل فكرتك، تستخرج المخاطر القاتلة، وتبني خطة تنفيذ في 6 خطوات.",
    inputs: [
      { name: "idea", label: "الفكرة", placeholder: "تطبيق توصيل من الصيدليات في القاهرة", required: true },
      { name: "city", label: "المدينة المستهدفة", placeholder: "القاهرة", required: true },
    ],
    steps: [
      {
        id: "analyze",
        agent: "idea-analyst",
        prompt: "حلّل الفكرة التالية للسوق المصري: «{{input.idea}}» في مدينة {{input.city}}. ركّز على حجم السوق، المنافسين، وعوامل النجاح.",
        outputs: ["text"],
      },
      {
        id: "risks",
        agent: "mistake-shield",
        prompt: "بناءً على هذا التحليل: {{steps.analyze.text}}\n\nاستخرج أكبر 5 مخاطر قاتلة قد تواجه المشروع، مع طريقة تجنّب كلّ منها.",
        outputs: ["text"],
      },
      {
        id: "plan",
        agent: "plan-builder",
        prompt: "اصنع خطة تنفيذية لـ 90 يوماً لإطلاق نموذج أوّلي قابل للاختبار، مع مراعاة:\n- التحليل: {{steps.analyze.text}}\n- المخاطر: {{steps.risks.text}}",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "fundraise-readiness",
    title: "جاهزية جمع التمويل التأسيسي",
    description: "تكتب ملخّص العرض، قائمة المستثمرين، ورسالة التواصل الأولى.",
    inputs: [
      { name: "company", label: "اسم الشركة", placeholder: "كلميرون", required: true },
      { name: "stage", label: "المرحلة", placeholder: "Pre-seed / Seed / Series A", required: true },
      { name: "ask", label: "حجم الجولة (USD)", placeholder: "500000", required: true },
    ],
    steps: [
      {
        id: "pitch",
        agent: "cfo",
        prompt: "اكتب ملخّصاً تنفيذياً (Executive Summary) من 200 كلمة لشركة {{input.company}} في مرحلة {{input.stage}} تجمع جولة {{input.ask}} دولار.",
        outputs: ["text"],
      },
      {
        id: "investors",
        agent: "opportunity-radar",
        prompt: "اقترح 5 صناديق استثمارية أو مستثمرين ملائكيين في مصر/الخليج يستثمرون في مرحلة {{input.stage}}، مع سبب الملاءمة.",
        outputs: ["text"],
      },
      {
        id: "outreach",
        agent: "general-chat",
        prompt: "اكتب رسالة بريد إلكتروني (4 فقرات) للمستثمر الأوّل من القائمة، باستخدام:\n- الملخّص: {{steps.pitch.text}}\n- قائمة المستثمرين: {{steps.investors.text}}",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "weekly-investor-update",
    title: "تحديث المستثمرين الأسبوعي",
    description: "يُجمّع المؤشّرات، يُبرز المكاسب والطلبات، ويصيغ تحديثاً جاهزاً للإرسال.",
    inputs: [
      { name: "metrics", label: "المؤشّرات الرئيسية للأسبوع", placeholder: "MRR=12000, NPS=64, Churn=2.1%", required: true },
      { name: "wins", label: "أهمّ مكسبين", placeholder: "أوّل عميل enterprise، تكامل مع …", required: true },
      { name: "asks", label: "طلبات/تحديات", placeholder: "نحتاج معارف في قطاع …", required: false },
    ],
    steps: [
      {
        id: "frame",
        agent: "general-chat",
        prompt: "صُغ تحديثاً أسبوعياً للمستثمرين بنبرة مهنية وموجزة. المؤشّرات: {{input.metrics}}. المكاسب: {{input.wins}}. الطلبات: {{input.asks}}",
        outputs: ["text"],
      },
      {
        id: "polish",
        agent: "general-chat",
        prompt: "أعد صياغة هذا التحديث ليكون أكثر إيجازاً وحدّة، بحدّ أقصى 180 كلمة:\n\n{{steps.frame.text}}",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "compliance-egypt",
    title: "خارطة الامتثال - السوق المصري",
    description: "تستخرج المتطلّبات القانونية والضريبية، وترتّب الخطوات حسب الأولوية.",
    inputs: [
      { name: "businessType", label: "نوع النشاط", placeholder: "SaaS B2B / متجر إلكتروني / استشارات", required: true },
      { name: "headcount", label: "عدد الموظّفين الحالي", placeholder: "5", required: true },
    ],
    steps: [
      {
        id: "legal",
        agent: "legal",
        prompt: "اذكر المتطلّبات القانونية لتأسيس وتشغيل {{input.businessType}} في مصر بعدد موظّفين {{input.headcount}}.",
        outputs: ["text"],
      },
      {
        id: "tax",
        agent: "cfo",
        prompt: "بناءً على {{steps.legal.text}}، اشرح المتطلّبات الضريبية (DT, VAT, مرتّبات) لهذا النشاط، وقدّم جدولاً زمنياً سنوياً.",
        outputs: ["text"],
      },
      {
        id: "priorities",
        agent: "plan-builder",
        prompt: "رتّب الخطوات حسب الأولوية في 30/60/90 يوماً:\n- قانونياً: {{steps.legal.text}}\n- ضريبياً: {{steps.tax.text}}",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "saas-pricing",
    title: "تسعير منتج اشتراكي",
    description: "بحث، تصميم 3 باقات، رسالة تجريب أسعار جاهزة.",
    inputs: [
      { name: "product", label: "وصف المنتج", placeholder: "أداة تحليل منافسين للوكالات", required: true },
      { name: "icp", label: "الجمهور المستهدف", placeholder: "وكالات تسويق صغيرة 5-20 شخصاً", required: true },
    ],
    steps: [
      {
        id: "research",
        agent: "opportunity-radar",
        prompt: "ابحث عن أسعار 5 منتجات مشابهة لـ {{input.product}} موجَّهة لـ {{input.icp}}، مع نطاقات الأسعار وما يقدّمه كل منها.",
        outputs: ["text"],
      },
      {
        id: "tiers",
        agent: "cfo",
        prompt: "بناءً على البحث: {{steps.research.text}}\nصمّم 3 باقات (Starter/Pro/Enterprise) بأسعار شهرية وسنوية، مع المزايا الرئيسية لكل باقة.",
        outputs: ["text"],
      },
      {
        id: "test",
        agent: "general-chat",
        prompt: "اكتب رسالة بريد إلكتروني (3 فقرات) لاختبار هذه الأسعار {{steps.tiers.text}} مع 10 عملاء محتملين.",
        outputs: ["text"],
      },
    ],
  },
];

export function findWorkflow(id: string) {
  return WORKFLOW_LIBRARY.find((w) => w.id === id);
}
