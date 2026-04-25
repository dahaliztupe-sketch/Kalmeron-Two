"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, MAIN_PLAN_ORDER, type PlanId } from "@/src/lib/billing/plans";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingDesktop } from "@/components/pricing/PricingDesktop";
import { PricingMobile } from "@/components/pricing/PricingMobile";
import { PricingComparison } from "@/components/pricing/PricingComparison";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingTrust } from "@/components/pricing/PricingTrust";
import { PricingEnterpriseBanner } from "@/components/pricing/PricingEnterpriseBanner";
import { toast } from "sonner";

export type BillingCycle = "monthly" | "annual";

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [billingAvailable, setBillingAvailable] = useState<boolean>(true);

  // Probe whether self-serve Stripe billing is configured. If the server has
  // no Stripe price IDs, we surface a soft banner instead of letting the user
  // click into a silent failure.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/billing/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setBillingAvailable(Boolean(data.stripeConfigured));
      } catch {
        // Network error → leave the banner hidden; the checkout endpoint has
        // its own 503 fallback that explains the error in Arabic.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (planId !== "free" && !billingAvailable) {
      toast.error("الفوترة الذاتية غير مفعّلة حالياً. تواصل مع المبيعات للترقية.");
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

  const mainPlanList = useMemo(
    () => MAIN_PLAN_ORDER.map((id) => PLANS[id]),
    [],
  );
  const enterprisePlan = PLANS.enterprise;

  const content = (
    <div className={user ? "-m-4 md:-m-8" : ""}>
        {/* HERO with mesh gradient + starfield */}
        <PricingHero billing={billing} setBilling={setBilling} />

        {/* Stripe-not-configured banner (soft) */}
        {!billingAvailable && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 mb-4 relative z-20">
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] backdrop-blur-xl px-5 py-3 flex items-start gap-3 text-sm text-amber-100">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-300" />
              <div className="flex-1 leading-relaxed">
                الفوترة الذاتية عبر Stripe قيد الإعداد حالياً. للترقية الفورية،
                <Link
                  href="/contact?intent=billing"
                  className="ms-1 font-bold text-amber-200 underline decoration-dotted underline-offset-4 hover:text-white"
                >
                  تواصل مع فريق المبيعات
                </Link>
                — سنعالج طلبك يدوياً خلال يوم عمل.
              </div>
            </div>
          </div>
        )}

        {/* DESKTOP: 3-column premium card grid (Enterprise rendered as banner below) */}
        <div className="hidden lg:block px-8 -mt-16 relative z-10">
          <PricingDesktop
            plans={mainPlanList}
            currentPlan={currentPlan}
            loadingPlan={loadingPlan}
            billing={billing}
            onSelect={handleSelect}
            billingAvailable={billingAvailable}
          />
        </div>

        {/* MOBILE / TABLET: snap carousel + sticky CTA — also 3 cards */}
        <div className="lg:hidden px-4 -mt-8 relative z-10">
          <PricingMobile
            plans={mainPlanList}
            currentPlan={currentPlan}
            loadingPlan={loadingPlan}
            billing={billing}
            onSelect={handleSelect}
            billingAvailable={billingAvailable}
          />
        </div>

        {/* ENTERPRISE banner (replaces the old 4th column) */}
        <PricingEnterpriseBanner plan={enterprisePlan} />

        {/* TRUST strip */}
        <div className="px-4 md:px-8 mt-16 md:mt-24">
          <PricingTrust />
        </div>

        {/* FEATURE COMPARISON (desktop) — keeps Enterprise column for full comparison */}
        <div className="hidden md:block px-8 mt-20">
          <PricingComparison
            plans={[...mainPlanList, enterprisePlan]}
            currentPlan={currentPlan}
          />
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
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05070D]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl border border-white/10 bg-[#070A18]/70 flex items-center justify-center">
              <img
                src="/brand/kalmeron-mark.svg"
                alt="Kalmeron"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-display text-lg font-extrabold text-white">
              Kalmeron
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-white transition"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-white text-black px-4 py-2 text-sm font-bold hover:bg-neutral-100 transition"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>
      <main>{content}</main>
    </div>
  );
}
