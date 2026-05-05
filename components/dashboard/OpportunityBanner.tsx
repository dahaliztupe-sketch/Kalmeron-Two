"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { X, Timer, ExternalLink, Sparkles } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  type?: string;
  organizer?: string | null;
  deadline?: string | null;
  link?: string | null;
}

function useCountdown(deadline: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!deadline) return;
    const target = new Date(deadline);
    if (isNaN(target.getTime())) return;

    function calc() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      const days    = Math.floor(diff / 86400000);
      const hours   = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return timeLeft;
}

function isWithin7Days(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  const target = new Date(deadline);
  if (isNaN(target.getTime())) return false;
  const diff = target.getTime() - Date.now();
  return diff > 0 && diff <= 7 * 24 * 3600 * 1000;
}

const DISMISS_KEY = "kalmeron_opportunity_banner_dismissed_v1";

export function OpportunityBanner({ opportunity }: { opportunity: Opportunity | null | undefined }) {
  const [dismissed, setDismissed] = useState(false);
  const countdown = useCountdown(opportunity?.deadline);

  // Recompute dismissed state whenever the opportunity id changes so that
  // a new opportunity that arrives in the same session is not hidden because
  // the user dismissed a different (previous) opportunity.
  useEffect(() => {
    async function syncDismissed() {
      if (!opportunity?.id) { setDismissed(false); return; }
      try {
        const raw = sessionStorage.getItem(DISMISS_KEY);
        setDismissed(raw === opportunity.id);
      } catch {
        setDismissed(false);
      }
    }
    void syncDismissed();
  }, [opportunity?.id]);

  const dismiss = () => {
    setDismissed(true);
    try {
      if (opportunity?.id) sessionStorage.setItem(DISMISS_KEY, opportunity.id);
    } catch {}
  };

  const show = !dismissed && !!opportunity && isWithin7Days(opportunity.deadline);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -12, height: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="overflow-hidden mb-4"
        >
          <div
            dir="rtl"
            className="relative rounded-2xl border border-amber-500/30 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(251,191,36,0.06) 50%, rgba(245,158,11,0.08) 100%)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-orange-400/10 blur-3xl" />
            </div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-amber-400/80 font-semibold uppercase tracking-wide mb-0.5">
                    فرصة تنتهي قريباً
                  </p>
                  <p className="text-sm font-bold text-white leading-snug truncate">
                    {opportunity!.title}
                  </p>
                  {opportunity!.organizer && (
                    <p className="text-[11px] text-neutral-400 mt-0.5">{opportunity!.organizer}</p>
                  )}
                </div>
              </div>

              {countdown && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Timer className="w-3.5 h-3.5 text-amber-400" />
                  <div className="flex items-center gap-1">
                    {countdown.days > 0 && (
                      <div className="text-center">
                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-1 min-w-[36px] text-center">
                          <span className="text-sm font-extrabold text-amber-200 tabular-nums">{countdown.days}</span>
                        </div>
                        <p className="text-[9px] text-amber-500/70 mt-0.5 text-center">يوم</p>
                      </div>
                    )}
                    {countdown.days > 0 && <span className="text-amber-500/50 font-bold mb-3">:</span>}
                    <div className="text-center">
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-1 min-w-[36px] text-center">
                        <span className="text-sm font-extrabold text-amber-200 tabular-nums">
                          {String(countdown.hours).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-[9px] text-amber-500/70 mt-0.5 text-center">ساعة</p>
                    </div>
                    <span className="text-amber-500/50 font-bold mb-3">:</span>
                    <div className="text-center">
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-1 min-w-[36px] text-center">
                        <span className="text-sm font-extrabold text-amber-200 tabular-nums">
                          {String(countdown.minutes).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-[9px] text-amber-500/70 mt-0.5 text-center">دقيقة</p>
                    </div>
                    {countdown.days === 0 && (
                      <>
                        <span className="text-amber-500/50 font-bold mb-3">:</span>
                        <div className="text-center">
                          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-2 py-1 min-w-[36px] text-center">
                            <span className="text-sm font-extrabold text-amber-300 tabular-nums">
                              {String(countdown.seconds).padStart(2, "0")}
                            </span>
                          </div>
                          <p className="text-[9px] text-amber-500/70 mt-0.5 text-center">ثانية</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={opportunity!.link || "/opportunities"}
                  target={opportunity!.link ? "_blank" : undefined}
                  rel={opportunity!.link ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  التفاصيل
                </Link>
                <button
                  onClick={dismiss}
                  aria-label="إغلاق"
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
