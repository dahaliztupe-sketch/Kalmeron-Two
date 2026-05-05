"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { apiJson } from "@/src/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "motion/react";
import { Bell, CheckCheck, X, Zap, ShieldAlert, TrendingUp, Info, RefreshCw } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Item {
  id: string;
  type: "info" | "success" | "warning" | "alert" | string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt?: { seconds?: number; toDate?: () => Date } | string | number | null;
}

function parseDate(createdAt: Item["createdAt"]): Date | null {
  if (!createdAt) return null;
  if (typeof createdAt === "object" && "seconds" in createdAt && createdAt.seconds) {
    return new Date(createdAt.seconds * 1000);
  }
  if (typeof createdAt === "object" && "toDate" in createdAt && typeof createdAt.toDate === "function") {
    return createdAt.toDate();
  }
  const d = new Date(createdAt as string);
  return isNaN(d.getTime()) ? null : d;
}

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; dot: string }> = {
  success:  { icon: Zap,        color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  warning:  { icon: ShieldAlert, color: "text-amber-400",   bg: "bg-amber-500/10",   dot: "bg-amber-400"   },
  alert:    { icon: ShieldAlert, color: "text-rose-400",    bg: "bg-rose-500/10",    dot: "bg-rose-400"    },
  info:     { icon: Info,       color: "text-cyan-400",    bg: "bg-cyan-500/10",    dot: "bg-cyan-400"    },
  trending: { icon: TrendingUp,  color: "text-indigo-400",  bg: "bg-indigo-500/10",  dot: "bg-indigo-400"  },
};
const DEFAULT_TYPE = TYPE_CONFIG.info;

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? DEFAULT_TYPE;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiJson<{ items: Item[]; unread: number }>("/api/account/notifications");
      setItems(res.items || []);
      setUnread(res.unread || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [user, load]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markAll() {
    try {
      await apiJson("/api/account/notifications", {
        method: "POST",
        body: JSON.stringify({ all: true }),
      });
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
      setUnread(0);
    } catch {}
  }

  async function markOne(id: string) {
    try {
      await apiJson("/api/account/notifications", {
        method: "POST",
        body: JSON.stringify({ ids: [id] }),
      });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
      setUnread((n) => Math.max(0, n - 1));
    } catch {}
  }

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        aria-label={`الإشعارات (${unread} غير مقروءة)`}
        onClick={() => { setOpen((v) => !v); if (!open) load(); }}
        className={cn(
          "relative p-2 rounded-xl transition-all",
          open
            ? "bg-white/[0.07] text-white"
            : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
        )}
      >
        <Bell className="w-[18px] h-[18px]" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black leading-none border border-[#04060B]"
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            dir="rtl"
            className={cn(
              "absolute top-full mt-2 z-[200]",
              "w-[340px] max-h-[480px] flex flex-col",
              "bg-[#0B1020]/95 border border-white/[0.09] rounded-2xl",
              "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]",
              "backdrop-blur-xl overflow-hidden",
              "end-0"
            )}
            role="region"
            aria-label="الإشعارات"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-sm font-bold text-white">الإشعارات</span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full border border-rose-500/30">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {loading && <RefreshCw className="w-3 h-3 text-neutral-500 animate-spin" />}
                {unread > 0 && (
                  <button
                    onClick={markAll}
                    className="flex items-center gap-1 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-2 py-1 rounded-lg transition-all"
                  >
                    <CheckCheck className="w-3 h-3" /> قراءة الكل
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <ul className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-white/[0.04]">
              {items.length === 0 ? (
                <li className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
                    <Bell className="w-4 h-4 text-neutral-600" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-500">لا توجد إشعارات</p>
                  <p className="text-xs text-neutral-600 mt-1">ستظهر هنا كل التحديثات والتنبيهات</p>
                </li>
              ) : (
                items.map((it) => {
                  const cfg = getConfig(it.type);
                  const Icon = cfg.icon;
                  const date = parseDate(it.createdAt);

                  return (
                    <li key={it.id}>
                      <div className={cn("flex gap-3 px-4 py-3 group transition-colors", !it.read && "bg-white/[0.025]")}>
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                          <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={it.href || "#"}
                            onClick={() => { if (!it.read) markOne(it.id); setOpen(false); }}
                            className="block"
                          >
                            <p className={cn("text-[13px] font-semibold leading-snug truncate", it.read ? "text-neutral-300" : "text-white")}>
                              {it.title}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {it.body}
                            </p>
                            {date && (
                              <p className="text-[10px] text-neutral-600 mt-1">
                                {formatDistanceToNow(date, { addSuffix: true, locale: ar })}
                              </p>
                            )}
                          </Link>
                        </div>
                        <div className="flex items-start gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!it.read && (
                            <button
                              onClick={() => markOne(it.id)}
                              className="p-1 rounded-lg hover:bg-white/10 text-neutral-600 hover:text-emerald-400 transition-colors"
                              title="تحديد كمقروء"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {!it.read && (
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-2", cfg.dot)} />
                        )}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer */}
            <div className="shrink-0 px-4 py-2.5 border-t border-white/[0.06]">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-[11px] font-semibold text-neutral-500 hover:text-cyan-300 transition-colors py-1"
              >
                عرض كل الإشعارات ←
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
