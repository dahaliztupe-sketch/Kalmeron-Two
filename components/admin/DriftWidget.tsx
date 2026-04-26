"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface AgentDriftReport {
  agent: string;
  samples: number;
  successRate: number;
  avgLatencyMs: number;
  driftScore: number;
  topErrors: Array<{ code: string; count: number }>;
}

export function DriftWidget({ windowDays = 7 }: { windowDays?: number }) {
  const { user } = useAuth();
  const [reports, setReports] = useState<AgentDriftReport[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const r = await fetch(`/api/admin/drift?days=${windowDays}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        if (!cancel) {
          setReports(j.agents || []);
          setErr(null);
        }
      } catch (e: unknown) {
        if (!cancel) setErr(e.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [user, windowDays]);

  return (
    <Card className="bg-dark-surface/60 border-white/10">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-blue" />
          مراقبة الانجراف ({windowDays} أيام)
        </CardTitle>
        <span className="text-xs text-text-secondary">{reports.length} مساعد</span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-text-secondary">جاري التحميل...</p>
        ) : err ? (
          <p className="text-sm text-rose-300">
            {err.includes("forbidden") || err.includes("auth_required")
              ? "متاح للمشرفين فقط (أضف بريدك إلى ADMIN_EMAILS)."
              : `تعذر جلب التقرير: ${err}`}
          </p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-text-secondary">
            لا توجد بيانات انجراف بعد. سيتم تجميعها مع كل استدعاء مساعد.
          </p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {reports.slice(0, 12).map((r) => {
              const sev =
                r.driftScore >= 0.7 ? "rose" : r.driftScore >= 0.4 ? "amber" : "emerald";
              const colors: Record<string, string> = {
                rose: "bg-rose-500/10 border-rose-500/30 text-rose-300",
                amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
                emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
              };
              const barColors: Record<string, string> = {
                rose: "bg-rose-500",
                amber: "bg-amber-500",
                emerald: "bg-emerald-500",
              };
              return (
                <li key={r.agent} className={`p-3 rounded-lg border text-sm ${colors[sev]}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-white">{r.agent}</span>
                    <span className="text-xs">
                      {(r.successRate * 100).toFixed(1)}% • {r.avgLatencyMs.toFixed(0)}ms •{" "}
                      {r.samples} عينة
                    </span>
                  </div>
                  <div className="h-1.5 mt-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full transition-all ${barColors[sev]}`}
                      style={{ width: `${Math.round(r.driftScore * 100)}%` }}
                    />
                  </div>
                  {r.topErrors?.length > 0 && (
                    <div className="text-xs mt-2 opacity-80">
                      أخطاء: {r.topErrors.map((e) => `${e.code}×${e.count}`).join("، ")}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
