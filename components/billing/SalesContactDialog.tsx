"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Mail } from "lucide-react";
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
                الاشتراك غير متاح بعد
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                خطة{" "}
                <span className="text-white font-semibold">{plan?.nameAr}</span>{" "}
                غير متاحة للشراء المباشر حالياً.
              </p>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              قناة الاشتراك الرسمية قيد التجهيز. ستُعلن في صفحة التواصل فور تفعيلها.
            </p>

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
