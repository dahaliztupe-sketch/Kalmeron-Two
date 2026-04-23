"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER, type PlanId } from "@/src/lib/billing/plans";
import { motion } from "motion/react";

export default function PricingPage() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const token = await user.getIdToken().catch(() => null);
      if (!token) return;
      const res = await fetch("/api/user/credits", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.plan) setCurrentPlan(data.plan as PlanId);
    };
    load();
  }, [user]);

  const handleSelect = async (planId: PlanId) => {
    if (!user) {
      toast.error("سجّل الدخول أولاً لاختيار خطة.");
      return;
    }
    if (planId === currentPlan) {
      toast.info("هذه خطتك الحالية بالفعل.");
      return;
    }
    if (planId === "enterprise") {
      toast.message("سيتواصل معك فريق المبيعات قريباً للخطة المؤسسية.");
      return;
    }
    setLoadingPlan(planId);
    try {
      const token = await user.getIdToken().catch(() => null);
      if (!token) throw new Error("no token");
      const res = await fetch("/api/user/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل التبديل");
      setCurrentPlan(planId);
      toast.success(data.message || `تم التبديل إلى ${PLANS[planId].nameAr}.`);
    } catch (e: any) {
      toast.error(e?.message || "حدث خطأ أثناء تغيير الخطة.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5 text-xs font-bold text-brand-gold uppercase tracking-widest mb-4">
            <Sparkles className="h-3.5 w-3.5" /> اختر خطتك
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            كل وكلاء كلميرون في خطة واحدة
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            ابدأ مجاناً مع رصيد سخيّ يكفيك لاختبار كل الميزات. ارتقِ في أي وقت لما تحتاج المزيد.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const isCurrent = currentPlan === id;
            const isLoading = loadingPlan === id;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: PLAN_ORDER.indexOf(id) * 0.05 }}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-dark-surface/40 backdrop-blur-md p-6",
                  plan.highlighted
                    ? "border-brand-gold/50 shadow-[0_0_50px_-15px_rgba(212,175,55,0.4)]"
                    : "border-white/10",
                  isCurrent && "ring-2 ring-brand-gold/50"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gold px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black">
                    الأكثر شعبية
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 rounded-full border border-brand-gold/40 bg-black px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">
                    خطتك الحالية
                  </div>
                )}

                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    {id === "founder" && <Crown className="h-4 w-4 text-brand-gold" />}
                    <h3 className="text-xl font-extrabold text-white">{plan.nameAr}</h3>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed h-10">
                    {plan.taglineAr}
                  </p>
                </div>

                <div className="mb-6">
                  {plan.id === "enterprise" ? (
                    <div>
                      <div className="text-3xl font-extrabold text-white">تواصل معنا</div>
                      <p className="text-xs text-text-secondary mt-1">تسعير مخصص</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-white">
                          {plan.priceMonthlyEgp}
                        </span>
                        <span className="text-sm text-text-secondary">جنيه/شهر</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">
                        ~ ${plan.priceMonthlyUsd} شهرياً
                      </p>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.featuresAr.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Check
                        className={cn(
                          "h-4 w-4 mt-0.5 shrink-0",
                          plan.highlighted ? "text-brand-gold" : "text-emerald-400"
                        )}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelect(id)}
                  disabled={isLoading || isCurrent}
                  className={cn(
                    "w-full font-bold",
                    isCurrent
                      ? "bg-white/5 text-text-secondary border border-white/10 hover:bg-white/5"
                      : plan.highlighted
                        ? "bg-brand-gold text-black hover:bg-brand-gold/90"
                        : "bg-white text-black hover:bg-neutral-200"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCurrent ? (
                    "خطتك الحالية"
                  ) : id === "enterprise" ? (
                    "تواصل مع المبيعات"
                  ) : plan.priceMonthlyEgp === 0 ? (
                    "ابدأ مجاناً"
                  ) : (
                    "اختر هذه الخطة"
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-black/30 p-6 text-center">
          <p className="text-sm text-text-secondary">
            كل الخطط تشمل: تشفير كامل للبيانات، نسخ احتياطية يومية، ودعم باللغة العربية.
            يمكنك الترقية، التخفيض، أو الإلغاء في أي وقت.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
