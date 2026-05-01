"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Loader2, ArrowUpRight, Coins, Check, Zap,
  TrendingUp, History, ChevronRight, Crown, Building2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, type PlanId } from "@/src/lib/billing/plans";
import { cn } from "@/src/lib/utils";

type CreditsResp = {
  plan: PlanId;
  planName: string;
  dailyBalance: number;
  monthlyBalance: number;
  rolledOverCredits: number;
  dailyLimit: number;
  monthlyLimit: number;
  unlimited: boolean;
  total: number;
};

type Transaction = {
  id: string;
  type: "consume" | "reset" | "topup";
  amount: number;
  description: string;
  createdAt: string;
};

function fmt(n: number) {
  return new Intl.NumberFormat("ar-EG").format(Math.round(n));
}

const PLAN_ICONS: Record<string, typeof Crown> = {
  free: Coins,
  starter: Zap,
  pro: TrendingUp,
  founder: Crown,
  enterprise: Building2,
};

const PLAN_GRADIENTS: Record<string, string> = {
  free:       "from-neutral-600/20 to-neutral-800/20 border-neutral-600/30",
  starter:    "from-brand-cyan/10 to-sky-600/10 border-brand-cyan/30",
  pro:        "from-violet-600/15 to-purple-800/15 border-violet-500/30",
  founder:    "from-amber-500/15 to-orange-700/15 border-amber-500/30",
  enterprise: "from-emerald-600/15 to-teal-800/15 border-emerald-500/30",
};

const PLAN_TEXT: Record<string, string> = {
  free:       "text-neutral-300",
  starter:    "text-brand-cyan",
  pro:        "text-violet-400",
  founder:    "text-amber-400",
  enterprise: "text-emerald-400",
};

const UPGRADE_ORDER: PlanId[] = ["free", "starter", "pro", "founder"];

export function BillingTab() {
  const { user } = useAuth();
  const [data, setData] = useState<CreditsResp | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txnLoading, setTxnLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken().catch(() => null);
        if (!token) return;
        const res = await fetch("/api/user/credits", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.ok) setData(await res.json());

        setTxnLoading(true);
        const txnRes = await fetch("/api/billing/transactions?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (txnRes.ok) {
          const j = await txnRes.json();
          setTxns(j.transactions ?? []);
        }
      } finally {
        setLoading(false);
        setTxnLoading(false);
      }
    };
    load();
  }, [user]);

  const currentPlan = data ? PLANS[data.plan] : PLANS.free;
  const PlanIcon = PLAN_ICONS[currentPlan.id] ?? Sparkles;
  const gradient = PLAN_GRADIENTS[currentPlan.id] ?? PLAN_GRADIENTS.free;
  const textColor = PLAN_TEXT[currentPlan.id] ?? "text-brand-cyan";

  const nextPlanId = UPGRADE_ORDER[UPGRADE_ORDER.indexOf(currentPlan.id as PlanId) + 1];
  const nextPlan = nextPlanId ? PLANS[nextPlanId] : null;

  const totalCredits = data
    ? (data.unlimited ? Infinity : (data.dailyBalance + data.monthlyBalance + data.rolledOverCredits))
    : 0;

  return (
    <div dir="rtl" className="space-y-6">
      {loading ? (
        <Card className="bg-dark-surface/40 backdrop-blur-md border-white/10 rounded-2xl">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Plan Card */}
          <div className={cn("rounded-2xl border bg-gradient-to-br p-6", gradient)}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/10", textColor)}>
                  <PlanIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className={cn("text-xs uppercase tracking-widest font-bold", textColor)}>
                    خطتك الحالية
                  </p>
                  <h3 className="text-2xl font-extrabold text-white mt-1">
                    خطة {currentPlan.nameAr}
                  </h3>
                  <p className="text-sm text-neutral-300 mt-0.5">
                    {currentPlan.priceMonthlyEgp === 0 && currentPlan.id === "free"
                      ? "مجانية دائماً"
                      : currentPlan.id === "enterprise"
                      ? "تسعير مخصص"
                      : `${fmt(currentPlan.priceMonthlyEgp)} جنيه / شهر`}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">{currentPlan.taglineAr}</p>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="bg-brand-cyan text-black hover:bg-brand-cyan/90 font-bold">
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                  {currentPlan.id === "enterprise"
                    ? "تواصل معنا"
                    : nextPlan
                    ? `الترقية إلى ${nextPlan.nameAr}`
                    : "إدارة الخطة"}
                </Button>
              </Link>
            </div>

            {/* Plan features */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {currentPlan.featuresAr.slice(0, 6).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                  <Check className={cn("h-3.5 w-3.5 shrink-0", textColor)} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Credit Wallet */}
          {data?.unlimited ? (
            <Card className="bg-dark-surface/40 backdrop-blur-md border-white/10 rounded-2xl">
              <CardContent className="py-8 text-center">
                <Coins className="h-10 w-10 text-brand-cyan mx-auto mb-3" />
                <p className="text-3xl font-extrabold text-white">استخدام غير محدود</p>
                <p className="text-sm text-neutral-400 mt-2">
                  أنت على خطة المؤسسات — لا توجد حدود على الرسائل أو الوكلاء.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-dark-surface/40 backdrop-blur-md border-white/10 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Coins className="h-4 w-4 text-brand-cyan" />
                  محفظة الأرصدة
                </CardTitle>
                <CardDescription className="text-neutral-400">
                  إجمالي الرصيد المتاح: <span className="text-white font-bold">{fmt(totalCredits)} رصيد</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <BalanceCard
                    label="الرصيد اليومي"
                    value={data?.dailyBalance ?? 0}
                    limit={data?.dailyLimit ?? currentPlan.dailyCredits}
                    color="cyan"
                  />
                  <BalanceCard
                    label="الرصيد الشهري"
                    value={data?.monthlyBalance ?? 0}
                    limit={data?.monthlyLimit ?? currentPlan.monthlyCredits}
                    color="violet"
                  />
                  <BalanceCard
                    label="رصيد مرحّل"
                    value={data?.rolledOverCredits ?? 0}
                    limit={data?.rolledOverCredits ?? 0}
                    color="amber"
                    hideRatio
                  />
                </div>

                {nextPlan && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-amber-400 font-bold text-sm">
                        ترقّ إلى خطة {nextPlan.nameAr}
                      </p>
                      <p className="text-neutral-400 text-xs mt-0.5">
                        احصل على {fmt(nextPlan.monthlyCredits)} رصيد شهرياً
                        — بزيادة {fmt(nextPlan.monthlyCredits - (currentPlan.monthlyCredits || 0))} رصيد إضافي
                      </p>
                    </div>
                    <Link href="/pricing">
                      <Button size="sm" className="bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 font-bold whitespace-nowrap">
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        ترقية
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transaction History */}
          <Card className="bg-dark-surface/40 backdrop-blur-md border-white/10 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-brand-cyan" />
                آخر المعاملات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {txnLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" />
                </div>
              ) : txns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-500 text-sm">لا توجد معاملات بعد</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {txns.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          t.type === "consume" ? "bg-red-400" :
                          t.type === "topup" ? "bg-emerald-400" : "bg-brand-cyan"
                        )} />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{t.description}</p>
                          <p className="text-neutral-500 text-xs">
                            {new Date(t.createdAt).toLocaleDateString("ar-EG")}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "font-bold text-sm shrink-0",
                        t.type === "consume" ? "text-red-400" : "text-emerald-400"
                      )}>
                        {t.type === "consume" ? "-" : "+"}{fmt(Math.abs(t.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Link href="/settings/usage">
                  <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white text-xs">
                    عرض كامل الاستخدام <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function BalanceCard({
  label, value, limit, hideRatio, color = "cyan",
}: {
  label: string;
  value: number;
  limit: number;
  hideRatio?: boolean;
  color?: "cyan" | "violet" | "amber";
}) {
  const pct = limit > 0 ? Math.max(0, Math.min(100, (value / limit) * 100)) : 0;
  const barColor = {
    cyan:   "from-brand-cyan to-sky-400",
    violet: "from-violet-500 to-purple-400",
    amber:  "from-amber-500 to-orange-400",
  }[color];
  const textColor = {
    cyan: "text-brand-cyan", violet: "text-violet-400", amber: "text-amber-400",
  }[color];

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className={cn("text-2xl font-extrabold", textColor)}>
        {fmt(value)}
        {!hideRatio && (
          <span className="text-sm text-neutral-500 font-normal"> / {fmt(limit)}</span>
        )}
      </p>
      {!hideRatio && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={cn("h-full bg-gradient-to-r transition-all", barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
