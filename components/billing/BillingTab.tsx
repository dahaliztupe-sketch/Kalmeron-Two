"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, ArrowUpRight, Coins } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, type PlanId } from "@/src/lib/billing/plans";

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

function fmt(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function BillingTab() {
  const { user } = useAuth();
  const [data, setData] = useState<CreditsResp | null>(null);
  const [loading, setLoading] = useState(true);

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
        if (!res.ok) return;
        setData(await res.json());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const plan = data ? PLANS[data.plan] : PLANS.free;

  return (
    <Card className="bg-dark-surface/40 backdrop-blur-md border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white">الفوترة والاشتراك</CardTitle>
        <CardDescription className="text-neutral-400">
          خطتك الحالية وأرصدة كلميرون المتبقية لديك.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-cyan" />
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-brand-cyan/30 bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10 p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-brand-cyan uppercase tracking-widest font-bold">
                    الخطة الحالية
                  </p>
                  <h3 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-cyan" /> خطة {plan.nameAr}
                  </h3>
                  <p className="text-sm text-neutral-300 mt-1">
                    {plan.priceMonthlyEgp === 0
                      ? "بدون تكلفة شهرية"
                      : `${plan.priceMonthlyEgp} جنيه / شهر`}
                  </p>
                </div>
                <Link href="/pricing">
                  <Button className="bg-brand-cyan text-black hover:bg-brand-cyan/90 font-bold">
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                    {plan.id === "founder" || plan.id === "enterprise"
                      ? "إدارة الخطة"
                      : "ترقية الخطة"}
                  </Button>
                </Link>
              </div>
            </div>

            {data?.unlimited ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-center">
                <Coins className="h-8 w-8 text-brand-cyan mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-white">استخدام غير محدود</p>
                <p className="text-sm text-neutral-400 mt-1">
                  أنت على خطة المؤسسات — لا توجد حدود على الرسائل.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BalanceCard
                  label="الرصيد اليومي"
                  value={data?.dailyBalance ?? 0}
                  limit={data?.dailyLimit ?? plan.dailyCredits}
                />
                <BalanceCard
                  label="الرصيد الشهري"
                  value={data?.monthlyBalance ?? 0}
                  limit={data?.monthlyLimit ?? plan.monthlyCredits}
                />
                <BalanceCard
                  label="الرصيد المرحّل"
                  value={data?.rolledOverCredits ?? 0}
                  limit={data?.rolledOverCredits ?? 0}
                  hideRatio
                />
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-neutral-400 mb-1">إجمالي الرصيد المتبقي</p>
              <p className="text-3xl font-extrabold text-white">
                {data?.unlimited
                  ? "∞"
                  : fmt(
                      (data?.dailyBalance ?? 0) +
                        (data?.monthlyBalance ?? 0) +
                        (data?.rolledOverCredits ?? 0)
                    )}{" "}
                <span className="text-sm text-neutral-500 font-normal">رصيد</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/pricing">
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                  عرض كل الخطط
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BalanceCard({
  label,
  value,
  limit,
  hideRatio,
}: {
  label: string;
  value: number;
  limit: number;
  hideRatio?: boolean;
}) {
  const pct = limit > 0 ? Math.max(0, Math.min(100, (value / limit) * 100)) : 0;
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-2xl font-extrabold text-white mt-1">
        {fmt(value)}
        {!hideRatio && (
          <span className="text-sm text-neutral-500"> / {fmt(limit)}</span>
        )}
      </p>
      {!hideRatio && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-brand-cyan to-amber-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
