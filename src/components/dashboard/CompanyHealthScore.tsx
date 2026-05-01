"use client";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import {
  TrendingUp, ArrowLeft, CheckCircle2, AlertTriangle,
  Target, DollarSign, Users, Zap,
} from "lucide-react";

interface HealthDimension {
  id: string;
  label: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  status: "good" | "warn" | "alert";
  tip: string;
}

function computeScore(dbUser: Record<string, unknown> | null): HealthDimension[] {
  const stage = (dbUser?.startup_stage as string) || "";
  const goals = (dbUser?.goals as string[]) || [];
  const hasCompany = !!dbUser?.company_name;
  const industry = !!dbUser?.industry;
  const location = !!dbUser?.governorate;

  const profileScore = [hasCompany, industry, location, !!stage].filter(Boolean).length * 25;

  const dimensions: HealthDimension[] = [
    {
      id: "profile",
      label: "ملف الشركة",
      score: profileScore,
      icon: Target,
      href: "/settings",
      status: profileScore >= 75 ? "good" : profileScore >= 50 ? "warn" : "alert",
      tip: profileScore < 100 ? "أكمل بيانات شركتك لتحسين دقة التحليلات" : "ملفك الشركاتي مكتمل",
    },
    {
      id: "strategy",
      label: "الاستراتيجية",
      score: goals.length > 0 ? Math.min(100, goals.length * 17) : 10,
      icon: TrendingUp,
      href: "/roadmap",
      status: goals.length >= 3 ? "good" : goals.length >= 1 ? "warn" : "alert",
      tip: goals.length < 3 ? "حدد 3 أهداف على الأقل من صفحة الإعداد" : "أهدافك الاستراتيجية محددة",
    },
    {
      id: "finance",
      label: "الوضع المالي",
      score: stage === "growth" ? 80 : stage === "foundation" ? 60 : stage === "mvp" ? 40 : stage === "validation" ? 30 : 20,
      icon: DollarSign,
      href: "/cash-runway",
      status: stage === "growth" ? "good" : stage === "foundation" ? "warn" : "alert",
      tip: "أدخل بيانات التدفق المالي في حاسبة Runway للحصول على تحليل أدق",
    },
    {
      id: "team",
      label: "الفريق",
      score: stage === "growth" ? 75 : stage === "foundation" ? 55 : 30,
      icon: Users,
      href: "/company-builder",
      status: stage === "growth" ? "good" : stage === "foundation" ? "warn" : "alert",
      tip: "بنّ هيكلك التنظيمي في Company Builder",
    },
    {
      id: "execution",
      label: "التنفيذ",
      score: 50,
      icon: Zap,
      href: "/workflows-runner",
      status: "warn",
      tip: "استخدم سير العمل لأتمتة المهام المتكررة",
    },
  ];

  return dimensions;
}

function getOverallScore(dims: HealthDimension[]) {
  return Math.round(dims.reduce((sum, d) => sum + d.score, 0) / dims.length);
}

function getScoreLabel(score: number) {
  if (score >= 80) return { label: "ممتاز", color: "text-emerald-400", bg: "from-emerald-500 to-teal-500" };
  if (score >= 60) return { label: "جيد", color: "text-cyan-400", bg: "from-cyan-500 to-indigo-500" };
  if (score >= 40) return { label: "يحتاج تطوير", color: "text-amber-400", bg: "from-amber-500 to-orange-500" };
  return { label: "يحتاج اهتمام", color: "text-rose-400", bg: "from-rose-500 to-red-500" };
}

const STATUS_COLORS = {
  good:  { bar: "bg-emerald-400", text: "text-emerald-400" },
  warn:  { bar: "bg-amber-400",   text: "text-amber-400" },
  alert: { bar: "bg-rose-400",    text: "text-rose-400" },
};

export function CompanyHealthScore() {
  const { dbUser } = useAuth();
  const dims = computeScore(dbUser as Record<string, unknown> | null);
  const overall = getOverallScore(dims);
  const { label, color, bg } = getScoreLabel(overall);
  const alerts = dims.filter((d) => d.status === "alert");

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
            <p className="text-xs text-neutral-500">بناءً على ملفك وأهدافك</p>
          </div>
          {/* Circular score */}
          <div className="flex flex-col items-center">
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
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-3 mb-4">
          {dims.map((dim) => {
            const Icon = dim.icon;
            const sc = STATUS_COLORS[dim.status];
            return (
              <Link key={dim.id} href={dim.href}
                className="flex items-center gap-3 group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">{dim.label}</span>
                    <span className={cn("text-xs font-bold", sc.text)}>{dim.score}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", sc.bar)}
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Alert */}
        {alerts.length > 0 ? (
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80 leading-relaxed">{alerts[0].tip}</p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300/80">كل المؤشرات في وضع جيد — استمر!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
