"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface CostEntry {
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  calls: number;
}

export function CostByModelWidget() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CostEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const r = await fetch(`/api/admin/llm-audit?summary=byModel`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        if (!cancel) {
          setEntries(j.byModel || []);
          setErr(null);
        }
      } catch (e: any) {
        if (!cancel) setErr(e.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [user]);

  const total = entries.reduce((s, e) => s + e.costUsd, 0);

  return (
    <Card className="bg-dark-surface/60 border-white/10">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          تكلفة اليوم لكل نموذج
        </CardTitle>
        <span className="text-sm font-bold text-emerald-400">${total.toFixed(4)}</span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-text-secondary">جاري التحميل...</p>
        ) : err ? (
          <p className="text-sm text-rose-300">
            {err.includes("forbidden") || err.includes("auth_required")
              ? "متاح للمشرفين فقط."
              : `تعذر جلب البيانات: ${err}`}
          </p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-text-secondary">لا توجد استدعاءات بعد.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => {
              const pct = total > 0 ? (e.costUsd / total) * 100 : 0;
              return (
                <li key={e.model} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono text-xs text-white">{e.model}</span>
                    <span className="text-text-secondary text-xs">
                      ${e.costUsd.toFixed(5)} • {e.calls} استدعاء •{" "}
                      {(e.inputTokens + e.outputTokens).toLocaleString("ar-EG")} رمز
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
