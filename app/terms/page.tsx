import { AppShell } from "@/components/layout/AppShell";

export default function TermsPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black text-white mb-8 border-r-4 border-[rgb(var(--azure))] pr-4">شروط الخدمة | Kalmeron Two</h1>
        
        <div className="space-y-8 text-neutral-300 leading-relaxed text-lg">
          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">1. قبول الشروط</h2>
            <p>يمثل استخدامك لهذه المنصة إقراراً بالموافقة على الضوابط والسياسات التي تضمن بيئة ريادية آمنة وفعالة لجميع المشاركين.</p>
          </section>

          <section className="glass p-8 rounded-3xl border-l-4 border-[rgb(var(--gold))]">
            <h2 className="text-2xl font-bold text-white mb-4">2. طبيعة الخدمة (الذكاء الاصطناعي)</h2>
            <p>المنصة تعتمد على تقنيات الذكاء الاصطناعي التوليدي؛ مما يجعلها أداة استرشادية قوية ولكنها لا تلغي ضرورة الاستعانة بخبراء بشريين في المسائل القانونية والمالية المعقدة.</p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">3. الملكية الفكرية</h2>
            <p>أنت تملك الأفكار والخطط التي تنشئها على المنصة. المنصة تملك الكود والتصميم والخوارزميات المشغلة للخدمة.</p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">4. الاستخدام المقبول</h2>
            <p>يُمنع استخدام المنصة لأي أغراض غير قانونية أو لمحاولة &quot;اختراق&quot; أو التلاعب بنماذج الذكاء الاصطناعي (Prompt Injection).</p>
          </section>

          <section className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">5. حدود المسؤولية</h2>
            <p>لا تتحمل &quot;كلميرون تو&quot; أي مسؤولية عن نتائج القرارات التجارية المبنية على مخرجات الذكاء الاصطناعي.</p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
