"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Phone, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanId } from "@/src/lib/billing/plans";
import { PLANS } from "@/src/lib/billing/plans";

interface Props {
  open: boolean;
  onClose: () => void;
  planId: PlanId;
}

export function SalesContactDialog({ open, onClose, planId }: Props) {
  const plan = PLANS[planId];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d1117] p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute left-4 top-4 text-text-secondary hover:text-white transition"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 mb-4">
                <Mail className="h-5 w-5 text-brand-cyan" />
              </div>
              <h2 className="font-display text-xl font-extrabold text-white mb-1">
                تواصل مع فريق المبيعات
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                خطة{" "}
                <span className="text-white font-semibold">{plan?.nameAr}</span>{" "}
                غير متاحة للشراء المباشر حالياً — فريقنا يسعدهم مساعدتك في الاشتراك وتخصيص العرض المناسب.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <a
                href="mailto:sales@kalmeron.com?subject=طلب اشتراك كلميرون"
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 transition group"
              >
                <Mail className="h-4 w-4 text-brand-cyan shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary">البريد الإلكتروني</p>
                  <p className="text-sm font-medium text-white truncate">sales@kalmeron.com</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-text-secondary group-hover:text-brand-cyan transition shrink-0" />
              </a>

              <a
                href="https://wa.me/201000000000?text=مرحباً، أريد الاشتراك في كلميرون"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 hover:border-emerald-400/30 hover:bg-emerald-400/5 transition group"
              >
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary">واتساب</p>
                  <p className="text-sm font-medium text-white">تواصل عبر واتساب</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-text-secondary group-hover:text-emerald-400 transition shrink-0" />
              </a>
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-white/10 text-text-secondary hover:text-white"
            >
              إغلاق
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
