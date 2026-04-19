"use client";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface DashboardContentProps {
  initialInsight: string;
}

export function DashboardContent({ initialInsight }: DashboardContentProps) {
  return (
    <div className="space-y-12">
      <header>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black tracking-tight"
        >
          أهلاً بك في غرفة القيادة
        </motion.h1>
        <p className="text-neutral-400 mt-2 text-xl font-medium">كل الأدوات التي تحتاجها لبناء المستقبل أمامك الآن.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="glass bg-[#16161D]/50 border-neutral-700/50 rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[rgb(var(--gold))] mb-4">مستشارك الذكي</h2>
              <p className="text-neutral-300 text-lg">ابدأ محادثة مع كلميرون لتحويل رؤيتك إلى واقع ملموس بخبرة السوق المصري.</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="lg:col-span-2">
          <Card className="glass bg-[rgba(244,180,26,0.05)] border-[rgba(244,180,26,0.1)] rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                 <h2 className="text-2xl font-bold text-white uppercase tracking-widest">تحليل المخاطر المباشر</h2>
              </div>
              <p className="text-neutral-200 text-xl leading-relaxed italic">{initialInsight}</p>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
