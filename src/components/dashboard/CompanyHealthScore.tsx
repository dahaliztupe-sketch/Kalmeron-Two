"use client";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  TrendingUp, CheckCircle2, AlertTriangle,
  Target, DollarSign, Zap, Activity, Loader2,
} from "lucide-react";

interface ApiDimension {
  id: string;
  label: string;
  score: number;
  max: number;
  tip: string;
}

interface ApiHealthScore {
  overall: number;
  dimensions: ApiDimension[];
  computedAt: string;
  cached: boolean;
}

const DIM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  profile: Target,
  activity: Activity,
  businessPlan: TrendingUp,
  finance: DollarSign,
  okrs: Zap,
};

const DIM_HREFS: Record<string, string> = {
  profile: "/settings",
  activity: "/chat",
  businessPlan: "/chat?q=" + encodeURIComponent("ساعدني في بناء خطة عمل احترافية"),
  finance: "/cash-runway",
  okrs: "/okr",
};

function getScoreLabel(score: number) {
  if (score >= 80) return { label: "ممتاز", color: "text-emerald-400" };
  if (score >= 60) return { label: "جيد", color: "text-cyan-400" };
  if (score >= 40) return { label: "يحتاج تطوير", color: "text-amber-400" };
  return { label: "يحتاج اهتمام", color: "text-rose-400" };
}

function getDimStatus(score: number, max: number): "good" | "warn" | "alert" {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.8) return "good";
  if (pct >= 0.4) return "warn";
  return "alert";
}

const STATUS_COLORS = {
  good:  { bar: "bg-emerald-400", text: "text-emerald-400" },
  warn:  { bar: "bg-amber-400",   text: "text-amber-400" },
  alert: { bar: "bg-rose-400",    text: "text-rose-400" },
};

export function CompanyHealthScore() {
  const { user } = useAuth();
  const [apiData, setApiData] = useState<ApiHealthScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    user.getIdToken().then((token) =>
      fetch("/api/dashboard/health-score", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
    ).then((r) => r.ok ? r.json() as Promise<ApiHealthScore> : null)
      .then((j) => { if (j) setApiData(j); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const overall = apiData?.overall ?? 0;
  const { label, color } = getScoreLabel(overall);
  const dims = apiData?.dimensions ?? [];
  const alertDims = dims.filter((d) => getDimStatus(d.score, d.max) === "alert");

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">صحة الشركة</span>
            </div>
            <p className="text-xs text-neutral-500">محسوب من بياناتك الفعلية</p>
          </div>
          {/* Circular score */}
          <div className="flex flex-col items-center">
            {loading ? (
              <div className="w-16 h-16 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : (
              <>
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                    <motion.circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="url(#healthGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={`${overall} 100`}
                      initial={{ strokeDasharray: "0 100" }}
                      animate={{ strokeDasharray: `${overall} 100` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    />
                    <defs>
                      <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-extrabold text-white">{overall}</span>
                  </div>
                </div>
                <span className={cn("text-xs font-bold mt-1", color)}>{label}</span>
              </>
            )}
          </div>
        </div>

        {/* Dimensions */}
        {!loading && dims.length > 0 && (
          <div className="space-y-3 mb-4">
            {dims.map((dim) => {
              const Icon = DIM_ICONS[dim.id] ?? Zap;
              const href = DIM_HREFS[dim.id] ?? "/dashboard";
              const status = getDimStatus(dim.score, dim.max);
              const sc = STATUS_COLORS[status];
              const pct = dim.max > 0 ? Math.round((dim.score / dim.max) * 100) : 0;
              return (
                <Link key={dim.id} href={href} className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">{dim.label}</span>
                      <span className={cn("text-xs font-bold", sc.text)}>{dim.score}/{dim.max}</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", sc.bar)}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Alert / Clear */}
        {!loading && (
          alertDims.length > 0 ? (
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300/80 leading-relaxed">{alertDims[0]!.tip}</p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300/80">كل المؤشرات في وضع جيد — استمر!</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
