"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Loader2, PauseCircle,
  RefreshCw, ShieldCheck, XCircle, Zap, Megaphone,
} from "lucide-react";

interface FeedItem {
  id: string;
  actionId: string;
  label: string;
  input: Record<string, unknown>;
  rationale?: string | null;
  requestedBy?: string;
  status: string;
  result?: unknown;
  error?: string | null;
  createdAt?: number | null;
  decidedAt?: number | null;
  executedAt?: number | null;
}

interface FeedResponse {
  integrations: {
    meta: { configured: boolean; pageConfigured: boolean; requiredEnv: string[] };
  };
  summary: {
    pending: number;
    executed: number;
    executed_noop: number;
    failed: number;
    rejected: number;
  };
  pending: FeedItem[];
  recent: FeedItem[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: "بانتظار موافقتك",
  executed: "نُفِّذ فعلياً",
  executed_noop: "سُجِّل (محاكاة — لم يُنفَّذ خارجياً)",
  failed: "فشل",
  rejected: "رفضته",
  approved: "تمت الموافقة",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  executed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  executed_noop: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  failed: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  rejected: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  executed: CheckCircle2,
  executed_noop: ShieldCheck,
  failed: XCircle,
  rejected: PauseCircle,
};

function timeAgo(ms?: number | null): string {
  if (!ms) return "—";
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `قبل ${s} ث`;
  const m = Math.floor(s / 60);
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  return `قبل ${d} يوم`;
}

function agentNameOf(actionId: string, requestedBy?: string): string {
  if (requestedBy === "user") return "أنت";
  if (actionId.startsWith("meta_")) return "وكيل التسويق · Meta Ads";
  if (actionId === "send_email") return "وكيل المراسلات";
  if (actionId === "send_whatsapp") return "وكيل المراسلات · واتساب";
  if (actionId === "create_invoice_draft") return "وكيل العمليات · فواتير";
  if (actionId === "schedule_meeting") return "وكيل العمليات · اجتماعات";
  return requestedBy || "وكيل";
}

export default function OperationsRoomPage() {
  const { user } = useAuth();
  const [data, setData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const refresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/operations/feed?limit=80", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j: FeedResponse = await r.json();
      if (r.ok) setData(j);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.recent;
    return data.recent.filter((r) => r.status === filter);
  }, [data, filter]);

  const metaConfigured = data?.integrations?.meta?.configured;
  const pageConfigured = data?.integrations?.meta?.pageConfigured;

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-6xl mx-auto" dir="rtl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-brand-cyan" />
              غرفة العمليات
            </h1>
            <p className="text-neutral-400 mt-2 max-w-2xl">
              ترى هنا لحظياً كل ما ينفّذه فريق وكلائك في العالم الحقيقي — حملات إعلانية،
              رسائل، فواتير، اجتماعات. أنت المؤسّس، وهم الفريق المنفِّذ.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
            className="gap-2"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            تحديث
          </Button>
        </header>

        {!user ? (
          <Card className="bg-dark-surface/60 border-white/10">
            <CardContent className="p-6 text-text-secondary">سجّل دخولك لرؤية غرفة العمليات.</CardContent>
          </Card>
        ) : loading ? (
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin" /> جارِ تحميل أنشطة الفريق...
          </div>
        ) : !data ? (
          <Card className="bg-dark-surface/60 border-white/10">
            <CardContent className="p-6 text-text-secondary">تعذّر تحميل البيانات.</CardContent>
          </Card>
        ) : (
          <>
            {/* Integrations status */}
            <Card className="bg-dark-surface/60 border-white/10 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-brand-cyan" />
                  حالة اتصالات وكيل التسويق
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      metaConfigured
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }
                  >
                    {metaConfigured ? "Meta Ads متّصل ✓" : "Meta Ads غير متّصل (وضع المحاكاة)"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      pageConfigured
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-neutral-500/15 text-neutral-300 border-neutral-500/30"
                    }
                  >
                    {pageConfigured ? "صفحة Facebook مربوطة ✓" : "صفحة Facebook غير مربوطة"}
                  </Badge>
                </div>
                {!metaConfigured && (
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    لتفعيل تنفيذ الحملات الفعلية على Facebook/Instagram، أضف هذه المتغيّرات في إعدادات
                    المشروع:{" "}
                    <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300">META_ACCESS_TOKEN</code>،{" "}
                    <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300">META_AD_ACCOUNT_ID</code>،{" "}
                    <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300">META_PAGE_ID</code>.
                    حتى ذلك الحين، الوكيل سيعمل بـ"وضع المحاكاة" — تطلب الموافقة وتُسجَّل العملية بالكامل
                    لكن لا يحدث صرف فعلي.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <StatTile label="بانتظار موافقتك" value={data.summary.pending} accent="amber" icon={Clock} />
              <StatTile label="نُفِّذ فعلياً" value={data.summary.executed} accent="emerald" icon={CheckCircle2} />
              <StatTile label="محاكاة" value={data.summary.executed_noop} accent="blue" icon={ShieldCheck} />
              <StatTile label="فشل" value={data.summary.failed} accent="rose" icon={AlertTriangle} />
              <StatTile label="رفضتَه" value={data.summary.rejected} accent="neutral" icon={XCircle} />
            </div>

            {/* Pending approvals (highlighted) */}
            {data.pending.length > 0 && (
              <Card className="bg-amber-500/5 border-amber-500/30 mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-200 text-base flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {data.pending.length} طلب{data.pending.length > 1 ? "اً" : ""} ينتظر موافقتك
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-100/80 mb-3">
                    وكلاؤك جاهزون للتنفيذ، لكنهم ينتظرون إذنك على الخطوات التي فيها مال أو التزام خارجي.
                  </p>
                  <Link href="/inbox">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                      افتح صندوق الموافقات
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(["all", "pending", "executed", "executed_noop", "failed", "rejected"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={filter === s ? "default" : "secondary"}
                  onClick={() => setFilter(s)}
                >
                  {s === "all" ? "كل النشاط" : STATUS_LABEL[s]}
                </Button>
              ))}
            </div>

            {/* Live feed */}
            <Card className="bg-dark-surface/60 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-cyan" />
                  سجلّ نشاط الفريق
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filtered.length === 0 ? (
                  <p className="text-text-secondary text-center py-8">لا يوجد نشاط مطابق.</p>
                ) : (
                  filtered.map((it) => {
                    const Icon = STATUS_ICON[it.status] || Activity;
                    return (
                      <div
                        key={it.id}
                        className="rounded-xl border border-white/5 bg-black/30 p-4 hover:border-white/10 transition"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <Icon className="w-5 h-5 text-neutral-300 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm">{it.label}</p>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                {agentNameOf(it.actionId, it.requestedBy)}
                                <span className="mx-1.5">·</span>
                                {timeAgo(it.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={STATUS_CLASS[it.status] || ""}>
                            {STATUS_LABEL[it.status] || it.status}
                          </Badge>
                        </div>
                        {it.rationale && (
                          <p className="text-xs text-neutral-300 italic mb-2 leading-relaxed">
                            «{it.rationale}»
                          </p>
                        )}
                        <details className="group">
                          <summary className="text-xs text-neutral-400 cursor-pointer hover:text-neutral-200 select-none">
                            التفاصيل
                          </summary>
                          <pre className="mt-2 bg-black/40 border border-white/5 rounded-lg p-3 text-[11px] text-neutral-300 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(it.input, null, 2)}
                          </pre>
                          {it.result && (
                            <pre className="mt-2 bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-3 text-[11px] text-emerald-200 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(it.result, null, 2)}
                            </pre>
                          )}
                          {it.error && (
                            <p className="mt-2 text-xs text-rose-400">خطأ: {it.error}</p>
                          )}
                        </details>
                        {it.status === "pending" && (
                          <div className="mt-3">
                            <Link href="/inbox">
                              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                                راجع ووافق
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}

function StatTile({
  label, value, accent, icon: Icon,
}: {
  label: string;
  value: number;
  accent: "amber" | "emerald" | "blue" | "rose" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const colors: Record<string, string> = {
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-200",
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-200",
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-200",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-200",
    neutral: "border-neutral-500/30 bg-neutral-500/5 text-neutral-200",
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[accent]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] opacity-80">{label}</span>
        <Icon className="w-4 h-4 opacity-70" />
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
