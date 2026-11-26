"use client";

import { motion } from "motion/react";
import { Shield, Lock, Headphones, Globe, Zap, Award } from "lucide-react";

const items = [
  { icon: Shield, label: "تشفير افتراضي", sub: "لدى مزوّد السحابة" },
  { icon: Lock, label: "تصدير وحذف بياناتك", sub: "عبر واجهات الحساب" },
  { icon: Headphones, label: "دعم بالعربية", sub: "عبر البريد الإلكتروني" },
  { icon: Globe, label: "متاح عبر الويب", sub: "من أي مكان" },
  { icon: Zap, label: "ردود الذكاء الاصطناعي", sub: "تستغرق ثوانٍ وليست لحظية" },
  { icon: Award, label: "تجربة مجانية", sub: "قبل أي دفع" },
];

export function PricingTrust() {
  return (
    <section className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-[11px] uppercase tracking-[0.25em] text-brand-cyan font-bold mb-2">
          معايير عالمية
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">
          موثوق به من رواد الأعمال في المنطقة
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((it, i) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-2xl border border-white/[0.06] bg-dark-surface/40 backdrop-blur p-4 text-center hover:border-brand-cyan/30 transition-colors"
          >
            <div className="inline-flex w-10 h-10 rounded-xl items-center justify-center bg-white/[0.03] border border-white/10 mb-2">
              <it.icon className="h-4 w-4 text-brand-cyan" />
            </div>
            <p className="text-xs font-bold text-white">{it.label}</p>
            <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">
              {it.sub}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
