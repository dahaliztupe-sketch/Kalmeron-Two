"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ArrowLeft, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const { language, t } = useLanguage();
  const dir = language === "ar" ? "rtl" : "ltr";

  const successes = [
    { 
      name: "سويفل (Swvl) 🚌", 
      desc: "كيف تحولت أزمة المواصلات العشوائية في مصر لشركة يونيكورن مدرجة في بورصة ناسداك الأمريكية.",
      insight: "تحويل العشوائية إلى نظام عبر التقنية."
    },
    { 
      name: "إنستابج (Instabug) 🐛", 
      desc: "من مشروع تخرج في جامعة القاهرة إلى أداة أساسية يستخدمها مطورو فيسبوك وهولو وياهو.",
      insight: "التركيز على حل مشكلة تقنية عالمية واحدة بامتياز."
    },
    { 
      name: "ماكساب (MaxAB) 🛒", 
      desc: "تغيير شكل تجارة التجزئة التقليدية وسلاسل الإمداد في مصر، وتسهيل حياة البقالين المحليين.",
      insight: "رقمنة القطاعات التقليدية المهملة."
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-10 p-4 text-white" dir={dir}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black tracking-tight mb-4 flex items-center gap-3 text-purple-400">
            <Star className="h-10 w-10 text-purple-400" />
            متحف النجاح: قصص من قلب التحدي
          </h1>
          <p className="text-neutral-400 text-xl leading-relaxed max-w-3xl font-medium">
              تحليل معمق لنماذج أعمال مصرية استطاعت اختراق الحواجز والوصول للعالمية. استلهم استراتيجيتك القادمة من مسارات العباقرة.
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successes.map((s, i) => (
            <motion.div variants={item} key={i}>
              <Card className="glass border-purple-500/20 bg-[#16161D]/80 hover:bg-purple-950/20 transition-all h-full shadow-lg rounded-3xl overflow-hidden group cursor-pointer">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="flex justify-between items-center text-2xl text-white group-hover:text-purple-300 transition-colors">
                    {s.name}
                    <Trophy className="h-6 w-6 text-purple-500/50 group-hover:text-purple-400 transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <p className="text-neutral-300 leading-relaxed text-lg">{s.desc}</p>
                  
                  <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                    <p className="text-purple-400 text-sm font-bold flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-neutral-500"><TrendingUp className="h-4 w-4" /> سر النجاح:</span>
                        {s.insight}
                    </p>
                  </div>
                  
                  <div className="mt-4 text-sm font-bold text-neutral-500 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    اقرأ دراسة الحالة <ArrowLeft className="mr-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center mt-8">
            <Link href="/chat">
                <Button className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 border border-purple-500/30 h-14 px-8 text-lg rounded-2xl transition-all font-bold">
                    حلل استراتيجيات نجاح الشركات مع كالميرون <ArrowLeft className="mr-3 h-5 w-5 icon-flip" />
                </Button>
            </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
