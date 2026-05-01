import React from 'react';

export function Dashboard() {
  return (
    <div dir="rtl" className="flex h-screen w-full bg-[#030509] text-slate-50 overflow-hidden font-arabic selection:bg-indigo-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
        .font-arabic { font-family: 'IBM Plex Sans Arabic', sans-serif; }
        
        .glass-panel {
          background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%), rgba(10,13,20,0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Background ambient glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>

      {/* SIDEBAR */}
      <aside className="relative z-10 w-[260px] bg-[#0A0D14] border-l border-white/[0.04] flex flex-col h-full shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <svg viewBox="0 0 120 120" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                <defs>
                  <linearGradient id="logo-top" x1="20%" y1="10%" x2="90%" y2="90%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                  <linearGradient id="logo-bot" x1="10%" y1="90%" x2="90%" y2="10%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <path d="M 92 56 L 92 82 Q 92 92 82 92 L 46 92 Q 36 92 36 82 L 36 64" stroke="url(#logo-bot)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 28 64 L 28 38 Q 28 28 38 28 L 74 28 Q 84 28 84 38 L 84 56" stroke="url(#logo-top)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">كلميرون</span>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="glass-panel rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-sm font-bold shadow-inner">
              أح
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">أحمد الشامي</span>
              <span className="text-xs text-slate-400">مؤسس ومدير تنفيذي</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-6">
          {/* Group 1 */}
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-3 px-2">── الإدارة التنفيذية ──</div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-500/[0.15] border-r-2 border-cyan-400 text-white transition-colors">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8]" />
                <span className="text-sm font-medium">CFO المالي</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-slate-300 transition-colors border-r-2 border-transparent">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-sm font-medium">CMO التسويق</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-slate-300 transition-colors border-r-2 border-transparent">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-sm font-medium">CLO القانوني</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-slate-300 transition-colors border-r-2 border-transparent">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-sm font-medium">CTO التقني</span>
              </button>
            </div>
          </div>

          {/* Group 2 */}
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-3 px-2">── الاستراتيجية ──</div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-slate-300 transition-colors border-r-2 border-transparent">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8]" />
                <span className="text-sm font-medium">Strategy استراتيجية</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-slate-300 transition-colors border-r-2 border-transparent">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-sm font-medium">HR الموارد البشرية</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-slate-300 transition-colors border-r-2 border-transparent">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-sm font-medium">Operations عمليات</span>
              </button>
            </div>
          </div>

          {/* Group 3 */}
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-3 px-2">── التحليل ──</div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-slate-300 transition-colors border-r-2 border-transparent">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-sm font-medium">Market Intel تحليل سوق</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] text-slate-300 transition-colors border-r-2 border-transparent">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-sm font-medium">Opportunities فرص</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP BAR */}
        <header className="h-[80px] border-b border-white/[0.04] flex items-center justify-between px-8 shrink-0 bg-[#0A0D14]/50 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1">
            <div className="glass-panel w-full max-w-md h-11 rounded-full flex items-center px-4 gap-3 focus-within:border-indigo-500/50 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="ابحث عن وكيل أو اسأل سؤالاً..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500 text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#0A0D14] animate-pulse" />
            </button>
            <button className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              محادثة جديدة +
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
          
          {/* WELCOME BANNER */}
          <div className="relative rounded-2xl overflow-hidden glass-panel p-8 border border-white/10" style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,0.1) 0%, rgba(79,70,229,0.1) 50%, rgba(192,38,211,0.05) 100%), rgba(10,13,20,0.8)'
          }}>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">صباح الخير، أحمد 👋</h1>
                <p className="text-slate-300 text-lg">لديك ٣ قرارات معلّقة و٥ رؤى جديدة من فريقك اليوم</p>
              </div>
              <div className="w-full md:w-64 bg-black/40 rounded-xl p-4 border border-white/5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">نمو الشركة هذا الشهر</span>
                  <span className="text-cyan-400 font-bold">٧٨٪</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-cyan-400 via-indigo-500 to-fuchsia-500 w-[78%] rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          {/* METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <span className="text-slate-400 font-medium">الإيرادات الشهرية</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white tracking-tight">٤٢,٠٠٠ ج.م</span>
                <span className="text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                  ↑ ١٢٪
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                </div>
                <span className="text-slate-400 font-medium">المهام النشطة</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white tracking-tight">١٨ مهمة</span>
                <span className="text-indigo-400 text-sm font-bold bg-indigo-500/10 px-2 py-1 rounded-md">
                  ٣ جديدة اليوم
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <span className="text-slate-400 font-medium">جلسات الذكاء</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white tracking-tight">١٤٧ جلسة</span>
                <span className="text-cyan-400 text-sm font-bold bg-cyan-500/10 px-2 py-1 rounded-md">
                  هذا الأسبوع
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <span className="text-slate-400 font-medium">القرارات المتخذة</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white tracking-tight">٢٣ قراراً</span>
                <span className="text-fuchsia-400 text-sm font-bold bg-fuchsia-500/10 px-2 py-1 rounded-md">
                  هذا الشهر
                </span>
              </div>
            </div>
          </div>

          {/* TWO COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* LEFT COLUMN: Active Conversations */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white">المحادثات النشطة</h2>
                <button className="text-sm text-cyan-400 hover:text-cyan-300">عرض الكل</button>
              </div>
              
              <div className="glass-panel rounded-2xl p-5 hover:bg-white/[0.02] transition-colors cursor-pointer border-l-4 border-l-cyan-400">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">CF</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">المدير المالي</span>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">CFO</span>
                      </div>
                      <span className="text-xs text-slate-400">منذ ٥ دقائق</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">نشط</span>
                </div>
                <p className="text-slate-200 font-medium line-clamp-1">تحليل التدفق النقدي للربع الثالث بناءً على أرقام المبيعات الحالية، يبدو أننا بحاجة لتقليص النفقات...</p>
              </div>

              <div className="glass-panel rounded-2xl p-5 hover:bg-white/[0.02] transition-colors cursor-pointer border-l-4 border-l-amber-500">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">LE</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">المستشار القانوني</span>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">Legal</span>
                      </div>
                      <span className="text-xs text-slate-400">منذ ٢ ساعة</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold border border-amber-500/30">معلّق</span>
                </div>
                <p className="text-slate-200 font-medium line-clamp-1">مراجعة عقد التوريد مع شركة النيل: يرجى الانتباه إلى البند ٤.٢ الخاص بشروط الدفع المتأخر...</p>
              </div>

              <div className="glass-panel rounded-2xl p-5 hover:bg-white/[0.02] transition-colors cursor-pointer border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">CM</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">مدير التسويق</span>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">CMO</span>
                      </div>
                      <span className="text-xs text-slate-400">منذ ٣ ساعات</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">مكتمل</span>
                </div>
                <p className="text-slate-200 font-medium line-clamp-1">تم تجهيز استراتيجية إطلاق منتج أكتوبر بالكامل. يمكنك مراجعة الميزانية المقترحة والقنوات...</p>
              </div>
            </div>

            {/* RIGHT COLUMN: Insights Feed */}
            <div className="lg:col-span-2 space-y-4 flex flex-col h-full">
              <h2 className="text-lg font-bold text-white mb-2">رؤى وتنبيهات</h2>
              <div className="glass-panel rounded-2xl p-5 flex-1 flex flex-col gap-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[50px] pointer-events-none" />
                
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                  <div className="flex-1">
                    <p className="text-white text-sm leading-relaxed mb-2 font-medium">التدفق النقدي صحّي للأشهر الثلاثة القادمة بناءً على توقعات المبيعات الحالية.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">من CFO المالي • منذ ساعة</span>
                      <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300">عرض التفاصيل</button>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-white/5" />

                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(192,38,211,0.6)]" />
                  <div className="flex-1">
                    <p className="text-white text-sm leading-relaxed mb-2 font-medium">انتهت صلاحية ٢ عقود لموردين رئيسيين — تجديد مطلوب لتفادي انقطاع الخدمة.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">من Legal القانوني • منذ ساعتين</span>
                      <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300">عرض التفاصيل</button>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-white/5" />

                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                  <div className="flex-1">
                    <p className="text-white text-sm leading-relaxed mb-2 font-medium">الحملة الرقمية الأخيرة حقّقت ٣١٪ نسبة تحويل أعلى من المتوسط المعتاد.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">من CMO التسويق • منذ ٤ ساعات</span>
                      <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300">عرض التفاصيل</button>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-white/5" />

                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <div className="flex-1">
                    <p className="text-white text-sm leading-relaxed mb-2 font-medium">فرصة دخول سوق جديدة في ليبيا بناءً على تحليل الطلب على منتجات مماثلة.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">من Strategy استراتيجية • منذ يوم</span>
                      <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300">عرض التفاصيل</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS STRIP */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">إجراءات سريعة</h2>
            <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4">
              {[
                { label: 'تحليل ميزانية', color: 'from-indigo-500/20 to-indigo-500/5', iconColor: 'text-indigo-400', border: 'border-indigo-500/20' },
                { label: 'مراجعة عقد', color: 'from-violet-500/20 to-violet-500/5', iconColor: 'text-violet-400', border: 'border-violet-500/20' },
                { label: 'خطة تسويق', color: 'from-fuchsia-500/20 to-fuchsia-500/5', iconColor: 'text-fuchsia-400', border: 'border-fuchsia-500/20' },
                { label: 'تقرير الموارد', color: 'from-cyan-500/20 to-cyan-500/5', iconColor: 'text-cyan-400', border: 'border-cyan-500/20' },
                { label: 'استشارة قانونية', color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400', border: 'border-blue-500/20' },
                { label: 'رؤى السوق', color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400', border: 'border-emerald-500/20' },
              ].map((action, i) => (
                <button key={i} className={`flex-shrink-0 flex items-center gap-3 bg-gradient-to-br ${action.color} border ${action.border} rounded-xl px-5 py-3 hover:scale-105 transition-transform backdrop-blur-sm`}>
                  <div className={`w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center ${action.iconColor}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  </div>
                  <span className="font-bold text-white whitespace-nowrap">{action.label}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 mr-2 -scale-x-100">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
