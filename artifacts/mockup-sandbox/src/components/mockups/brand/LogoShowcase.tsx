import React from 'react';

export function LogoShowcase() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#04060B] text-slate-50 overflow-y-auto pb-32 font-arabic">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        .font-arabic { font-family: 'IBM Plex Sans Arabic', sans-serif; }
        .font-latin { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .dash-border {
          background-image: dashed;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-20">
        <header className="mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">هوية العلامة التجارية</h1>
          <p className="text-slate-400 text-lg">الرمز المميز وقواعد الاستخدام</p>
        </header>

        {/* Hero Mark Animated */}
        <section className="flex justify-center mb-32">
          <div className="relative w-[280px] h-[280px] flex items-center justify-center">
            {/* Halo */}
            <div 
              className="absolute inset-[-20%] rounded-full animate-spin-slow"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(56,189,248,0.5), rgba(139,92,246,0.5), rgba(192,38,211,0.5), transparent)',
                filter: 'blur(20px)',
                opacity: 0.6
              }}
            />
            {/* Glow */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl animate-pulse-glow"
              style={{
                background: 'radial-gradient(circle at center, rgba(79,70,229,0.5), transparent 70%)'
              }}
            />
            {/* SVG */}
            <svg viewBox="0 0 120 120" fill="none" className="relative w-full h-full z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <defs>
                <linearGradient id="ls-top" x1="20%" y1="10%" x2="90%" y2="90%">
                  <stop offset="0%" stopColor="#7DD3FC" />
                  <stop offset="45%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
                <linearGradient id="ls-bot" x1="10%" y1="90%" x2="90%" y2="10%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="55%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#E879F9" />
                </linearGradient>
                <radialGradient id="ls-spark" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#BAE6FD" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                </radialGradient>
              </defs>
              <path d="M 92 56 L 92 82 Q 92 92 82 92 L 46 92 Q 36 92 36 82 L 36 64" stroke="url(#ls-bot)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 28 64 L 28 38 Q 28 28 38 28 L 74 28 Q 84 28 84 38 L 84 56" stroke="url(#ls-top)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="60" cy="60" r="14" fill="url(#ls-spark)" />
              <circle cx="60" cy="60" r="3.4" fill="#ffffff" />
            </svg>
          </div>
        </section>

        {/* Lockups & Sizes */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">أحجام الشعار</h2>
          <div className="bg-[#0A0F1F] rounded-3xl p-12 border border-white/5 flex flex-col md:flex-row items-center justify-around gap-12">
            
            {/* XL */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20">
                <svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#ls-mark-def" /></svg>
              </div>
              <div className="flex flex-col justify-center translate-y-1">
                <span className="font-latin text-[2rem] font-extrabold tracking-tight leading-none">KALMERON</span>
                <span className="font-latin text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-400 mt-1">AI Studio</span>
              </div>
            </div>

            {/* MD */}
            <div className="flex items-center gap-3 opacity-90">
              <div className="w-12 h-12">
                <svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#ls-mark-def" /></svg>
              </div>
              <div className="flex flex-col justify-center translate-y-0.5">
                <span className="font-latin text-[1.2rem] font-extrabold tracking-tight leading-none">KALMERON</span>
                <span className="font-latin text-[6px] font-bold uppercase tracking-[0.4em] text-cyan-400 mt-1">AI Studio</span>
              </div>
            </div>

            {/* SM (Icon Only) */}
            <div className="flex flex-col items-center gap-4 opacity-80">
              <div className="w-8 h-8">
                <svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#ls-mark-def" /></svg>
              </div>
              <span className="text-xs text-slate-500 font-mono">Favicon / App Icon</span>
            </div>

          </div>
        </section>

        {/* Clear Space & Backgrounds */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div>
            <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">المساحة الآمنة</h2>
            <div className="bg-[#0A0F1F] rounded-3xl p-16 border border-white/5 flex items-center justify-center relative overflow-hidden">
              {/* Guides */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-[200px] h-[100px] border border-dashed border-cyan-400" />
                <div className="absolute w-4 h-4 border-t border-l border-cyan-400 top-[calc(50%-50px)] left-[calc(50%-100px)] -translate-x-full -translate-y-full" />
                <span className="absolute font-mono text-cyan-400 text-xs top-8 left-1/2 -translate-x-1/2">1x</span>
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 p-2 border-dashed flex items-center justify-center">
                  <svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#ls-mark-def" /></svg>
                </div>
                <div className="flex flex-col justify-center bg-white/5 p-2 rounded-xl border border-white/10 border-dashed">
                  <span className="font-latin text-[1.5rem] font-extrabold tracking-tight leading-none">KALMERON</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">خلفيات العرض</h2>
            <div className="grid grid-rows-3 gap-4 h-[320px]">
              <div className="bg-[#04060B] rounded-2xl flex items-center justify-between px-8 border border-white/10">
                <span className="text-sm text-slate-400">Deep Navy (Primary)</span>
                <div className="w-10 h-10"><svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#ls-mark-def" /></svg></div>
              </div>
              <div className="bg-[#1A2547] rounded-2xl flex items-center justify-between px-8 border border-white/5">
                <span className="text-sm text-slate-400">Surface 3 (Elevated)</span>
                <div className="w-10 h-10"><svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#ls-mark-def" /></svg></div>
              </div>
              <div className="rounded-2xl flex items-center justify-between px-8" style={{ background: 'linear-gradient(135deg, #111A33, #04060B)' }}>
                <span className="text-sm text-slate-400">Gradient Mesh</span>
                <div className="w-10 h-10"><svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#ls-mark-def" /></svg></div>
              </div>
            </div>
          </div>
        </section>

        {/* Do / Don't */}
        <section>
          <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-white/10">قواعد الاستخدام</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 text-emerald-400 mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <span className="font-bold">الصحيح</span>
              </div>
              <div className="bg-[#04060B] h-32 rounded-xl flex items-center justify-center border border-white/5 mb-4">
                <div className="w-12 h-12"><svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#ls-mark-def" /></svg></div>
              </div>
              <p className="text-sm text-slate-400">استخدام الشعار الملون على خلفية داكنة لضمان التباين وسطوع الألوان.</p>
            </div>

            <div className="bg-rose-950/20 border border-rose-500/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 text-rose-400 mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                <span className="font-bold">ممنوع</span>
              </div>
              <div className="bg-white h-32 rounded-xl flex items-center justify-center mb-4">
                <div className="w-12 h-12"><svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#ls-mark-def" /></svg></div>
              </div>
              <p className="text-sm text-slate-400">يمنع وضع الشعار على خلفية بيضاء أو فاتحة لأن ألوان النيون ستفقد بريقها.</p>
            </div>

            <div className="bg-rose-950/20 border border-rose-500/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 text-rose-400 mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                <span className="font-bold">ممنوع</span>
              </div>
              <div className="bg-[#04060B] h-32 rounded-xl flex items-center justify-center border border-white/5 mb-4">
                <div className="w-12 h-12 rotate-45 grayscale"><svg viewBox="0 0 120 120" fill="none" className="w-full h-full"><use href="#ls-mark-def" /></svg></div>
              </div>
              <p className="text-sm text-slate-400">يمنع تدوير، تشويه، أو تغيير ألوان الشعار الأصلية بأي شكل من الأشكال.</p>
            </div>
          </div>
        </section>

      </div>

      {/* SVG Def for reuse */}
      <svg className="hidden">
        <defs>
          <g id="ls-mark-def">
            <path d="M 92 56 L 92 82 Q 92 92 82 92 L 46 92 Q 36 92 36 82 L 36 64" stroke="url(#ls-bot)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 28 64 L 28 38 Q 28 28 38 28 L 74 28 Q 84 28 84 38 L 84 56" stroke="url(#ls-top)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="60" cy="60" r="14" fill="url(#ls-spark)" />
            <circle cx="60" cy="60" r="3.4" fill="#ffffff" />
          </g>
        </defs>
      </svg>
    </div>
  );
}
