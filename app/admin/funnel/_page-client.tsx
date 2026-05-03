"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface StageRow {
  stage: string;
  labelAr: string;
  count7d: number;
  count30d: number;
  conversionFromPrev7d: number | null;
  conversionFromPrev30d: number | null;
}

interface FunnelResponse {
  generatedAt: string;
  rows: StageRow[];
  summary: { visitsToActivation: { d7: number | null; d30: number | null }; activationToPaid: { d7: number | null; d30: number | null } };
}

function pct(v: number | null): string { if (v == null) return "—"; return (v * 100).toFixed(1) + "%"; }
function isHealthy(v: number | null, threshold: number): boolean | null { if (v == null) return null; return v >= threshold; }

export default function FunnelDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<FunnelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/funnel", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body?.message || `HTTP ${res.status}`); }
        const json = (await res.json()) as FunnelResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "unknown");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <header><h1 className="font-display text-3xl font-extrabold text-white mb-1">قمع التحويل</h1><p className="text-text-secondary text-sm">معدّلات تحويل المستخدمين عبر مراحل المنتج (نوافذ 7 و 30 يوماً). البيانات مجمّعة فقط — لا يُكشَف أيّ معرّف فردي.</p></header>
        {loading && <div className="flex items-center gap-3 text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" /> جارِ تحميل البيانات...</div>}
        {error && <Card className="border-rose-500/30 bg-rose-500/[0.06]"><CardContent className="flex items-start gap-3 p-4 text-sm text-rose-200"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><div><div className="font-bold mb-1">تعذّر التحميل</div><div className="text-rose-200/80">{error}</div><div className="text-rose-200/60 mt-2 text-xs">تأكّد أنّك مُسجَّل بحساب Platform Admin (مُضاف في PLATFORM_ADMIN_UIDS).</div></div></CardContent></Card>}
        {data && (<><div className="grid sm:grid-cols-2 gap-4"><SummaryTile title="من زائر إلى مُفعَّل" description="نسبة الزوّار الذين أرسلوا أوّل رسالة" value={data.summary.visitsToActivation.d30} value7d={data.summary.visitsToActivation.d7} healthThreshold={0.05} /><SummaryTile title="من مُفعَّل إلى مدفوع" description="نسبة المُفعَّلين الذين اشتركوا في خطة" value={data.summary.activationToPaid.d30} value7d={data.summary.activationToPaid.d7} healthThreshold={0.10} /></div><Card><CardHeader><CardTitle>تحليل المراحل</CardTitle><CardDescription>كل مرحلة + معدّل التحويل من المرحلة السابقة</CardDescription></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-text-secondary border-b border-white/[0.06]"><th className="text-right py-3 font-semibold">المرحلة</th><th className="text-left py-3 font-semibold tabular-nums">7 أيام</th><th className="text-left py-3 font-semibold tabular-nums">↪ تحويل 7 أيام</th><th className="text-left py-3 font-semibold tabular-nums">30 يوم</th><th className="text-left py-3 font-semibold tabular-nums">↪ تحويل 30 يوم</th></tr></thead><tbody>{data.rows.map((row, idx) => <tr key={row.stage} className="border-b border-white/[0.04] last:border-0"><td className="py-3 text-white"><div className="flex items-center gap-2"><span className="text-text-secondary text-xs tabular-nums">{String(idx + 1).padStart(2, "0")}</span>{row.labelAr}</div></td><td className="text-left tabular-nums text-white">{row.count7d.toLocaleString("en-US")}</td><td className="text-left tabular-nums text-text-secondary">{pct(row.conversionFromPrev7d)}</td><td className="text-left tabular-nums text-white">{row.count30d.toLocaleString("en-US")}</td><td className="text-left tabular-nums text-text-secondary">{pct(row.conversionFromPrev30d)}</td></tr>)}</tbody></table></div></CardContent></Card><p className="text-[11px] text-text-secondary/60 text-center">آخر تحديث: {new Date(data.generatedAt).toLocaleString("ar-EG")}</p></>)}
      </div>
    </AppShell>
  );
}

function SummaryTile({ title, description, value, value7d, healthThreshold }: { title: string; description: string; value: number | null; value7d: number | null; healthThreshold: number; }) {
  const healthy = isHealthy(value, healthThreshold);
  return (<Card><CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><div className="flex items-baseline gap-3 mb-2"><span className="font-display text-3xl font-extrabold text-white tabular-nums">{pct(value)}</span>{healthy != null && (healthy ? <span className="inline-flex items-center gap-1 text-emerald-300 text-xs"><TrendingUp className="h-3 w-3" /> صحّي</span> : <span className="inline-flex items-center gap-1 text-amber-300 text-xs"><TrendingDown className="h-3 w-3" /> دون العتبة</span>)}</div><div className="text-[11px] text-text-secondary">7 أيام: <span className="tabular-nums text-white">{pct(value7d)}</span><span className="mx-2 text-white/20">·</span> عتبة: <span className="tabular-nums">{pct(healthThreshold)}</span></div></CardContent></Card>);
}
