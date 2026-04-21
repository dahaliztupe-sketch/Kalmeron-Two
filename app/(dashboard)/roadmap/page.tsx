"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Clock, AlertCircle, PauseCircle, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskItem = {
  taskId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'awaiting_human';
  updatedAt?: string | number;
  department?: string;
};

const STATUS_META: Record<TaskItem['status'], { label: string; color: string; Icon: any }> = {
  completed:        { label: 'مكتمل',           color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', Icon: CheckCircle2 },
  in_progress:      { label: 'قيد التنفيذ',     color: 'text-brand-blue bg-brand-blue/10 border-brand-blue/30',     Icon: Clock },
  pending:          { label: 'في الانتظار',     color: 'text-text-secondary bg-white/5 border-white/10',            Icon: Hourglass },
  awaiting_human:   { label: 'ينتظر موافقتك',  color: 'text-brand-gold bg-brand-gold/10 border-brand-gold/30',     Icon: PauseCircle },
  failed:           { label: 'فشل',             color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',           Icon: AlertCircle },
};

export default function RoadmapPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const token = user ? await user.getIdToken().catch(() => null) : null;
        const res = await fetch('/api/dashboard', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!cancel) setTasks(data.teamActivity || []);
      } catch (e: any) {
        if (!cancel) setError('تعذر تحميل المخطط حالياً.');
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 15000);
    return () => { cancel = true; clearInterval(t); };
  }, [user]);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-extrabold text-white mb-2">المخطط</h1>
          <p className="text-text-secondary">جدول زمني تفاعلي يعرض ما ينفذه فريق وكلائك الآن.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin" /> جاري تحميل النشاط...
          </div>
        ) : error ? (
          <div className="glass-panel p-6 rounded-2xl text-rose-300">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center">
            <p className="text-lg font-bold text-white mb-2">لا توجد مهام بعد</p>
            <p className="text-text-secondary text-sm">ابدأ محادثة مع المساعد لتفعيل وكلائك.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute right-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-brand-gold/40 via-white/10 to-transparent" />
            <div className="space-y-4">
              {tasks.map((t, i) => {
                const meta = STATUS_META[t.status] || STATUS_META.pending;
                const Icon = meta.Icon;
                return (
                  <motion.div
                    key={t.taskId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative pr-12"
                  >
                    <div className={cn("absolute right-0 top-2 w-9 h-9 rounded-full flex items-center justify-center border", meta.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="glass-panel rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-white font-semibold leading-relaxed flex-1">{t.description}</p>
                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap", meta.color)}>
                          {meta.label}
                        </span>
                      </div>
                      {t.updatedAt && (
                        <p className="text-xs text-text-secondary/70">
                          {new Date(t.updatedAt).toLocaleString('ar-EG')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
