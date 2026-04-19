"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowLeft, Target, Wallet, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PlanPage() {
  const { language, t } = useLanguage();
  const dir = language === "ar" ? "rtl" : "ltr";

  const modules = [
    { title: "النموذج التجاري (Business Model)", icon: <Target className="h-6 w-6 text-[rgb(var(--azure))]" /> },
    { title: "التوقعات المالية (Financials)", icon: <Wallet className="h-6 w-6 text-[rgb(var(--azure))]" /> },
    { title: "خطة الدخول للسوق (Go-to-Market)", icon: <BarChart3 className="h-6 w-6 text-[rgb(var(--azure))]" /> }
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-10 p-4 text-white" dir={dir}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black tracking-tight mb-4 flex items-center gap-3 text-[rgb(var(--azure))]">
            <FileText className="h-10 w-10 text-[rgb(var(--azure))]" />
            خطة العمل: هندسة المستقبل
          </h1>
          <p className="text-neutral-400 text-xl leading-relaxed max-w-3xl font-medium">
            تحويل الرؤية إلى مستندات استراتيجية احترافية، تشمل عرض المستثمرين (<bdi dir="ltr">Pitch Deck</bdi>) والخطط المالية والتشغيلية المتكاملة القابلة للتنفيذ.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((m, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}>
                    <Card className="glass border-[rgb(var(--azure))]/20 bg-[rgb(var(--azure))]/5 hover:bg-[rgb(var(--azure))]/10 transition-all shadow-lg rounded-3xl h-32 flex items-center justify-center cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-[rgb(var(--azure))]/50"></div>
                        <CardContent className="p-0 flex items-center gap-4 text-white font-bold text-lg group-hover:scale-105 transition-transform">
                            {m.icon}
                            {m.title}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex justify-center mt-12 bg-[#16161D]/50 border border-neutral-800 p-10 rounded-3xl items-center flex-col md:flex-row gap-6 justify-between shadow-2xl">
            <div className="text-right">
                <h3 className="text-2xl font-bold text-white mb-2">مستعد لصياغة مستقبلك؟</h3>
                <p className="text-neutral-400 text-lg">باني الخطط سيقوم بعمل جلسة استشارية معك لصياغة أدق تفاصيل مشروعك.</p>
            </div>
            <Link href="/chat">
                <Button className="bg-[rgb(var(--azure))]/10 text-[rgb(var(--azure))] hover:bg-[rgb(var(--azure))]/20 hover:text-blue-300 border border-[rgb(var(--azure))]/30 h-14 px-10 text-lg rounded-2xl transition-all shrink-0 font-bold shadow-lg">
                    بدء صياغة خطة العمل <ArrowLeft className="mr-3 h-5 w-5 icon-flip" />
                </Button>
            </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
