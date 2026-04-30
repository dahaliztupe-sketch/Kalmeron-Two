"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Crown, Loader2, Rocket, Sparkles, Building2, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import type { Plan, PlanId } from "@/src/lib/billing/plans";
import type { BillingCycle } from "@/app/pricing/_page-client";
import { PlanPriceDisplay } from "./PlanPriceDisplay";

interface Props {
  plans: Plan[];
  currentPlan: PlanId;
  loadingPlan: PlanId | null;
  billing: BillingCycle;
  onSelect: (id: PlanId) => void;
  /** When false, paid CTAs are swapped for a soft "تواصل" affordance. */
  billingAvailable?: boolean;
}

const PLAN_ICONS: Record<PlanId, React.ComponentType<{ className?: string }>> = {
  free: Sparkles,
  starter: Zap,
  pro: Rocket,
  founder: Crown,
  enterprise: Building2,
};

export function PricingMobile({
  plans,
  currentPlan,
  loadingPlan,
  billing,
  onSelect,
  billingAvailable = true,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number>(() =>
    Math.max(0, plans.findIndex((p) => p.highlighted))
  );

  // Center the highlighted plan on first mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[activeIdx] as HTMLElement | undefined;
    card?.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" as ScrollBehavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track active card on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      Array.from(el.children).forEach((c, i) => {
        const r = (c as HTMLElement).offsetLeft + (c as HTMLElement).offsetWidth / 2;
        const d = Math.abs(r - center);
        if (d < minDist) {
          minDist = d;
          closest = i;
        }
      });
      setActiveIdx(closest);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  };

  const activePlan = plans[activeIdx] || plans[0];
  const isCurrentActive = activePlan.id === currentPlan;
  const isLoadingActive = loadingPlan === activePlan.id;

  return (
    <div className="relative">
      {/* Carousel arrows (touch-only devices won't see them — but desktop touch hybrids will) */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => goTo(Math.max(0, activeIdx - 1))}
          disabled={activeIdx === 0}
          className="w-9 h-9 rounded-full border border-white/10 bg-dark-surface/60 backdrop-blur text-white disabled:opacity-30 active:scale-90 transition flex items-center justify-center"
          aria-label="السابق"
        >
          <ChevronRight className="h-4 w-4 icon-flip" />
        </button>
        <span className="text-xs text-text-secondary tabular-nums">
          {activeIdx + 1} / {plans.length}
        </span>
        <button
          onClick={() => goTo(Math.min(plans.length - 1, activeIdx + 1))}
          disabled={activeIdx === plans.length - 1}
          className="w-9 h-9 rounded-full border border-white/10 bg-dark-surface/60 backdrop-blur text-white disabled:opacity-30 active:scale-90 transition flex items-center justify-center"
          aria-label="التالي"
        >
          <ChevronLeft className="h-4 w-4 icon-flip" />
        </button>
      </div>

      {/* Snap carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x-mandatory scrollbar-hide pb-4 -mx-4 px-4"
      >
        {plans.map((plan, idx) => {
          const isCurrent = currentPlan === plan.id;
          const isHighlighted = !!plan.highlighted;
          const Icon = PLAN_ICONS[plan.id];
          return (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className={cn(
                "snap-center shrink-0 w-[88vw] max-w-[380px] rounded-3xl",
                "bg-gradient-to-b from-dark-surface/90 to-dark-surface/50 backdrop-blur-2xl",
                "border p-6 relative",
                isHighlighted
                  ? "border-transparent gradient-border gradient-border-animate"
                  : "border-white/[0.08]",
                isCurrent && "ring-2 ring-brand-cyan/40"
              )}
            >
              {isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="rounded-full bg-gradient-to-r from-brand-cyan to-amber-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-black shadow-lg shadow-brand-cyan/40">
                    الأكثر شعبية
                  </div>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 z-10">
                  <div className="rounded-full border border-brand-cyan/40 bg-black px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-cyan">
                    الحالية
                  </div>
                </div>
              )}

              <header className="mb-5 text-center">
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3",
                    isHighlighted
                      ? "bg-gradient-to-br from-brand-cyan/30 to-brand-cyan/5 border border-brand-cyan/30"
                      : "bg-white/[0.03] border border-white/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isHighlighted ? "text-brand-cyan" : "text-text-secondary"
                    )}
                  />
                </div>
                <h2 className="font-display text-2xl font-extrabold text-white">
                  {plan.nameAr}
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed mt-1.5">
                  {plan.taglineAr}
                </p>
              </header>

              <div className="text-center pb-5 mb-5 border-b border-white/[0.06]">
                <PlanPriceDisplay plan={plan} billing={billing} />
              </div>

              {plan.id !== "enterprise" && (
                <div className="mb-5 grid grid-cols-2 gap-2">
                  <QuotaPill label="يومي" value={plan.dailyCredits.toLocaleString("en-US")} />
                  <QuotaPill label="شهري" value={plan.monthlyCredits.toLocaleString("en-US")} />
                </div>
              )}
              {plan.id === "enterprise" && (
                <div className="mb-5 rounded-xl bg-gradient-to-r from-brand-cyan/10 to-brand-blue/10 border border-brand-cyan/20 p-3 text-center">
                  <span className="font-display text-xl font-extrabold brand-gradient-text">
                    ∞ غير محدود
                  </span>
                </div>
              )}

              <ul className="space-y-2.5">
                {plan.featuresAr.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-text-secondary leading-relaxed">
                    <div
                      className={cn(
                        "flex items-center justify-center w-4 h-4 rounded-full shrink-0 mt-0.5",
                        isHighlighted ? "bg-brand-cyan/20 text-brand-cyan" : "bg-emerald-500/15 text-emerald-300"
                      )}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
                {plan.featuresAr.length > 5 && (
                  <li className="text-[11px] text-text-secondary/70 pr-6">
                    + {plan.featuresAr.length - 5} ميزة إضافية
                  </li>
                )}
              </ul>
            </motion.article>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {plans.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`الانتقال إلى الخطة ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === activeIdx ? "w-6 bg-brand-cyan" : "w-1.5 bg-white/15"
            )}
          />
        ))}
      </div>

      {/* Sticky CTA bar for mobile */}
      <div className="sticky bottom-4 mt-6 z-20">
        <div className="rounded-2xl border border-white/10 bg-dark-surface/90 backdrop-blur-2xl p-3 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePlan.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">
                    خطة {activePlan.nameAr}
                  </p>
                  <p className="font-display text-base font-extrabold text-white truncate">
                    {activePlan.id === "enterprise"
                      ? "تسعير مخصص"
                      : activePlan.priceMonthlyEgp === 0
                        ? "مجاناً للأبد"
                        : `${activePlan.priceMonthlyEgp} ج.م / شهر`}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <Button
              onClick={() => onSelect(activePlan.id)}
              disabled={isLoadingActive || isCurrentActive}
              className={cn(
                "h-12 px-5 rounded-xl font-bold whitespace-nowrap",
                isCurrentActive
                  ? "bg-white/[0.04] text-text-secondary border border-white/10"
                  : activePlan.highlighted
                    ? "bg-gradient-to-r from-brand-cyan to-amber-400 text-black"
                    : "bg-white text-black"
              )}
            >
              {isLoadingActive ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCurrentActive ? (
                "الحالية"
              ) : activePlan.id === "enterprise" ? (
                "تواصل"
              ) : activePlan.priceMonthlyEgp === 0 ? (
                "ابدأ مجاناً"
              ) : !billingAvailable ? (
                "تواصل"
              ) : (
                "اختر الخطة"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuotaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/30 border border-white/5 p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">
        {label}
      </p>
      <p className="font-display text-lg font-extrabold text-white tabular-nums mt-0.5">
        {value}
      </p>
    </div>
  );
}
