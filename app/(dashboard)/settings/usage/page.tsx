"use client";

import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Coins, TrendingUp, Calendar, RefreshCw, Bot, Loader2, AlertCircle } from "lucide-react";

interface DailyRow {
  day: string;
  date: string;
  cost: number;
  tokens: number;
}

interface AgentRow {
  agent: string;
  credits: number;
  count: number;
}

interface WalletData {
  plan: string;
  planName: string;
  dailyBalance: number;
  monthlyBalance: number;
  dailyLimit: number;
  monthlyLimit: number;
  unlimited: boolean;
  total: number;
  dailyResetAt: string | null;
  monthlyResetAt: string | null;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className={`text-2xl font-black tabular-nums ${color ?? "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-600 mt-1">{sub}</p>}
    </div>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color = pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-violet-500";
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
        <span>{label}</span>
        <span className="tabular-nums">{used.toLocaleString("ar-EG")} / {limit.toLocaleString("ar-EG")}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/[0.06]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatResetDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const TOOLTIP_STYLE = {
  background: "#0D1025",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  color: "#e5e7eb",
  fontSize: 12,
};

export default function UsagePage() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<DailyRow[]>([]);
  const [breakdown, setBreakdown] = useState<AgentRow[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [dailyRes, txRes, walletRes] = await Promise.all([
        fetch("/api/usage/daily?days=30&locale=ar", { headers }),
        fetch("/api/usage/transactions", { headers }),
        fetch("/api/user/credits", { headers }),
      ]);

      if (dailyRes.ok) {
        const json = await dailyRes.json();
        setChartData((json.chartData as DailyRow[]) || []);
      }

      if (txRes.ok) {
        const json = await txRes.json();
        setBreakdown((json.breakdown as AgentRow[]) || []);
      }

      if (walletRes.ok) {
        const json = await walletRes.json();
        setWallet(json as WalletData);
      }
    } catch {
      setError("تعذّر تحميل بيانات الاستخدام. تحقق من اتصالك وحاول مجدداً.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const creditsConsumedToday = wallet
    ? Math.max(0, (wallet.dailyLimit || 0) - (wallet.dailyBalance || 0))
    : 0;
  const creditsConsumedMonthly = wallet
    ? Math.max(0, (wallet.monthlyLimit || 0) - (wallet.monthlyBalance || 0))
    : 0;

  // Credits consumed per day: cost * 1000 ≈ credits (1 credit ≈ $0.001)
  const creditChart = chartData.map((d) => ({
    ...d,
    credits: Math.round(d.cost * 1000),
  }));

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">الاستخدام والرصيد</h1>
            <p className="text-xs text-neutral-500 mt-0.5">آخر 30 يوم · {wallet?.planName ?? "—"}</p>
          </div>
          <button
            onClick={() => void fetchAll()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-neutral-400 hover:text-white text-xs transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
            <AlertCircle className="w-6 h-6 text-rose-400 mx-auto mb-3" />
            <p className="text-neutral-300 text-sm">{error}</p>
            <button onClick={() => void fetchAll()} className="mt-4 text-xs text-violet-400 hover:underline">إعادة المحاولة</button>
          </div>
        ) : (
          <>
            {/* Wallet Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="الرصيد اليومي المتبقي"
                value={wallet?.unlimited ? "∞" : (wallet?.dailyBalance ?? 0).toLocaleString("ar-EG")}
                sub={`من ${(wallet?.dailyLimit ?? 0).toLocaleString("ar-EG")} رصيد`}
                color="text-violet-300"
              />
              <StatCard
                label="الرصيد الشهري المتبقي"
                value={wallet?.unlimited ? "∞" : (wallet?.monthlyBalance ?? 0).toLocaleString("ar-EG")}
                sub={`من ${(wallet?.monthlyLimit ?? 0).toLocaleString("ar-EG")} رصيد`}
                color="text-cyan-300"
              />
              <StatCard
                label="مستخدَم اليوم"
                value={wallet?.unlimited ? "—" : creditsConsumedToday.toLocaleString("ar-EG")}
                sub="رصيد"
                color="text-amber-300"
              />
              <StatCard
                label="مستخدَم هذا الشهر"
                value={wallet?.unlimited ? "—" : creditsConsumedMonthly.toLocaleString("ar-EG")}
                sub="رصيد"
                color="text-emerald-300"
              />
            </div>

            {/* Progress Bars */}
            {wallet && !wallet.unlimited && (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-violet-400" />
                  استهلاك الرصيد
                </h2>
                <UsageBar
                  label="الحد اليومي"
                  used={creditsConsumedToday}
                  limit={wallet.dailyLimit}
                />
                <UsageBar
                  label="الحد الشهري"
                  used={creditsConsumedMonthly}
                  limit={wallet.monthlyLimit}
                />
              </div>
            )}

            {/* Area Chart */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                استهلاك الرصيد — آخر 30 يوم
              </h2>
              {creditChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={creditChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="creditsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v) => [typeof v === "number" ? v.toLocaleString("ar-EG") : v, "رصيد"]}
                      labelFormatter={(label) => `يوم: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="credits"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      fill="url(#creditsGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#7c3aed" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-neutral-600 text-sm">
                  لا توجد بيانات استخدام بعد
                </div>
              )}
            </div>

            {/* Breakdown per Agent */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                التفاصيل حسب المساعد — آخر 30 يوم
              </h2>
              {breakdown.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-right text-xs text-neutral-500 font-medium py-2 pr-0">المساعد</th>
                        <th className="text-left text-xs text-neutral-500 font-medium py-2">الرصيد المستخدَم</th>
                        <th className="text-left text-xs text-neutral-500 font-medium py-2">عدد الطلبات</th>
                        <th className="text-left text-xs text-neutral-500 font-medium py-2">متوسط لكل طلب</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.map((row) => (
                        <tr key={row.agent} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 pr-0 text-white font-medium">{row.agent}</td>
                          <td className="py-2.5 text-left text-violet-300 tabular-nums font-bold">
                            {row.credits.toLocaleString("ar-EG")}
                          </td>
                          <td className="py-2.5 text-left text-neutral-400 tabular-nums">
                            {row.count.toLocaleString("ar-EG")}
                          </td>
                          <td className="py-2.5 text-left text-neutral-500 tabular-nums text-xs">
                            {row.count > 0 ? Math.round(row.credits / row.count).toLocaleString("ar-EG") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-neutral-600 text-sm">
                  لا توجد معاملات رصيد بعد
                </div>
              )}
            </div>

            {/* Renewal dates from user_credits */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                مواعيد التجديد
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                  <p className="text-xs text-neutral-500 mb-1">الباقة الحالية</p>
                  <p className="text-white font-bold">{wallet?.planName ?? "—"}</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                  <p className="text-xs text-neutral-500 mb-1">تجديد الرصيد اليومي</p>
                  <p className="text-cyan-300 font-semibold text-sm">
                    {formatResetDate(wallet?.dailyResetAt ?? null)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                  <p className="text-xs text-neutral-500 mb-1">تجديد الرصيد الشهري</p>
                  <p className="text-emerald-300 font-semibold text-sm">
                    {formatResetDate(wallet?.monthlyResetAt ?? null)}
                  </p>
                </div>
              </div>
              <a
                href="/pricing"
                className="inline-block mt-4 text-xs text-violet-400 hover:underline"
              >
                ترقية الباقة للحصول على رصيد أكبر
              </a>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
