"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  BookOpen, ChevronLeft, MessageSquareQuote, Lightbulb,
  Target, ShieldCheck, Wrench, Sparkles,
} from "lucide-react";

interface Section {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    icon: Target,
    title: "ما الذي نقدّمه في سطر واحد",
    body: (
      <p className="text-white/85 leading-relaxed">
        Kalmeron AI هو غرفة عمليات ذكية لرائد الأعمال المصري — 16 وكيلًا متخصّصًا
        (مالي، قانوني، تسويق، عقارات، إلخ.) يعملون مع المستخدم باللغة العربية
        ويحوّلون فكرة في سطرين إلى خطة عمل قابلة للتنفيذ خلال أقل من 10 دقائق.
      </p>
    ),
  },
  {
    icon: Lightbulb,
    title: "لماذا الآن — Wedge المنطقة",
    body: (
      <ul className="space-y-2 text-white/85">
        <li>• 60 مليون رائد أعمال محتمل في المنطقة العربية، 90% منهم لا يجدون مستشارًا يفهم لهجتهم وقوانين بلدهم.</li>
        <li>• الحلول الأمريكية (a16z, Y Combinator) لا تعرف ضرائب مصر، فوري، أو سيكولوجية المستهلك المحلّي.</li>
        <li>• نموذج LLM واحد لا يكفي — نحتاج وكلاء متخصّصين مع حسابات حتمية ومراجع قانونية محلّية.</li>
      </ul>
    ),
  },
  {
    icon: Wrench,
    title: "ما الذي يجعلنا مختلفين تقنيًا",
    body: (
      <ul className="space-y-2 text-white/85">
        <li>
          <span className="font-semibold text-white">Sidecars حتمية:</span> حسابات الضرائب المصرية تُجرى في خدمة Python منفصلة، ليست LLM — لا هلوسة.
        </li>
        <li>
          <span className="font-semibold text-white">RAG محلّي:</span> التضمينات تتمّ على خادمنا (MiniLM-L12) بدل استدعاء API مدفوع، خفض 80% من تكلفة البحث.
        </li>
        <li>
          <span className="font-semibold text-white">LLM Judge:</span> كل استجابة تُقيَّم تلقائيًا على رُبريك (دقّة، صوت مصري، أمان) قبل عرضها.
        </li>
        <li>
          <span className="font-semibold text-white">PDF Worker عربي:</span> استخراج النصوص العربية من الـ PDF بطريقة تتعامل مع الـ ligatures والـ normalization (مشكلة لا تحلّها مكتبات Node.js).
        </li>
      </ul>
    ),
  },
  {
    icon: ShieldCheck,
    title: "الحوكمة والامتثال",
    body: (
      <ul className="space-y-2 text-white/85">
        <li>• PII Redactor قبل أيّ استدعاء LLM.</li>
        <li>• Audit Log لكل قرار وكيل (يمكن مراجعته ومساءلته).</li>
        <li>• Rate-limiting + Bearer auth على كل المسارات الحسّاسة.</li>
        <li>• مهلات تلقائية على استدعاءات LLM (60 ثانية افتراضي) لمنع Denial of Wallet.</li>
        <li>• Sentry + Langfuse + OpenMeter لمراقبة كاملة.</li>
      </ul>
    ),
  },
  {
    icon: MessageSquareQuote,
    title: "أسئلة متوقّعة من المستثمر — كيف نجيب",
    body: (
      <div className="space-y-4 text-white/85">
        <div>
          <p className="font-semibold text-white">س: ما الذي يمنع OpenAI من نسخ هذا؟</p>
          <p className="text-white/75">
            نسخ مكتبة قانونية مصرية مفهرسة، حسابات ضرائب موقّعة من محاسبين، وخمس سنوات من قصص نجاح مصرية مصنّفة — يحتاج فريقًا محلّيًا، ليس نموذجًا.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">س: كم تكلّف خدمة المستخدم الواحد؟</p>
          <p className="text-white/75">
            متوسط استخدام يومي = 0.18$ (Sidecars محلية + Gemini Flash للمهام الخفيفة + Pro للحرجة فقط). سقف يومي افتراضي 5$ يحمي الهوامش.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">س: ما خطّة التوسّع للسعودية والإمارات؟</p>
          <p className="text-white/75">
            البنية موجودة (i18n + LLM Judge متعدّد اللهجات). نحتاج توطين القانون والضرائب لكل سوق — 6 أسابيع لكل دولة.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">س: ما حجم الفريق المطلوب بعد جولة التمويل؟</p>
          <p className="text-white/75">
            12 شخصًا في 18 شهر: 4 مهندسين، 2 PM، 2 محتوى عربي، 2 مبيعات B2B، 1 محاسب قانوني، 1 head of growth.
          </p>
        </div>
      </div>
    ),
  },
];

export default function InvestorGuidePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8" dir="rtl">
        <div>
          <Link
            href="/investor"
            className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white"
          >
            <ChevronLeft className="size-4" />
            عودة لنبضة المنصّة
          </Link>
          <div className="flex items-center gap-2 text-xs text-amber-300/90 mb-2 mt-4">
            <Sparkles className="size-3.5" />
            <span>دليل المتحدّث للعرض</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            ما الذي تقوله، ولماذا
          </h1>
          <p className="text-white/60 mt-2 max-w-2xl">
            نقاط الحديث الجاهزة عند العرض — استخدم هذه كصياغة افتتاحية، أو ارجع إليها وقت الأسئلة.
          </p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map((s, i) => (
            <section
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 size-11 flex items-center justify-center shrink-0">
                  <s.icon className="size-5 text-cyan-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-white mb-3">
                    {s.title}
                  </h2>
                  {s.body}
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-3">
          <BookOpen className="size-5 text-amber-300 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-100/90">
            <p className="font-semibold mb-1">قاعدة ذهبية للعرض</p>
            <p>
              لا تشرح كل الـ 16 وكيلًا — اعرض المسار الموصى به (6 وكلاء) من{" "}
              <Link href="/investor" className="underline hover:text-white">
                نبضة المنصّة
              </Link>
              {" "}بترتيبه. كلّ وكيل إضافي تشرحه يقلّل من تركيز المستثمر، لا يزيده.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
