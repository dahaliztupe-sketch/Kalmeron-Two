"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, Loader2, Brain, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

interface Skill {
  id: string;
  name: string;
  description: string;
  agentType: string;
  successRate: number;
  timesUsed: number;
  successes: number;
  failures: number;
  generation: number;
  source: string;
  enabled: boolean;
  updatedAt?: number | null;
  createdAt?: number | null;
}

const WORKSPACE_ID = "default";

function pct(x: number) { return Math.round((x || 0) * 100) + "%"; }
function timeago(ts: number | null | undefined) {
  if (!ts) return "—";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}ث`;
  if (s < 3600) return `${Math.floor(s / 60)}د`;
  if (s < 86400) return `${Math.floor(s / 3600)}س`;
  return `${Math.floor(s / 86400)}ي`;
}

const SOURCE_STYLE: Record<string, string> = {
  extracted: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  merged:    "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  refined:   "bg-amber-500/15 text-amber-300 border-amber-500/30",
};
const SOURCE_LABEL: Record<string, string> = {
  extracted: "مستخلص", merged: "مدمج", refined: "محسّن",
};

export default function SkillsPage() {
  const queryClient = useQueryClient();
  const skillsKey = ["skills", WORKSPACE_ID] as const;

  const { data: skills = [], isLoading: loading } = useQuery<Skill[]>({
    queryKey: skillsKey,
    queryFn: async () => {
      const r = await fetch(`/api/skills?workspaceId=${WORKSPACE_ID}`);
      const j = await r.json();
      return j.skills || [];
    },
  });

  const consolidateMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: WORKSPACE_ID }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillsKey });
      toast.success("تم دمج المهارات المتشابهة!");
    },
    onError: () => toast.error("تعذّر دمج المهارات"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await fetch(`/api/skills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: skillsKey }),
    onError: () => toast.error("تعذّر تغيير الحالة"),
  });

  const enabledCount = skills.filter((s) => s.enabled).length;
  const avgSuccess = skills.length
    ? skills.reduce((a, s) => a + (s.successRate || 0), 0) / skills.length
    : 0;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/[0.06] px-3 py-1 text-[11px] text-amber-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            المهارات المكتسبة · Self-Learning
          </div>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">المهارات المكتسبة</h1>
              <p className="text-sm text-neutral-400 max-w-xl">
                شجرة تطور المساعدين — مهارات جديدة تُستخلص تلقائياً من كل محادثة ناجحة.
              </p>
            </div>
            <button
              onClick={() => consolidateMutation.mutate()}
              disabled={consolidateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-700 hover:border-amber-500/40 text-neutral-400 hover:text-amber-300 text-sm font-medium transition-colors disabled:opacity-40"
            >
              {consolidateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              دمج المتشابهة
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "إجمالي المهارات", value: skills.length, color: "text-white" },
            { label: "المفعّلة", value: enabledCount, color: "text-emerald-400" },
            { label: "متوسط النجاح", value: pct(avgSuccess), color: avgSuccess >= 0.7 ? "text-emerald-400" : avgSuccess >= 0.4 ? "text-amber-400" : "text-rose-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-4 text-center">
              <div className={cn("text-2xl font-bold mb-1", stat.color)}>{stat.value}</div>
              <div className="text-xs text-neutral-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد مهارات بعد — ستظهر تلقائياً مع استخدام المساعدين.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "bg-neutral-900/60 border rounded-2xl p-4 transition-colors",
                  skill.enabled ? "border-neutral-700/50" : "border-neutral-800/30 opacity-50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{skill.name}</h3>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", SOURCE_STYLE[skill.source] || SOURCE_STYLE.extracted)}>
                        {SOURCE_LABEL[skill.source] || skill.source}
                      </span>
                      {skill.generation > 0 && (
                        <span className="text-[10px] text-neutral-500">الجيل {skill.generation}</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{skill.description}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1 text-xs">
                        {skill.successRate >= 0.7
                          ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        }
                        <span className={skill.successRate >= 0.7 ? "text-emerald-400" : "text-rose-400"}>
                          {pct(skill.successRate)}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-600">{skill.timesUsed} استخدام</span>
                      <span className="text-xs text-neutral-600">{skill.agentType}</span>
                      {skill.updatedAt && (
                        <span className="text-xs text-neutral-600">منذ {timeago(skill.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!skill.enabled && <AlertCircle className="w-4 h-4 text-neutral-600" />}
                    <button
                      onClick={() => toggleMutation.mutate({ id: skill.id, enabled: !skill.enabled })}
                      title={skill.enabled ? "تعطيل" : "تفعيل"}
                      className={cn(
                        "relative inline-flex h-5 w-9 rounded-full transition-colors",
                        skill.enabled ? "bg-emerald-500" : "bg-neutral-700"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5",
                        skill.enabled ? "translate-x-[18px]" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
