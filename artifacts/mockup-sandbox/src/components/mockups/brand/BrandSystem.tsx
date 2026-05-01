import React from 'react';

export function BrandSystem() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#04060B] text-slate-50 selection:bg-indigo-500/30 overflow-y-auto pb-32">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .font-arabic { font-family: 'IBM Plex Sans Arabic', sans-serif; }
        .font-latin { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
      
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-20">
        <header className="mb-24">
          <h1 className="font-arabic text-5xl md:text-6xl font-bold mb-4 tracking-tight">النظام البصري لكلميرون</h1>
          <p className="font-arabic text-xl text-slate-400 max-w-2xl leading-relaxed">
            دليل الهوية البصرية الأساسية. تقاطع الدقة الهندسية، العمق الاستراتيجي، والضيافة العربية في واجهة رقمية متطورة.
          </p>
        </header>

        <div className="space-y-32">
          {/* Logo Lockup */}
          <section>
            <h2 className="font-arabic text-2xl font-bold mb-8 text-slate-300 border-b border-white/10 pb-4">شعار العلامة التجارية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0A0F1F] border border-white/5 rounded-3xl p-12 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20">
                    <svg viewBox="0 0 120 120" fill="none" className="w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                      <defs>
                        <linearGradient id="bs-top" x1="20%" y1="10%" x2="90%" y2="90%">
                          <stop offset="0%" stopColor="#7DD3FC" />
                          <stop offset="45%" stopColor="#38BDF8" />
                          <stop offset="100%" stopColor="#4F46E5" />
                        </linearGradient>
                        <linearGradient id="bs-bot" x1="10%" y1="90%" x2="90%" y2="10%">
                          <stop offset="0%" stopColor="#4F46E5" />
                          <stop offset="55%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#E879F9" />
                        </linearGradient>
                        <radialGradient id="bs-spark" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#FFFFFF" />
                          <stop offset="40%" stopColor="#BAE6FD" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <path d="M 92 56 L 92 82 Q 92 92 82 92 L 46 92 Q 36 92 36 82 L 36 64" stroke="url(#bs-bot)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 28 64 L 28 38 Q 28 28 38 28 L 74 28 Q 84 28 84 38 L 84 56" stroke="url(#bs-top)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="60" cy="60" r="14" fill="url(#bs-spark)" />
                      <circle cx="60" cy="60" r="3.4" fill="#ffffff" />
                    </svg>
                  </div>
                  <div className="flex flex-col justify-center translate-y-1">
                    <span className="font-latin text-4xl font-extrabold tracking-tight text-white leading-none">KALMERON</span>
                    <span className="font-latin text-[11px] font-bold uppercase tracking-[0.4em] text-cyan-400 mt-1">AI Studio</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#111A33] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center gap-12">
                <div className="flex items-center gap-4 scale-75 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-12 h-12">
                    <svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#mark" /></svg>
                  </div>
                  <div className="flex flex-col justify-center translate-y-0.5">
                    <span className="font-latin text-xl font-extrabold tracking-tight text-white leading-none">KALMERON</span>
                    <span className="font-latin text-[8px] font-bold uppercase tracking-[0.4em] text-cyan-400 mt-1">AI Studio</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Color Palette */}
          <section>
            <h2 className="font-arabic text-2xl font-bold mb-8 text-slate-300 border-b border-white/10 pb-4">الطيف اللوني الكوني</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: 'Cyan', hex: '#38BDF8', class: 'bg-[#38BDF8]' },
                { name: 'Azure', hex: '#0EA5E9', class: 'bg-[#0EA5E9]' },
                { name: 'Blue', hex: '#2563EB', class: 'bg-[#2563EB]' },
                { name: 'Indigo', hex: '#4F46E5', class: 'bg-[#4F46E5]' },
                { name: 'Violet', hex: '#8B5CF6', class: 'bg-[#8B5CF6]' },
                { name: 'Fuchsia', hex: '#C026D3', class: 'bg-[#C026D3]' },
                { name: 'Navy (Bg)', hex: '#04060B', class: 'bg-[#04060B] border border-white/10' },
                { name: 'Surface 1', hex: '#0A0F1F', class: 'bg-[#0A0F1F] border border-white/10' },
                { name: 'Surface 2', hex: '#111A33', class: 'bg-[#111A33] border border-white/10' },
                { name: 'Surface 3', hex: '#243259', class: 'bg-[#243259] border border-white/10' },
              ].map((color, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className={`h-24 rounded-2xl w-full ${color.class} shadow-lg shadow-black/50`} />
                  <div>
                    <div className="font-latin text-sm font-semibold text-white">{color.name}</div>
                    <div className="font-latin text-xs text-slate-400 font-mono">{color.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section>
            <h2 className="font-arabic text-2xl font-bold mb-8 text-slate-300 border-b border-white/10 pb-4">النظام الطباعي</h2>
            <div className="bg-[#0A0F1F] border border-white/5 rounded-3xl p-8 md:p-12 space-y-12">
              <div className="space-y-4">
                <div className="font-arabic text-xs text-slate-500 mb-2 uppercase tracking-wider">H1 Headline / 60px</div>
                <h1 className="font-arabic text-5xl md:text-6xl font-bold leading-[1.2]">الذكاء الاصطناعي للمدراء التنفيذيين</h1>
              </div>
              <div className="space-y-4">
                <div className="font-arabic text-xs text-slate-500 mb-2 uppercase tracking-wider">H2 Section / 36px</div>
                <h2 className="font-arabic text-4xl font-bold leading-[1.3]">فريقك الكامل يعمل على مدار الساعة</h2>
              </div>
              <div className="space-y-4">
                <div className="font-arabic text-xs text-slate-500 mb-2 uppercase tracking-wider">Body Large / 20px / Line-Height 1.85</div>
                <p className="font-arabic text-xl text-slate-300 leading-[1.85] max-w-3xl">
                  نحن نؤمن أن قادة الأعمال في الشرق الأوسط يستحقون أدوات تبنى خصيصاً لهم. كلميرون ليس مجرد منصة، بل هو مقر عمليات متكامل يجمع بين أدق النماذج اللغوية والفهم العميق لثقافة الأعمال العربية.
                </p>
              </div>
            </div>
          </section>

          {/* Surfaces & Gradients */}
          <section>
            <h2 className="font-arabic text-2xl font-bold mb-8 text-slate-300 border-b border-white/10 pb-4">الأسطح الزجاجية والتدرجات</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative rounded-3xl p-8 h-64 border border-white/10 overflow-hidden flex flex-col justify-end" style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%), rgba(11,16,32,0.8)',
                backdropFilter: 'blur(14px)',
              }}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <h3 className="font-arabic text-xl font-bold text-white mb-2 relative z-10">السطح الزجاجي الأساسي</h3>
                <p className="font-arabic text-sm text-slate-400 relative z-10">backdrop-blur + white border 10%</p>
              </div>

              <div className="relative rounded-3xl p-8 h-64 border border-white/[0.06] overflow-hidden flex flex-col justify-end shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%), rgba(10,15,31,0.85)',
              }}>
                <h3 className="font-arabic text-xl font-bold text-white mb-2">بطاقة المحتوى</h3>
                <p className="font-arabic text-sm text-slate-400">Card elevation + inner glow</p>
              </div>

              <div className="relative rounded-3xl p-8 h-64 flex flex-col justify-center items-center text-center" style={{
                background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 35%, #8B5CF6 65%, #C026D3 100%)'
              }}>
                <h3 className="font-arabic text-2xl font-bold text-white mb-2 shadow-black/50 drop-shadow-md">التدرج الحيوي</h3>
                <p className="font-latin text-sm text-white/90 font-medium">brand-gradient</p>
              </div>
            </div>

            <div className="mt-12 p-16 rounded-3xl bg-[#0A0F1F] border border-white/5 text-center">
              <h2 className="font-arabic text-5xl md:text-7xl font-bold leading-[1.3] pb-4" style={{
                background: 'linear-gradient(120deg, #5EEAD4 0%, #38BDF8 25%, #818CF8 55%, #C084FC 80%, #F0ABFC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                تدرج النص الأساسي
              </h2>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
