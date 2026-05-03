"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, MAIN_PLAN_ORDER, type PlanId } from "@/src/lib/billing/plans";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingDesktop } from "@/components/pricing/PricingDesktop";
import { PricingMobile } from "@/components/pricing/PricingMobile";
import { PricingComparison } from "@/components/pricing/PricingComparison";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingTrust } from "@/components/pricing/PricingTrust";
import { PricingEnterpriseBanner } from "@/components/pricing/PricingEnterpriseBanner";
import { FawryDialog } from "@/components/billing/FawryDialog";
import { toast } from "sonner";

export type BillingCycle = "monthly" | "annual";

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [billingAvailable, setBillingAvailable] = useState<boolean>(true);
  const [fawryOpen, setFawryOpen] = useState(false);
  const [fawryPlan, setFawryPlan] = useState<PlanId>("starter");
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/billing/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setBillingAvailable(Boolean(data.stripeConfigured));
      } catch {
        // Network error – leave banner hidden
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const token = await user.getIdToken().catch(() => null);
      if (token) setAuthToken(token);
      const res = await fetch("/api/user/credits", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
    if (planId === "free") {
      setLoadingPlan(planId);
      try {
        const token = await user.getIdToken().catch(() => null);
        const res = await fetch("/api/user/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ plan: planId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "فشل التبديل");
        setCurrentPlan(planId);
        toast.success(data.message || `تم التبديل إلى ${PLANS[planId].nameAr}.`);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "حدث خطأ.");
      } finally {
        setLoadingPlan(null);
      }
      return;
    }

    // For paid plans: if Stripe is available, use normal flow; else offer Fawry
    if (billingAvailable) {
      setLoadingPlan(planId);
      try {
        const token = await user.getIdToken().catch(() => null);
        if (!token) throw new Error("no token");
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ plan: planId, cycle: billing }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "فشل إنشاء الجلسة");
        if (data.url) window.location.href = data.url;
        else toast.success(data.message || "تم التحديث.");
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "حدث خطأ أثناء الدفع.");
      } finally {
        setLoadingPlan(null);
      }
    } else {
      // Open Fawry dialog for EGP payment
      setFawryPlan(planId);
      setFawryOpen(true);
    }
  };

  const mainPlanList = useMemo(
    () => MAIN_PLAN_ORDER.map((id) => PLANS[id]),
    [],
  );
  const enterprisePlan = PLANS.enterprise;

  const content = (
    <div className={user ? "-m-4 md:-m-8" : ""}>
      <PricingHero billing={billing} setBilling={setBilling} />

      {/* Fawry / EGP payment banner */}
      {!billingAvailable && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 mb-4 relative z-20">
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] backdrop-blur-xl px-5 py-3 flex items-start gap-3 text-sm text-amber-100">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-300" />
            <div className="flex-1 leading-relaxed">
              الدفع بالجنيه المصري متاح عبر{" "}
              <span className="font-bold text-amber-200">فوري</span> — اختر خطتك وستفتح نافذة الدفع تلقائياً.
            </div>
          </div>
        </div>
      )}

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

      <PricingEnterpriseBanner plan={enterprisePlan} />

      <div className="px-4 md:px-8 mt-16 md:mt-24">
        <PricingTrust />
      </div>

      <div className="px-4 md:px-8 mt-20">
        <PricingComparison
          plans={[...mainPlanList, enterprisePlan]}
          currentPlan={currentPlan}
        />
      </div>

      <div className="px-4 md:px-8 mt-16 md:mt-24 mb-16">
        <PricingFAQ />
      </div>

      <FawryDialog
        open={fawryOpen}
        onClose={() => setFawryOpen(false)}
        planId={fawryPlan}
        cycle={billing}
        authToken={authToken}
      />
    </div>
  );

  if (!authLoading && user) {
    return <AppShell>{content}</AppShell>;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05070D]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <BrandLogo size={36} />
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-text-secondary hover:text-white transition"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/auth/signup"
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
