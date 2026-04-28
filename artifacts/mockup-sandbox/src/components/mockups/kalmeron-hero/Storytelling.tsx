import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, ArrowLeft, Star, ShieldCheck, Zap, Users, PlayCircle, MessageCircle, Scale, BarChart3, LineChart, Briefcase, Settings, Database, HeadphonesIcon, Megaphone, Lightbulb, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const teamMembers = [
  { name: "المدير المالي", icon: LineChart, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { name: "المرشد القانوني", icon: Scale, color: "text-blue-400", bg: "bg-blue-400/10" },
  { name: "محلّل السوق", icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { name: "محلّل الأفكار", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-400/10" },
  { name: "مدير التسويق", icon: Megaphone, color: "text-rose-400", bg: "bg-rose-400/10" },
  { name: "مدير المبيعات", icon: PieChart, color: "text-orange-400", bg: "bg-orange-400/10" },
  { name: "مدير العمليات", icon: Settings, color: "text-slate-400", bg: "bg-slate-400/10" },
  { name: "خدمة العملاء", icon: HeadphonesIcon, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { name: "مدير الموارد", icon: Users, color: "text-violet-400", bg: "bg-violet-400/10" },
  { name: "المستشار الاستراتيجي", icon: Briefcase, color: "text-fuchsia-400", bg: "bg-fuchsia-400/10" },
  { name: "محلل البيانات", icon: Database, color: "text-sky-400", bg: "bg-sky-400/10" },
  { name: "المساعد التنفيذي", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
];

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 mix-blend-difference text-white">
    <div className="flex items-center gap-2">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
        <span className="text-xl font-bold font-['IBM_Plex_Sans_Arabic']">ك</span>
      </div>
      <span className="text-xl font-bold tracking-tight font-['IBM_Plex_Sans_Arabic']">كلميرون</span>
    </div>
    
    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
      <a href="#" className="hover:text-white/70 transition-colors">الأقسام</a>
      <a href="#" className="hover:text-white/70 transition-colors">تجربة حيّة</a>
      <a href="#" className="hover:text-white/70 transition-colors">لماذا كلميرون؟</a>
      <a href="#" className="hover:text-white/70 transition-colors">الأسعار</a>
    </div>

    <div className="flex items-center gap-4">
      <button className="text-sm font-medium hover:text-white/70 transition-colors hidden sm:block">دخول</button>
      <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium">ابدأ مجاناً</Button>
    </div>
  </nav>
);

export function Storytelling() {
  const [activeSection, setActiveSection] = useState(0);
  const { scrollYProgress } = useScroll();

  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.1, 0.8, 1, 1]);
  const hue = useTransform(scrollYProgress, [0, 0.5, 1], [220, 260, 280]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionIndex = Math.min(2, Math.floor((scrollPosition + windowHeight / 2) / windowHeight));
      setActiveSection(sectionIndex);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div dir="rtl" lang="ar" className="relative min-h-[300vh] bg-slate-950 text-slate-50 font-['Cairo'] selection:bg-white/20">
      <Navbar />

      {/* Dynamic Background */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsla(${hue}, 80%, 20%, ${backgroundOpacity}), transparent 80%)`,
        }}
      />

      {/* Sticky Chapter Indicator */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-8">
        {[
          { num: "١", label: "المشكلة" },
          { num: "٢", label: "الفريق" },
          { num: "٣", label: "النتيجة" }
        ].map((chapter, i) => (
          <div key={i} className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: i * window.innerHeight, behavior: 'smooth' })}>
            <div className={`transition-all duration-500 flex items-center justify-center h-8 w-8 rounded-full text-sm font-['IBM_Plex_Sans_Arabic'] border ${
              activeSection === i 
                ? "bg-white text-black border-white scale-110" 
                : "bg-transparent text-white/30 border-white/20 hover:border-white/50"
            }`}>
              {chapter.num}
            </div>
            <span className={`text-sm font-medium transition-all duration-500 absolute right-12 whitespace-nowrap ${
              activeSection === i ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
            }`}>
              {chapter.label}
            </span>
          </div>
        ))}
      </div>

      {/* Scene 1: The Problem */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 snap-start">
        <div className="max-w-4xl mx-auto text-center z-10 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            كلميرون · مقرّ عمليات شركتك الذكي
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold font-['IBM_Plex_Sans_Arabic'] leading-tight text-white/90"
          >
            أنت مؤسّس وحيد،<br/>
            <span className="text-white/40">ومئة قرار ينتظرك يومياً.</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/30 animate-bounce"
          >
            <span className="text-xs mb-2 tracking-widest uppercase">تابع القراءة</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </section>

      {/* Scene 2: The Team */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 snap-start overflow-hidden">
        <div className="max-w-5xl mx-auto text-center z-10 relative">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold font-['IBM_Plex_Sans_Arabic'] leading-tight mb-6"
          >
            فريقك المؤسس<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-l from-indigo-400 via-purple-400 to-emerald-400">
              يعمل ٢٤/٧ لصالحك
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            بدلاً من إنفاق آلاف الجنيهات على مستشار مالي ومحامٍ ومحلّل سوق، ١٦ مساعداً ذكياً يعملون كفريقك كاملاً، بالعربية الأصيلة.
          </motion.p>

          {/* Orbs Constellation */}
          <div className="relative w-[600px] h-[400px] mx-auto mt-12 hidden md:block">
            {/* Center Brand Mark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl z-20 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              <span className="text-5xl font-bold font-['IBM_Plex_Sans_Arabic']">ك</span>
            </div>

            {/* Orbiting Members */}
            {teamMembers.slice(0, 8).map((member, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const radius = 160;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  whileInView={{ opacity: 1, x, y }}
                  transition={{ duration: 1.5, delay: i * 0.1, type: "spring", stiffness: 50 }}
                  className="absolute top-1/2 left-1/2 -ml-8 -mt-8 flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-full ${member.bg} border border-white/10 flex items-center justify-center backdrop-blur-md hover:scale-110 transition-transform duration-300 relative`}>
                    <member.icon className={`w-6 h-6 ${member.color}`} />
                    <div className="absolute inset-0 rounded-full shadow-[0_0_20px_currentColor] opacity-0 group-hover:opacity-20 transition-opacity" style={{ color: member.color }}></div>
                  </div>
                  <span className="text-xs font-medium text-slate-300 bg-black/50 px-2 py-1 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute -bottom-8">
                    {member.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scene 3: The Result / CTA */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 snap-start">
        <div className="max-w-4xl mx-auto w-full z-10">
          <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-10">
              <h3 className="text-3xl md:text-5xl font-bold font-['IBM_Plex_Sans_Arabic'] mb-6">ابدأ بناء شركتك الآن</h3>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-white text-black hover:bg-slate-200 text-lg px-8 h-14 rounded-xl w-full sm:w-auto font-medium shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  ابدأ مجاناً الآن
                </Button>
                <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 text-lg px-8 h-14 rounded-xl w-full sm:w-auto font-medium gap-2">
                  <PlayCircle className="w-5 h-5" />
                  شاهد تجربة حيّة
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-slate-400 text-center font-medium">جرّب أحد هذه الأسئلة:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "حلّل فكرة منصة تعليمية للمستقلّين",
                  "ابنِ خطّة عمل لمتجري الإلكتروني",
                  "ما الفرص في قطاع الصحة الرقمية؟",
                  "احسب التكاليف المبدئية لمطعم سحابي"
                ].map((chip, i) => (
                  <button key={i} className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-indigo-400" />
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-wrap justify-center gap-6 md:gap-12">
              {[
                { icon: ShieldCheck, text: "متوافق مع قانون ١٥١" },
                { icon: Star, text: "عربي أصيل، لا ترجمة" },
                { icon: Users, text: "+١٠٠٠ رائد أعمال" },
                { icon: Zap, text: "مجاناً للبداية" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400">
                  <badge.icon className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
