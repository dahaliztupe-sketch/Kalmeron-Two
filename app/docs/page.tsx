import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "وثائق API | Kalmeron AI",
  description: "وثائق API الرسمية لمنصة كلميرون — نقاط النهاية، المصادقة، حدود المعدل، والأمثلة.",
  alternates: { canonical: "/docs" },
};

const SECTIONS = [
  {
    id: "auth",
    title: "المصادقة",
    body: `جميع طلبات الـ API تتطلب رمز Firebase ID Token في رأس Authorization:\n\nAuthorization: Bearer <ID_TOKEN>\n\nاحصل على الرمز من Firebase Auth SDK في الواجهة الأمامية.`,
  },
  {
    id: "rate-limits",
    title: "حدود المعدل",
    body: `لكل مستخدم: 60 طلب/دقيقة على نقاط الذكاء الاصطناعي و 300 طلب/دقيقة على باقي النقاط. عند التجاوز يُرجع الخادم 429 مع Retry-After.`,
  },
  {
    id: "errors",
    title: "هيكل الأخطاء",
    body: `جميع الأخطاء تُرجع JSON بالشكل: { "error": "<code>", "detail"?: "<msg>" } مع HTTP status مناسب (400/401/403/429/500).`,
  },
];

const ENDPOINTS: Array<{
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  example?: string;
}> = [
  {
    method: "POST",
    path: "/api/chat",
    description: "محادثة كاملة عبر منسّق الوكلاء (متعدد الوكلاء).",
    example: `curl -X POST https://kalmeron.ai/api/chat \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"message":"حلل فكرة مشروع صيدلية"}'`,
  },
  {
    method: "POST",
    path: "/api/chat/stream",
    description: "بث الردود توكن بتوكن (مثل ChatGPT/Claude).",
  },
  {
    method: "POST",
    path: "/api/chat/feedback",
    description: "حفظ تقييم 👍/👎 على رد المساعد.",
  },
  {
    method: "POST",
    path: "/api/ideas/analyze",
    description: "تحليل فكرة مشروع وإنتاج تقرير الجدوى.",
  },
  {
    method: "GET",
    path: "/api/billing/credits",
    description: "رصيد الاعتمادات الحالي للمستخدم.",
  },
  {
    method: "POST",
    path: "/api/pdf/extract",
    description: "استخراج نص من PDF عبر خدمة PDF Worker.",
  },
];

export default function DocsPage() {
  return (
    <main dir="rtl" className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">وثائق API</h1>
        <p className="text-lg text-muted-foreground">
          مرجع كامل لواجهة برمجة تطبيقات Kalmeron AI. للمطورين الذين يبنون فوق منصتنا.
        </p>
      </header>

      <nav aria-label="فهرس الوثائق" className="mb-12 rounded-xl border bg-muted/30 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">الفهرس</h2>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-primary hover:underline">{s.title}</a>
            </li>
          ))}
          <li><a href="#endpoints" className="text-primary hover:underline">نقاط النهاية</a></li>
          <li><a href="#sdks" className="text-primary hover:underline">مكتبات العميل (SDKs)</a></li>
        </ul>
      </nav>

      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} className="mb-10 scroll-mt-20">
          <h2 className="mb-3 text-2xl font-semibold">{s.title}</h2>
          <pre className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">{s.body}</pre>
        </section>
      ))}

      <section id="endpoints" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-2xl font-semibold">نقاط النهاية</h2>
        <div className="space-y-4">
          {ENDPOINTS.map((ep) => (
            <article key={ep.path} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-3">
                <span className={`rounded px-2 py-1 text-xs font-bold ${ep.method === "GET" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono">{ep.path}</code>
              </div>
              <p className="mb-2 text-sm text-muted-foreground">{ep.description}</p>
              {ep.example && (
                <pre className="overflow-x-auto rounded bg-muted/50 p-3 text-xs leading-relaxed" dir="ltr">{ep.example}</pre>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="sdks" className="mb-10 scroll-mt-20">
        <h2 className="mb-3 text-2xl font-semibold">مكتبات العميل (SDKs)</h2>
        <p className="text-muted-foreground">
          مكتبات رسمية قادمة قريباً لـ TypeScript و Python. حالياً يمكنك استخدام أي عميل HTTP.
        </p>
      </section>

      <footer className="mt-16 border-t pt-6 text-sm text-muted-foreground">
        <p>هل تحتاج مساعدة؟ <Link href="/contact" className="text-primary hover:underline">تواصل معنا</Link></p>
      </footer>
    </main>
  );
}
