import React from 'react';

export function ColorTokens() {
  const spectrum = [
    { name: 'Cyan', ar: 'سيان', hex: '#38BDF8', token: 'brand-cyan' },
    { name: 'Azure', ar: 'أزور', hex: '#0EA5E9', token: 'brand-azure' },
    { name: 'Blue', ar: 'أزرق', hex: '#2563EB', token: 'brand-blue' },
    { name: 'Indigo', ar: 'نيلي', hex: '#4F46E5', token: 'brand-indigo' },
    { name: 'Violet', ar: 'بنفسجي', hex: '#8B5CF6', token: 'brand-violet' },
    { name: 'Fuchsia', ar: 'فوشيا', hex: '#C026D3', token: 'brand-fuchsia' },
    { name: 'Rose', ar: 'وردي', hex: '#E11D48', token: 'brand-rose' },
    { name: 'Gold', ar: 'ذهبي', hex: '#F59E0B', token: 'brand-gold' },
    { name: 'Emerald', ar: 'زمردي', hex: '#10B981', token: 'brand-emerald' },
  ];

  const surfaces = [
    { name: 'Dark Navy / Base', hex: '#04060B', depth: '0dp' },
    { name: 'Surface 1', hex: '#0A0F1F', depth: '1dp' },
    { name: 'Surface 2', hex: '#111A33', depth: '2dp' },
    { name: 'Surface 3', hex: '#1A2547', depth: '3dp' },
    { name: 'Surface 4 / Elevated', hex: '#243259', depth: '4dp' },
  ];

  const ink = [
    { name: 'Primary', hex: '#F8FAFC', contrast: '15.2:1' },
    { name: 'Secondary', hex: '#B6C2D9', contrast: '8.4:1' },
    { name: 'Tertiary', hex: '#7A879F', contrast: '4.5:1' },
    { name: 'Quaternary', hex: '#4B5772', contrast: '2.1:1' },
  ];

  const status = [
    { name: 'Success', hex: '#10B981', class: 'bg-[#10B981]' },
    { name: 'Warning', hex: '#F59E0B', class: 'bg-[#F59E0B]' },
    { name: 'Danger', hex: '#F43F5E', class: 'bg-[#F43F5E]' },
    { name: 'Info', hex: '#38BDF8', class: 'bg-[#38BDF8]' },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#04060B] text-slate-50 overflow-y-auto pb-32 font-arabic">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;700&family=JetBrains+Mono&display=swap');
        .font-arabic { font-family: 'IBM Plex Sans Arabic', sans-serif; }
        .font-latin { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-20">
        <header className="mb-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">نظام الألوان</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            مبني على درجات عميقة للفضاء تعزز التركيز، مع طيف كوني ساطع يمثل الذكاء والابتكار. جميع الألوان محسوبة لتحقيق أفضل تباين ممكن.
          </p>
        </header>

        {/* Spectrum */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">الطيف الكوني</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {spectrum.map((c, i) => (
              <div key={i} className="group">
                <div 
                  className="h-32 rounded-2xl mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-transform group-hover:-translate-y-1"
                  style={{ backgroundColor: c.hex, boxShadow: `0 8px 25px -5px ${c.hex}60` }}
                />
                <div className="flex justify-between items-end">
                  <div>
                    <div className="font-bold text-lg">{c.ar} <span className="font-latin text-sm font-normal text-slate-400 ml-1">{c.name}</span></div>
                    <div className="font-mono text-sm text-slate-500">{c.hex}</div>
                  </div>
                  <div className="font-mono text-[10px] text-slate-600 bg-white/5 px-2 py-1 rounded">{c.token}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Surface Ladder */}
          <section>
            <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">مستويات الأسطح (العمق)</h2>
            <div className="relative pt-12 pb-8 px-8 bg-[#04060B] border border-white/10 rounded-3xl h-[400px]">
              {surfaces.map((s, i) => (
                <div 
                  key={i}
                  className="absolute left-8 right-8 rounded-xl border border-white/5 p-4 flex justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-all"
                  style={{ 
                    backgroundColor: s.hex,
                    bottom: `${32 + (i * 50)}px`,
                    zIndex: i,
                    height: '100px'
                  }}
                >
                  <div className="font-latin font-bold">{s.name}</div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-slate-400">{s.hex}</div>
                    <div className="font-mono text-xs text-slate-500">{s.depth}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ink Scale */}
          <section>
            <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">مستويات النص (Ink)</h2>
            <div className="bg-[#0A0F1F] border border-white/10 rounded-3xl p-8 space-y-6">
              {ink.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold font-latin" style={{ color: c.hex }}>Aa</div>
                    <div>
                      <div className="font-latin font-bold text-slate-200">{c.name}</div>
                      <div className="text-sm font-arabic text-slate-400" style={{ color: c.hex }}>النص النموذجي بهذا اللون</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-slate-400">{c.hex}</div>
                    <div className="font-mono text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded mt-1 inline-block">
                      Contrast {c.contrast}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Status & Gradients */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">ألوان الحالة</h2>
            <div className="grid grid-cols-2 gap-4">
              {status.map((s, i) => (
                <div key={i} className="bg-[#0A0F1F] border border-white/5 rounded-2xl p-6">
                  <div className={`w-8 h-8 rounded-full ${s.class} mb-4 shadow-[0_0_15px_${s.hex}40]`} />
                  <div className="font-latin font-bold text-white">{s.name}</div>
                  <div className="font-mono text-sm text-slate-500">{s.hex}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">التدرجات اللونية</h2>
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border border-white/10" style={{ background: 'linear-gradient(135deg, #38BDF8, #4F46E5, #C026D3)' }}>
                <h3 className="text-xl font-bold text-white shadow-black/50 drop-shadow-md">Brand Gradient</h3>
              </div>
              <div className="p-6 rounded-2xl border border-white/10 bg-[#0A0F1F] flex items-center justify-center">
                <h3 className="text-3xl font-bold" style={{
                  background: 'linear-gradient(120deg, #5EEAD4, #38BDF8, #818CF8, #C084FC)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  نص متدرج لامع
                </h3>
              </div>
              <div className="p-6 rounded-2xl border border-white/10 bg-[#0A0F1F] flex items-center justify-center">
                <h3 className="text-3xl font-bold" style={{
                  background: 'linear-gradient(120deg, #FCD34D, #FB923C, #F43F5E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  تدرج الشروق الدافئ
                </h3>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
