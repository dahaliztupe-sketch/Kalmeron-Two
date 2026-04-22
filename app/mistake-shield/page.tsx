"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MistakesPage() {
  const { language, t } = useLanguage();
  const dir = language === "ar" ? "rtl" : "ltr";

  const mistakes = [
    {
      title: "بناء المنتج قبل سؤال العميل",
      desc: "الكثير من رواد الأعمال يقضون أشهراً في بناء منتج معقد دون سؤال العميل إذا كان فعلاً يحتاجه أم لا. النتيجة؟ منتج رائع لا يشتريه أحد.",
      fix: "اسأل، استمع، ثم ابنِ النموذج الأولي (MVP)."
    },
    {
      title: "اختيار الشريك الخاطئ",
      desc: "الشراكة المؤسسية هي التزام طويل المدى. إذا اختلفتم على الرؤية أو معدل المجهود المبذول، ستنهار الشركة من الداخل قبل أن تواجه السوق.",
      fix: "تأكد من توافق الرؤى وتقسيم المهام بوضوح مسبقاً."
    },
    {
      title: "حرق النقدية (Cash Burn) مبكراً",
      desc: "إنفاق رأس المال على مكاتب فخمة أو إعلانات مكثفة قبل الوصول إلى ملائمة المنتج للسوق (Product-Market Fit) أدى لإفلاس مئات الشركات الناشئة.",
      fix: "استثمر فقط في ما يجلب لك عملاء حقيقيين في البداية."
    },
    {
      title: "خلط الحسابات الشخصية بالشركة",
      desc: "التعامل مع أموال الشركة كأنها جيبك الشخصي لا يدمر فقط ميزانيتك، بل يضعف موقفك القانوني ويخيف أي مستثمر محتمل.",
      fix: "افصل حساباتك البنكية فوراً من اليوم الأول."
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
          <h1 className="text-4xl font-black tracking-tight mb-4 flex items-center gap-3 text-red-500">
            <ShieldAlert className="h-10 w-10 text-red-500" />
            حارس الأخطاء: درعك ضد الفشل
          </h1>
          <p className="text-neutral-400 text-xl leading-relaxed max-w-2xl font-medium">
            تحليل دقيق لأكثر العقبات فتكاً بالشركات الناشئة في السوق المحلي. المعرفة هنا هي أول خط دفاع لمشروعك.
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mistakes.map((mistake, i) => (
            <motion.div variants={item} key={i}>
              <Card className="glass border-red-500/20 bg-red-950/10 hover:bg-red-950/30 transition-all h-full shadow-lg rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1 h-full bg-red-500/50"></div>
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
                    <CardTitle className="text-2xl text-white">{mistake.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <p className="text-neutral-300 leading-relaxed text-lg">{mistake.desc}</p>
                  <div className="bg-green-950/30 border border-green-500/20 p-4 rounded-xl">
                      <p className="text-green-400 text-sm font-bold flex items-center gap-2">
                         <span className="text-lg">💡</span> {mistake.fix}
                      </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center mt-8">
            <Link href="/chat">
                <Button className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 h-14 px-8 text-lg rounded-2xl transition-all font-bold">
                    افحص مخاطر مشروعك مع حارس الأخطاء <ArrowLeft className="mr-3 h-5 w-5 icon-flip" />
                </Button>
            </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
