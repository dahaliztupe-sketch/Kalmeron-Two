"use client";

import React from "react";
import { motion } from "motion/react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { Plan, PlanId } from "@/src/lib/billing/plans";

interface Row {
  category: string;
  feature: string;
  values: Record<PlanId, string | boolean>;
}

const ROWS: Row[] = [
  {
    category: "الأرصدة",
    feature: "رسائل يومية",
    values: { free: "200", starter: "800", pro: "2,000", founder: "10,000", enterprise: "غير محدود" },
  },
  {
    category: "الأرصدة",
    feature: "رسائل شهرية",
    values: { free: "3,000", starter: "12,000", pro: "30,000", founder: "200,000", enterprise: "غير محدود" },
  },
  {
    category: "الأرصدة",
    feature: "ترحيل الرصيد غير المستخدم",
    values: { free: false, starter: false, pro: true, founder: true, enterprise: true },
  },
  {
    category: "الميزات",
    feature: "وصول لكل مساعدي كلميرون الـ 16",
    values: { free: true, starter: true, pro: true, founder: true, enterprise: true },
  },
  {
    category: "الميزات",
    feature: "تحليل أفكار غير محدود",
    values: { free: false, starter: true, pro: true, founder: true, enterprise: true },
  },
  {
    category: "الميزات",
    feature: "تصدير PDF احترافي",
    values: { free: false, starter: true, pro: true, founder: true, enterprise: true },
  },
  {
    category: "الميزات",
    feature: "نماذج ذكية بأولوية أعلى",
    values: { free: false, starter: false, pro: true, founder: true, enterprise: true },
  },
  {
    category: "الفريق",
    feature: "حساب الفريق",
    values: { free: false, starter: false, pro: false, founder: "5 أعضاء", enterprise: "غير محدود" },
  },
  {
    category: "الفريق",
    feature: "تسجيل دخول موحّد (SSO)",
    values: { free: false, starter: false, pro: false, founder: false, enterprise: true },
  },
  {
    category: "الدعم",
    feature: "دعم بالبريد الإلكتروني",
    values: { free: true, starter: true, pro: true, founder: true, enterprise: true },
  },
  {
    category: "الدعم",
    feature: "دعم فوري بالشات",
    values: { free: false, starter: false, pro: true, founder: true, enterprise: true },
  },
  {
    category: "الدعم",
    feature: "مدير حساب مخصص",
    values: { free: false, starter: false, pro: false, founder: true, enterprise: true },
  },
  {
    category: "الدعم",
    feature: "SLA 99.9% + دعم 24/7",
    values: { free: false, starter: false, pro: false, founder: false, enterprise: true },
  },
  {
    category: "الدفع",
    feature: "الدفع المحلّي (فوري / فودافون كاش)",
    values: { free: false, starter: true, pro: true, founder: true, enterprise: true },
  },
];

interface Props {
  plans: Plan[];
  currentPlan: PlanId;
}

export function PricingComparison({ plans, currentPlan }: Props) {
  const grouped = ROWS.reduce<Record<string, Row[]>>((acc, row) => {
    (acc[row.category] = acc[row.category] || []).push(row);
    return acc;
  }, {});

  return (
    <section className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <p className="text-[11px] uppercase tracking-[0.25em] text-brand-cyan font-bold mb-2">
          مقارنة تفصيلية
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white">
          كل التفاصيل، شفافة بلا غموض
        </h2>
      </motion.div>

      <div className="rounded-3xl border border-white/[0.08] bg-dark-surface/40 backdrop-blur-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="text-right p-5 text-xs font-bold text-text-secondary uppercase tracking-widest w-[28%]">
                الميزة
              </th>
              {plans.map((p) => (
                <th
                  key={p.id}
                  className={cn(
                    "p-5 text-center",
                    p.id === currentPlan && "bg-brand-cyan/[0.04]"
                  )}
                >
                  <p
                    className={cn(
                      "font-display text-base font-extrabold",
                      p.highlighted ? "brand-gradient-text" : "text-white"
                    )}
                  >
                    {p.nameAr}
                  </p>
                  {p.id === currentPlan && (
                    <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest">
                      الحالية
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([category, rows], gi) => (
              <React.Fragment key={category}>
                <tr>
                  <td
                    colSpan={plans.length + 1}
                    className="px-5 pt-6 pb-2 text-[10px] uppercase tracking-[0.25em] font-extrabold text-brand-cyan"
                  >
                    {category}
                  </td>
                </tr>
                {rows.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: gi * 0.05 + i * 0.02 }}
                    className="border-t border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="p-4 text-sm text-text-secondary">{row.feature}</td>
                    {plans.map((p) => (
                      <td
                        key={p.id}
                        className={cn(
                          "p-4 text-center text-sm",
                          p.id === currentPlan && "bg-brand-cyan/[0.04]"
                        )}
                      >
                        <CellValue value={row.values[p.id]} highlight={!!p.highlighted} />
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CellValue({ value, highlight }: { value: string | boolean; highlight: boolean }) {
  if (value === true) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center w-6 h-6 rounded-full",
          highlight ? "bg-brand-cyan/20 text-brand-cyan" : "bg-emerald-500/15 text-emerald-300"
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </div>
    );
  }
  if (value === false) {
    return <Minus className="h-4 w-4 text-text-secondary/30 mx-auto" />;
  }
  return <span className="font-bold text-white tabular-nums">{value}</span>;
}
