"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, PLAN_ORDER, type PlanId } from "@/src/lib/billing/plans";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingDesktop } from "@/components/pricing/PricingDesktop";
import { PricingMobile } from "@/components/pricing/PricingMobile";
import { PricingComparison } from "@/components/pricing/PricingComparison";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingTrust } from "@/components/pricing/PricingTrust";
import { toast } from "sonner";

export type BillingCycle = "monthly" | "annual";

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [billing, setBilling] = useState<BillingCycle>("monthly");

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

  const planList = useMemo(() => PLAN_ORDER.map((id) => PLANS[id]), []);

  const content = (
    <div className={user ? "-m-4 md:-m-8" : ""}>
        {/* HERO with mesh gradient + starfield */}
        <PricingHero billing={billing} setBilling={setBilling} />

        {/* DESKTOP: 4-column premium card grid */}
        <div className="hidden lg:block px-8 -mt-16 relative z-10">
          <PricingDesktop
            plans={planList}
            currentPlan={currentPlan}
            loadingPlan={loadingPlan}
            billing={billing}
            onSelect={handleSelect}
          />
        </div>

        {/* MOBILE / TABLET: snap carousel + sticky CTA */}
        <div className="lg:hidden px-4 -mt-8 relative z-10">
          <PricingMobile
            plans={planList}
            currentPlan={currentPlan}
            loadingPlan={loadingPlan}
            billing={billing}
            onSelect={handleSelect}
          />
        </div>

        {/* TRUST strip */}
        <div className="px-4 md:px-8 mt-16 md:mt-24">
          <PricingTrust />
        </div>

        {/* FEATURE COMPARISON (desktop) */}
        <div className="hidden md:block px-8 mt-20">
          <PricingComparison plans={planList} currentPlan={currentPlan} />
        </div>

        {/* FAQ */}
        <div className="px-4 md:px-8 mt-16 md:mt-24 mb-16">
          <PricingFAQ />
        </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-bg" />
    );
  }

  if (user) {
    return <AppShell>{content}</AppShell>;
  }

  // Public (logged-out) view: minimal header + pricing content
  return (
    <div className="min-h-screen bg-dark-bg text-white" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-dark-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/logo-mark.svg"
              alt="Kalmeron"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="font-display text-lg font-extrabold">
              Kalmeron <span className="text-brand-gold">Two</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-text-secondary hover:text-white transition px-3 py-2"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-bold rounded-full bg-brand-gold text-black px-4 py-2 hover:bg-amber-400 transition"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>
      {content}
    </div>
  );
}
