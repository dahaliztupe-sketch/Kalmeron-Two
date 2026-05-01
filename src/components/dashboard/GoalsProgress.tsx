"use client";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import {
  Brain, Briefcase, FlaskConical, Scale, Radar, Shield,
  CheckCircle2, Circle, ArrowLeft,
} from "lucide-react";

const GOAL_META: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  cta: string;
}> = {
  idea_analysis:  { label: "تحليل الفكرة",          icon: Brain,        href: "/ideas/analyze",        color: "cyan",    cta: "ابدأ التحليل" },
  business_plan:  { label: "خطة عمل للمستثمر",       icon: Briefcase,    href: "/workflows-runner",     color: "indigo",  cta: "ابنِ خطتك" },
  market_research:{ label: "بحث سوقي",              icon: FlaskConical,  href: "/ideas/analyze",        color: "fuchsia", cta: "استكشف السوق" },
  legal:          { label: "تأسيس قانوني",           icon: Scale,         href: "/chat?q=ما+وثائق+التأسيس", color: "amber", cta: "استشر المحامي" },
  funding:        { label: "إيجاد تمويل",            icon: Radar,         href: "/opportunities",        color: "emerald", cta: "اكتشف الفرص" },
  risk:           { label: "تجنب الأخطاء",           icon: Shield,        href: "/mistake-shield",       color: "rose",    cta: "درع الأخطاء" },
};

const COLOR_CLASSES: Record<string, { icon: string; bg: string; border: string; dot: string }> = {
  cyan:    { icon: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/25",    dot: "bg-cyan-400" },
  indigo:  { icon: "text-indigo-400",  bg: "bg-indigo-500/10",  border: "border-indigo-500/25",  dot: "bg-indigo-400" },
  fuchsia: { icon: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/25", dot: "bg-fuchsia-400" },
  amber:   { icon: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/25",   dot: "bg-amber-400" },
  emerald: { icon: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  rose:    { icon: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/25",    dot: "bg-rose-400" },
};

export function GoalsProgress() {
  const { dbUser } = useAuth();
  const goals = (dbUser?.goals as string[]) || [];

  if (goals.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          أهدافك التأسيسية
        </h3>
        <p className="text-xs text-neutral-500 mb-3">لم تحدد أهدافاً بعد</p>
        <Link href="/settings"
          className="inline-flex items-center gap-2 text-xs text-brand-cyan hover:text-white transition-colors"
        >
          أضف أهدافك <ArrowLeft className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          أهدافك التأسيسية
        </h3>
        <span className="text-xs text-neutral-500">{goals.length} هدف</span>
      </div>

      <div className="space-y-2">
        {goals.map((goalId) => {
          const meta = GOAL_META[goalId];
          if (!meta) return null;
          const c = COLOR_CLASSES[meta.color];
          const Icon = meta.icon;

          return (
            <Link key={goalId} href={meta.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border transition-all group hover:border-opacity-60",
                c.bg, c.border
              )}
            >
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", c.bg)}>
                <Icon className={cn("w-3.5 h-3.5", c.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{meta.label}</p>
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                c.bg, c.border, c.icon
              )}>
                {meta.cta}
              </span>
              <Circle className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0 group-hover:hidden" />
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 hidden group-hover:block" />
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.05]">
        <Link href="/roadmap"
          className="flex items-center justify-between text-xs text-neutral-500 hover:text-white transition-colors"
        >
          <span>عرض خارطة الطريق الكاملة</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
