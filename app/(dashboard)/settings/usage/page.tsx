"use client";
import { useEffect, useState } from "react";
import { PageShell, Card, Skeleton, ErrorBlock } from "@/components/ui/page-shell";
import { apiJson } from "@/src/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

interface Summary {
  tier: string;
  limits: any;
  usage: { dailyRuns: number; monthlyTokens: number; monthlyCostUSD: number };
  percent: { dailyRuns: number; monthlyTokens: number; monthlyCostUSD: number };
}

function Bar({ label, value, max, pct }: { label: string; value: number | string; max: number | string; pct: number }) {
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

export default function UsagePage() {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState("");
  const [data, setData] = useState<Summary | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setWorkspaceId(localStorage.getItem("active_workspace") || user?.uid || "");
  }, [user]);

  async function load() {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const r = await apiJson<{ summary: Summary }>(`/api/account/usage?workspaceId=${encodeURIComponent(workspaceId)}`);
      setData(r.summary);
      setErr("");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (workspaceId) load(); }, [workspaceId]);

  return (
    <PageShell title="الاستخدام والحصص" subtitle="استهلاكك الحالي مقارنةً بحدود الباقة">
      {loading ? <Skeleton className="h-64" />
        : err ? <ErrorBlock error={err} retry={load} />
        : data && (
        <Card>
          <div className="mb-4">
            <span className="text-xs text-gray-500">الباقة الحالية</span>
            <div className="font-bold text-lg uppercase">{data.tier}</div>
          </div>
          <Bar label="عمليات تشغيل المساعدين (اليومية)" value={data.usage.dailyRuns} max={data.limits.dailyAgentRuns} pct={data.percent.dailyRuns} />
          <Bar label="الرموز (الشهرية)" value={data.usage.monthlyTokens.toLocaleString("ar")} max={data.limits.monthlyTokens.toLocaleString("ar")} pct={data.percent.monthlyTokens} />
          <Bar label="التكلفة (شهريًا، $)" value={data.usage.monthlyCostUSD.toFixed(2)} max={data.limits.monthlyCostUSD} pct={data.percent.monthlyCostUSD} />
        </Card>
      )}
    </PageShell>
  );
}
