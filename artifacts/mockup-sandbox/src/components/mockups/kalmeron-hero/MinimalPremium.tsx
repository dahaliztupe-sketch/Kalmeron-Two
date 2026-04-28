import React from 'react';
import { ArrowLeft, Sparkles, ShieldCheck, CheckCircle2, Users, Play, Command, Search } from 'lucide-react';

export function MinimalPremium() {
  return (
    <div 
      dir="rtl" 
      lang="ar" 
      className="relative min-h-[900px] h-screen w-full bg-[#030509] text-white overflow-hidden flex flex-col selection:bg-indigo-500/30"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Core luminous glow */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-indigo-500/20 via-fuchsia-500/10 to-transparent blur-[120px] opacity-70 mix-blend-screen" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-b from-cyan-400/20 to-transparent blur-[80px] opacity-60 mix-blend-screen" />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-20 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Brand Mark */}
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 p-[1px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-40 blur-sm rounded-lg" />
            <div className="w-full h-full bg-[#030509] rounded-[7px] flex items-center justify-center z-10">
              <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-fuchsia-500 font-bold text-lg" style={{ fontFamily: "'Tajawal', sans-serif" }}>ك</span>
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Tajawal', sans-serif" }}>كلميرون</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <a href="#" className="hover:text-white transition-colors duration-200">الأقسام</a>
          <a href="#" className="hover:text-white transition-colors duration-200">تجربة حيّة</a>
          <a href="#" className="hover:text-white transition-colors duration-200">لماذا كلميرون؟</a>
          <a href="#" className="hover:text-white transition-colors duration-200">الأسعار</a>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button className="text-white/80 hover:text-white font-medium transition-colors">دخول</button>
          <button className="bg-white text-black px-4 py-2 rounded-full font-semibold hover:bg-white/90 transition-transform active:scale-95">
            ابدأ مجاناً
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto w-full mt-[-40px]">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-medium text-white/80 tracking-wide">كلميرون · مقرّ عمليات شركتك الذكي</span>
        </div>

        {/* Headline */}
        <h1 
          className="text-5xl md:text-7xl lg:text-[84px] font-bold text-center leading-[1.1] tracking-tight mb-6"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          <span className="block text-white">فريقك المؤسس</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 pb-2">
            يعمل ٢٤/٧ لصالحك
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-center text-white/50 max-w-3xl leading-relaxed mb-12 font-medium">
          بدلاً من إنفاق آلاف الجنيهات على مستشار مالي ومحامٍ ومحلّل سوق، ١٦ مساعداً ذكياً يعملون كفريقك كاملاً، بالعربية الأصيلة.
        </p>

        {/* Interactive Chat/CTA Area */}
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center w-full bg-[#0A0D14]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/50 focus-within:bg-[#0A0D14] transition-all duration-300">
              <div className="pl-3 pr-4 text-white/40">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text"
                placeholder="بمَ تفكّر اليوم؟ اكتب فكرتك بحريّة…"
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-lg py-3 focus:ring-0"
              />
              <button className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                ابدأ الآن
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[
              "حلّل فكرة منصة تعليمية للمستقلّين",
              "ابنِ خطّة عمل لمتجري الإلكتروني",
              "ما الفرص في قطاع الصحة الرقمية؟",
              "احسب التكاليف المبدئية لمطعم سحابي"
            ].map((chip, idx) => (
              <button 
                key={idx}
                className="px-4 py-2 rounded-full border border-white/[0.06] text-white/50 text-sm font-medium hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Trust Badges - Bottom */}
      <footer className="relative z-20 w-full pb-10 pt-4 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 px-6">
          <div className="flex items-center gap-2 text-white/40 grayscale hover:grayscale-0 hover:text-white/80 transition-all duration-300">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-medium">متوافق مع قانون ١٥١</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 grayscale hover:grayscale-0 hover:text-white/80 transition-all duration-300">
            <Command className="w-4 h-4" />
            <span className="text-sm font-medium">عربي أصيل، لا ترجمة</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 grayscale hover:grayscale-0 hover:text-white/80 transition-all duration-300">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">+١٠٠٠ رائد أعمال</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 grayscale hover:grayscale-0 hover:text-white/80 transition-all duration-300">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">مجاناً للبداية</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
