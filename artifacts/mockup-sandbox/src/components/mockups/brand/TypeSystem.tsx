import React from 'react';

export function TypeSystem() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#04060B] text-slate-50 overflow-y-auto pb-32">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-arabic { font-family: 'IBM Plex Sans Arabic', sans-serif; }
        .font-latin { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-20">
        <header className="mb-20">
          <h1 className="font-arabic text-4xl md:text-5xl font-bold mb-4">النظام الطباعي</h1>
          <p className="font-arabic text-slate-400 text-lg max-w-2xl leading-relaxed">
            الطباعة هي جوهر تجربة كلميرون. نستخدم خط IBM Plex Sans Arabic للغة العربية، 
            وخط Plus Jakarta Sans للغة الإنجليزية، لضمان وضوح تقني مع لمسة من الفخامة.
          </p>
        </header>

        {/* Weights */}
        <section className="mb-24">
          <h2 className="font-arabic text-2xl font-bold mb-8 pb-4 border-b border-white/10 text-slate-300">أوزان الخط (IBM Plex Sans Arabic)</h2>
          <div className="bg-[#0A0F1F] rounded-3xl p-8 md:p-12 border border-white/5 space-y-8">
            {[
              { weight: '300', name: 'Light', text: 'ذكاء اصطناعي يفهم لغتك' },
              { weight: '400', name: 'Regular', text: 'ذكاء اصطناعي يفهم لغتك' },
              { weight: '500', name: 'Medium', text: 'ذكاء اصطناعي يفهم لغتك' },
              { weight: '600', name: 'SemiBold', text: 'ذكاء اصطناعي يفهم لغتك' },
              { weight: '700', name: 'Bold', text: 'ذكاء اصطناعي يفهم لغتك' },
              { weight: '800', name: 'ExtraBold', text: 'ذكاء اصطناعي يفهم لغتك' },
            ].map((w, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-16">
                <div className="w-32 shrink-0">
                  <div className="font-latin text-slate-400 font-medium">{w.name}</div>
                  <div className="font-mono text-xs text-slate-500">{w.weight}</div>
                </div>
                <div className="font-arabic text-4xl text-white" style={{ fontWeight: w.weight }}>
                  {w.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scale */}
        <section className="mb-24">
          <h2 className="font-arabic text-2xl font-bold mb-8 pb-4 border-b border-white/10 text-slate-300">التدرج الحجمي (Fluid Scale)</h2>
          <div className="bg-[#0A0F1F] rounded-3xl p-8 md:p-12 border border-white/5 space-y-10 overflow-hidden">
            {[
              { size: 'text-xs', px: '12px', text: 'المقاس الأصغر للملاحظات الجانبية', class: 'text-xs' },
              { size: 'text-sm', px: '14px', text: 'المقاس الثانوي للقوائم', class: 'text-sm' },
              { size: 'text-base', px: '16px', text: 'المقاس الأساسي للنصوص (Body)', class: 'text-base' },
              { size: 'text-lg', px: '18px', text: 'المقاس الكبير للفقرات التمهيدية', class: 'text-lg' },
              { size: 'text-xl', px: '20px', text: 'عنوان من الدرجة الرابعة (H4)', class: 'text-xl font-bold' },
              { size: 'text-3xl', px: '24px', text: 'عنوان من الدرجة الثالثة (H3)', class: 'text-3xl font-bold' },
              { size: 'text-4xl', px: '36px', text: 'عنوان رئيسي ثانوي (H2)', class: 'text-4xl font-bold' },
              { size: 'text-6xl', px: '60px', text: 'العنوان الرئيسي الأكبر (H1)', class: 'text-5xl md:text-6xl font-bold' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-2 border-b border-white/5 pb-8 last:border-0 last:pb-0">
                <div className="flex gap-4 items-center">
                  <span className="font-mono text-sm text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{s.size}</span>
                  <span className="font-mono text-sm text-slate-500">{s.px}</span>
                </div>
                <div className={`font-arabic truncate ${s.class} text-white leading-tight`}>
                  {s.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pairing & Reading Rhythm */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Bilingual */}
          <div>
            <h2 className="font-arabic text-2xl font-bold mb-8 pb-4 border-b border-white/10 text-slate-300">التوافق اللغوي</h2>
            <div className="bg-[#0A0F1F] rounded-3xl p-8 border border-white/5 h-[350px] flex flex-col justify-center">
              <div className="space-y-8 text-center">
                <div>
                  <div className="font-latin text-sm text-slate-500 mb-2 uppercase tracking-widest">Plus Jakarta Sans</div>
                  <div className="font-latin text-4xl font-bold text-white">Innovation Hub</div>
                </div>
                <div className="flex justify-center items-center gap-4">
                  <div className="h-[1px] w-12 bg-white/10" />
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 font-mono text-xs">+</div>
                  <div className="h-[1px] w-12 bg-white/10" />
                </div>
                <div>
                  <div className="font-arabic text-4xl font-bold text-white">مركز الابتكار</div>
                  <div className="font-latin text-sm text-slate-500 mt-2 uppercase tracking-widest">IBM Plex Sans Arabic</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reading Rhythm */}
          <div>
            <h2 className="font-arabic text-2xl font-bold mb-8 pb-4 border-b border-white/10 text-slate-300">إيقاع القراءة (Body Text)</h2>
            <div className="bg-[#111A33] rounded-3xl p-8 border border-white/5 h-[350px]">
              <div className="mb-4 flex gap-3">
                <span className="font-mono text-xs text-slate-400 bg-black/30 px-2 py-1 rounded">Size: 16px</span>
                <span className="font-mono text-xs text-slate-400 bg-black/30 px-2 py-1 rounded">Line-Height: 1.85</span>
              </div>
              <p className="font-arabic text-base text-slate-300 leading-[1.85] text-justify">
                يتميز الخط العربي بطبيعته المتصلة وامتداداته الأفقية والعمودية، مما يتطلب مساحة أكبر للتنفس (Line-Height) مقارنة بالخطوط اللاتينية. 
                في نظام كلميرون، نعتمد ارتفاع سطر 1.85 للنصوص المقروءة لضمان راحة العين وسهولة التتبع بين الأسطر. 
                كما نلغي التباعد بين الحروف (Letter-Spacing: 0) تماماً لأن تباعد الحروف العربية يؤدي إلى تفكك الكلمة وفقدانها لجمالياتها الهندسية المترابطة.
              </p>
            </div>
          </div>
        </section>

        {/* Code Font */}
        <section className="mt-24">
          <h2 className="font-arabic text-2xl font-bold mb-8 pb-4 border-b border-white/10 text-slate-300">الخط البرمجي (JetBrains Mono)</h2>
          <div className="bg-[#0A0F1F] rounded-3xl p-8 border border-white/5 font-mono text-sm leading-relaxed overflow-x-auto text-slate-300">
            <pre><code>{`// Kalmeron AI - Agent Initializer
const cfoAgent = new Agent({
  role: 'Chief Financial Officer',
  language: 'ar-SA',
  capabilities: [
    'budget-analysis',
    'runway-projection',
    'burn-rate-optimization'
  ],
  systemPrompt: \`أنت المدير المالي للشركة الناشئة.
حلل البيانات بدقة وقدم نصائح قابلة للتنفيذ للمؤسس.\`
});

await cfoAgent.analyze(q3Financials);`}</code></pre>
          </div>
        </section>

      </div>
    </div>
  );
}
