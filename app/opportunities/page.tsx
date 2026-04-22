"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Target, ArrowLeft, Calendar, Coins } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RadarPage() {
  const { language, t } = useLanguage();
  const dir = language === "ar" ? "rtl" : "ltr";

  const dummyOpportunities = [
    {
      type: "تحدي هاكاثون",
      title: "صناع التكنولوجيا - مصر 2026",
      desc: "فرصة لتقديم حلك التقني للجان تحكيم من كبرى حاضنات الأعمال، مع جوائز مالية تصل لـ 200 ألف جنيه.",
      date: "التسجيل ينتهي في 20 مايو",
      icon: <Target className="h-6 w-6 text-green-400" />
    },
    {
      type: "برنامج احتضان",
      title: "مبادرة رواد النيل - الدورة العاشرة",
      desc: "احتضان كامل لمدة 6 أشهر يشمل مساحات عمل مجانية وتسجيل قانوني وشبكة علاقات واسعة للمشاريع التكنولوجية.",
      date: "يبدأ في 1 يونيو",
      icon: <Calendar className="h-6 w-6 text-green-400" />
    },
    {
      type: "تمويل أولي",
      title: "منحة الابتكار الرقمي",
      desc: "تمويل أولي لا يرد (Equity-free) للشركات في مرحلة النموذج الأولي (MVP) المتخصصة في التجارة الإلكترونية.",
      date: "تقديم الطلبات مفتوح دائماً",
      icon: <Coins className="h-6 w-6 text-green-400" />
    }
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-10 p-4 text-white" dir={dir}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black tracking-tight mb-4 flex items-center gap-3 text-green-400">
            <Target className="h-10 w-10 text-green-400" />
            رادار الفرص: نافذتك على نمو السوق
          </h1>
          <p className="text-neutral-400 text-xl leading-relaxed max-w-2xl font-medium">
              تغطية شاملة لأحدث جولات التمويل، مسابقات الابتكار، وبرامج تسريع الأعمال في النظام البيئي المصري.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {dummyOpportunities.map((opp, i) => (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}>
                <Card className="glass border-green-500/20 bg-green-950/10 hover:bg-green-950/20 transition-all h-full shadow-lg rounded-3xl overflow-hidden group">
                  <CardContent className="p-8 space-y-6 flex flex-col h-full">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0">
                            {opp.icon}
                        </div>
                        <div>
                            <span className="text-green-500/70 text-xs font-bold uppercase tracking-wider">{opp.type}</span>
                            <h3 className="text-xl font-bold text-white mt-1 group-hover:text-green-300 transition-colors">{opp.title}</h3>
                        </div>
                    </div>
                    <p className="text-neutral-300 leading-relaxed text-md flex-grow">{opp.desc}</p>
                    <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-sm font-bold text-neutral-500">
                       <span className="text-green-600/80">{opp.date}</span>
                    </div>
                  </CardContent>
                </Card>
             </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center mt-12 bg-[#16161D]/50 border border-neutral-800 p-10 rounded-3xl items-center flex-col md:flex-row gap-6 justify-between shadow-2xl">
            <div className="text-right">
                <h3 className="text-2xl font-bold text-white mb-2">هل تبحث عن فرص تمويل متخصصة؟</h3>
                <p className="text-neutral-400 text-lg">رادار كلميرون يمسح السوق يومياً لإيجاد أفضل المسارات لنمو شركتك.</p>
            </div>
            <Link href="/chat">
                <Button className="bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 border border-green-500/30 h-14 px-10 text-lg rounded-2xl transition-all shrink-0 font-bold shadow-lg">
                    ابحث عن فرص لمجالي <ArrowLeft className="mr-3 h-5 w-5 icon-flip" />
                </Button>
            </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
