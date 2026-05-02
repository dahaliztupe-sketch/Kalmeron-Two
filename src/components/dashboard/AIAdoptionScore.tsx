"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, ArrowLeft, Zap } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface UsageMetrics {
  totalConversations?: number;
  totalAgentsUsed?: number;
  agentCount?: number;
}

interface AIAdoptionScoreProps {
  metrics?: UsageMetrics;
}

function computeAdoptionScore(metrics: UsageMetrics): { score: number; level: string; color: string; tips: string[] } {
  const conversations = metrics.totalConversations ?? 0;
  const agentsUsed = metrics.totalAgentsUsed ?? 0;

  let score = 0;
  if (conversations >= 1) score += 20;
  if (conversations >= 5) score += 15;
  if (conversations >= 20) score += 15;
  if (agentsUsed >= 1) score += 10;
  if (agentsUsed >= 3) score += 15;
  if (agentsUsed >= 7) score += 15;
  if (agentsUsed >= 15) score += 10;

  score = Math.min(100, score);

  const tips: string[] = [];
  if (conversations < 5) tips.push("جرّب المساعد الذكي لتحليل أسئلة عملك اليومية");
  if (agentsUsed < 3) tips.push("استكشف وكلاء متخصصين: المالي، القانوني، التسويقي");
  if (agentsUsed < 7) tips.push("جرّب كانفاس الأعمال أو اكتشاف العملاء");
  if (score < 50) tips.push("استخدم دفتر القرارات لتوثيق قراراتك الأسبوعية");

  const level =
    score >= 80 ? "متقدم" :
    score >= 60 ? "متمكّن" :
    score >= 40 ? "نامٍ" :
    score >= 20 ? "مبتدئ" : "جديد";

  const color =
    score >= 80 ? "from-emerald-500 to-teal-500" :
    score >= 60 ? "from-cyan-500 to-blue-500" :
    score >= 40 ? "from-violet-500 to-purple-500" :
    score >= 20 ? "from-amber-500 to-orange-500" : "from-white/20 to-white/10";

  return { score, level, color, tips };
}

export function AIAdoptionScore({ metrics = {} }: AIAdoptionScoreProps) {
  const [visible, setVisible] = useState(false);
  const { score, level, color, tips } = computeAdoptionScore(metrics);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.06]`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-white/50 font-medium">مؤشر تبنّي الذكاء الاصطناعي</span>
            </div>
            <div className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
              {score}٪
            </div>
            <div className="text-xs text-white/40 mt-0.5">{level}</div>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold",
            score >= 60 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : score >= 30 ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
              : "border-white/10 bg-white/5 text-white/40"
          )}>
            <TrendingUp className="w-3 h-3" />
            {score >= 60 ? "ممتاز" : score >= 30 ? "بحاجة تطوير" : "ابدأ الآن"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 rounded-full bg-white/[0.06] mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
            style={{ width: visible ? `${score}%` : "0%" }}
          />
        </div>

        {/* Tips */}
        {tips.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] text-white/30 font-medium uppercase tracking-wide">خطوات لتحسين مؤشرك</p>
            {tips.slice(0, 2).map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-white/50">
                <Zap className="w-3 h-3 text-violet-400 mt-0.5 shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        )}

        <Link href="/chat" className="mt-4 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
          ابدأ محادثة مع المساعد <ArrowLeft className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
