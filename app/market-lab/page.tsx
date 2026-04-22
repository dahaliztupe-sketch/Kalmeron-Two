"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/src/lib/firebase";
import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { FlaskConical, Plus, ArrowLeft, Loader2, Beaker, Microscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Experiment {
  id: string;
  title: string;
  status: "running" | "completed" | "failed";
  createdAt?: { seconds: number };
  hypothesis?: string;
  resultSummary?: string;
}

export default function MarketLabPage() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "market_experiments"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const snap = await getDocs(q);
        if (cancel) return;
        setExperiments(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Experiment, "id">) }))
        );
      } catch (err) {
        console.warn("[market-lab] failed to load experiments", err);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [user]);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
                <FlaskConical className="w-9 h-9 text-brand-gold" />
                مختبر السوق
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl">
                صمّم تجارب صغيرة لاختبار افتراضاتك السوقية قبل الالتزام بالموارد.
                كل تجربة تنتهي بقرار: تحقّق، تكييف، أو إيقاف.
              </p>
            </div>
            <Link href="/chat?q=ابدأ تجربة جديدة في مختبر السوق">
              <Button className="bg-gradient-to-tr from-brand-gold to-brand-blue text-white hover:opacity-90 h-12 px-6 rounded-2xl font-bold flex items-center gap-2 shrink-0">
                <Plus className="w-4 h-4" /> تجربة جديدة
              </Button>
            </Link>
          </div>
        </motion.header>

        {loading ? (
          <div className="flex items-center gap-3 text-text-secondary py-20 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> جاري تحميل التجارب...
          </div>
        ) : experiments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-3xl p-12 text-center"
          >
            <Beaker className="w-14 h-14 text-brand-gold/60 mx-auto mb-5" />
            <h3 className="text-xl font-bold text-white mb-2">لا توجد تجارب بعد</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              ابدأ تجربتك الأولى لاختبار فرضية سوقية محددة. سنوجّهك خطوة بخطوة.
            </p>
            <Link href="/chat?q=ساعدني في تصميم تجربة سوقية">
              <Button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white h-11 px-5 rounded-2xl gap-2">
                <Microscope className="w-4 h-4" /> تصميم أول تجربة
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {experiments.map((exp) => (
              <motion.div
                key={exp.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <Link href={`/market-lab/results/${exp.id}`} className="block h-full">
                  <div className="glass-panel rounded-3xl p-6 h-full hover:border-brand-gold/30 transition-all hover:-translate-y-0.5">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                          exp.status === "completed" && "bg-emerald-500/15 text-emerald-300",
                          exp.status === "running" && "bg-brand-blue/15 text-brand-blue animate-pulse",
                          exp.status === "failed" && "bg-rose-500/15 text-rose-300"
                        )}
                      >
                        {exp.status === "completed" ? "مكتملة" : exp.status === "running" ? "جارية" : "فشلت"}
                      </span>
                      <ArrowLeft className="w-4 h-4 text-text-secondary" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-2">
                      {exp.title || "تجربة بلا عنوان"}
                    </h3>
                    {exp.hypothesis && (
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 mb-3">
                        {exp.hypothesis}
                      </p>
                    )}
                    {exp.resultSummary && (
                      <p className="text-xs text-brand-gold/80 leading-relaxed line-clamp-2 border-t border-white/[0.05] pt-3 mt-auto">
                        {exp.resultSummary}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
