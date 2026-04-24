"use client";

import { useEffect, useState } from "react";
import { Clock, TrendingUp, Users, Sparkles } from "lucide-react";

interface TtfvSummary {
  totalUsersWithSignup: number;
  totalUsersWithFirstValue: number;
  medianColdMs: number | null;
  medianWarmMs: number | null;
  p90ColdMs: number | null;
  p90WarmMs: number | null;
}

function fmtMs(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} ث`;
  const m = s / 60;
  if (m < 60) return `${m.toFixed(1)} د`;
  const h = m / 60;
  return `${h.toFixed(1)} س`;
}

/**
 * TtfvWidget — admin tile that renders the median + p90 of Time-to-First-Value
 * for the cold (signup → first message) and warm (first message → first value)
 * stages. Reads `getTtfvSummary` via `/api/admin/ttfv-summary`.
 *
 * P0-3 from the 45-expert business audit.
 */
export function TtfvWidget() {
  const [data, setData] = useState<TtfvSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/admin/ttfv-summary", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as TtfvSummary;
        if (alive) { setData(j); setError(null); }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "fetch failed");
      }
    })();
    return () => { alive = false; };
  }, []);

  const activationRate = data && data.totalUsersWithSignup > 0
    ? Math.round((data.totalUsersWithFirstValue / data.totalUsersWithSignup) * 100)
    : null;

  return (
    <div dir="rtl" className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-cyan-300" />
        <h3 className="font-bold text-white">زمن الوصول لأول قيمة (TTFV)</h3>
      </div>
      {error && (
        <p className="text-rose-300 text-xs">تعذّر التحميل: {error}</p>
      )}
      {!data && !error && (
        <p className="text-text-secondary text-xs">جاري التحميل…</p>
      )}
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Tile icon={Users} label="مسجلون" value={data.totalUsersWithSignup.toLocaleString("ar-EG")} />
            <Tile icon={TrendingUp} label="معدل التفعيل" value={activationRate != null ? `${activationRate}%` : "—"} accent />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-secondary mb-2">المرحلة الباردة (تسجيل ← أول رسالة)</p>
            <div className="flex gap-3">
              <Mini label="الوسيط" value={fmtMs(data.medianColdMs)} />
              <Mini label="P90" value={fmtMs(data.p90ColdMs)} />
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-secondary mb-2">المرحلة الدافئة (أول رسالة ← أول قيمة)</p>
            <div className="flex gap-3">
              <Mini label="الوسيط" value={fmtMs(data.medianWarmMs)} />
              <Mini label="P90" value={fmtMs(data.p90WarmMs)} />
            </div>
          </div>
          <p className="text-[10px] text-text-secondary">
            الهدف 6 أشهر: بارد ≤ 8 د، دافئ ≤ 30 ث · الهدف 12 شهر: بارد ≤ 4 د، دافئ ≤ 15 ث.
          </p>
        </div>
      )}
    </div>
  );
}

function Tile({ icon: Icon, label, value, accent }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${accent ? "text-emerald-300" : "text-cyan-300"}`} />
        <span className="text-[10px] uppercase tracking-wider text-text-secondary">{label}</span>
      </div>
      <div className={`text-lg font-bold tabular-nums ${accent ? "text-emerald-300" : "text-white"}`}>{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5 text-center">
      <div className="text-[10px] text-text-secondary uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold text-white tabular-nums mt-0.5 inline-flex items-center gap-1">
        <Clock className="w-3 h-3 text-text-secondary" /> {value}
      </div>
    </div>
  );
}
