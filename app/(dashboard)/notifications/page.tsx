"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson } from "@/src/lib/api-client";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import {
  Bell, CheckCheck, Zap, ShieldAlert, Info, TrendingUp,
  RefreshCw, CheckCircle2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

interface NotifItem {
  id: string;
  type: "info" | "success" | "warning" | "alert" | "trending" | string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt?: { seconds?: number; toDate?: () => Date } | string | number | null;
}

function parseDate(v: NotifItem["createdAt"]): Date | null {
  if (!v) return null;
  if (typeof v === "object" && "seconds" in v && v.seconds) return new Date(v.seconds * 1000);
  if (typeof v === "object" && "toDate" in v && typeof v.toDate === "function") return v.toDate();
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? null : d;
}

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  success: { icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  warning: { icon: ShieldAlert, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  alert: { icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  info: { icon: Info, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  trending: { icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
};
const DEFAULT_CFG = TYPE_CONFIG.info;

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiJson<{ items: NotifItem[]; unread: number }>("/api/account/notifications");
      setItems(res.items || []);
      setUnread(res.unread || 0);
    } catch {
      toast.error("تعذّر تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    async function run() { await load(); }
    void run();
  }, [load]);

  async function markAll() {
    try {
      await apiJson("/api/account/notifications", { method: "POST", body: JSON.stringify({ all: true }) });
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
      setUnread(0);
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    } catch {
      toast.error("خطأ في التحديث");
    }
  }

  async function markOne(id: string) {
    try {
      await apiJson("/api/account/notifications", { method: "POST", body: JSON.stringify({ ids: [id] }) });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
      setUnread((n) => Math.max(0, n - 1));
    } catch {}
  }

  const unreadItems = items.filter((i) => !i.read);
  const readItems = items.filter((i) => i.read);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-6 px-2 sm:px-0" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-cyan-400" />
              الإشعارات
            </h1>
            {unread > 0 && <p className="text-sm text-neutral-400 mt-1">{unread} إشعار غير مقروء</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            {unread > 0 && (
              <button onClick={markAll} className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-3 py-1.5 rounded-xl transition-all">
                <CheckCheck className="w-3.5 h-3.5" />
                قراءة الكل
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05]" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-white/[0.05] rounded-full w-2/3" />
                    <div className="h-2.5 bg-white/[0.03] rounded-full w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-neutral-600" />
            </div>
            <p className="text-white font-bold text-lg mb-2">لا توجد إشعارات</p>
            <p className="text-neutral-500 text-sm">ستظهر هنا كل تحديثاتك وتنبيهاتك</p>
          </div>
        ) : (
          <div className="space-y-6">
            {unreadItems.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                  غير مقروء ({unreadItems.length})
                </p>
                <div className="space-y-2">
                  <AnimatePresence>
                    {unreadItems.map((item) => {
                      const cfg = TYPE_CONFIG[item.type] ?? DEFAULT_CFG;
                      const Icon = cfg.icon;
                      const date = parseDate(item.createdAt);
                      return (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className={cn("rounded-2xl border p-4 flex gap-3 group transition-all hover:border-opacity-60", cfg.bg, cfg.border)}>
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
                            <Icon className={cn("w-4 h-4", cfg.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={item.href || "#"} onClick={() => markOne(item.id)} className="block">
                              <p className="text-sm font-bold text-white mb-0.5">{item.title}</p>
                              <p className="text-xs text-neutral-400 leading-relaxed">{item.body}</p>
                              {date && <p className="text-[10px] text-neutral-600 mt-1.5">{formatDistanceToNow(date, { addSuffix: true, locale: ar })}</p>}
                            </Link>
                          </div>
                          <button onClick={() => markOne(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-neutral-600 hover:text-emerald-400 transition-all shrink-0" title="تحديد كمقروء">
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {readItems.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-600 mb-3">مقروء ({readItems.length})</p>
                <div className="space-y-2">
                  {readItems.map((item) => {
                    const cfg = TYPE_CONFIG[item.type] ?? DEFAULT_CFG;
                    const Icon = cfg.icon;
                    const date = parseDate(item.createdAt);
                    return (
                      <div key={item.id} className="glass-panel rounded-2xl p-4 flex gap-3 opacity-60 hover:opacity-80 transition-opacity">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-neutral-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={item.href || "#"} className="block">
                            <p className="text-sm font-semibold text-neutral-300 mb-0.5">{item.title}</p>
                            <p className="text-xs text-neutral-500 leading-relaxed">{item.body}</p>
                            {date && <p className="text-[10px] text-neutral-600 mt-1.5">{formatDistanceToNow(date, { addSuffix: true, locale: ar })}</p>}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
