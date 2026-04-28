import React, { useState, useEffect } from 'react';
import { Play, Sparkles, ShieldCheck, CheckCircle2, ChevronLeft, BrainCircuit, Activity, LineChart, Code2, Layers, Briefcase, FileText, MessageSquare, TerminalSquare, Cpu, Network, Lock, Zap, Server } from 'lucide-react';

export function OperatingSystem() {
  const [typedText, setTypedText] = useState("");
  const fullText = "بناءً على تحليل السوق الحالي، منصات التعليم للمستقلين تشهد نمواً بنسبة ٣٤٪ سنوياً. إليك التحليل المبدئي:\n\n• السوق: حجم الطلب عالي في مصر والسعودية.\n• الإيرادات: نموذج الاشتراك الشهري (SaaS) هو الأنسب.\n• المخاطر: تكلفة اكتساب العميل المرتفعة في البداية.\n\nهل ترغب في تفصيل خطة التسويق للوصول لأول ١٠٠٠ مستخدم؟";
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setTypedText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      dir="rtl" 
      lang="ar" 
      className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500/30 overflow-hidden relative"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Technical Grid Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 100%)'
        }}
      ></div>
      
      {/* Cyan/Teal Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all">
                <span className="text-white font-bold text-xl leading-none mb-1">ك</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-100">كلميرون</span>
            </a>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                الأقسام
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <TerminalSquare className="w-4 h-4" />
                تجربة حيّة
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                لماذا كلميرون؟
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <LineChart className="w-4 h-4" />
                الأسعار
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm font-medium">
            <a href="#" className="text-slate-300 hover:text-white px-4 py-2 transition-colors">دخول</a>
            <a href="#" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md border border-slate-700 transition-all flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              ابدأ مجاناً
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 pt-16 pb-24 md:pt-24 lg:pt-32 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column (Text/CTA in RTL) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-800/50 text-cyan-400 text-sm font-medium w-fit shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <Network className="w-4 h-4" />
              كلميرون · مقرّ عمليات شركتك الذكي
            </div>
            
            <div className="flex flex-col gap-4">
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.2]"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                فريقك المؤسس
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  يعمل ٢٤/٧ لصالحك
                </span>
              </h1>
              
              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                بدلاً من إنفاق آلاف الجنيهات على مستشار مالي ومحامٍ ومحلّل سوق، ١٦ مساعداً ذكياً يعملون كفريقك كاملاً، بالعربية الأصيلة.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3.5 rounded-md font-bold text-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2">
                <Cpu className="w-5 h-5" />
                ابدأ مجاناً الآن
              </button>
              <button className="bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 px-8 py-3.5 rounded-md font-bold text-lg transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                <Play className="w-5 h-5" />
                شاهد تجربة حيّة
              </button>
            </div>

            {/* Trust Badges - Technical Style */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Lock className="w-4 h-4 text-cyan-500" />
                <span>متوافق مع قانون ١٥١</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Code2 className="w-4 h-4 text-cyan-500" />
                <span>عربي أصيل، لا ترجمة</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Server className="w-4 h-4 text-cyan-500" />
                <span>+١٠٠٠ رائد أعمال</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                <span>مجاناً للبداية</span>
              </div>
            </div>
          </div>

          {/* Right Column (Demo in RTL) */}
          <div className="lg:col-span-7 relative">
            {/* Decorative elements behind demo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-20 animate-pulse"></div>
            
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900/80 backdrop-blur-xl shadow-2xl flex flex-col h-[500px]">
              
              {/* Terminal Header */}
              <div className="h-12 border-b border-slate-800 bg-slate-950/80 flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-cyan-500" />
                  kalmeron-os_v2.4.1 — active
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  متصل
                </div>
              </div>

              {/* Chat Area */}
              <div 
                className="flex-1 p-6 overflow-y-auto flex flex-col gap-6"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                
                {/* User Message */}
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                    <span className="text-xs font-bold text-slate-300">أنت</span>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tr-sm px-4 py-3 text-slate-200 text-sm shadow-sm max-w-[85%]">
                    حلّل فكرة منصة تعليمية للمستقلّين
                  </div>
                </div>

                {/* Agent Response */}
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded bg-cyan-900/50 flex items-center justify-center shrink-0 border border-cyan-800">
                    <BrainCircuit className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-[85%]">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <span className="text-cyan-400">محلّل الأفكار</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-500 animate-pulse"></span>
                        يكتب الآن...
                      </span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tr-sm px-5 py-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono relative overflow-hidden group">
                      {/* Subtle code scanline effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-full w-full opacity-50 pointer-events-none -translate-y-full group-hover:animate-[scan_2s_linear_infinite]"></div>
                      {typedText}
                      {typedText.length < fullText.length && (
                        <span className="inline-block w-2 h-4 bg-cyan-500 ml-1 animate-pulse align-middle"></span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                  <button className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors">
                    <Briefcase className="w-3 h-3 text-cyan-400" />
                    ابنِ خطّة عمل لمتجري الإلكتروني
                  </button>
                  <button className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    ما الفرص في قطاع الصحة الرقمية؟
                  </button>
                  <button className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors">
                    <LineChart className="w-3 h-3 text-indigo-400" />
                    احسب التكاليف المبدئية لمطعم سحابي
                  </button>
                </div>
                
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="أدخل أمرك البرمجي أو استفسارك هنا..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-md py-3 pr-4 pl-12 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    readOnly
                  />
                  <button className="absolute left-2 w-8 h-8 rounded flex items-center justify-center bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
