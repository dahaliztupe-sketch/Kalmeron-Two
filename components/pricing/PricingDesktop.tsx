"use client";

import React from "react";
import { motion } from "motion/react";
import { Check, Crown, Loader2, Rocket, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import type { Plan, PlanId } from "@/src/lib/billing/plans";
import type { BillingCycle } from "@/app/pricing/page";
import { PlanPriceDisplay } from "./PlanPriceDisplay";

interface Props {
  plans: Plan[];
  currentPlan: PlanId;
  loadingPlan: PlanId | null;
  billing: BillingCycle;
  onSelect: (id: PlanId) => void;
  /** When false, paid plan CTAs swap to a "تواصل مع المبيعات" affordance
   * instead of triggering the Stripe checkout flow. */
  billingAvailable?: boolean;
}

const PLAN_ICONS: Record<PlanId, React.ComponentType<{ className?: string }>> = {
  free: Sparkles,
  pro: Rocket,
  founder: Crown,
  enterprise: Building2,
};

// Map plan count → tailwind grid class. Tailwind purges unknown class strings,
// so listing them statically keeps them in the build.
const GRID_BY_COUNT: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function PricingDesktop({
  plans,
  currentPlan,
  loadingPlan,
  billing,
  onSelect,
  billingAvailable = true,
}: Props) {
  const cols = GRID_BY_COUNT[plans.length] ?? "grid-cols-3";
  return (
    <div className={cn("grid gap-5 max-w-7xl mx-auto", cols)}>
      {plans.map((plan, idx) => {
        const isCurrent = currentPlan === plan.id;
        const isLoading = loadingPlan === plan.id;
        const isHighlighted = !!plan.highlighted;
        const Icon = PLAN_ICONS[plan.id];

        return (
          <motion.article
            key={plan.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative rounded-3xl card-lift bg-gradient-to-b from-dark-surface/80 to-dark-surface/40 backdrop-blur-2xl",
              "border p-6 flex flex-col",
              isHighlighted
                ? "border-transparent gradient-border gradient-border-animate"
                : "border-white/[0.08]",
              isCurrent && "ring-2 ring-brand-cyan/40"
            )}
          >
            {/* Popular ribbon */}
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
                  خطتك الحالية
                </div>
              </div>
            )}

            {/* Header */}
            <header className="mb-6">
              <div
                className={cn(
                  "inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4",
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
              <h3 className="font-display text-2xl font-extrabold text-white mb-1">
                {plan.nameAr}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed h-10">
                {plan.taglineAr}
              </p>
            </header>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-white/[0.06]">
              <PlanPriceDisplay plan={plan} billing={billing} />
            </div>

            {/* Quota chip */}
            {plan.id !== "enterprise" && (
              <div className="mb-5 rounded-xl bg-black/30 border border-white/5 p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">
                    رسائل شهرية
                  </span>
                  <span className="font-display text-xl font-extrabold text-white tabular-nums">
                    {plan.monthlyCredits.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-text-secondary/80">
                  + {plan.dailyCredits.toLocaleString("en-US")} يومياً
                </div>
              </div>
            )}
            {plan.id === "enterprise" && (
              <div className="mb-5 rounded-xl bg-gradient-to-r from-brand-cyan/10 to-brand-blue/10 border border-brand-cyan/20 p-3 text-center">
                <span className="font-display text-xl font-extrabold brand-gradient-text">
                  ∞ غير محدود
                </span>
              </div>
            )}

            {/* Features */}
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.featuresAr.map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + idx * 0.07 + i * 0.04 }}
                  className="flex items-start gap-2.5 text-[13px] text-text-secondary leading-relaxed"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-4 h-4 rounded-full shrink-0 mt-0.5",
                      isHighlighted
                        ? "bg-brand-cyan/20 text-brand-cyan"
                        : "bg-emerald-500/15 text-emerald-300"
                    )}
                  >
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </div>
                  <span>{f}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              onClick={() => onSelect(plan.id)}
              disabled={isLoading || isCurrent}
              className={cn(
                "w-full h-11 rounded-xl font-bold transition-all",
                isCurrent
                  ? "bg-white/[0.04] text-text-secondary border border-white/10 hover:bg-white/[0.04]"
                  : isHighlighted
                    ? "bg-gradient-to-r from-brand-cyan to-amber-400 text-black hover:shadow-lg hover:shadow-brand-cyan/40"
                    : "bg-white text-black hover:bg-neutral-100"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCurrent ? (
                "خطتك الحالية"
              ) : plan.id === "enterprise" ? (
                "تواصل مع المبيعات"
              ) : plan.priceMonthlyEgp === 0 ? (
                "ابدأ مجاناً"
              ) : !billingAvailable ? (
                "تواصل مع المبيعات"
              ) : (
                "اختر هذه الخطة"
              )}
            </Button>
          </motion.article>
        );
      })}
    </div>
  );
}
