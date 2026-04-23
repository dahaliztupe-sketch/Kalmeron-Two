"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Plan } from "@/src/lib/billing/plans";
import type { BillingCycle } from "@/app/pricing/page";

interface Props {
  plan: Plan;
  billing: BillingCycle;
}

// 20% off when billed annually
export function getDisplayedPrice(plan: Plan, billing: BillingCycle) {
  if (plan.priceMonthlyEgp === 0) return { egp: 0, usd: 0, original: 0 };
  if (billing === "annual") {
    return {
      egp: Math.round(plan.priceMonthlyEgp * 0.8),
      usd: Math.round(plan.priceMonthlyUsd * 0.8),
      original: plan.priceMonthlyEgp,
    };
  }
  return {
    egp: plan.priceMonthlyEgp,
    usd: plan.priceMonthlyUsd,
    original: 0,
  };
}

export function PlanPriceDisplay({ plan, billing }: Props) {
  const price = getDisplayedPrice(plan, billing);

  if (plan.id === "enterprise") {
    return (
      <div>
        <div className="text-3xl md:text-4xl font-display font-extrabold text-white">
          تواصل معنا
        </div>
        <p className="text-xs text-text-secondary mt-1.5">تسعير مخصص لمؤسستك</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${plan.id}-${billing}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="text-4xl md:text-5xl font-display font-extrabold text-white tabular-nums"
          >
            {price.egp}
          </motion.span>
        </AnimatePresence>
        <span className="text-sm text-text-secondary">
          ج.م / {billing === "annual" ? "شهر" : "شهر"}
        </span>
        {price.original > 0 && (
          <span className="text-xs text-text-secondary line-through tabular-nums">
            {price.original}
          </span>
        )}
      </div>
      <p className="text-xs text-text-secondary mt-1.5">
        {plan.priceMonthlyEgp === 0
          ? "بدون تكلفة، إلى الأبد"
          : `~ $${price.usd} شهرياً • ${
              billing === "annual" ? "يُحاسَب سنوياً" : "يُحاسَب شهرياً"
            }`}
      </p>
    </div>
  );
}
