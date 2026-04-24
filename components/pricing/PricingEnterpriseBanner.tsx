"use client";

import { motion } from "motion/react";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Plan } from "@/src/lib/billing/plans";

interface Props {
  plan: Plan;
}

/**
 * Enterprise banner — shown beneath the 3-column pricing grid.
 * Replaces the old 4th column to give Enterprise its own breathing room
 * and make the main grid less dense for self-serve plans.
 */
export function PricingEnterpriseBanner({ plan }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-16"
    >
      <div className="relative overflow-hidden rounded-3xl border border-brand-cyan/20 bg-gradient-to-br from-brand-cyan/[0.08] via-brand-blue/[0.05] to-transparent p-8 md:p-10">
        {/* glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),_transparent_60%)]" />

        <div className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1">
              <Building2 className="h-3.5 w-3.5 text-brand-cyan" />
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-cyan">
                للمؤسسات
              </span>
            </div>

            <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2">
              {plan.nameAr}
            </h3>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-5 max-w-2xl">
              {plan.taglineAr}
            </p>

            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px] text-text-secondary mb-6">
              {plan.featuresAr.slice(0, 6).map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-stretch md:items-end gap-3 md:min-w-[220px]">
            <div className="font-display text-2xl font-extrabold brand-gradient-text text-center md:text-right">
              تسعير مخصّص
            </div>
            <Link
              href="/contact?intent=enterprise"
              className="inline-flex items-center justify-center h-12 px-5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-black font-bold hover:shadow-lg hover:shadow-brand-cyan/40 transition-shadow"
            >
              <span>تواصل مع المبيعات</span>
              <ArrowLeft className="h-4 w-4 ms-2" />
            </Link>
            <p className="text-[11px] text-text-secondary/70 text-center md:text-right">
              ردّ خلال يوم عمل واحد
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
